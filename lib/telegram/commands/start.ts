import { adminClient } from '@/lib/supabase/admin';
import { sendMessage, inlineKeyboard, button, type TelegramUser } from '@/lib/telegram/bot';
import * as i18n from '@/lib/telegram/i18n';

/**
 * /start handler
 *
 * Scenarios:
 * A) /start PROFILE_UUID — auto-link from website
 * B) /start (no args) — new or returning user
 */
export async function handleStart(
  chatId: number,
  args: string | undefined,
  locale: 'de' | 'ru',
  from: TelegramUser,
) {
  // Check if already linked
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id, full_name, telegram_chat_id')
    .eq('telegram_chat_id', chatId)
    .single();

  if (existingProfile) {
    // Already linked — welcome back
    const name = existingProfile.full_name?.split(' ')[0] ?? from.first_name;
    await sendMessage({
      chat_id: chatId,
      text: i18n.startWelcomeLinked(name)(locale),
      reply_markup: inlineKeyboard([
        button(i18n.btnFreeAnalysis(locale), { callback_data: 'cmd_analyse' }),
        button(i18n.btnPackages(locale), { callback_data: 'cmd_pakete' }),
        button(i18n.btnMyPdfs(locale), { callback_data: 'cmd_meinepdfs' }),
      ]),
    });
    return;
  }

  // Try to link via profile UUID
  if (args && isUUID(args)) {
    const { data: profile, error } = await adminClient
      .from('profiles')
      .update({ telegram_chat_id: chatId })
      .eq('id', args)
      .is('telegram_chat_id', null)
      .select('full_name')
      .single();

    if (profile && !error) {
      const name = profile.full_name?.split(' ')[0] ?? from.first_name;
      await sendMessage({
        chat_id: chatId,
        text: i18n.startLinkedSuccess(name)(locale),
        reply_markup: inlineKeyboard([
          button(i18n.btnFreeAnalysis(locale), { callback_data: 'cmd_analyse' }),
          button(i18n.btnPackages(locale), { callback_data: 'cmd_pakete' }),
        ]),
      });
      return;
    }
  }

  // New user — show welcome with options (including /verbinden for account linking)
  await sendMessage({
    chat_id: chatId,
    text: i18n.startWelcomeNew(locale),
    reply_markup: inlineKeyboard([
      button(i18n.btnFreeAnalysis(locale), { callback_data: 'cmd_analyse' }),
      button(i18n.btnPackages(locale), { callback_data: 'cmd_pakete' }),
      button(i18n.btnLinkAccount(locale), { callback_data: 'cmd_verbinden' }),
    ]),
  });
}

function isUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
