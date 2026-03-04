'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import ContentTypeGrid from './ContentTypeGrid';
import ModelSelector from './ModelSelector';
import FunnelStageSelector from './FunnelStageSelector';
import TriggerSelector from './TriggerSelector';
import GenerationPanel from './GenerationPanel';
import {
  Sparkles,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

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

interface Trigger {
  id: string;
  name: string;
  slug: string;
  description: string;
  prompt_snippet: string;
  icon: string;
  color: string;
  funnel_stages: string[];
}

interface Props {
  locale: string;
  t: Record<string, string>;
}

export default function ContentStudioShell({ locale, t }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.0-flash-001');
  const [selectedFunnel, setSelectedFunnel] = useState('tofu');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);

  // Load templates + triggers on mount
  useEffect(() => {
    async function load() {
      const [tplRes, trigRes] = await Promise.all([
        fetch('/api/admin/content/studio/templates'),
        fetch('/api/admin/content/studio/triggers'),
      ]);
      const [tplData, trigData] = await Promise.all([tplRes.json(), trigRes.json()]);
      setTemplates(tplData.templates ?? []);
      setTriggers(trigData.triggers ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const handleSelectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
    if (template.default_funnel_stage) setSelectedFunnel(template.default_funnel_stage);
    if (template.default_triggers?.length) setSelectedTriggers(template.default_triggers);
    if (template.default_model) setSelectedModel(template.default_model);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedTemplate(null);
    setSelectedTriggers([]);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-6 w-6 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  // Phase 1: Select Content Type
  if (!selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-gold" strokeWidth={1.5} />
          <h2 className="text-lg font-medium text-white">{t.csSelectContentType}</h2>
        </div>
        <ContentTypeGrid
          templates={templates}
          onSelect={handleSelectTemplate}
        />
      </div>
    );
  }

  // Phase 2: Configure + Generate
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-white/50" strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <span>{t.csSelectContentType}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gold">{selectedTemplate.name}</span>
        </div>
        {selectedTemplate.pipeline_type !== 'single' && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
            {selectedTemplate.pipeline_type === 'script_then_caption' ? t.csPipelineScript + ' → ' + t.csPipelineCaption : t.csPipelineCaption}
          </span>
        )}
      </div>

      {/* Configuration Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ModelSelector
          selectedModel={selectedModel}
          onSelect={setSelectedModel}
        />
        <FunnelStageSelector
          selected={selectedFunnel}
          onSelect={setSelectedFunnel}
          t={t}
        />
        <TriggerSelector
          triggers={triggers}
          selected={selectedTriggers}
          onToggle={(slug) => {
            setSelectedTriggers((prev) =>
              prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
            );
          }}
        />
      </div>

      {/* Generation Panel */}
      <GenerationPanel
        locale={locale}
        t={t}
        template={selectedTemplate}
        model={selectedModel}
        funnelStage={selectedFunnel}
        triggers={selectedTriggers}
      />
    </div>
  );
}
