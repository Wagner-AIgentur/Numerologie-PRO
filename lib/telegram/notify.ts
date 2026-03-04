/**
 * Telegram Notification Helpers
 *
 * Used by existing flows (cron, webhooks) to send Telegram messages
 * alongside email notifications. Always fire-and-forget — a Telegram
 * failure should never block the primary email flow.
 */

import { adminClient } from '@/lib/supabase/admin';
import { getDateLocale } from '@/lib/i18n/admin';
import { sendMessage, sendDocument, inlineKeyboard, button } from '@/lib/telegram/bot';

/**
 * Send session reminder via Telegram (called from cron job).
 */
export async function notifySessionReminder(opts: {
  profileId: string;
  packageType: string;
  scheduledAt: string;
  meetingLink: string | null;
  locale: 'de' | 'ru';
}) {
  const chatId = await getChatId(opts.profileId);
  if (!chatId) return;

  const dateStr = new Date(opts.scheduledAt).toLocaleString(
    getDateLocale(opts.locale),
    { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' },
  );

  const text = opts.locale === 'de'
    ? `🗓 <b>Hey! Unser Termin ist heute!</b>\n\n📍 ${opts.packageType}\n⏰ ${dateStr}\n\nIch freue mich auf dich! 💫\nSwetlana`
    : `🗓 <b>Привет! Наша встреча сегодня!</b>\n\n📍 ${opts.packageType}\n⏰ ${dateStr}\n\nЖду тебя! 💫\nСветлана`;

  try {
    await sendMessage({
      chat_id: chatId,
      text,
      reply_markup: opts.meetingLink
        ? inlineKeyboard([
            button(
              opts.locale === 'de' ? '🔗 Meeting beitreten' : '🔗 Войти в встречу',
              { url: opts.meetingLink },
            ),
          ])
        : undefined,
    });
    await logOutgoing(chatId, 'session_reminder');
  } catch (err) {
    console.error(`[Telegram] Failed to send reminder to chat ${chatId}:`, err);
  }
}

/**
 * Send booking confirmation via Telegram (called from Cal.com webhook).
 */
export async function notifyBookingConfirmation(opts: {
  profileId: string;
  packageType: string;
  scheduledAt: string;
  meetingLink: string | null;
  locale: 'de' | 'ru';
}) {
  const chatId = await getChatId(opts.profileId);
  if (!chatId) return;

  const dateStr = new Date(opts.scheduledAt).toLocaleString(
    getDateLocale(opts.locale),
    { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' },
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://numerologie-pro.com';
  const dashboardUrl = `${baseUrl}/${opts.locale}/dashboard/sitzungen`;

  const text = opts.locale === 'de'
    ? `✅ <b>Danke für deine Buchung, ich freue mich sehr auf unseren Termin!</b>\n\n📍 ${opts.packageType}\n⏰ ${dateStr}\n\n👉 Dein persönlicher Bereich:\n${dashboardUrl}\n\nBis bald! 💫\nSwetlana`
    : `✅ <b>Спасибо за запись, я очень жду нашу встречу!</b>\n\n📍 ${opts.packageType}\n⏰ ${dateStr}\n\n👉 Твой личный кабинет:\n${dashboardUrl}\n\nДо встречи! 💫\nСветлана`;

  try {
    await sendMessage({
      chat_id: chatId,
      text,
      reply_markup: opts.meetingLink
        ? inlineKeyboard([
            button(
              opts.locale === 'de' ? '🔗 Meeting beitreten' : '🔗 Войти в встречу',
              { url: opts.meetingLink },
            ),
          ])
        : undefined,
    });
    await logOutgoing(chatId, 'booking_confirmation');
  } catch (err) {
    console.error(`[Telegram] Failed to send booking confirmation to chat ${chatId}:`, err);
  }
}

/**
 * Send PDF delivery notification via Telegram (called from Stripe webhook).
 */
export async function notifyPdfDelivery(opts: {
  profileId: string;
  title: string;
  fileUrl: string;
  locale: 'de' | 'ru';
}) {
  const chatId = await getChatId(opts.profileId);
  if (!chatId) return;

  const text = opts.locale === 'de'
    ? `📄 <b>Dein PDF "${opts.title}" ist fertig!</b>\n\nIch habe es dir auch per E-Mail geschickt. Du kannst es jederzeit in deinem Dashboard herunterladen.\n\nMöchtest du die Ergebnisse gemeinsam besprechen? Buch dir einen Termin mit mir! 💫\nSwetlana`
    : `📄 <b>Твой PDF "${opts.title}" готов!</b>\n\nЯ также отправила его на email. Скачать можно в любое время в личном кабинете.\n\nХочешь обсудить результаты вместе? Запишись на консультацию! 💫\nСветлана`;

  try {
    await sendDocument(chatId, opts.fileUrl, text);
    await logOutgoing(chatId, 'pdf_delivery');
  } catch (err) {
    // If file sending fails, send a link instead
    console.error(`[Telegram] Failed to send PDF to chat ${chatId}:`, err);
    try {
      await sendMessage({
        chat_id: chatId,
        text: `${text}\n\n📥 ${opts.locale === 'de' ? 'Lade es im Dashboard herunter' : 'Скачай в личном кабинете'}:\nhttps://numerologie-pro.com/${opts.locale}/dashboard/unterlagen`,
      });
    } catch { /* silently fail */ }
  }
}

/**
 * Send cancellation notification via Telegram.
 */
export async function notifyBookingCancelled(opts: {
  profileId: string | null;
  locale: 'de' | 'ru';
}) {
  if (!opts.profileId) return;
  const chatId = await getChatId(opts.profileId);
  if (!chatId) return;

  try {
    await sendMessage({
      chat_id: chatId,
      text: opts.locale === 'de'
        ? '❌ Schade, dein Termin wurde storniert.\n\nFalls du einen neuen Termin buchen möchtest, schau hier: /pakete\n\nIch bin jederzeit für dich da! 💛\nSwetlana'
        : '❌ К сожалению, твоя сессия отменена.\n\nЕсли хочешь записаться снова: /pakete\n\nЯ всегда на связи! 💛\nСветлана',
    });
    await logOutgoing(chatId, 'booking_cancelled');
  } catch (err) {
    console.error(`[Telegram] Failed to send cancellation to chat ${chatId}:`, err);
  }
}

// ── Internal helpers ─────────────────────────────────────────────────────

async function getChatId(profileId: string): Promise<number | null> {
  const { data } = await adminClient
    .from('profiles')
    .select('telegram_chat_id')
    .eq('id', profileId)
    .single();
  return data?.telegram_chat_id ?? null;
}

async function logOutgoing(chatId: number, command: string) {
  await adminClient.from('telegram_messages').insert({
    chat_id: chatId,
    direction: 'out',
    command,
  });
}
