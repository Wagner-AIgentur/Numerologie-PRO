-- Double Opt-In columns for leads table
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;

-- Index for fast token lookup during verification
CREATE INDEX IF NOT EXISTS idx_leads_verification_token
  ON public.leads(verification_token)
  WHERE email_verified = false;

-- Index for email lookup
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- Trigger: When a new profile is created, link existing leads by email
CREATE OR REPLACE FUNCTION public.link_leads_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.leads
  SET profile_id = NEW.id
  WHERE email = NEW.email AND profile_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_profile_created_link_leads ON public.profiles;

CREATE TRIGGER on_profile_created_link_leads
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.link_leads_to_profile();
