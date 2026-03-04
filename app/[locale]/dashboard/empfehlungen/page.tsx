import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ReferralPanel from '@/components/dashboard/ReferralPanel';

export default async function EmpfehlungenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return <ReferralPanel locale={locale} />;
}
