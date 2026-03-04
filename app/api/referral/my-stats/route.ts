/**
 * Customer Referral Stats
 *
 * GET /api/referral/my-stats
 * Returns the authenticated user's referral code, stats, and reward coupons.
 * Auto-generates a referral code if the user doesn't have one.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { referralWelcomeEmail } from '@/lib/email/templates/referral-welcome';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get profile with referral code
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, full_name, referral_code')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Auto-generate referral code if missing + send welcome email
  let referralCode = profile.referral_code;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://numerologie-pro.com';

  if (!referralCode) {
    const firstName = (profile.full_name?.split(' ')[0] ?? 'USER')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 6) || 'USER';
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    referralCode = `${firstName}_${random}`;

    await adminClient
      .from('profiles')
      .update({ referral_code: referralCode })
      .eq('id', user.id);

    // Send referral welcome email (fire-and-forget)
    const locale = (profile.full_name?.match(/[а-яА-Я]/) ? 'ru' : 'de') as 'de' | 'ru';
    const referralLink = `${siteUrl}/?ref=${encodeURIComponent(referralCode)}`;
    const dashboardUrl = `${siteUrl}/${locale}/dashboard/empfehlungen`;

    const { subject, html } = referralWelcomeEmail({
      name: profile.full_name?.split(' ')[0] ?? (locale === 'de' ? 'Hallo' : 'Привет'),
      referralCode,
      referralLink,
      dashboardUrl,
      language: locale,
    });

    sendEmail({
      to: user.email ?? '',
      subject,
      html,
      template: 'referral-welcome',
      profileId: user.id,
    }).catch(() => {});
  }

  // Get referral stats
  const { data: referrals } = await adminClient
    .from('referrals')
    .select('id, status, reward_coupon_id, referred_profile_id, created_at')
    .eq('referrer_profile_id', user.id)
    .order('created_at', { ascending: false });

  const totalReferrals = referrals?.length ?? 0;
  const convertedReferrals = referrals?.filter((r) => r.status === 'converted').length ?? 0;
  const pendingReferrals = totalReferrals - convertedReferrals;

  // Get reward coupons (from converted referrals)
  const rewardCouponIds = referrals
    ?.filter((r) => r.reward_coupon_id)
    .map((r) => r.reward_coupon_id!)
    ?? [];

  let rewardCoupons: Array<{ id: string; code: string; value: number; used_count: number; active: boolean }> = [];
  if (rewardCouponIds.length > 0) {
    const { data } = await adminClient
      .from('coupons')
      .select('id, code, value, used_count, active')
      .in('id', rewardCouponIds);
    rewardCoupons = (data ?? []).map((c) => ({
      ...c,
      used_count: c.used_count ?? 0,
      active: c.active ?? true,
    }));
  }

  return NextResponse.json({
    referral_code: referralCode,
    referral_link: `${siteUrl}/?ref=${encodeURIComponent(referralCode)}`,
    total_referrals: totalReferrals,
    converted_referrals: convertedReferrals,
    pending_referrals: pendingReferrals,
    reward_coupons: rewardCoupons,
  });
}
