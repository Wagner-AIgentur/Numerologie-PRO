'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Copy, Check, Save, RefreshCw, MessageCircle, Library } from 'lucide-react';
import ContentScoreCard from './ContentScoreCard';

interface Template {
  id: string;
  name: string;
  slug: string;
  pipeline_type: string;
}

interface GenerationResult {
  output: string;
  output_json?: Record<string, unknown>;
  model_used: string;
  template_slug?: string;
  pipeline_step: string;
  tokens_used?: number;
}

interface Props {
  locale: string;
  t: Record<string, string>;
  template: Template;
  model: string;
  funnelStage: string;
  triggers: string[];
}

export default function GenerationPanel({ locale, t, template, model, funnelStage, triggers }: Props) {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professionell');
  const [language, setLanguage] = useState<'de' | 'ru' | 'en'>('de');
  const [manychatCta, setManychatCta] = useState(false);
  const [useKnowledge, setUseKnowledge] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [scriptResult, setScriptResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isPipeline = template.pipeline_type === 'script_then_caption';
  const currentStep = !scriptResult && isPipeline ? 'script' : isPipeline ? 'caption' : undefined;

  async function handleGenerate() {
    if (!topic.trim()) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/content/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: template.id,
          content_type: template.slug,
          topic,
          language,
          tone,
          model,
          funnel_stage: funnelStage,
          triggers,
          manychat_cta: manychatCta,
          use_knowledge: useKnowledge,
          pipeline_step: currentStep,
          script_input: scriptResult?.output,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');

      if (isPipeline && !scriptResult) {
        setScriptResult(data);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveAsPost() {
    if (!result && !scriptResult) return;
    setSaving(true);

    try {
      const output = result?.output_json ?? scriptResult?.output_json ?? {};
      const body = {
        title: (output.title as string) ?? topic.substring(0, 100),
        body: (output.script as string) ?? (output.post as string) ?? (output.caption as string) ?? result?.output ?? scriptResult?.output ?? '',
        content_type: template.slug,
        language,
        funnel_stage: funnelStage,
        triggers_used: triggers,
        status: 'draft',
        ai_model: model,
        ai_template_id: template.id,
        generation_history: [
          scriptResult ? { step: 'script', ...scriptResult } : null,
          result ? { step: 'caption', ...result } : null,
        ].filter(Boolean),
        platform_variants: result?.output_json?.instagram ? result.output_json : {},
        manychat_enabled: manychatCta,
        manychat_keyword: (output.manychat_keyword as string) ?? null,
        manychat_dm_text: (output.manychat_dm_text as string) ?? null,
      };

      const res = await fetch('/api/admin/content/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    const text = result?.output ?? scriptResult?.output ?? '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatOutput(res: GenerationResult): string {
    if (res.output_json) {
      return Object.entries(res.output_json)
        .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v, null, 2)}`)
        .join('\n\n---\n\n');
    }
    return res.output;
  }

  return (
    <div className="space-y-4">
      {/* Input Row */}
      <div className="flex gap-3">
        <div className="flex-1 space-y-3">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t.topicPlaceholder ?? 'Thema / Anlass eingeben...'}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none resize-none"
          />

          <div className="flex items-center gap-3 flex-wrap">
            {/* Tone */}
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
            >
              <option value="professionell">Professionell</option>
              <option value="locker">Locker</option>
              <option value="motivierend">Motivierend</option>
              <option value="mystisch">Mystisch</option>
              <option value="humorvoll">Humorvoll</option>
            </select>

            {/* Language */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'de' | 'ru' | 'en')}
              className="rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
            >
              <option value="de">Deutsch</option>
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>

            {/* ManyChat CTA Toggle */}
            <button
              onClick={() => setManychatCta(!manychatCta)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                manychatCta
                  ? 'border-purple-500/40 bg-purple-500/10 text-purple-400'
                  : 'border-white/10 text-white/40 hover:text-white/60',
              )}
            >
              <MessageCircle className="h-3 w-3" strokeWidth={1.5} />
              {t.csManyChatCTA ?? 'ManyChat CTA'}
            </button>

            {/* Knowledge Base Toggle */}
            <button
              onClick={() => setUseKnowledge(!useKnowledge)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                useKnowledge
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-white/10 text-white/40 hover:text-white/60',
              )}
            >
              <Library className="h-3 w-3" strokeWidth={1.5} />
              {t.csKnowledgeBase ?? 'Wissensbasis'}
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !topic.trim()}
          className={cn(
            'shrink-0 flex flex-col items-center justify-center gap-2 px-6 rounded-xl font-medium transition-all',
            generating
              ? 'bg-gold/5 border border-gold/20 text-gold/50 cursor-wait'
              : 'bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20',
            (!topic.trim() && !generating) && 'opacity-40 cursor-not-allowed',
          )}
        >
          {generating ? (
            <div className="animate-spin h-5 w-5 border-2 border-gold border-t-transparent rounded-full" />
          ) : (
            <Sparkles className="h-5 w-5" strokeWidth={1.5} />
          )}
          <span className="text-xs">
            {generating
              ? t.csGenerating
              : isPipeline && !scriptResult
                ? t.csPipelineScript
                : isPipeline && scriptResult && !result
                  ? t.csPipelineCaption
                  : t.csGenerate
            }
          </span>
        </button>
      </div>

      {/* Pipeline Progress */}
      {isPipeline && (
        <div className="flex items-center gap-2 text-xs">
          <span className={cn('px-2 py-1 rounded', scriptResult ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30')}>
            {t.csPipelineScript ?? 'Script'}
          </span>
          <span className="text-white/20">→</span>
          <span className={cn('px-2 py-1 rounded', result ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30')}>
            {t.csPipelineCaption ?? 'Captions'}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Script Result (Pipeline Step 1) */}
      {scriptResult && !result && (
        <div className="rounded-xl border border-purple-500/20 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4 space-y-3">
          <div className="text-xs font-medium text-purple-400">{t.csPipelineScript ?? 'Script'}</div>
          <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
            {formatOutput(scriptResult)}
          </pre>
          <div className="text-[10px] text-white/20">
            {scriptResult.model_used} · {scriptResult.tokens_used ?? '?'} tokens
          </div>
        </div>
      )}

      {/* Final Result */}
      {result && (
        <div className="rounded-xl border border-gold/20 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-gold">
              {isPipeline ? t.csPipelineCaption : 'Ergebnis'}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-white/30" />}
              </button>
              <button
                onClick={() => { setResult(null); setScriptResult(null); }}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                title={t.csRegenerateHint}
              >
                <RefreshCw className="h-4 w-4 text-white/30" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
            {formatOutput(result)}
          </pre>
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-white/20">
              {result.model_used} · {result.tokens_used ?? '?'} tokens
            </div>
            <button
              onClick={handleSaveAsPost}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-sm font-medium text-gold hover:bg-gold/20 transition-colors"
            >
              {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" strokeWidth={1.5} />}
              {saved ? t.saved : t.csSaveAsPost}
            </button>
          </div>
        </div>
      )}

      {/* Script + Captions side by side */}
      {scriptResult && result && (
        <div className="rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4 space-y-3">
          <div className="text-xs font-medium text-purple-400">{t.csPipelineScript ?? 'Script'}</div>
          <pre className="text-sm text-white/60 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
            {formatOutput(scriptResult)}
          </pre>
        </div>
      )}

      {/* Content Score Card — shows when there's generated content */}
      {(result || scriptResult) && (
        <ContentScoreCard
          content={result?.output ?? scriptResult?.output ?? ''}
          funnelStage={funnelStage}
          platform="instagram"
          triggersUsed={triggers}
          locale={locale}
          t={t}
          onOptimize={(suggestions) => {
            // Prepend suggestions to topic for re-generation
            const hint = suggestions.join('\n');
            setTopic((prev) => `${prev}\n\n[Optimierung]: ${hint}`);
          }}
        />
      )}
    </div>
  );
}
