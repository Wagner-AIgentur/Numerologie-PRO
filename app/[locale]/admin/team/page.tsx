import { adminClient } from '@/lib/supabase/admin';
import TeamShell from '@/components/admin/team/TeamShell';

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [{ data: members }, { data: roles }] = await Promise.all([
    adminClient
      .from('profiles')
      .select('id, email, full_name, avatar_url, team_role_id, created_at, team_roles:team_role_id(id, name, label_de, label_ru, permissions, is_system)')
      .eq('crm_status', 'admin')
      .order('created_at', { ascending: true }),
    adminClient
      .from('team_roles')
      .select('*')
      .order('created_at', { ascending: true }),
  ]);

  // Supabase returns joined team_roles as array; normalize to single object for TeamMember type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalized = (members ?? []).map((m: any) => ({
    ...m,
    team_roles: Array.isArray(m.team_roles) ? m.team_roles[0] ?? null : m.team_roles ?? null,
  }));

  return <TeamShell members={normalized} roles={roles ?? []} locale={locale} />;
}
