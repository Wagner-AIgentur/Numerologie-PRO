import { adminClient } from '@/lib/supabase/admin';
import { getAdminT } from '@/lib/i18n/admin';
import DealPipelineShell from '@/components/admin/deals/DealPipelineShell';

export default async function DealsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getAdminT(locale);

  // Fetch all deals with profile names and product info
  const { data: deals } = await adminClient
    .from('deals')
    .select('*, profiles!deals_profile_id_fkey(id, email, full_name), products(id, name_de, name_ru)')
    .order('created_at', { ascending: false });

  // Fetch active products for the new-deal form
  const { data: products } = await adminClient
    .from('products')
    .select('id, name_de, name_ru, price_cents, currency')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">
          {locale === 'ru' ? 'Сделки' : 'Deals'}
        </h1>
        <p className="text-white/50 text-sm mt-1">
          {locale === 'ru'
            ? 'Отслеживание сделок и прогноз выручки.'
            : 'Deal-Tracking und Umsatzprognose.'}
        </p>
      </div>
      <DealPipelineShell
        initialDeals={deals ?? []}
        products={products ?? []}
        locale={locale}
      />
    </div>
  );
}
