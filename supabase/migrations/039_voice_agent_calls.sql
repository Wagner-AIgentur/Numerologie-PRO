-- Voice Agent: Calls Table
-- Tracks all voice conversations (web widget + phone)

CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elevenlabs_conversation_id TEXT UNIQUE,
  channel TEXT NOT NULL DEFAULT 'web',          -- 'web' or 'phone'
  phone_number TEXT,
  language TEXT DEFAULT 'de',                    -- detected language: de, ru, en
  duration_seconds INTEGER,
  recording_url TEXT,
  transcript JSONB DEFAULT '[]',                 -- [{role: 'agent'|'user', message: '...', timestamp: 0.0}]
  summary TEXT,                                  -- AI-generated conversation summary
  status TEXT NOT NULL DEFAULT 'in_progress',    -- in_progress, completed, failed, no_answer
  lead_id UUID,                                  -- FK added after leads table exists
  ended_reason TEXT,                             -- customer_ended, agent_ended, error, silence
  metadata JSONB DEFAULT '{}',                   -- Extra data from ElevenLabs
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_voice_calls_status ON voice_calls(status);
CREATE INDEX idx_voice_calls_created ON voice_calls(created_at DESC);
CREATE INDEX idx_voice_calls_lead ON voice_calls(lead_id);

-- RLS
ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage voice calls"
  ON voice_calls FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.crm_status = 'admin'
    )
  );
