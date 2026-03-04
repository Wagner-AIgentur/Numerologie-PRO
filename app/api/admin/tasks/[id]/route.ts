import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, taskUpdateSchema, isValidUUID } from '@/lib/validations/admin';

interface Params { params: Promise<{ id: string }> }

/**
 * PATCH /api/admin/tasks/[id] — Update a task
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await requirePermission('tasks.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const { data: body, error: validationError } = await validateBody(request, taskUpdateSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const allowed = ['title', 'description', 'type', 'priority', 'status', 'due_date', 'due_time', 'profile_id', 'assigned_to', 'source_type', 'source_id', 'completed_at'];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = (body as Record<string, unknown>)[key];
  }

  // Auto-set completed_at when status changes to completed
  if (updates.status === 'completed' && !updates.completed_at) {
    updates.completed_at = new Date().toISOString();
  }
  // Clear completed_at when reopening
  if (updates.status && updates.status !== 'completed') {
    updates.completed_at = null;
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await adminClient
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select('*, profiles:profile_id(id, full_name, email)')
    .single();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data);
}

/**
 * DELETE /api/admin/tasks/[id] — Delete a task
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await requirePermission('tasks.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { error } = await adminClient
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json({ success: true });
}
