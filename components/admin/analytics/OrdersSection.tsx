'use client';

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { DayDataPoint, NamedValue } from '@/lib/analytics/types';

const GOLD = '#d4af37';
const TOOLTIP_BG = '#0d2d42';
const STATUS_COLORS: Record<string, string> = {
  Bezahlt: '#34d399',
  Ausstehend: '#facc15',
  Erstattet: '#60a5fa',
  Storniert: '#f87171',
};

interface Props {
  ordersByDay: DayDataPoint[];
  ordersByStatus: NamedValue[];
  topProducts: NamedValue[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

export default function OrdersSection({ ordersByDay, ordersByStatus, topProducts }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Order Trend */}
      <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Bestellungen (30 Tage)</h3>
        {ordersByDay.length === 0 ? (
          <p className="text-white/40 text-sm">Keine Daten.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ordersByDay}>
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
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ background: TOOLTIP_BG, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 13 }}
                labelFormatter={(label) => formatDate(String(label))}
                formatter={(v) => [String(v), 'Bestellungen']}
              />
              <Bar dataKey="value" fill={GOLD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Status + Top Products */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Status</h3>
          {ordersByStatus.length === 0 ? (
            <p className="text-white/40 text-sm">Keine Daten.</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-24 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ordersByStatus} dataKey="value" cx="50%" cy="50%" outerRadius={40} innerRadius={20} strokeWidth={0}>
                      {ordersByStatus.map((item) => (
                        <Cell key={item.name} fill={STATUS_COLORS[item.name] ?? '#666'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1">
                {ordersByStatus.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[item.name] ?? '#666' }} />
                    <span className="text-white/60">{item.name}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Top Produkte</h3>
          {topProducts.length === 0 ? (
            <p className="text-white/40 text-sm">Keine Daten.</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <span className="text-white/60 truncate max-w-[160px]">{i + 1}. {p.name}</span>
                  <span className="text-white font-medium shrink-0">{p.value}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
