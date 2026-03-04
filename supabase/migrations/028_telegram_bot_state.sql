-- Migration 026: Telegram Bot Conversation State
-- Lightweight state store for multi-step bot flows (e.g., /verbinden email verification)

CREATE TABLE IF NOT EXISTS public.telegram_bot_state (
  chat_id BIGINT PRIMARY KEY,
  state TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telegram_bot_state_expires ON public.telegram_bot_state(expires_at);

-- RLS: Service-role only (server-side via adminClient)
ALTER TABLE public.telegram_bot_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on telegram_bot_state"
  ON public.telegram_bot_state FOR ALL
  USING (auth.role() = 'service_role');
