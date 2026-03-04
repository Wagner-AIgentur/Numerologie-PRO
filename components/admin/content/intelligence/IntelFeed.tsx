'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Bookmark, BookmarkCheck, Sparkles, ExternalLink,
  MessageCircle, TrendingUp, Filter, Eye,
} from 'lucide-react';

interface IntelEntry {
  id: string;
  competitor_id: string;
  source_platform: string;
  source_url: string | null;
  content: string | null;
  media_type: string | null;
  posted_at: string | null;
  engagement_data: Record<string, number>;
  ai_summary: string | null;
  ai_topics: string[];
  ai_funnel_stage: string | null;
  ai_triggers_detected: string[];
  ai_hook_analysis: string | null;
  ai_cta_analysis: string | null;
  ai_strategy_notes: string | null;
  ai_manychat_detected: boolean;
  ai_manychat_keyword: string | null;
  is_bookmarked: boolean;
  is_used_as_inspiration: boolean;
  scraped_at: string;
  content_competitors: { name: string };
}

const funnelColors: Record<string, string> = {
  tofu: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  mofu: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  bofu: 'bg-gold/10 text-gold border-gold/20',
  retention: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const platformEmoji: Record<string, string> = {
  instagram: '📸',
  tiktok: '🎵',
  youtube: '📺',
  linkedin: '💼',
  facebook: '📘',
  website: '🌐',
};

interface Props {
  locale: string;
  t: Record<string, string>;
  competitorId?: string;
  onInspire?: (intelId: string) => void;
}

export default function IntelFeed({ locale, t, competitorId, onInspire }: Props) {
  const [entries, setEntries] = useState<IntelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState('');
  const [funnelFilter, setFunnelFilter] = useState('');
  const [bookmarkOnly, setBookmarkOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '50' });
    if (competitorId) params.set('competitor_id', competitorId);
    if (platformFilter) params.set('platform', platformFilter);
    if (funnelFilter) params.set('funnel_stage', funnelFilter);
    if (bookmarkOnly) params.set('bookmarked', 'true');

    const res = await fetch(`/api/admin/content/intel?${params}`);
    const data = await res.json();
    setEntries(data.data ?? []);
    setLoading(false);
  }, [competitorId, platformFilter, funnelFilter, bookmarkOnly]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  async function toggleBookmark(id: string, current: boolean) {
    await fetch(`/api/admin/content/intel/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_bookmarked: !current }),
    });
    setEntries((prev) => prev.map((e) =>
      e.id === id ? { ...e, is_bookmarked: !current } : e,
    ));
  }

  function getEngagementScore(data: Record<string, number>): number {
    return (data.likes ?? 0) + (data.comments ?? 0) * 3 + (data.shares ?? 0) * 5 + (data.views ?? 0) * 0.01;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
        >
          <option value="">Alle Plattformen</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="youtube">YouTube</option>
        </select>

        <select
          value={funnelFilter}
          onChange={(e) => setFunnelFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
        >
          <option value="">Alle Funnel-Stages</option>
          <option value="tofu">TOFU</option>
          <option value="mofu">MOFU</option>
          <option value="bofu">BOFU</option>
          <option value="retention">Retention</option>
        </select>

        <button
          onClick={() => setBookmarkOnly(!bookmarkOnly)}
          className={cn(
            'px-3 py-1.5 rounded-lg border text-xs transition-colors',
            bookmarkOnly
              ? 'border-gold/30 bg-gold/10 text-gold'
              : 'border-white/10 text-white/40 hover:text-white/60',
          )}
        >
          <Bookmark className="h-3 w-3 inline mr-1" />
          Bookmarks
        </button>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-gold border-t-transparent rounded-full" />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
          <Eye className="h-10 w-10 text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/40 text-sm">{t.csNoIntelYet ?? 'Noch keine Intel-Daten. Starte einen Scrape.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const engScore = getEngagementScore(entry.engagement_data ?? {});
            const isExpanded = expandedId === entry.id;

            return (
              <div
                key={entry.id}
                className={cn(
                  'rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm overflow-hidden transition-colors',
                  entry.is_bookmarked && 'border-gold/20',
                )}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {/* Meta row */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] text-white/30">
                          {platformEmoji[entry.source_platform] ?? '🔗'} {entry.content_competitors?.name}
                        </span>
                        {entry.ai_funnel_stage && (
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded border', funnelColors[entry.ai_funnel_stage])}>
                            {entry.ai_funnel_stage.toUpperCase()}
                          </span>
                        )}
                        {entry.ai_triggers_detected?.map((trigger) => (
                          <span key={trigger} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                            {trigger}
                          </span>
                        ))}
                        {entry.ai_manychat_detected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400">
                            <MessageCircle className="h-2.5 w-2.5 inline mr-0.5" />
                            {entry.ai_manychat_keyword ?? 'Chat-CTA'}
                          </span>
                        )}
                        {engScore > 0 && (
                          <span className="text-[10px] text-emerald-400/60">
                            <TrendingUp className="h-2.5 w-2.5 inline mr-0.5" />
                            {Math.round(engScore)}
                          </span>
                        )}
                      </div>

                      {/* Summary / Content */}
                      <p className="text-xs text-white/60 line-clamp-2">
                        {entry.ai_summary ?? entry.content?.substring(0, 200)}
                      </p>

                      {/* Engagement details */}
                      {entry.engagement_data && (
                        <div className="flex gap-3 mt-1.5 text-[10px] text-white/20">
                          {entry.engagement_data.likes !== undefined && <span>❤️ {entry.engagement_data.likes}</span>}
                          {entry.engagement_data.comments !== undefined && <span>💬 {entry.engagement_data.comments}</span>}
                          {entry.engagement_data.views !== undefined && <span>👁 {entry.engagement_data.views}</span>}
                          {entry.engagement_data.shares !== undefined && <span>🔄 {entry.engagement_data.shares}</span>}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleBookmark(entry.id, entry.is_bookmarked)}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        {entry.is_bookmarked
                          ? <BookmarkCheck className="h-3.5 w-3.5 text-gold" />
                          : <Bookmark className="h-3.5 w-3.5 text-white/20" />
                        }
                      </button>
                      {onInspire && (
                        <button
                          onClick={() => onInspire(entry.id)}
                          className="p-1.5 rounded-lg hover:bg-gold/10 transition-colors"
                          title={t.csInspireFromIntel ?? 'Als Inspiration nutzen'}
                        >
                          <Sparkles className="h-3.5 w-3.5 text-gold/50 hover:text-gold" />
                        </button>
                      )}
                      {entry.source_url && (
                        <a href={entry.source_url} target="_blank" rel="noopener" className="p-1.5 rounded-lg hover:bg-white/5">
                          <ExternalLink className="h-3.5 w-3.5 text-white/20" />
                        </a>
                      )}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-[10px] text-white/20"
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Analysis */}
                {isExpanded && (
                  <div className="border-t border-white/10 p-4 space-y-2 bg-white/[0.02] text-xs">
                    {entry.ai_hook_analysis && (
                      <div>
                        <span className="text-[10px] text-blue-400 font-medium">Hook-Analyse:</span>
                        <p className="text-white/50 mt-0.5">{entry.ai_hook_analysis}</p>
                      </div>
                    )}
                    {entry.ai_cta_analysis && (
                      <div>
                        <span className="text-[10px] text-gold font-medium">CTA-Analyse:</span>
                        <p className="text-white/50 mt-0.5">{entry.ai_cta_analysis}</p>
                      </div>
                    )}
                    {entry.ai_strategy_notes && (
                      <div>
                        <span className="text-[10px] text-purple-400 font-medium">Strategie:</span>
                        <p className="text-white/50 mt-0.5">{entry.ai_strategy_notes}</p>
                      </div>
                    )}
                    {entry.ai_topics?.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {entry.ai_topics.map((topic) => (
                          <span key={topic} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30">
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                    {entry.content && (
                      <div>
                        <span className="text-[10px] text-white/20 font-medium">Original-Caption:</span>
                        <p className="text-white/40 mt-0.5 whitespace-pre-wrap">{entry.content.substring(0, 1000)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
