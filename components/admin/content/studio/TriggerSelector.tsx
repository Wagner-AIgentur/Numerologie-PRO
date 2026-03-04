'use client';

import { cn } from '@/lib/utils';
import {
  Users, Clock, Award, Gift, Anchor, Zap,
} from 'lucide-react';

const iconMap: Record<string, typeof Users> = {
  Users, Clock, Award, Gift, Anchor, Zap,
};

interface Trigger {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

interface Props {
  triggers: Trigger[];
  selected: string[];
  onToggle: (slug: string) => void;
}

export default function TriggerSelector({ triggers, selected, onToggle }: Props) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-white/40 px-1">Trigger (max 3)</div>
      <div className="flex flex-wrap gap-1.5">
        {triggers.map((trigger) => {
          const isSelected = selected.includes(trigger.slug);
          const Icon = iconMap[trigger.icon] ?? Zap;

          return (
            <button
              key={trigger.id}
              onClick={() => {
                if (!isSelected && selected.length >= 3) return;
                onToggle(trigger.slug);
              }}
              title={trigger.description}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                isSelected
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-white/5 text-white/40 hover:text-white/60 hover:border-white/10',
                !isSelected && selected.length >= 3 && 'opacity-30 cursor-not-allowed',
              )}
              style={isSelected ? { borderColor: trigger.color + '60', backgroundColor: trigger.color + '15' } : {}}
            >
              <Icon className="h-3 w-3" strokeWidth={1.5} style={isSelected ? { color: trigger.color } : {}} />
              {trigger.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
