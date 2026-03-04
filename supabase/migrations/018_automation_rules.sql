-- ============================================================
-- 018: Workflow Automation Engine (ECA - Event-Condition-Action)
-- No-code automation rules triggered by CRM events
-- ============================================================

-- ── Automation Rules ──
CREATE TABLE public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL CHECK (trigger_event IN (
    'lead_created', 'lead_verified', 'profile_updated',
    'order_completed', 'order_refunded', 'session_scheduled',
    'session_completed', 'tag_added', 'tag_removed',
    'contact_submitted', 'crm_status_changed',
    'follow_up_due'
  )),
  conditions JSONB DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on automation_rules"
  ON public.automation_rules FOR ALL
  USING (auth.role() = 'service_role');

-- ── Automation Logs ──
CREATE TABLE public.automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  trigger_event TEXT NOT NULL,
  trigger_data JSONB,
  actions_executed JSONB,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'partial', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on automation_logs"
  ON public.automation_logs FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX idx_automation_logs_rule ON public.automation_logs(rule_id);
CREATE INDEX idx_automation_logs_created ON public.automation_logs(created_at DESC);
