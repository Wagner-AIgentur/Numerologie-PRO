import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, teamRoleSchema, isValidUUID } from '@/lib/validations/admin';

interface Params { params: Promise<{ id: string }> }

/**
 * PATCH /api/admin/team/roles/[id] — Update a role
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await requirePermission('team.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { data: body, error: validationError } = await validateBody(request, teamRoleSchema.partial());
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  // Block modification of system roles (Owner, Manager, Assistant, Viewer)
  const { data: existingRole } = await adminClient
    .from('team_roles')
    .select('is_system')
    .eq('id', id)
    .single();
  if (existingRole?.is_system) {
    return NextResponse.json({ error: 'System roles cannot be modified' }, { status: 403 });
  }

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) {
    updates.name = body.name.toLowerCase().replace(/\s+/g, '_');
    updates.label_de = body.name;
    updates.label_ru = body.name;
  }
  if (body.permissions !== undefined) updates.permissions = body.permissions;
  if (body.description !== undefined) updates.description = body.description;

  const { data, error } = await adminClient
    .from('team_roles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data);
}

/**
 * DELETE /api/admin/team/roles/[id] — Delete a role (blocks system roles)
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await requirePermission('team.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  // Check if it's a system role
  const { data: role } = await adminClient
    .from('team_roles')
    .select('is_system')
    .eq('id', id)
    .single();

  if (role?.is_system) {
    return NextResponse.json({ error: 'System roles cannot be deleted' }, { status: 403 });
  }

  // Unassign all profiles with this role before deleting
  await adminClient
    .from('profiles')
    .update({ team_role_id: null })
    .eq('team_role_id', id);

  const { error } = await adminClient
    .from('team_roles')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json({ success: true });
}
