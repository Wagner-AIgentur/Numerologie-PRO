-- 030: Marketing Consent (DSGVO Art. 6 Abs. 1 lit. a)
-- Adds marketing_consent flag to profiles for email marketing opt-in.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ DEFAULT NULL;
