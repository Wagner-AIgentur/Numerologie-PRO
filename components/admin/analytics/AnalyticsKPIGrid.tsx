'use client';

import { DollarSign, TrendingUp, Users, BarChart3, Calendar, Ticket } from 'lucide-react';
import type { AnalyticsData } from '@/lib/analytics/types';

interface Props {
  data: AnalyticsData;
}

export default function AnalyticsKPIGrid({ data }: Props) {
  const kpis = [
    {
      icon: DollarSign,
      label: 'Umsatz gesamt',
      value: `${data.totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €`,
      color: 'text-emerald-400',
    },
    {
      icon: TrendingUp,
      label: 'Ø Bestellwert',
      value: `${data.averageOrderValue.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €`,
      color: 'text-blue-400',
    },
    {
      icon: Users,
      label: 'Kunden',
      value: data.totalCustomers.toString(),
      color: 'text-gold',
    },
    {
      icon: BarChart3,
      label: 'Conversion Rate',
      value: `${data.conversionRate}%`,
      color: 'text-purple-400',
    },
    {
      icon: Calendar,
      label: 'Sitzungen',
      value: data.totalSessions.toString(),
      color: 'text-cyan-400',
    },
    {
      icon: Ticket,
      label: 'Gutschein-Nutzungen',
      value: data.totalCouponsUsed.toString(),
      color: 'text-yellow-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map(({ icon: Icon, label, value, color }) => (
        <div
          key={label}
          className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-4"
        >
          <Icon className={`h-5 w-5 mb-2 ${color}`} strokeWidth={1.5} />
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-xs text-white/50 mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
