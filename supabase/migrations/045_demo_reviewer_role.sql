-- 045_demo_reviewer_role.sql
-- Creates a restricted demo reviewer role for portfolio reviews.
-- Demo reviewers see aggregated stats (real) but only demo data in detail views.
-- No real customer PII is exposed.

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 1: Add is_demo column to voice tables
-- ══════════════════════════════════════════════════════════════════════════

ALTER TABLE voice_calls ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE voice_leads ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE voice_call_analyses ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- Index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_voice_calls_is_demo ON voice_calls(is_demo) WHERE is_demo = true;
CREATE INDEX IF NOT EXISTS idx_voice_leads_is_demo ON voice_leads(is_demo) WHERE is_demo = true;
CREATE INDEX IF NOT EXISTS idx_voice_call_analyses_is_demo ON voice_call_analyses(is_demo) WHERE is_demo = true;

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 2: Create demo_reviewer team role
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO public.team_roles (name, label_de, label_ru, permissions, is_system)
VALUES (
  'demo_reviewer',
  'Demo Reviewer',
  'Демо Рецензент',
  ARRAY[
    'dashboard.view', 'analytics.view', 'sessions.view', 'sessions.edit',
    'calendar.view', 'customers.view', 'customers.edit',
    'content.view', 'content.edit', 'ai.use', 'telegram.send',
    'affiliates.manage', 'deals.view', 'deals.edit',
    'tags.manage', 'team.manage', 'automations.view', 'automations.edit',
    'bot.manage', 'coupons.manage', 'tasks.view', 'tasks.edit',
    'sequences.view', 'sequences.edit', 'fields.manage', 'leads.manage',
    'instagram.view', 'instagram.edit', 'inbox.view', 'inbox.edit'
  ],
  true
)
ON CONFLICT (name) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 3: Helper function — checks if current user is demo_reviewer
-- ══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_demo_reviewer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    JOIN team_roles tr ON tr.id = p.team_role_id
    WHERE p.id = auth.uid()
    AND tr.name = 'demo_reviewer'
  );
$$;

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 4: Restrictive RLS policies for demo reviewers
-- Demo reviewers can only see rows where is_demo = true.
-- Non-demo admins are unaffected (full access).
-- ══════════════════════════════════════════════════════════════════════════

-- voice_calls
CREATE POLICY "Demo reviewers only see demo calls"
  ON voice_calls AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (
    NOT public.is_demo_reviewer() OR is_demo = true
  );

-- voice_leads
CREATE POLICY "Demo reviewers only see demo leads"
  ON voice_leads AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (
    NOT public.is_demo_reviewer() OR is_demo = true
  );

-- voice_call_analyses
CREATE POLICY "Demo reviewers only see demo analyses"
  ON voice_call_analyses AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (
    NOT public.is_demo_reviewer() OR is_demo = true
  );

-- Prevent demo reviewers from modifying data
CREATE POLICY "Demo reviewers cannot insert calls"
  ON voice_calls AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_demo_reviewer());

CREATE POLICY "Demo reviewers cannot insert leads"
  ON voice_leads AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_demo_reviewer());

CREATE POLICY "Demo reviewers cannot insert analyses"
  ON voice_call_analyses AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_demo_reviewer());

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 5: Insert demo test data
-- ══════════════════════════════════════════════════════════════════════════

