import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, teamRoleSchema } from '@/lib/validations/admin';

/**
 * GET /api/admin/team/roles — List all team roles
 */
export async function GET() {
  const user = await requirePermission('team.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await adminClient
    .from('team_roles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data ?? []);
}

/**
 * POST /api/admin/team/roles — Create a custom role
 */
export async function POST(request: NextRequest) {
  const user = await requirePermission('team.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: validationError } = await validateBody(request, teamRoleSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const { name, permissions, description } = body;

  const { data, error } = await adminClient
    .from('team_roles')
    .insert({
      name: name.toLowerCase().replace(/\s+/g, '_'),
      label_de: name,
      label_ru: name,
      permissions: permissions ?? [],
      description: description ?? null,
      is_system: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
