-- Voice Agent: Leads Table
-- Stores qualified leads from voice conversations

CREATE TABLE IF NOT EXISTS voice_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  language TEXT DEFAULT 'de',
  score INTEGER NOT NULL DEFAULT 0,              -- 0-100 weighted score
  grade TEXT NOT NULL DEFAULT 'C',               -- A (>=70), B (>=40), C (<40)
  status TEXT NOT NULL DEFAULT 'new',            -- new, qualified, demo_booked, disqualified, converted
  qualification JSONB DEFAULT '{}',              -- { company_size, lead_volume, budget, timeline, decision_authority, pain_level }
  objections JSONB DEFAULT '[]',                 -- ["zu teuer", "kein Bedarf", ...]
  next_steps TEXT,
  source TEXT DEFAULT 'voice_agent',             -- voice_agent, manual
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK from voice_calls to voice_leads
ALTER TABLE voice_calls
  ADD CONSTRAINT fk_voice_calls_lead
  FOREIGN KEY (lead_id) REFERENCES voice_leads(id)
  ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_voice_leads_grade ON voice_leads(grade);
CREATE INDEX idx_voice_leads_status ON voice_leads(status);
CREATE INDEX idx_voice_leads_score ON voice_leads(score DESC);
CREATE INDEX idx_voice_leads_created ON voice_leads(created_at DESC);

-- RLS
ALTER TABLE voice_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage voice leads"
  ON voice_leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.crm_status = 'admin'
    )
  );
