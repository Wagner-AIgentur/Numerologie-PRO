'use client';

import { cn } from '@/lib/utils';

const stages = [
  { id: 'tofu', label: 'funnelTofu', tip: 'funnelTofuTip', color: 'border-blue-500/40 bg-blue-500/10 text-blue-400', dot: 'bg-blue-400' },
  { id: 'mofu', label: 'funnelMofu', tip: 'funnelMofuTip', color: 'border-orange-500/40 bg-orange-500/10 text-orange-400', dot: 'bg-orange-400' },
  { id: 'bofu', label: 'funnelBofu', tip: 'funnelBofuTip', color: 'border-gold/40 bg-gold/10 text-gold', dot: 'bg-gold' },
  { id: 'retention', label: 'funnelRetention', tip: 'funnelRetentionTip', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400' },
];

interface Props {
  selected: string;
  onSelect: (stage: string) => void;
  t: Record<string, string>;
}

export default function FunnelStageSelector({ selected, onSelect, t }: Props) {
  const current = stages.find((s) => s.id === selected) ?? stages[0];

  return (
    <div className="space-y-2">
      <div className="text-xs text-white/40 px-1">{t.csSelectFunnel}</div>
      <div className="flex gap-1 p-1 rounded-xl border border-white/10 bg-[rgba(15,48,63,0.3)]">
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => onSelect(stage.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all',
              selected === stage.id
                ? stage.color + ' border'
                : 'text-white/40 hover:text-white/60 border border-transparent',
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', stage.dot)} />
            {stage.id.toUpperCase()}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-white/30 px-1">{t[current.tip] ?? ''}</p>
    </div>
  );
}
