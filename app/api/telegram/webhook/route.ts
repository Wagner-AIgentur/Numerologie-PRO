import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import type { TelegramUpdate, TelegramUser } from '@/lib/telegram/bot';
import { handleStart } from '@/lib/telegram/commands/start';
import { handleAnalyse } from '@/lib/telegram/commands/analyse';
import { handleKompatibel } from '@/lib/telegram/commands/kompatibel';
import { handleHeute } from '@/lib/telegram/commands/heute';
import { handleMeinePdfs } from '@/lib/telegram/commands/meinepdfs';
import { handleTermin } from '@/lib/telegram/commands/termin';
import { handlePakete } from '@/lib/telegram/commands/pakete';
import { handleEmpfehlen } from '@/lib/telegram/commands/empfehlen';
import { handleHilfe } from '@/lib/telegram/commands/hilfe';
import { handleVerbinden, handleEmailInput, handleCodeInput, getBotState } from '@/lib/telegram/commands/verbinden';
import { handleSprache } from '@/lib/telegram/commands/sprache';
import { handleFaq } from '@/lib/telegram/faq';
import { handleCallback } from '@/lib/telegram/callbacks';
import { resolveCustomCommand, matchFaqRules } from '@/lib/telegram/bot-config';
import { sendMessage, inlineKeyboard } from '@/lib/telegram/bot';
import { safeCompare } from '@/lib/rate-limit';

/**
 * Telegram Webhook Handler
 *
 * Receives updates from Telegram, routes to the correct command handler,
 * and logs every incoming message.
 */
export async function POST(req: NextRequest) {
  // Verify webhook secret — runtime guard prevents accepting all requests if env var missing
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Telegram Webhook] TELEGRAM_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }
  const secret = req.headers.get('x-telegram-bot-api-secret-token') ?? '';
  if (!safeCompare(secret, webhookSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const update: TelegramUpdate = await req.json();

    // Handle callback queries (inline button presses)
    if (update.callback_query) {
      await handleCallback(update.callback_query);
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const languageCode = message.from?.language_code;

    // Idempotency: skip if this Telegram message was already processed
    const { data: existingMsg } = await adminClient
      .from('telegram_messages')
      .select('id')
      .eq('chat_id', chatId)
      .eq('direction', 'in')
      .contains('payload', { message_id: message.message_id })
      .maybeSingle();
    if (existingMsg) return NextResponse.json({ ok: true });

    // Log incoming message
    await adminClient.from('telegram_messages').insert({
      chat_id: chatId,
      direction: 'in',
      command: text.startsWith('/') ? text.split(' ')[0].split('@')[0] : null,
      payload: { text, from: message.from, message_id: message.message_id } as unknown as Record<string, never>,
    });

    // Resolve user locale: check linked profile first, then Telegram language_code
    const locale = await resolveLocale(chatId, languageCode);

    // Route commands
    const command = text.startsWith('/') ? text.split(' ')[0].split('@')[0].toLowerCase() : null;
    const args = text.startsWith('/') ? text.slice(text.indexOf(' ') + 1).trim() : text;

    // DB-driven custom/editable commands (checked BEFORE hardcoded switch)
    if (command) {
      const customResponse = await resolveCustomCommand(command.slice(1), locale);
      if (customResponse) {
        const buttons = customResponse.buttons.filter((b) => b.text);
        await sendMessage({
          chat_id: chatId,
          text: customResponse.text,
          parse_mode: 'HTML',
          ...(buttons.length > 0
            ? { reply_markup: inlineKeyboard(buttons.map((b) => [b])) }
            : {}),
        });
        return NextResponse.json({ ok: true });
      }
    }

    // Hardcoded command handlers (fallback)
    switch (command) {
      case '/start':
        await handleStart(chatId, args === '/start' ? undefined : args, locale, message.from!);
        break;
      case '/analyse':
        await handleAnalyse(chatId, locale);
        break;
      case '/kompatibel':
        await handleKompatibel(chatId, locale);
        break;
      case '/heute':
        await handleHeute(chatId, locale);
        break;
      case '/meinepdfs':
        await handleMeinePdfs(chatId, locale);
        break;
      case '/termin':
        await handleTermin(chatId, locale);
        break;
      case '/pakete':
        await handlePakete(chatId, locale);
        break;
      case '/empfehlen':
        await handleEmpfehlen(chatId, locale);
        break;
      case '/verbinden':
      case '/connect':
        await handleVerbinden(chatId, locale);
        break;
      case '/hilfe':
      case '/help':
        await handleHilfe(chatId, locale);
        break;
      case '/sprache':
      case '/language':
        await handleSprache(chatId, locale);
        break;
      default:
        // No command — try FAQ keyword matching, or handle pending state (date input)
        await handleFreeText(chatId, text, locale, message.from!);
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Telegram Webhook] Error:', err);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

async function resolveLocale(chatId: number, telegramLang?: string): Promise<'de' | 'ru'> {
  // 1. Check linked profile
  const { data: profile } = await adminClient
    .from('profiles')
    .select('language')
    .eq('telegram_chat_id', chatId)
    .single();

  if (profile?.language) return profile.language as 'de' | 'ru';

  // 2. Check saved bot settings (for unlinked users who manually chose)
  const { data: settings } = await adminClient
    .from('telegram_settings')
    .select('locale')
    .eq('chat_id', chatId)
    .single();

  if (settings?.locale) return settings.locale as 'de' | 'ru';

  // 3. Fallback to Telegram language_code
  if (telegramLang === 'ru' || telegramLang === 'uk' || telegramLang === 'be') return 'ru';
  return 'de';
}

/**
 * Handle free text — check for date patterns (pending /analyse or /kompatibel),
 * then try FAQ matching, then forward to admin.
 */
async function handleFreeText(chatId: number, text: string, locale: 'de' | 'ru', from?: TelegramUser) {
  // Check for pending bot state (e.g., /verbinden email verification flow)
  const botState = await getBotState(chatId);
  if (botState && new Date(botState.expires_at) > new Date()) {
    if (botState.state === 'awaiting_email' && text.includes('@')) {
      await handleEmailInput(chatId, text, locale);
      return;
    }
    if (botState.state === 'awaiting_code' && /^\d{6}$/.test(text.trim())) {
      await handleCodeInput(chatId, text, locale, from ?? { first_name: 'User', id: 0, is_bot: false });
      return;
    }
  }

  // Check if text looks like a date (DD.MM.YYYY)
  const datePattern = /^\d{1,2}\.\d{1,2}\.\d{4}$/;
  if (datePattern.test(text.trim())) {
    // Treat as /analyse input
    const { handleAnalyseDate } = await import('@/lib/telegram/commands/analyse');
    await handleAnalyseDate(chatId, text.trim(), locale);
    return;
  }

  // Check for two dates (compatibility input)
  const twoDatesPattern = /^\d{1,2}\.\d{1,2}\.\d{4}\s*,\s*\d{1,2}\.\d{1,2}\.\d{4}$/;
  if (twoDatesPattern.test(text.trim())) {
    const { handleKompatibelDates } = await import('@/lib/telegram/commands/kompatibel');
    await handleKompatibelDates(chatId, text.trim(), locale);
    return;
  }

  // DB-driven FAQ keyword matching (checked before hardcoded FAQ)
  const faqResponse = await matchFaqRules(text, locale);
  if (faqResponse) {
    await sendMessage({ chat_id: chatId, text: faqResponse, parse_mode: 'HTML' });
    return;
  }

  // Hardcoded FAQ fallback (forwards to admin if no match)
  await handleFaq(chatId, text, locale);
}
