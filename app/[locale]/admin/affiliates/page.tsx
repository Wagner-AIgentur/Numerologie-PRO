import { adminClient } from '@/lib/supabase/admin';
import { getAdminT } from '@/lib/i18n/admin';
import { Users, Gift, MousePointerClick, ShoppingCart } from 'lucide-react';
import AffiliateManager from '@/components/admin/AffiliateManager';

export default async function AdminAffiliatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getAdminT(locale);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: affiliates }, { data: referrals }, { data: referralCoupons }] = await Promise.all([
    (adminClient as any)
      .from('affiliates')
      .select('*, coupons!affiliates_coupon_id_fkey(id, code, type, value, used_count, active, stripe_coupon_id)')
      .order('created_at', { ascending: false }) as Promise<{ data: Array<{
        id: string; name: string; email: string;
        commission_percent: number; coupon_id: string | null;
        tracking_code: string; total_clicks: number;
        total_conversions: number; total_revenue_cents: number;
        total_commission_cents: number; is_active: boolean;
        payout_info: Record<string, unknown>; notes: string | null;
        created_at: string; updated_at: string;
        coupons: {
          id: string; code: string; type: 'percent' | 'fixed'; value: number;
          used_count: number; active: boolean; stripe_coupon_id: string | null;
        } | null;
      }> | null }>,
    adminClient
      .from('referrals')
      .select('id, code, status, created_at, referrer_profile_id, profiles!referrals_referrer_profile_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(50),
    adminClient
      .from('coupons')
      .select('id, code, value, used_count, active')
      .eq('purpose', 'referral')
      .order('created_at', { ascending: false }),
  ]);

  const activeAffiliates = affiliates?.filter((a) => a.is_active) ?? [];
  const totalClicks = affiliates?.reduce((sum, a) => sum + a.total_clicks, 0) ?? 0;
  const totalRevenue = affiliates?.reduce((sum, a) => sum + a.total_revenue_cents, 0) ?? 0;

  const totalReferrals = referrals?.length ?? 0;
  const convertedReferrals = referrals?.filter((r: { status: string | null }) => r.status === 'converted').length ?? 0;
  const activeRefCoupons = referralCoupons?.filter((c: { active: boolean | null; used_count: number | null }) => c.active && c.used_count === 0).length ?? 0;

  return (
    <div className="space-y-8">
      {/* --- AFFILIATE PARTNER SECTION --- */}
      <div>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-white">{t.affiliatesTitle}</h1>
            <p className="text-white/50 text-sm mt-1">
              {activeAffiliates.length} {t.active} · {totalClicks} {t.affiliateClicks} · {(totalRevenue / 100).toFixed(2)} EUR {t.affiliateRevenue}
            </p>
          </div>
        </div>

        {!affiliates || affiliates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 sm:p-12 text-center">
            <Users className="h-10 w-10 text-white/20 mx-auto mb-4" strokeWidth={1} />
            <p className="text-white/40">{t.noAffiliatesYet}</p>
          </div>
        ) : null}

        <AffiliateManager initialAffiliates={affiliates ?? []} locale={locale} />
      </div>

      {/* --- KUNDEN-EMPFEHLUNGEN (REFERRALS) SECTION --- */}
      <div>
        <div className="mb-4">
          <h2 className="font-serif text-xl font-bold text-white">
            {locale === 'de' ? 'Kunden-Empfehlungen' : 'Рекомендации клиентов'}
          </h2>
          <p className="text-white/50 text-sm mt-1">
            {locale === 'de'
              ? 'Empfehlungs-Programm: Kunden teilen ihren Link und erhalten 15% Rabatt'
              : 'Программа рекомендаций: клиенты делятся ссылкой и получают скидку 15%'}
          </p>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                <MousePointerClick className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{totalReferrals}</div>
            <div className="text-xs text-white/50 mt-1">{locale === 'de' ? 'Empfehlungen gesamt' : 'Всего рекомендаций'}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <ShoppingCart className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{convertedReferrals}</div>
            <div className="text-xs text-white/50 mt-1">{locale === 'de' ? 'Erfolgreiche Conversions' : 'Успешных конверсий'}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 border border-gold/20">
                <Gift className="h-4 w-4 text-gold" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{activeRefCoupons}</div>
            <div className="text-xs text-white/50 mt-1">{locale === 'de' ? 'Aktive Belohnungs-Gutscheine' : 'Активных купонов-наград'}</div>
          </div>
        </div>

        {/* Referrals Table */}
        {referrals && referrals.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-5 py-3 text-white/50 font-medium">{locale === 'de' ? 'Empfehler' : 'Рекомендатель'}</th>
                    <th className="text-left px-5 py-3 text-white/50 font-medium">{locale === 'de' ? 'Code' : 'Код'}</th>
                    <th className="text-left px-5 py-3 text-white/50 font-medium">Status</th>
                    <th className="text-left px-5 py-3 text-white/50 font-medium hidden md:table-cell">{locale === 'de' ? 'Datum' : 'Дата'}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {referrals.map((ref: any) => {
                    const profile = Array.isArray(ref.profiles) ? ref.profiles[0] : ref.profiles;
                    return (
                    <tr key={ref.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="text-white text-sm">{profile?.full_name ?? '-'}</div>
                        <div className="text-white/40 text-xs">{profile?.email ?? ''}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-gold/70">{ref.code}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ref.status === 'converted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {ref.status === 'converted' ? (locale === 'de' ? 'Gebucht' : 'Оплачено') : (locale === 'de' ? 'Ausstehend' : 'Ожидание')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white/40 text-xs hidden md:table-cell">
                        {new Date(ref.created_at).toLocaleDateString(locale === 'de' ? 'de-DE' : 'ru-RU')}
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
    </div>
  );
}
