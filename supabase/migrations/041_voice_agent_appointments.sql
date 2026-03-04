-- Voice Agent: Appointments Table
-- Tracks demo bookings made by the voice agent

CREATE TABLE IF NOT EXISTS voice_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES voice_leads(id) ON DELETE CASCADE,
  call_id UUID REFERENCES voice_calls(id) ON DELETE SET NULL,
  datetime TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  calendar_event_id TEXT,                        -- Cal.com event ID
  calendar_url TEXT,                             -- Cal.com booking URL
  status TEXT NOT NULL DEFAULT 'scheduled',      -- scheduled, completed, cancelled, no_show
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_voice_appointments_lead ON voice_appointments(lead_id);
CREATE INDEX idx_voice_appointments_datetime ON voice_appointments(datetime);
CREATE INDEX idx_voice_appointments_status ON voice_appointments(status);

-- RLS
ALTER TABLE voice_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage voice appointments"
  ON voice_appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.crm_status = 'admin'
    )
  );
