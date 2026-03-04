import { adminClient } from '@/lib/supabase/admin';
import { getAdminT } from '@/lib/i18n/admin';
import { isDemoReviewer } from '@/lib/auth/admin-guard';
import CustomerSearch from '@/components/admin/crm/CustomerSearch';

export default async function KundenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getAdminT(locale);

  // Demo reviewers: show empty list (no real customer PII)
  const isDemo = await isDemoReviewer();

  const { data: kunden } = isDemo
    ? { data: [] as Awaited<ReturnType<typeof adminClient.from<'profiles'>>>['data'] }
    : await adminClient
        .from('profiles')
        .select(`
          id, email, full_name, phone, language, crm_status, tags, source, created_at,
          orders(count),
          sessions(count)
        `)
        .neq('crm_status', 'admin')
        .is('deletion_requested_at', null)
        .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">{t.customersTitle}</h1>
        <p className="text-white/50 text-sm mt-1">
          {kunden?.length ?? 0} {t.peopleInDb}
        </p>
      </div>

      <CustomerSearch customers={kunden ?? []} locale={locale} />
    </div>
  );
}
