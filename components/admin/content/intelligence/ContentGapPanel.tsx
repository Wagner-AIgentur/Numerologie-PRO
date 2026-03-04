'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, TrendingUp, Sparkles, Loader2 } from 'lucide-react';

interface GapData {
  own_distribution: Record<string, number>;
  competitor_distribution: Record<string, number>;
  gaps: Array<{
    topic: string;
    competitor_count: number;
    own_count: number;
    funnel_stage: string;
    platform: string;
    avg_engagement: number;
    suggestion: string;
  }>;
  recommendations: string[];
}

const funnelColors: Record<string, string> = {
  tofu: 'text-blue-400',
  mofu: 'text-orange-400',
  bofu: 'text-gold',
  retention: 'text-emerald-400',
};

interface Props {
  locale: string;
  t: Record<string, string>;
  onFillGap?: (topic: string, funnelStage: string) => void;
}

export default function ContentGapPanel({ locale, t, onFillGap }: Props) {
  const [data, setData] = useState<GapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/content/intel/gaps');
      setData(await res.json());
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 text-gold animate-spin" />
      </div>
    );
  }

  if (!data || (data.gaps.length === 0 && data.recommendations.length === 0)) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
        <p className="text-white/30 text-xs">{t.csNoGapsFound ?? 'Keine Content-Gaps gefunden. Scrape zuerst Wettbewerber.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Funnel Distribution Comparison */}
      <div className="rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] p-4 space-y-3">
        <h3 className="text-xs font-medium text-white/60">{t.csFunnelComparison ?? 'Funnel-Vergleich'}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] text-white/30">Eigener Content</span>
            <div className="flex gap-3 mt-1 text-xs">
              {Object.entries(data.own_distribution).map(([stage, count]) => (
                <span key={stage} className={funnelColors[stage]}>
                  {stage.toUpperCase()}: {count}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-white/30">Wettbewerber</span>
            <div className="flex gap-3 mt-1 text-xs">
              {Object.entries(data.competitor_distribution).map(([stage, count]) => (
                <span key={stage} className={funnelColors[stage]}>
                  {stage.toUpperCase()}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="space-y-1.5">
          {data.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-300/80">{rec}</p>
            </div>
          ))}
        </div>
      )}

      {/* Gap List */}
      {data.gaps.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-white/60">{t.csContentGaps ?? 'Content-Gaps'}</h3>
          {data.gaps.map((gap, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] p-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-white font-medium">"{gap.topic}"</span>
                  <span className={cn('text-[10px] px-1 py-0.5 rounded', funnelColors[gap.funnel_stage])}>
                    {gap.funnel_stage.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-white/20">{gap.platform}</span>
                </div>
                <p className="text-[10px] text-white/40">
                  Wettbewerber: {gap.competitor_count} Posts | Du: {gap.own_count} Posts | Ø Engagement: {gap.avg_engagement}
                </p>
              </div>
              {onFillGap && (
                <button
                  onClick={() => onFillGap(gap.topic, gap.funnel_stage)}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold/10 border border-gold/30 text-[10px] text-gold hover:bg-gold/20 transition-colors"
                >
                  <Sparkles className="h-3 w-3" />
                  Lücke füllen
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
