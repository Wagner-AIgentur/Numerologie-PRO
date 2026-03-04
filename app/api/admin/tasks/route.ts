import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, taskCreateSchema } from '@/lib/validations/admin';
import { getPagination, paginatedResponse } from '@/lib/pagination';

/**
 * GET /api/admin/tasks — List tasks with optional filters + pagination
 * Query params: status, priority, profile_id, page, limit
 */
export async function GET(request: NextRequest) {
  const user = await requirePermission('tasks.view');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const profileId = searchParams.get('profile_id');
  const { page, limit, offset } = getPagination(request);

  let query = adminClient
    .from('tasks')
    .select('*, profiles:profile_id(id, full_name, email)', { count: 'exact' })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (priority) query = query.eq('priority', priority);
  if (profileId) query = query.eq('profile_id', profileId);

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, { page, limit, offset }));
}

/**
 * POST /api/admin/tasks — Create a new task
 */
export async function POST(request: NextRequest) {
  const user = await requirePermission('tasks.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: validationError } = await validateBody(request, taskCreateSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }
  const { title, description, type, priority, status, due_date, due_time, profile_id, assigned_to, source_type, source_id } = body as any;

  const { data, error } = await adminClient
    .from('tasks')
    .insert({
      title,
      description: description ?? null,
      type: type ?? 'other',
      priority: priority ?? 'medium',
      status: status ?? 'open',
      due_date: due_date ?? null,
      due_time: due_time ?? null,
      profile_id: profile_id ?? null,
      assigned_to: assigned_to ?? null,
      source_type: source_type ?? null,
      source_id: source_id ?? null,
    })
    .select('*, profiles:profile_id(id, full_name, email)')
    .single();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
