-- ============================================================
-- 014: KI-Lead-Scoring
-- Automated lead scoring based on profile completeness,
-- engagement, revenue, and activity patterns.
-- ============================================================

-- Add scoring columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lead_score_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now();

-- Index for sorting/filtering by score
CREATE INDEX IF NOT EXISTS idx_profiles_lead_score ON public.profiles (lead_score DESC);

-- ============================================================
-- PostgreSQL function: calculate_lead_score
-- Scores a single profile from 0-100 based on:
--   - Profile completeness (birthdate, telegram, phone)
--   - Order count & revenue tiers
--   - Session engagement
--   - Inactivity decay
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_lead_score(p_profile_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_score INTEGER := 0;
  v_profile RECORD;
  v_order_count INTEGER;
  v_total_revenue INTEGER;
  v_session_count INTEGER;
  v_days_inactive INTEGER;
BEGIN
  -- Fetch profile
  SELECT birthdate, telegram_chat_id, phone, last_activity_at
  INTO v_profile
  FROM public.profiles
  WHERE id = p_profile_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- ── Profile completeness ──────────────────────────────
  -- Birthdate filled: +5
  IF v_profile.birthdate IS NOT NULL THEN
    v_score := v_score + 5;
  END IF;

  -- Telegram connected: +10
  IF v_profile.telegram_chat_id IS NOT NULL THEN
    v_score := v_score + 10;
  END IF;

  -- Phone filled: +5
  IF v_profile.phone IS NOT NULL AND v_profile.phone <> '' THEN
    v_score := v_score + 5;
  END IF;

  -- ── Orders: +15 each, max 60 ─────────────────────────
  SELECT COUNT(*)
  INTO v_order_count
  FROM public.orders
  WHERE profile_id = p_profile_id AND status = 'paid';

  v_score := v_score + LEAST(v_order_count * 15, 60);

  -- ── Revenue tiers ────────────────────────────────────
  SELECT COALESCE(SUM(amount_cents), 0)
  INTO v_total_revenue
  FROM public.orders
  WHERE profile_id = p_profile_id AND status = 'paid';

  IF v_total_revenue >= 20000 THEN
    -- 200€+ => +20
    v_score := v_score + 20;
  ELSIF v_total_revenue >= 5000 THEN
    -- 50€+ => +10
    v_score := v_score + 10;
  END IF;

  -- ── Sessions: +10 each, max 30 ──────────────────────
  SELECT COUNT(*)
  INTO v_session_count
  FROM public.sessions
  WHERE profile_id = p_profile_id
    AND status IN ('scheduled', 'confirmed', 'completed');

  v_score := v_score + LEAST(v_session_count * 10, 30);

  -- ── Inactivity decay ────────────────────────────────
  IF v_profile.last_activity_at IS NOT NULL THEN
    v_days_inactive := EXTRACT(DAY FROM (now() - v_profile.last_activity_at))::INTEGER;
  ELSE
    v_days_inactive := 0;
  END IF;

  IF v_days_inactive >= 60 THEN
    v_score := v_score - 20;
  ELSIF v_days_inactive >= 30 THEN
    v_score := v_score - 10;
  END IF;

  -- Clamp to 0-100
  v_score := GREATEST(0, LEAST(100, v_score));

  RETURN v_score;
END;
$$;
