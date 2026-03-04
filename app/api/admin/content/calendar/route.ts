import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, calendarEventCreateSchema } from '@/lib/validations/admin';

export async function GET(request: NextRequest) {
  if (!(await requirePermission('content.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let query = adminClient
    .from('content_calendar')
    .select('*, content_posts!inner(id, title, status, funnel_stage, content_type, manychat_enabled, manychat_keyword, target_platforms)')
    .order('scheduled_date', { ascending: true });

  if (from) query = query.gte('scheduled_date', from);
  if (to) query = query.lte('scheduled_date', to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  return NextResponse.json({ events: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!(await requirePermission('content.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: body, error: validationError } = await validateBody(request, calendarEventCreateSchema);
  if (validationError) return NextResponse.json(zodErrorResponse(validationError), { status: 400 });

  const { data, error } = await adminClient
    .from('content_calendar')
    .insert(body)
    .select('*, content_posts!inner(id, title, status, funnel_stage, content_type)')
    .single();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
