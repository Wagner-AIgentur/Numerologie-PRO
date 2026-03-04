import { adminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/types';
import { sendMessage, inlineKeyboard, button, type TelegramUser } from '@/lib/telegram/bot';
import { sendEmail } from '@/lib/email/send';
import { baseTemplate, heading, paragraph, infoBox } from '@/lib/email/templates/base';
import * as i18n from '@/lib/telegram/i18n';

const CODE_TTL_MINUTES = 10;

/**
 * Step 1: /verbinden — Check if already linked, otherwise ask for email.
 */
export async function handleVerbinden(chatId: number, locale: 'de' | 'ru') {
  // Already linked?
  const { data: existing } = await adminClient
    .from('profiles')
    .select('id, full_name')
    .eq('telegram_chat_id', chatId)
    .single();

  if (existing) {
    const name = existing.full_name?.split(' ')[0] ?? 'du';
    await sendMessage({
      chat_id: chatId,
      text: i18n.verbindenAlreadyLinked(name)(locale),
      reply_markup: inlineKeyboard([
        button(i18n.btnFreeAnalysis(locale), { callback_data: 'cmd_analyse' }),
      ]),
    });
    return;
  }

  // Set state: awaiting_email
  await setBotState(chatId, 'awaiting_email', {});

  await sendMessage({
    chat_id: chatId,
    text: i18n.verbindenAskEmail(locale),
  });
}

/**
 * Step 2: User sent an email address — validate, generate code, send via email.
 */
export async function handleEmailInput(chatId: number, email: string, locale: 'de' | 'ru') {
  const trimmed = email.trim().toLowerCase();

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    await sendMessage({
      chat_id: chatId,
      text: i18n.verbindenInvalidEmail(locale),
    });
    return;
  }

  // Generate 6-digit code (cryptographically secure)
  const crypto = await import('crypto');
  const code = String(crypto.randomInt(100000, 1000000));

  // Store state with code
  await setBotState(chatId, 'awaiting_code', { email: trimmed, code });

  // Send verification email
  const isDE = locale === 'de';
  const emailContent = `
    ${heading(isDE ? 'Dein Bestätigungscode' : 'Твой код подтверждения')}
    ${paragraph(isDE
      ? 'Du möchtest deinen Telegram-Account mit Numerologie PRO verbinden. Hier ist dein Code:'
      : 'Ты хочешь привязать свой Telegram к Нумерология PRO. Вот твой код:'
    )}
    ${infoBox(`
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:32px; font-weight:700; color:#D4AF37; text-align:center; letter-spacing:8px; margin:0;">
        ${code}
      </p>
    `)}
    ${paragraph(`<span style="font-size:13px; color:#7a776d;">${isDE
      ? `Gib diesen Code im Telegram-Bot ein. Er ist ${CODE_TTL_MINUTES} Minuten gültig.`
      : `Введи этот код в Telegram-боте. Он действителен ${CODE_TTL_MINUTES} минут.`
    }</span>`)}
  `;

  const subject = isDE ? 'Dein Bestätigungscode — Numerologie PRO' : 'Твой код подтверждения — Нумерология PRO';

  const result = await sendEmail({
    to: trimmed,
    subject,
    html: baseTemplate({ title: subject, preheader: `Code: ${code}`, content: emailContent }),
    template: 'telegram-verification',
    profileId: null,
  });

  if (!result.success) {
    await clearBotState(chatId);
    await sendMessage({
      chat_id: chatId,
      text: i18n.verbindenEmailFailed(locale),
    });
    return;
  }

  await sendMessage({
    chat_id: chatId,
    text: i18n.verbindenCodeSent(trimmed)(locale),
  });
}

/**
 * Step 3: User sent a code — verify, link or create account.
 */
