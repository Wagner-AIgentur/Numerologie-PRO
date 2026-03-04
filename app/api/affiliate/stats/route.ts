/**
 * Public Affiliate Stats API
 *
 * GET /api/affiliate/stats?code=XXX
 * Returns non-PII stats for an affiliate to check their own performance.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  // Rate limit
  const ip = getClientIp(request);
  if (!await rateLimit(`aff_stats:${ip}`, { max: 10, windowSeconds: 60 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { data: affiliate } = await adminClient
    .from('affiliates')
    .select('name, total_clicks, total_conversions, total_commission_cents, is_active, created_at')
    .eq('tracking_code', code.trim().toUpperCase())
    .single();

  if (!affiliate) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    name: affiliate.name,
    active: affiliate.is_active,
    clicks: affiliate.total_clicks,
    conversions: affiliate.total_conversions,
    commission_eur: ((affiliate.total_commission_cents ?? 0) / 100).toFixed(2),
    conversion_rate: (affiliate.total_clicks ?? 0) > 0
      ? (((affiliate.total_conversions ?? 0) / (affiliate.total_clicks ?? 1)) * 100).toFixed(1)
      : '0.0',
    member_since: affiliate.created_at,
  });
}
