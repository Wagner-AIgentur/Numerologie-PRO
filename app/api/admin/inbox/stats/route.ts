import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/admin-guard';

/**
 * GET /api/admin/inbox/stats
 * Returns unread counts: { total_unread, by_type: { contact_form: N, order: N, ... } }
 */
export async function GET() {
  if (!(await requirePermission('inbox.view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await adminClient
    .from('activity_feed')
    .select('activity_type')
    .eq('is_read', false);

  if (error) {
    console.error('[inbox] Stats error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }

  const items = data ?? [];
  const byType: Record<string, number> = {};

  for (const item of items) {
    byType[item.activity_type] = (byType[item.activity_type] ?? 0) + 1;
  }

  return NextResponse.json({
    total_unread: items.length,
    by_type: byType,
  });
}
