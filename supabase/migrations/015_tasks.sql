-- ============================================================
-- 015: Task Management System
-- Aufgabenverwaltung for CRM admin panel
-- ============================================================

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN (
    'follow_up',
    'call_back',
    'send_proposal',
    'review_order',
    'prepare_session',
    'send_materials',
    'other'
  )),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'low',
    'medium',
    'high',
    'urgent'
  )),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open',
    'in_progress',
    'completed',
    'cancelled'
  )),
  due_date DATE,
  due_time TIME,
  completed_at TIMESTAMPTZ,
  assigned_to UUID,
  source_type TEXT,
  source_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on tasks"
  ON public.tasks FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX idx_tasks_due_date_status ON public.tasks (due_date, status);
CREATE INDEX idx_tasks_profile_id ON public.tasks (profile_id);
