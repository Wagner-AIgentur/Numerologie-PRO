import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/admin-guard';
import { isValidUUID } from '@/lib/validations/admin';

/**
 * PATCH /api/admin/inbox/[id]/read
 * Mark a single activity feed item as read.
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requirePermission('inbox.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { error } = await adminClient
    .from('activity_feed')
    .update({ is_read: true })
    .eq('id', id);

  if (error) {
    console.error('[inbox] Mark read error:', error.message);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
