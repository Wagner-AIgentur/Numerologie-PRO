'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  Calendar, ArrowUpRight, ArrowDownRight, Minus,
  TrendingUp, Users, Mail, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────

interface RevenuePoint {
  period: string;
  revenue_cents: number;
  order_count: number;
}

interface SourceStat {
  source: string;
  total_leads: number;
  verified_leads: number;
  converted_leads: number;
  conversion_rate: number;
}

interface SequenceStat {
  sequence_id: string;
  sequence_name: string;
  total_enrolled: number;
  active_enrolled: number;
  completed: number;
  completion_rate: number;
}

interface Comparison {
  prevRevenueCents: number;
  prevOrders: number;
  prevLeads: number;
  prevConverted: number;
  revenueDelta: number | null;
  ordersDelta: number | null;
  leadsDelta: number | null;
  conversionDelta: number | null;
}

interface AdvancedData {
  revenue: RevenuePoint[];
  granularity: string;
  totalRevenueCents: number;
  totalOrders: number;
  totalLeads: number;
  totalConverted: number;
  sourceStats: SourceStat[];
  sequenceStats: SequenceStat[];
  comparison: Comparison | null;
}

// ─── Translations ──────────────────────────────────

const translations = {
  de: {
    advancedAnalytics: 'Erweiterte Analytik',
    advancedSubtitle: 'Umsatz, Lead-Quellen & Sequenzen im Detail.',
    dateRange: 'Zeitraum',
    compare: 'Vergleichen',
    compareToggle: 'vs. letzter Zeitraum',
    last7d: '7 Tage',
    last30d: '30 Tage',
    last90d: '90 Tage',
    ytd: 'Jahr',
    custom: 'Benutzerdefiniert',
    revenue: 'Umsatz',
    orders: 'Bestellungen',
    leadsTotal: 'Leads gesamt',
    conversions: 'Konversionen',
    revenueChart: 'Umsatzverlauf',
    leadSources: 'Lead-Quellen & Konversion',
    sequencePerformance: 'Sequenz-Performance',
    source: 'Quelle',
    totalLeads: 'Gesamt',
    verified: 'Verifiziert',
    converted: 'Konvertiert',
    conversionRate: 'Konversionsrate',
    sequence: 'Sequenz',
    enrolled: 'Eingeschrieben',
    active: 'Aktiv',
    completed: 'Abgeschlossen',
    completionRate: 'Abschlussrate',
    noData: 'Keine Daten im gewählten Zeitraum.',
    noSequences: 'Keine Sequenzen vorhanden.',
    noSources: 'Keine Lead-Quellen vorhanden.',
    loading: 'Lade Daten...',
    from: 'Von',
    to: 'Bis',
    apply: 'Anwenden',
    vsPrev: 'vs. Vorperiode',
  },
  ru: {
    advancedAnalytics: 'Расширенная аналитика',
    advancedSubtitle: 'Выручка, источники лидов и последовательности.',
    dateRange: 'Период',
    compare: 'Сравнить',
    compareToggle: 'vs. предыдущий период',
    last7d: '7 дней',
    last30d: '30 дней',
    last90d: '90 дней',
    ytd: 'Год',
    custom: 'Свой',
    revenue: 'Выручка',
    orders: 'Заказы',
    leadsTotal: 'Лидов всего',
    conversions: 'Конверсии',
    revenueChart: 'Динамика выручки',
    leadSources: 'Источники лидов и конверсия',
    sequencePerformance: 'Эффективность последовательностей',
    source: 'Источник',
    totalLeads: 'Всего',
    verified: 'Подтв.',
    converted: 'Конверт.',
    conversionRate: 'Конверсия',
    sequence: 'Последовательность',
    enrolled: 'Подписано',
    active: 'Активных',
    completed: 'Завершено',
    completionRate: 'Завершаемость',
    noData: 'Нет данных за выбранный период.',
    noSequences: 'Последовательностей пока нет.',
    noSources: 'Источников лидов пока нет.',
    loading: 'Загрузка данных...',
    from: 'С',
    to: 'По',
    apply: 'Применить',
    vsPrev: 'vs. пред. период',
  },
} as const;

type Preset = '7d' | '30d' | '90d' | 'ytd' | 'custom';

const GOLD = '#d4af37';
const EMERALD = '#34d399';
const TOOLTIP_BG = '#0d2d42';

// ─── Helpers ───────────────────────────────────────

function presetToRange(preset: Preset): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (preset) {
    case '7d':
      start.setDate(end.getDate() - 7);
      break;
    case '30d':
      start.setDate(end.getDate() - 30);
      break;
    case '90d':
      start.setDate(end.getDate() - 90);
      break;
    case 'ytd':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'custom':
      start.setDate(end.getDate() - 30);
      break;
  }
  return { start, end };
}

function formatCurrency(cents: number): string {
  return `${(cents / 100).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} \u20AC`;
}

