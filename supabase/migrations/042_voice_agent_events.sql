-- Voice Agent: Call Events Table
-- Granular event tracking within each call for drop-off analysis

CREATE TABLE IF NOT EXISTS voice_call_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES voice_calls(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,                      -- greeting, discovery, qualification, objection, booking_attempt, booking_success, drop_off, language_switch
  timestamp_seconds FLOAT,                       -- Second within the call
  metadata JSONB DEFAULT '{}',                   -- { objection_text, criterion_name, criterion_value, from_lang, to_lang, ... }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for KPI queries
CREATE INDEX idx_voice_call_events_call ON voice_call_events(call_id);
CREATE INDEX idx_voice_call_events_type ON voice_call_events(event_type);

-- RLS
ALTER TABLE voice_call_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage voice call events"
  ON voice_call_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.crm_status = 'admin'
    )
  );

-- Analytics function: Voice Agent KPIs
CREATE OR REPLACE FUNCTION get_voice_agent_stats(days_back INTEGER DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_calls', (
      SELECT COUNT(*) FROM voice_calls
      WHERE created_at >= now() - (days_back || ' days')::INTERVAL
    ),
    'completed_calls', (
      SELECT COUNT(*) FROM voice_calls
      WHERE status = 'completed'
      AND created_at >= now() - (days_back || ' days')::INTERVAL
    ),
    'conversion_rate', (
      SELECT CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(
          COUNT(*) FILTER (WHERE lead_id IN (
            SELECT lead_id FROM voice_appointments WHERE status = 'scheduled'
          ))::NUMERIC / COUNT(*)::NUMERIC * 100, 1
        )
      END
      FROM voice_calls
      WHERE status = 'completed'
      AND created_at >= now() - (days_back || ' days')::INTERVAL
    ),
    'avg_duration_seconds', (
      SELECT COALESCE(AVG(duration_seconds), 0)
      FROM voice_calls
      WHERE status = 'completed'
      AND created_at >= now() - (days_back || ' days')::INTERVAL
    ),
    'leads_by_grade', (
      SELECT json_build_object(
        'A', COUNT(*) FILTER (WHERE grade = 'A'),
        'B', COUNT(*) FILTER (WHERE grade = 'B'),
        'C', COUNT(*) FILTER (WHERE grade = 'C')
      )
      FROM voice_leads
      WHERE created_at >= now() - (days_back || ' days')::INTERVAL
    ),
    'total_appointments', (
      SELECT COUNT(*) FROM voice_appointments
      WHERE created_at >= now() - (days_back || ' days')::INTERVAL
    ),
    'top_objections', (
      SELECT COALESCE(json_agg(obj), '[]'::JSON)
      FROM (
        SELECT metadata->>'objection_text' AS objection, COUNT(*) AS count
        FROM voice_call_events
        WHERE event_type = 'objection'
        AND created_at >= now() - (days_back || ' days')::INTERVAL
        GROUP BY metadata->>'objection_text'
        ORDER BY count DESC
        LIMIT 5
      ) obj
    ),
    'drop_off_points', (
      SELECT COALESCE(json_agg(dp), '[]'::JSON)
      FROM (
        SELECT event_type AS phase, COUNT(*) AS count
        FROM voice_call_events
        WHERE event_type = 'drop_off'
        AND created_at >= now() - (days_back || ' days')::INTERVAL
        GROUP BY event_type
        ORDER BY count DESC
      ) dp
    )
  ) INTO result;

  RETURN result;
END;
$$;
