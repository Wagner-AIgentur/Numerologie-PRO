'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Brain, Sparkles, BarChart2, Target, Megaphone, Layers,
  Save, Plus, Trash2, ChevronDown, ChevronUp, Loader2,
  ToggleLeft, ToggleRight, Play, AlertCircle, Check,
  Instagram, Youtube, Globe, Facebook, Linkedin,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────

interface SystemPrompt {
  id: string;
  prompt_key: string;
  prompt_type: string;
  content_format: string | null;
  platform: string | null;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  is_default: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  locale: string;
  t: Record<string, string>;
}

// ── Constants ─────────────────────────────────────────

type TabKey = 'scoring' | 'analysis' | 'strategy' | 'brand_context' | 'funnel_context';

const TABS: Array<{ key: TabKey; icon: typeof Brain; label: string }> = [
  { key: 'scoring', icon: BarChart2, label: 'Scoring' },
  { key: 'analysis', icon: Target, label: 'Analyse' },
  { key: 'strategy', icon: Megaphone, label: 'Strategie' },
  { key: 'brand_context', icon: Sparkles, label: 'Brand' },
  { key: 'funnel_context', icon: Layers, label: 'Funnel' },
];

const FORMATS = [
  { value: '', label: 'Alle Formate' },
  { value: 'reel', label: 'Reel / Short' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'static', label: 'Static Post' },
  { value: 'story', label: 'Story' },
  { value: 'long_video', label: 'Long Video' },
  { value: 'article', label: 'Artikel / Blog' },
];

const PLATFORMS = [
  { value: '', label: 'Alle Plattformen' },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'tiktok', label: 'TikTok', icon: Play },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'website', label: 'Website', icon: Globe },
];

const MODELS = [
  'google/gemini-2.0-flash-001',
  'google/gemini-2.5-pro-preview',
  'anthropic/claude-sonnet-4',
  'anthropic/claude-haiku-4',
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'meta-llama/llama-3.3-70b-instruct',
  'deepseek/deepseek-chat-v3-0324',
];

// ── Component ─────────────────────────────────────────

