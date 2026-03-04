'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, Loader2, Copy, Zap } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  applies_to: string;
  purpose: string;
  affiliate_id: string | null;
  stripe_coupon_id: string | null;
  stripe_promotion_code_id: string | null;
  created_at: string;
  updated_at: string;
}

interface CouponFormData {
  code: string;
  type: 'percent' | 'fixed';
  value: string;
  max_uses: string;
  valid_from: string;
  valid_until: string;
  applies_to: string;
  purpose: string;
  sync_to_stripe: boolean;
}

const emptyForm: CouponFormData = {
  code: '',
  type: 'percent',
  value: '',
  max_uses: '',
  valid_from: '',
  valid_until: '',
  applies_to: 'all',
  purpose: 'general',
  sync_to_stripe: true,
};

const purposeLabels: Record<string, string> = {
  general: 'Allgemein',
  marketing: 'Marketing',
  affiliate: 'Affiliate',
  campaign: 'Kampagne',
  referral: 'Empfehlung',
};

const purposeColors: Record<string, string> = {
  general: 'bg-white/10 text-white/60',
  marketing: 'bg-blue-500/10 text-blue-400',
  affiliate: 'bg-purple-500/10 text-purple-400',
  campaign: 'bg-amber-500/10 text-amber-400',
  referral: 'bg-emerald-500/10 text-emerald-400',
};

export default function CouponManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  };

  const openEdit = (coupon: Coupon) => {
    setEditId(coupon.id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      max_uses: coupon.max_uses !== null ? String(coupon.max_uses) : '',
      valid_from: coupon.valid_from ? coupon.valid_from.slice(0, 16) : '',
      valid_until: coupon.valid_until ? coupon.valid_until.slice(0, 16) : '',
      applies_to: coupon.applies_to,
      purpose: coupon.purpose ?? 'general',
      sync_to_stripe: false, // Don't re-sync on edit
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload: Record<string, unknown> = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.type,
      discount_value: parseFloat(form.value),
      max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      package_keys: form.applies_to === 'pdf_analyse' ? ['pdf_analyse'] : form.applies_to === 'packages' ? ['packages'] : [],
      purpose: form.purpose,
      sync_to_stripe: form.sync_to_stripe,
    };

    try {
      if (editId) {
        const res = await fetch('/api/admin/coupons', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Update fehlgeschlagen');
        setCoupons((prev) => prev.map((c) => (c.id === editId ? { ...c, ...data.coupon } : c)));
      } else {
        const res = await fetch('/api/admin/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erstellen fehlgeschlagen');
        setCoupons((prev) => [data.coupon, ...prev]);
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Gutschein wirklich deaktivieren?')) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Deaktivierung fehlgeschlagen');
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, active: false } : c)));
    } catch {
      // Silently fail
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const appliesLabel: Record<string, string> = { all: 'Alle', pdf_analyse: 'Nur PDF', packages: 'Nur Pakete' };
  const inputCls = 'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-gold/40 focus:outline-none';
  const labelCls = 'block text-xs text-white/50 mb-1';

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/20 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/15 transition-colors">
          <Plus className="h-4 w-4" /> Neuer Gutschein
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-gold/20 bg-[rgba(15,48,63,0.6)] backdrop-blur-sm p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            {editId ? 'Gutschein bearbeiten' : 'Neuen Gutschein erstellen'}
          </h3>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Code</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="z.B. SUMMER20" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Typ</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'percent' | 'fixed' })} className={inputCls}>
                <option value="percent">Prozent (%)</option>
                <option value="fixed">Festbetrag (EUR)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Wert {form.type === 'percent' ? '(%)' : '(EUR)'}</label>
              <input type="number" step={form.type === 'percent' ? '1' : '0.01'} min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === 'percent' ? '20' : '5.00'} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Max. Einloesungen</label>
              <input type="number" min="1" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Unbegrenzt" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Gueltig ab</label>
              <input type="datetime-local" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Gültig bis</label>
              <input type="datetime-local" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Gilt für</label>
              <select value={form.applies_to} onChange={(e) => setForm({ ...form, applies_to: e.target.value })} className={inputCls}>
                <option value="all">Alle Produkte</option>
                <option value="pdf_analyse">Nur PDF-Analyse</option>
                <option value="packages">Nur Beratungspakete</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Zweck</label>
              <select value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className={inputCls}>
                <option value="general">Allgemein</option>
                <option value="marketing">Marketing</option>
                <option value="affiliate">Affiliate</option>
                <option value="campaign">Kampagne</option>
                <option value="referral">Empfehlung</option>
              </select>
            </div>

            {/* Stripe Sync Toggle */}
            {!editId && (
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.sync_to_stripe} onChange={(e) => setForm({ ...form, sync_to_stripe: e.target.checked })} className="rounded border-white/20 bg-white/5 text-gold focus:ring-gold/40" />
                  <Zap className="h-3.5 w-3.5 text-gold/70" />
                  <span className="text-xs text-white/60">In Stripe erstellen</span>
                </label>
              </div>
            )}

            <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3 pt-2">
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/20 px-5 py-2 text-sm font-medium text-gold hover:bg-gold/15 transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {editId ? 'Speichern' : 'Erstellen'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setError(''); }} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white/80 transition-colors">
                <X className="h-4 w-4" /> Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {coupons.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Code</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Rabatt</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium hidden md:table-cell">Zweck</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Nutzung</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium hidden lg:table-cell">Stripe</th>
                  <th className="text-right px-5 py-3 text-white/50 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-semibold tracking-wider">{c.code}</span>
                        <button onClick={() => copyCode(c.code)} className="text-white/30 hover:text-white/70 transition-colors" title="Code kopieren">
                          {copiedCode === c.code ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gold font-semibold">
                      {c.type === 'percent' ? `${c.value}%` : `${c.value.toFixed(2)} EUR`}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${purposeColors[c.purpose ?? 'general'] ?? purposeColors.general}`}>
                        {purposeLabels[c.purpose ?? 'general'] ?? c.purpose}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/60">
                      {c.used_count}{c.max_uses !== null ? ` / ${c.max_uses}` : ''}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {c.active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {c.stripe_coupon_id ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><Zap className="h-3 w-3" /> Sync</span>
                      ) : (
                        <span className="text-xs text-white/30">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-white/40 hover:text-white hover:bg-white/5 transition-all" title="Bearbeiten">
                          <Pencil className="h-4 w-4" />
                        </button>
                        {c.active && (
                          <button onClick={() => handleDeactivate(c.id)} className="rounded-lg p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all" title="Deaktivieren">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
