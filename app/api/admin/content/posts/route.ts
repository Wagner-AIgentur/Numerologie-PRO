import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, contentPostCreateSchema, isValidUUID } from '@/lib/validations/admin';
import { getPagination, paginatedResponse } from '@/lib/pagination';
import { onPostSaved } from '@/lib/intelligence/memory';
import { onPostSavedGraph } from '@/lib/intelligence/graph';

export async function GET(request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const contentType = searchParams.get('content_type');
  const funnelStage = searchParams.get('funnel_stage');
  const language = searchParams.get('language');
  const { page, limit, offset } = getPagination(request);

  let query = adminClient
    .from('content_posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (contentType) query = query.eq('content_type', contentType);
  if (funnelStage) query = query.eq('funnel_stage', funnelStage);
  if (language) query = query.eq('language', language);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, { page, limit, offset }));
}

export async function POST(request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: validationError } = await validateBody(request, contentPostCreateSchema);
  if (validationError) return NextResponse.json(zodErrorResponse(validationError), { status: 400 });

  const { data, error } = await adminClient
    .from('content_posts')
    .insert({ ...body, created_by: user.id })
    .select('*')
    .single();

  if (error) {
    console.error('[Content Posts] Insert error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  // Fire-and-forget: Intelligence Layer auto-capture
  onPostSaved({
    id: data.id,
    title: data.title ?? '',
    body: data.body,
    funnel_stage: data.funnel_stage ?? '',
    content_type: data.content_type ?? '',
    triggers_used: data.triggers_used ?? [],
    target_platforms: data.target_platforms ?? [],
    language: data.language ?? 'de',
  }).catch(() => {});

  onPostSavedGraph({
    id: data.id,
    inspired_by_intel_id: data.inspired_by_intel_id ?? null,
    triggers_used: data.triggers_used ?? [],
    funnel_stage: data.funnel_stage ?? '',
  }).catch(() => {});

  return NextResponse.json(data, { status: 201 });
}
