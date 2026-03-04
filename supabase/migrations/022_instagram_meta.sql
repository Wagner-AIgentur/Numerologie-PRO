-- ============================================================
-- 022: Instagram / Meta Integration
-- Instagram DMs, Lead Ads, Conversions API (CAPI)
-- ============================================================

-- ── 1. Instagram sender ID on profiles ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS instagram_sender_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_instagram_sender_id
  ON public.profiles(instagram_sender_id);

-- ── 2. Instagram Messages Log ──
CREATE TABLE IF NOT EXISTS public.instagram_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  message_text TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'story_reply', 'story_mention')),
  ig_message_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_instagram_messages_sender ON public.instagram_messages(sender_id, created_at DESC);
CREATE INDEX idx_instagram_messages_profile ON public.instagram_messages(profile_id, created_at DESC);

ALTER TABLE public.instagram_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on instagram_messages"
  ON public.instagram_messages FOR ALL
  USING (auth.role() = 'service_role');

-- ── 3. Meta CAPI Event Log ──
CREATE TABLE IF NOT EXISTS public.meta_capi_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_id TEXT NOT NULL UNIQUE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email_hash TEXT,
  event_data JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed'))
);

CREATE INDEX idx_meta_capi_events_event_id ON public.meta_capi_events(event_id);

ALTER TABLE public.meta_capi_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on meta_capi_events"
  ON public.meta_capi_events FOR ALL
  USING (auth.role() = 'service_role');

-- ── 4. Extend activity_feed for Instagram types ──
ALTER TABLE public.activity_feed
  DROP CONSTRAINT IF EXISTS activity_feed_activity_type_check;
ALTER TABLE public.activity_feed
  ADD CONSTRAINT activity_feed_activity_type_check CHECK (activity_type IN (
    'email_received', 'email_sent', 'telegram_in', 'telegram_out',
    'contact_form', 'order', 'session', 'note', 'deal_update',
    'instagram_dm_in', 'instagram_dm_out', 'instagram_lead'
  ));

-- ── 5. Extend automation_rules for Instagram triggers ──
ALTER TABLE public.automation_rules
  DROP CONSTRAINT IF EXISTS automation_rules_trigger_event_check;
ALTER TABLE public.automation_rules
  ADD CONSTRAINT automation_rules_trigger_event_check CHECK (trigger_event IN (
    'lead_created', 'lead_verified', 'profile_updated',
    'order_completed', 'order_refunded', 'session_scheduled',
    'session_completed', 'tag_added', 'tag_removed',
    'contact_submitted', 'crm_status_changed', 'follow_up_due',
    'instagram_dm_received', 'instagram_lead_received'
  ));

-- ── 6. Add instagram permission to manager role ──
UPDATE public.team_roles
  SET permissions = array_append(permissions, 'instagram')
  WHERE name = 'manager' AND NOT ('instagram' = ANY(permissions));
