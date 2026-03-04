'use client';

import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { MonthDataPoint, NamedValue } from '@/lib/analytics/types';

const GOLD = '#d4af37';
const BLUE = '#60a5fa';
const TOOLTIP_BG = '#0d2d42';

const PIE_COLORS = ['#d4af37', '#60a5fa', '#34d399', '#f87171', '#facc15'];

interface Props {
  customerGrowthByMonth: MonthDataPoint[];
  customersByLanguage: NamedValue[];
  customersByCrmStatus: NamedValue[];
}

export default function CustomerSection({ customerGrowthByMonth, customersByLanguage, customersByCrmStatus }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Growth */}
      <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Kundenwachstum (12 Monate)</h3>
        {customerGrowthByMonth.length === 0 ? (
          <p className="text-white/40 text-sm">Keine Daten.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={customerGrowthByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ background: TOOLTIP_BG, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 13 }}
                formatter={(v) => [String(v), 'Neue Kunden']}
              />
              <Line type="monotone" dataKey="value" stroke={BLUE} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Language + CRM Status */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Sprachen</h3>
          {customersByLanguage.length === 0 ? (
            <p className="text-white/40 text-sm">Keine Daten.</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-24 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={customersByLanguage} dataKey="value" cx="50%" cy="50%" outerRadius={40} innerRadius={20} strokeWidth={0}>
                      {customersByLanguage.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1">
                {customersByLanguage.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-white/60">{item.name}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
          <h3 className="text-sm font-semibold text-white mb-3">CRM Status</h3>
          {customersByCrmStatus.length === 0 ? (
            <p className="text-white/40 text-sm">Keine Daten.</p>
          ) : (
            <div className="space-y-2">
              {customersByCrmStatus.map((item, i) => {
                const total = customersByCrmStatus.reduce((s, c) => s + c.value, 0);
                const pct = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/60">{item.name}</span>
                      <span className="text-white">{item.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
