-- 046_demo_data_enrichment.sql
-- Enriches demo data for a complete Voice Agent KPI dashboard.
-- Adds is_demo to voice_appointments, restrictive RLS, and
-- additional demo records (calls, leads, analyses, appointments).

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 1: Add is_demo to voice_appointments + RLS
-- ══════════════════════════════════════════════════════════════════════════

ALTER TABLE voice_appointments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_voice_appointments_is_demo
  ON voice_appointments(is_demo) WHERE is_demo = true;

CREATE POLICY "Demo reviewers only see demo appointments"
  ON voice_appointments AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (NOT public.is_demo_reviewer() OR is_demo = true);

CREATE POLICY "Demo reviewers cannot insert appointments"
  ON voice_appointments AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_demo_reviewer());

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 2: Additional demo leads (3 new → total 5)
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO voice_leads (
  name, email, phone, language, score, grade, status,
  qualification, objections, next_steps, is_demo, created_at
) VALUES
-- Lead 3: C-Grade — skeptical, low engagement
(
  'Thomas Schmidt', 'thomas.schmidt@example.com', '+49 170 11122233', 'de',
  28, 'C', 'disqualified',
  '{"interest": "allgemein", "budget": "kein_budget", "timeline": "irgendwann", "experience": "keine", "decision": "unklar", "engagement": "desinteressiert"}'::jsonb,
  '["skeptisch", "zu_teuer"]'::jsonb,
  'Kein Follow-up noetig — kein echtes Interesse',
  true, NOW() - INTERVAL '7 days'
),
-- Lead 4: A-Grade — ready to book, high engagement
(
  'Julia Weber', 'julia.weber@example.com', '+49 172 44455566', 'de',
  85, 'A', 'demo_booked',
  '{"interest": "Lebensbestimmung", "budget": "bereit", "timeline": "sofort", "experience": "kennt_numerologie", "decision": "selbst", "engagement": "sehr_engagiert"}'::jsonb,
  '[]'::jsonb,
  'Termin bestaetigt — Lebensbestimmung am Freitag',
  true, NOW() - INTERVAL '2 days'
),
-- Lead 5: B-Grade — interested but no time right now
(
  'Елена Иванова', 'elena.ivanova@example.com', '+49 157 77788899', 'ru',
  55, 'B', 'follow_up',
  '{"interest": "Jahresprognose", "budget": "nachdenken", "timeline": "naechste_wochen", "experience": "interessiert", "decision": "selbst", "engagement": "hoert_zu"}'::jsonb,
  '["keine_zeit"]'::jsonb,
  'Follow-up naechste Woche — Jahresprognose anbieten',
  true, NOW() - INTERVAL '4 days'
);

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 3: Additional demo calls (5 new → total 8)
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO voice_calls (
  elevenlabs_conversation_id, channel, phone_number, language,
  duration_seconds, transcript, summary, status, ended_reason,
  is_demo, created_at
) VALUES
-- Call 4: Thomas Schmidt — short skeptical call (C-lead)
(
  'demo_conv_004', 'web', NULL, 'de',
  92,
  '[
    {"role": "agent", "message": "Hallo und willkommen bei Numerologie PRO. Mein Name ist Lisa. Wie kann ich dir helfen?", "timestamp": 0.0},
    {"role": "user", "message": "Ja hallo, ich hab das irgendwo gesehen mit der Numerologie. Was ist das genau?", "timestamp": 4.5},
    {"role": "agent", "message": "Die Numerologie ist die Lehre von der Bedeutung der Zahlen in deinem Leben. Bei uns arbeiten wir mit der Psychomatrix, einem System basierend auf deinem Geburtsdatum.", "timestamp": 10.2},
    {"role": "user", "message": "Und was kostet das? Ich bin da eher skeptisch.", "timestamp": 22.0},
    {"role": "agent", "message": "Das verstehe ich! Du kannst erstmal unseren kostenlosen Rechner auf der Webseite ausprobieren. Gib einfach dein Geburtsdatum ein und schau, ob es dich anspricht.", "timestamp": 28.1},
    {"role": "user", "message": "Hmm, nee ich glaub das ist nichts fuer mich. Danke trotzdem.", "timestamp": 38.5},
    {"role": "agent", "message": "Kein Problem! Falls du es dir anders ueberlegst, wir sind jederzeit fuer dich da. Schoenen Tag noch!", "timestamp": 42.0}
  ]'::jsonb,
  'Kurze Anfrage — Anrufer skeptisch gegenueber Numerologie. Kein Interesse an Beratung. Verweis auf kostenlosen Rechner.',
  'completed', 'customer_ended',
  true, NOW() - INTERVAL '7 days'
),
-- Call 5: Julia Weber — long call, enthusiastic, booking (A-lead)
(
  'demo_conv_005', 'phone', '+49 172 44455566', 'de',
  320,
  '[
    {"role": "agent", "message": "Hallo und willkommen bei Numerologie PRO! Mein Name ist Lisa, ich bin die KI-Assistentin von Swetlana Wagner. Wie kann ich dir helfen?", "timestamp": 0.0},
    {"role": "user", "message": "Hallo Lisa! Ich bin Julia und beschaeftige mich schon laenger mit Numerologie. Ich haette gerne eine professionelle Analyse.", "timestamp": 6.0},
    {"role": "agent", "message": "Schoen, Julia! Toll, dass du dich schon mit Numerologie auskennst. Was interessiert dich besonders? Karriere, Beziehungen, oder deine generelle Lebensbestimmung?", "timestamp": 14.2},
    {"role": "user", "message": "Meine Lebensbestimmung! Ich bin 34, am 22. November 1991 geboren und stehe gerade an einem Wendepunkt.", "timestamp": 22.0},
    {"role": "agent", "message": "Der 22.11. — das ist ein Meisterzahl-Geburtsdatum! Die 22 steht fuer den Meisterbaumeister. Da steckt unglaublich viel Potenzial drin. Fuer eine tiefe Analyse empfehle ich dir die Lebensbestimmung-Beratung.", "timestamp": 32.5},
    {"role": "user", "message": "Was beinhaltet die genau?", "timestamp": 45.0},
    {"role": "agent", "message": "Die Lebensbestimmung ist eine 90-minuetige Sitzung mit Swetlana persoenlich. Du bekommst eine komplette Analyse deiner Psychomatrix, deiner Lebenszahlen und konkrete Handlungsempfehlungen. Dazu gibt es eine PDF-Zusammenfassung. Das Ganze kostet 149 Euro.", "timestamp": 49.2},
    {"role": "user", "message": "Das klingt super! Kann ich direkt einen Termin buchen?", "timestamp": 68.0},
    {"role": "agent", "message": "Natuerlich! Lass mich gleich nachschauen, wann Swetlana verfuegbar ist.", "timestamp": 72.0},
    {"role": "user", "message": "Freitag waere perfekt fuer mich.", "timestamp": 80.0},
    {"role": "agent", "message": "Am Freitag um 14 Uhr haette Swetlana einen Slot frei. Passt das?", "timestamp": 84.5},
    {"role": "user", "message": "Perfekt, den nehme ich!", "timestamp": 90.0},
    {"role": "agent", "message": "Wunderbar! Ich buche den Termin fuer dich. Du bekommst eine Bestaetigungsmail an deine E-Mail-Adresse.", "timestamp": 94.0}
  ]'::jsonb,
  'Enthusiastische Anruferin mit Numerologie-Erfahrung. Meisterzahl 22 — Lebensbestimmung empfohlen (149€). Termin Freitag 14 Uhr gebucht.',
  'completed', 'customer_ended',
  true, NOW() - INTERVAL '2 days'
),
-- Call 6: Elena Ivanova — Russian, interested but no time (B-lead)
(
  'demo_conv_006', 'web', NULL, 'ru',
  175,
  '[
    {"role": "agent", "message": "Здравствуйте и добро пожаловать в Numerologie PRO. Меня зовут Лиза. Чем могу помочь?", "timestamp": 0.0},
    {"role": "user", "message": "Здравствуйте! Меня интересует прогноз на год. Что вы можете предложить?", "timestamp": 5.5},
    {"role": "agent", "message": "Прогноз на год — это индивидуальный анализ ваших энергий на текущий год. Мы рассчитываем ваш персональный год и даём рекомендации по месяцам.", "timestamp": 12.0},
    {"role": "user", "message": "Звучит интересно. Сколько это стоит?", "timestamp": 24.0},
    {"role": "agent", "message": "Годовой прогноз стоит 79 евро. Вы получаете 60-минутную консультацию со Светланой и подробный PDF с рекомендациями на каждый месяц.", "timestamp": 28.5},
    {"role": "user", "message": "Интересно, но сейчас у меня нет времени. Можно позже?", "timestamp": 40.0},
    {"role": "agent", "message": "Конечно! Я могу отправить вам ссылку для бронирования, и вы запишетесь, когда будет удобно. Хотите?", "timestamp": 44.5},
    {"role": "user", "message": "Да, пришлите, пожалуйста. Мой email — elena.ivanova@example.com", "timestamp": 52.0},
    {"role": "agent", "message": "Отлично! Отправлю вам ссылку на почту. Хорошего дня!", "timestamp": 58.0}
  ]'::jsonb,
  'Russischsprachige Anfrage zu Jahresprognose (79€). Interesse vorhanden, aber keine Zeit. Email erfasst — Follow-up per Mail.',
  'completed', 'customer_ended',
  true, NOW() - INTERVAL '4 days'
),
-- Call 7: Quick anonymous FAQ (no lead)
(
  'demo_conv_007', 'web', NULL, 'de',
  85,
  '[
    {"role": "agent", "message": "Hallo und willkommen bei Numerologie PRO! Wie kann ich dir helfen?", "timestamp": 0.0},
    {"role": "user", "message": "Kann man bei euch auch per Ratenzahlung bezahlen?", "timestamp": 3.5},
    {"role": "agent", "message": "Ja, bei allen Paketen ab 99 Euro bieten wir Ratenzahlung ueber Klarna an. Du kannst in 3 oder 6 Raten zahlen, ohne Aufpreis.", "timestamp": 8.2},
    {"role": "user", "message": "Gut, danke. Das wollte ich nur wissen.", "timestamp": 18.0},
    {"role": "agent", "message": "Gerne! Wenn du noch Fragen hast, melde dich jederzeit.", "timestamp": 21.5}
  ]'::jsonb,
  'Kurze FAQ-Anfrage zu Ratenzahlung (Klarna). Keine persoenlichen Daten erfasst.',
  'completed', 'customer_ended',
  true, NOW() - INTERVAL '6 days'
),
-- Call 8: Missed/abandoned call
(
  'demo_conv_008', 'phone', '+49 160 99988877', 'de',
  0,
  '[]'::jsonb,
  NULL,
  'missed', 'system_timeout',
  true, NOW() - INTERVAL '8 days'
);

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 4: Additional demo analyses (3 new → total 6)
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO voice_call_analyses (
  anrufer_name, anrufer_email, anrufer_telefon, sprache,
  kategorie, thema, anliegen, interessiertes_paket,
  kaufbereitschaft, einwand, geburtsdatum_genannt,
  status, termin_gebucht, termin_datum, follow_up_noetig,
  naechster_schritt, zusammenfassung, is_demo, created_at
) VALUES
-- Analysis 4: Thomas Schmidt — skeptisch, abgebrochen
(
  'Thomas Schmidt', 'thomas.schmidt@example.com', '+49 170 11122233', 'de',
  'FAQ', 'Allgemeine Fragen', 'Was ist Numerologie',
  'keines', 'niedrig', 'skeptisch', false,
  'informiert', false, NULL,
  false, 'Kein Follow-up — Anrufer hat kein Interesse',
  'Skeptischer Anrufer, nur allgemeine Frage. Kein Kaufinteresse. Verweis auf kostenlosen Rechner.',
  true, NOW() - INTERVAL '7 days'
),
-- Analysis 5: Julia Weber — begeistert, Termin gebucht
(
  'Julia Weber', 'julia.weber@example.com', '+49 172 44455566', 'de',
  'PAKETBERATUNG', 'Lebensbestimmung', 'Professionelle Analyse der Lebensbestimmung',
  'lebensbestimmung', 'hoch', 'keiner', true,
  'termin_gebucht', true, NOW() + INTERVAL '3 days',
  false, 'Termin findet statt — Lebensbestimmung Freitag 14 Uhr',
  'Enthusiastische Anruferin mit Numerologie-Erfahrung. Meisterzahl 22. Lebensbestimmung (149€) gebucht fuer Freitag.',
  true, NOW() - INTERVAL '2 days'
),
-- Analysis 6: Elena Ivanova — interessiert, Follow-up
(
  'Елена Иванова', 'elena.ivanova@example.com', '+49 157 77788899', 'ru',
  'PAKETBERATUNG', 'Jahresprognose', 'Interesse an Jahresprognose',
  'jahresprognose', 'mittel', 'keine_zeit', false,
  'follow_up', false, NULL,
  true, 'Follow-up per Email — Buchungslink senden',
  'Russischsprachige Anfrage zu Jahresprognose (79€). Hat Interesse, aber aktuell keine Zeit. Email erfasst.',
  true, NOW() - INTERVAL '4 days'
);

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 5: Demo appointments (2 bookings)
-- ══════════════════════════════════════════════════════════════════════════

