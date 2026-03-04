import { adminClient } from '@/lib/supabase/admin';
import TagRulesShell from '@/components/admin/tags/TagRulesShell';

export default async function TagRulesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const { data: rules } = await adminClient
    .from('tag_rules')
    .select('*')
    .order('created_at', { ascending: false });

  return <TagRulesShell rules={rules ?? []} locale={locale} />;
}
