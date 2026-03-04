'use client';

import { useState } from 'react';
import {
  Plus, Pencil, Trash2, Check, X, Loader2, Copy,
  ExternalLink, ChevronDown, ChevronUp, Zap,
  MousePointerClick, TrendingUp, DollarSign, Users2,
} from 'lucide-react';

interface AffiliateCoupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  used_count: number;
  active: boolean;
  stripe_coupon_id: string | null;
}

interface Affiliate {
  id: string;
  name: string;
  email: string;
  commission_percent: number;
  coupon_id: string | null;
  tracking_code: string;
  total_clicks: number;
  total_conversions: number;
  total_revenue_cents: number;
  total_commission_cents: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  coupons?: AffiliateCoupon | null;
}

interface FormData {
  name: string;
  email: string;
  commission_percent: string;
  discount_percent: string;
  notes: string;
  sync_to_stripe: boolean;
}

const emptyForm: FormData = {
  name: '',
  email: '',
  commission_percent: '10',
  discount_percent: '10',
  notes: '',
  sync_to_stripe: true,
};

const SITE_URL = typeof window !== 'undefined'
  ? window.location.origin
  : 'https://numerologie-pro.com';

export default function AffiliateManager({
  initialAffiliates,
  locale,
}: {
  initialAffiliates: Affiliate[];
  locale: string;
}) {
  const [affiliates, setAffiliates] = useState<Affiliate[]>(initialAffiliates);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailStats, setDetailStats] = useState<Record<string, unknown> | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  };

  const openEdit = (aff: Affiliate) => {
    setEditId(aff.id);
    setForm({
      name: aff.name,
      email: aff.email,
      commission_percent: String(aff.commission_percent),
      discount_percent: aff.coupons ? String(aff.coupons.value) : '10',
      notes: aff.notes ?? '',
      sync_to_stripe: false,
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      commission_percent: parseFloat(form.commission_percent),
      discount_percent: parseFloat(form.discount_percent),
      notes: form.notes || undefined,
      sync_to_stripe: form.sync_to_stripe,
    };

    try {
      if (editId) {
        const res = await fetch('/api/admin/affiliates', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Update fehlgeschlagen');
        setAffiliates((prev) => prev.map((a) => (a.id === editId ? { ...a, ...data.affiliate } : a)));
      } else {
        const res = await fetch('/api/admin/affiliates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erstellen fehlgeschlagen');
        setAffiliates((prev) => [data.affiliate, ...prev]);
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
    if (!confirm('Affiliate wirklich deaktivieren?')) return;
    try {
      const res = await fetch(`/api/admin/affiliates?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Deaktivierung fehlgeschlagen');
      setAffiliates((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: false } : a)));
    } catch {
      // Silently fail
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/affiliates/${id}`);
      const data = await res.json();
      setDetailStats(data);
    } catch {
      setDetailStats(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const fmtEur = (cents: number) => `${(cents / 100).toFixed(2)} EUR`;
  const inputCls = 'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-gold/40 focus:outline-none';
  const labelCls = 'block text-xs text-white/50 mb-1';

  return (
    <div className="space-y-4">
      {/* Create Button */}
      <div className="flex justify-end">
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/20 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/15 transition-colors">
          <Plus className="h-4 w-4" /> Neuer Partner
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="rounded-2xl border border-gold/20 bg-[rgba(15,48,63,0.6)] backdrop-blur-sm p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            {editId ? 'Partner bearbeiten' : 'Neuen Affiliate-Partner erstellen'}
          </h3>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="z.B. Anna Mueller" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>E-Mail</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="partner@example.com" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Provision (%)</label>
              <input type="number" min="0" max="100" step="0.5" value={form.commission_percent} onChange={(e) => setForm({ ...form, commission_percent: e.target.value })} required className={inputCls} />
            </div>
            {!editId && (
              <div>
                <label className={labelCls}>Rabatt für Kunden (%)</label>
                <input type="number" min="0" max="100" step="0.5" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} required className={inputCls} />
              </div>
            )}
            <div className={editId ? '' : 'lg:col-span-2'}>
              <label className={labelCls}>Notizen</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optionale Notizen..." className={inputCls} />
            </div>

            {!editId && (
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.sync_to_stripe} onChange={(e) => setForm({ ...form, sync_to_stripe: e.target.checked })} className="rounded border-white/20 bg-white/5 text-gold focus:ring-gold/40" />
                  <Zap className="h-3.5 w-3.5 text-gold/70" />
                  <span className="text-xs text-white/60">Coupon in Stripe erstellen</span>
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

      {/* Affiliate Table */}
      {affiliates.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Partner</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium hidden md:table-cell">Coupon</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Klicks</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Conv.</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium hidden lg:table-cell">Umsatz</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium hidden lg:table-cell">Provision</th>
                  <th className="text-left px-5 py-3 text-white/50 font-medium">Status</th>
                  <th className="text-right px-5 py-3 text-white/50 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((aff) => {
                  const coupon = aff.coupons;
                  const trackingLink = `${SITE_URL}/api/affiliate/click?code=${aff.tracking_code}`;
                  const isExpanded = expandedId === aff.id;

                  return (
                    <tr key={aff.id} className="border-b border-white/5 last:border-0">
                      {/* Main Row */}
                      <td className="px-5 py-4">
                        <button onClick={() => toggleExpand(aff.id)} className="text-left group">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium group-hover:text-gold transition-colors">{aff.name}</span>
                            {isExpanded ? <ChevronUp className="h-3 w-3 text-white/40" /> : <ChevronDown className="h-3 w-3 text-white/40" />}
                          </div>
                          <span className="text-xs text-white/40">{aff.email}</span>
                        </button>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        {coupon ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-gold text-xs font-semibold">{coupon.code}</span>
                            <button onClick={() => copyToClipboard(coupon.code, `coupon-${aff.id}`)} className="text-white/30 hover:text-white/70 transition-colors">
                              {copiedField === `coupon-${aff.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            </button>
                            <span className="text-xs text-white/40">({coupon.value}%)</span>
                          </div>
                        ) : (
                          <span className="text-xs text-white/30">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-white/70 font-medium">{aff.total_clicks}</td>
                      <td className="px-5 py-4 text-white/70 font-medium">{aff.total_conversions}</td>
                      <td className="px-5 py-4 text-white/60 hidden lg:table-cell">{fmtEur(aff.total_revenue_cents)}</td>
                      <td className="px-5 py-4 text-gold font-semibold hidden lg:table-cell">{fmtEur(aff.total_commission_cents)}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${aff.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {aff.is_active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => copyToClipboard(trackingLink, `link-${aff.id}`)} className="rounded-lg p-1.5 text-white/40 hover:text-white hover:bg-white/5 transition-all" title="Tracking-Link kopieren">
                            {copiedField === `link-${aff.id}` ? <Check className="h-4 w-4 text-emerald-400" /> : <ExternalLink className="h-4 w-4" />}
                          </button>
                          <button onClick={() => openEdit(aff)} className="rounded-lg p-1.5 text-white/40 hover:text-white hover:bg-white/5 transition-all" title="Bearbeiten">
                            <Pencil className="h-4 w-4" />
                          </button>
                          {aff.is_active && (
                            <button onClick={() => handleDeactivate(aff.id)} className="rounded-lg p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all" title="Deaktivieren">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Expanded Detail Panel */}
          {expandedId && (
            <div className="border-t border-white/10 p-6 bg-[rgba(10,37,51,0.5)]">
              {detailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gold/50" />
                </div>
              ) : detailStats ? (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={MousePointerClick} label="Klicks (30 Tage)" value={String((detailStats as Record<string, unknown>).totalClicksLast30d ?? 0)} />
                    <StatCard icon={TrendingUp} label="Conversions" value={String(affiliates.find((a) => a.id === expandedId)?.total_conversions ?? 0)} />
                    <StatCard icon={DollarSign} label="Umsatz" value={fmtEur(affiliates.find((a) => a.id === expandedId)?.total_revenue_cents ?? 0)} />
                    <StatCard icon={Users2} label="Provision" value={fmtEur(affiliates.find((a) => a.id === expandedId)?.total_commission_cents ?? 0)} accent />
                  </div>

                  {/* Tracking Link */}
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Tracking-Link</label>
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <span className="text-xs text-white/70 font-mono truncate flex-1">
                        {SITE_URL}/api/affiliate/click?code={affiliates.find((a) => a.id === expandedId)?.tracking_code}
                      </span>
                      <button
                        onClick={() => {
                          const aff = affiliates.find((a) => a.id === expandedId);
                          if (aff) copyToClipboard(`${SITE_URL}/api/affiliate/click?code=${aff.tracking_code}`, `detail-link`);
                        }}
                        className="text-white/40 hover:text-gold transition-colors shrink-0"
                      >
                        {copiedField === 'detail-link' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Recent Conversions */}
                  {((detailStats as Record<string, unknown>).conversions as Array<{ email: string; used_at: string }> | undefined)?.length ? (
                    <div>
                      <label className="block text-xs text-white/50 mb-2">Letzte Conversions</label>
                      <div className="space-y-1">
                        {((detailStats as Record<string, unknown>).conversions as Array<{ email: string; used_at: string }>).slice(0, 10).map((c, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg px-3 py-1.5 bg-white/[0.02]">
                            <span className="text-xs text-white/60">{c.email}</span>
                            <span className="text-xs text-white/40">{new Date(c.used_at).toLocaleDateString(locale === 'de' ? 'de-DE' : 'ru-RU')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-white/40 text-center py-4">Keine Details verfügbar.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${accent ? 'text-gold' : 'text-white/40'}`} />
        <span className="text-xs text-white/50">{label}</span>
      </div>
      <p className={`text-lg font-semibold ${accent ? 'text-gold' : 'text-white'}`}>{value}</p>
    </div>
  );
}
