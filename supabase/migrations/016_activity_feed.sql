-- 016: Activity Feed (Unified Inbox)
-- Centralizes all customer interactions into a single timeline.

CREATE TABLE public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'email_received', 'email_sent', 'telegram_in', 'telegram_out',
    'contact_form', 'order', 'session', 'note', 'deal_update'
  )),
  source_table TEXT NOT NULL,
  source_id UUID NOT NULL,
  title TEXT NOT NULL,
  preview TEXT,
  is_read BOOLEAN DEFAULT false,
  requires_action BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activity_feed_unread ON public.activity_feed(is_read, created_at DESC) WHERE is_read = false;
CREATE INDEX idx_activity_feed_profile ON public.activity_feed(profile_id, created_at DESC);

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on activity_feed"
  ON public.activity_feed FOR ALL
  USING (auth.role() = 'service_role');
