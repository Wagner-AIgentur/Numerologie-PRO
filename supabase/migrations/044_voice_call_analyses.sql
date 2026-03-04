-- Voice Agent: Call Analyses Table
-- Stores structured end-of-call analyses from the voice agent (17 fields)
-- Written by: end_call_summary server tool via POST /api/voice-agent/tools/summary

CREATE TABLE IF NOT EXISTS voice_call_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Anruferdaten
  anrufer_name TEXT,
  anrufer_email TEXT,
  anrufer_telefon TEXT,
  sprache TEXT NOT NULL DEFAULT 'de',                -- de, ru

  -- Gespraechsklassifikation
  kategorie TEXT NOT NULL DEFAULT 'Allgemein',       -- Paketberatung, FAQ, Account_Support, Terminbuchung, Allgemein
  thema TEXT NOT NULL DEFAULT 'Allgemein',            -- Beziehung, Beruf_Sinnsuche, Kind, Finanzen, Persoenlichkeit, Jahresprognose, Allgemein
  anliegen TEXT,

  -- Sales-Intelligence
  interessiertes_paket TEXT NOT NULL DEFAULT 'keines', -- Lebenskarte, Beziehungsmatrix, Lebensbestimmung, Wachstumsplan, Mein_Kind, Geldkanal, Jahresprognose, Jahresprognose_PDF, PDF_Analyse, Monatsprognose, Tagesprognose, Erstgespraech, keines
  kaufbereitschaft TEXT NOT NULL DEFAULT 'unklar',     -- hoch, mittel, niedrig, unklar
  einwand TEXT NOT NULL DEFAULT 'keiner',              -- zu_teuer, nicht_sicher, keine_zeit, skeptisch, keiner
  geburtsdatum_genannt BOOLEAN NOT NULL DEFAULT false,

  -- Gespraechsergebnis
  status TEXT NOT NULL DEFAULT 'FAQ_beantwortet',      -- Termin_gebucht, Interesse_geweckt, FAQ_beantwortet, Eskaliert, Abgebrochen
  termin_gebucht BOOLEAN NOT NULL DEFAULT false,
  termin_datum TIMESTAMPTZ,
  follow_up_noetig BOOLEAN NOT NULL DEFAULT false,
  naechster_schritt TEXT NOT NULL DEFAULT 'Keine_Aktion', -- Keine_Aktion, Rueckruf_Swetlana, Follow_up_Email, PDF_senden, Termin_bestaetigen

  -- Gesamtzusammenfassung
  zusammenfassung TEXT,

  -- FK to voice_calls (optional — set if we can match the conversation)
  call_id UUID REFERENCES voice_calls(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for dashboard queries
CREATE INDEX idx_vca_created ON voice_call_analyses(created_at DESC);
CREATE INDEX idx_vca_kategorie ON voice_call_analyses(kategorie);
CREATE INDEX idx_vca_status ON voice_call_analyses(status);
CREATE INDEX idx_vca_kaufbereitschaft ON voice_call_analyses(kaufbereitschaft);
CREATE INDEX idx_vca_paket ON voice_call_analyses(interessiertes_paket);
CREATE INDEX idx_vca_follow_up ON voice_call_analyses(follow_up_noetig) WHERE follow_up_noetig = true;
CREATE INDEX idx_vca_termin ON voice_call_analyses(termin_gebucht) WHERE termin_gebucht = true;
CREATE INDEX idx_vca_call ON voice_call_analyses(call_id);

-- RLS
ALTER TABLE voice_call_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage voice call analyses"
  ON voice_call_analyses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.crm_status = 'admin'
    )
  );
