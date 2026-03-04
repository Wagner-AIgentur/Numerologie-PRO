-- 023: Click Tracking for Heatmap Analytics
-- Tracks user clicks on public pages for behavior analysis

CREATE TABLE IF NOT EXISTS click_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path   TEXT NOT NULL,
  element_tag TEXT,
  element_text TEXT,
  element_id  TEXT,
  element_href TEXT,
  section     TEXT,
  x_percent   SMALLINT CHECK (x_percent BETWEEN 0 AND 100),
  y_percent   SMALLINT CHECK (y_percent BETWEEN 0 AND 100),
  viewport_w  SMALLINT,
  session_id  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookup by page + time range
CREATE INDEX idx_click_events_page_path ON click_events (page_path, created_at DESC);

-- Cleanup index (for periodic purge of old data)
CREATE INDEX idx_click_events_created ON click_events (created_at);

-- RLS: service role only (no public access)
ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on click_events"
  ON click_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
