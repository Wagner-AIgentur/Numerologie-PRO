import { createClient } from '@/lib/supabase/server';
import { getDateLocale } from '@/lib/i18n/admin';
import { Calendar, Video, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PACKAGES, type PackageKey, FREE_CONSULTATION_CAL_PATH } from '@/lib/stripe/products';
import { calPathFromUrl } from '@/components/ui/CalBookingButton';
import DashboardBookButton from './DashboardBookButton';

export default async function SitzungenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const de = locale === 'de';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('profile_id', user.id)
    .order('scheduled_at', { ascending: false });

  const statusConfig = {
    scheduled: {
      icon: Clock,
      label: de ? 'Geplant' : 'Запланировано',
      color: 'text-yellow-400 bg-yellow-500/10',
    },
    completed: {
      icon: CheckCircle2,
      label: de ? 'Abgeschlossen' : 'Завершено',
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    cancelled: {
      icon: XCircle,
      label: de ? 'Storniert' : 'Отменено',
      color: 'text-red-400 bg-red-500/10',
    },
    rescheduled: {
      icon: Clock,
      label: de ? 'Verschoben' : 'Перенесено',
      color: 'text-blue-400 bg-blue-500/10',
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">
          {de ? 'Meine Sitzungen' : 'Мои сессии'}
        </h1>
        <p className="text-white/50 text-sm mt-1">
          {de ? 'Alle deine Beratungsgespräche.' : 'Все ваши консультации.'}
        </p>
      </div>

      {!sessions || sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 sm:p-12 text-center">
          <Calendar className="h-10 w-10 text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/50 mb-4">
            {de ? 'Noch keine Sitzungen gebucht.' : 'Сессий пока нет.'}
          </p>
          <Link
            href={`/${locale}/pakete`}
            className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-5 py-2.5 text-sm font-medium text-gold hover:bg-gold/10 transition-colors"
          >
            {de ? 'Paket buchen' : 'Купить пакет'} →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const config = statusConfig[session.status as keyof typeof statusConfig] ?? statusConfig.scheduled;
            const StatusIcon = config.icon;
            return (
              <div
                key={session.id}
                className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 border border-gold/20">
                      <Calendar className="h-5 w-5 text-gold" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold">
                        {session.package_type ?? (de ? 'Numerologie-Beratung' : 'Консультация')}
                      </h3>
                      {session.scheduled_at ? (
                        <p className="text-white/60 text-sm mt-1">
                          {new Date(session.scheduled_at).toLocaleString(
                            getDateLocale(locale),
                            { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
                          )}
                        </p>
                      ) : session.status === 'scheduled' && !session.cal_booking_id ? (
                        <p className="text-amber-400/80 text-sm mt-1">
                          {de ? 'Termin noch nicht gebucht — bitte buche deinen Termin' : 'Запись ещё не сделана — пожалуйста, запишитесь'}
                        </p>
                      ) : null}
                      {session.platform && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-white/40">
                          <Video className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {session.platform}
                          {session.duration_minutes && ` · ${session.duration_minutes} Min.`}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className={`shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${config.color}`}>
                    <StatusIcon className="h-3.5 w-3.5" strokeWidth={2} />
                    {config.label}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-3 flex-wrap">
                  {/* Rebook button — only if paid but not yet booked (no cal_booking_id) */}
                  {session.status === 'scheduled' && !session.cal_booking_id && !session.scheduled_at && (() => {
                    const pkg = session.package_type ? PACKAGES[session.package_type as PackageKey] : null;
                    const calPath = pkg?.cal_link
                      ? calPathFromUrl(pkg.cal_link)
                      : FREE_CONSULTATION_CAL_PATH;
                    return (
                      <DashboardBookButton
                        calLink={calPath}
                        label={de ? 'Jetzt Termin buchen' : 'Записаться на встречу'}
                      />
                    );
                  })()}
                  {session.status === 'scheduled' && session.meeting_link && (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-4 py-2 text-xs font-medium text-gold hover:bg-gold/10 transition-colors"
                    >
                      <Video className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {de ? 'Meeting beitreten' : 'Войти в встречу'}
                    </a>
                  )}
                  {session.status === 'completed' && session.recording_url && (
                    <a
                      href={session.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      {de ? 'Aufzeichnung ansehen' : 'Посмотреть запись'} →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
