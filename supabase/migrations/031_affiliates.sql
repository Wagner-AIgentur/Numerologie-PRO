-- Migration 031: Affiliate Program + Coupon Purpose Extension
-- ============================================================

-- 1. Extend coupons table with purpose and affiliate link
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT 'general'
    CHECK (purpose IN ('general', 'marketing', 'affiliate', 'campaign', 'referral')),
  ADD COLUMN IF NOT EXISTS affiliate_id UUID DEFAULT NULL;

-- 2. Affiliates table
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  commission_percent NUMERIC NOT NULL DEFAULT 10
    CHECK (commission_percent >= 0 AND commission_percent <= 100),
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  tracking_code TEXT NOT NULL UNIQUE,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_revenue_cents BIGINT DEFAULT 0,
  total_commission_cents BIGINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  payout_info JSONB DEFAULT '{}',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. FK on coupons.affiliate_id → affiliates
ALTER TABLE public.coupons
  ADD CONSTRAINT fk_coupons_affiliate
  FOREIGN KEY (affiliate_id) REFERENCES public.affiliates(id) ON DELETE SET NULL;

-- 4. Affiliate click tracking
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  ip TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  referrer_url TEXT DEFAULT NULL,
  landing_page TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Affiliate payouts (future-proofing for payout tracking)
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  currency TEXT DEFAULT 'eur',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  notes TEXT DEFAULT NULL,
  paid_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. RLS Policies (service_role only — consistent with all other tables)
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on affiliates"
  ON public.affiliates FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on affiliate_clicks"
  ON public.affiliate_clicks FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on affiliate_payouts"
  ON public.affiliate_payouts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_affiliates_tracking_code ON public.affiliates(tracking_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON public.affiliates(email);
CREATE INDEX IF NOT EXISTS idx_affiliates_coupon_id ON public.affiliates(coupon_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_is_active ON public.affiliates(is_active);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON public.affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON public.affiliate_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id ON public.affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_coupons_affiliate_id ON public.coupons(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_coupons_purpose ON public.coupons(purpose);

-- 8. Atomic RPC: Increment affiliate click count
CREATE OR REPLACE FUNCTION increment_affiliate_clicks(aff_uuid UUID)
RETURNS VOID AS $$
  UPDATE public.affiliates
  SET total_clicks = total_clicks + 1, updated_at = now()
  WHERE id = aff_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- 9. Atomic RPC: Record affiliate conversion with revenue + commission
CREATE OR REPLACE FUNCTION record_affiliate_conversion(
  aff_uuid UUID,
  p_revenue_cents BIGINT,
  p_commission_cents BIGINT
)
RETURNS VOID AS $$
  UPDATE public.affiliates
  SET
    total_conversions = total_conversions + 1,
    total_revenue_cents = total_revenue_cents + p_revenue_cents,
    total_commission_cents = total_commission_cents + p_commission_cents,
    updated_at = now()
  WHERE id = aff_uuid;
$$ LANGUAGE sql SECURITY DEFINER;
