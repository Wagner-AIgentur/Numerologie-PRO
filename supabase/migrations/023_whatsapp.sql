-- Migration 023: WhatsApp Business Integration
-- Adds WhatsApp Cloud API (Meta) as a notification channel alongside Email + Telegram.

-- 1. WhatsApp phone on profiles (E.164 format, e.g. "+491701234567")
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT UNIQUE;

-- 2. Preferred communication channel (set during Cal.com booking)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_channel TEXT DEFAULT 'email'
    CHECK (preferred_channel IN ('email', 'telegram', 'whatsapp'));

-- 3. Indexes for WhatsApp lookups
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_phone
  ON public.profiles(whatsapp_phone);

-- 4. WhatsApp Messages Log (mirrors telegram_messages)
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_id TEXT NOT NULL,                     -- User's WhatsApp ID (phone in E.164)
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  template_name TEXT,                      -- Only for outgoing template messages
  message_text TEXT,
  wa_message_id TEXT,                      -- WhatsApp message ID (wamid.xxx)
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_wa_id
  ON public.whatsapp_messages(wa_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_profile
  ON public.whatsapp_messages(profile_id, created_at DESC);

-- 5. RLS for whatsapp_messages
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on whatsapp_messages"
  ON public.whatsapp_messages FOR ALL
  USING (auth.role() = 'service_role');

-- 6. Extend broadcast_recipients to support 'whatsapp' channel
ALTER TABLE public.broadcast_recipients
  DROP CONSTRAINT IF EXISTS broadcast_recipients_channel_check;
ALTER TABLE public.broadcast_recipients
  ADD CONSTRAINT broadcast_recipients_channel_check
  CHECK (channel IN ('email', 'telegram', 'whatsapp'));

ALTER TABLE public.broadcast_recipients
  ADD COLUMN IF NOT EXISTS recipient_wa_phone TEXT;
