'use client';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name_de: string;
  name_ru: string | null;
  price_cents: number;
  currency: string | null;
}

interface DealFormData {
  title: string;
  customer_email: string;
  product_id: string | null;
  value_cents: number;
  probability: number;
  expected_close_date: string;
  notes: string;
  stage?: string;
  lost_reason?: string;
}

interface DealFormProps {
  locale: string;
  products: Product[];
  initialData?: Partial<DealFormData> & { id?: string; profile_id?: string };
  onSubmit: (data: DealFormData & { profile_id?: string }) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function DealForm({ locale, products, initialData, onSubmit, onCancel, isEdit }: DealFormProps) {
  const isRu = locale === 'ru';
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DealFormData>({
    title: initialData?.title ?? '',
    customer_email: initialData?.customer_email ?? '',
    product_id: initialData?.product_id ?? null,
    value_cents: initialData?.value_cents ?? 0,
    probability: initialData?.probability ?? 50,
    expected_close_date: initialData?.expected_close_date ?? '',
    notes: initialData?.notes ?? '',
    stage: initialData?.stage ?? 'new',
    lost_reason: initialData?.lost_reason ?? '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!isEdit && !form.customer_email.trim()) return;

    setSaving(true);
    try {
      await onSubmit({
        ...form,
        ...(initialData?.profile_id ? { profile_id: initialData.profile_id } : {}),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProductChange = (productId: string) => {
    setForm((prev) => {
      const product = products.find((p) => p.id === productId);
      return {
        ...prev,
        product_id: productId || null,
        value_cents: product ? product.price_cents : prev.value_cents,
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#0d2230] border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold text-lg">
          {isEdit
            ? (isRu ? 'Редактировать сделку' : 'Deal bearbeiten')
            : (isRu ? 'Новая сделка' : 'Neuer Deal')}
        </h3>
        <button type="button" onClick={onCancel} className="text-white/40 hover:text-white transition-colors">
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs text-white/50 mb-1.5">{isRu ? 'Название' : 'Titel'} *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder={isRu ? 'Название сделки...' : 'Deal-Titel...'}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50"
          required
        />
      </div>

      {/* Customer Email — only for new deals */}
      {!isEdit && (
        <div>
          <label className="block text-xs text-white/50 mb-1.5">{isRu ? 'Email клиента' : 'Kunden-E-Mail'} *</label>
          <input
            type="email"
            value={form.customer_email}
            onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
            placeholder="email@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50"
            required
          />
        </div>
      )}

      {/* Product + Value row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-white/50 mb-1.5">{isRu ? 'Продукт' : 'Produkt'}</label>
          <select
            value={form.product_id ?? ''}
            onChange={(e) => handleProductChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
          >
            <option value="" className="bg-[#0a1a24]">{isRu ? '— Без продукта —' : '— Kein Produkt —'}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0a1a24]">
                {isRu ? (p.name_ru || p.name_de) : p.name_de} ({(p.price_cents / 100).toFixed(0)} EUR)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1.5">{isRu ? 'Сумма (EUR)' : 'Betrag (EUR)'}</label>
          <input
            type="number"
            min={0}
            step={1}
            value={(form.value_cents / 100).toFixed(0)}
            onChange={(e) => setForm({ ...form, value_cents: Math.round(parseFloat(e.target.value || '0') * 100) })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
          />
        </div>
      </div>

      {/* Probability + Close Date row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-white/50 mb-1.5">
            {isRu ? 'Вероятность' : 'Wahrscheinlichkeit'} ({form.probability}%)
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={form.probability}
            onChange={(e) => setForm({ ...form, probability: parseInt(e.target.value) })}
            className="w-full accent-[#D4AF37]"
          />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1.5">{isRu ? 'Ожид. закрытие' : 'Erw. Abschluss'}</label>
          <input
            type="date"
            value={form.expected_close_date}
            onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs text-white/50 mb-1.5">{isRu ? 'Заметки' : 'Notizen'}</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder={isRu ? 'Дополнительные заметки...' : 'Zusätzliche Notizen...'}
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !form.title.trim()}
          className="flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#D4AF37]/90 disabled:opacity-50 transition-all"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          ) : (
            <Save className="h-4 w-4" strokeWidth={1.5} />
          )}
          {saving
            ? (isRu ? 'Сохранение...' : 'Speichern...')
            : (isRu ? 'Сохранить' : 'Speichern')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-white/50 hover:text-white text-sm transition-colors"
        >
          {isRu ? 'Отмена' : 'Abbrechen'}
        </button>
      </div>
    </form>
  );
}
