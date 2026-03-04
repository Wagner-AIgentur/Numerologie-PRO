-- Migration 032: Content Studio — AI Content Creation, Calendar, Competitors, Intelligence Layer
-- ============================================================
-- Tables: ai_prompt_templates, content_triggers, content_posts, content_calendar,
--         content_competitors, content_intel, content_leads,
--         content_core_memory, content_memories, content_relationships

-- ============================================================
-- 1. AI Prompt Templates (System-Prompts pro Content-Typ)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  category TEXT DEFAULT 'social'
    CHECK (category IN ('social', 'video', 'longform', 'engagement')),
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  default_model TEXT,
  default_temperature REAL DEFAULT 0.7,
  default_triggers TEXT[] DEFAULT '{}',
  default_funnel_stage TEXT,
  pipeline_type TEXT DEFAULT 'single'
    CHECK (pipeline_type IN ('single', 'script_then_caption', 'caption_only')),
  caption_template_id UUID,
  output_format TEXT DEFAULT 'text',
  platform TEXT,
  is_builtin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Self-reference for caption_template_id
ALTER TABLE public.ai_prompt_templates
  ADD CONSTRAINT fk_caption_template
  FOREIGN KEY (caption_template_id) REFERENCES public.ai_prompt_templates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_category ON public.ai_prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_active ON public.ai_prompt_templates(is_active, sort_order);

