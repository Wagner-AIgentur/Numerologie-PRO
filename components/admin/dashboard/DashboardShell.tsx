'use client';

import { useState } from 'react';
import { Users, MessageSquare, ShoppingBag, TrendingUp } from 'lucide-react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import Link from 'next/link';

interface DashboardStats {
  totalKunden: number;
  neueAnfragen: number;
  offeneBestellungen: number;
  geplanteTermine: number;
}

interface Props {
  initialStats: DashboardStats;
  locale: string;
  labels: {
    totalCustomers: string;
    newInquiries: string;
    paidOrders: string;
    plannedSessions: string;
  };
}

export default function DashboardShell({ initialStats, locale, labels }: Props) {
  const [stats, setStats] = useState(initialStats);

  useAutoRefresh(async () => {
    try {
      const res = await fetch('/api/admin/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // silent
    }
  }, 30000);

  const cards = [
    { icon: Users, label: labels.totalCustomers, value: stats.totalKunden, href: `/${locale}/admin/kunden`, color: 'text-blue-400' },
    { icon: MessageSquare, label: labels.newInquiries, value: stats.neueAnfragen, href: `/${locale}/admin/kontakte`, color: 'text-yellow-400' },
    { icon: ShoppingBag, label: labels.paidOrders, value: stats.offeneBestellungen, href: `/${locale}/admin/bestellungen`, color: 'text-emerald-400' },
    { icon: TrendingUp, label: labels.plannedSessions, value: stats.geplanteTermine, href: `/${locale}/admin/sitzungen`, color: 'text-gold' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ icon: Icon, label, value, href, color }) => (
        <Link
          key={label}
          href={href}
          className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5 hover:border-gold/30 transition-all group"
        >
          <Icon className={`h-6 w-6 mb-3 ${color}`} strokeWidth={1.5} />
          <div className="text-3xl font-bold text-white">{value}</div>
          <div className="text-xs text-white/50 mt-1">{label}</div>
        </Link>
      ))}
    </div>
  );
}
