'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, User, ShoppingBag } from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  language: string | null;
  crm_status: string;
  tags: string[];
  created_at: string | null;
  order_count: number;
  total_revenue: number;
}

interface Props {
  customers: Customer[];
  locale: string;
}

const STAGES = [
  { key: 'lead', label: 'Lead', color: 'border-white/20', headerBg: 'bg-white/5', badge: 'text-white/50' },
  { key: 'client', label: 'Kunde', color: 'border-gold/30', headerBg: 'bg-gold/5', badge: 'text-gold' },
  { key: 'vip', label: 'VIP', color: 'border-purple-500/30', headerBg: 'bg-purple-500/5', badge: 'text-purple-400' },
  { key: 'inactive', label: 'Inaktiv', color: 'border-red-500/30', headerBg: 'bg-red-500/5', badge: 'text-red-400' },
];

const NEXT_STATUS: Record<string, string[]> = {
  lead: ['client', 'vip', 'inactive'],
  client: ['lead', 'vip', 'inactive'],
  vip: ['lead', 'client', 'inactive'],
  inactive: ['lead', 'client', 'vip'],
};

export default function PipelineBoard({ customers: initial, locale }: Props) {
  const [customers, setCustomers] = useState(initial);
  const [updating, setUpdating] = useState<string | null>(null);

  async function moveCustomer(id: string, newStatus: string) {
    setUpdating(id);
    const previousCustomers = customers;
    // Optimistic update
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, crm_status: newStatus } : c))
    );
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crm_status: newStatus }),
      });
      if (!res.ok) {
        // Rollback on error
        setCustomers(previousCustomers);
        alert('Fehler beim Verschieben. Bitte erneut versuchen.');
      }
    } catch {
      // Rollback on network error
      setCustomers(previousCustomers);
      alert('Netzwerkfehler. Bitte erneut versuchen.');
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {STAGES.map((stage) => {
        const stageCustomers = customers.filter((c) => c.crm_status === stage.key);
        const stageRevenue = stageCustomers.reduce((s, c) => s + c.total_revenue, 0);

        return (
          <div key={stage.key} className={`rounded-2xl border ${stage.color} bg-[rgba(15,48,63,0.2)] backdrop-blur-sm overflow-hidden`}>
            {/* Stage Header */}
            <div className={`${stage.headerBg} px-4 py-3 border-b ${stage.color}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-bold ${stage.badge}`}>{stage.label}</h3>
                <span className="text-xs text-white/30">{stageCustomers.length}</span>
              </div>
              {stageRevenue > 0 && (
                <p className="text-[10px] text-white/30 mt-0.5">
                  {(stageRevenue / 100).toFixed(0)}&euro; Umsatz
                </p>
              )}
            </div>

            {/* Customer Cards */}
            <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
              {stageCustomers.length === 0 && (
                <p className="text-xs text-white/20 text-center py-4">Leer</p>
              )}
              {stageCustomers.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-xl border border-white/5 bg-[rgba(15,48,63,0.4)] p-3 transition-opacity ${
                    updating === c.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-white/30" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/${locale}/admin/kunden/${c.id}`}
                        className="text-xs text-white/80 font-medium hover:text-gold transition-colors block truncate"
                      >
                        {c.full_name ?? c.email}
                      </Link>
                      <p className="text-[10px] text-white/30 truncate">{c.email}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  {c.order_count > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-white/30 mb-2">
                      <ShoppingBag className="h-3 w-3" strokeWidth={1.5} />
                      {c.order_count} Best. &middot; {(c.total_revenue / 100).toFixed(0)}&euro;
                    </div>
                  )}

                  {/* Move Buttons */}
                  <div className="flex gap-1">
                    {(NEXT_STATUS[stage.key] ?? []).map((next) => {
                      const nextStage = STAGES.find((s) => s.key === next);
                      return (
                        <button
                          key={next}
                          onClick={() => moveCustomer(c.id, next)}
                          disabled={updating === c.id}
                          className={`flex items-center gap-0.5 text-[10px] px-2 py-1 rounded-md border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5 transition-all disabled:opacity-30`}
                        >
                          <ChevronRight className="h-2.5 w-2.5" strokeWidth={2} />
                          {nextStage?.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
