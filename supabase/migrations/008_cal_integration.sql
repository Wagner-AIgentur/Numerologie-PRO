-- Migration 008: Cal.com Integration + Session Enhancements
-- Adds package_key to products, session_type + reminder tracking to sessions

-- 1. Add package_key column to products for reliable lookup
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS package_key TEXT UNIQUE;

-- 2. Add session_type to distinguish paid vs free consultations
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'paid'
  CHECK (session_type IN ('paid', 'free'));

-- 3. Add cal_event_slug for tracking which Cal.com event type was used
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS cal_event_slug TEXT;

-- 4. Add reminder_sent_at for preventing duplicate reminder emails
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- 5. Indexes for Cal.com booking ID lookups
CREATE INDEX IF NOT EXISTS idx_sessions_cal_booking_id
  ON public.sessions(cal_booking_id);

-- 6. Index for finding pending sessions by profile (used by Cal.com webhook)
CREATE INDEX IF NOT EXISTS idx_sessions_profile_pending
  ON public.sessions(profile_id, cal_booking_id, order_id);

-- 7. Index for cron reminder query (scheduled sessions without reminder)
CREATE INDEX IF NOT EXISTS idx_sessions_reminder_pending
  ON public.sessions(scheduled_at, status, reminder_sent_at)
  WHERE status = 'scheduled' AND reminder_sent_at IS NULL;

-- 8. Populate package_key for existing products
UPDATE public.products SET package_key = 'beziehungsmatrix' WHERE name_de ILIKE '%Beziehung%' AND package_key IS NULL;
UPDATE public.products SET package_key = 'lebensbestimmung' WHERE name_de ILIKE '%Lebensbestimmung%' AND package_key IS NULL;
UPDATE public.products SET package_key = 'wachstumsplan' WHERE name_de ILIKE '%Wachstum%' AND package_key IS NULL;
UPDATE public.products SET package_key = 'mein_kind' WHERE name_de ILIKE '%Kind%' AND package_key IS NULL;
UPDATE public.products SET package_key = 'pdf_analyse' WHERE name_de ILIKE '%PDF%' AND package_key IS NULL;
