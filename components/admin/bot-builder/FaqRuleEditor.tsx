'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { getAdminT } from '@/lib/i18n/admin';
import { X } from 'lucide-react';
import type { FaqRule } from './BotBuilderShell';

interface Props {
  locale: string;
  rule: FaqRule | null;
  onSave: (data: Partial<FaqRule>) => Promise<void>;
  onClose: () => void;
}

export default function FaqRuleEditor({ locale, rule, onSave, onClose }: Props) {
  const t = getAdminT(locale);
  const isNew = !rule;

  const [keywords, setKeywords] = useState<string[]>(rule?.keywords ?? []);
  const [keywordInput, setKeywordInput] = useState('');
  const [responseDe, setResponseDe] = useState(rule?.response_de ?? '');
  const [responseRu, setResponseRu] = useState(rule?.response_ru ?? '');
  const [priority, setPriority] = useState(rule?.priority ?? 0);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addKeyword = (value: string) => {
    const kw = value.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
    }
    setKeywordInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword(keywordInput);
    }
    if (e.key === 'Backspace' && !keywordInput && keywords.length > 0) {
      setKeywords(keywords.slice(0, -1));
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add any remaining input as keyword
    if (keywordInput.trim()) {
      addKeyword(keywordInput);
    }
    setSaving(true);
    try {
      await onSave({
        keywords: keywordInput.trim()
          ? [...keywords, keywordInput.trim().toLowerCase()]
          : keywords,
        response_de: responseDe,
        response_ru: responseRu,
        priority,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[rgba(5,26,36,0.95)] backdrop-blur-xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-lg font-bold text-white">
            {isNew ? t.bbNewFaqRule : t.bbEditFaqRule}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Keywords */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">{t.bbKeywords}</label>
            <div
              className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-white/10 bg-white/5 min-h-[40px] cursor-text"
              onClick={() => inputRef.current?.focus()}
            >
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-gold/70"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeKeyword(kw);
                    }}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="h-3 w-3" strokeWidth={2} />
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => keywordInput.trim() && addKeyword(keywordInput)}
                placeholder={keywords.length === 0 ? t.bbKeywordsPlaceholder : ''}
                className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-white/30 mt-1">{t.bbKeywordsHint}</p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">{t.bbPriority}</label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
              min={0}
              max={100}
              className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-gold/30 focus:outline-none transition-colors"
            />
            <p className="text-[10px] text-white/30 mt-1">{t.bbPriorityHint}</p>
          </div>

          {/* Response DE */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">{t.bbResponseDe}</label>
            <textarea
              value={responseDe}
              onChange={(e) => setResponseDe(e.target.value)}
              rows={3}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-gold/30 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Response RU */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">{t.bbResponseRu}</label>
            <textarea
              value={responseRu}
              onChange={(e) => setResponseRu(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-gold/30 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={saving || keywords.length === 0}
              className="px-5 py-2 rounded-xl bg-gold/10 border border-gold/30 text-sm font-medium text-gold hover:bg-gold/20 transition-colors disabled:opacity-50"
            >
              {saving ? t.bbSaving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
