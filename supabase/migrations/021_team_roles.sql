-- ============================================================
-- 021 · Team Roles (RBAC)
-- ============================================================

CREATE TABLE public.team_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  label_de TEXT NOT NULL,
  label_ru TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default roles
INSERT INTO public.team_roles (name, label_de, label_ru, permissions, is_system) VALUES
  ('owner', 'Inhaber', 'Владелец', ARRAY['*'], true),
  ('manager', 'Manager', 'Менеджер', ARRAY['dashboard', 'customers', 'leads', 'contacts', 'orders', 'sessions', 'calendar', 'content', 'sequences', 'tags', 'automations', 'tasks', 'inbox', 'deals', 'emails', 'coupons', 'analytics'], true),
  ('assistant', 'Assistent', 'Ассистент', ARRAY['dashboard', 'customers', 'leads', 'contacts', 'sessions', 'calendar', 'tasks', 'inbox'], true),
  ('viewer', 'Betrachter', 'Наблюдатель', ARRAY['dashboard', 'customers', 'analytics'], true);

-- Add team_role_id to profiles
ALTER TABLE public.profiles ADD COLUMN team_role_id UUID REFERENCES public.team_roles(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE public.team_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role access" ON public.team_roles FOR ALL USING (auth.role() = 'service_role');
