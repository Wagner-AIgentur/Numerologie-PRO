'use client';

import type { CouponStat } from '@/lib/analytics/types';

interface Props {
  couponStats: CouponStat[];
}

export default function CouponsSection({ couponStats }: Props) {
  if (couponStats.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Gutschein-Performance</h3>
        <p className="text-white/40 text-sm">Keine Gutscheine vorhanden.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Gutschein-Performance</h3>
      <div className="space-y-3">
        {couponStats.map((c) => {
          const pct = c.maxUses ? Math.min((c.usedCount / c.maxUses) * 100, 100) : 0;
          return (
            <div key={c.code} className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono text-gold font-medium">{c.code}</span>
                  <span className="text-xs text-white/40">
                    {c.type === 'percent' ? `${c.discountValue}%` : `${c.discountValue}€`}
                  </span>
                  {!c.active && (
                    <span className="text-xs text-red-400/70 bg-red-400/10 px-1.5 py-0.5 rounded">inaktiv</span>
                  )}
                </div>
                {c.maxUses ? (
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gold/70 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                ) : (
                  <div className="h-1.5 rounded-full bg-white/5" />
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-medium text-white">{c.usedCount}</span>
                <span className="text-xs text-white/40">
                  {c.maxUses ? ` / ${c.maxUses}` : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
