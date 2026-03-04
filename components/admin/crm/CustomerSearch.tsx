'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Mail, Users } from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  language: string | null;
  crm_status: string | null;
  tags: string[] | null;
  source: string | null;
  created_at: string | null;
  orders: { count: number }[];
  sessions: { count: number }[];
}

interface Props {
  customers: Customer[];
  locale: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  lead: { label: 'Lead', color: 'bg-white/5 text-white/50' },
  client: { label: 'Kunde', color: 'bg-gold/10 text-gold' },
  vip: { label: 'VIP', color: 'bg-purple-500/10 text-purple-400' },
  inactive: { label: 'Inaktiv', color: 'bg-red-500/10 text-red-400/70' },
};

export default function CustomerSearch({ customers, locale }: Props) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    let result = customers;

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.crm_status === statusFilter);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) =>
          (c.full_name?.toLowerCase().includes(q)) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone?.toLowerCase().includes(q)) ||
          (c.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [customers, query, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" strokeWidth={1.5} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, Email, Telefon oder Tag suchen..."
            className="w-full text-sm text-white/80 bg-[rgba(15,48,63,0.4)] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-gold/30 placeholder:text-white/20"
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { key: 'all', label: 'Alle' },
            { key: 'lead', label: 'Lead' },
            { key: 'client', label: 'Kunde' },
            { key: 'vip', label: 'VIP' },
            { key: 'inactive', label: 'Inaktiv' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                statusFilter === f.key
                  ? 'border-gold/30 bg-gold/10 text-gold'
                  : 'border-white/10 text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-white/30">
        {filtered.length} von {customers.length} Kunden
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 sm:p-12 text-center">
          <Users className="h-10 w-10 text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/40">Keine Kunden gefunden.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 font-medium">Name / Email</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 font-medium hidden md:table-cell">Status</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 font-medium hidden lg:table-cell">Bestellungen</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 font-medium hidden lg:table-cell">Sprache</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 font-medium hidden xl:table-cell">Registriert</th>
                  <th className="text-left px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((k) => {
                  const sc = statusConfig[k.crm_status ?? 'lead'] ?? statusConfig.lead;
                  return (
                    <tr key={k.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-3 sm:px-5 py-3 sm:py-4">
                        <p className="text-white font-medium">{k.full_name ?? '—'}</p>
                        <p className="text-xs text-white/40 mt-0.5">{k.email}</p>
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-4 hidden md:table-cell">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-4 text-white/60 hidden lg:table-cell">
                        {(k.orders as { count: number }[])?.[0]?.count ?? 0}
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-4 text-white/60 hidden lg:table-cell">
                        {k.language?.toUpperCase()}
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-4 text-white/40 text-xs hidden xl:table-cell">
                        {new Date(k.created_at ?? '').toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/${locale}/admin/kunden/${k.id}`}
                            className="text-xs text-gold/60 hover:text-gold transition-colors"
                          >
                            Details →
                          </Link>
                          <a
                            href={`mailto:${k.email}`}
                            className="p-1.5 text-white/30 hover:text-white/70 transition-colors"
                            title="E-Mail senden"
                          >
                            <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
