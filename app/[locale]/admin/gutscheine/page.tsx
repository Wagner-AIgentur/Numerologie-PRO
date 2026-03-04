import { adminClient } from '@/lib/supabase/admin';
import { getAdminT } from '@/lib/i18n/admin';
import { Ticket } from 'lucide-react';
import CouponManager from '@/components/admin/CouponManager';

export default async function AdminGutscheinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getAdminT(locale);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: coupons } = await (adminClient as any)
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false }) as { data: Array<{
      id: string; code: string; type: 'percent' | 'fixed'; value: number;
      max_uses: number | null; used_count: number;
      valid_from: string | null; valid_until: string | null;
      active: boolean; applies_to: string; purpose: string;
      affiliate_id: string | null;
      stripe_coupon_id: string | null; stripe_promotion_code_id: string | null;
      created_at: string; updated_at: string;
    }> | null };

  const activeCoupons = coupons?.filter((c) => c.active) ?? [];
  const totalUsages = coupons?.reduce((sum, c) => sum + c.used_count, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">{t.couponsTitle}</h1>
          <p className="text-white/50 text-sm mt-1">
            {activeCoupons.length} {t.active} · {totalUsages} {t.redemptionsTotal}
          </p>
        </div>
      </div>

      {!coupons || coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 sm:p-12 text-center">
          <Ticket className="h-10 w-10 text-white/20 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/40">{t.noCouponsYet}</p>
        </div>
      ) : null}

      <CouponManager initialCoupons={coupons ?? []} />
    </div>
  );
}
