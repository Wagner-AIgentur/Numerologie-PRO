'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { MousePointerClick, Flame, Eye, Layers } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PageStat {
  page: string;
  count: number;
}

interface TopElement {
  tag: string;
  text: string | null;
  href: string | null;
  count: number;
}

interface SectionStat {
  section: string;
  count: number;
}

interface HeatmapData {
  days: number;
  selectedPage: string | null;
  totalClicks: number;
  pageStats: PageStat[];
  topElements: TopElement[];
  heatGrid: number[][];
  sectionStats: SectionStat[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GOLD = '#d4af37';
const TOOLTIP_BG = '#0d2d42';

const TAG_LABELS: Record<string, string> = {
  a: 'Link',
  button: 'Button',
  input: 'Input',
  img: 'Bild',
  div: 'Bereich',
  span: 'Text',
  h1: 'Überschrift',
  h2: 'Überschrift',
  h3: 'Überschrift',
  p: 'Absatz',
  svg: 'Icon',
  path: 'Icon',
  label: 'Label',
  select: 'Dropdown',
  textarea: 'Textfeld',
};

// Heat colors: transparent → gold → orange → red
function heatColor(value: number, max: number): string {
  if (max === 0 || value === 0) return 'rgba(212, 175, 55, 0.03)';
  const ratio = value / max;
  if (ratio < 0.25) return `rgba(212, 175, 55, ${0.1 + ratio * 0.6})`;
  if (ratio < 0.5) return `rgba(230, 160, 30, ${0.3 + ratio * 0.5})`;
  if (ratio < 0.75) return `rgba(240, 120, 20, ${0.5 + ratio * 0.4})`;
  return `rgba(220, 50, 30, ${0.7 + ratio * 0.3})`;
}

function shortenPage(path: string): string {
  return path.replace(/^\/(de|ru)\//, '/').replace(/^\//, '') || 'Home';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HeatmapSection() {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  const fetchData = useCallback(async (d: number, page: string | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ days: String(d) });
      if (page) params.set('page', page);
      const res = await fetch(`/api/admin/analytics/heatmap?${params}`);
      if (res.ok) {
        const json: HeatmapData = await res.json();
        setData(json);
        if (!page && json.selectedPage) setSelectedPage(json.selectedPage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(days, selectedPage);
  }, [days, selectedPage, fetchData]);

  const gridMax = data
    ? Math.max(...data.heatGrid.flat(), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20">
            <MousePointerClick className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Click-Heatmap</h2>
            <p className="text-white/40 text-xs">
              {data ? `${data.totalClicks.toLocaleString('de-DE')} Klicks` : 'Lädt...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Day selector */}
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

          {/* Page selector */}
          {data && data.pageStats.length > 0 && (
            <select
              value={selectedPage ?? ''}
              onChange={(e) => setSelectedPage(e.target.value || null)}
              className="text-xs bg-white/5 border border-white/10 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]/50"
            >
              {data.pageStats.map((p) => (
                <option key={p.page} value={p.page} className="bg-[#0a1929]">
                  {shortenPage(p.page)} ({p.count})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className={`transition-opacity duration-200 ${loading ? 'opacity-50' : ''}`}>
        {!data || data.totalClicks === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-12 text-center">
            <Eye className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-sm">
              Noch keine Click-Daten vorhanden. Daten werden gesammelt, sobald Besucher die Seite nutzen.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ---- Page Ranking (Bar Chart) ---- */}
            <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-semibold text-white">Beliebteste Seiten</h3>
              </div>
              <ResponsiveContainer width="100%" height={Math.max(data.pageStats.length * 36, 120)}>
                <BarChart
                  data={data.pageStats.slice(0, 10).map((p) => ({
                    name: shortenPage(p.page),
                    clicks: p.count,
                  }))}
                  layout="vertical"
                  margin={{ left: 0, right: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
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
                    formatter={(value) => [`${value} Klicks`, '']}
                  />
                  <Bar dataKey="clicks" fill={GOLD} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ---- Visual Heatmap Grid ---- */}
            <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-sm font-semibold text-white">Klick-Verteilung</h3>
                </div>
                <span className="text-xs text-white/30">
                  {selectedPage ? shortenPage(selectedPage) : ''}
                </span>
              </div>

              {/* Grid */}
              <div className="relative aspect-[3/4] w-full max-w-[300px] mx-auto rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
                {/* Page structure labels */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2 py-2">
                  <span className="text-[9px] text-white/20 uppercase tracking-wider">Header</span>
                  <span className="text-[9px] text-white/20 uppercase tracking-wider text-center">Mitte</span>
                  <span className="text-[9px] text-white/20 uppercase tracking-wider">Footer</span>
                </div>

                {/* Heat cells */}
                <div className="absolute inset-0 grid grid-rows-[repeat(10,1fr)] grid-cols-[repeat(10,1fr)]">
                  {data.heatGrid.map((row, rowIdx) =>
                    row.map((value, colIdx) => (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className="transition-colors duration-300"
                        style={{ backgroundColor: heatColor(value, gridMax) }}
                        title={`${value} Klick${value !== 1 ? 's' : ''}`}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-1 mt-3">
                <span className="text-[10px] text-white/30">Wenig</span>
                <div className="flex gap-0.5">
                  {[0.05, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => (
                    <div
                      key={ratio}
                      className="w-4 h-2 rounded-sm"
                      style={{ backgroundColor: heatColor(ratio * 100, 100) }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-white/30">Viel</span>
              </div>
            </div>

            {/* ---- Top Elements Table ---- */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-semibold text-white">Meistgeklickte Elemente</h3>
                <span className="text-xs text-white/30 ml-auto">
                  {selectedPage ? shortenPage(selectedPage) : 'Alle Seiten'}
                </span>
              </div>

              {data.topElements.length === 0 ? (
                <p className="text-white/40 text-sm">Keine Daten.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 px-3 text-white/40 font-medium text-xs">#</th>
                        <th className="text-left py-2 px-3 text-white/40 font-medium text-xs">Element</th>
                        <th className="text-left py-2 px-3 text-white/40 font-medium text-xs">Typ</th>
                        <th className="text-left py-2 px-3 text-white/40 font-medium text-xs">Link</th>
                        <th className="text-right py-2 px-3 text-white/40 font-medium text-xs">Klicks</th>
                        <th className="text-right py-2 px-3 text-white/40 font-medium text-xs">Anteil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topElements.map((el, i) => {
                        const pageTotal = data.topElements.reduce((s, e) => s + e.count, 0);
                        const pct = pageTotal > 0 ? ((el.count / pageTotal) * 100).toFixed(1) : '0';
                        return (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="py-2.5 px-3 text-white/30 text-xs">{i + 1}</td>
                            <td className="py-2.5 px-3">
                              <span className="text-white/80 text-xs font-medium">
                                {el.text || el.href || `<${el.tag}>`}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/50">
                                {TAG_LABELS[el.tag] ?? el.tag}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-white/30 text-xs max-w-[200px] truncate">
                              {el.href ?? '–'}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="text-[#D4AF37] font-semibold text-sm">{el.count}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#D4AF37]/60 rounded-full"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-white/40 text-xs w-10 text-right">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ---- Section Stats ---- */}
            {data.sectionStats.length > 0 && (
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-sm font-semibold text-white">Klicks nach Bereich</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {data.sectionStats.map((s) => (
                    <div
                      key={s.section}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
                    >
                      <span className="text-white/70 text-sm capitalize">{s.section}</span>
                      <span className="text-[#D4AF37] font-semibold text-sm">{s.count}</span>
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
