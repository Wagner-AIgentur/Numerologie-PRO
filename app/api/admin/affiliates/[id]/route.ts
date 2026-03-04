import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/admin-guard';

// GET: Single affiliate with detailed stats
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requirePermission('affiliates.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Fetch affiliate with coupon
  const { data: affiliate, error } = await adminClient
    .from('affiliates')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !affiliate) {
    return NextResponse.json({ error: 'Affiliate nicht gefunden' }, { status: 404 });
  }

  // Fetch linked coupon
  let coupon = null;
  if (affiliate.coupon_id) {
    const { data } = await adminClient
      .from('coupons')
      .select('*')
      .eq('id', affiliate.coupon_id)
      .single();
    coupon = data;
  }

  // Fetch recent clicks (last 30 days, grouped by day)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: clicks } = await adminClient
    .from('affiliate_clicks')
    .select('created_at')
    .eq('affiliate_id', id)
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: true });

  // Group clicks by day
  const clicksByDay: Record<string, number> = {};
  for (const click of clicks ?? []) {
    const day = (click.created_at ?? '').slice(0, 10);
    clicksByDay[day] = (clicksByDay[day] ?? 0) + 1;
  }

  // Fetch recent conversions (coupon usages for this affiliate's coupon)
  let conversions: Array<{ email: string; used_at: string | null; order_id: string | null }> = [];
  if (coupon) {
    const { data } = await adminClient
      .from('coupon_usages')
      .select('email, used_at, order_id')
      .eq('coupon_id', coupon.id)
      .order('used_at', { ascending: false })
      .limit(50);
    conversions = data ?? [];
  }

  return NextResponse.json({
    affiliate,
    coupon,
    clicksByDay,
    conversions,
    totalClicksLast30d: clicks?.length ?? 0,
  });
}
