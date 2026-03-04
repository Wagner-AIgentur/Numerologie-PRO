import { adminClient } from '@/lib/supabase/admin';
import { sendMessage } from '@/lib/telegram/bot';
import * as i18n from '@/lib/telegram/i18n';

/**
 * /empfehlen — Generate or show referral link + status
 */
export async function handleEmpfehlen(chatId: number, locale: 'de' | 'ru') {
  // Find linked profile
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, full_name, referral_code')
    .eq('telegram_chat_id', chatId)
    .single();

  if (!profile) {
    await sendMessage({ chat_id: chatId, text: i18n.referralNotLinked(locale) });
    return;
  }

  // Generate referral code if none exists
  let code = profile.referral_code;
  if (!code) {
    const firstName = (profile.full_name?.split(' ')[0] ?? 'USER').toUpperCase().replace(/[^A-Z]/g, '');
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    code = `${firstName}_${random}`;

    await adminClient
      .from('profiles')
      .update({ referral_code: code })
      .eq('id', profile.id);
  }

  // Count referrals
  const { data: referrals } = await adminClient
    .from('referrals')
    .select('id, status')
    .eq('referrer_profile_id', profile.id);

  const count = referrals?.length ?? 0;
  const converted = referrals?.filter((r) => r.status === 'converted').length ?? 0;

  await sendMessage({
    chat_id: chatId,
    text: i18n.referralCode(code, count, converted)(locale),
  });
}