export default function AIPromptsShell({ locale, t }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('scoring');
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testContent, setTestContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Draft edits (keyed by prompt id)
  const [drafts, setDrafts] = useState<Record<string, Partial<SystemPrompt>>>({});

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ai-prompts?type=${activeTab}`);
      if (!res.ok) throw new Error('Failed to load prompts');
      const data = await res.json();
      setPrompts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPrompts();
    setExpandedId(null);
    setDrafts({});
    setTestResult(null);
  }, [fetchPrompts]);

  function getDraft(id: string): Partial<SystemPrompt> {
    return drafts[id] ?? {};
  }

  function updateDraft(id: string, updates: Partial<SystemPrompt>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  }

  function getEffective(prompt: SystemPrompt, field: keyof SystemPrompt) {
    const draft = getDraft(prompt.id);
    return draft[field] !== undefined ? draft[field] : prompt[field];
  }

  async function handleSave(prompt: SystemPrompt) {
    const draft = getDraft(prompt.id);
    if (Object.keys(draft).length === 0) return;

    setSaving(prompt.id);
    setError(null);

    try {
      const res = await fetch(`/api/admin/ai-prompts/${prompt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Speichern fehlgeschlagen');
      }
      const updated = await res.json();
      setPrompts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[prompt.id];
        return next;
      });
      setSuccessId(prompt.id);
      setTimeout(() => setSuccessId(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler');
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete(prompt: SystemPrompt) {
    if (prompt.is_default) return;
    if (!confirm(`"${prompt.prompt_key}" wirklich löschen?`)) return;

    try {
      const res = await fetch(`/api/admin/ai-prompts/${prompt.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Löschen fehlgeschlagen');
      }
      setPrompts((prev) => prev.filter((p) => p.id !== prompt.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler');
    }
  }

  async function handleToggleActive(prompt: SystemPrompt) {
    const newActive = !prompt.is_active;
    try {
      const res = await fetch(`/api/admin/ai-prompts/${prompt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newActive }),
      });
      if (!res.ok) throw new Error('Toggle fehlgeschlagen');
      const updated = await res.json();
      setPrompts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler');
    }
  }

  async function handleTest(prompt: SystemPrompt) {
    if (!testContent.trim()) {
      setError('Bitte Test-Content eingeben');
      return;
    }

    setTesting(prompt.id);
    setTestResult(null);

    try {
      const effectivePrompt = getEffective(prompt, 'system_prompt') as string;
      const effectiveModel = getEffective(prompt, 'model') as string;

      // Use the score API for testing scoring prompts
      if (activeTab === 'scoring') {
        const res = await fetch('/api/admin/content/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: testContent,
            funnel_stage: 'tofu',
            platform: (prompt.platform ?? 'instagram'),
            triggers_used: [],
            content_format: prompt.content_format ?? undefined,
          }),
        });
        const data = await res.json();
        setTestResult(JSON.stringify(data, null, 2));
      } else {
        // Generic test — just show what would be sent
        setTestResult(
          `Model: ${effectiveModel}\n` +
          `Temperature: ${getEffective(prompt, 'temperature')}\n` +
          `Max Tokens: ${getEffective(prompt, 'max_tokens')}\n\n` +
          `System Prompt (${effectivePrompt.length} Zeichen):\n` +
          effectivePrompt.substring(0, 500) + '...'
        );
      }
    } catch (err) {
      setTestResult(`Fehler: ${err instanceof Error ? err.message : 'Unbekannt'}`);
    } finally {
      setTesting(null);
    }
  }

  async function handleCreate() {
    const key = `${activeTab}_custom_${Date.now()}`;
    try {
      const res = await fetch('/api/admin/ai-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_key: key,
          prompt_type: activeTab,
          system_prompt: 'Neuer Prompt — hier bearbeiten...',
          description: 'Benutzerdefinierter Prompt',
        }),
      });
      if (!res.ok) throw new Error('Erstellen fehlgeschlagen');
      const created = await res.json();
      setPrompts((prev) => [...prev, created]);
      setExpandedId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler');
    }
  }

  const hasDraft = (id: string) => Object.keys(getDraft(id)).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-gold" strokeWidth={1.5} />
            {t.aiPromptsTitle ?? 'AI System-Prompts'}
          </h1>
          <p className="text-xs text-white/40 mt-1">
            {t.aiPromptsSubtitle ?? 'Scoring-, Analyse- und Strategie-Prompts bearbeiten'}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-xs font-medium text-gold hover:bg-gold/20 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          {t.aiPromptsNew ?? 'Neuer Prompt'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
              activeTab === key
                ? 'bg-gold/10 border border-gold/30 text-gold'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent',
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-300 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <span className="text-xs">×</span>
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 text-gold animate-spin" />
        </div>
      )}

      {/* Prompt List */}
      {!loading && prompts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
          <Brain className="h-8 w-8 text-white/20 mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm text-white/40">
            {t.aiPromptsEmpty ?? 'Keine Prompts in dieser Kategorie'}
          </p>
        </div>
      )}

      {!loading && prompts.map((prompt) => {
        const isExpanded = expandedId === prompt.id;
        const modified = hasDraft(prompt.id);

        return (
          <div
            key={prompt.id}
            className={cn(
              'rounded-xl border bg-[rgba(15,48,63,0.3)] backdrop-blur-sm transition-colors',
              isExpanded ? 'border-gold/20' : 'border-white/10',
              !prompt.is_active && 'opacity-50',
            )}
          >
            {/* Header Row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : prompt.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white truncate">
                    {prompt.prompt_key}
                  </span>
                  {modified && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-gold/10 text-gold border border-gold/20">
                      Geändert
                    </span>
                  )}
                  {prompt.is_default && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/30 border border-white/10">
                      Default
                    </span>
                  )}
                  {prompt.content_format && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {FORMATS.find((f) => f.value === prompt.content_format)?.label ?? prompt.content_format}
                    </span>
                  )}
                  {prompt.platform && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {PLATFORMS.find((p) => p.value === prompt.platform)?.label ?? prompt.platform}
                    </span>
                  )}
                </div>
                {prompt.description && (
                  <p className="text-[10px] text-white/30 mt-0.5 truncate">{prompt.description}</p>
                )}
              </div>
              <span className="text-[10px] text-white/20">{prompt.model.split('/')[1]}</span>
              {isExpanded
                ? <ChevronUp className="h-4 w-4 text-white/30 shrink-0" strokeWidth={1.5} />
                : <ChevronDown className="h-4 w-4 text-white/30 shrink-0" strokeWidth={1.5} />
              }
            </button>

            {/* Expanded Editor */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                {/* Meta Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Model */}
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                      Modell
                    </label>
                    <select
                      value={(getEffective(prompt, 'model') as string)}
                      onChange={(e) => updateDraft(prompt.id, { model: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.5)] text-xs text-white focus:border-gold/30 focus:outline-none"
                    >
                      {MODELS.map((m) => (
                        <option key={m} value={m}>{m.split('/')[1]}</option>
                      ))}
                    </select>
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                      Temperature: {Number(getEffective(prompt, 'temperature')).toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={Number(getEffective(prompt, 'temperature'))}
                      onChange={(e) => updateDraft(prompt.id, { temperature: parseFloat(e.target.value) })}
                      className="w-full accent-gold h-1.5 mt-2"
                    />
                  </div>

                  {/* Max Tokens */}
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={Number(getEffective(prompt, 'max_tokens'))}
                      onChange={(e) => updateDraft(prompt.id, { max_tokens: parseInt(e.target.value) || 1500 })}
                      min={100}
                      max={8000}
                      step={100}
                      className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.5)] text-xs text-white focus:border-gold/30 focus:outline-none"
                    />
                  </div>

                  {/* Format Selector */}
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                      Format
                    </label>
                    <select
                      value={(getEffective(prompt, 'content_format') as string) ?? ''}
                      onChange={(e) => updateDraft(prompt.id, { content_format: e.target.value || null } as Partial<SystemPrompt>)}
                      className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.5)] text-xs text-white focus:border-gold/30 focus:outline-none"
                    >
                      {FORMATS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Platform + Description Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                      Plattform
                    </label>
                    <select
                      value={(getEffective(prompt, 'platform') as string) ?? ''}
                      onChange={(e) => updateDraft(prompt.id, { platform: e.target.value || null } as Partial<SystemPrompt>)}
                      className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.5)] text-xs text-white focus:border-gold/30 focus:outline-none"
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                      Beschreibung
                    </label>
                    <input
                      value={(getEffective(prompt, 'description') as string) ?? ''}
                      onChange={(e) => updateDraft(prompt.id, { description: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.5)] text-xs text-white placeholder:text-white/20 focus:border-gold/30 focus:outline-none"
                      placeholder="Kurze Beschreibung..."
                    />
                  </div>
                </div>

                {/* System Prompt Textarea */}
                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                    System Prompt ({((getEffective(prompt, 'system_prompt') as string) ?? '').length} Zeichen)
                  </label>
                  <textarea
                    value={(getEffective(prompt, 'system_prompt') as string)}
                    onChange={(e) => updateDraft(prompt.id, { system_prompt: e.target.value })}
                    rows={14}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[rgba(5,20,30,0.6)] text-xs text-white/90 font-mono leading-relaxed placeholder:text-white/20 focus:border-gold/30 focus:outline-none resize-y"
                  />
                </div>

                {/* Test Area */}
                <div className="rounded-lg border border-white/5 bg-[rgba(5,20,30,0.4)] p-3 space-y-2">
                  <label className="text-[10px] text-white/30 uppercase tracking-wider block">
                    Test-Content
                  </label>
                  <textarea
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                    rows={3}
                    placeholder="Beispiel-Content eingeben um den Prompt zu testen..."
                    className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] text-xs text-white placeholder:text-white/20 focus:border-gold/30 focus:outline-none resize-none"
                  />
                  {testResult && (
                    <pre className="text-[10px] text-emerald-300/70 bg-emerald-500/5 rounded-lg p-2 overflow-auto max-h-48 font-mono whitespace-pre-wrap">
                      {testResult}
                    </pre>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleSave(prompt)}
                    disabled={!modified || saving === prompt.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-xs font-medium text-gold hover:bg-gold/20 disabled:opacity-30 transition-colors"
                  >
                    {saving === prompt.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : successId === prompt.id ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
                    )}
                    {successId === prompt.id ? 'Gespeichert!' : 'Speichern'}
                  </button>

                  <button
                    onClick={() => handleTest(prompt)}
                    disabled={testing === prompt.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white/80 transition-colors"
                  >
                    {testing === prompt.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
                    )}
                    Testen
                  </button>

                  <button
                    onClick={() => handleToggleActive(prompt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/40 hover:text-white/60 transition-colors"
                  >
                    {prompt.is_active
                      ? <ToggleRight className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.5} />
                      : <ToggleLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                    }
                    {prompt.is_active ? 'Aktiv' : 'Inaktiv'}
                  </button>

                  {!prompt.is_default && (
                    <button
                      onClick={() => handleDelete(prompt)}
                      className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Löschen
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
