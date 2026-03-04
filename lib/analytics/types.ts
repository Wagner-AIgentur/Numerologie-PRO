export interface DayDataPoint {
  date: string; // 'YYYY-MM-DD'
  value: number;
}

export interface MonthDataPoint {
  month: string; // 'Jan', 'Feb', etc.
  value: number;
}

export interface NamedValue {
  name: string;
  value: number;
}

export interface FunnelStep {
  label: string;
  value: number;
  percentage: number;
}

export interface SessionStats {
  total: number;
  byStatus: NamedValue[];
  byType: NamedValue[];
}

export interface CouponStat {
  code: string;
  type: 'percent' | 'fixed';
  discountValue: number;
  usedCount: number;
  maxUses: number | null;
  active: boolean;
}

export interface AnalyticsData {
  // KPIs
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  conversionRate: number;
  totalSessions: number;
  totalCouponsUsed: number;

  // Charts
  revenueByDay: DayDataPoint[];
  revenueByProduct: NamedValue[];
  customerGrowthByMonth: MonthDataPoint[];
  customersByLanguage: NamedValue[];
  customersByCrmStatus: NamedValue[];
  funnel: FunnelStep[];
  ordersByDay: DayDataPoint[];
  ordersByStatus: NamedValue[];
  topProducts: NamedValue[];
  sessionStats: SessionStats;
  couponStats: CouponStat[];
}
