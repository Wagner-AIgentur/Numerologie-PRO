'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminT } from '@/lib/i18n/admin';
import {
  Settings,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Save,
  GripVertical,
  Pencil,
  X,
  Type,
  Hash,
  Calendar,
  List,
  ToggleLeft as BoolIcon,
  Eye,
  AlertCircle,
} from 'lucide-react';
import CustomFieldRenderer from './CustomFieldRenderer';

interface FieldDefinition {
  id: string;
  field_key: string;
  label_de: string;
  label_ru: string;
  field_type: string;
  options: string[] | null;
  is_required: boolean | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at: string | null;
}

interface Props {
  definitions: FieldDefinition[];
  locale: string;
}

const FIELD_TYPES = [
  { value: 'text', de: 'Text', ru: 'Текст', icon: Type },
  { value: 'number', de: 'Zahl', ru: 'Число', icon: Hash },
  { value: 'date', de: 'Datum', ru: 'Дата', icon: Calendar },
  { value: 'select', de: 'Auswahl', ru: 'Выбор', icon: List },
  { value: 'boolean', de: 'Ja/Nein', ru: 'Да/Нет', icon: BoolIcon },
];

const EMPTY_FORM = {
  field_key: '',
  label_de: '',
  label_ru: '',
  field_type: 'text' as FieldDefinition['field_type'],
  options: [] as string[],
  is_required: false,
  sort_order: 0,
};

