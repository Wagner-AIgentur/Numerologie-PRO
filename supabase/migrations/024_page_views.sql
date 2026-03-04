-- 024: Page Views for Visitor Analytics
-- Tracks page views on public pages for traffic analysis

CREATE TABLE IF NOT EXISTS page_views (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   TEXT NOT NULL,
  page_path    TEXT NOT NULL,
  referrer     TEXT,
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  device_type  TEXT,          -- 'desktop' | 'mobile' | 'tablet'
  browser      TEXT,
  os           TEXT,
  screen_w     SMALLINT,
  screen_h     SMALLINT,
  viewport_w   SMALLINT,
  language     TEXT,
  duration_ms  INT,
  is_bounce    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookup by time range
CREATE INDEX idx_page_views_created ON page_views (created_at DESC);

-- Session grouping for bounce / duration calculations
CREATE INDEX idx_page_views_session ON page_views (session_id, created_at);

-- Page-level queries
CREATE INDEX idx_page_views_page ON page_views (page_path, created_at DESC);

-- RLS: service role only (no public access)
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on page_views"
  ON page_views
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
