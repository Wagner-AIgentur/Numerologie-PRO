import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/admin-guard';
import { validateBody, zodErrorResponse, broadcastUpdateSchema, isValidUUID } from '@/lib/validations/admin';

// GET: Single broadcast with recipient stats
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requirePermission('content.view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { data, error } = await adminClient
    .from('broadcasts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
  }

  return NextResponse.json({ broadcast: data });
}

// PATCH: Update a draft broadcast
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requirePermission('content.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  // Only allow editing drafts
  const { data: existing } = await adminClient
    .from('broadcasts')
    .select('status')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
  }

  if (existing.status !== 'draft' && existing.status !== 'scheduled') {
    return NextResponse.json(
      { error: 'Cannot edit a broadcast that is already being sent or has been sent' },
      { status: 400 },
    );
  }

  const { data: body, error: validationError } = await validateBody(request, broadcastUpdateSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.email_body !== undefined) updates.content_email = body.email_body;
  if (body.telegram_text !== undefined) updates.content_telegram = body.telegram_text;
  if (body.email_subject !== undefined) updates.subject_email = body.email_subject;
  if (body.channel !== undefined) updates.channels = [body.channel];
  if (body.audience !== undefined) updates.audience_filter = { type: body.audience, tags: body.audience_tags ?? [] };
  if (body.language_filter !== undefined) updates.language = body.language_filter;
  if (body.scheduled_at !== undefined) {
    updates.scheduled_at = body.scheduled_at;
    updates.status = body.scheduled_at ? 'scheduled' : 'draft';
  }

  const { data, error } = await adminClient
    .from('broadcasts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ broadcast: data });
}

// DELETE: Delete a draft broadcast
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requirePermission('content.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  // Only allow deleting drafts
  const { data: existing } = await adminClient
    .from('broadcasts')
    .select('status')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
  }

  if (existing.status !== 'draft') {
    return NextResponse.json(
      { error: 'Only draft broadcasts can be deleted' },
      { status: 400 },
    );
  }

  const { error } = await adminClient
    .from('broadcasts')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
