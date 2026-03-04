import { adminClient } from '@/lib/supabase/admin';
import CustomFieldsShell from '@/components/admin/custom-fields/CustomFieldsShell';

export default async function CustomFieldsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const { data: definitions } = await adminClient
    .from('custom_field_definitions')
    .select('*')
    .order('sort_order', { ascending: true });

  const mapped = (definitions ?? []).map(d => ({
    ...d,
    options: d.options as string[] | null,
  }));
  return <CustomFieldsShell definitions={mapped} locale={locale} />;
}
