'use client';

import { useState } from 'react';
import { getAdminT } from '@/lib/i18n/admin';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { FaqRule } from './BotBuilderShell';
import FaqRuleEditor from './FaqRuleEditor';

interface Props {
  locale: string;
  initialFaqRules: FaqRule[];
}

export default function FaqTab({ locale, initialFaqRules }: Props) {
  const [rules, setRules] = useState<FaqRule[]>(initialFaqRules);
  const [editingRule, setEditingRule] = useState<FaqRule | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const t = getAdminT(locale);

  const handleToggle = async (rule: FaqRule) => {
    setSaving(rule.id);
    try {
      const res = await fetch(`/api/admin/bot/faq/${rule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: !rule.is_enabled }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
      }
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (rule: FaqRule) => {
    if (!confirm(t.bbConfirmDelete)) return;
    const res = await fetch(`/api/admin/bot/faq/${rule.id}`, { method: 'DELETE' });
    if (res.ok) {
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
    }
  };

  const handleSave = async (data: Partial<FaqRule>) => {
    if (editingRule) {
      const res = await fetch(`/api/admin/bot/faq/${editingRule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setRules((prev) => prev.map((r) => (r.id === editingRule.id ? updated : r)));
      }
    } else {
      const res = await fetch('/api/admin/bot/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setRules((prev) => [created, ...prev]);
      }
    }
    setShowEditor(false);
    setEditingRule(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">
          {rules.length} {t.bbFaqCount}
        </p>
        <button
          onClick={() => {
            setEditingRule(null);
            setShowEditor(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/30 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/20 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          {t.bbNewFaqRule}
        </button>
      </div>

      {/* FAQ Rules */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Priority badge + keywords */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 font-mono">
                    P{rule.priority}
                  </span>
                  {rule.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-gold/5 border border-gold/10 text-gold/50"
                    >
                      {kw}
                    </span>
                  ))}
                </div>

                {/* Response preview */}
                <p className="text-xs text-white/50 line-clamp-2">
                  {locale === 'de' ? rule.response_de : rule.response_ru}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggle(rule)}
                  disabled={saving === rule.id}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  {rule.is_enabled ? (
                    <ToggleRight className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-white/30" strokeWidth={1.5} />
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditingRule(rule);
                    setShowEditor(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-gold transition-colors"
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => handleDelete(rule)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 sm:p-12 text-center">
            <p className="text-white/40">{t.bbNoFaqRules}</p>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <FaqRuleEditor
          locale={locale}
          rule={editingRule}
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setEditingRule(null);
          }}
        />
      )}
    </div>
  );
}
