-- 026: DSGVO Email Unsubscribe & Account Deletion Support
-- Adds email_unsubscribed flag and unsubscribe_token to profiles and leads.
-- Adds deletion_requested_at for Art. 17 DSGVO (Right to Erasure).

-- 1. Profiles: unsubscribe fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_unsubscribed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Leads: unsubscribe fields
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS email_unsubscribed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT gen_random_uuid();

-- 3. Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_profiles_unsubscribe_token ON profiles(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_leads_unsubscribe_token ON leads(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_profiles_deletion_requested ON profiles(deletion_requested_at) WHERE deletion_requested_at IS NOT NULL;

-- 4. Backfill existing rows with unique tokens
UPDATE profiles SET unsubscribe_token = gen_random_uuid() WHERE unsubscribe_token IS NULL;
UPDATE leads SET unsubscribe_token = gen_random_uuid() WHERE unsubscribe_token IS NULL;

-- 5. Make unsubscribe_token NOT NULL after backfill
ALTER TABLE profiles ALTER COLUMN unsubscribe_token SET NOT NULL;
ALTER TABLE leads ALTER COLUMN unsubscribe_token SET NOT NULL;
