'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, Eye, Clock, ArrowDownUp, Globe, Monitor, Smartphone,
  Tablet, ExternalLink, Tag,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DayData { date: string; views: number; visitors: number }
interface PageData { page: string; views: number; visitors: number; avgDuration: number }
interface CountItem { count: number }
interface DeviceItem extends CountItem { device: string }
interface BrowserItem extends CountItem { browser: string }
interface OsItem extends CountItem { os: string }
interface ReferrerItem extends CountItem { referrer: string }
interface UtmItem { source: string; medium: string; campaign: string; count: number }
interface LanguageItem extends CountItem { language: string }

interface VisitorData {
  days: number;
  totalPageViews: number;
  uniqueVisitors: number;
  avgDurationSec: number;
  bounceRate: number;
  viewsByDay: DayData[];
  topPages: PageData[];
  deviceStats: DeviceItem[];
  browserStats: BrowserItem[];
  osStats: OsItem[];
  referrerStats: ReferrerItem[];
  utmStats: UtmItem[];
  languageStats: LanguageItem[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GOLD = '#d4af37';
const EMERALD = '#34d399';
const TOOLTIP_BG = '#0d2d42';

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#d4af37',
  mobile: '#34d399',
  tablet: '#60a5fa',
  unknown: '#6b7280',
};

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function shortenPage(path: string): string {
  return path.replace(/^\/(de|ru)\//, '/').replace(/^\//, '') || 'Home';
}

function formatNumber(n: number): string {
  return n.toLocaleString('de-DE');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VisitorSection() {
  const [data, setData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async (d: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/visitors?days=${d}`);
      if (res.ok) {
        const json: VisitorData = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(days);
  }, [days, fetchData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20">
            <Users className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Besucher-Analyse</h2>
            <p className="text-white/40 text-xs">
              {data ? `${formatNumber(data.totalPageViews)} Seitenaufrufe` : 'Lädt...'}
            </p>
          </div>
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
        {!data || data.totalPageViews === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-12 text-center">
            <Eye className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-sm">
              Noch keine Besucher-Daten vorhanden. Daten werden gesammelt, sobald Besucher die Seite nutzen.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ---- KPI Cards ---- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                icon={<Eye className="w-5 h-5 text-[#D4AF37]" />}
                label="Seitenaufrufe"
                value={formatNumber(data.totalPageViews)}
              />
              <KPICard
                icon={<Users className="w-5 h-5 text-[#34d399]" />}
                label="Unique Besucher"
                value={formatNumber(data.uniqueVisitors)}
              />
              <KPICard
                icon={<Clock className="w-5 h-5 text-[#60a5fa]" />}
                label="Ø Verweildauer"
                value={formatDuration(data.avgDurationSec)}
              />
              <KPICard
                icon={<ArrowDownUp className="w-5 h-5 text-[#f59e0b]" />}
                label="Bounce Rate"
                value={`${data.bounceRate}%`}
              />
            </div>

            {/* ---- Visitor Trend Chart ---- */}
            <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Besucher-Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.viewsByDay} margin={{ left: 0, right: 8, top: 4 }}>
                  <defs>
                    <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={EMERALD} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={EMERALD} stopOpacity={0} />
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
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Aufrufe"
                    stroke={GOLD}
                    strokeWidth={2}
                    fill="url(#gradViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    name="Besucher"
                    stroke={EMERALD}
                    strokeWidth={2}
                    fill="url(#gradVisitors)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: GOLD }} />
                  <span className="text-xs text-white/40">Aufrufe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: EMERALD }} />
                  <span className="text-xs text-white/40">Besucher</span>
                </div>
              </div>
            </div>

            {/* ---- Top Pages + Devices Row ---- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Pages Table */}
              <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-sm font-semibold text-white">Beliebteste Seiten</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 px-2 text-white/40 font-medium text-xs">Seite</th>
                        <th className="text-right py-2 px-2 text-white/40 font-medium text-xs">Aufrufe</th>
                        <th className="text-right py-2 px-2 text-white/40 font-medium text-xs">Besucher</th>
                        <th className="text-right py-2 px-2 text-white/40 font-medium text-xs">Ø Dauer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topPages.slice(0, 10).map((p) => (
                        <tr key={p.page} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="py-2 px-2 text-white/80 text-xs font-medium truncate max-w-[180px]">
                            {shortenPage(p.page)}
                          </td>
                          <td className="py-2 px-2 text-right text-[#D4AF37] font-semibold text-xs">
                            {formatNumber(p.views)}
                          </td>
                          <td className="py-2 px-2 text-right text-white/60 text-xs">
                            {formatNumber(p.visitors)}
                          </td>
                          <td className="py-2 px-2 text-right text-white/40 text-xs">
                            {p.avgDuration > 0 ? formatDuration(p.avgDuration) : '–'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Monitor className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-sm font-semibold text-white">Geräte</h3>
                </div>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie
                        data={data.deviceStats}
                        dataKey="count"
                        nameKey="device"
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        strokeWidth={0}
                      >
                        {data.deviceStats.map((d) => (
                          <Cell key={d.device} fill={DEVICE_COLORS[d.device] ?? '#6b7280'} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    {data.deviceStats.map((d) => {
                      const pct = data.totalPageViews > 0
                        ? ((d.count / data.totalPageViews) * 100).toFixed(1)
                        : '0';
                      const Icon = DEVICE_ICONS[d.device] ?? Monitor;
                      return (
                        <div key={d.device} className="flex items-center gap-3">
                          <Icon className="w-4 h-4" style={{ color: DEVICE_COLORS[d.device] ?? '#6b7280' }} />
                          <span className="text-white/70 text-xs capitalize flex-1">{d.device}</span>
                          <span className="text-white/50 text-xs">{pct}%</span>
                          <span className="text-[#D4AF37] font-semibold text-xs w-12 text-right">
                            {formatNumber(d.count)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ---- Browser + OS Row ---- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Browser Stats */}
              <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Browser</h3>
                <ResponsiveContainer width="100%" height={Math.max(data.browserStats.length * 32, 100)}>
                  <BarChart
                    data={data.browserStats.slice(0, 6)}
                    layout="vertical"
                    margin={{ left: 0, right: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="browser"
                      width={70}
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
                      formatter={(value) => [`${value}`, 'Aufrufe']}
                    />
                    <Bar dataKey="count" fill={GOLD} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* OS Stats */}
              <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Betriebssystem</h3>
                <ResponsiveContainer width="100%" height={Math.max(data.osStats.length * 32, 100)}>
                  <BarChart
                    data={data.osStats.slice(0, 6)}
                    layout="vertical"
                    margin={{ left: 0, right: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="os"
                      width={70}
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
                      formatter={(value) => [`${value}`, 'Aufrufe']}
                    />
                    <Bar dataKey="count" fill={EMERALD} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ---- Referrers + UTM Row ---- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Referrer Stats */}
              <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-sm font-semibold text-white">Traffic-Quellen</h3>
                </div>
                {data.referrerStats.length === 0 ? (
                  <p className="text-white/40 text-sm">Noch keine Referrer-Daten.</p>
                ) : (
                  <div className="space-y-2">
                    {data.referrerStats.map((r) => {
                      const pct = data.totalPageViews > 0
                        ? ((r.count / data.totalPageViews) * 100).toFixed(1)
                        : '0';
                      return (
                        <div key={r.referrer} className="flex items-center gap-3">
                          <span className="text-white/70 text-xs flex-1 truncate">{r.referrer}</span>
                          <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#D4AF37]/60 rounded-full"
                              style={{ width: `${Math.min(parseFloat(pct) * 2, 100)}%` }}
                            />
                          </div>
                          <span className="text-[#D4AF37] font-semibold text-xs w-10 text-right">
                            {formatNumber(r.count)}
                          </span>
                          <span className="text-white/30 text-xs w-12 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* UTM Campaign Stats */}
              <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-sm font-semibold text-white">UTM Kampagnen</h3>
                </div>
                {data.utmStats.length === 0 ? (
                  <p className="text-white/40 text-sm">Keine UTM-Daten vorhanden.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 px-2 text-white/40 font-medium text-xs">Source</th>
                          <th className="text-left py-2 px-2 text-white/40 font-medium text-xs">Medium</th>
                          <th className="text-left py-2 px-2 text-white/40 font-medium text-xs">Campaign</th>
                          <th className="text-right py-2 px-2 text-white/40 font-medium text-xs">Aufrufe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.utmStats.map((u, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="py-2 px-2 text-white/80 text-xs">{u.source}</td>
                            <td className="py-2 px-2 text-white/60 text-xs">{u.medium || '–'}</td>
                            <td className="py-2 px-2 text-white/60 text-xs truncate max-w-[120px]">
                              {u.campaign || '–'}
                            </td>
                            <td className="py-2 px-2 text-right text-[#D4AF37] font-semibold text-xs">
                              {formatNumber(u.count)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* ---- Language Stats ---- */}
            {data.languageStats.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Sprachen</h3>
                <div className="flex flex-wrap gap-3">
                  {data.languageStats.map((l) => (
                    <div
                      key={l.language}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
                    >
                      <span className="text-white/70 text-sm uppercase">{l.language}</span>
                      <span className="text-[#D4AF37] font-semibold text-sm">{formatNumber(l.count)}</span>
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
// KPI Card sub-component
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
