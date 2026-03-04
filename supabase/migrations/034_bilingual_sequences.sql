-- ============================================================
-- 034: Bilingual Sequences & Automations
-- Adds Russian (RU) content columns to email_sequence_steps
-- so the processor can serve the right language per user.
-- ============================================================

-- Russian content columns (nullable = fallback to DE when empty)
ALTER TABLE public.email_sequence_steps
  ADD COLUMN IF NOT EXISTS subject_ru TEXT,
  ADD COLUMN IF NOT EXISTS content_html_ru TEXT,
  ADD COLUMN IF NOT EXISTS content_telegram_ru TEXT;

-- Index for quick locale-aware queries (optional, helps if filtering by language)
COMMENT ON COLUMN public.email_sequence_steps.subject_ru IS 'Russian translation of subject line. NULL = use German (subject) as fallback.';
COMMENT ON COLUMN public.email_sequence_steps.content_html_ru IS 'Russian translation of HTML email content. NULL = use German (content_html) as fallback.';
COMMENT ON COLUMN public.email_sequence_steps.content_telegram_ru IS 'Russian translation of Telegram message. NULL = use German (content_telegram) as fallback.';
