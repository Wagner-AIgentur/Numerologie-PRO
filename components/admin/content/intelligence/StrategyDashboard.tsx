'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  TrendingUp, Sparkles, BarChart3, Loader2,
  ArrowRight, Bookmark, Star, Zap, Target,
  Calendar, Clock, Instagram, Youtube, Globe, Play, Facebook,
} from 'lucide-react';

interface IntelEntry {
  id: string;
  competitor_id: string;
  source_platform: string;
  content: string;
  engagement_data: Record<string, number> | null;
  ai_summary: string | null;
  ai_funnel_stage: string | null;
  ai_triggers_detected: string[] | null;
  ai_hook_analysis: string | null;
  content_format: string | null;
  posted_at: string | null;
  is_bookmarked: boolean;
}

interface Competitor {
  id: string;
  name: string;
  social_accounts: Record<string, string>;
  intel_count?: number;
}

interface ContentGap {
  topic: string;
  funnel_stage: string;
  suggestion: string;
  avg_engagement: number;
}

interface Props {
  locale: string;
  t: Record<string, string>;
  competitors: Competitor[];
  onGenerateContent?: (context: { topic?: string; funnel_stage?: string; inspiration_id?: string }) => void;
}

const platformIcons: Record<string, typeof Globe> = {
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Play,
  facebook: Facebook,
  website: Globe,
};

const funnelColors: Record<string, string> = {
  tofu: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  mofu: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  bofu: 'bg-gold/10 border-gold/20 text-gold',
  retention: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
};

