'use client';

import { cn } from '@/lib/utils';
import {
  Film, Music, Youtube, Video, Image, Layers, Briefcase, Users,
  Send, FileText, Mail, Clock, Gift, Star, Rocket, Type,
} from 'lucide-react';

const iconMap: Record<string, typeof Film> = {
  Film, Music, Youtube, Video, Image, Layers, Briefcase, Users,
  Send, FileText, Mail, Clock, Gift, Star, Rocket, Type,
};

const categoryColors: Record<string, string> = {
  video: 'border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/5',
  social: 'border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/5',
  longform: 'border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/5',
  engagement: 'border-gold/30 hover:border-gold/50 hover:bg-gold/5',
};

const categoryLabels: Record<string, string> = {
  video: 'Video',
  social: 'Social',
  longform: 'Longform',
  engagement: 'Engagement',
};

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  pipeline_type: string;
  default_triggers: string[];
  default_funnel_stage: string;
  default_model: string;
}

interface Props {
  templates: Template[];
  onSelect: (template: Template) => void;
}

export default function ContentTypeGrid({ templates, onSelect }: Props) {
  // Group by category
  const categories = ['video', 'social', 'longform', 'engagement'];

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const items = templates.filter((t) => t.category === cat);
        if (items.length === 0) return null;

        return (
          <div key={cat}>
            <h3 className="text-xs font-medium uppercase tracking-wider text-white/30 mb-3">
              {categoryLabels[cat] ?? cat}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((template) => {
                const Icon = iconMap[template.icon] ?? FileText;
                return (
                  <button
                    key={template.id}
                    onClick={() => onSelect(template)}
                    className={cn(
                      'flex flex-col items-start gap-2 p-4 rounded-xl border bg-[rgba(15,48,63,0.3)] backdrop-blur-sm transition-all text-left',
                      categoryColors[cat] ?? 'border-white/10 hover:border-white/20',
                    )}
                  >
                    <Icon className="h-5 w-5 text-white/60" strokeWidth={1.5} />
                    <div>
                      <div className="text-sm font-medium text-white">{template.name}</div>
                      <div className="text-xs text-white/40 mt-0.5 line-clamp-2">{template.description}</div>
                    </div>
                    {template.pipeline_type === 'script_then_caption' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        2-Step
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
