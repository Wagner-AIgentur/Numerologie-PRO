import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GlobalBackground from '@/components/ui/GlobalBackground';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default async function DashboardLayout({
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
    redirect(`/${locale}/auth/login`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, crm_status')
    .eq('id', user.id)
    .single();

  return (
    <>
      <GlobalBackground />
      <DashboardShell
        locale={locale}
        userName={profile?.full_name ?? user.email ?? (locale === 'de' ? 'Mein Konto' : 'Мой аккаунт')}
        isAdmin={profile?.crm_status === 'admin'}
      >
        {children}
      </DashboardShell>
    </>
  );
}