function totalEngagement(data: Record<string, number> | null): number {
  if (!data) return 0;
  return (data.likes ?? 0) + (data.comments ?? 0) + (data.shares ?? 0) + (data.views ?? 0) * 0.01;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function StrategyDashboard({ locale, t, competitors, onGenerateContent }: Props) {
  const [topPosts, setTopPosts] = useState<IntelEntry[]>([]);
  const [gaps, setGaps] = useState<ContentGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'top' | 'formula' | 'compare' | 'ideas'>('top');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [intelRes, gapsRes] = await Promise.all([
        fetch('/api/admin/content/intel?limit=20'),
        fetch('/api/admin/content/intel/gaps'),
      ]);

      const intelData = await intelRes.json();
      const gapsData = await gapsRes.json();

      // Sort by engagement
      const posts = (intelData.data ?? []) as IntelEntry[];
      posts.sort((a, b) => totalEngagement(b.engagement_data) - totalEngagement(a.engagement_data));
      setTopPosts(posts.slice(0, 10));

      setGaps((gapsData.gaps ?? []) as ContentGap[]);
    } catch (err) {
      console.error('[StrategyDashboard] Load failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Compute competitor comparison data
  const comparisonData = competitors.map((comp) => {
    const compPosts = topPosts.filter((p) => p.competitor_id === comp.id);
    const avgEng = compPosts.length > 0
      ? Math.round(compPosts.reduce((sum, p) => sum + totalEngagement(p.engagement_data), 0) / compPosts.length)
      : 0;

    const triggers = compPosts.flatMap((p) => p.ai_triggers_detected ?? []);
    const triggerCounts = triggers.reduce((acc, t) => ({ ...acc, [t]: (acc[t] ?? 0) + 1 }), {} as Record<string, number>);
    const topTrigger = Object.entries(triggerCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '-';

    const funnels = compPosts.map((p) => p.ai_funnel_stage).filter(Boolean);
    const funnelCounts = funnels.reduce((acc, f) => ({ ...acc, [f!]: (acc[f!] ?? 0) + 1 }), {} as Record<string, number>);

    return { ...comp, postCount: compPosts.length, avgEng, topTrigger, funnelCounts };
  });

  // Compute success formulas
  const formulas = competitors.slice(0, 4).map((comp) => {
    const compPosts = topPosts.filter((p) => p.competitor_id === comp.id);
    const sorted = [...compPosts].sort((a, b) => totalEngagement(b.engagement_data) - totalEngagement(a.engagement_data));
    const best = sorted[0];

    return {
      competitor: comp.name,
      format: best?.content_format ?? 'unknown',
      trigger: best?.ai_triggers_detected?.[0] ?? 'none',
      funnel: best?.ai_funnel_stage ?? 'tofu',
      engagement: best ? totalEngagement(best.engagement_data) : 0,
    };
  }).filter((f) => f.engagement > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-6 w-6 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  const tabs = [
    { key: 'top', label: t.topPosts ?? 'Top Posts', icon: Star },
    { key: 'formula', label: t.formula ?? 'Erfolgsformel', icon: Zap },
    { key: 'compare', label: t.compare ?? 'Vergleich', icon: BarChart3 },
    { key: 'ideas', label: t.ideas ?? 'Ideen', icon: Sparkles },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-xl bg-[rgba(15,48,63,0.3)] border border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-gold/10 border border-gold/30 text-gold'
                  : 'text-white/40 hover:text-white/60',
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Top Posts Tab */}
      {activeTab === 'top' && (
        <div className="space-y-3">
          {topPosts.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">
              {t.noIntelYet ?? 'Noch keine Intel-Daten. Starte einen Competitor-Scrape.'}
            </div>
          ) : (
            topPosts.map((post, i) => {
              const PlatformIcon = platformIcons[post.source_platform] ?? Globe;
              const eng = totalEngagement(post.engagement_data);
              return (
                <div key={post.id} className="rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/5 text-white/40 text-xs font-bold shrink-0">
                      #{i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <PlatformIcon className="h-3.5 w-3.5 text-white/40" strokeWidth={1.5} />
                        {post.ai_funnel_stage && (
                          <span className={cn('px-1.5 py-0.5 rounded text-[9px] border', funnelColors[post.ai_funnel_stage] ?? 'text-white/40')}>
                            {post.ai_funnel_stage.toUpperCase()}
                          </span>
                        )}
                        <span className="text-[10px] text-gold font-medium ml-auto">
                          {formatNumber(eng)} engagement
                        </span>
                      </div>
                      <p className="text-xs text-white/60 line-clamp-2">
                        {post.ai_summary ?? post.content?.substring(0, 150)}
                      </p>
                      {post.ai_triggers_detected && post.ai_triggers_detected.length > 0 && (
                        <div className="flex gap-1 mt-1.5">
                          {post.ai_triggers_detected.slice(0, 3).map((trigger) => (
                            <span key={trigger} className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/10 text-purple-300">
                              {trigger}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onGenerateContent?.({ inspiration_id: post.id, funnel_stage: post.ai_funnel_stage ?? undefined })}
                      className="p-1.5 rounded-lg hover:bg-gold/10 transition-colors shrink-0"
                      title="Als Inspiration nutzen"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-gold/60" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Success Formula Tab */}
      {activeTab === 'formula' && (
        <div className="space-y-3">
          {formulas.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">
              Nicht genug Daten für Erfolgsformeln
            </div>
          ) : (
            formulas.map((f, i) => (
              <div key={i} className="rounded-xl border border-gold/20 bg-[rgba(15,48,63,0.4)] backdrop-blur-sm p-4">
                <div className="text-[10px] text-white/30 mb-2">{f.competitor}</div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs">
                    {f.format}
                  </span>
                  <span className="text-white/20">+</span>
                  <span className="px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                    {f.trigger}
                  </span>
                  <span className="text-white/20">=</span>
                  <span className="px-2 py-1 rounded-lg bg-gold/10 border border-gold/20 text-gold text-xs font-medium">
                    {formatNumber(f.engagement)}
                  </span>
                </div>
                <button
                  onClick={() => onGenerateContent?.({ funnel_stage: f.funnel, topic: f.trigger })}
                  className="mt-3 inline-flex items-center gap-1 text-[10px] text-gold/60 hover:text-gold transition-colors"
                >
                  <Sparkles className="h-3 w-3" /> Dieses Pattern nutzen
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Comparison Tab */}
      {activeTab === 'compare' && (
        <div className="rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2.5 px-3 text-white/40 font-medium">Competitor</th>
                  <th className="text-center py-2.5 px-3 text-white/40 font-medium">Posts</th>
                  <th className="text-center py-2.5 px-3 text-white/40 font-medium">Avg. Eng.</th>
                  <th className="text-center py-2.5 px-3 text-white/40 font-medium">Top Trigger</th>
                  <th className="text-center py-2.5 px-3 text-white/40 font-medium">Funnel</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((comp) => {
                  const topFunnel = Object.entries(comp.funnelCounts).sort(([, a], [, b]) => b - a)[0];
                  return (
                    <tr key={comp.id} className="border-b border-white/5">
                      <td className="py-2.5 px-3 text-white/70 font-medium">{comp.name}</td>
                      <td className="py-2.5 px-3 text-center text-white/50">{comp.postCount}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-gold font-medium">{formatNumber(comp.avgEng)}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px]">
                          {comp.topTrigger}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {topFunnel && (
                          <span className={cn('px-1.5 py-0.5 rounded text-[10px] border', funnelColors[topFunnel[0]] ?? '')}>
                            {topFunnel[0].toUpperCase()}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ideas Tab */}
      {activeTab === 'ideas' && (
        <div className="space-y-3">
          {gaps.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">
              {t.noGaps ?? 'Keine Content-Lücken erkannt. Scrape mehr Competitors.'}
            </div>
          ) : (
            gaps.slice(0, 8).map((gap, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
                      <span className="text-xs font-medium text-white">{gap.topic}</span>
                      {gap.funnel_stage && (
                        <span className={cn('px-1.5 py-0.5 rounded text-[9px] border', funnelColors[gap.funnel_stage] ?? '')}>
                          {gap.funnel_stage.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/50">{gap.suggestion}</p>
                  </div>
                  <button
                    onClick={() => onGenerateContent?.({ topic: gap.topic, funnel_stage: gap.funnel_stage })}
                    className="px-2.5 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-[10px] text-gold hover:bg-gold/20 transition-colors shrink-0"
                  >
                    Erstellen
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
