-- Migration 027: Telegram User Settings
-- Persistent settings for bot users (e.g., language preference)
-- Separate from telegram_bot_state which is for temporary conversation flows

CREATE TABLE IF NOT EXISTS public.telegram_settings (
  chat_id BIGINT PRIMARY KEY,
  locale TEXT NOT NULL DEFAULT 'de',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Service-role only (server-side via adminClient)
ALTER TABLE public.telegram_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on telegram_settings"
  ON public.telegram_settings FOR ALL
  USING (auth.role() = 'service_role');
