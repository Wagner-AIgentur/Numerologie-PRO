'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { DayDataPoint, NamedValue } from '@/lib/analytics/types';

const GOLD = '#d4af37';
const EMERALD = '#34d399';
const TOOLTIP_BG = '#0d2d42';

interface Props {
  revenueByDay: DayDataPoint[];
  revenueByProduct: NamedValue[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

export default function RevenueSection({ revenueByDay, revenueByProduct }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Umsatzverlauf (30 Tage)</h3>
        {revenueByDay.length === 0 ? (
          <p className="text-white/40 text-sm">Keine Daten.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}€`}
              />
              <Tooltip
                contentStyle={{ background: TOOLTIP_BG, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 13 }}
                labelFormatter={(label) => formatDate(String(label))}
                formatter={(v) => [`${Number(v).toFixed(0)} €`, 'Umsatz']}
              />
              <Line type="monotone" dataKey="value" stroke={GOLD} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Revenue by Product */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Umsatz nach Produkt</h3>
        {revenueByProduct.length === 0 ? (
          <p className="text-white/40 text-sm">Keine Daten.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByProduct} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}€`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={120}
              />
              <Tooltip
                contentStyle={{ background: TOOLTIP_BG, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 13 }}
                formatter={(v) => [`${Number(v).toFixed(0)} €`, 'Umsatz']}
              />
              <Bar dataKey="value" fill={EMERALD} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
