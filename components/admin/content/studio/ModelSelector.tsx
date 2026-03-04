'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Cpu, ChevronDown, Search, X } from 'lucide-react';

interface ModelInfo {
  id: string;
  name: string;
  tier: 'fast' | 'balanced' | 'premium';
  price_prompt: number;
  price_completion: number;
  context_length: number;
}

const tierConfig = {
  fast: { label: 'Fast', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  balanced: { label: 'Balanced', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  premium: { label: 'Premium', color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20' },
};

interface Props {
  selectedModel: string;
  onSelect: (modelId: string) => void;
}

export default function ModelSelector({ selectedModel, onSelect }: Props) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/content/studio/models')
      .then((r) => r.json())
      .then((d) => { setModels(d.models ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Filter models by search term
  const filtered = useMemo(() => {
    if (!search.trim()) return models;
    const q = search.toLowerCase();
    return models.filter(
      (m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q),
    );
  }, [models, search]);

  const selected = models.find((m) => m.id === selectedModel);
  const tier = selected ? tierConfig[selected.tier] : null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm hover:border-white/20 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Cpu className="h-4 w-4 text-white/40 shrink-0" strokeWidth={1.5} />
          <div className="truncate">
            <div className="text-xs text-white/40">AI-Modell</div>
            <div className="text-sm text-white truncate">
              {loading ? '...' : selected?.name ?? selectedModel}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {tier && (
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded', tier.bg, tier.color)}>
              {tier.label}
            </span>
          )}
          {!loading && (
            <span className="text-[10px] text-white/20">{models.length}</span>
          )}
          <ChevronDown className={cn('h-4 w-4 text-white/30 transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-[28rem] rounded-xl border border-white/10 bg-[rgba(10,30,40,0.95)] backdrop-blur-md shadow-xl flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Modell suchen..."
                className="w-full pl-8 pr-8 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/30"
                autoFocus
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  <X className="h-3.5 w-3.5 text-white/30 hover:text-white/60" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>

          {/* Model list */}
          <div className="overflow-y-auto flex-1">
            {(['fast', 'balanced', 'premium'] as const).map((tierKey) => {
              const tierModels = filtered.filter((m) => m.tier === tierKey);
              if (tierModels.length === 0) return null;
              const cfg = tierConfig[tierKey];

              return (
                <div key={tierKey}>
                  <div className={cn('sticky top-0 z-10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider flex items-center justify-between', cfg.bg)}>
                    <span className={cfg.color}>{cfg.label}</span>
                    <span className="text-white/30">{tierModels.length}</span>
                  </div>
                  {tierModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => { onSelect(model.id); setOpen(false); setSearch(''); }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-white/5 transition-colors',
                        model.id === selectedModel && 'bg-gold/5 text-gold',
                      )}
                    >
                      <div className="flex flex-col items-start min-w-0">
                        <span className="truncate text-white/80 text-xs">{model.name}</span>
                        <span className="text-[10px] text-white/20 truncate">{model.id}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] text-white/20">
                          {(model.context_length / 1000).toFixed(0)}K
                        </span>
                        <span className="text-[10px] text-white/30">
                          ${model.price_prompt.toFixed(2)}/M
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-3 py-6 text-center text-white/30 text-sm">
                {search ? 'Kein Modell gefunden' : 'Modelle werden geladen...'}
              </div>
            )}
          </div>

          {/* Footer with total count */}
          <div className="border-t border-white/10 px-3 py-1.5 text-[10px] text-white/20 text-center">
            {filtered.length} / {models.length} Modelle via OpenRouter
          </div>
        </div>
      )}
    </div>
  );
}
