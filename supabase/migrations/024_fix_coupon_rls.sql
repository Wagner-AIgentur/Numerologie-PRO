-- Migration 024: Fix Coupon RLS Policies
-- Previous USING(true) allowed public access via anon key — restricting to service_role only.

DROP POLICY IF EXISTS "Service role full access on coupons" ON public.coupons;
DROP POLICY IF EXISTS "Service role full access on coupon_usages" ON public.coupon_usages;

CREATE POLICY "Service role full access on coupons"
  ON public.coupons FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on coupon_usages"
  ON public.coupon_usages FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
