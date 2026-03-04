'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  GripVertical,
  Clock,
  Mail,
  MessageCircle,
  Save,
  ArrowLeft,
  Play,
  Pause,
  Users,
  ChevronDown,
  ChevronUp,
  Globe,
} from 'lucide-react';

interface Step {
  id?: string;
  step_order: number;
  delay_days: number;
  delay_hours: number | null;
  subject: string;
  content_html: string;
  content_telegram: string | null;
  send_telegram: boolean | null;
  is_active: boolean | null;
  subject_ru: string | null;
  content_html_ru: string | null;
  content_telegram_ru: string | null;
  created_at?: string | null;
}

interface Enrollment {
  id: string;
  email: string;
  current_step: number;
  status: string;
  enrolled_at: string;
  profiles?: { full_name: string | null; email: string } | null;
}

interface SequenceData {
  id: string;
  name: string;
  description: string | null;
  trigger_event: string;
  trigger_filter: unknown;
  is_active: boolean | null;
  steps: Step[];
  stats: { total: number; active: number; completed: number; paused: number; unsubscribed: number };
  created_at?: string | null;
  updated_at?: string | null;
}

interface Props {
  sequence: SequenceData;
  locale: string;
}

const TRIGGER_OPTIONS = [
  { value: 'lead_created', de: 'Lead erstellt', ru: 'Лид создан' },
  { value: 'lead_verified', de: 'Lead verifiziert', ru: 'Лид подтверждён' },
  { value: 'profile_created', de: 'Profil erstellt', ru: 'Профиль создан' },
  { value: 'order_completed', de: 'Bestellung abgeschlossen', ru: 'Заказ завершён' },
  { value: 'session_completed', de: 'Sitzung abgeschlossen', ru: 'Сессия завершена' },
  { value: 'tag_added', de: 'Tag hinzugefügt', ru: 'Тег добавлен' },
  { value: 'manual', de: 'Manuell', ru: 'Вручную' },
];