export default function CustomFieldsShell({ definitions: initialDefinitions, locale }: Props) {
  const router = useRouter();
  const t = getAdminT(locale);
  const de = locale === 'de';

  const [definitions, setDefinitions] = useState(initialDefinitions);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [optionInput, setOptionInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewValue, setPreviewValue] = useState('');

  function openNewForm() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, sort_order: definitions.length });
    setOptionInput('');
    setShowForm(true);
    setShowPreview(false);
    setPreviewValue('');
  }

  function openEditForm(def: FieldDefinition) {
    setEditingId(def.id);
    setForm({
      field_key: def.field_key,
      label_de: def.label_de,
      label_ru: def.label_ru,
      field_type: def.field_type,
      options: def.options ?? [],
      is_required: def.is_required ?? false,
      sort_order: def.sort_order ?? 0,
    });
    setOptionInput('');
    setShowForm(true);
    setShowPreview(false);
    setPreviewValue('');
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowPreview(false);
    setPreviewValue('');
  }

  function addOption() {
    const trimmed = optionInput.trim();
    if (trimmed && !form.options.includes(trimmed)) {
      setForm({ ...form, options: [...form.options, trimmed] });
    }
    setOptionInput('');
  }

  function removeOption(idx: number) {
    setForm({ ...form, options: form.options.filter((_, i) => i !== idx) });
  }

  function generateFieldKey(label: string): string {
    return label
      .toLowerCase()
      .replace(/[äÄ]/g, 'ae')
      .replace(/[öÖ]/g, 'oe')
      .replace(/[üÜ]/g, 'ue')
      .replace(/[ß]/g, 'ss')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  async function saveField() {
    if (!form.field_key || !form.label_de || !form.label_ru) return;
    if (form.field_type === 'select' && form.options.length === 0) return;

    setSaving(true);
    try {
      if (editingId) {
        // Update existing
        const res = await fetch(`/api/admin/custom-fields/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            field_key: form.field_key,
            label_de: form.label_de,
            label_ru: form.label_ru,
            field_type: form.field_type,
            options: form.field_type === 'select' ? form.options : null,
            is_required: form.is_required,
            sort_order: form.sort_order,
          }),
        });
        if (res.ok) {
          closeForm();
          router.refresh();
        }
      } else {
        // Create new
        const res = await fetch('/api/admin/custom-fields', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            field_key: form.field_key,
            label_de: form.label_de,
            label_ru: form.label_ru,
            field_type: form.field_type,
            options: form.field_type === 'select' ? form.options : null,
            is_required: form.is_required,
            sort_order: form.sort_order,
          }),
        });
        if (res.ok) {
          closeForm();
          router.refresh();
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleField(def: FieldDefinition) {
    await fetch(`/api/admin/custom-fields/${def.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !def.is_active }),
    });
    setDefinitions(definitions.map((d) =>
      d.id === def.id ? { ...d, is_active: !d.is_active } : d
    ));
  }

  async function deleteField(id: string) {
    if (!confirm(de ? 'Dieses Feld und alle gespeicherten Werte werden gelöscht. Fortfahren?' : 'Это поле и все сохранённые значения будут удалены. Продолжить?')) return;
    await fetch(`/api/admin/custom-fields/${id}`, { method: 'DELETE' });
    setDefinitions(definitions.filter((d) => d.id !== id));
  }

  async function moveField(id: string, direction: 'up' | 'down') {
    const idx = definitions.findIndex((d) => d.id === id);
    if (idx < 0) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === definitions.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...definitions];
    const temp = updated[idx].sort_order;
    updated[idx].sort_order = updated[swapIdx].sort_order;
    updated[swapIdx].sort_order = temp;
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];

    setDefinitions(updated);

    // Save both sort orders
    await Promise.all([
      fetch(`/api/admin/custom-fields/${updated[idx].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: updated[idx].sort_order }),
      }),
      fetch(`/api/admin/custom-fields/${updated[swapIdx].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: updated[swapIdx].sort_order }),
      }),
    ]);
  }

  function getFieldTypeInfo(type: string) {
    return FIELD_TYPES.find((ft) => ft.value === type) ?? FIELD_TYPES[0];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">
            {de ? 'Benutzerdefinierte Felder' : 'Пользовательские поля'}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {de
              ? 'Erstellen und verwalten Sie eigene Felder für Kundenprofile.'
              : 'Создавайте и управляйте собственными полями для профилей клиентов.'}
          </p>
        </div>
        <button
          onClick={openNewForm}
          className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/30 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/20 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          {de ? 'Neues Feld' : 'Новое поле'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
            {de ? 'Felder gesamt' : 'Полей всего'}
          </div>
          <p className="text-2xl font-bold text-white">{definitions.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-emerald-400/70 text-xs mb-1">
            <ToggleRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            {de ? 'Aktiv' : 'Активных'}
          </div>
          <p className="text-2xl font-bold text-emerald-400">{definitions.filter((d) => d.is_active).length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-amber-400/70 text-xs mb-1">
            <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
            {de ? 'Pflichtfelder' : 'Обязательных'}
          </div>
          <p className="text-2xl font-bold text-amber-400">{definitions.filter((d) => d.is_required).length}</p>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="rounded-2xl border border-gold/20 bg-gold/[0.02] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">
              {editingId
                ? (de ? 'Feld bearbeiten' : 'Редактировать поле')
                : (de ? 'Neues Feld erstellen' : 'Создать новое поле')}
            </h3>
            <button onClick={closeForm} className="p-1 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Label DE */}
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Label (Deutsch)</label>
              <input
                type="text"
                value={form.label_de}
                onChange={(e) => {
                  const newLabel = e.target.value;
                  setForm({
                    ...form,
                    label_de: newLabel,
                    field_key: editingId ? form.field_key : generateFieldKey(newLabel),
                  });
                }}
                placeholder="z.B. Lieblingszahl"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
              />
            </div>

            {/* Label RU */}
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Label (Russisch)</label>
              <input
                type="text"
                value={form.label_ru}
                onChange={(e) => setForm({ ...form, label_ru: e.target.value })}
                placeholder="напр. Любимое число"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
              />
            </div>

            {/* Field Key */}
            <div>
              <label className="block text-xs text-white/50 mb-1.5">
                {de ? 'Feld-Schlüssel (technisch)' : 'Ключ поля (технический)'}
              </label>
              <input
                type="text"
                value={form.field_key}
                onChange={(e) => setForm({ ...form, field_key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                placeholder="z.B. lieblingszahl"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white font-mono placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
              />
            </div>

            {/* Field Type */}
            <div>
              <label className="block text-xs text-white/50 mb-1.5">
                {de ? 'Feldtyp' : 'Тип поля'}
              </label>
              <select
                value={form.field_type}
                onChange={(e) => setForm({ ...form, field_type: e.target.value as FieldDefinition['field_type'] })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-gold/30 focus:outline-none"
              >
                {FIELD_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value} className="bg-[#0a1a24]">
                    {de ? ft.de : ft.ru}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs text-white/50 mb-1.5">
                {de ? 'Reihenfolge' : 'Порядок'}
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-gold/30 focus:outline-none"
              />
            </div>

            {/* Is Required */}
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_required}
                  onChange={(e) => setForm({ ...form, is_required: e.target.checked })}
                  className="rounded border-white/20 bg-white/5 text-gold focus:ring-gold/30"
                />
                <span className="text-sm text-white/60">
                  {de ? 'Pflichtfeld' : 'Обязательное поле'}
                </span>
              </label>
            </div>
          </div>

          {/* Options for Select type */}
          {form.field_type === 'select' && (
            <div className="space-y-3">
              <label className="block text-xs text-white/50">
                {de ? 'Auswahloptionen' : 'Варианты выбора'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                  placeholder={de ? 'Option eingeben, Enter drücken...' : 'Введите вариант, нажмите Enter...'}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-gold/30 focus:outline-none"
                />
                <button
                  onClick={addOption}
                  className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Plus className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
              {form.options.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.options.map((opt, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-white/70"
                    >
                      {opt}
                      <button
                        onClick={() => removeOption(idx)}
                        className="text-white/30 hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {form.options.length === 0 && (
                <p className="text-xs text-amber-400/60">
                  {de ? 'Mindestens eine Option erforderlich.' : 'Необходим хотя бы один вариант.'}
                </p>
              )}
            </div>
          )}

          {/* Preview Toggle */}
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
              {showPreview
                ? (de ? 'Vorschau ausblenden' : 'Скрыть предпросмотр')
                : (de ? 'Vorschau anzeigen' : 'Показать предпросмотр')}
            </button>
          </div>

          {/* Preview */}
          {showPreview && form.label_de && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs text-white/30 mb-3">
                {de ? 'So wird das Feld im Kundenprofil angezeigt:' : 'Так поле будет отображаться в профиле клиента:'}
              </p>
              <CustomFieldRenderer
                definition={{
                  id: 'preview',
                  field_key: form.field_key || 'preview',
                  label_de: form.label_de,
                  label_ru: form.label_ru,
                  field_type: form.field_type,
                  options: form.field_type === 'select' ? form.options : null,
                  is_required: form.is_required,
                  sort_order: 0,
                  is_active: true,
                  created_at: '',
                }}
                value={previewValue}
                onChange={setPreviewValue}
                locale={locale}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={closeForm}
              className="rounded-xl px-3 py-1.5 text-xs text-white/40 hover:text-white transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={saveField}
              disabled={saving || !form.field_key || !form.label_de || !form.label_ru || (form.field_type === 'select' && form.options.length === 0)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gold/10 border border-gold/30 px-4 py-1.5 text-xs text-gold hover:bg-gold/20 transition-colors disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? '...' : (editingId ? t.save : (de ? 'Erstellen' : 'Создать'))}
            </button>
          </div>
        </div>
      )}

      {/* Definitions List */}
      {definitions.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-12 text-center">
          <Settings className="h-12 w-12 text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/40 text-sm">
            {de ? 'Noch keine benutzerdefinierten Felder erstellt.' : 'Пользовательских полей пока нет.'}
          </p>
          <button
            onClick={openNewForm}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/30 px-4 py-2 text-sm text-gold hover:bg-gold/20 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            {de ? 'Erstes Feld erstellen' : 'Создать первое поле'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {definitions.map((def, idx) => {
            const typeInfo = getFieldTypeInfo(def.field_type);
            const TypeIcon = typeInfo.icon;
            return (
              <div
                key={def.id}
                className={`rounded-2xl border bg-white/[0.02] p-4 transition-all ${
                  def.is_active ? 'border-white/10' : 'border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Drag handle + info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => moveField(def.id, 'up')}
                        disabled={idx === 0}
                        className="text-white/20 hover:text-white/60 disabled:opacity-30 transition-colors"
                      >
                        <GripVertical className="h-3 w-3 rotate-180" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => moveField(def.id, 'down')}
                        disabled={idx === definitions.length - 1}
                        className="text-white/20 hover:text-white/60 disabled:opacity-30 transition-colors"
                      >
                        <GripVertical className="h-3 w-3" strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="shrink-0 rounded-xl bg-gold/10 p-2">
                      <TypeIcon className="h-4 w-4 text-gold" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-white font-medium text-sm">
                          {de ? def.label_de : def.label_ru}
                        </span>
                        <span className="text-[10px] text-white/30 font-mono bg-white/5 rounded-full px-1.5 py-0.5">
                          {def.field_key}
                        </span>
                        {def.is_required && (
                          <span className="text-[10px] text-amber-400/60 bg-amber-400/10 rounded-full px-1.5 py-0.5">
                            {de ? 'Pflicht' : 'Обязат.'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <TypeIcon className="h-3 w-3" strokeWidth={1.5} />
                          {de ? typeInfo.de : typeInfo.ru}
                        </span>
                        {def.field_type === 'select' && def.options && (
                          <span className="text-white/30">
                            {def.options.length} {de ? 'Optionen' : 'вариантов'}
                          </span>
                        )}
                        <span className="text-white/20">
                          #{def.sort_order}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditForm(def)}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors"
                      title={de ? 'Bearbeiten' : 'Редактировать'}
                    >
                      <Pencil className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => toggleField(def)}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      title={def.is_active ? (de ? 'Deaktivieren' : 'Деактивировать') : (de ? 'Aktivieren' : 'Активировать')}
                    >
                      {def.is_active
                        ? <ToggleRight className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                        : <ToggleLeft className="h-5 w-5 text-white/30" strokeWidth={1.5} />}
                    </button>
                    <button
                      onClick={() => deleteField(def.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors"
                      title={de ? 'Löschen' : 'Удалить'}
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
