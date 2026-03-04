'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Calendar, FileText, Megaphone, Shield, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import ContentStudioShell from './studio/ContentStudioShell';
import PostListShell from './posts/PostListShell';
import ContentCalendarShell from './calendar/ContentCalendarShell';
import IntelShell from './intelligence/IntelShell';

type Tab = 'studio' | 'calendar' | 'posts' | 'broadcasts' | 'intel';

interface Props {
  locale: string;
  t: Record<string, string>;
  initialTab?: Tab;
  broadcastsContent: React.ReactNode;
}

const tabs: { id: Tab; labelKey: string; icon: typeof Sparkles }[] = [
  { id: 'studio', labelKey: 'csTabStudio', icon: Sparkles },
  { id: 'calendar', labelKey: 'csTabCalendar', icon: Calendar },
  { id: 'posts', labelKey: 'csTabPosts', icon: FileText },
  { id: 'broadcasts', labelKey: 'csTabBroadcasts', icon: Megaphone },
  { id: 'intel', labelKey: 'csTabIntel', icon: Shield },
];

export default function ContentHubShell({ locale, t, initialTab = 'studio', broadcastsContent }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">{t.contentStudioTitle}</h1>
          <p className="text-white/50 text-sm mt-1">{t.contentStudioSubtitle}</p>
        </div>
        <Link
          href={`/${locale}/admin/content/funnel-guide`}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all text-xs font-medium"
        >
          <GraduationCap className="h-4 w-4" strokeWidth={1.5} />
          Funnel Guide
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                isActive
                  ? 'bg-gold/10 text-gold border border-gold/30'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent',
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {t[tab.labelKey] ?? tab.id}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'studio' && (
          <ContentStudioShell locale={locale} t={t} />
        )}

        {activeTab === 'calendar' && (
          <ContentCalendarShell locale={locale} t={t} />
        )}

        {activeTab === 'posts' && (
          <PostListShell locale={locale} t={t} />
        )}

        {activeTab === 'broadcasts' && broadcastsContent}

        {activeTab === 'intel' && (
          <IntelShell
            locale={locale}
            t={t}
            onInspire={(intelId) => {
              // Bridge: Switch to Studio tab with inspiration context
              // Store intel ID in sessionStorage for Studio to pick up
              sessionStorage.setItem('inspire_intel_id', intelId);
              setActiveTab('studio');
            }}
            onFillGap={(topic, funnelStage) => {
              sessionStorage.setItem('gap_topic', topic);
              sessionStorage.setItem('gap_funnel', funnelStage);
              setActiveTab('studio');
            }}
          />
        )}
      </div>
    </div>
  );
}
