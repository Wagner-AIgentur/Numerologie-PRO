import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/admin-guard';
import { validateBody, zodErrorResponse, broadcastCreateSchema } from '@/lib/validations/admin';

// GET: List broadcasts with optional status filter
export async function GET(request: NextRequest) {
  if (!(await requirePermission('content.view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  let query = adminClient
    .from('broadcasts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ broadcasts: data, total: count });
}

// POST: Create a new broadcast
export async function POST(request: NextRequest) {
  const admin = await requirePermission('content.edit');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: body, error: validationError } = await validateBody(request, broadcastCreateSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const {
    title,
    email_body,
    telegram_text,
    email_subject,
    channel,
    audience,
    audience_tags,
    language_filter,
    scheduled_at,
    status: bodyStatus,
  } = body;

  const status = scheduled_at ? 'scheduled' : (bodyStatus ?? 'draft');

  const { data, error } = await adminClient
    .from('broadcasts')
    .insert({
      title: title.trim(),
      content_email: email_body ?? null,
      content_telegram: telegram_text ?? null,
      subject_email: email_subject ?? null,
      channels: channel ? [channel] : ['email'],
      audience_filter: { type: audience ?? 'all', tags: audience_tags ?? [] },
      language: language_filter ?? 'all',
      status,
      scheduled_at: scheduled_at ?? null,
      created_by: admin.id,
      ai_prompt: null,
      ai_model: null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ broadcast: data }, { status: 201 });
}
