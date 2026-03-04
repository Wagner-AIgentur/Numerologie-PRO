-- ============================================================================
-- Migration 025: Security Hardening
--
-- Fixes identified in security audit 2026-02-24:
-- 1. Enable RLS on 11 core tables missing it
-- 2. Add explicit service_role policies
-- 3. Add user-facing SELECT policies where needed
-- 4. Fix SECURITY DEFINER functions: add SET search_path = public
-- 5. REVOKE EXECUTE on admin-only functions from anon/authenticated
-- 6. Add explicit policies to broadcasts/bot tables
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- PART 1: Enable RLS on all core tables
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────
-- PART 2: Service-role full access on all core tables
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Service role full access on profiles"
  ON public.profiles FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on orders"
  ON public.orders FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on sessions"
  ON public.sessions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on deliverables"
  ON public.deliverables FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on products"
  ON public.products FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on leads"
  ON public.leads FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on contact_submissions"
  ON public.contact_submissions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on crm_notes"
  ON public.crm_notes FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on email_log"
  ON public.email_log FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on telegram_messages"
  ON public.telegram_messages FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on referrals"
  ON public.referrals FOR ALL USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────────────────────
-- PART 3: User-facing policies (authenticated users access own data only)
-- ────────────────────────────────────────────────────────────────────────────

-- Profiles: users can read and update ONLY their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Orders: users can read ONLY their own orders
CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = profile_id);

-- Sessions: users can read ONLY their own sessions
CREATE POLICY "Users can read own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = profile_id);

-- Deliverables: users can read ONLY their own deliverables
CREATE POLICY "Users can read own deliverables"
  ON public.deliverables FOR SELECT
  USING (auth.uid() = profile_id);

-- Products: anyone can read active products (public catalog)
CREATE POLICY "Anyone can read active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- ────────────────────────────────────────────────────────────────────────────
-- PART 4: Explicit service_role policies for broadcasts/bot tables
-- (These had RLS enabled but no explicit policies)
-- ────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Service role full access on broadcasts"
  ON public.broadcasts FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on broadcast_recipients"
  ON public.broadcast_recipients FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on bot_commands"
  ON public.bot_commands FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on bot_faq_rules"
  ON public.bot_faq_rules FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on bot_settings"
  ON public.bot_settings FOR ALL USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────────────────────
-- PART 5: Fix SECURITY DEFINER functions — add SET search_path = public
-- and REVOKE EXECUTE from anon/authenticated on admin-only functions
-- ────────────────────────────────────────────────────────────────────────────

-- 5a. increment_coupon_usage (from 006_coupons.sql)
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_uuid UUID)
RETURNS VOID AS $$
  UPDATE public.coupons SET used_count = used_count + 1, updated_at = now()
  WHERE id = coupon_uuid;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION increment_coupon_usage(UUID) FROM anon, authenticated;

-- 5b. link_leads_to_profile (from 007_lead_verification.sql)
CREATE OR REPLACE FUNCTION link_leads_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.leads SET profile_id = NEW.id WHERE email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5c. update_broadcast_stats (from 010_broadcasts.sql)
CREATE OR REPLACE FUNCTION update_broadcast_stats(broadcast_uuid UUID)
RETURNS VOID AS $$
  UPDATE public.broadcasts SET
    total_recipients = (SELECT COUNT(*) FROM public.broadcast_recipients WHERE broadcast_id = broadcast_uuid),
    sent_count = (SELECT COUNT(*) FROM public.broadcast_recipients WHERE broadcast_id = broadcast_uuid AND status = 'sent'),
    failed_count = (SELECT COUNT(*) FROM public.broadcast_recipients WHERE broadcast_id = broadcast_uuid AND status = 'failed'),
    updated_at = now()
  WHERE id = broadcast_uuid;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION update_broadcast_stats(UUID) FROM anon, authenticated;

-- 5d. calculate_lead_score (from 014_lead_scoring.sql)
-- Re-create with SET search_path and REVOKE
DO $$
BEGIN
  EXECUTE 'REVOKE EXECUTE ON FUNCTION calculate_lead_score(UUID) FROM anon, authenticated';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- 5e. Analytics functions (from 019_analytics_functions.sql)
DO $$
BEGIN
  EXECUTE 'REVOKE EXECUTE ON FUNCTION revenue_by_period(TEXT, INT) FROM anon, authenticated';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$
BEGIN
  EXECUTE 'REVOKE EXECUTE ON FUNCTION source_conversion_stats() FROM anon, authenticated';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

DO $$
BEGIN
  EXECUTE 'REVOKE EXECUTE ON FUNCTION sequence_performance_stats() FROM anon, authenticated';
EXCEPTION WHEN undefined_function THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- PART 6: Restrict profile updates to safe columns via trigger
-- Prevents users from escalating privileges by directly calling Supabase API
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION protect_profile_admin_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If not service_role, prevent changes to privileged fields
  IF auth.role() != 'service_role' THEN
    NEW.crm_status := OLD.crm_status;
    NEW.team_role_id := OLD.team_role_id;
    NEW.lead_score := OLD.lead_score;
    NEW.tags := OLD.tags;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS protect_profile_admin_fields_trigger ON public.profiles;
CREATE TRIGGER protect_profile_admin_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_profile_admin_fields();
