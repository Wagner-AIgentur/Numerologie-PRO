import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requirePermission, adminRateLimit } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { safeParseJSON } from '@/lib/utils';

/**
 * GET /api/admin/team/members — List all admin users with their roles
 */
export async function GET(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!await adminRateLimit(request)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { data, error } = await adminClient
    .from('profiles')
    .select('id, email, full_name, avatar_url, team_role_id, created_at, team_roles:team_role_id(id, name, label_de, label_ru, permissions, is_system)')
    .eq('crm_status', 'admin')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data ?? []);
}

/**
 * PATCH /api/admin/team/members — Assign a role to a profile
 * Body: { profile_id: string, team_role_id: string | null }
 */
export async function PATCH(request: NextRequest) {
  const user = await requirePermission('team.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: parseError } = await safeParseJSON<Record<string, unknown>>(request);
  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 });
  }
  const { profile_id, team_role_id } = body as { profile_id?: string; team_role_id?: string | null };

  if (profile_id === user.id) {
    return NextResponse.json({ error: 'Cannot change own role' }, { status: 400 });
  }

  if (!profile_id) {
    return NextResponse.json({ error: 'profile_id is required' }, { status: 400 });
  }

  // Verify the profile is an admin
  const { data: profile } = await adminClient
    .from('profiles')
    .select('crm_status')
    .eq('id', profile_id)
    .single();

  if (profile?.crm_status !== 'admin') {
    return NextResponse.json({ error: 'Profile is not an admin' }, { status: 400 });
  }

  // If team_role_id provided, verify it exists
  if (team_role_id) {
    const { data: role } = await adminClient
      .from('team_roles')
      .select('id')
      .eq('id', team_role_id)
      .single();

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }
  }

  const { data, error } = await adminClient
    .from('profiles')
    .update({ team_role_id: team_role_id ?? null })
    .eq('id', profile_id)
    .select('id, email, full_name, avatar_url, team_role_id, created_at, team_roles:team_role_id(id, name, label_de, label_ru, permissions, is_system)')
    .single();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data);
}
