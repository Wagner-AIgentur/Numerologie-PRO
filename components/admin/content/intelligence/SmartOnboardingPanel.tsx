'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Link, Search, Loader2, Check, AlertCircle,
  Instagram, Youtube, Globe, Play, Facebook, Linkedin,
  Sparkles, ArrowRight, List, X, RotateCcw, AlertTriangle,
} from 'lucide-react';

interface Props {
  locale: string;
  t: Record<string, string>;
  onComplete?: (competitorId: string) => void;
  onGenerateContent?: (competitorId: string) => void;
}

type StepStatus = 'waiting' | 'active' | 'done' | 'error';

interface PipelineStep {
  key: string;
  label: string;
  status: StepStatus;
  detail?: string;
}

interface PipelineResult {
  competitorId: string;
  competitorName: string;
  platform: string;
  intelCount: number;
  analyzedCount: number;
  errors?: string[];
  warnings?: string[];
  report?: {
    summary?: string;
    dominant_triggers?: string[];
    funnel_distribution?: Record<string, number>;
    actionable_insights?: string[];
  };
}

type DetectedPlatform = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'linkedin' | 'website' | null;

const PLATFORM_CONFIG: Record<string, { icon: typeof Globe; label: string; color: string }> = {
  instagram: { icon: Instagram, label: 'Instagram', color: 'text-pink-400' },
  tiktok: { icon: Play, label: 'TikTok', color: 'text-cyan-400' },
  youtube: { icon: Youtube, label: 'YouTube', color: 'text-red-400' },
  facebook: { icon: Facebook, label: 'Facebook', color: 'text-blue-400' },
  linkedin: { icon: Linkedin, label: 'LinkedIn', color: 'text-sky-400' },
  website: { icon: Globe, label: 'Website', color: 'text-emerald-400' },
};

function detectPlatform(url: string): DetectedPlatform {
  const lower = url.toLowerCase().trim();
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('facebook.com') || lower.includes('fb.com')) return 'facebook';
  if (lower.includes('linkedin.com')) return 'linkedin';
  if (lower.includes('.') && lower.length > 4) return 'website';
  return null;
}

const INITIAL_STEPS: PipelineStep[] = [
  { key: 'detect', label: 'Platform erkennen', status: 'waiting' },
  { key: 'scrape', label: 'Content scrapen', status: 'waiting' },
  { key: 'analyze', label: 'AI Analyse', status: 'waiting' },
  { key: 'report', label: 'Strategy Report', status: 'waiting' },
  { key: 'done', label: 'Fertig', status: 'waiting' },
];

