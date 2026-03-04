import { adminClient } from '@/lib/supabase/admin';
import { getAdminT } from '@/lib/i18n/admin';
import InboxShell from '@/components/admin/inbox/InboxShell';

export default async function InboxPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getAdminT(locale);

  // Fetch initial feed (first 50 items)
  const { data: items, count } = await adminClient
    .from('activity_feed')
    .select('*, profiles:profile_id(id, full_name, email, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 49);

  // Fetch unread stats
  const { data: unreadItems } = await adminClient
    .from('activity_feed')
    .select('activity_type')
    .eq('is_read', false);

  const unreadList = unreadItems ?? [];
  const byType: Record<string, number> = {};
  for (const item of unreadList) {
    byType[item.activity_type] = (byType[item.activity_type] ?? 0) + 1;
  }

  const stats = {
    total_unread: unreadList.length,
    by_type: byType,
  };

  return (
    <InboxShell
      locale={locale}
      initialItems={items ?? []}
      initialTotal={count ?? 0}
      initialStats={stats}
    />
  );
}
