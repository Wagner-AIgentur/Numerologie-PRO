'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Trash2, Plus, X, Zap, Filter, Play,
  CheckCircle2, AlertTriangle, Clock,
} from 'lucide-react';

/* ── Types ── */
interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface Action {
  type: string;
  [key: string]: unknown;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  trigger_event: string;
  conditions: unknown;
  actions: unknown;
  is_active: boolean | null;
  run_count: number | null;
  last_run_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface LogEntry {
  id: string;
  profile_id: string | null;
  trigger_event: string;
  trigger_data: unknown;
  actions_executed: unknown;
  status: string | null;
  error: string | null;
  created_at: string | null;
}

interface Props {
  locale: string;
  rule: AutomationRule;
  logs: LogEntry[];
}

/* ── Constants ── */
const TRIGGER_EVENTS = [
  'lead_created', 'lead_verified', 'profile_updated',
  'order_completed', 'order_refunded', 'session_scheduled',
  'session_completed', 'tag_added', 'tag_removed',
  'contact_submitted', 'crm_status_changed', 'follow_up_due',
  'instagram_dm_received', 'instagram_lead_received',
] as const;

const TRIGGER_LABELS: Record<string, Record<string, string>> = {
  de: {
    lead_created: 'Lead erstellt', lead_verified: 'Lead verifiziert',
    profile_updated: 'Profil aktualisiert', order_completed: 'Bestellung abgeschlossen',
    order_refunded: 'Erstattung', session_scheduled: 'Sitzung geplant',
    session_completed: 'Sitzung abgeschlossen', tag_added: 'Tag hinzugefügt',
    tag_removed: 'Tag entfernt', contact_submitted: 'Kontakt eingereicht',
    instagram_dm_received: 'Instagram DM empfangen',
    instagram_lead_received: 'Instagram Lead Ad',
    crm_status_changed: 'Status geändert', follow_up_due: 'Follow-up fällig',
  },
  ru: {
    lead_created: 'Лид создан', lead_verified: 'Лид подтверждён',
    profile_updated: 'Профиль обновлён', order_completed: 'Заказ завершён',
    order_refunded: 'Возврат', session_scheduled: 'Сессия запланирована',
    session_completed: 'Сессия завершена', tag_added: 'Тег добавлен',
    tag_removed: 'Тег удалён', contact_submitted: 'Обращение отправлено',
    instagram_dm_received: 'Instagram DM получено',
    instagram_lead_received: 'Instagram Lead Ad',
    crm_status_changed: 'Статус изменён', follow_up_due: 'Напоминание',
  },
};

const CONDITION_FIELDS = [
  { value: 'language', label: { de: 'Sprache', ru: 'Язык' } },
  { value: 'crm_status', label: { de: 'CRM Status', ru: 'CRM статус' } },
  { value: 'tags', label: { de: 'Tags', ru: 'Теги' } },
  { value: 'lead_score', label: { de: 'Lead Score', ru: 'Оценка лида' } },
  { value: 'source', label: { de: 'Quelle', ru: 'Источник' } },
  { value: 'order_amount', label: { de: 'Bestellwert', ru: 'Сумма заказа' } },
  { value: 'package_key', label: { de: 'Paket', ru: 'Пакет' } },
];

const OPERATORS = [
  { value: 'eq', label: '=' },
  { value: 'neq', label: '≠' },
  { value: 'gt', label: '>' },
  { value: 'gte', label: '≥' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '≤' },
  { value: 'contains', label: { de: 'enthält', ru: 'содержит' } },
  { value: 'not_contains', label: { de: 'enthält nicht', ru: 'не содержит' } },
];

const ACTION_TYPES = [
  { value: 'add_tag', label: { de: 'Tag hinzufügen', ru: 'Добавить тег' } },
  { value: 'remove_tag', label: { de: 'Tag entfernen', ru: 'Удалить тег' } },
  { value: 'change_status', label: { de: 'Status ändern', ru: 'Изменить статус' } },
  { value: 'send_email', label: { de: 'E-Mail senden', ru: 'Отправить email' } },
  { value: 'send_telegram', label: { de: 'Telegram senden', ru: 'Отправить Telegram' } },
  { value: 'create_note', label: { de: 'Notiz erstellen', ru: 'Создать заметку' } },
  { value: 'create_task', label: { de: 'Aufgabe erstellen', ru: 'Создать задачу' } },
  { value: 'enroll_sequence', label: { de: 'In Sequenz einschreiben', ru: 'Добавить в последовательность' } },
  { value: 'send_instagram_dm', label: { de: 'Instagram DM senden', ru: 'Отправить Instagram DM' } },
];

/* ── Component ── */
export default function AutomationBuilderShell({ locale, rule, logs }: Props) {
  const router = useRouter();
  const triggers = TRIGGER_LABELS[locale] ?? TRIGGER_LABELS.de;
  const de = locale === 'de';

  const [name, setName] = useState(rule.name);
  const [description, setDescription] = useState(rule.description ?? '');
  const [triggerEvent, setTriggerEvent] = useState(rule.trigger_event);
  const [isActive, setIsActive] = useState(rule.is_active ?? false);
  const [conditions, setConditions] = useState<Condition[]>((rule.conditions as Condition[]) ?? []);
  const [actions, setActions] = useState<Action[]>((rule.actions as Action[]) ?? []);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'builder' | 'logs'>('builder');

  /* ── Conditions CRUD ── */
  const addCondition = () => setConditions([...conditions, { field: 'language', operator: 'eq', value: '' }]);
  const updateCondition = (i: number, key: keyof Condition, val: string) => {
    const next = [...conditions];
    next[i] = { ...next[i], [key]: val };
    setConditions(next);
  };
  const removeCondition = (i: number) => setConditions(conditions.filter((_, idx) => idx !== i));

  /* ── Actions CRUD ── */
  const addAction = () => setActions([...actions, { type: 'add_tag', value: '' }]);
  const updateAction = (i: number, updates: Partial<Action>) => {
    const next = [...actions];
    next[i] = { ...next[i], ...updates };
    setActions(next);
  };
  const removeAction = (i: number) => setActions(actions.filter((_, idx) => idx !== i));

  /* ── Save ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/automations/${rule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, description: description || null,
          trigger_event: triggerEvent,
          conditions, actions, is_active: isActive,
        }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!confirm(de ? 'Regel wirklich löschen?' : 'Удалить правило?')) return;
    await fetch(`/api/admin/automations/${rule.id}`, { method: 'DELETE' });
    router.push(`/${locale}/admin/automatisierung`);
  };

  const getLabel = (item: { label: string | Record<string, string> }) =>
    typeof item.label === 'string' ? item.label : (item.label as Record<string, string>)[locale] ?? (item.label as Record<string, string>).de;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link href={`/${locale}/admin/automatisierung`} className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> {de ? 'Alle Regeln' : 'Все правила'}
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={handleDelete} className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? '...' : (de ? 'Speichern' : 'Сохранить')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/10">
        <button
          onClick={() => setTab('builder')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${tab === 'builder' ? 'bg-gold/10 text-gold' : 'text-white/50 hover:text-white'}`}
        >
          {de ? 'Rule Builder' : 'Конструктор'}
        </button>
        <button
          onClick={() => setTab('logs')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${tab === 'logs' ? 'bg-gold/10 text-gold' : 'text-white/50 hover:text-white'}`}
        >
          {de ? 'Ausführungen' : 'Выполнения'} ({logs.length})
        </button>
      </div>

      {tab === 'builder' ? (
        <div className="space-y-6">
          {/* ── Settings Card ── */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">{de ? 'Einstellungen' : 'Настройки'}</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/10 rounded-full peer-checked:bg-emerald-500/30 transition-colors relative">
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${isActive ? 'translate-x-4 bg-emerald-400' : 'bg-white/40'}`} />
                </div>
                <span className="text-xs text-white/50">{de ? 'Aktiv' : 'Активно'}</span>
              </label>
            </div>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={de ? 'Regelname' : 'Название правила'}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={de ? 'Beschreibung (optional)' : 'Описание (необязательно)'}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:border-gold/30 focus:outline-none resize-none"
            />
          </div>

          {/* ── Trigger Card ── */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-400" /> {de ? 'Trigger (Wenn...)' : 'Триггер (Когда...)'}
            </h3>
            <select
              value={triggerEvent}
              onChange={(e) => setTriggerEvent(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-gold/30 focus:outline-none"
            >
              {TRIGGER_EVENTS.map((ev) => (
                <option key={ev} value={ev} className="bg-[#0a1628]">
                  {triggers[ev] ?? ev}
                </option>
              ))}
            </select>
          </div>

          {/* ── Conditions Card ── */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4 text-amber-400" /> {de ? 'Bedingungen (Nur wenn...)' : 'Условия (Только если...)'}
              </h3>
              <button onClick={addCondition} className="flex items-center gap-1 text-xs text-gold/70 hover:text-gold transition-colors">
                <Plus className="h-3.5 w-3.5" /> {de ? 'Hinzufügen' : 'Добавить'}
              </button>
            </div>

            {conditions.length === 0 && (
              <p className="text-white/30 text-sm">{de ? 'Keine Bedingungen — Regel wird immer ausgeführt.' : 'Нет условий — правило выполняется всегда.'}</p>
            )}

            {conditions.map((cond, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={cond.field}
                  onChange={(e) => updateCondition(i, 'field', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold/30 focus:outline-none flex-1"
                >
                  {CONDITION_FIELDS.map((f) => (
                    <option key={f.value} value={f.value} className="bg-[#0a1628]">
                      {(f.label as Record<string, string>)[locale] ?? (f.label as Record<string, string>).de}
                    </option>
                  ))}
                </select>

                <select
                  value={cond.operator}
                  onChange={(e) => updateCondition(i, 'operator', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold/30 focus:outline-none w-28"
                >
                  {OPERATORS.map((op) => (
                    <option key={op.value} value={op.value} className="bg-[#0a1628]">
                      {getLabel(op)}
                    </option>
                  ))}
                </select>

                <input
                  value={cond.value}
                  onChange={(e) => updateCondition(i, 'value', e.target.value)}
                  placeholder={de ? 'Wert' : 'Значение'}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-gold/30 focus:outline-none flex-1"
                />

                <button onClick={() => removeCondition(i)} className="p-1.5 text-red-400/50 hover:text-red-400 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* ── Actions Card ── */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Play className="h-4 w-4 text-purple-400" /> {de ? 'Aktionen (Dann...)' : 'Действия (Тогда...)'}
              </h3>
              <button onClick={addAction} className="flex items-center gap-1 text-xs text-gold/70 hover:text-gold transition-colors">
                <Plus className="h-3.5 w-3.5" /> {de ? 'Hinzufügen' : 'Добавить'}
              </button>
            </div>

            {actions.length === 0 && (
              <p className="text-white/30 text-sm">{de ? 'Keine Aktionen definiert.' : 'Действия не определены.'}</p>
            )}

            {actions.map((action, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={action.type}
                    onChange={(e) => {
                      const newAction: Action = { type: e.target.value };
                      updateAction(i, newAction);
                    }}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold/30 focus:outline-none flex-1"
                  >
                    {ACTION_TYPES.map((at) => (
                      <option key={at.value} value={at.value} className="bg-[#0a1628]">
                        {getLabel(at)}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => removeAction(i)} className="p-1.5 text-red-400/50 hover:text-red-400 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Dynamic fields based on action type */}
                {(action.type === 'add_tag' || action.type === 'remove_tag') && (
                  <input
                    value={(action.value as string) ?? ''}
                    onChange={(e) => updateAction(i, { value: e.target.value })}
                    placeholder={de ? 'Tag-Name' : 'Название тега'}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
                  />
                )}

                {action.type === 'change_status' && (
                  <select
                    value={(action.value as string) ?? ''}
                    onChange={(e) => updateAction(i, { value: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold/30 focus:outline-none"
                  >
                    <option value="" className="bg-[#0a1628]">—</option>
                    <option value="lead" className="bg-[#0a1628]">Lead</option>
                    <option value="client" className="bg-[#0a1628]">Client</option>
                    <option value="vip" className="bg-[#0a1628]">VIP</option>
                    <option value="inactive" className="bg-[#0a1628]">Inactive</option>
                  </select>
                )}

                {action.type === 'send_email' && (
                  <div className="space-y-2">
                    <input
                      value={(action.subject as string) ?? ''}
                      onChange={(e) => updateAction(i, { subject: e.target.value })}
                      placeholder={de ? 'Betreff' : 'Тема'}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
                    />
                    <textarea
                      value={(action.content as string) ?? ''}
                      onChange={(e) => updateAction(i, { content: e.target.value })}
                      placeholder={de ? 'E-Mail Inhalt (HTML)' : 'Содержание email (HTML)'}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-gold/30 focus:outline-none resize-none"
                    />
                  </div>
                )}

                {action.type === 'send_telegram' && (
                  <textarea
                    value={(action.message as string) ?? ''}
                    onChange={(e) => updateAction(i, { message: e.target.value })}
                    placeholder={de ? 'Telegram Nachricht' : 'Сообщение Telegram'}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-gold/30 focus:outline-none resize-none"
                  />
                )}

                {action.type === 'create_note' && (
                  <div className="space-y-2">
                    <input
                      value={(action.content as string) ?? ''}
                      onChange={(e) => updateAction(i, { content: e.target.value })}
                      placeholder={de ? 'Notiz-Inhalt' : 'Текст заметки'}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
                    />
                    <select
                      value={(action.note_type as string) ?? 'note'}
                      onChange={(e) => updateAction(i, { note_type: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold/30 focus:outline-none"
                    >
                      <option value="note" className="bg-[#0a1628]">{de ? 'Notiz' : 'Заметка'}</option>
                      <option value="call" className="bg-[#0a1628]">{de ? 'Anruf' : 'Звонок'}</option>
                      <option value="email" className="bg-[#0a1628]">Email</option>
                    </select>
                  </div>
                )}

                {action.type === 'create_task' && (
                  <div className="space-y-2">
                    <input
                      value={(action.title as string) ?? ''}
                      onChange={(e) => updateAction(i, { title: e.target.value })}
                      placeholder={de ? 'Aufgaben-Titel' : 'Название задачи'}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={(action.priority as string) ?? 'medium'}
                        onChange={(e) => updateAction(i, { priority: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-gold/30 focus:outline-none"
                      >
                        <option value="low" className="bg-[#0a1628]">{de ? 'Niedrig' : 'Низкий'}</option>
                        <option value="medium" className="bg-[#0a1628]">{de ? 'Mittel' : 'Средний'}</option>
                        <option value="high" className="bg-[#0a1628]">{de ? 'Hoch' : 'Высокий'}</option>
                        <option value="urgent" className="bg-[#0a1628]">{de ? 'Dringend' : 'Срочный'}</option>
                      </select>
                      <input
                        type="number"
                        value={(action.due_days as number) ?? ''}
                        onChange={(e) => updateAction(i, { due_days: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder={de ? 'Fällig in X Tagen' : 'Через X дней'}
                        min={0}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {action.type === 'enroll_sequence' && (
                  <input
                    value={(action.sequence_id as string) ?? ''}
                    onChange={(e) => updateAction(i, { sequence_id: e.target.value })}
                    placeholder={de ? 'Sequenz-ID (UUID)' : 'ID последовательности (UUID)'}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
                  />
                )}

                {action.type === 'send_instagram_dm' && (
                  <textarea
                    value={(action.message as string) ?? ''}
                    onChange={(e) => updateAction(i, { message: e.target.value })}
                    placeholder={de ? 'Instagram DM Nachricht' : 'Сообщение Instagram DM'}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:border-gold/30 focus:outline-none resize-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Logs Tab ── */
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>{de ? 'Noch keine Ausführungen.' : 'Выполнений пока нет.'}</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3"
              >
                {log.status === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />}
                {log.status === 'partial' && <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />}
                {log.status === 'failed' && <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-white/60">
                      {triggers[log.trigger_event] ?? log.trigger_event}
                    </span>
                    <span className="text-[11px] text-white/30">
                      {new Date(log.created_at ?? '').toLocaleDateString(de ? 'de-DE' : 'ru-RU', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {!!log.actions_executed && (
                    <p className="text-xs text-white/40 mt-1">
                      {(log.actions_executed as Action[]).map((a) => {
                        const at = ACTION_TYPES.find((t) => t.value === a.type);
                        return at ? getLabel(at) : a.type;
                      }).join(', ')}
                    </p>
                  )}

                  {log.error && (
                    <p className="text-xs text-red-400/80 mt-1 font-mono">{log.error}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
