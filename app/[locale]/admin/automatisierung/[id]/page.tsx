import { requireAdmin } from '@/lib/auth/admin-guard';
import { redirect } from 'next/navigation';
import { adminClient } from '@/lib/supabase/admin';
import AutomationBuilderShell from '@/components/admin/automations/AutomationBuilderShell';

export default async function AutomationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const user = await requireAdmin();
  const { locale, id } = await params;
  if (!user) redirect(`/${locale}/auth/login`);

  // Handle "neu" (new rule) — create empty and redirect
  if (id === 'neu') {
    const { data: created } = await adminClient
      .from('automation_rules')
      .insert({
        name: locale === 'de' ? 'Neue Regel' : 'Новое правило',
        trigger_event: 'lead_created',
        conditions: [],
        actions: [],
        is_active: false,
      })
      .select('id')
      .single();

    if (created) redirect(`/${locale}/admin/automatisierung/${created.id}`);
    redirect(`/${locale}/admin/automatisierung`);
  }

  // Load rule
  const { data: rule } = await adminClient
    .from('automation_rules')
    .select('*')
    .eq('id', id)
    .single();

  if (!rule) redirect(`/${locale}/admin/automatisierung`);

  // Load recent logs
  const { data: logs } = await adminClient
    .from('automation_logs')
    .select('*')
    .eq('rule_id', id)
    .order('created_at', { ascending: false })
    .limit(30);

  return (
    <AutomationBuilderShell
      locale={locale}
      rule={rule}
      logs={logs ?? []}
    />
  );
}
