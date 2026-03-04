'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Tag,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Save,
  ShoppingBag,
  Users,
  MessageCircle,
  Clock,
  DollarSign,
  Calendar,
  Globe,
  Link2,
  CheckCircle,
} from 'lucide-react';

interface TagRule {
  id: string;
  tag_name: string;
  description: string | null;
  condition_type: string;
  condition_value: string;
  auto_remove: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
}

interface Props {
  rules: TagRule[];
  locale: string;
}

const CONDITION_TYPES = [
  { value: 'order_count_gte', de: 'Bestellungen ≥', ru: 'Заказов ≥', icon: ShoppingBag },
  { value: 'total_revenue_gte', de: 'Umsatz ≥ (Cents)', ru: 'Выручка ≥ (центы)', icon: DollarSign },
  { value: 'has_product', de: 'Hat Produkt gekauft', ru: 'Купил продукт', icon: CheckCircle },
  { value: 'has_session', de: 'Hat Sitzung', ru: 'Есть сессия', icon: Calendar },
  { value: 'inactive_days_gte', de: 'Inaktiv ≥ Tage', ru: 'Неактивен ≥ дней', icon: Clock },
  { value: 'has_telegram', de: 'Hat Telegram', ru: 'Есть Telegram', icon: MessageCircle },
  { value: 'language_is', de: 'Sprache ist', ru: 'Язык', icon: Globe },
  { value: 'source_is', de: 'Quelle ist', ru: 'Источник', icon: Link2 },
  { value: 'has_birthdate', de: 'Hat Geburtstag', ru: 'Есть дата рождения', icon: Calendar },
  { value: 'birthdate_month', de: 'Geburtsmonat', ru: 'Месяц рождения', icon: Calendar },
];

