import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/admin-guard';

/**
 * POST /api/admin/inbox/mark-all-read
 * Mark all unread items as read. Optional ?type= filter.
 */
export async function POST(request: NextRequest) {
  if (!(await requirePermission('inbox.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get('type');

  let query = adminClient
    .from('activity_feed')
    .update({ is_read: true })
    .eq('is_read', false);

  if (type) {
    query = query.eq('activity_type', type);
  }

  const { error } = await query;

  if (error) {
    console.error('[inbox] Mark all read error:', error.message);
    return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
