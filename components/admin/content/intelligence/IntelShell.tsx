'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Shield, Newspaper, BarChart3, Brain, Sparkles, TrendingUp } from 'lucide-react';
import CompetitorDashboard from './CompetitorDashboard';
import IntelFeed from './IntelFeed';
import ContentGapPanel from './ContentGapPanel';
import BrandVoicePanel from './BrandVoicePanel';
import SmartOnboardingPanel from './SmartOnboardingPanel';
import StrategyDashboard from './StrategyDashboard';

type IntelView = 'onboard' | 'competitors' | 'feed' | 'strategy' | 'gaps' | 'memory';

interface Competitor {
  id: string;
  name: string;
  social_accounts: Record<string, string>;
  intel_count?: number;
}

interface Props {
  locale: string;
  t: Record<string, string>;
  onInspire?: (intelId: string) => void;
  onFillGap?: (topic: string, funnelStage: string) => void;
}

const views: { id: IntelView; labelKey: string; icon: typeof Shield }[] = [
  { id: 'onboard', labelKey: 'csSmartOnboard', icon: Sparkles },
  { id: 'competitors', labelKey: 'csIntelCompetitors', icon: Shield },
  { id: 'feed', labelKey: 'csIntelFeed', icon: Newspaper },
  { id: 'strategy', labelKey: 'csStrategy', icon: TrendingUp },
  { id: 'gaps', labelKey: 'csIntelGaps', icon: BarChart3 },
  { id: 'memory', labelKey: 'csBrandVoice', icon: Brain },
];

export default function IntelShell({ locale, t, onInspire, onFillGap }: Props) {
  const [activeView, setActiveView] = useState<IntelView>('onboard');
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string | undefined>();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  const loadCompetitors = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content/competitors?limit=50');
      const data = await res.json();
      setCompetitors(data.data ?? []);
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => { loadCompetitors(); }, [loadCompetitors]);

  function handleViewIntel(competitorId: string) {
    setSelectedCompetitorId(competitorId);
    setActiveView('feed');
  }

  function handleOnboardComplete(competitorId: string) {
    loadCompetitors();
    setSelectedCompetitorId(competitorId);
    setActiveView('feed');
  }

  function handleGenerateContent(context: { topic?: string; funnel_stage?: string; inspiration_id?: string }) {
    if (context.inspiration_id) {
      sessionStorage.setItem('inspire_intel_id', context.inspiration_id);
    }
    if (context.topic) {
      sessionStorage.setItem('gap_topic', context.topic);
    }
    if (context.funnel_stage) {
      sessionStorage.setItem('gap_funnel', context.funnel_stage);
    }
    // Trigger parent to switch to Studio tab
    onFillGap?.(context.topic ?? '', context.funnel_stage ?? 'tofu');
  }

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {views.map((view) => {
          const Icon = view.icon;
          const isActive = activeView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => {
                setActiveView(view.id);
                if (view.id !== 'feed') setSelectedCompetitorId(undefined);
              }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  : 'text-white/40 hover:text-white/60 border border-transparent',
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {t[view.labelKey] ?? view.id}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeView === 'onboard' && (
        <SmartOnboardingPanel
          locale={locale}
          t={t}
          onComplete={handleOnboardComplete}
          onGenerateContent={(compId) => {
            handleGenerateContent({});
          }}
        />
      )}

      {activeView === 'competitors' && (
        <CompetitorDashboard locale={locale} t={t} onViewIntel={handleViewIntel} />
      )}

      {activeView === 'feed' && (
        <IntelFeed
          locale={locale}
          t={t}
          competitorId={selectedCompetitorId}
          onInspire={onInspire}
        />
      )}

      {activeView === 'strategy' && (
        <StrategyDashboard
          locale={locale}
          t={t}
          competitors={competitors}
          onGenerateContent={handleGenerateContent}
        />
      )}

      {activeView === 'gaps' && (
        <ContentGapPanel locale={locale} t={t} onFillGap={onFillGap} />
      )}

      {activeView === 'memory' && (
        <BrandVoicePanel locale={locale} t={t} />
      )}
    </div>
  );
}
