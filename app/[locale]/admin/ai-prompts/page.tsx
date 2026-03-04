import { getAdminT } from '@/lib/i18n/admin';
import AIPromptsShell from '@/components/admin/ai-prompts/AIPromptsShell';

export default async function AIPromptsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getAdminT(locale);

  return (
    <AIPromptsShell
      locale={locale}
      t={t as unknown as Record<string, string>}
    />
  );
}
