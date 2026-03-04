'use client';

import { useState, useCallback } from 'react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import {
  Plus,
  Euro,
  Calendar,
  Percent,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Edit3,
  X,
  TrendingUp,
} from 'lucide-react';
import DealForm from './DealForm';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

interface Product {
  id: string;
  name_de: string;
  name_ru: string | null;
}

interface ProductOption {
  id: string;
  name_de: string;
  name_ru: string | null;
  price_cents: number;
  currency: string | null;
}

interface Deal {
  id: string;
  profile_id: string;
  title: string;
  product_id: string | null;
  value_cents: number;
  currency: string | null;
  stage: string;
  probability: number | null;
  expected_close_date: string | null;
  won_at: string | null;
  lost_at: string | null;
  lost_reason: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  profiles: Profile | null;
  products: Product | null;
}

interface Props {
  initialDeals: Deal[];
  products: ProductOption[];
  locale: string;
}

/* ------------------------------------------------------------------ */
/*  Stage definitions                                                  */
/* ------------------------------------------------------------------ */

const STAGES = [
  { key: 'new', de: 'Neu', ru: 'Новые', color: 'slate', bg: 'bg-slate-500/10', border: 'border-slate-500/30', badge: 'bg-slate-500/20 text-slate-300' },
  { key: 'contacted', de: 'Kontaktiert', ru: 'Связались', color: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-300' },
  { key: 'proposal', de: 'Angebot', ru: 'Предложение', color: 'purple', bg: 'bg-purple-500/10', border: 'border-purple-500/30', badge: 'bg-purple-500/20 text-purple-300' },
  { key: 'negotiation', de: 'Verhandlung', ru: 'Переговоры', color: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-300' },
  { key: 'won', de: 'Gewonnen', ru: 'Выиграны', color: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' },
  { key: 'lost', de: 'Verloren', ru: 'Потеряны', color: 'red', bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'bg-red-500/20 text-red-300' },
] as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtEur(cents: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(cents / 100);
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DealPipelineShell({ initialDeals, products, locale }: Props) {
  const isRu = locale === 'ru';
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [lostPrompt, setLostPrompt] = useState<{ dealId: string; fromStage: string } | null>(null);
  const [lostReason, setLostReason] = useState('');

  /* ---------- Auto-refresh (15s) ---------- */
  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/deals');
      if (res.ok) {
        const data = await res.json();
        setDeals(data);
      }
    } catch {
      // silent
    }
  }, []);

  useAutoRefresh(fetchDeals, 15000);

  /* ---------- Stage helpers ---------- */
  const dealsByStage = useCallback(
    (stageKey: string) => deals.filter((d) => d.stage === stageKey),
    [deals]
  );

  const weightedValue = useCallback(
    (stageKey: string) =>
      deals
        .filter((d) => d.stage === stageKey)
        .reduce((sum, d) => sum + Math.round((d.value_cents * (d.probability ?? 0)) / 100), 0),
    [deals]
  );

  const totalPipelineValue = deals
    .filter((d) => !['won', 'lost'].includes(d.stage))
    .reduce((sum, d) => sum + Math.round((d.value_cents * (d.probability ?? 0)) / 100), 0);

  const totalWon = deals
    .filter((d) => d.stage === 'won')
    .reduce((sum, d) => sum + d.value_cents, 0);

  /* ---------- API calls ---------- */

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
const createDeal = async (formData: any) => {
    // Lookup profile_id by email
    const email = formData.customer_email as string;
    const lookupRes = await fetch(`/api/admin/customers?email=${encodeURIComponent(email)}`);
    let profileId = formData.profile_id as string | undefined;

    if (lookupRes.ok) {
      const customers = await lookupRes.json();
      if (Array.isArray(customers) && customers.length > 0) {
        profileId = customers[0].id;
      }
    }

    if (!profileId) {
      // Try to find profile through a direct query approach
      const searchRes = await fetch(`/api/admin/deals?profile_id=none`);
      // If we can't find the profile, show an error
      alert(isRu ? 'Клиент с таким email не найден.' : 'Kein Kunde mit dieser E-Mail gefunden.');
      return;
    }

    const res = await fetch('/api/admin/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id: profileId,
        title: formData.title,
        product_id: formData.product_id || null,
        value_cents: formData.value_cents,
        probability: formData.probability,
        expected_close_date: formData.expected_close_date || null,
        notes: formData.notes || null,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Error');
      return;
    }

    const newDeal = await res.json();
    setDeals((prev) => [newDeal, ...prev]);
    setShowForm(false);
  };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateDeal = async (formData: any) => {
    if (!editingDeal) return;

    const res = await fetch(`/api/admin/deals/${editingDeal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        product_id: formData.product_id || null,
        value_cents: formData.value_cents,
        probability: formData.probability,
        expected_close_date: formData.expected_close_date || null,
        notes: formData.notes || null,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Error');
      return;
    }

    const updated = await res.json();
    setDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setEditingDeal(null);
  };

  const moveStage = async (dealId: string, newStage: string) => {
    // If moving to "lost", prompt for reason first
    if (newStage === 'lost') {
      const deal = deals.find((d) => d.id === dealId);
      setLostPrompt({ dealId, fromStage: deal?.stage ?? 'new' });
      setLostReason('');
      return;
    }

    const res = await fetch(`/api/admin/deals/${dealId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    });

    if (res.ok) {
      const updated = await res.json();
      setDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    }
  };

  const confirmLost = async () => {
    if (!lostPrompt) return;
    const res = await fetch(`/api/admin/deals/${lostPrompt.dealId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 'lost', lost_reason: lostReason || null }),
    });

    if (res.ok) {
      const updated = await res.json();
      setDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    }
    setLostPrompt(null);
    setLostReason('');
  };

  const deleteDeal = async (dealId: string) => {
    if (!confirm(isRu ? 'Удалить сделку?' : 'Deal löschen?')) return;
    const res = await fetch(`/api/admin/deals/${dealId}`, { method: 'DELETE' });
    if (res.ok) {
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
    }
  };

  /* ---------- Stage index for arrows ---------- */
  const stageIndex = (stage: string) => STAGES.findIndex((s) => s.key === stage);

  /* ---------- Render ---------- */

  return (
    <div className="space-y-5">
      {/* ---- Total Pipeline Bar ---- */}
      <div className="flex flex-wrap items-center gap-4 bg-[#0d2230] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#D4AF37]" strokeWidth={1.5} />
          <span className="text-white/70 text-sm">{isRu ? 'Pipeline (взвешенная)' : 'Pipeline (gewichtet)'}:</span>
          <span className="text-[#D4AF37] font-bold text-lg">{fmtEur(totalPipelineValue)}</span>
        </div>
        <div className="h-5 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-white/70 text-sm">{isRu ? 'Выиграно' : 'Gewonnen'}:</span>
          <span className="text-emerald-400 font-bold">{fmtEur(totalWon)}</span>
        </div>
        <div className="h-5 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-white/70 text-sm">{isRu ? 'Всего сделок' : 'Deals gesamt'}:</span>
          <span className="text-white font-medium">{deals.length}</span>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => { setShowForm(true); setEditingDeal(null); }}
            className="flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#D4AF37]/90 transition-all"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            {isRu ? 'Новая сделка' : 'Neuer Deal'}
          </button>
        </div>
      </div>

      {/* ---- New Deal Form ---- */}
      {showForm && !editingDeal && (
        <DealForm
          locale={locale}
          products={products}
          onSubmit={createDeal}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* ---- Edit Deal Form ---- */}
      {editingDeal && (
        <DealForm
          locale={locale}
          products={products}
          isEdit
          initialData={{
            id: editingDeal.id,
            profile_id: editingDeal.profile_id,
            title: editingDeal.title,
            product_id: editingDeal.product_id,
            value_cents: editingDeal.value_cents,
            probability: editingDeal.probability ?? 0,
            expected_close_date: editingDeal.expected_close_date ?? '',
            notes: editingDeal.notes ?? '',
            stage: editingDeal.stage,
            lost_reason: editingDeal.lost_reason ?? '',
          }}
          onSubmit={updateDeal}
          onCancel={() => setEditingDeal(null)}
        />
      )}

      {/* ---- Lost Reason Modal ---- */}
      {lostPrompt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0d2230] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">
                {isRu ? 'Причина потери' : 'Verlustgrund'}
              </h3>
              <button onClick={() => setLostPrompt(null)} className="text-white/40 hover:text-white">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <textarea
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              placeholder={isRu ? 'Почему сделка потеряна?' : 'Warum ist der Deal verloren?'}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500/50 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={confirmLost}
                className="bg-red-500/20 text-red-300 border border-red-500/30 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-all"
              >
                {isRu ? 'Отметить как потерянную' : 'Als verloren markieren'}
              </button>
              <button
                onClick={() => setLostPrompt(null)}
                className="text-white/50 hover:text-white text-sm"
              >
                {isRu ? 'Отмена' : 'Abbrechen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Kanban Columns ---- */}
      <div className="flex md:grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:overflow-x-visible md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
        {STAGES.map((stage) => {
          const stageDeals = dealsByStage(stage.key);
          const weighted = weightedValue(stage.key);
          const idx = stageIndex(stage.key);

          return (
            <div key={stage.key} className={`rounded-2xl border ${stage.border} ${stage.bg} flex flex-col min-h-[280px] min-w-[280px] snap-center md:min-w-0`}>
              {/* Column Header */}
              <div className="p-3 border-b border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stage.badge}`}>
                    {isRu ? stage.ru : stage.de}
                  </span>
                  <span className="text-white/40 text-xs font-mono">{stageDeals.length}</span>
                </div>
                <div className="text-white/60 text-xs">
                  {stage.key === 'won'
                    ? fmtEur(stageDeals.reduce((s, d) => s + d.value_cents, 0))
                    : fmtEur(weighted)}
                  {stage.key !== 'won' && stage.key !== 'lost' && (
                    <span className="text-white/30 ml-1">{isRu ? '(взвеш.)' : '(gew.)'}</span>
                  )}
                </div>
              </div>

              {/* Deal Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[500px]">
                {stageDeals.length === 0 && (
                  <p className="text-white/20 text-xs text-center py-6">
                    {isRu ? 'Нет сделок' : 'Keine Deals'}
                  </p>
                )}
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-[#0a1a24]/80 border border-white/5 rounded-xl p-3 hover:border-white/15 transition-all group"
                  >
                    {/* Title + actions */}
                    <div className="flex items-start justify-between mb-1.5">
                      <h4 className="text-white text-sm font-medium leading-tight pr-2 line-clamp-2">
                        {deal.title}
                      </h4>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => { setEditingDeal(deal); setShowForm(false); }}
                          className="p-1 text-white/30 hover:text-white/70 transition-colors"
                          title={isRu ? 'Редактировать' : 'Bearbeiten'}
                        >
                          <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => deleteDeal(deal.id)}
                          className="p-1 text-white/30 hover:text-red-400 transition-colors"
                          title={isRu ? 'Удалить' : 'Löschen'}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {/* Customer name */}
                    <p className="text-white/40 text-xs mb-2 truncate">
                      {deal.profiles?.full_name || deal.profiles?.email || '—'}
                    </p>

                    {/* Value + probability */}
                    <div className="flex items-center gap-3 text-xs mb-2">
                      <span className="flex items-center gap-1 text-[#D4AF37]">
                        <Euro className="h-3 w-3" strokeWidth={1.5} />
                        {fmtEur(deal.value_cents)}
                      </span>
                      <span className="flex items-center gap-1 text-white/40">
                        <Percent className="h-3 w-3" strokeWidth={1.5} />
                        {deal.probability}%
                      </span>
                    </div>

                    {/* Expected close date */}
                    {deal.expected_close_date && (
                      <div className="flex items-center gap-1 text-white/30 text-xs mb-2">
                        <Calendar className="h-3 w-3" strokeWidth={1.5} />
                        {fmtDate(deal.expected_close_date)}
                      </div>
                    )}

                    {/* Lost reason */}
                    {deal.stage === 'lost' && deal.lost_reason && (
                      <p className="text-red-400/60 text-xs italic line-clamp-2 mb-2">
                        {deal.lost_reason}
                      </p>
                    )}

                    {/* Stage move buttons */}
                    <div className="flex items-center gap-1 pt-1 border-t border-white/5">
                      {idx > 0 && (
                        <button
                          onClick={() => moveStage(deal.id, STAGES[idx - 1].key)}
                          className="p-1 text-white/20 hover:text-white/60 transition-colors"
                          title={isRu ? STAGES[idx - 1].ru : STAGES[idx - 1].de}
                        >
                          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      )}
                      <span className="flex-1" />
                      {idx < STAGES.length - 1 && (
                        <button
                          onClick={() => moveStage(deal.id, STAGES[idx + 1].key)}
                          className="p-1 text-white/20 hover:text-white/60 transition-colors"
                          title={isRu ? STAGES[idx + 1].ru : STAGES[idx + 1].de}
                        >
                          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
