import { adminClient } from '@/lib/supabase/admin';
import { getDateLocale } from '@/lib/i18n/admin';
import { sendMessage, inlineKeyboard, button } from '@/lib/telegram/bot';
import * as i18n from '@/lib/telegram/i18n';

/**
 * /termin — Show next upcoming session
 */
export async function handleTermin(chatId: number, locale: 'de' | 'ru') {
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

  // Get next scheduled session
  const { data: sessions } = await adminClient
    .from('sessions')
    .select('package_type, scheduled_at, meeting_link, status')
    .eq('profile_id', profile.id)
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })
    .limit(1);

  const session = sessions?.[0];

  if (!session) {
    await sendMessage({
      chat_id: chatId,
      text: i18n.terminNone(locale),
      reply_markup: inlineKeyboard([
        button(i18n.btnBookConsultation(locale), { callback_data: 'cmd_pakete' }),
      ]),
    });
    return;
  }

  const packageType = session.package_type ?? (locale === 'de' ? 'Numerologie-Beratung' : 'Консультация');

  if (!session.scheduled_at) {
    await sendMessage({
      chat_id: chatId,
      text: i18n.terminPending(packageType)(locale),
    });
    return;
  }

  const dateStr = new Date(session.scheduled_at).toLocaleString(
    getDateLocale(locale),
    { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' },
  );

  await sendMessage({
    chat_id: chatId,
    text: i18n.terminInfo(packageType, dateStr, session.meeting_link)(locale),
  });
}