export default function TagRulesShell({ rules: initialRules, locale }: Props) {
  const router = useRouter();
  const [rules, setRules] = useState(initialRules);
  const [showNew, setShowNew] = useState(false);
  const [newRule, setNewRule] = useState({ tag_name: '', description: '', condition_type: 'order_count_gte', condition_value: '', auto_remove: false });
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  const de = locale === 'de';

  async function createRule() {
    if (!newRule.tag_name || !newRule.condition_value) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/tag-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule),
      });
      if (res.ok) {
        setShowNew(false);
        setNewRule({ tag_name: '', description: '', condition_type: 'order_count_gte', condition_value: '', auto_remove: false });
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleRule(rule: TagRule) {
    await fetch(`/api/admin/tag-rules/${rule.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !rule.is_active }),
    });
    setRules(rules.map((r) => (r.id === rule.id ? { ...r, is_active: !r.is_active } : r)));
  }

  async function deleteRule(id: string) {
    if (!confirm(de ? 'Wirklich löschen?' : 'Удалить правило?')) return;
    await fetch(`/api/admin/tag-rules/${id}`, { method: 'DELETE' });
    setRules(rules.filter((r) => r.id !== id));
  }

  async function runNow() {
    setRunning(true);
    try {
      const res = await fetch('/api/admin/tag-rules/run', {
        method: 'POST',
      });
      const data = await res.json();
      alert(de
        ? `Fertig! ${data.tags_added} Tags hinzugefügt, ${data.tags_removed} entfernt, ${data.profiles_updated} Profile aktualisiert.`
        : `Готово! ${data.tags_added} тегов добавлено, ${data.tags_removed} удалено, ${data.profiles_updated} профилей обновлено.`);
    } finally {
      setRunning(false);
    }
  }

  function getConditionLabel(type: string) {
    const ct = CONDITION_TYPES.find((c) => c.value === type);
    return ct ? (de ? ct.de : ct.ru) : type;
  }

  function getConditionIcon(type: string) {
    const ct = CONDITION_TYPES.find((c) => c.value === type);
    return ct?.icon ?? Tag;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">
            {de ? 'Auto-Tagging Regeln' : 'Правила авто-тегов'}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {de
              ? 'Automatische Tags basierend auf Kundenverhalten.'
              : 'Автоматические теги на основе поведения клиентов.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runNow}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${running ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            {de ? 'Jetzt ausführen' : 'Запустить'}
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/30 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/20 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            {de ? 'Neue Regel' : 'Новое правило'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <Tag className="h-3.5 w-3.5" strokeWidth={1.5} />
            {de ? 'Regeln gesamt' : 'Правил всего'}
          </div>
          <p className="text-2xl font-bold text-white">{rules.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-emerald-400/70 text-xs mb-1">
            <ToggleRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            {de ? 'Aktiv' : 'Активных'}
          </div>
          <p className="text-2xl font-bold text-emerald-400">{rules.filter((r) => r.is_active).length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
            {de ? 'Auto-Remove' : 'Авто-удаление'}
          </div>
          <p className="text-2xl font-bold text-white">{rules.filter((r) => r.auto_remove).length}</p>
        </div>
      </div>

      {/* New Rule Form */}
      {showNew && (
        <div className="rounded-2xl border border-gold/20 bg-gold/[0.02] p-6 space-y-4">
          <h3 className="text-white font-medium">{de ? 'Neue Regel erstellen' : 'Создать правило'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">{de ? 'Tag-Name' : 'Название тега'}</label>
              <input
                type="text"
                value={newRule.tag_name}
                onChange={(e) => setNewRule({ ...newRule, tag_name: e.target.value })}
                placeholder={de ? 'z.B. PDF-Kaufer' : 'напр. PDF-покупатель'}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">{de ? 'Bedingung' : 'Условие'}</label>
              <select
                value={newRule.condition_type}
                onChange={(e) => setNewRule({ ...newRule, condition_type: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-gold/30 focus:outline-none"
              >
                {CONDITION_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value} className="bg-[#0a1a24]">
                    {de ? ct.de : ct.ru}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">{de ? 'Wert' : 'Значение'}</label>
              <input
                type="text"
                value={newRule.condition_value}
                onChange={(e) => setNewRule({ ...newRule, condition_value: e.target.value })}
                placeholder={de ? 'Schwellwert / Vergleichswert' : 'Порог / значение'}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">{de ? 'Beschreibung (optional)' : 'Описание'}</label>
              <input
                type="text"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newRule.auto_remove}
                onChange={(e) => setNewRule({ ...newRule, auto_remove: e.target.checked })}
                className="rounded border-white/20 bg-white/5 text-gold focus:ring-gold/30"
              />
              <span className="text-xs text-white/50">
                {de ? 'Tag automatisch entfernen wenn Bedingung nicht mehr zutrifft' : 'Автоматически удалять тег при несоответствии'}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNew(false)}
                className="rounded-xl px-3 py-1.5 text-xs text-white/40 hover:text-white transition-colors"
              >
                {de ? 'Abbrechen' : 'Отмена'}
              </button>
              <button
                onClick={createRule}
                disabled={saving || !newRule.tag_name || !newRule.condition_value}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gold/10 border border-gold/30 px-3 py-1.5 text-xs text-gold hover:bg-gold/20 transition-colors disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? '...' : (de ? 'Erstellen' : 'Создать')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-12 text-center">
          <Tag className="h-12 w-12 text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/40 text-sm">
            {de ? 'Noch keine Regeln erstellt.' : 'Правил пока нет.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => {
            const Icon = getConditionIcon(rule.condition_type);
            return (
              <div
                key={rule.id}
                className={`rounded-2xl border bg-white/[0.02] p-4 transition-all ${
                  rule.is_active ? 'border-white/10' : 'border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="shrink-0 rounded-xl bg-gold/10 p-2">
                      <Tag className="h-4 w-4 text-gold" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white font-medium text-sm">{rule.tag_name}</span>
                        {rule.auto_remove && (
                          <span className="text-[10px] text-white/30 bg-white/5 rounded-full px-1.5 py-0.5">
                            auto-remove
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <Icon className="h-3 w-3" strokeWidth={1.5} />
                        <span>{getConditionLabel(rule.condition_type)}: <span className="text-white/60">{rule.condition_value}</span></span>
                      </div>
                      {rule.description && (
                        <p className="text-xs text-white/30 mt-0.5 truncate">{rule.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleRule(rule)}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      title={rule.is_active ? 'Deaktivieren' : 'Aktivieren'}
                    >
                      {rule.is_active
                        ? <ToggleRight className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                        : <ToggleLeft className="h-5 w-5 text-white/30" strokeWidth={1.5} />}
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
