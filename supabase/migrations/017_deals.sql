-- 017: Deal Pipeline
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  value_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'eur',
  stage TEXT NOT NULL DEFAULT 'new' CHECK (stage IN (
    'new', 'contacted', 'proposal', 'negotiation', 'won', 'lost'
  )),
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  lost_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_deals_profile ON public.deals(profile_id);
CREATE INDEX idx_deals_stage ON public.deals(stage) WHERE stage NOT IN ('won', 'lost');

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on deals"
  ON public.deals FOR ALL
  USING (auth.role() = 'service_role');
