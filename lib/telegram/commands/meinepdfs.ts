import { adminClient } from '@/lib/supabase/admin';
import { sendMessage, sendDocument, inlineKeyboard, button } from '@/lib/telegram/bot';
import * as i18n from '@/lib/telegram/i18n';

/**
 * /meinepdfs — Send all purchased PDFs to the user
 */
export async function handleMeinePdfs(chatId: number, locale: 'de' | 'ru') {
  // Find linked profile
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('telegram_chat_id', chatId)
    .single();

  if (!profile) {
    await sendMessage({
      chat_id: chatId,
      text: locale === 'de'
        ? '❌ Verbinde zuerst dein Konto über /start.'
        : '❌ Сначала привяжи аккаунт через /start.',
    });
    return;
  }

  // Get all PDF deliverables
  const { data: deliverables } = await adminClient
    .from('deliverables')
    .select('id, title, file_url, file_type')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false });

  const pdfs = deliverables?.filter((d) => d.file_url && d.file_type === 'pdf') ?? [];

  if (pdfs.length === 0) {
    await sendMessage({
      chat_id: chatId,
      text: i18n.pdfsNone(locale),
      reply_markup: inlineKeyboard([
        button(i18n.btnPackages(locale), { callback_data: 'cmd_pakete' }),
      ]),
    });
    return;
  }

  await sendMessage({ chat_id: chatId, text: i18n.pdfsHeader(locale) });

  for (const pdf of pdfs) {
    try {
      await sendDocument(chatId, pdf.file_url!, `📄 ${pdf.title}`);
    } catch (err) {
      console.error(`[Telegram] Failed to send PDF ${pdf.id}:`, err);
      await sendMessage({
        chat_id: chatId,
        text: `📄 <a href="${pdf.file_url}">${pdf.title}</a>`,
      });
    }
  }
}
