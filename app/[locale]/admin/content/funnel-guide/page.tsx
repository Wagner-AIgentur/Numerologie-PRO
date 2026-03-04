import { getAdminT } from '@/lib/i18n/admin';
import FunnelGuideShell from '@/components/admin/content/FunnelGuideShell';

export default async function FunnelGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getAdminT(locale);
  return <FunnelGuideShell locale={locale} t={t as unknown as Record<string, string>} />;
}
