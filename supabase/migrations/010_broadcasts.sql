-- Migration 010: Broadcast / Content Management System
-- Enables admin to send broadcasts to customer segments via Email and Telegram

-- 1. Broadcasts table — stores campaigns/drafts
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_email TEXT,                -- HTML body for email (rendered through base template)
  content_telegram TEXT,             -- HTML text for Telegram
  subject_email TEXT,                -- Email subject line
  channels TEXT[] NOT NULL DEFAULT '{email}',  -- 'email', 'telegram', or both
  audience_filter JSONB NOT NULL DEFAULT '{"type":"all"}'::jsonb,
  language TEXT DEFAULT 'all' CHECK (language IN ('de', 'ru', 'all')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'partially_sent', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Denormalized stats for fast dashboard reads
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,

  -- AI metadata (for reference/re-generation)
  ai_prompt TEXT,
  ai_model TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Broadcast recipients — per-recipient delivery tracking
CREATE TABLE IF NOT EXISTS public.broadcast_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID NOT NULL REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'telegram')),
  recipient_email TEXT,
  recipient_chat_id BIGINT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON public.broadcasts(status);
CREATE INDEX IF NOT EXISTS idx_broadcasts_scheduled_at ON public.broadcasts(scheduled_at)
  WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_broadcast_id
  ON public.broadcast_recipients(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_pending
  ON public.broadcast_recipients(broadcast_id, status)
  WHERE status = 'pending';

-- 4. RLS — admin-only access via service role
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_recipients ENABLE ROW LEVEL SECURITY;

-- Service role (used by adminClient) has full access by default
-- No user-facing policies needed — these tables are admin-only

-- 5. Helper function: update broadcast stats from recipients
CREATE OR REPLACE FUNCTION public.update_broadcast_stats(broadcast_uuid UUID)
RETURNS VOID AS $$
  UPDATE public.broadcasts SET
    total_recipients = (
      SELECT count(*) FROM public.broadcast_recipients WHERE broadcast_id = broadcast_uuid
    ),
    sent_count = (
      SELECT count(*) FROM public.broadcast_recipients
      WHERE broadcast_id = broadcast_uuid AND status = 'sent'
    ),
    failed_count = (
      SELECT count(*) FROM public.broadcast_recipients
      WHERE broadcast_id = broadcast_uuid AND status = 'failed'
    ),
    updated_at = now()
  WHERE id = broadcast_uuid;
$$ LANGUAGE sql SECURITY DEFINER;
