import { adminClient } from '@/lib/supabase/admin';
import { getAdminT, getDateLocale } from '@/lib/i18n/admin';
import Link from 'next/link';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Users,
  CheckCircle,
  Clock,
  Mail,
} from 'lucide-react';

export default async function SequenzenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getAdminT(locale);
  const dateLocale = getDateLocale(locale);

  const { data: sequences } = await adminClient
    .from('email_sequences')
    .select('*, email_sequence_steps(id), email_sequence_enrollments(id, status)')
    .order('created_at', { ascending: false });

  const all = sequences ?? [];
  const activeCount = all.filter((s) => s.is_active).length;
  const totalEnrollments = all.reduce(
    (sum, s) => sum + (s.email_sequence_enrollments ?? []).length,
    0,
  );

  const triggerLabels: Record<string, string> = locale === 'de'
    ? {
        lead_created: 'Lead erstellt',
        lead_verified: 'Lead verifiziert',
        profile_created: 'Profil erstellt',
        order_completed: 'Bestellung abgeschlossen',
        session_completed: 'Sitzung abgeschlossen',
        tag_added: 'Tag hinzugefügt',
        manual: 'Manuell',
      }
    : {
        lead_created: 'Лид создан',
        lead_verified: 'Лид подтверждён',
        profile_created: 'Профиль создан',
        order_completed: 'Заказ завершён',
        session_completed: 'Сессия завершена',
        tag_added: 'Тег добавлен',
        manual: 'Вручную',
      };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">
            {locale === 'de' ? 'E-Mail Sequenzen' : 'Email-последовательности'}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {locale === 'de'
              ? 'Automatische E-Mail-Serien für Leads und Kunden.'
              : 'Автоматические серии писем для лидов и клиентов.'}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/sequenzen/neu`}
          className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/30 px-4 py-2.5 text-sm font-medium text-gold hover:bg-gold/20 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          {locale === 'de' ? 'Neue Sequenz' : 'Новая последовательность'}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
            {locale === 'de' ? 'Gesamt' : 'Всего'}
          </div>
          <p className="text-2xl font-bold text-white">{all.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-emerald-400/70 text-xs mb-1">
            <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
            {locale === 'de' ? 'Aktiv' : 'Активных'}
          </div>
          <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
            {locale === 'de' ? 'Enrollments' : 'Подписчиков'}
          </div>
          <p className="text-2xl font-bold text-white">{totalEnrollments}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <Zap className="h-3.5 w-3.5" strokeWidth={1.5} />
            {locale === 'de' ? 'Steps gesamt' : 'Шагов всего'}
          </div>
          <p className="text-2xl font-bold text-white">
            {all.reduce((sum, s) => sum + (s.email_sequence_steps ?? []).length, 0)}
          </p>
        </div>
      </div>

      {/* Sequence List */}
      {all.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-12 text-center">
          <Zap className="h-12 w-12 text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/40 text-sm">
            {locale === 'de'
              ? 'Noch keine Sequenzen erstellt.'
              : 'Последовательностей пока нет.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {all.map((seq) => {
            const enrollments = (seq.email_sequence_enrollments ?? []) as { id: string; status: string }[];
            const stepsCount = (seq.email_sequence_steps ?? []).length;
            const activeEnrollments = enrollments.filter((e) => e.status === 'active').length;
            const completedEnrollments = enrollments.filter((e) => e.status === 'completed').length;

            return (
              <Link
                key={seq.id}
                href={`/${locale}/admin/sequenzen/${seq.id}`}
                className="block rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/15 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-medium truncate">{seq.name}</h3>
                      {seq.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                          <Play className="h-3 w-3" strokeWidth={2} />
                          {locale === 'de' ? 'Aktiv' : 'Активна'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-xs text-white/40">
                          <Pause className="h-3 w-3" strokeWidth={2} />
                          {locale === 'de' ? 'Inaktiv' : 'Неактивна'}
                        </span>
                      )}
                    </div>
                    {seq.description && (
                      <p className="text-white/40 text-sm truncate">{seq.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                      <span className="inline-flex items-center gap-1">
                        <Zap className="h-3 w-3" strokeWidth={1.5} />
                        {triggerLabels[seq.trigger_event] ?? seq.trigger_event}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        {stepsCount} {locale === 'de' ? 'Steps' : 'шагов'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs shrink-0">
                    <div className="text-center">
                      <p className="text-white/30 mb-0.5">{locale === 'de' ? 'Aktiv' : 'Акт.'}</p>
                      <p className="text-white font-medium text-lg">{activeEnrollments}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/30 mb-0.5"><CheckCircle className="h-3 w-3 inline" /></p>
                      <p className="text-emerald-400 font-medium text-lg">{completedEnrollments}</p>
                    </div>
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
