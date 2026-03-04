import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/tasks/overdue — Count of overdue open tasks
 */
export async function GET() {
  const user = await requirePermission('tasks.view');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = new Date().toISOString().split('T')[0];

  const { count, error } = await adminClient
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .in('status', ['open', 'in_progress'])
    .lt('due_date', today);

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json({ overdue: count ?? 0 });
}