export default function SequenceBuilderShell({ sequence, locale }: Props) {
  const router = useRouter();
  const [name, setName] = useState(sequence.name);
  const [description, setDescription] = useState(sequence.description ?? '');
  const [triggerEvent, setTriggerEvent] = useState(sequence.trigger_event);
  const [isActive, setIsActive] = useState(sequence.is_active);
  const [steps, setSteps] = useState<Step[]>(sequence.steps);
  const [saving, setSaving] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(steps.length > 0 ? 0 : null);
  const [showEnrollments, setShowEnrollments] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentsLoaded, setEnrollmentsLoaded] = useState(false);
  const [contentLang, setContentLang] = useState<'de' | 'ru'>('de');

  const de = locale === 'de';

  function hasRuTranslation(step: Step): boolean {
    return !!(step.subject_ru || step.content_html_ru);
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Update sequence metadata
      const metaRes = await fetch(`/api/admin/sequences/${sequence.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: description || null, trigger_event: triggerEvent, is_active: isActive }),
      });
      if (!metaRes.ok) throw new Error('Sequenz-Metadaten konnten nicht gespeichert werden.');

      // Sync steps: delete removed, update existing, create new
      const existingIds = new Set(steps.filter((s) => s.id).map((s) => s.id));
      const originalIds = sequence.steps.map((s) => s.id).filter(Boolean);

      // Delete removed steps
      for (const origId of originalIds) {
        if (!existingIds.has(origId)) {
          const delRes = await fetch(`/api/admin/sequences/${sequence.id}/steps/${origId}`, { method: 'DELETE' });
          if (!delRes.ok) throw new Error(`Step ${origId} konnte nicht gelöscht werden.`);
        }
      }

      // Update or create steps
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const payload = { ...step, step_order: i };

        if (step.id) {
          const patchRes = await fetch(`/api/admin/sequences/${sequence.id}/steps/${step.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!patchRes.ok) throw new Error(`Step "${step.subject || i + 1}" konnte nicht aktualisiert werden.`);
        } else {
          const postRes = await fetch(`/api/admin/sequences/${sequence.id}/steps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!postRes.ok) throw new Error(`Step "${step.subject || i + 1}" konnte nicht erstellt werden.`);
        }
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Speichern fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setSaving(false);
    }
  }

  function addStep() {
    const newStep: Step = {
      step_order: steps.length,
      delay_days: steps.length === 0 ? 0 : 2,
      delay_hours: 0,
      subject: '',
      content_html: '',
      content_telegram: null,
      send_telegram: false,
      is_active: true,
      subject_ru: null,
      content_html_ru: null,
      content_telegram_ru: null,
    };
    setSteps([...steps, newStep]);
    setExpandedStep(steps.length);
  }

  function removeStep(index: number) {
    setSteps(steps.filter((_, i) => i !== index));
    setExpandedStep(null);
  }

  function updateStep(index: number, updates: Partial<Step>) {
    setSteps(steps.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  }

  function moveStep(index: number, direction: 'up' | 'down') {
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSteps(newSteps);
    setExpandedStep(targetIndex);
  }

  async function loadEnrollments() {
    if (enrollmentsLoaded) {
      setShowEnrollments(!showEnrollments);
      return;
    }
    const res = await fetch(`/api/admin/sequences/${sequence.id}/enrollments`);
    const data = await res.json();
    setEnrollments(data);
    setEnrollmentsLoaded(true);
    setShowEnrollments(true);
  }

  function formatDelay(days: number, hours: number): string {
    const parts = [];
    if (days > 0) parts.push(`${days} ${de ? (days === 1 ? 'Tag' : 'Tage') : (days === 1 ? 'день' : 'дней')}`);
    if (hours > 0) parts.push(`${hours}h`);
    if (parts.length === 0) return de ? 'Sofort' : 'Сразу';
    return parts.join(' ');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/${locale}/admin/sequenzen`)}
            className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-white">{name || (de ? 'Neue Sequenz' : 'Новая последовательность')}</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {de ? 'Sequenz-Builder' : 'Конструктор последовательности'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
            }`}
          >
            {isActive ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {isActive ? (de ? 'Aktiv' : 'Активна') : (de ? 'Inaktiv' : 'Неактивна')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/30 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/20 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" strokeWidth={1.5} />
            {saving ? (de ? 'Speichere...' : 'Сохранение...') : (de ? 'Speichern' : 'Сохранить')}
          </button>
        </div>
      </div>

      {/* Sequence Settings */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/50 mb-1.5">{de ? 'Name' : 'Название'}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={de ? 'z.B. Lead Nurturing' : 'напр. Нуртуринг лидов'}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5">{de ? 'Trigger' : 'Триггер'}</label>
            <select
              value={triggerEvent}
              onChange={(e) => setTriggerEvent(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-gold/30 focus:outline-none transition-colors"
            >
              {TRIGGER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0a1a24]">
                  {de ? opt.de : opt.ru}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1.5">{de ? 'Beschreibung (optional)' : 'Описание (необязательно)'}</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={de ? 'Kurze Beschreibung der Sequenz...' : 'Краткое описание...'}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-white/40">
          <Users className="h-4 w-4 inline mr-1" />
          {sequence.stats.total} {de ? 'Enrollments' : 'подписчиков'}
        </span>
        <span className="text-emerald-400/60">
          {sequence.stats.active} {de ? 'aktiv' : 'активных'}
        </span>
        <span className="text-white/30">
          {sequence.stats.completed} {de ? 'abgeschlossen' : 'завершённых'}
        </span>
        <button
          onClick={loadEnrollments}
          className="text-gold/60 hover:text-gold text-xs underline underline-offset-2 transition-colors"
        >
          {showEnrollments ? (de ? 'Ausblenden' : 'Скрыть') : (de ? 'Alle anzeigen' : 'Показать все')}
        </button>
      </div>

      {/* Enrollments List */}
      {showEnrollments && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 max-h-64 overflow-y-auto">
          {enrollments.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-4">
              {de ? 'Keine Enrollments.' : 'Нет подписчиков.'}
            </p>
          ) : (
            <div className="space-y-2">
              {enrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                  <div>
                    <span className="text-white">{(e.profiles as any)?.full_name ?? e.email}</span>
                    <span className="text-white/30 ml-2 text-xs">{e.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-white/40">Step {e.current_step + 1}</span>
                    <span className={`rounded-full px-2 py-0.5 ${
                      e.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      e.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-white/5 text-white/40'
                    }`}>
                      {e.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-medium">
            {de ? 'Steps' : 'Шаги'} ({steps.length})
          </h2>
          <button
            onClick={addStep}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            {de ? 'Step hinzufügen' : 'Добавить шаг'}
          </button>
        </div>

        {steps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <Mail className="h-10 w-10 text-white/15 mx-auto mb-3" strokeWidth={1} />
            <p className="text-white/30 text-sm mb-3">
              {de ? 'Noch keine Steps. Füge den ersten hinzu.' : 'Шагов пока нет. Добавьте первый.'}
            </p>
            <button
              onClick={addStep}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gold/10 border border-gold/30 px-3 py-1.5 text-xs text-gold hover:bg-gold/20 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              {de ? 'Ersten Step erstellen' : 'Создать первый шаг'}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div
                key={step.id ?? `new-${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
              >
                {/* Step Header */}
                <button
                  onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <GripVertical className="h-4 w-4 text-white/20 shrink-0" strokeWidth={1.5} />
                  <div className="flex items-center gap-2 text-xs text-white/30 shrink-0 w-20">
                    <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {formatDelay(step.delay_days, step.delay_hours ?? 0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-white text-sm font-medium truncate block">
                      {step.subject || (de ? `Step ${index + 1}` : `Шаг ${index + 1}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {step.send_telegram && (
                      <MessageCircle className="h-3.5 w-3.5 text-blue-400" strokeWidth={1.5} />
                    )}
                    {hasRuTranslation(step) ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400">
                        <Globe className="h-3 w-3" strokeWidth={1.5} />RU
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-400" title={de ? 'Russisch fehlt' : 'Нет перевода на RU'}>
                        <Globe className="h-3 w-3" strokeWidth={1.5} />!
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); moveStep(index, 'up'); }}
                      disabled={index === 0}
                      className="p-1 hover:bg-white/10 rounded-lg disabled:opacity-20 text-white/40"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveStep(index, 'down'); }}
                      disabled={index === steps.length - 1}
                      className="p-1 hover:bg-white/10 rounded-lg disabled:opacity-20 text-white/40"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeStep(index); }}
                      className="p-1 hover:bg-red-500/10 rounded-lg text-white/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </button>

                {/* Step Editor (Expanded) */}
                {expandedStep === index && (
                  <div className="border-t border-white/5 p-5 space-y-4">
                    {/* Delay Settings (language-independent) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/50 mb-1.5">
                          {de ? 'Verzögerung (Tage)' : 'Задержка (дни)'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={step.delay_days}
                          onChange={(e) => updateStep(index, { delay_days: Number(e.target.value) })}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-gold/30 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1.5">
                          {de ? 'Verzögerung (Stunden)' : 'Задержка (часы)'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={23}
                          value={step.delay_hours ?? 0}
                          onChange={(e) => updateStep(index, { delay_hours: Number(e.target.value) })}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-gold/30 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Telegram toggle (language-independent) */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={step.send_telegram ?? false}
                          onChange={(e) => updateStep(index, { send_telegram: e.target.checked })}
                          className="rounded border-white/20 bg-white/5 text-gold focus:ring-gold/30"
                        />
                        <span className="text-xs text-white/50">
                          <MessageCircle className="h-3.5 w-3.5 inline mr-1" />
                          {de ? 'Auch per Telegram senden' : 'Также отправить в Telegram'}
                        </span>
                      </label>
                    </div>

                    {/* DE / RU Language Tabs */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 w-fit">
                      <button
                        type="button"
                        onClick={() => setContentLang('de')}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                          contentLang === 'de'
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        DE {de ? 'Deutsch' : 'Немецкий'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setContentLang('ru')}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                          contentLang === 'ru'
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        RU {de ? 'Russisch' : 'Русский'}
                        {!hasRuTranslation(step) && (
                          <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
                        )}
                      </button>
                    </div>

                    {/* Content Fields — DE */}
                    {contentLang === 'de' && (
                      <>
                        <div>
                          <label className="block text-xs text-white/50 mb-1.5">
                            {de ? 'Betreff (DE)' : 'Тема (DE)'}
                          </label>
                          <input
                            type="text"
                            value={step.subject}
                            onChange={(e) => updateStep(index, { subject: e.target.value })}
                            placeholder={de ? 'E-Mail Betreff...' : 'Тема письма...'}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1.5">
                            {de ? 'E-Mail Inhalt (HTML) — DE' : 'Содержание (HTML) — DE'}
                          </label>
                          <textarea
                            value={step.content_html}
                            onChange={(e) => updateStep(index, { content_html: e.target.value })}
                            rows={6}
                            placeholder="<p>Hallo {name},</p><p>...</p>"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none font-mono"
                          />
                        </div>
                        {step.send_telegram && (
                          <div>
                            <label className="block text-xs text-white/50 mb-1.5">
                              Telegram (DE)
                            </label>
                            <textarea
                              value={step.content_telegram ?? ''}
                              onChange={(e) => updateStep(index, { content_telegram: e.target.value || null })}
                              rows={3}
                              placeholder={de ? 'Telegram-Nachricht...' : 'Telegram-сообщение...'}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Content Fields — RU */}
                    {contentLang === 'ru' && (
                      <>
                        <div>
                          <label className="block text-xs text-white/50 mb-1.5">
                            {de ? 'Betreff (RU)' : 'Тема (RU)'}
                          </label>
                          <input
                            type="text"
                            value={step.subject_ru ?? ''}
                            onChange={(e) => updateStep(index, { subject_ru: e.target.value || null })}
                            placeholder={step.subject ? `DE: ${step.subject}` : (de ? 'Russischer Betreff...' : 'Русская тема...')}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1.5">
                            {de ? 'E-Mail Inhalt (HTML) — RU' : 'Содержание (HTML) — RU'}
                          </label>
                          <textarea
                            value={step.content_html_ru ?? ''}
                            onChange={(e) => updateStep(index, { content_html_ru: e.target.value || null })}
                            rows={6}
                            placeholder={step.content_html ? `DE: ${step.content_html.substring(0, 80)}...` : '<p>Привет {name},</p><p>...</p>'}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none font-mono"
                          />
                        </div>
                        {step.send_telegram && (
                          <div>
                            <label className="block text-xs text-white/50 mb-1.5">
                              Telegram (RU)
                            </label>
                            <textarea
                              value={step.content_telegram_ru ?? ''}
                              onChange={(e) => updateStep(index, { content_telegram_ru: e.target.value || null })}
                              rows={3}
                              placeholder={step.content_telegram ? `DE: ${step.content_telegram.substring(0, 60)}...` : 'Telegram на русском...'}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
                            />
                          </div>
                        )}
                        {!hasRuTranslation(step) && (
                          <p className="text-xs text-amber-400/60 flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
                            {de ? 'Russische Übersetzung fehlt — Fallback auf Deutsch.' : 'Русский перевод отсутствует — используется немецкая версия.'}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