-- ============================================================
-- 2. Content Triggers (Psychologische Trigger-Module)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.content_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  prompt_snippet TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  funnel_stages TEXT[] DEFAULT '{}',
  examples TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. Content Posts (Zentrale Content-Tabelle)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT,
  excerpt TEXT,
  media_urls TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',

  content_type TEXT NOT NULL DEFAULT 'social_post',
  target_platforms TEXT[] DEFAULT '{}',
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'de' CHECK (language IN ('de', 'ru', 'en')),

  -- Funnel & Strategy
  funnel_stage TEXT DEFAULT 'tofu'
    CHECK (funnel_stage IN ('tofu', 'mofu', 'bofu', 'retention')),
  triggers_used TEXT[] DEFAULT '{}',
  value_ladder_stage TEXT
    CHECK (value_ladder_stage IN ('free', 'tripwire', 'core', 'premium')),

  -- Status Pipeline
  status TEXT NOT NULL DEFAULT 'idea'
    CHECK (status IN ('idea', 'draft', 'review', 'approved', 'scheduled', 'published', 'archived')),

  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  -- Platform Variants
  platform_variants JSONB DEFAULT '{}'::jsonb,

  -- AI Metadata
  ai_model TEXT,
  ai_prompt TEXT,
  ai_template_id UUID REFERENCES public.ai_prompt_templates(id) ON DELETE SET NULL,
  generation_history JSONB DEFAULT '[]'::jsonb,

  -- ManyChat Automation
  manychat_enabled BOOLEAN DEFAULT false,
  manychat_keyword TEXT,
  manychat_dm_text TEXT,
  manychat_dm_link TEXT,
  manychat_flow_id TEXT,
  manychat_platform TEXT DEFAULT 'instagram'
    CHECK (manychat_platform IN ('instagram', 'messenger', 'both')),
  manychat_conversions INTEGER DEFAULT 0,

  -- Competitor Inspiration (set after content_intel exists)
  inspired_by_intel_id UUID,

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_posts_status ON public.content_posts(status);
CREATE INDEX IF NOT EXISTS idx_content_posts_type ON public.content_posts(content_type);
CREATE INDEX IF NOT EXISTS idx_content_posts_funnel ON public.content_posts(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_content_posts_scheduled ON public.content_posts(scheduled_at)
  WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_content_posts_created ON public.content_posts(created_at DESC);

-- ============================================================
-- 4. Content Calendar
-- ============================================================

CREATE TABLE IF NOT EXISTS public.content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.content_posts(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  platforms TEXT[] DEFAULT '{}',
  color TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_calendar_date ON public.content_calendar(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_post ON public.content_calendar(post_id);

-- ============================================================
-- 5. Content Competitors
-- ============================================================

CREATE TABLE IF NOT EXISTS public.content_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website_url TEXT,
  social_accounts JSONB DEFAULT '{}'::jsonb,
  scrape_config JSONB DEFAULT '{}'::jsonb,
  scrape_frequency TEXT DEFAULT 'manual'
    CHECK (scrape_frequency IN ('manual', 'daily', 'weekly')),
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. Content Intel (Scraped Competitor Intelligence)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.content_intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES public.content_competitors(id) ON DELETE CASCADE,
  source_platform TEXT NOT NULL,
  source_url TEXT,

  title TEXT,
  content TEXT,
  media_urls TEXT[] DEFAULT '{}',
  media_type TEXT,
  posted_at TIMESTAMPTZ,

  -- Engagement
  engagement_data JSONB DEFAULT '{}'::jsonb,

  -- AI Analysis
  ai_summary TEXT,
  ai_topics TEXT[] DEFAULT '{}',
  ai_strategy_notes TEXT,
  content_format TEXT,

  -- Marketing Analysis
  ai_funnel_stage TEXT
    CHECK (ai_funnel_stage IN ('tofu', 'mofu', 'bofu', 'retention')),
  ai_triggers_detected TEXT[] DEFAULT '{}',
  ai_hook_analysis TEXT,
  ai_cta_analysis TEXT,
  ai_manychat_detected BOOLEAN DEFAULT false,
  ai_manychat_keyword TEXT,

  -- Status
  is_bookmarked BOOLEAN DEFAULT false,
  is_used_as_inspiration BOOLEAN DEFAULT false,
  inspired_post_id UUID,

  scraped_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_intel_competitor ON public.content_intel(competitor_id, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_intel_platform ON public.content_intel(source_platform);
CREATE INDEX IF NOT EXISTS idx_content_intel_bookmarked ON public.content_intel(is_bookmarked)
  WHERE is_bookmarked = true;
CREATE INDEX IF NOT EXISTS idx_content_intel_funnel ON public.content_intel(ai_funnel_stage);

-- ============================================================
-- 7. Cross-references between content_posts ↔ content_intel
-- ============================================================

ALTER TABLE public.content_intel
  ADD CONSTRAINT fk_intel_inspired_post
  FOREIGN KEY (inspired_post_id) REFERENCES public.content_posts(id) ON DELETE SET NULL;

ALTER TABLE public.content_posts
  ADD CONSTRAINT fk_post_inspired_by_intel
  FOREIGN KEY (inspired_by_intel_id) REFERENCES public.content_intel(id) ON DELETE SET NULL;

-- ============================================================
-- 8. Content Leads (Post → Lead Attribution)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.content_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.content_posts(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'manychat'
    CHECK (source IN ('manychat', 'instagram_lead_ad', 'direct', 'manual')),
  keyword_used TEXT,
  manychat_subscriber_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_leads_post ON public.content_leads(post_id);
CREATE INDEX IF NOT EXISTS idx_content_leads_profile ON public.content_leads(profile_id);

-- ============================================================
-- 9. Content Core Memory (Tier 1 — always in AI prompt)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.content_core_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_key TEXT NOT NULL UNIQUE,
  memory_value TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT true,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  update_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. Content Memories (Tier 2 — extracted insights)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.content_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_type TEXT NOT NULL
    CHECK (memory_type IN ('style_pattern', 'topic_insight', 'performance_learning',
                           'competitor_insight', 'audience_signal', 'strategy_note')),
  content TEXT NOT NULL,
  source_type TEXT NOT NULL
    CHECK (source_type IN ('post', 'intel', 'generation', 'manual')),
  source_id UUID,
  confidence REAL DEFAULT 0.5,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_memories_type ON public.content_memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_content_memories_active ON public.content_memories(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_memories_source ON public.content_memories(source_type, source_id);

-- ============================================================
-- 11. Content Relationships (Knowledge Graph edges)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.content_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  relation TEXT NOT NULL
    CHECK (relation IN ('inspired_by', 'similar_to', 'same_topic', 'uses_trigger',
                        'from_competitor', 'led_to', 'contradicts')),
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  strength REAL DEFAULT 1.0,
  metadata JSONB DEFAULT '{}'::jsonb,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_rel_source ON public.content_relationships(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_content_rel_target ON public.content_relationships(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_content_rel_type ON public.content_relationships(relation);

-- ============================================================
-- 12. RLS — admin-only access via service role
-- ============================================================

ALTER TABLE public.ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_intel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_core_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_relationships ENABLE ROW LEVEL SECURITY;

-- Service role (used by adminClient) has full access by default
-- No user-facing policies needed — these tables are admin-only

-- ============================================================
-- 13. Helper functions
-- ============================================================

-- Increment ManyChat conversion counter on a post
CREATE OR REPLACE FUNCTION public.increment_manychat_conversions(post_uuid UUID)
RETURNS VOID AS $$
  UPDATE public.content_posts
  SET manychat_conversions = manychat_conversions + 1,
      updated_at = now()
  WHERE id = post_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- Update memory access stats
CREATE OR REPLACE FUNCTION public.touch_content_memory(memory_uuid UUID)
RETURNS VOID AS $$
  UPDATE public.content_memories
  SET last_accessed_at = now(),
      access_count = access_count + 1
  WHERE id = memory_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- Increment template usage count
CREATE OR REPLACE FUNCTION public.increment_template_usage(template_uuid UUID)
RETURNS VOID AS $$
  UPDATE public.ai_prompt_templates
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = template_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- Seed initial Core Memory entries
INSERT INTO public.content_core_memory (memory_key, memory_value) VALUES
  ('brand_voice', 'Premium, mystisch aber seriös, warmherzig, professionell. Beraterin: Swetlana Wagner, erfahrene Numerologin. Zielgruppe: Frauen 25-55, Persönlichkeitsentwicklung, Selbstfindung, Beziehungen.'),
  ('top_patterns', 'Noch keine Muster erkannt. Wird nach den ersten 10 Posts automatisch aktualisiert.'),
  ('strategy', 'Funnel-Balance: Gleichmäßige Verteilung TOFU/MOFU/BOFU anstreben. Value Ladder: Kostenloser Content → Tripwire → Core Offer → Premium.'),
  ('campaigns', 'Keine aktiven Kampagnen.')
ON CONFLICT (memory_key) DO NOTHING;
