-- 038_knowledge_base.sql
-- Wissensbasis-Tracking fuer vektorisierte Schulungsmaterialien
-- Speichert Quellen-Metadaten + Chunk-Status fuer die Pinecone "knowledge" Namespace

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════
-- Tabelle 1: knowledge_sources — Welche Dateien wurden vektorisiert?
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Datei-Info
  file_path TEXT NOT NULL UNIQUE,         -- Relativer Pfad ab Konfguratr/
  file_name TEXT NOT NULL,                -- Dateiname ohne Pfad
  file_type TEXT NOT NULL DEFAULT 'pdf',  -- 'pdf' | 'docx' | 'txt' | 'transcript'
  file_size_bytes BIGINT,
  -- Kurs/Methoden-Zuordnung
  source_name TEXT NOT NULL,              -- z.B. 'Идеал', 'Файман', 'Анна Спицина'
  author TEXT,                            -- Kurs-Autor
  method TEXT,                            -- Berechnungsmethode
  language TEXT NOT NULL DEFAULT 'ru',    -- 'de' | 'ru' | 'en'
  -- Verarbeitungs-Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  chunk_count INTEGER DEFAULT 0,          -- Anzahl Chunks nach Verarbeitung
  error_message TEXT,                     -- Fehlermeldung bei status=failed
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════
-- Tabelle 2: knowledge_chunks — Chunk-Level Tracking (fuer UI-Suche)
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.knowledge_sources(id) ON DELETE CASCADE,
  -- Chunk-Info
  chunk_index INTEGER NOT NULL,           -- 0-basierter Index im Dokument
  content TEXT NOT NULL,                  -- Chunk-Text (500-1000 Tokens)
  page_number INTEGER,                    -- Seitenzahl (bei PDFs)
  chapter TEXT,                           -- Kapitel-Ueberschrift (falls erkannt)
  -- Pinecone-Referenz
  pinecone_id TEXT NOT NULL UNIQUE,       -- ID im Pinecone-Index
  -- Metadaten (gespiegelt von Pinecone fuer schnelle Supabase-Queries)
  source_name TEXT NOT NULL,
  topic TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════
-- Indizes
-- ══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_knowledge_sources_status ON public.knowledge_sources(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_source_name ON public.knowledge_sources(source_name);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_source_id ON public.knowledge_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_source_name ON public.knowledge_chunks(source_name);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_pinecone_id ON public.knowledge_chunks(pinecone_id);

-- ══════════════════════════════════════════════════════════════════════════
-- RLS — Service Role Only
-- ══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.knowledge_sources
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON public.knowledge_chunks
  FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════════════════════════════════════════
-- Vordefinierte Quellen (die 6 bekannten Kurs-Ordner)
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO public.knowledge_sources (file_path, file_name, file_type, source_name, author, method, language, status)
VALUES
  ('__placeholder__/Идеал', 'Идеал (Kurs-Ordner)', 'pdf', 'Идеал', 'Идеал', 'matrix-numerologie', 'ru', 'skipped'),
  ('__placeholder__/Файман', 'Файман (Kurs-Ordner)', 'pdf', 'Файман', 'Файман', 'tarot-numerologie', 'ru', 'skipped'),
  ('__placeholder__/Анна Спицина', 'Анна Спицина (Kurs-Ordner)', 'pdf', 'Анна Спицина', 'Анна Спицина', 'selbsterkenntnis', 'ru', 'skipped'),
  ('__placeholder__/Пифагор Анаель', 'Пифагор Анаель (Kurs-Ordner)', 'pdf', 'Пифагор Анаель', 'Анаель', 'karmische-numerologie', 'ru', 'skipped'),
  ('__placeholder__/Прогнозирование', 'Прогнозирование (Kurs-Ordner)', 'pdf', 'Прогнозирование', NULL, 'prognose', 'ru', 'skipped'),
  ('__placeholder__/Matrix кабинет', 'Matrix кабинет (Tool)', 'xlsx', 'Matrix кабинет', NULL, 'matrix-berechnung', 'ru', 'skipped')
ON CONFLICT (file_path) DO NOTHING;

COMMIT;
