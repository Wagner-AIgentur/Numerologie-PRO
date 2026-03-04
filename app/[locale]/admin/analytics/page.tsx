import { adminClient } from '@/lib/supabase/admin';
import { buildAnalyticsData } from '@/lib/analytics/aggregators';
import AnalyticsShell from '@/components/admin/analytics/AnalyticsShell';
import AdvancedAnalyticsShell from '@/components/admin/analytics/AdvancedAnalyticsShell';
import GA4Section from '@/components/admin/analytics/GA4Section';
import VisitorSection from '@/components/admin/analytics/VisitorSection';
import HeatmapSection from '@/components/admin/analytics/HeatmapSection';

export default async function AdminAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [
    { data: orders },
    { data: profiles },
    { data: leads },
    { data: sessions },
    { data: coupons },
    { data: products },
    { data: contacts },
  ] = await Promise.all([
    adminClient.from('orders').select('id, amount_cents, status, product_id, created_at'),
    adminClient.from('profiles').select('id, language, crm_status, created_at'),
    adminClient.from('leads').select('id'),
    adminClient.from('sessions').select('id, status, session_type'),
    adminClient.from('coupons').select('code, type, value, used_count, max_uses, active'),
    adminClient.from('products').select('id, name_de'),
    adminClient.from('contact_submissions').select('id'),
  ]);

  const data = buildAnalyticsData({
    orders: (orders ?? []).map(o => ({ ...o, status: o.status ?? '', created_at: o.created_at ?? '' })),
    profiles: (profiles ?? []).map(p => ({ ...p, language: p.language ?? '', crm_status: p.crm_status ?? '', created_at: p.created_at ?? '' })),
    leads: leads ?? [],
    sessions: (sessions ?? []).map(s => ({ ...s, session_type: s.session_type ?? '' })),
    coupons: (coupons ?? []).map(c => ({ ...c, type: c.type as 'percent' | 'fixed', used_count: c.used_count ?? 0, active: c.active ?? false })),
    products: products ?? [],
    contacts: contacts ?? [],
  });

  return (
    <>
      <AnalyticsShell initialData={data} />
      <AdvancedAnalyticsShell locale={locale} />
      <div className="mt-8">
        <GA4Section />
      </div>
      <div className="mt-8">
        <VisitorSection />
      </div>
      <div className="mt-8">
        <HeatmapSection />
      </div>
    </>
  );
}
