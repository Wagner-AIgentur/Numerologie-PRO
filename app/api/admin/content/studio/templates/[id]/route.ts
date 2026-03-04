import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { isValidUUID, validateBody, zodErrorResponse, promptTemplateUpdateSchema } from '@/lib/validations/admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requirePermission('content.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { data: body, error: validationError } = await validateBody(request, promptTemplateUpdateSchema);
  if (validationError) return NextResponse.json(zodErrorResponse(validationError), { status: 400 });

  const { data, error } = await adminClient
    .from('ai_prompt_templates')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requirePermission('content.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  // Don't allow deleting builtin templates — deactivate instead
  const { data: existing } = await adminClient
    .from('ai_prompt_templates')
    .select('is_builtin')
    .eq('id', id)
    .single();

  if (existing?.is_builtin) {
    await adminClient.from('ai_prompt_templates').update({ is_active: false }).eq('id', id);
    return NextResponse.json({ message: 'Builtin template deactivated' });
  }

  const { error } = await adminClient.from('ai_prompt_templates').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  return NextResponse.json({ message: 'Deleted' });
}
