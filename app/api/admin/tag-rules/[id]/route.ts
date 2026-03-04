import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, tagRuleSchema, isValidUUID } from '@/lib/validations/admin';

interface Params { params: Promise<{ id: string }> }

/**
 * PATCH /api/admin/tag-rules/[id] — Update a tag rule
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await requirePermission('tags.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { data: body, error: validationError } = await validateBody(request, tagRuleSchema.partial());
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.description = body.name;
  if (body.tag !== undefined) updates.tag_name = body.tag;
  if (body.conditions !== undefined) updates.condition_value = body.conditions;
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  const { data, error } = await adminClient
    .from('tag_rules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data);
}

/**
 * DELETE /api/admin/tag-rules/[id] — Delete a tag rule
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await requirePermission('tags.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { error } = await adminClient
    .from('tag_rules')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json({ success: true });
}
