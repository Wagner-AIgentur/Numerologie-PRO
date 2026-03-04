'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Brain, Save, Loader2, RefreshCw } from 'lucide-react';

interface CoreMemory {
  brand_voice: string;
  top_patterns: string;
  strategy: string;
  campaigns: string;
}

const memoryKeys: { key: keyof CoreMemory; label: string; description: string }[] = [
  { key: 'brand_voice', label: 'Brand Voice', description: 'Dein Schreibstil, Ton, Emoji-Nutzung, Humor-Level' },
  { key: 'top_patterns', label: 'Top-Performer Patterns', description: 'Was funktioniert bei deinem Content am besten?' },
  { key: 'strategy', label: 'Content-Strategie', description: 'Funnel-Balance-Ziele, Zielgruppe, Themen-Fokus' },
  { key: 'campaigns', label: 'Aktive Kampagnen', description: 'Laufende Aktionen, Launches, saisonale Themen' },
];

interface Props {
  locale: string;
  t: Record<string, string>;
}

export default function BrandVoicePanel({ locale, t }: Props) {
  const [memory, setMemory] = useState<CoreMemory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editKey, setEditKey] = useState<keyof CoreMemory | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/content/memory/core');
      setMemory(await res.json());
      setLoading(false);
    })();
  }, []);

  async function handleSave(key: keyof CoreMemory) {
    setSaving(key);
    await fetch('/api/admin/content/memory/core', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: editValue }),
    });
    setMemory((prev) => prev ? { ...prev, [key]: editValue } : null);
    setEditKey(null);
    setSaving(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-purple-400" />
        <h3 className="text-sm font-medium text-white">{t.csBrandVoice ?? 'Core Memory'}</h3>
        <span className="text-[10px] text-white/20 ml-2">Tier 1 — Immer im AI-Prompt</span>
      </div>

      <div className="space-y-3">
        {memoryKeys.map(({ key, label, description }) => {
          const value = memory?.[key] ?? '';
          const isEditing = editKey === key;

          return (
            <div key={key} className="rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-medium text-white/80">{label}</span>
                  <span className="text-[10px] text-white/30 ml-2">{description}</span>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => { setEditKey(key); setEditValue(value); }}
                    className="text-[10px] text-gold/60 hover:text-gold transition-colors"
                  >
                    Bearbeiten
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditKey(null)}
                      className="text-[10px] text-white/30 hover:text-white/50"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={() => handleSave(key)}
                      disabled={saving === key}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gold/10 text-[10px] text-gold hover:bg-gold/20 disabled:opacity-50"
                    >
                      {saving === key ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      Speichern
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[rgba(15,48,63,0.3)] text-xs text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none resize-none"
                />
              ) : (
                <p className={cn(
                  'text-xs whitespace-pre-wrap',
                  value ? 'text-white/50' : 'text-white/20 italic',
                )}>
                  {value || 'Noch nicht gesetzt. Wird nach 10 generierten Posts automatisch extrahiert.'}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
