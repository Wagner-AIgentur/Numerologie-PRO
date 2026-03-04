import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, competitorCreateSchema } from '@/lib/validations/admin';
import { getPagination, paginatedResponse } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { page, limit, offset } = getPagination(request);

  const { data, error, count } = await adminClient
    .from('content_competitors')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, { page, limit, offset }));
}

export async function POST(request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: validationError } = await validateBody(request, competitorCreateSchema);
  if (validationError) return NextResponse.json(zodErrorResponse(validationError), { status: 400 });

  const { data, error } = await adminClient
    .from('content_competitors')
    .insert(body!)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to create competitor' }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
