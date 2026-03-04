'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  BarChart3, Users, UserPlus, Eye, Clock, TrendingUp,
  Globe, MapPin, Radio,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RealtimeData {
  activeUsers: number;
  topPages: { page: string; users: number }[];
}

interface Overview {
  totalSessions: number;
  totalUsers: number;
  newUsers: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  engagementRate: number;
}

interface DayData { date: string; sessions: number; users: number; pageViews: number }
interface CountryData { country: string; sessions: number; users: number }
interface CityData { city: string; sessions: number; users: number }
interface ChannelData { channel: string; sessions: number; users: number }

interface GA4Data {
  days: number;
  realtime: RealtimeData;
  overview: Overview;
  dailyTrend: DayData[];
  countries: CountryData[];
  cities: CityData[];
  channels: ChannelData[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GOLD = '#d4af37';
const EMERALD = '#34d399';
const BLUE = '#60a5fa';
const TOOLTIP_BG = '#0d2d42';

const CHANNEL_COLORS: Record<string, string> = {
  'Organic Search': '#34d399',
  'Direct': '#d4af37',
  'Organic Social': '#a78bfa',
  'Paid Search': '#f59e0b',
  'Referral': '#60a5fa',
  'Email': '#f472b6',
  'Paid Social': '#fb923c',
  'Display': '#e879f9',
  'Unassigned': '#6b7280',
};

function formatNumber(n: number): string {
  return n.toLocaleString('de-DE');
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GA4Section() {
  const [data, setData] = useState<GA4Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const realtimeTimer = useRef<ReturnType<typeof setInterval>>();

  const fetchData = useCallback(async (d: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics/ga4?days=${d}`);
      if (res.status === 503) {
        setError('GA4 nicht konfiguriert. Bitte Service Account Credentials in den Env-Vars hinterlegen.');
        setData(null);
        return;
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.details ?? 'GA4 API Fehler');
        setData(null);
        return;
      }
      const json: GA4Data = await res.json();
      setData(json);
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + refetch on days change
  useEffect(() => {
    fetchData(days);
  }, [days, fetchData]);

  // Auto-refresh realtime every 30s
  useEffect(() => {
    realtimeTimer.current = setInterval(() => {
      fetch(`/api/admin/analytics/ga4?days=${days}`)
        .then((r) => r.ok ? r.json() : null)
        .then((json: GA4Data | null) => {
          if (json) setData((prev) => prev ? { ...prev, realtime: json.realtime } : json);
        })
        .catch(() => {});
    }, 30000);

    return () => {
      if (realtimeTimer.current) clearInterval(realtimeTimer.current);
    };
  }, [days]);

  // Error state — GA4 not configured
  if (error && !data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20">
            <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <h2 className="text-lg font-semibold text-white">Google Analytics 4</h2>
        </div>
        <p className="text-white/40 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20">
            <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Google Analytics 4</h2>
            <p className="text-white/40 text-xs">
              {data ? `${formatNumber(data.overview.totalSessions)} Sessions` : 'Lädt...'}
            </p>
          </div>

          {/* Realtime Badge */}
          {data && (
            <div className="flex items-center gap-2 ml-4 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 text-xs font-medium">
                {data.realtime.activeUsers} aktiv
              </span>
            </div>
          )}
        </div>

        <div className="flex rounded-lg border border-white/10 overflow-hidden">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                days === d
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className={`transition-opacity duration-200 ${loading ? 'opacity-50' : ''}`}>
        {!data ? (
          <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-12 text-center">
            <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-sm">GA4-Daten werden geladen...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ---- KPI Cards ---- */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <KPICard
                icon={<Radio className="w-5 h-5 text-[#D4AF37]" />}
                label="Sessions"
                value={formatNumber(data.overview.totalSessions)}
              />
              <KPICard
                icon={<Users className="w-5 h-5 text-[#34d399]" />}
                label="Nutzer"
                value={formatNumber(data.overview.totalUsers)}
              />
              <KPICard
                icon={<UserPlus className="w-5 h-5 text-[#60a5fa]" />}
                label="Neue Nutzer"
                value={formatNumber(data.overview.newUsers)}
              />
              <KPICard
                icon={<Eye className="w-5 h-5 text-[#a78bfa]" />}
                label="Seitenaufrufe"
                value={formatNumber(data.overview.pageViews)}
              />
              <KPICard
                icon={<Clock className="w-5 h-5 text-[#f59e0b]" />}
                label="Ø Sitzungsdauer"
                value={formatDuration(data.overview.avgSessionDuration)}
              />
              <KPICard
                icon={<TrendingUp className="w-5 h-5 text-[#34d399]" />}
                label="Engagement"
                value={`${data.overview.engagementRate}%`}
              />
            </div>

            {/* ---- Daily Trend Chart ---- */}
            <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
              <h3 className="text-sm font-semibold text-white mb-4">GA4 Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.dailyTrend} margin={{ left: 0, right: 8, top: 4 }}>
                  <defs>
                    <linearGradient id="ga4GradSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ga4GradUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={EMERALD} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={EMERALD} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ga4GradPV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BLUE} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    tickFormatter={(d: string) => d.slice(5)}
                  />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: TOOLTIP_BG,
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#fff',
                    }}
                  />
                  <Area type="monotone" dataKey="pageViews" name="Aufrufe" stroke={BLUE} strokeWidth={1.5} fill="url(#ga4GradPV)" />
                  <Area type="monotone" dataKey="sessions" name="Sessions" stroke={GOLD} strokeWidth={2} fill="url(#ga4GradSessions)" />
                  <Area type="monotone" dataKey="users" name="Nutzer" stroke={EMERALD} strokeWidth={2} fill="url(#ga4GradUsers)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-2">
                {[
                  { color: GOLD, label: 'Sessions' },
                  { color: EMERALD, label: 'Nutzer' },
                  { color: BLUE, label: 'Aufrufe' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-xs text-white/40">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ---- Channels + Countries Row ---- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Acquisition Channels */}
              <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-sm font-semibold text-white">Akquisitionskanäle</h3>
                </div>
                <ResponsiveContainer width="100%" height={Math.max(data.channels.length * 36, 120)}>
                  <BarChart
                    data={data.channels.slice(0, 8)}
                    layout="vertical"
                    margin={{ left: 0, right: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="channel"
                      width={120}
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: TOOLTIP_BG,
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#fff',
                      }}
                      formatter={(value) => [`${value} Sessions`, '']}
                    />
                    <Bar
                      dataKey="sessions"
                      radius={[0, 4, 4, 0]}
                      fill={GOLD}
                    >
                      {data.channels.slice(0, 8).map((c) => (
                        <rect key={c.channel} fill={CHANNEL_COLORS[c.channel] ?? GOLD} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Countries */}
              <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-sm font-semibold text-white">Top Länder</h3>
                </div>
                <ResponsiveContainer width="100%" height={Math.max(data.countries.length * 36, 120)}>
                  <BarChart
                    data={data.countries.slice(0, 8)}
                    layout="vertical"
                    margin={{ left: 0, right: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="country"
                      width={90}
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: TOOLTIP_BG,
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#fff',
                      }}
                      formatter={(value) => [`${value} Sessions`, '']}
                    />
                    <Bar dataKey="sessions" fill={EMERALD} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ---- Cities + Channel Table Row ---- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Cities */}
              <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-sm font-semibold text-white">Top Städte</h3>
                </div>
                {data.cities.length === 0 ? (
                  <p className="text-white/40 text-sm">Keine Städte-Daten.</p>
                ) : (
                  <div className="space-y-2">
                    {data.cities.slice(0, 10).map((c) => {
                      const maxSessions = data.cities[0]?.sessions ?? 1;
                      const pct = (c.sessions / maxSessions) * 100;
                      return (
                        <div key={c.city} className="flex items-center gap-3">
                          <span className="text-white/70 text-xs flex-1 truncate">{c.city}</span>
                          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#D4AF37]/60 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[#D4AF37] font-semibold text-xs w-12 text-right">
                            {formatNumber(c.sessions)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Channel Detail Table */}
              <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-sm font-semibold text-white">Kanal-Details</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 px-2 text-white/40 font-medium text-xs">Kanal</th>
                        <th className="text-right py-2 px-2 text-white/40 font-medium text-xs">Sessions</th>
                        <th className="text-right py-2 px-2 text-white/40 font-medium text-xs">Nutzer</th>
                        <th className="text-right py-2 px-2 text-white/40 font-medium text-xs">Anteil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.channels.map((ch) => {
                        const pct = data.overview.totalSessions > 0
                          ? ((ch.sessions / data.overview.totalSessions) * 100).toFixed(1)
                          : '0';
                        return (
                          <tr key={ch.channel} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: CHANNEL_COLORS[ch.channel] ?? GOLD }}
                                />
                                <span className="text-white/80 text-xs">{ch.channel}</span>
                              </div>
                            </td>
                            <td className="py-2 px-2 text-right text-[#D4AF37] font-semibold text-xs">
                              {formatNumber(ch.sessions)}
                            </td>
                            <td className="py-2 px-2 text-right text-white/60 text-xs">
                              {formatNumber(ch.users)}
                            </td>
                            <td className="py-2 px-2 text-right text-white/40 text-xs">{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ---- Realtime Active Pages ---- */}
            {data.realtime.topPages.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <h3 className="text-sm font-semibold text-white">Echtzeit — Aktive Seiten</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {data.realtime.topPages.map((p) => (
                    <div
                      key={p.page}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
                    >
                      <span className="text-white/70 text-sm">{p.page}</span>
                      <span className="text-emerald-400 font-semibold text-sm">{p.users}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KPICard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-white/40">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
