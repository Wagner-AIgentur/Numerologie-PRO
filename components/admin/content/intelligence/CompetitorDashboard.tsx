'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Shield, Plus, Globe, Loader2, RefreshCw,
  Trash2, ExternalLink, BarChart3, ChevronDown, ChevronUp,
} from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  website_url: string | null;
  social_accounts: Record<string, string>;
  scrape_frequency: string;
  is_active: boolean;
  last_scraped_at: string | null;
  notes: string | null;
  intel_count?: number;
}

interface Props {
  locale: string;
  t: Record<string, string>;
  onViewIntel: (competitorId: string) => void;
}

const platformIcons: Record<string, string> = {
  instagram: '📸',
  tiktok: '🎵',
  youtube: '📺',
  linkedin: '💼',
  facebook: '📘',
};

export default function CompetitorDashboard({ locale, t, onViewIntel }: Props) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [scraping, setScraping] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [strategyReport, setStrategyReport] = useState<Record<string, unknown> | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formIG, setFormIG] = useState('');
  const [formTikTok, setFormTikTok] = useState('');
  const [formYouTube, setFormYouTube] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const loadCompetitors = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/content/competitors?limit=50');
    const data = await res.json();
    setCompetitors(data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadCompetitors(); }, [loadCompetitors]);

  async function handleCreate() {
    const social_accounts: Record<string, string> = {};
    if (formIG) social_accounts.instagram = formIG;
    if (formTikTok) social_accounts.tiktok = formTikTok;
    if (formYouTube) social_accounts.youtube = formYouTube;

    await fetch('/api/admin/content/competitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formName,
        website_url: formWebsite || null,
        social_accounts,
        notes: formNotes || null,
      }),
    });

    setFormName(''); setFormWebsite(''); setFormIG(''); setFormTikTok('');
    setFormYouTube(''); setFormNotes('');
    setShowForm(false);
    loadCompetitors();
  }

  async function handleScrape(id: string) {
    setScraping(id);
    try {
      await fetch(`/api/admin/content/competitors/${id}/scrape`, { method: 'POST' });
      loadCompetitors();
    } finally {
      setScraping(null);
    }
  }

  async function handleAnalyze(id: string) {
    setAnalyzing(id);
    try {
      const res = await fetch(`/api/admin/content/competitors/${id}/analyze`, { method: 'POST' });
      const report = await res.json();
      setStrategyReport(report);
      setExpandedId(id);
    } finally {
      setAnalyzing(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Wettbewerber wirklich entfernen?')) return;
    await fetch(`/api/admin/content/competitors/${id}`, { method: 'DELETE' });
    loadCompetitors();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-6 w-6 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">{t.csCompetitorTitle ?? 'Wettbewerber'}</h2>
          <p className="text-xs text-white/40 mt-0.5">{t.csCompetitorSubtitle ?? 'Profile verwalten und Content analysieren'}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/30 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/20 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          {t.csAddCompetitor ?? 'Neu'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="rounded-xl border border-gold/20 bg-[rgba(15,48,63,0.5)] backdrop-blur-sm p-4 space-y-3">
          <input
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Name des Wettbewerbers"
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
          />
          <input
            value={formWebsite}
            onChange={(e) => setFormWebsite(e.target.value)}
            placeholder="Website URL (optional)"
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
          />
          <div className="grid grid-cols-3 gap-2">
            <input value={formIG} onChange={(e) => setFormIG(e.target.value)} placeholder="📸 Instagram Handle" className="px-3 py-2 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] text-xs text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none" />
            <input value={formTikTok} onChange={(e) => setFormTikTok(e.target.value)} placeholder="🎵 TikTok Handle" className="px-3 py-2 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] text-xs text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none" />
            <input value={formYouTube} onChange={(e) => setFormYouTube(e.target.value)} placeholder="📺 YouTube Channel URL" className="px-3 py-2 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] text-xs text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none" />
          </div>
          <textarea
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            placeholder="Notizen (optional)"
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none resize-none"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-white/40 hover:text-white/60">
              {t.cancel ?? 'Abbrechen'}
            </button>
            <button
              onClick={handleCreate}
              disabled={!formName}
              className="px-4 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-xs text-gold hover:bg-gold/20 disabled:opacity-40 transition-colors"
            >
              {t.save ?? 'Speichern'}
            </button>
          </div>
        </div>
      )}

      {/* Competitor List */}
      {competitors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
          <Shield className="h-10 w-10 text-purple-400/30 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/40 text-sm">{t.csNoCompetitorsYet ?? 'Noch keine Wettbewerber angelegt'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {competitors.map((comp) => (
            <div key={comp.id} className="rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white">{comp.name}</h3>
                      {comp.website_url && (
                        <a href={comp.website_url} target="_blank" rel="noopener" className="text-white/20 hover:text-white/40">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-white/40">
                      {Object.entries(comp.social_accounts ?? {}).map(([platform, handle]) => (
                        <span key={platform} className="flex items-center gap-1">
                          {platformIcons[platform] ?? '🔗'} {handle}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-white/20">
                      {comp.last_scraped_at && (
                        <span>Letzter Scrape: {new Date(comp.last_scraped_at).toLocaleDateString()}</span>
                      )}
                      {comp.intel_count !== undefined && comp.intel_count > 0 && (
                        <span className="text-purple-400">{comp.intel_count} Intel-Einträge</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleScrape(comp.id)}
                      disabled={scraping === comp.id}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      title="Scrapen"
                    >
                      {scraping === comp.id
                        ? <Loader2 className="h-3.5 w-3.5 text-gold animate-spin" />
                        : <RefreshCw className="h-3.5 w-3.5 text-white/30" />
                      }
                    </button>
                    <button
                      onClick={() => handleAnalyze(comp.id)}
                      disabled={analyzing === comp.id}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      title="Strategie-Analyse"
                    >
                      {analyzing === comp.id
                        ? <Loader2 className="h-3.5 w-3.5 text-purple-400 animate-spin" />
                        : <BarChart3 className="h-3.5 w-3.5 text-white/30" />
                      }
                    </button>
                    <button
                      onClick={() => onViewIntel(comp.id)}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      title="Intel anzeigen"
                    >
                      <Globe className="h-3.5 w-3.5 text-white/30" />
                    </button>
                    <button
                      onClick={() => setExpandedId(expandedId === comp.id ? null : comp.id)}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      {expandedId === comp.id
                        ? <ChevronUp className="h-3.5 w-3.5 text-white/30" />
                        : <ChevronDown className="h-3.5 w-3.5 text-white/30" />
                      }
                    </button>
                    <button
                      onClick={() => handleDelete(comp.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-white/20 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Strategy Report (expandable) */}
              {expandedId === comp.id && strategyReport && (
                <div className="border-t border-white/10 p-4 space-y-3 bg-white/[0.02]">
                  <h4 className="text-xs font-medium text-purple-400">{t.csStrategyReport ?? 'Strategie-Report'}</h4>

                  {(strategyReport as { summary?: string }).summary && (
                    <p className="text-xs text-white/60">{(strategyReport as { summary: string }).summary}</p>
                  )}

                  {(strategyReport as { strengths?: string[] }).strengths && (
                    <div>
                      <span className="text-[10px] text-emerald-400 font-medium">Stärken:</span>
                      <ul className="text-xs text-white/50 mt-1 space-y-0.5">
                        {((strategyReport as { strengths: string[] }).strengths).map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(strategyReport as { actionable_insights?: string[] }).actionable_insights && (
                    <div>
                      <span className="text-[10px] text-gold font-medium">Empfehlungen:</span>
                      <ul className="text-xs text-white/50 mt-1 space-y-0.5">
                        {((strategyReport as { actionable_insights: string[] }).actionable_insights).map((s, i) => (
                          <li key={i}>→ {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
