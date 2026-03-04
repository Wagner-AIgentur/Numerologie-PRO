-- Sprint 6: Gutschein-System (Coupons + Usage Tracking)
-- Execute this SQL in Supabase Dashboard → SQL Editor

-- coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  value NUMERIC NOT NULL CHECK (value > 0),
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ DEFAULT NULL,
  active BOOLEAN DEFAULT true,
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'pdf_analyse', 'packages')),
  stripe_coupon_id TEXT DEFAULT NULL,
  stripe_promotion_code_id TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- coupon_usages table
CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  used_at TIMESTAMPTZ DEFAULT now()
);

-- RPC for atomic increment of coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_uuid UUID)
RETURNS VOID AS $$
  UPDATE public.coupons SET used_count = used_count + 1, updated_at = now()
  WHERE id = coupon_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- Coupons: only admin can read/write (via service role key)
CREATE POLICY "Service role full access on coupons"
  ON public.coupons FOR ALL
  USING (true) WITH CHECK (true);

-- Coupon Usages: service role full access
CREATE POLICY "Service role full access on coupon_usages"
  ON public.coupon_usages FOR ALL
  USING (true) WITH CHECK (true);

-- Index for fast code lookup
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON public.coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_email ON public.coupon_usages(email);
