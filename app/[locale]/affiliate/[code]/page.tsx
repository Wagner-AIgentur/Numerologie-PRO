import { Metadata } from 'next';
import { MousePointerClick, ShoppingCart, Euro, TrendingUp } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://numerologie-pro.com';

export const metadata: Metadata = {
  title: 'Affiliate Stats — Numerologie PRO',
  robots: 'noindex, nofollow',
};

interface StatsData {
  name: string;
  is_active: boolean;
  total_clicks: number;
  total_conversions: number;
  commission_eur: string;
  conversion_rate: string;
  member_since: string;
}

async function fetchStats(code: string): Promise<StatsData | null> {
  try {
    const res = await fetch(`${SITE_URL}/api/affiliate/stats?code=${encodeURIComponent(code)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function AffiliateStatsPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  const stats = await fetchStats(code);

  const t = locale === 'ru'
    ? {
        title: 'Партнёрская статистика',
        notFound: 'Партнёр не найден или неактивен.',
        clicks: 'Клики',
        conversions: 'Конверсии',
        commission: 'Комиссия',
        conversionRate: 'Конверсия %',
        memberSince: 'Участник с',
        trackingLink: 'Ваша партнёрская ссылка',
        inactive: 'Этот партнёрский аккаунт неактивен.',
      }
    : {
        title: 'Affiliate Statistik',
        notFound: 'Affiliate nicht gefunden oder inaktiv.',
        clicks: 'Klicks',
        conversions: 'Conversions',
        commission: 'Provision',
        conversionRate: 'Conversion-Rate',
        memberSince: 'Mitglied seit',
        trackingLink: 'Dein Affiliate-Link',
        inactive: 'Dieser Affiliate-Account ist inaktiv.',
      };

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#051a24] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white/40 text-lg">{t.notFound}</p>
        </div>
      </div>
    );
  }

  const trackingLink = `${SITE_URL}/api/affiliate/click?code=${encodeURIComponent(code)}`;

  const statCards = [
    { icon: MousePointerClick, label: t.clicks, value: stats.total_clicks.toLocaleString('de-DE') },
    { icon: ShoppingCart, label: t.conversions, value: stats.total_conversions.toLocaleString('de-DE') },
    { icon: Euro, label: t.commission, value: `${stats.commission_eur} EUR` },
    { icon: TrendingUp, label: t.conversionRate, value: `${stats.conversion_rate}%` },
  ];

  return (
    <div className="min-h-screen bg-[#051a24]">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-bold text-white">{t.title}</h1>
          <p className="text-gold/80 mt-2 text-lg">{stats.name}</p>
          <p className="text-white/30 text-sm mt-1">
            {t.memberSince} {new Date(stats.member_since).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'de-DE')}
          </p>
        </div>

        {!stats.is_active && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-center mb-6">
            {t.inactive}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {statCards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.4)] backdrop-blur-sm p-5 text-center">
              <Icon className="h-6 w-6 text-gold/60 mx-auto mb-2" strokeWidth={1.5} />
              <div className="text-xl font-bold text-white">{value}</div>
              <div className="text-xs text-white/40 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Tracking Link */}
        <div className="rounded-2xl border border-gold/20 bg-[rgba(15,48,63,0.4)] backdrop-blur-sm p-5">
          <p className="text-xs text-white/50 mb-2">{t.trackingLink}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-xl bg-black/30 px-3 py-2 text-sm text-gold/80 font-mono break-all">
              {trackingLink}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