export async function handleCodeInput(
  chatId: number,
  inputCode: string,
  locale: 'de' | 'ru',
  from: TelegramUser,
) {
  const state = await getBotState(chatId);

  if (!state || state.state !== 'awaiting_code') {
    return; // No pending verification
  }

  // Check expiry
  if (new Date(state.expires_at) < new Date()) {
    await clearBotState(chatId);
    await sendMessage({
      chat_id: chatId,
      text: i18n.verbindenExpired(locale),
    });
    return;
  }

  const { email, code } = state.data as { email: string; code: string };

  // Verify code (timing-safe comparison)
  const { safeCompare } = await import('@/lib/rate-limit');
  if (!safeCompare(inputCode.trim(), code)) {
    await sendMessage({
      chat_id: chatId,
      text: i18n.verbindenInvalidCode(locale),
    });
    return;
  }

  // Code is correct — clear state
  await clearBotState(chatId);

  // Check if profile exists with this email
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id, full_name')
    .eq('email', email)
    .single();

  if (existingProfile) {
    // Link telegram_chat_id to existing profile
    await adminClient
      .from('profiles')
      .update({ telegram_chat_id: chatId, preferred_channel: 'telegram' })
      .eq('id', existingProfile.id);

    const name = existingProfile.full_name?.split(' ')[0] ?? from.first_name;
    await sendMessage({
      chat_id: chatId,
      text: i18n.verbindenSuccess(name)(locale),
      reply_markup: inlineKeyboard([
        button(i18n.btnFreeAnalysis(locale), { callback_data: 'cmd_analyse' }),
        button(i18n.btnPackages(locale), { callback_data: 'cmd_pakete' }),
      ]),
    });
    return;
  }

  // No profile — create account via invite link (same pattern as Cal.com webhook)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://numerologie-pro.com';
  const userName = from.first_name ?? email.split('@')[0];

  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      data: { full_name: userName, language: locale },
      redirectTo: `${baseUrl}/${locale}/auth/callback?next=/${locale}/dashboard`,
    },
  });

  if (inviteError || !inviteData?.user) {
    console.error('[Telegram /verbinden] Account creation failed:', inviteError?.message);
    await sendMessage({
      chat_id: chatId,
      text: i18n.verbindenEmailFailed(locale),
    });
    return;
  }

  // Set telegram_chat_id + language on the new profile
  await adminClient
    .from('profiles')
    .update({
      telegram_chat_id: chatId,
      preferred_channel: 'telegram',
      language: locale,
      full_name: userName,
    })
    .eq('id', inviteData.user.id);

  // Send the invite email so they can set their password
  const inviteUrl = inviteData.properties?.action_link;
  if (inviteUrl) {
    const { bookingWelcomeEmail } = await import('@/lib/email/templates/booking-welcome');
    // We reuse just the account-setup part by sending a minimal welcome email
    const isDE = locale === 'de';
    const content = `
      ${heading(isDE ? `Willkommen, ${userName}!` : `Добро пожаловать, ${userName}!`)}
      ${paragraph(isDE
        ? 'Dein Konto bei Numerologie PRO wurde erstellt und ist mit deinem Telegram verbunden. Setze jetzt dein Passwort, um auch das Dashboard nutzen zu können.'
        : 'Твой аккаунт в Нумерология PRO создан и привязан к Telegram. Установи пароль, чтобы пользоваться личным кабинетом.'
      )}
      ${infoBox(`
        <a href="${inviteUrl}" style="display:inline-block; background:linear-gradient(135deg, #D4AF37, #b8962e); color:#0a0a0a; font-family:'Montserrat',Arial,sans-serif; font-weight:600; font-size:14px; text-decoration:none; padding:14px 32px; border-radius:12px;">
          ${isDE ? 'Passwort setzen & Dashboard öffnen' : 'Установить пароль и открыть кабинет'}
        </a>
      `)}
    `;

    await sendEmail({
      to: email,
      subject: isDE ? 'Dein Konto bei Numerologie PRO' : 'Твой аккаунт в Нумерология PRO',
      html: baseTemplate({
        title: isDE ? 'Willkommen bei Numerologie PRO' : 'Добро пожаловать в Нумерология PRO',
        preheader: isDE ? 'Setze dein Passwort' : 'Установи пароль',
        content,
      }),
      template: 'telegram-account-created',
      profileId: inviteData.user.id,
    });
  }

  await sendMessage({
    chat_id: chatId,
    text: i18n.verbindenNewAccount(userName)(locale),
    reply_markup: inlineKeyboard([
      button(i18n.btnFreeAnalysis(locale), { callback_data: 'cmd_analyse' }),
      button(i18n.btnPackages(locale), { callback_data: 'cmd_pakete' }),
    ]),
  });
}

// ── State helpers ──────────────────────────────────────────────────────

async function setBotState(chatId: number, state: string, data: Record<string, unknown>) {
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString();
  await adminClient
    .from('telegram_bot_state')
    .upsert({ chat_id: chatId, state, data: data as unknown as Json, expires_at: expiresAt }, { onConflict: 'chat_id' });
}

export async function getBotState(chatId: number) {
  const { data } = await adminClient
    .from('telegram_bot_state')
    .select('state, data, expires_at')
    .eq('chat_id', chatId)
    .single();
  return data;
}

async function clearBotState(chatId: number) {
  await adminClient
    .from('telegram_bot_state')
    .delete()
    .eq('chat_id', chatId);
}