-- Appointment 1: Anna Mueller (existing lead from migration 045)
INSERT INTO voice_appointments (
  lead_id, call_id, datetime, duration_minutes,
  calendar_event_id, calendar_url, status, notes, is_demo
)
SELECT
  vl.id,
  vc.id,
  NOW() + INTERVAL '5 days',
  30,
  'demo_cal_001',
  'https://cal.com/swetlana-wagner/beratung?demo=true',
  'scheduled',
  'Lebensbestimmung — Karriere-Analyse',
  true
FROM voice_leads vl
JOIN voice_calls vc ON vc.elevenlabs_conversation_id = 'demo_conv_001' AND vc.is_demo = true
WHERE vl.email = 'anna.mueller@example.com' AND vl.is_demo = true
LIMIT 1;

-- Appointment 2: Julia Weber (new lead from this migration)
INSERT INTO voice_appointments (
  lead_id, call_id, datetime, duration_minutes,
  calendar_event_id, calendar_url, status, notes, is_demo
)
SELECT
  vl.id,
  vc.id,
  NOW() + INTERVAL '3 days',
  90,
  'demo_cal_002',
  'https://cal.com/swetlana-wagner/lebensbestimmung?demo=true',
  'scheduled',
  'Lebensbestimmung — Meisterzahl 22, Wendepunkt-Analyse',
  true
FROM voice_leads vl
JOIN voice_calls vc ON vc.elevenlabs_conversation_id = 'demo_conv_005' AND vc.is_demo = true
WHERE vl.email = 'julia.weber@example.com' AND vl.is_demo = true
LIMIT 1;

COMMIT;
