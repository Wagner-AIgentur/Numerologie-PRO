import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import GlobalBackground from '@/components/ui/GlobalBackground';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?redirectTo=/${locale}/admin`);
  }

  const { data: profile } = await adminClient
    .from('profiles')
    .select('full_name, crm_status')
    .eq('id', user.id)
    .single() as { data: { full_name: string | null; crm_status: string } | null };

  if (profile?.crm_status !== 'admin') {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <>
      <GlobalBackground />
      <AdminShell
        locale={locale}
        userName={profile?.full_name ?? user.email ?? 'Admin'}
      >
        {children}
      </AdminShell>
    </>
  );
}
