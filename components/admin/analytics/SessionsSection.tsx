'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { SessionStats } from '@/lib/analytics/types';

const STATUS_COLORS: Record<string, string> = {
  Geplant: '#60a5fa',
  Bestätigt: '#d4af37',
  Abgeschlossen: '#34d399',
  Storniert: '#f87171',
  Ausstehend: '#facc15',
  Verschoben: '#a78bfa',
};

const TYPE_COLORS: Record<string, string> = {
  Bezahlt: '#34d399',
  Kostenlos: '#60a5fa',
};

interface Props {
  sessionStats: SessionStats;
}

export default function SessionsSection({ sessionStats }: Props) {
  const { total, byStatus, byType } = sessionStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* By Status */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Sitzungen nach Status</h3>
        <p className="text-2xl font-bold text-white mb-4">{total} gesamt</p>
        {byStatus.length === 0 ? (
          <p className="text-white/40 text-sm">Keine Daten.</p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byStatus} dataKey="value" cx="50%" cy="50%" outerRadius={50} innerRadius={25} strokeWidth={0}>
                    {byStatus.map((item) => (
                      <Cell key={item.name} fill={STATUS_COLORS[item.name] ?? '#666'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {byStatus.map((item) => (
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

      {/* By Type */}
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Kostenlos vs. Bezahlt</h3>
        {byType.length === 0 ? (
          <p className="text-white/40 text-sm">Keine Daten.</p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byType} dataKey="value" cx="50%" cy="50%" outerRadius={50} innerRadius={25} strokeWidth={0}>
                    {byType.map((item) => (
                      <Cell key={item.name} fill={TYPE_COLORS[item.name] ?? '#666'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {byType.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLORS[item.name] ?? '#666' }} />
                  <span className="text-white/60">{item.name}</span>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