function formatPeriodLabel(period: string): string {
  // YYYY-MM-DD -> DD.MM
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    const [, m, d] = period.split('-');
    return `${d}.${m}`;
  }
  // YYYY-WIW -> KW xx
  if (/^\d{4}-W\d{2}$/.test(period)) {
    return `KW ${period.split('W')[1]}`;
  }
  // YYYY-MM -> Mon YY
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [y, m] = period.split('-');
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    return `${months[parseInt(m, 10) - 1]} ${y.slice(2)}`;
  }
  return period;
}

// ─── Delta Badge ───────────────────────────────────

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-white/30 text-xs">--</span>;
  const isPositive = delta > 0;
  const isZero = delta === 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium',
        isPositive && 'text-emerald-400',
        !isPositive && !isZero && 'text-red-400',
        isZero && 'text-white/40'
      )}
    >
      {isPositive ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : isZero ? (
        <Minus className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      {isZero ? '0%' : `${delta > 0 ? '+' : ''}${delta}%`}
    </span>
  );
}

// ─── KPI Card ──────────────────────────────────────

function KPICard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: number | null;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/50 text-xs font-medium uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4 text-gold/60" />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {delta !== undefined && <DeltaBadge delta={delta} />}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────

interface Props {
  locale: string;
}

export default function AdvancedAnalyticsShell({ locale }: Props) {
  const t = translations[locale as keyof typeof translations] ?? translations.de;

  const [preset, setPreset] = useState<Preset>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdvancedData | null>(null);

  const presets: Array<{ key: Preset; label: string }> = [
    { key: '7d', label: t.last7d },
    { key: '30d', label: t.last30d },
    { key: '90d', label: t.last90d },
    { key: 'ytd', label: t.ytd },
    { key: 'custom', label: t.custom },
  ];

  const fetchData = useCallback(
    async (p: Preset, cmp: boolean, cStart?: string, cEnd?: string) => {
      setLoading(true);
      try {
        let start: string;
        let end: string;

        if (p === 'custom' && cStart && cEnd) {
          start = new Date(cStart).toISOString();
          end = new Date(cEnd + 'T23:59:59').toISOString();
        } else {
          const range = presetToRange(p);
          start = range.start.toISOString();
          end = range.end.toISOString();
        }

        const params = new URLSearchParams({
          start_date: start,
          end_date: end,
        });
        if (cmp) params.set('compare', 'true');

        const res = await fetch(`/api/admin/analytics/advanced?${params}`);
        if (res.ok) {
          const json: AdvancedData = await res.json();
          setData(json);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handlePresetChange = useCallback(
    (p: Preset) => {
      setPreset(p);
      if (p !== 'custom') {
        fetchData(p, compareEnabled);
      }
    },
    [compareEnabled, fetchData]
  );

  const handleCompareToggle = useCallback(() => {
    const next = !compareEnabled;
    setCompareEnabled(next);
    if (preset !== 'custom' || (customStart && customEnd)) {
      fetchData(preset, next, customStart, customEnd);
    }
  }, [compareEnabled, preset, customStart, customEnd, fetchData]);

  const handleCustomApply = useCallback(() => {
    if (customStart && customEnd) {
      fetchData('custom', compareEnabled, customStart, customEnd);
    }
  }, [customStart, customEnd, compareEnabled, fetchData]);

  // Chart data formatted for recharts
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.revenue.map((r) => ({
      period: formatPeriodLabel(r.period),
      revenue: r.revenue_cents / 100,
      orders: Number(r.order_count),
    }));
  }, [data]);

  return (
    <div className="space-y-6 mt-10">
      {/* ── Header + Controls ── */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-serif text-xl md:text-2xl font-bold text-white">{t.advancedAnalytics}</h2>
          <p className="text-white/50 mt-1 text-sm">{t.advancedSubtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2">
            {presets.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handlePresetChange(key)}
                disabled={loading}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                  preset === key
                    ? 'bg-gold/20 text-gold border border-gold/30'
                    : 'text-white/50 border border-white/10 hover:text-white hover:border-white/20',
                  loading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Compare toggle */}
          <button
            onClick={handleCompareToggle}
            disabled={loading}
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
              compareEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'text-white/40 border-white/10 hover:text-white/60 hover:border-white/20',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {t.compareToggle}
          </button>
        </div>

        {/* Custom date range inputs */}
        {preset === 'custom' && (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">{t.from}</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-gold/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">{t.to}</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-gold/40 focus:outline-none"
              />
            </div>
            <button
              onClick={handleCustomApply}
              disabled={loading || !customStart || !customEnd}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                'bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30',
                (loading || !customStart || !customEnd) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {t.apply}
            </button>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      {loading && !data && (
        <div className="text-center py-12">
          <Calendar className="w-8 h-8 text-gold/40 mx-auto mb-3 animate-pulse" />
          <p className="text-white/40 text-sm">{t.loading}</p>
        </div>
      )}

      {!loading && !data && (
        <div className="text-center py-12">
          <Calendar className="w-8 h-8 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">{t.noData}</p>
        </div>
      )}

      {data && (
        <div className={cn('space-y-6 transition-opacity duration-200', loading && 'opacity-60')}>
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label={t.revenue}
              value={formatCurrency(data.totalRevenueCents)}
              delta={data.comparison?.revenueDelta}
              icon={TrendingUp}
            />
            <KPICard
              label={t.orders}
              value={String(data.totalOrders)}
              delta={data.comparison?.ordersDelta}
              icon={BarChart3}
            />
            <KPICard
              label={t.leadsTotal}
              value={String(data.totalLeads)}
              delta={data.comparison?.leadsDelta}
              icon={Users}
            />
            <KPICard
              label={t.conversions}
              value={String(data.totalConverted)}
              delta={data.comparison?.conversionDelta}
              icon={Mail}
            />
          </div>

          {/* ── Revenue Chart ── */}
          <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
            <h3 className="text-sm font-semibold text-white mb-4">{t.revenueChart}</h3>
            {chartData.length === 0 ? (
              <p className="text-white/40 text-sm">{t.noData}</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}\u20AC`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: TOOLTIP_BG,
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: 13,
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any, name: any) => [
                      name === 'revenue' ? `${Number(v ?? 0).toFixed(0)} \u20AC` : Number(v ?? 0),
                      name === 'revenue' ? t.revenue : t.orders,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={GOLD}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, stroke: GOLD, strokeWidth: 2, fill: TOOLTIP_BG }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke={EMERALD}
                    strokeWidth={1.5}
                    dot={false}
                    strokeDasharray="4 4"
                    activeDot={{ r: 3, stroke: EMERALD, strokeWidth: 2, fill: TOOLTIP_BG }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Lead Source Conversion Table ── */}
          <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
            <h3 className="text-sm font-semibold text-white mb-4">{t.leadSources}</h3>
            {data.sourceStats.length === 0 ? (
              <p className="text-white/40 text-sm">{t.noSources}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white/50 font-medium pb-3 pr-4">{t.source}</th>
                      <th className="text-right text-white/50 font-medium pb-3 px-3">{t.totalLeads}</th>
                      <th className="text-right text-white/50 font-medium pb-3 px-3">{t.verified}</th>
                      <th className="text-right text-white/50 font-medium pb-3 px-3">{t.converted}</th>
                      <th className="text-right text-white/50 font-medium pb-3 pl-3">{t.conversionRate}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sourceStats.map((s) => (
                      <tr key={s.source} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 pr-4">
                          <span className="text-white font-medium">{s.source || '(direkt)'}</span>
                        </td>
                        <td className="py-3 px-3 text-right text-white/70">{s.total_leads}</td>
                        <td className="py-3 px-3 text-right text-white/70">{s.verified_leads}</td>
                        <td className="py-3 px-3 text-right text-white/70">{s.converted_leads}</td>
                        <td className="py-3 pl-3 text-right">
                          <span className={cn(
                            'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                            Number(s.conversion_rate) >= 20
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : Number(s.conversion_rate) >= 5
                              ? 'bg-gold/20 text-gold'
                              : 'bg-white/10 text-white/50'
                          )}>
                            {Number(s.conversion_rate).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Sequence Performance Table ── */}
          <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
            <h3 className="text-sm font-semibold text-white mb-4">{t.sequencePerformance}</h3>
            {data.sequenceStats.length === 0 ? (
              <p className="text-white/40 text-sm">{t.noSequences}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white/50 font-medium pb-3 pr-4">{t.sequence}</th>
                      <th className="text-right text-white/50 font-medium pb-3 px-3">{t.enrolled}</th>
                      <th className="text-right text-white/50 font-medium pb-3 px-3">{t.active}</th>
                      <th className="text-right text-white/50 font-medium pb-3 px-3">{t.completed}</th>
                      <th className="text-right text-white/50 font-medium pb-3 pl-3">{t.completionRate}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sequenceStats.map((s) => (
                      <tr key={s.sequence_id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 pr-4">
                          <span className="text-white font-medium">{s.sequence_name}</span>
                        </td>
                        <td className="py-3 px-3 text-right text-white/70">{s.total_enrolled}</td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-emerald-400">{s.active_enrolled}</span>
                        </td>
                        <td className="py-3 px-3 text-right text-white/70">{s.completed}</td>
                        <td className="py-3 pl-3 text-right">
                          {/* Completion rate bar */}
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gold rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(Number(s.completion_rate), 100)}%` }}
                              />
                            </div>
                            <span className="text-white/60 text-xs w-10 text-right">
                              {Number(s.completion_rate).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Comparison note */}
          {data.comparison && (
            <p className="text-white/30 text-xs text-center">{t.vsPrev}</p>
          )}
        </div>
      )}
    </div>
  );
}
