import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/admin-guard';

/**
 * Advanced Analytics API – date range filtering + period comparison.
 *
 * Query params:
 *  - start_date  ISO 8601 timestamp
 *  - end_date    ISO 8601 timestamp
 *  - compare     "true" to include previous-period deltas
 */
export async function GET(request: NextRequest) {
  if (!(await requirePermission('analytics.view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = request.nextUrl.searchParams;
  const startDate = sp.get('start_date');
  const endDate = sp.get('end_date');
  const compare = sp.get('compare') === 'true';

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'start_date and end_date are required' },
      { status: 400 }
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json(
      { error: 'Invalid date format' },
      { status: 400 }
    );
  }

  // Determine granularity from range length
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const granularity = diffDays <= 31 ? 'daily' : diffDays <= 120 ? 'weekly' : 'monthly';

  // ── Call RPC functions ──
  const [revenueRes, sourceRes, sequenceRes] = await Promise.all([
    adminClient.rpc('revenue_by_period', {
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      granularity,
    }),
    adminClient.rpc('source_conversion_stats'),
    adminClient.rpc('sequence_performance_stats'),
  ]);

  const revenueData = revenueRes.data ?? [];
  const sourceStats = sourceRes.data ?? [];
  const sequenceStats = sequenceRes.data ?? [];

  // ── Aggregate current period totals ──
  const totalRevenueCents = revenueData.reduce(
    (sum: number, r: { revenue_cents: number }) => sum + Number(r.revenue_cents),
    0
  );
  const totalOrders = revenueData.reduce(
    (sum: number, r: { order_count: number }) => sum + Number(r.order_count),
    0
  );
  const totalLeads = sourceStats.reduce(
    (sum: number, s: { total_leads: number }) => sum + Number(s.total_leads),
    0
  );
  const totalConverted = sourceStats.reduce(
    (sum: number, s: { converted_leads: number }) => sum + Number(s.converted_leads),
    0
  );

  // ── Period comparison ──
  let comparison = null;
  if (compare) {
    const periodMs = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodMs);
    const prevEnd = new Date(start.getTime()); // prev ends where current starts

    const { data: prevRevenueData } = await adminClient.rpc('revenue_by_period', {
      start_date: prevStart.toISOString(),
      end_date: prevEnd.toISOString(),
      granularity,
    });

    const prevRevenue = (prevRevenueData ?? []).reduce(
      (sum: number, r: { revenue_cents: number }) => sum + Number(r.revenue_cents),
      0
    );
    const prevOrders = (prevRevenueData ?? []).reduce(
      (sum: number, r: { order_count: number }) => sum + Number(r.order_count),
      0
    );

    // Previous period lead/conversion counts from leads table directly
    const { count: prevLeadCount } = await adminClient
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', prevEnd.toISOString());

    const { count: prevConvertedCount } = await adminClient
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', prevEnd.toISOString())
      .eq('converted', true);

    comparison = {
      prevRevenueCents: prevRevenue,
      prevOrders: prevOrders,
      prevLeads: prevLeadCount ?? 0,
      prevConverted: prevConvertedCount ?? 0,
      revenueDelta: calcDelta(totalRevenueCents, prevRevenue),
      ordersDelta: calcDelta(totalOrders, prevOrders),
      leadsDelta: calcDelta(totalLeads, prevLeadCount ?? 0),
      conversionDelta: calcDelta(totalConverted, prevConvertedCount ?? 0),
    };
  }

  return NextResponse.json({
    revenue: revenueData,
    granularity,
    totalRevenueCents,
    totalOrders,
    totalLeads,
    totalConverted,
    sourceStats,
    sequenceStats,
    comparison,
  });
}

/** Returns percentage change; null if previous is zero */
function calcDelta(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10; // one decimal
}
