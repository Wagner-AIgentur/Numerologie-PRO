import { createClient } from '@/lib/supabase/server';
import { getDateLocale } from '@/lib/i18n/admin';
import { Calendar, ShoppingBag, FileDown, Star, CheckCircle2, Clock, Gift } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adminClient } from '@/lib/supabase/admin';

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { locale } = await params;
  const { payment } = await searchParams;
  const paymentSuccess = payment === 'success';
  const de = locale === 'de';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const [{ data: profile }, { data: orders }, { data: sessions }, { data: deliverables }] =
    await Promise.all([
      supabase.from('profiles').select('full_name, birthdate, referral_code').eq('id', user.id).single(),
      supabase.from('orders').select('id, status, amount_cents, created_at').eq('profile_id', user.id).order('created_at', { ascending: false }).limit(3),
      supabase.from('sessions').select('id, scheduled_at, status, package_type, platform, meeting_link').eq('profile_id', user.id).order('scheduled_at', { ascending: true }).limit(5),
      supabase.from('deliverables').select('id').eq('profile_id', user.id),
    ]);

  // Auto-generate referral code if missing
  let referralCode = profile?.referral_code ?? '';
  if (!referralCode && user) {
    const name = (profile?.full_name?.split(' ')[0] ?? 'USER').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) || 'USER';
    referralCode = `${name}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await adminClient.from('profiles').update({ referral_code: referralCode }).eq('id', user.id);
  }

  // Show sessions that are scheduled — even without a date (pending booking)
  const upcomingSession = sessions?.find((s) => s.status === 'scheduled');
  const pendingBooking = upcomingSession && !upcomingSession.scheduled_at;
  const firstName = profile?.full_name?.split(' ')[0] ?? (de ? 'Willkommen' : 'Добро пожаловать');

  const stats = [
    {
      icon: ShoppingBag,
      label: de ? 'Bestellungen' : 'Заказы',
      value: orders?.length ?? 0,
      href: `/${locale}/dashboard/bestellungen`,
    },
    {
      icon: Calendar,
      label: de ? 'Sitzungen' : 'Сессии',
      value: sessions?.length ?? 0,
      href: `/${locale}/dashboard/sitzungen`,
    },
    {
      icon: FileDown,
      label: de ? 'Unterlagen' : 'Материалы',
      value: deliverables?.length ?? 0,
      href: `/${locale}/dashboard/unterlagen`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">
          {de ? `Hallo, ${firstName}` : `Привет, ${firstName}`} 👋
        </h1>
        <p className="text-white/50 mt-1 text-sm">
          {de ? 'Hier ist dein persönlicher Überblick.' : 'Ваш личный обзор.'}
        </p>
      </div>

      {/* Payment Success Banner */}
      {paymentSuccess && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 flex items-start gap-4">
          <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <h3 className="text-white font-semibold">
              {de ? 'Zahlung erfolgreich!' : 'Оплата прошла успешно!'}
            </h3>
            <p className="text-white/60 text-sm mt-1">
              {de
                ? 'Buche jetzt deinen Beratungstermin — du erhältst eine Bestätigung per E-Mail.'
                : 'Теперь запишись на консультацию — ты получишь подтверждение на почту.'}
            </p>
            <Link
              href={`/${locale}/dashboard/sitzungen`}
              className="text-sm text-gold mt-2 inline-flex items-center gap-1 hover:text-gold/80 transition-colors"
            >
              {de ? 'Zu meinen Sitzungen' : 'К моим сессиям'} →
            </Link>
          </div>
        </div>
      )}

      {/* Upcoming Session Banner */}
      {upcomingSession && (
        <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10 border border-gold/20">
              <Calendar className="h-6 w-6 text-gold" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gold/70 font-medium uppercase tracking-wide mb-1">
                {de ? 'Nächste Sitzung' : 'Следующая сессия'}
              </p>
              <h3 className="text-white font-semibold">
                {upcomingSession.package_type ?? (de ? 'Numerologie-Beratung' : 'Консультация')}
              </h3>
              {upcomingSession.scheduled_at ? (
                <p className="text-white/60 text-sm mt-1">
                  {new Date(upcomingSession.scheduled_at).toLocaleString(
                    getDateLocale(locale),
                    { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }
                  )}
                  {upcomingSession.platform && ` · ${upcomingSession.platform}`}
                </p>
              ) : (
                <p className="text-white/50 text-sm mt-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {de ? 'Termin ausstehend — bitte buche deinen Termin' : 'Время не назначено — пожалуйста, запишись'}
                </p>
              )}
              {upcomingSession.meeting_link && (
                <a
                  href={upcomingSession.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-gold border border-gold/30 rounded-lg px-3 py-1.5 hover:bg-gold/10 transition-colors"
                >
                  {de ? 'Meeting beitreten' : 'Войти в встречу'} →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ icon: Icon, label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5 hover:border-gold/30 hover:bg-gold/5 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-gold/10 group-hover:border-gold/20 transition-colors">
                <Icon className="h-4.5 w-4.5 text-white/50 group-hover:text-gold transition-colors" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-white/50 mt-1">{label}</div>
          </Link>
        ))}
      </div>

      {/* Referral Banner */}
      <Link
        href={`/${locale}/dashboard/empfehlungen`}
        className="block rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/5 via-[rgba(15,48,63,0.4)] to-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5 hover:border-gold/40 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 border border-gold/20 group-hover:bg-gold/15 transition-colors">
            <Gift className="h-5 w-5 text-gold" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white">
              {de ? 'Freunde einladen & 15% sparen' : 'Пригласи друзей и получи скидку 15%'}
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              {de
                ? `Dein Code: `
                : `Твой код: `}
              <span className="font-mono text-gold/80 font-semibold tracking-wider">{referralCode}</span>
              {de ? ' — teile ihn und erhalte einen Gutschein!' : ' — поделись и получи купон!'}
            </p>
          </div>
          <span className="text-xs text-gold/60 group-hover:text-gold transition-colors hidden sm:block">
            {de ? 'Mehr erfahren' : 'Подробнее'} →
          </span>
        </div>
      </Link>

      {/* Recent Orders */}
      {orders && orders.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">
              {de ? 'Letzte Bestellungen' : 'Последние заказы'}
            </h2>
            <Link
              href={`/${locale}/dashboard/bestellungen`}
              className="text-xs text-gold/70 hover:text-gold transition-colors"
            >
              {de ? 'Alle anzeigen' : 'Все →'}
            </Link>
          </div>
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
              >
                <div>
                  <p className="text-sm text-white">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {new Date(order.created_at ?? '').toLocaleDateString(getDateLocale(locale))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {(order.amount_cents / 100).toFixed(2)} €
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'paid'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {order.status === 'paid' ? (de ? 'Bezahlt' : 'Оплачен') : (de ? 'Ausstehend' : 'Ожидание')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!orders || orders.length === 0) && (
        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
          <Star className="h-10 w-10 text-gold/30 mx-auto mb-4" strokeWidth={1} />
          <h3 className="text-white/70 font-medium mb-2">
            {de ? 'Noch keine Bestellungen' : 'Заказов пока нет'}
          </h3>
          <p className="text-white/40 text-sm mb-5">
            {de
              ? 'Entdecke unsere Pakete und starte deine Numerologie-Reise.'
              : 'Изучите наши пакеты и начните свой нумерологический путь.'}
          </p>
          <Link
            href={`/${locale}/pakete`}
            className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-5 py-2.5 text-sm font-medium text-gold hover:bg-gold/10 transition-colors"
          >
            {de ? 'Pakete ansehen' : 'Посмотреть пакеты'} →
          </Link>
        </div>
      )}
    </div>
  );
}