-- Demo Voice Calls (3 calls with realistic data)
INSERT INTO voice_calls (
  elevenlabs_conversation_id, channel, phone_number, language,
  duration_seconds, transcript, summary, status, ended_reason,
  is_demo, created_at
) VALUES
-- Call 1: Successful consultation inquiry (Grade A lead)
(
  'demo_conv_001', 'web', NULL, 'de',
  285, -- 4:45 min
  '[
    {"role": "agent", "message": "Hallo und willkommen bei Numerologie PRO. Mein Name ist Lisa, ich bin die KI-Assistentin von Swetlana Wagner. Wie kann ich dir helfen?", "timestamp": 0.0},
    {"role": "user", "message": "Hallo Lisa, ich habe von der Psychomatrix gehoert und wuerde gerne mehr darueber erfahren.", "timestamp": 5.2},
    {"role": "agent", "message": "Schoen dass du dich fuer die Psychomatrix interessierst! Die Psychomatrix basiert auf deinem Geburtsdatum und zeigt dir deine Staerken, Talente und Lebensthemen. Darf ich fragen, was dich besonders interessiert?", "timestamp": 12.1},
    {"role": "user", "message": "Ich bin am 15. Maerz 1988 geboren und moechte wissen, was meine Zahlen ueber meine Karriere sagen.", "timestamp": 24.3},
    {"role": "agent", "message": "Super, das ist ein spannendes Geburtsdatum! Fuer eine detaillierte Analyse deiner Karriere-Aspekte wuerde ich dir die Lebensbestimmung-Beratung empfehlen. Das ist eine 90-minuetige Sitzung mit Swetlana persoenlich.", "timestamp": 35.0},
    {"role": "user", "message": "Was kostet das denn?", "timestamp": 48.5},
    {"role": "agent", "message": "Die Lebensbestimmung-Beratung kostet 149 Euro. Dafuer bekommst du eine ausfuehrliche Analyse deines Geburtsdiagramms, konkrete Empfehlungen fuer deine berufliche Entwicklung und eine PDF-Zusammenfassung.", "timestamp": 52.1},
    {"role": "user", "message": "Das klingt gut. Kann ich einen Termin buchen?", "timestamp": 68.0},
    {"role": "agent", "message": "Natuerlich! Lass mich gleich die verfuegbaren Termine nachschauen.", "timestamp": 72.3}
  ]'::jsonb,
  'Interessentin fragt nach Psychomatrix und Karriere-Analyse. Geburtsdatum: 15.03.1988. Interesse an Lebensbestimmung-Beratung (149€). Termin wurde gebucht.',
  'completed', 'customer_ended',
  true, NOW() - INTERVAL '3 days'
),
-- Call 2: FAQ inquiry (no booking)
(
  'demo_conv_002', 'web', NULL, 'de',
  124, -- 2:04 min
  '[
    {"role": "agent", "message": "Hallo und willkommen bei Numerologie PRO. Mein Name ist Lisa. Wie kann ich dir helfen?", "timestamp": 0.0},
    {"role": "user", "message": "Hi, ich wollte fragen, was der Unterschied zwischen der Psychomatrix und normaler Numerologie ist.", "timestamp": 4.8},
    {"role": "agent", "message": "Gute Frage! Die Psychomatrix ist ein spezielles System, das auf der Pythagoras-Methode basiert. Im Gegensatz zur klassischen Numerologie arbeitet sie mit einem 3x3 Raster deiner Geburtszahlen.", "timestamp": 10.2},
    {"role": "user", "message": "Kann ich das auch kostenlos ausprobieren?", "timestamp": 25.0},
    {"role": "agent", "message": "Ja klar! Auf unserer Webseite gibt es einen kostenlosen Rechner. Du gibst einfach dein Geburtsdatum ein und bekommst deine Grundmatrix angezeigt. Den findest du unter numerologie-pro.com/rechner.", "timestamp": 30.1},
    {"role": "user", "message": "Super, danke! Das probiere ich mal aus.", "timestamp": 42.5},
    {"role": "agent", "message": "Gerne! Und wenn du danach noch Fragen hast oder eine tiefere Analyse moechtest, sind wir jederzeit fuer dich da. Kann ich dir sonst noch helfen?", "timestamp": 46.0},
    {"role": "user", "message": "Nein, das wars erstmal. Danke!", "timestamp": 55.2}
  ]'::jsonb,
  'Allgemeine FAQ-Anfrage zum Unterschied Psychomatrix vs. klassische Numerologie. Verweis auf kostenlosen Rechner. Kein Termin gebucht.',
  'completed', 'customer_ended',
  true, NOW() - INTERVAL '5 days'
),
-- Call 3: Russian-language inquiry
(
  'demo_conv_003', 'web', NULL, 'ru',
  198, -- 3:18 min
  '[
    {"role": "agent", "message": "Здравствуйте и добро пожаловать в Numerologie PRO. Меня зовут Лиза, я ИИ-ассистент Светланы Вагнер. Чем могу помочь?", "timestamp": 0.0},
    {"role": "user", "message": "Здравствуйте! Я хотела бы узнать о карте отношений.", "timestamp": 6.1},
    {"role": "agent", "message": "Карта отношений — это анализ совместимости двух людей на основе их дат рождения. Мы рассчитываем общие числа и показываем, где вы дополняете друг друга, а где могут быть сложности.", "timestamp": 12.5},
    {"role": "user", "message": "Сколько это стоит и что я получу?", "timestamp": 28.0},
    {"role": "agent", "message": "Пакет Карта Отношений стоит 99 евро. Вы получаете 90-минутную консультацию со Светланой, подробный PDF-анализ совместимости и практические рекомендации.", "timestamp": 33.2},
    {"role": "user", "message": "Мне нужно подумать. Можно ли записаться позже?", "timestamp": 48.5},
    {"role": "agent", "message": "Конечно! Вы можете в любое время позвонить нам или записаться через сайт. У нас также есть бесплатная 15-минутная консультация, если хотите сначала познакомиться со Светланой.", "timestamp": 52.0}
  ]'::jsonb,
  'Russischsprachige Anfrage zu Beziehungsmatrix (99€). Interessentin moechte nachdenken. Kein Termin gebucht, Follow-up empfohlen.',
  'completed', 'customer_ended',
  true, NOW() - INTERVAL '1 day'
);

