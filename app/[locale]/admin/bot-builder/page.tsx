import { adminClient } from '@/lib/supabase/admin';
import { getAdminT } from '@/lib/i18n/admin';
import BotBuilderShell from '@/components/admin/bot-builder/BotBuilderShell';

export default async function BotBuilderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getAdminT(locale);

  const [commandsRes, faqRes, settingsRes] = await Promise.all([
    adminClient.from('bot_commands').select('*').order('command'),
    adminClient.from('bot_faq_rules').select('*').order('priority', { ascending: false }),
    adminClient.from('bot_settings').select('*').order('key'),
  ]);

  // Convert settings rows to key-value object
  const settings: Record<string, unknown> = {};
  for (const row of settingsRes.data ?? []) {
    settings[row.key] = row.value;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">{t.botBuilderTitle}</h1>
        <p className="text-white/50 text-sm mt-1">{t.botBuilderSubtitle}</p>
      </div>

      <BotBuilderShell
        locale={locale}
        initialCommands={commandsRes.data ?? []}
        initialFaqRules={faqRes.data ?? []}
        initialSettings={settings}
      />
    </div>
  );
}
