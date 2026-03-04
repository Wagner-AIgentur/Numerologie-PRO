'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Loader2, RefreshCw, Sparkles, TrendingUp,
  AlertTriangle, CheckCircle, Target,
} from 'lucide-react';

interface ContentScore {
  overall: number;
  dimensions: {
    hook_strength: number;
    cta_clarity: number;
    trigger_usage: number;
    funnel_fit: number;
    engagement_prediction: number;
  };
  feedback: {
    hook_strength: string;
    cta_clarity: string;
    trigger_usage: string;
    funnel_fit: string;
    engagement_prediction: string;
  };
  suggestions: string[];
  competitor_benchmark: number | null;
}

interface Props {
  postId?: string;
  content: string;
  funnelStage: string;
  platform: string;
  triggersUsed: string[];
  locale: string;
  t: Record<string, string>;
  onOptimize?: (suggestions: string[]) => void;
}

const DIMENSION_LABELS: Record<string, { label: string; icon: typeof Target }> = {
  hook_strength: { label: 'Hook', icon: Sparkles },
  cta_clarity: { label: 'CTA', icon: Target },
  trigger_usage: { label: 'Trigger', icon: TrendingUp },
  funnel_fit: { label: 'Funnel-Fit', icon: CheckCircle },
  engagement_prediction: { label: 'Engagement', icon: TrendingUp },
};

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-emerald-400';
  if (score >= 40) return 'bg-yellow-400';
  return 'bg-red-400';
}

function getScoreRingColor(score: number): string {
  if (score >= 70) return 'stroke-emerald-400';
  if (score >= 40) return 'stroke-yellow-400';
  return 'stroke-red-400';
}

export default function ContentScoreCard({
  postId, content, funnelStage, platform, triggersUsed, locale, t, onOptimize,
}: Props) {
  const [score, setScore] = useState<ContentScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const lastContentRef = useRef<string>('');

  const fetchScore = useCallback(async () => {
    if (!content || content.trim().length < 20) {
      setScore(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let res: Response;

      if (postId) {
        res = await fetch(`/api/admin/content/posts/${postId}/score`, { method: 'POST' });
      } else {
        res = await fetch('/api/admin/content/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            funnel_stage: funnelStage,
            platform,
            triggers_used: triggersUsed,
          }),
        });
      }

      if (!res.ok) throw new Error(`Score failed: ${res.status}`);
      const data = await res.json();
      setScore(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scoring fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }, [content, funnelStage, platform, triggersUsed, postId]);

  // Auto-score on content change (debounced 2s)
  useEffect(() => {
    if (content === lastContentRef.current) return;
    lastContentRef.current = content;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchScore();
    }, 2000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content, fetchScore]);

  // Score Ring SVG
  const ringSize = 80;
  const strokeWidth = 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const scoreOffset = score ? circumference - (score.overall / 100) * circumference : circumference;

  return (
    <div className="rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-white/60 flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
          {t.contentScore ?? 'Content Score'}
        </h3>
        <button
          onClick={fetchScore}
          disabled={loading || !content || content.trim().length < 20}
          className="p-1 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30"
          title="Erneut bewerten"
        >
          <RefreshCw className={cn('h-3.5 w-3.5 text-white/30', loading && 'animate-spin')} strokeWidth={1.5} />
        </button>
      </div>

      {/* Loading State */}
      {loading && !score && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 text-gold animate-spin" />
          <span className="text-xs text-white/30 ml-2">Bewerte Content...</span>
        </div>
      )}

      {/* No Content State */}
      {!loading && !score && !error && (
        <div className="text-center py-6">
          <p className="text-[11px] text-white/20">
            {t.scoreHint ?? 'Schreibe mindestens 20 Zeichen für eine Bewertung'}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 py-2">
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
          <span className="text-[11px] text-yellow-300">{error}</span>
        </div>
      )}

      {/* Score Display */}
      {score && (
        <>
          {/* Score Ring + Overall */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <svg width={ringSize} height={ringSize} className="transform -rotate-90">
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  className="stroke-white/10"
                />
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={scoreOffset}
                  strokeLinecap="round"
                  className={cn('transition-all duration-1000', getScoreRingColor(score.overall))}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn('text-lg font-bold', getScoreColor(score.overall))}>
                  {score.overall}
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs text-white/60 mb-1">
                {score.overall >= 70 ? 'Guter Content!' : score.overall >= 40 ? 'Verbesserungspotenzial' : 'Überarbeitung empfohlen'}
              </div>
              {score.competitor_benchmark !== null && (
                <div className="text-[10px] text-white/30">
                  Competitor-Durchschnitt: <span className="text-white/50">{score.competitor_benchmark}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dimension Bars */}
          <div className="space-y-2.5">
            {Object.entries(score.dimensions).map(([key, value]) => {
              const config = DIMENSION_LABELS[key];
              const feedback = score.feedback[key as keyof typeof score.feedback];
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-white/40">{config?.label ?? key}</span>
                    <span className={cn('text-[10px] font-medium', getScoreColor(value))}>{value}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', getScoreBarColor(value))}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  {feedback && (
                    <p className="text-[9px] text-white/25 mt-0.5 line-clamp-1">{feedback}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Suggestions */}
          {score.suggestions.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-gold/60 font-medium">Verbesserungen:</span>
              {score.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-[10px] text-gold/40 mt-0.5">{i + 1}.</span>
                  <p className="text-[10px] text-white/40 leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          )}

          {/* Optimize Button */}
          {onOptimize && score.suggestions.length > 0 && (
            <button
              onClick={() => onOptimize(score.suggestions)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gold/10 border border-gold/30 text-xs text-gold hover:bg-gold/20 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              {t.optimize ?? 'Mit Vorschlägen optimieren'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
