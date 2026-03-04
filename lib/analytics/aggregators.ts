import { format, subDays, eachDayOfInterval, subMonths, startOfMonth, eachMonthOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import type { AnalyticsData, DayDataPoint, MonthDataPoint, NamedValue, FunnelStep, SessionStats, CouponStat } from './types';

// ─── Revenue ──────────────────────────────────────

export function aggregateRevenueByDay(
  orders: Array<{ amount_cents: number; status: string; created_at: string }>,
  days = 30
): DayDataPoint[] {
  const now = new Date();
  const interval = eachDayOfInterval({ start: subDays(now, days - 1), end: now });
  const map = new Map<string, number>();

  for (const d of interval) map.set(format(d, 'yyyy-MM-dd'), 0);
  for (const o of orders) {
    if (o.status !== 'paid') continue;
    const key = format(new Date(o.created_at), 'yyyy-MM-dd');
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + o.amount_cents / 100);
  }

  return Array.from(map, ([date, value]) => ({ date, value }));
}

export function aggregateRevenueByProduct(
  orders: Array<{ amount_cents: number; status: string; product_id: string | null }>,
  products: Array<{ id: string; name_de: string }>
): NamedValue[] {
  const map = new Map<string, number>();
  const nameMap = new Map(products.map((p) => [p.id, p.name_de]));

  for (const o of orders) {
    if (o.status !== 'paid' || !o.product_id) continue;
    const name = nameMap.get(o.product_id) ?? 'Unbekannt';
    map.set(name, (map.get(name) ?? 0) + o.amount_cents / 100);
  }

  return Array.from(map, ([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// ─── Customers ────────────────────────────────────

export function aggregateCustomerGrowthByMonth(
  profiles: Array<{ created_at: string }>,
  months = 12
): MonthDataPoint[] {
  const now = new Date();
  const interval = eachMonthOfInterval({ start: subMonths(startOfMonth(now), months - 1), end: now });
  const map = new Map<string, number>();

  for (const m of interval) map.set(format(m, 'yyyy-MM'), 0);
  for (const p of profiles) {
    const key = format(new Date(p.created_at), 'yyyy-MM');
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map, ([key, value]) => ({
    month: format(new Date(key + '-01'), 'MMM yy', { locale: de }),
    value,
  }));
}

export function groupByLanguage(profiles: Array<{ language: string }>): NamedValue[] {
  const map = new Map<string, number>();
  for (const p of profiles) {
    const lang = p.language === 'ru' ? 'Russisch' : 'Deutsch';
    map.set(lang, (map.get(lang) ?? 0) + 1);
  }
  return Array.from(map, ([name, value]) => ({ name, value }));
}

export function groupByCrmStatus(profiles: Array<{ crm_status: string }>): NamedValue[] {
  const labels: Record<string, string> = {
    lead: 'Lead',
    client: 'Kunde',
    vip: 'VIP',
    inactive: 'Inaktiv',
    admin: 'Admin',
  };
  const map = new Map<string, number>();
  for (const p of profiles) {
    const label = labels[p.crm_status] ?? p.crm_status;
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return Array.from(map, ([name, value]) => ({ name, value }))
    .filter((v) => v.name !== 'Admin');
}

// ─── Conversion Funnel ────────────────────────────

export function computeFunnel(
  contactCount: number,
  leadCount: number,
  profileCount: number,
  paidOrderCount: number
): FunnelStep[] {
  const top = Math.max(contactCount, leadCount, profileCount, 1);
  return [
    { label: 'Anfragen / Leads', value: contactCount + leadCount, percentage: 100 },
    { label: 'Registriert', value: profileCount, percentage: Math.round((profileCount / top) * 100) },
    { label: 'Gekauft', value: paidOrderCount, percentage: Math.round((paidOrderCount / top) * 100) },
  ];
}

// ─── Orders ───────────────────────────────────────

export function aggregateOrdersByDay(
  orders: Array<{ created_at: string }>,
  days = 30
): DayDataPoint[] {
  const now = new Date();
  const interval = eachDayOfInterval({ start: subDays(now, days - 1), end: now });
  const map = new Map<string, number>();

  for (const d of interval) map.set(format(d, 'yyyy-MM-dd'), 0);
  for (const o of orders) {
    const key = format(new Date(o.created_at), 'yyyy-MM-dd');
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map, ([date, value]) => ({ date, value }));
}

export function groupOrdersByStatus(orders: Array<{ status: string }>): NamedValue[] {
  const labels: Record<string, string> = {
    pending: 'Ausstehend',
    paid: 'Bezahlt',
    refunded: 'Erstattet',
    cancelled: 'Storniert',
  };
  const map = new Map<string, number>();
  for (const o of orders) {
    const label = labels[o.status] ?? o.status;
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return Array.from(map, ([name, value]) => ({ name, value }));
}

export function topProductsByOrders(
  orders: Array<{ product_id: string | null; status: string }>,
  products: Array<{ id: string; name_de: string }>
): NamedValue[] {
  const nameMap = new Map(products.map((p) => [p.id, p.name_de]));
  const map = new Map<string, number>();

  for (const o of orders) {
    if (o.status !== 'paid' || !o.product_id) continue;
    const name = nameMap.get(o.product_id) ?? 'Unbekannt';
    map.set(name, (map.get(name) ?? 0) + 1);
  }

  return Array.from(map, ([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

// ─── Sessions ─────────────────────────────────────

export function computeSessionStats(
  sessions: Array<{ status: string; session_type: string }>
): SessionStats {
  const statusLabels: Record<string, string> = {
    pending: 'Ausstehend',
    scheduled: 'Geplant',
    confirmed: 'Bestätigt',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    rescheduled: 'Verschoben',
  };
  const typeLabels: Record<string, string> = {
    paid: 'Bezahlt',
    free: 'Kostenlos',
  };

  const byStatus = new Map<string, number>();
  const byType = new Map<string, number>();

  for (const s of sessions) {
    const sl = statusLabels[s.status] ?? s.status;
    byStatus.set(sl, (byStatus.get(sl) ?? 0) + 1);
    const tl = typeLabels[s.session_type] ?? s.session_type;
    byType.set(tl, (byType.get(tl) ?? 0) + 1);
  }

  return {
    total: sessions.length,
    byStatus: Array.from(byStatus, ([name, value]) => ({ name, value })),
    byType: Array.from(byType, ([name, value]) => ({ name, value })),
  };
}

// ─── Coupons ──────────────────────────────────────

export function computeCouponStats(
  coupons: Array<{
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    used_count: number;
    max_uses: number | null;
    active: boolean;
  }>
): CouponStat[] {
  return coupons.map((c) => ({
    code: c.code,
    type: c.type,
    discountValue: c.value,
    usedCount: c.used_count,
    maxUses: c.max_uses,
    active: c.active,
  }));
}

// ─── Full aggregation ─────────────────────────────

export function buildAnalyticsData({
  orders,
  profiles,
  leads,
  sessions,
  coupons,
  products,
  contacts,
}: {
  orders: Array<{ id: string; amount_cents: number; status: string; product_id: string | null; created_at: string }>;
  profiles: Array<{ id: string; language: string; crm_status: string; created_at: string }>;
  leads: Array<{ id: string }>;
  sessions: Array<{ id: string; status: string; session_type: string }>;
  coupons: Array<{ code: string; type: 'percent' | 'fixed'; value: number; used_count: number; max_uses: number | null; active: boolean }>;
  products: Array<{ id: string; name_de: string }>;
  contacts: Array<{ id: string }>;
}): AnalyticsData {
  const paidOrders = orders.filter((o) => o.status === 'paid');
  const totalRevenue = paidOrders.reduce((s, o) => s + o.amount_cents / 100, 0);
  const nonAdminProfiles = profiles.filter((p) => p.crm_status !== 'admin');

  return {
    totalRevenue,
    averageOrderValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
    totalCustomers: nonAdminProfiles.length,
    conversionRate: nonAdminProfiles.length > 0
      ? Math.round((paidOrders.length / nonAdminProfiles.length) * 100)
      : 0,
    totalSessions: sessions.length,
    totalCouponsUsed: coupons.reduce((s, c) => s + c.used_count, 0),

    revenueByDay: aggregateRevenueByDay(orders),
    revenueByProduct: aggregateRevenueByProduct(orders, products),
    customerGrowthByMonth: aggregateCustomerGrowthByMonth(nonAdminProfiles),
    customersByLanguage: groupByLanguage(nonAdminProfiles),
    customersByCrmStatus: groupByCrmStatus(profiles),
    funnel: computeFunnel(contacts.length, leads.length, nonAdminProfiles.length, paidOrders.length),
    ordersByDay: aggregateOrdersByDay(orders),
    ordersByStatus: groupOrdersByStatus(orders),
    topProducts: topProductsByOrders(orders, products),
    sessionStats: computeSessionStats(sessions),
    couponStats: computeCouponStats(coupons),
  };
}
