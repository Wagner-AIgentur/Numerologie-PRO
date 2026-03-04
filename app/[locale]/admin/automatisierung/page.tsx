import { requireAdmin } from '@/lib/auth/admin-guard';
import { redirect } from 'next/navigation';
import { adminClient } from '@/lib/supabase/admin';
import { getAdminT, getDateLocale } from '@/lib/i18n/admin';
import Link from 'next/link';
import { Plus, Zap, Play, Pause, AlertTriangle, CheckCircle2 } from 'lucide-react';

const TRIGGER_LABELS: Record<string, Record<string, string>> = {
  de: {
    lead_created: 'Lead erstellt',
    lead_verified: 'Lead verifiziert',
    profile_updated: 'Profil aktualisiert',
    order_completed: 'Bestellung abgeschlossen',
    order_refunded: 'Erstattung',
    session_scheduled: 'Sitzung geplant',
    session_completed: 'Sitzung abgeschlossen',
    tag_added: 'Tag hinzugefügt',
    tag_removed: 'Tag entfernt',
    contact_submitted: 'Kontakt eingereicht',
    crm_status_changed: 'Status geändert',
    follow_up_due: 'Follow-up fällig',
  },
  ru: {
    lead_created: 'Лид создан',
    lead_verified: 'Лид подтверждён',
    profile_updated: 'Профиль обновлён',
    order_completed: 'Заказ завершён',
    order_refunded: 'Возврат',
    session_scheduled: 'Сессия запланирована',
    session_completed: 'Сессия завершена',
    tag_added: 'Тег добавлен',
    tag_removed: 'Тег удалён',
    contact_submitted: 'Обращение отправлено',
    crm_status_changed: 'Статус изменён',
    follow_up_due: 'Напоминание',
  },
};

export default async function AutomationPage({ params }: { params: Promise<{ locale: string }> }) {
  const user = await requireAdmin();
  const { locale } = await params;
  if (!user) redirect(`/${locale}/auth/login`);

  const t = getAdminT(locale);
  const triggers = TRIGGER_LABELS[locale] ?? TRIGGER_LABELS.de;

  // Fetch rules
  const { data: rules } = await adminClient
    .from('automation_rules')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch log stats
  const ruleIds = (rules ?? []).map((r) => r.id);
  const { data: logs } = await adminClient
    .from('automation_logs')
    .select('rule_id, status')
    .in('rule_id', ruleIds.length ? ruleIds : ['__none__']);

  const statsMap: Record<string, { total: number; success: number; failed: number }> = {};
  for (const log of logs ?? []) {
    if (!statsMap[log.rule_id]) statsMap[log.rule_id] = { total: 0, success: 0, failed: 0 };
    statsMap[log.rule_id].total++;
    if (log.status === 'success') statsMap[log.rule_id].success++;
    if (log.status === 'failed') statsMap[log.rule_id].failed++;
  }

  const activeCount = (rules ?? []).filter((r) => r.is_active).length;
  const totalRuns = Object.values(statsMap).reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="h-7 w-7 text-gold" strokeWidth={1.5} />
            {t.automations}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {activeCount} {locale === 'de' ? 'aktive Regeln' : 'активных правил'} · {totalRuns} {locale === 'de' ? 'Ausführungen' : 'выполнений'}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/automatisierung/neu`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> {locale === 'de' ? 'Neue Regel' : 'Новое правило'}
        </Link>
      </div>

      {/* Rules List */}
      {!rules?.length ? (
        <div className="text-center py-16 text-white/40">
          <Zap className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>{locale === 'de' ? 'Noch keine Automations-Regeln erstellt.' : 'Правила автоматизации ещё не созданы.'}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => {
            const stats = statsMap[rule.id] ?? { total: 0, success: 0, failed: 0 };
            const conditions = (rule.conditions ?? []) as { field: string; operator: string; value: string }[];
            const actions = (rule.actions ?? []) as { type: string }[];

            return (
              <Link
                key={rule.id}
                href={`/${locale}/admin/automatisierung/${rule.id}`}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.06] hover:border-gold/20 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {rule.is_active ? (
                        <Play className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Pause className="h-4 w-4 text-white/30 shrink-0" />
                      )}
                      <h3 className="text-white font-semibold truncate group-hover:text-gold transition-colors">
                        {rule.name}
                      </h3>
                    </div>

                    {rule.description && (
                      <p className="text-white/40 text-sm mb-3 line-clamp-1">{rule.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {/* Trigger badge */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium">
                        <Zap className="h-3 w-3" />
                        {triggers[rule.trigger_event] ?? rule.trigger_event}
                      </span>

                      {/* Conditions count */}
                      {conditions.length > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium">
                          {conditions.length} {locale === 'de' ? 'Bedingung' : 'условие'}{conditions.length > 1 ? (locale === 'de' ? 'en' : 'й') : ''}
                        </span>
                      )}

                      {/* Actions count */}
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-medium">
                        {actions.length} {locale === 'de' ? 'Aktion' : 'действие'}{actions.length > 1 ? (locale === 'de' ? 'en' : 'й') : ''}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/60" />
                      <span>{stats.success}</span>
                      {stats.failed > 0 && (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5 text-red-400/60" />
                          <span>{stats.failed}</span>
                        </>
                      )}
                    </div>
                    {rule.last_run_at && (
                      <p className="text-[11px] text-white/30 mt-1">
                        {new Date(rule.last_run_at).toLocaleDateString(getDateLocale(locale), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