export default function SmartOnboardingPanel({ locale, t, onComplete, onGenerateContent }: Props) {
  const [url, setUrl] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [batchUrls, setBatchUrls] = useState('');
  const [detected, setDetected] = useState<DetectedPlatform>(null);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = useCallback((value: string) => {
    setUrl(value);
    setDetected(detectPlatform(value));
    setError(null);
    setResult(null);
    setSteps(INITIAL_STEPS);
  }, []);

  function updateStep(key: string, status: StepStatus, detail?: string) {
    setSteps((prev) =>
      prev.map((s) => (s.key === key ? { ...s, status, detail } : s)),
    );
  }

  async function handleSubmit() {
    if (running) return;
    setRunning(true);
    setError(null);
    setResult(null);
    setSteps(INITIAL_STEPS);

    const urls = batchMode
      ? batchUrls.split('\n').map((l) => l.trim()).filter(Boolean)
      : [url.trim()];

    if (urls.length === 0) {
      setError('Bitte mindestens eine URL eingeben');
      setRunning(false);
      return;
    }

    // Simulate step progression (actual API is synchronous)
    updateStep('detect', 'active', 'Erkenne Platform...');

    try {
      const body = batchMode ? { urls } : { url: urls[0] };

      // Detect step
      const platform = detectPlatform(urls[0]);
      updateStep('detect', 'done', platform ? PLATFORM_CONFIG[platform]?.label : 'Website');
      updateStep('scrape', 'active', 'Scrape läuft...');

      const res = await fetch('/api/admin/content/competitors/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? data.error ?? `Error ${res.status}`);
      }

      const data = await res.json();
      const pipelineErrors: string[] = data.errors ?? [];
      const pipelineWarnings: string[] = data.warnings ?? [];
      const hasScrapingError = pipelineErrors.some((e: string) => e.toLowerCase().includes('scrap'));
      const hasAnalysisWarning = pipelineWarnings.some((w: string) => w.toLowerCase().includes('analyse'));

      // Mark steps with accurate status based on pipeline results
      updateStep('scrape', hasScrapingError ? 'error' : 'done',
        hasScrapingError ? pipelineErrors.find((e: string) => e.includes('Scrap')) ?? 'Scrape fehlgeschlagen'
          : `${data.intelCount ?? 0} Inhalte gefunden`);
      updateStep('analyze',
        (data.analyzedCount ?? 0) === 0 && (data.intelCount ?? 0) > 0 ? 'error' :
        hasAnalysisWarning ? 'done' : 'done',
        `${data.analyzedCount ?? 0}/${data.intelCount ?? 0} analysiert`);
      updateStep('report', data.report ? 'done' : (data.intelCount ?? 0) === 0 ? 'error' : 'done',
        data.report ? 'Report erstellt' : 'Kein Report (zu wenig Daten)');
      updateStep('done', pipelineErrors.length === 0 ? 'done' : 'done', 'Abgeschlossen');

      setResult({
        competitorId: data.competitorId,
        competitorName: data.competitorName ?? 'Competitor',
        platform: data.platform ?? 'website',
        intelCount: data.intelCount ?? 0,
        analyzedCount: data.analyzedCount ?? 0,
        errors: pipelineErrors,
        warnings: pipelineWarnings,
        report: data.report,
      });

      // Show pipeline errors as main error if scraping completely failed
      if ((data.intelCount ?? 0) === 0 && pipelineErrors.length > 0) {
        setError(pipelineErrors.join(' | '));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Pipeline fehlgeschlagen';
      setError(msg);

      // Mark current active step as error
      setSteps((prev) =>
        prev.map((s) => (s.status === 'active' ? { ...s, status: 'error', detail: msg } : s)),
      );
    } finally {
      setRunning(false);
    }
  }

  const StepIcon = ({ status }: { status: StepStatus }) => {
    switch (status) {
      case 'done': return <Check className="h-3.5 w-3.5 text-emerald-400" />;
      case 'active': return <Loader2 className="h-3.5 w-3.5 text-gold animate-spin" />;
      case 'error': return <AlertCircle className="h-3.5 w-3.5 text-red-400" />;
      default: return <div className="h-3.5 w-3.5 rounded-full border border-white/20" />;
    }
  };

  const PlatformBadge = detected && PLATFORM_CONFIG[detected] ? (
    (() => {
      const cfg = PLATFORM_CONFIG[detected];
      const Icon = cfg.icon;
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10', cfg.color)}>
          <Icon className="h-3 w-3" strokeWidth={1.5} />
          {cfg.label}
        </span>
      );
    })()
  ) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" strokeWidth={1.5} />
            {t.smartOnboardTitle ?? 'Smart Onboarding'}
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            {t.smartOnboardSubtitle ?? 'URL eingeben — alles andere ist automatisch'}
          </p>
        </div>
        <button
          onClick={() => { setBatchMode(!batchMode); setError(null); }}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors border',
            batchMode ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60',
          )}
        >
          <List className="h-3.5 w-3.5" strokeWidth={1.5} />
          {t.batchMode ?? 'Batch'}
        </button>
      </div>

      {/* Input */}
      <div className="rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4 space-y-3">
        {batchMode ? (
          <textarea
            value={batchUrls}
            onChange={(e) => setBatchUrls(e.target.value)}
            placeholder="Eine URL pro Zeile eingeben...&#10;https://instagram.com/competitor1&#10;https://tiktok.com/@competitor2&#10;https://example.com"
            rows={5}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none resize-none"
          />
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Link className="h-4 w-4 text-white/30" strokeWidth={1.5} />
            </div>
            <input
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={t.smartOnboardPlaceholder ?? 'Instagram, TikTok, YouTube, Facebook oder Website URL...'}
              className="w-full pl-10 pr-24 py-2.5 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && !running && handleSubmit()}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {PlatformBadge}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={running || (!url.trim() && !batchUrls.trim())}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gold/10 border border-gold/30 px-4 py-2.5 text-sm font-medium text-gold hover:bg-gold/20 disabled:opacity-40 transition-colors"
        >
          {running ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.smartOnboardRunning ?? 'Analyse läuft...'}
            </>
          ) : (
            <>
              <Search className="h-4 w-4" strokeWidth={1.5} />
              {t.smartOnboardStart ?? 'Competitor analysieren'}
            </>
          )}
        </button>
      </div>

      {/* Progress Steps */}
      {(running || result || error) && (
        <div className="rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4">
          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.key} className="flex items-center gap-3">
                <StepIcon status={step.status} />
                <span className={cn(
                  'text-xs',
                  step.status === 'done' ? 'text-white/60' :
                  step.status === 'active' ? 'text-gold' :
                  step.status === 'error' ? 'text-red-400' :
                  'text-white/20',
                )}>
                  {step.label}
                </span>
                {step.detail && (
                  <span className="text-[10px] text-white/30 ml-auto">{step.detail}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={running}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-colors"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={1.5} />
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Warnings */}
      {result?.warnings && result.warnings.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" strokeWidth={1.5} />
            <span className="text-[10px] font-medium text-amber-300">Hinweise ({result.warnings.length})</span>
          </div>
          {result.warnings.slice(0, 3).map((w, i) => (
            <p key={i} className="text-[10px] text-amber-300/70 pl-5">{w}</p>
          ))}
          {result.warnings.length > 3 && (
            <p className="text-[10px] text-amber-300/50 pl-5">+{result.warnings.length - 3} weitere</p>
          )}
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="rounded-xl border border-gold/20 bg-[rgba(15,48,63,0.5)] backdrop-blur-sm p-4 space-y-3">
          <div className="flex items-center gap-3">
            {PLATFORM_CONFIG[result.platform] && (
              (() => {
                const cfg = PLATFORM_CONFIG[result.platform];
                const Icon = cfg.icon;
                return <Icon className={cn('h-5 w-5', cfg.color)} strokeWidth={1.5} />;
              })()
            )}
            <div>
              <h3 className="text-sm font-medium text-white">{result.competitorName}</h3>
              <p className="text-[10px] text-white/40">
                {result.intelCount} Inhalte · {result.analyzedCount} analysiert
              </p>
            </div>
          </div>

          {/* Key Insights */}
          {result.report && (
            <div className="flex flex-wrap gap-2">
              {result.report.dominant_triggers?.slice(0, 2).map((trigger) => (
                <span key={trigger} className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-300">
                  {trigger}
                </span>
              ))}
              {result.report.funnel_distribution && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-gold/10 border border-gold/20 text-gold">
                  {Object.entries(result.report.funnel_distribution)
                    .sort(([, a], [, b]) => b - a)[0]?.[0]?.toUpperCase() ?? 'TOFU'} dominant
                </span>
              )}
            </div>
          )}

          {result.report?.summary && (
            <p className="text-xs text-white/50 leading-relaxed">{result.report.summary}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onComplete?.(result.competitorId)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white/80 transition-colors"
            >
              <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
              {t.viewIntel ?? 'Intel anzeigen'}
            </button>
            <button
              onClick={() => onGenerateContent?.(result.competitorId)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gold/10 border border-gold/30 text-xs text-gold hover:bg-gold/20 transition-colors"
            >
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              {t.generateContent ?? 'Content generieren'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
