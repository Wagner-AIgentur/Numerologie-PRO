import { adminClient } from '@/lib/supabase/admin';
import TaskListShell from '@/components/admin/tasks/TaskListShell';

export default async function TasksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const { data: tasks } = await adminClient
    .from('tasks')
    .select('*, profiles:profile_id(id, full_name, email)')
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  return <TaskListShell tasks={tasks ?? []} locale={locale} />;
}
