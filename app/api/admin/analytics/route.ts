import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission, adminRateLimit } from '@/lib/auth/admin-guard';
import { buildAnalyticsData } from '@/lib/analytics/aggregators';
import { subDays, subMonths, startOfDay } from 'date-fns';

function getRangeStart(range: string): string | null {
  const now = new Date();
  switch (range) {
    case 'today':
      return startOfDay(now).toISOString();
    case '7d':
      return subDays(now, 7).toISOString();
    case '30d':
      return subDays(now, 30).toISOString();
    case '12m':
      return subMonths(now, 12).toISOString();
    case 'all':
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  if (!(await requirePermission('analytics.view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!await adminRateLimit(request)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const range = request.nextUrl.searchParams.get('range') ?? '30d';
  const rangeStart = getRangeStart(range);

  // Helper: select + optional date filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = (table: any, columns: string): any => {
    const q = adminClient.from(table).select(columns);
    return rangeStart ? q.gte('created_at', rangeStart) : q;
  };

  const [
    { data: orders },
    { data: profiles },
    { data: leads },
    { data: sessions },
    { data: coupons },
    { data: products },
    { data: contacts },
  ] = await Promise.all([
    query('orders', 'id, amount_cents, status, product_id, created_at'),
    query('profiles', 'id, language, crm_status, created_at'),
    query('leads', 'id'),
    query('sessions', 'id, status, session_type'),
    adminClient.from('coupons').select('code, type, value, used_count, max_uses, active'),
    adminClient.from('products').select('id, name_de'),
    query('contact_submissions', 'id'),
  ]);

  const data = buildAnalyticsData({
    orders: orders ?? [],
    profiles: profiles ?? [],
    leads: leads ?? [],
    sessions: sessions ?? [],
    coupons: (coupons ?? []).map((c) => ({
      ...c,
      type: c.type as 'percent' | 'fixed',
      used_count: c.used_count ?? 0,
      active: c.active ?? true,
    })),
    products: products ?? [],
    contacts: contacts ?? [],
  });

  return NextResponse.json(data);
}
