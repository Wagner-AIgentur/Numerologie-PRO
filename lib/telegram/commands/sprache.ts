import { adminClient } from '@/lib/supabase/admin';
import { sendMessage, inlineKeyboard, type InlineKeyboardButton } from '@/lib/telegram/bot';
import * as i18n from '@/lib/telegram/i18n';

/**
 * /sprache — Show language selection buttons
 */
export async function handleSprache(chatId: number, locale: 'de' | 'ru') {
  await sendMessage({
    chat_id: chatId,
    text: i18n.spracheAsk(locale),
    reply_markup: inlineKeyboard([
      [
        { text: '🇩🇪 Deutsch', callback_data: 'lang_de' },
        { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
      ] as InlineKeyboardButton[],
    ]),
  });
}

/**
 * Handle language selection callback (lang_de / lang_ru)
 */
export async function handleLanguageChange(chatId: number, newLocale: 'de' | 'ru') {
  // Update linked profile if exists
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('telegram_chat_id', chatId)
    .single();

  if (profile) {
    await adminClient
      .from('profiles')
      .update({ language: newLocale })
      .eq('id', profile.id);
  }

  // Always save in telegram_settings (for unlinked users + as cache)
  await adminClient
    .from('telegram_settings')
    .upsert({ chat_id: chatId, locale: newLocale }, { onConflict: 'chat_id' });

  await sendMessage({
    chat_id: chatId,
    text: i18n.spracheChanged(newLocale),
  });
}
