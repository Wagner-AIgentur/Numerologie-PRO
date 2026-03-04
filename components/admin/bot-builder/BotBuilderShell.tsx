'use client';

import { useState } from 'react';
import { getAdminT } from '@/lib/i18n/admin';
import { Terminal, HelpCircle, MessageSquareHeart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import CommandsTab from './CommandsTab';
import FaqTab from './FaqTab';
import WelcomeTab from './WelcomeTab';
import SettingsTab from './SettingsTab';

interface Props {
  locale: string;
  initialCommands: BotCommand[];
  initialFaqRules: FaqRule[];
  initialSettings: Record<string, unknown>;
}

export interface BotCommand {
  id: string;
  command: string;
  type: string;
  response_de: string;
  response_ru: string;
  buttons: unknown;
  is_enabled: boolean;
  is_editable: boolean;
  created_at: string | null;
  updated_at: string | null;
  description_de?: string | null;
  description_ru?: string | null;
  sort_order?: number | null;
  response_type?: string | null;
}

export interface ButtonConfig {
  text_de: string;
  text_ru: string;
  url?: string;
  url_template?: string;
  callback_data?: string;
}

export interface FaqRule {
  id: string;
  keywords: string[];
  response_de: string;
  response_ru: string;
  priority: number;
  is_enabled: boolean;
  created_at: string | null;
  updated_at: string | null;
}

type TabId = 'commands' | 'faq' | 'welcome' | 'settings';

export default function BotBuilderShell({ locale, initialCommands, initialFaqRules, initialSettings }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('commands');
  const t = getAdminT(locale);

  const tabs: { id: TabId; label: string; icon: typeof Terminal }[] = [
    { id: 'commands', label: t.bbTabCommands, icon: Terminal },
    { id: 'faq', label: t.bbTabFaq, icon: HelpCircle },
    { id: 'welcome', label: t.bbTabWelcome, icon: MessageSquareHeart },
    { id: 'settings', label: t.bbTabSettings, icon: Settings },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
              activeTab === id
                ? 'bg-gold/10 text-gold border border-gold/20'
                : 'text-white/50 hover:text-white hover:bg-white/5',
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'commands' && <CommandsTab locale={locale} initialCommands={initialCommands} />}
      {activeTab === 'faq' && <FaqTab locale={locale} initialFaqRules={initialFaqRules} />}
      {activeTab === 'welcome' && <WelcomeTab locale={locale} initialSettings={initialSettings} />}
      {activeTab === 'settings' && <SettingsTab locale={locale} initialSettings={initialSettings} />}
    </div>
  );
}
