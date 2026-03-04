import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, customFieldSchema, isValidUUID } from '@/lib/validations/admin';

interface Params { params: Promise<{ id: string }> }

/**
 * PATCH /api/admin/custom-fields/[id] — Update a custom field definition
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await requirePermission('fields.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { data: body, error: validationError } = await validateBody(request, customFieldSchema.partial());
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.label_de = body.name;
  if (body.field_type !== undefined) updates.field_type = body.field_type;
  if (body.options !== undefined) updates.options = body.options;
  if (body.is_required !== undefined) updates.is_required = body.is_required;

  const { data, error } = await adminClient
    .from('custom_field_definitions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data);
}

/**
 * DELETE /api/admin/custom-fields/[id] — Delete a custom field definition (and all its values)
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await requirePermission('fields.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { error } = await adminClient
    .from('custom_field_definitions')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json({ success: true });
}