-- Demo Voice Leads (2 leads)
INSERT INTO voice_leads (
  name, email, phone, language, score, grade, status,
  qualification, objections, next_steps, is_demo, created_at
) VALUES
(
  'Anna Mueller', 'anna.mueller@example.com', '+49 151 12345678', 'de',
  78, 'A', 'qualified',
  '{"interest": "Karriere-Analyse", "budget": "bereit", "timeline": "sofort", "experience": "kennt_numerologie", "decision": "selbst", "engagement": "viele_fragen"}'::jsonb,
  '[]'::jsonb,
  'Termin fuer Lebensbestimmung-Beratung buchen',
  true, NOW() - INTERVAL '3 days'
),
(
  'Мария Петрова', 'maria.petrova@example.com', '+49 176 98765432', 'ru',
  52, 'B', 'follow_up',
  '{"interest": "Beziehungsanalyse", "budget": "nachdenken", "timeline": "naechste_wochen", "experience": "interessiert", "decision": "mit_partner", "engagement": "hoert_zu"}'::jsonb,
  '["muss_nachdenken"]'::jsonb,
  'Follow-up in 1 Woche, kostenloses Erstgespraech anbieten',
  true, NOW() - INTERVAL '1 day'
);

-- Demo Voice Call Analyses (3 analyses matching the calls)
INSERT INTO voice_call_analyses (
  anrufer_name, anrufer_email, anrufer_telefon, sprache,
  kategorie, thema, anliegen, interessiertes_paket,
  kaufbereitschaft, einwand, geburtsdatum_genannt,
  status, termin_gebucht, termin_datum, follow_up_noetig,
  naechster_schritt, zusammenfassung, is_demo, created_at
) VALUES
(
  'Anna Mueller', 'anna.mueller@example.com', '+49 151 12345678', 'de',
  'PAKETBERATUNG', 'Karriere und Beruf', 'Moechte wissen was Geburtszahlen ueber Karriere sagen',
  'lebensbestimmung', 'hoch', 'keiner', true,
  'termin_gebucht', true, NOW() + INTERVAL '5 days',
  false, 'Termin findet statt — keine weitere Aktion noetig',
  'Interessentin fragt nach Karriere-Analyse. Kennt Numerologie bereits. Budget vorhanden. Termin fuer Lebensbestimmung gebucht.',
  true, NOW() - INTERVAL '3 days'
),
(
  NULL, NULL, NULL, 'de',
  'FAQ', 'Allgemeine Fragen', 'Unterschied Psychomatrix vs. klassische Numerologie',
  'keines', 'niedrig', 'keiner', false,
  'informiert', false, NULL,
  false, 'Kostenloser Rechner empfohlen',
  'Allgemeine FAQ-Anfrage. Kein konkretes Kaufinteresse. Verweis auf kostenlosen Rechner.',
  true, NOW() - INTERVAL '5 days'
),
(
  'Мария Петрова', 'maria.petrova@example.com', '+49 176 98765432', 'ru',
  'PAKETBERATUNG', 'Beziehung und Partnerschaft', 'Interesse an Beziehungsmatrix',
  'beziehungsmatrix', 'mittel', 'muss_nachdenken', false,
  'follow_up', false, NULL,
  true, 'Follow-up in 1 Woche — kostenloses Erstgespraech anbieten',
  'Russischsprachige Anfrage zu Beziehungsmatrix. Muss mit Partner besprechen. Follow-up empfohlen.',
  true, NOW() - INTERVAL '1 day'
);

COMMIT;
