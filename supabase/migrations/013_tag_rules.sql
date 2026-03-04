-- ============================================================
-- 013: Smart Auto-Tagging Rules
-- Behavior-based automatic tagging of customer profiles
-- ============================================================

CREATE TABLE public.tag_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_name TEXT NOT NULL,
  description TEXT,
  condition_type TEXT NOT NULL CHECK (condition_type IN (
    'order_count_gte',
    'total_revenue_gte',
    'has_product',
    'has_session',
    'inactive_days_gte',
    'has_telegram',
    'language_is',
    'source_is',
    'has_birthdate',
    'birthdate_month'
  )),
  condition_value TEXT NOT NULL,
  auto_remove BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tag_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on tag_rules"
  ON public.tag_rules FOR ALL
  USING (auth.role() = 'service_role');

-- Seed default tag rules
INSERT INTO public.tag_rules (tag_name, description, condition_type, condition_value, auto_remove) VALUES
  ('PDF-Kaufer', 'Hat mindestens eine PDF-Analyse gekauft', 'has_product', 'pdf_analyse', false),
  ('Stammkunde', 'Hat 3 oder mehr Bestellungen', 'order_count_gte', '3', false),
  ('Telegram-User', 'Hat Telegram verknüpft', 'has_telegram', 'true', true),
  ('Inaktiv-30-Tage', 'Seit 30+ Tagen keine Aktivität', 'inactive_days_gte', '30', true),
  ('High-Value', 'Umsatz über 200€', 'total_revenue_gte', '20000', false);
