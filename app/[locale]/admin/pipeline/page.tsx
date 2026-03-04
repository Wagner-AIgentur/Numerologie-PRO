import { adminClient } from '@/lib/supabase/admin';
import { getAdminT } from '@/lib/i18n/admin';
import { isDemoReviewer } from '@/lib/auth/admin-guard';
import PipelineBoard from '@/components/admin/crm/PipelineBoard';

export default async function PipelinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getAdminT(locale);

  // Demo reviewers: show empty pipeline (no real customer PII)
  const isDemo = await isDemoReviewer();

  // Fetch all non-admin profiles with order totals
  const { data: profiles } = isDemo
    ? { data: [] as Awaited<ReturnType<typeof adminClient.from<'profiles'>>>['data'] }
    : await adminClient
        .from('profiles')
        .select(`
          id, email, full_name, language, crm_status, tags, created_at,
          orders(amount_cents, status)
        `)
        .neq('crm_status', 'admin')
        .order('created_at', { ascending: false });

  // Compute revenue per customer
  const customers = (profiles ?? []).map((p) => {
    const paidOrders = ((p.orders as Array<{ amount_cents: number; status: string }>) ?? [])
      .filter((o) => o.status === 'paid');
    return {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      language: p.language,
      crm_status: p.crm_status as string,
      tags: p.tags as string[],
      created_at: p.created_at,
      order_count: paidOrders.length,
      total_revenue: paidOrders.reduce((s, o) => s + o.amount_cents, 0),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">{t.pipelineTitle}</h1>
        <p className="text-white/50 text-sm mt-1">
          {t.pipelineSubtitle}
        </p>
      </div>
      <PipelineBoard customers={customers} locale={locale} />
    </div>
  );
}
