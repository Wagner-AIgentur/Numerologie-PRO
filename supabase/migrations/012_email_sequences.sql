-- ============================================================
-- 012: Email Drip Sequences
-- Multi-step automated email sequences triggered by events
-- ============================================================

-- ── Sequences ──
CREATE TABLE public.email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL CHECK (trigger_event IN (
    'lead_created', 'lead_verified', 'profile_created',
    'order_completed', 'session_completed', 'tag_added',
    'manual'
  )),
  trigger_filter JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on email_sequences"
  ON public.email_sequences FOR ALL
  USING (auth.role() = 'service_role');

-- ── Steps ──
CREATE TABLE public.email_sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 0,
  delay_hours INTEGER NOT NULL DEFAULT 0,
  subject TEXT NOT NULL,
  content_html TEXT NOT NULL,
  content_telegram TEXT,
  send_telegram BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sequence_steps_sequence ON public.email_sequence_steps(sequence_id, step_order);

ALTER TABLE public.email_sequence_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on email_sequence_steps"
  ON public.email_sequence_steps FOR ALL
  USING (auth.role() = 'service_role');

-- ── Enrollments ──
CREATE TABLE public.email_sequence_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  current_step INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'unsubscribed')),
  next_send_at TIMESTAMPTZ,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(sequence_id, email)
);

CREATE INDEX idx_enrollments_next_send ON public.email_sequence_enrollments(next_send_at, status)
  WHERE status = 'active';
CREATE INDEX idx_enrollments_profile ON public.email_sequence_enrollments(profile_id);
CREATE INDEX idx_enrollments_sequence ON public.email_sequence_enrollments(sequence_id);

ALTER TABLE public.email_sequence_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on email_sequence_enrollments"
  ON public.email_sequence_enrollments FOR ALL
  USING (auth.role() = 'service_role');
