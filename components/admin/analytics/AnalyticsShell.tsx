'use client';

import { useState, useCallback } from 'react';
import type { AnalyticsData } from '@/lib/analytics/types';
import DateRangePicker, { type DateRange } from './DateRangePicker';
import AnalyticsKPIGrid from './AnalyticsKPIGrid';
import RevenueSection from './RevenueSection';
import CustomerSection from './CustomerSection';
import ConversionFunnel from './ConversionFunnel';
import OrdersSection from './OrdersSection';
import SessionsSection from './SessionsSection';
import CouponsSection from './CouponsSection';

interface Props {
  initialData: AnalyticsData;
}

export default function AnalyticsShell({ initialData }: Props) {
  const [data, setData] = useState<AnalyticsData>(initialData);
  const [range, setRange] = useState<DateRange>('30d');
  const [loading, setLoading] = useState(false);

  const handleRangeChange = useCallback(async (newRange: DateRange) => {
    setRange(newRange);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${newRange}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className={`space-y-6 transition-opacity duration-200 ${loading ? 'opacity-60' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">Analytics</h1>
          <p className="text-white/50 mt-1 text-sm">Alle wichtigen KPIs auf einen Blick.</p>
        </div>
        <DateRangePicker value={range} onChange={handleRangeChange} loading={loading} />
      </div>

      <AnalyticsKPIGrid data={data} />

      <RevenueSection
        revenueByDay={data.revenueByDay}
        revenueByProduct={data.revenueByProduct}
      />

      <CustomerSection
        customerGrowthByMonth={data.customerGrowthByMonth}
        customersByLanguage={data.customersByLanguage}
        customersByCrmStatus={data.customersByCrmStatus}
      />

      <ConversionFunnel funnel={data.funnel} />

      <OrdersSection
        ordersByDay={data.ordersByDay}
        ordersByStatus={data.ordersByStatus}
        topProducts={data.topProducts}
      />

      <SessionsSection sessionStats={data.sessionStats} />

      <CouponsSection couponStats={data.couponStats} />
    </div>
  );
}
