/**
 * Public Affiliate Click Tracking
 *
 * GET /api/affiliate/click?code=XXX
 * Records click, sets attribution cookie, redirects to site.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://numerologie-pro.com';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(SITE_URL);
  }

  // Rate limit: 5 clicks per minute per IP
  const ip = getClientIp(request);
  if (!await rateLimit(`aff_click:${ip}`, { max: 5, windowSeconds: 60 })) {
    return NextResponse.redirect(SITE_URL);
  }

  // Look up affiliate
  const { data: affiliate } = await adminClient
    .from('affiliates')
    .select('id, is_active')
    .eq('tracking_code', code.trim().toUpperCase())
    .single();

  if (!affiliate || !affiliate.is_active) {
    return NextResponse.redirect(SITE_URL);
  }

  // Record click (fire-and-forget)
  void adminClient
    .from('affiliate_clicks')
    .insert({
      affiliate_id: affiliate.id,
      ip: ip !== 'unknown' ? ip : null,
      user_agent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
      referrer_url: request.headers.get('referer')?.slice(0, 2000) ?? null,
      landing_page: SITE_URL,
    });

  // Increment click counter atomically
  void adminClient.rpc('increment_affiliate_clicks', { aff_uuid: affiliate.id });

  // Redirect with attribution cookie (30 days)
  const redirectUrl = `${SITE_URL}/?ref=${encodeURIComponent(code)}`;
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set('aff_ref', code, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });

  return response;
}
