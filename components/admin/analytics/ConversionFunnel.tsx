'use client';

import type { FunnelStep } from '@/lib/analytics/types';

const COLORS = ['#60a5fa', '#d4af37', '#34d399'];

interface Props {
  funnel: FunnelStep[];
}

export default function ConversionFunnel({ funnel }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
      <h3 className="text-sm font-semibold text-white mb-6">Conversion Funnel</h3>
      {funnel.length === 0 ? (
        <p className="text-white/40 text-sm">Keine Daten.</p>
      ) : (
        <div className="space-y-3">
          {funnel.map((step, i) => (
            <div key={step.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white/70">{step.label}</span>
                <span className="text-white font-medium">{step.value} ({step.percentage}%)</span>
              </div>
              <div className="h-8 rounded-xl bg-white/5 overflow-hidden relative">
                <div
                  className="h-full rounded-xl transition-all duration-700 flex items-center justify-end pr-3"
                  style={{
                    width: `${Math.max(step.percentage, 3)}%`,
                    background: COLORS[i % COLORS.length],
                    opacity: 0.8,
                  }}
                >
                  {step.percentage >= 15 && (
                    <span className="text-xs font-bold text-white/90">{step.percentage}%</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
