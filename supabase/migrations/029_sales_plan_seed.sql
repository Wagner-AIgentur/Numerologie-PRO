-- ============================================================
-- 029: Sales Plan Seed Data
-- Automation rules, email sequences, and tag rules
-- for the Numerologie PRO sales funnel
-- ============================================================

-- ── 1. New Tag Rules ──

INSERT INTO public.tag_rules (tag_name, description, condition_type, condition_value, auto_remove) VALUES
  ('Erster-Kauf', 'Hat mindestens eine Bestellung', 'order_count_gte', '1', false)
ON CONFLICT DO NOTHING;

-- Note: birthdate_month tag rule for "Geburtstags-Monat" needs monthly value updates.
-- The auto-tagger cron evaluates birthdate_month conditions against profiles.birthdate.
-- We seed the current month; update condition_value monthly or add cron logic.
INSERT INTO public.tag_rules (tag_name, description, condition_type, condition_value, auto_remove) VALUES
  ('Geburtstags-Monat', 'Geburtstag in diesem Monat', 'birthdate_month', EXTRACT(MONTH FROM now())::text, true)
ON CONFLICT DO NOTHING;


-- ── 2. Automation Rules (6 rules from sales plan) ──

-- Rule 1: Auto status change lead -> client after purchase
INSERT INTO public.automation_rules (name, description, trigger_event, conditions, actions) VALUES
(
  'Lead zu Kunde nach Kauf',
  'Setzt crm_status automatisch auf client nach jeder Bestellung',
  'order_completed',
  '[]'::jsonb,
  '[{"type": "change_status", "value": "client"}]'::jsonb
);

-- Rule 2: PDF buyer Telegram upsell
INSERT INTO public.automation_rules (name, description, trigger_event, conditions, actions) VALUES
(
  'PDF Upsell via Telegram',
  'Sendet Telegram-Nachricht nach PDF-Kauf mit Upsell auf Consultation',
  'order_completed',
  '[{"field": "package_key", "operator": "eq", "value": "pdf_analyse"}]'::jsonb,
  '[{"type": "send_telegram", "value": "Danke fuer deine PDF-Analyse! Die PDF zeigt dir die Oberflaeche — in einer persoenlichen Sitzung entdecken wir die verborgenen Zusammenhaenge deiner Zahlen. Buche jetzt mit 10% Rabatt: https://numerologie-pro.com/de/pakete"}]'::jsonb
);

-- Rule 3: Post-session referral push
INSERT INTO public.automation_rules (name, description, trigger_event, conditions, actions) VALUES
(
  'Empfehlungs-Erinnerung nach Sitzung',
  'Sendet Telegram-Nachricht nach abgeschlossener Sitzung mit Referral-Hinweis',
  'session_completed',
  '[]'::jsonb,
  '[{"type": "send_telegram", "value": "Danke fuer die Sitzung! Hat dir die Analyse gefallen? Empfiehl mich weiter und erhalte 15% auf deine naechste Buchung. Tippe /empfehlen"}]'::jsonb
);

-- Rule 4: High-Value -> VIP status upgrade
INSERT INTO public.automation_rules (name, description, trigger_event, conditions, actions) VALUES
(
  'High-Value zu VIP',
  'Setzt crm_status auf vip wenn High-Value Tag hinzugefuegt wird',
  'tag_added',
  '[{"field": "tags", "operator": "contains", "value": "High-Value"}]'::jsonb,
  '[{"type": "change_status", "value": "vip"}]'::jsonb
);

-- Rule 5: Inactive lead re-engagement (enrolls in re-engagement sequence)
-- Note: sequence_id will be set after sequence creation via the seed script
INSERT INTO public.automation_rules (name, description, trigger_event, conditions, actions) VALUES
(
  'Inaktive Lead Reaktivierung',
  'Enrolled inaktive Kontakte in Re-Engagement Email-Sequenz',
  'tag_added',
  '[{"field": "tags", "operator": "contains", "value": "Inaktiv-30-Tage"}]'::jsonb,
  '[{"type": "send_email", "value": "Wir vermissen dich! Deine Zahlen haben sich seit deinem letzten Besuch veraendert. Schau dir an, was sich in deiner Matrix getan hat: https://numerologie-pro.com/de/rechner"}]'::jsonb
);

-- Rule 6: Birthday campaign
INSERT INTO public.automation_rules (name, description, trigger_event, conditions, actions) VALUES
(
  'Geburtstags-Kampagne',
  'Sendet Geburtstags-Email mit 20% Gutschein',
  'tag_added',
  '[{"field": "tags", "operator": "contains", "value": "Geburtstags-Monat"}]'::jsonb,
  '[{"type": "send_email", "value": "Alles Gute zum Geburtstag! Dein neues Lebensjahr bringt neue Energien. Als Geschenk erhaeltst du 20% Rabatt auf jede Sitzung in deinem Geburtstagsmonat. Buche jetzt: https://numerologie-pro.com/de/pakete"}]'::jsonb
);


-- ── 3. Email Sequences (5 sequences with steps) ──

-- Sequence 1: Lead Nurture (trigger: lead_verified)
WITH seq AS (
  INSERT INTO public.email_sequences (name, description, trigger_event, trigger_filter, is_active)
  VALUES (
    'Lead Nurture',
    'Fuehrt neue verifizierte Leads durch einen 5-Step Funnel zur ersten PDF-Bestellung',
    'lead_verified',
    '{}'::jsonb,
    true
  )
  RETURNING id
)
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_days, delay_hours, subject, content_html, content_telegram, send_telegram) VALUES
  ((SELECT id FROM seq), 1, 0, 0,
   'Deine Zahlen sprechen — hoer zu',
   '<h2 style="color:#D4AF37;">Willkommen bei Numerologie PRO</h2><p>Deine Psychomatrix wurde berechnet — und sie hat eine Geschichte zu erzaehlen.</p><p>Jede Zahl in deiner Matrix verraet etwas ueber deine Persoenlichkeit, deine Staerken und deine verborgenen Talente.</p><p><a href="https://numerologie-pro.com/de/rechner" style="color:#D4AF37;font-weight:bold;">Schau dir deine Matrix an →</a></p><p>Alles Liebe,<br/>Swetlana</p>',
   'Willkommen bei Numerologie PRO! Deine Psychomatrix wurde berechnet. Schau dir deine Zahlen an: https://numerologie-pro.com/de/rechner',
   true),
  ((SELECT id FROM seq), 2, 2, 0,
   'Was bedeutet deine Schicksalszahl fuer dich?',
   '<h2 style="color:#D4AF37;">Deine Schicksalszahl</h2><p>Wusstest du, dass deine Schicksalszahl dir zeigt, welche Aufgaben du in diesem Leben hast?</p><p>Sie verraet dir:</p><ul><li>Deine natuerlichen Talente und Staerken</li><li>Deine Lebensaufgabe</li><li>Bereiche, in denen du wachsen kannst</li></ul><p>In deiner vollstaendigen Matrix stecken noch viel mehr Antworten.</p><p><a href="https://numerologie-pro.com/de/rechner" style="color:#D4AF37;font-weight:bold;">Deine vollstaendige Matrix ansehen →</a></p>',
   'Deine Schicksalszahl zeigt dir deine Lebensaufgabe. Entdecke alle 9 Positionen deiner Matrix: https://numerologie-pro.com/de/rechner',
   true),
  ((SELECT id FROM seq), 3, 5, 0,
   'Dein persoenlicher Numerologie-Report',
   '<h2 style="color:#D4AF37;">Deine vollstaendige Psychomatrix als PDF</h2><p>Stell dir vor, du haeltst einen persoenlichen Report in den Haenden, der dir zeigt:</p><ul><li>Alle 9 Positionen deiner Psychomatrix erklaert</li><li>Deine Charakterstaerken und Wachstumsbereiche</li><li>Konkrete Hinweise fuer Beziehung, Beruf und Gesundheit</li></ul><p>Dein persoenlicher PDF-Report — generiert in Sekunden, basierend auf deinem Geburtsdatum.</p><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">PDF-Analyse bestellen — nur 9,99 EUR →</a></p>',
   'Dein persoenlicher Numerologie-Report — alle 9 Matrix-Positionen erklaert. Nur 9,99 EUR: https://numerologie-pro.com/de/pakete',
   true),
  ((SELECT id FROM seq), 4, 8, 0,
   'Das sagen meine Kunden',
   '<h2 style="color:#D4AF37;">Was Kunden ueber ihre Analyse sagen</h2><blockquote style="border-left:3px solid #D4AF37;padding:12px 16px;margin:16px 0;"><p><em>"Ich war zuerst skeptisch, aber Swetlana hat Dinge gesehen, die kein Test zeigen kann. Die Beratung hat mir Klarheit gegeben."</em><br/>— Ljudmila K.</p></blockquote><blockquote style="border-left:3px solid #D4AF37;padding:12px 16px;margin:16px 0;"><p><em>"Die PDF-Analyse war der Einstieg — die persoenliche Sitzung hat alles veraendert."</em><br/>— Marina S.</p></blockquote><p>Moechtest du auch Klarheit? Starte mit deiner kostenlosen Beratung.</p><p><a href="https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация" style="color:#D4AF37;font-weight:bold;">Kostenlose 15-Min Beratung buchen →</a></p>',
   NULL, false),
  ((SELECT id FROM seq), 5, 12, 0,
   'Dein Report wartet auf dich',
   '<h2 style="color:#D4AF37;">Ich habe deinen Report vorbereitet</h2><p>Deine Psychomatrix ist berechnet. Dein persoenlicher PDF-Report wartet nur noch auf einen Klick.</p><p>9 Positionen. Deine Zahlen. Deine Geschichte.</p><p><strong>Nur 9,99 EUR</strong> — und du haeltst deinen Report in wenigen Sekunden in den Haenden.</p><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Jetzt PDF-Report bestellen →</a></p><p>Deine Zahlen warten. Alles Liebe, Swetlana</p>',
   'Dein PDF-Report wartet! 9 Positionen, deine Geschichte. Nur 9,99 EUR: https://numerologie-pro.com/de/pakete',
   true);

-- Sequence 2: PDF Upsell (trigger: order_completed, filter: pdf_analyse)
WITH seq AS (
  INSERT INTO public.email_sequences (name, description, trigger_event, trigger_filter, is_active)
  VALUES (
    'PDF Kaeufer Upsell',
    'Fuehrt PDF-Kaeufer durch Upsell-Funnel zu einer Live-Consultation',
    'order_completed',
    '{"package_key": "pdf_analyse"}'::jsonb,
    true
  )
  RETURNING id
)
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_days, delay_hours, subject, content_html, send_telegram) VALUES
  ((SELECT id FROM seq), 1, 3, 0,
   '3 verborgene Botschaften in deiner Matrix',
   '<h2 style="color:#D4AF37;">Was deine Matrix ueber deine Beziehungen verraet</h2><p>Deine PDF-Analyse zeigt dir die Grundlagen deiner Psychomatrix. Aber wusstest du, dass bestimmte Zahlenkombinationen verborgene Botschaften enthalten?</p><p>In einer persoenlichen Sitzung entdecken wir gemeinsam:</p><ul><li>Welche Partner wirklich zu dir passen</li><li>Warum bestimmte Beziehungen immer scheitern</li><li>Wie du deine Beziehungsmatrix aktiv nutzen kannst</li></ul><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Beziehungsmatrix buchen (119 EUR) →</a></p>',
   false),
  ((SELECT id FROM seq), 2, 7, 0,
   'Was bringt dir 2026?',
   '<h2 style="color:#D4AF37;">Deine Jahresprognose 2026</h2><p>Jedes Jahr bringt neue Energien — und deine Zahlen verraten, was auf dich zukommt.</p><p>Die Jahresprognose zeigt dir:</p><ul><li>Welche Monate besonders guenstig sind</li><li>Wo Herausforderungen warten</li><li>Wie du das Jahr optimal fuer dich nutzt</li></ul><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Jahresprognose buchen (119 EUR) →</a></p>',
   false),
  ((SELECT id FROM seq), 3, 14, 0,
   'Swetlana persoenlich kennenlernen',
   '<h2 style="color:#D4AF37;">Lass uns persoenlich sprechen</h2><p>Die PDF ist ein guter Anfang — aber eine persoenliche Sitzung geht 10x tiefer.</p><blockquote style="border-left:3px solid #D4AF37;padding:12px 16px;margin:16px 0;"><p><em>"Die PDF war interessant, aber erst in der persoenlichen Sitzung hat sich alles zusammengefuegt."</em><br/>— Elena R.</p></blockquote><p>Buch dir jetzt eine kostenlose 15-Minuten-Beratung — ohne Verpflichtung.</p><p><a href="https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация" style="color:#D4AF37;font-weight:bold;">Kostenlose Erstberatung buchen →</a></p>',
   false),
  ((SELECT id FROM seq), 4, 21, 0,
   'Dein 10% Gutschein laeuft bald ab',
   '<h2 style="color:#D4AF37;">Letzte Erinnerung: Dein Gutschein</h2><p>Dein 10%-Gutschein fuer eine persoenliche Numerologie-Sitzung laeuft in 7 Tagen ab.</p><p>Eine Sitzung mit Swetlana — 90 Minuten, in denen wir gemeinsam deine Zahlen entschluesseln.</p><p><strong>Nutze deinen Gutschein jetzt, bevor er verfaellt.</strong></p><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Jetzt Sitzung buchen →</a></p>',
   false);

-- Sequence 3: Post-Session Follow-Up (trigger: session_completed)
WITH seq AS (
  INSERT INTO public.email_sequences (name, description, trigger_event, trigger_filter, is_active)
  VALUES (
    'Nach-Sitzung Follow-Up',
    'Follow-Up nach abgeschlossener Sitzung: Danke, Review, Referral, Cross-Sell',
    'session_completed',
    '{}'::jsonb,
    true
  )
  RETURNING id
)
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_days, delay_hours, subject, content_html, content_telegram, send_telegram) VALUES
  ((SELECT id FROM seq), 1, 1, 0,
   'Danke fuer deine Sitzung',
   '<h2 style="color:#D4AF37;">Danke fuer unsere gemeinsame Sitzung</h2><p>Es war mir eine Freude, deine Zahlen mit dir zu entdecken. Ich hoffe, die Analyse hat dir neue Perspektiven eroeffnet.</p><p>Falls du Fragen hast, antworte einfach auf diese Email — ich bin fuer dich da.</p><p>Alles Liebe,<br/>Swetlana</p>',
   'Danke fuer unsere Sitzung! Ich hoffe, die Analyse hat dir neue Perspektiven eroeffnet. Bei Fragen bin ich fuer dich da.',
   true),
  ((SELECT id FROM seq), 2, 3, 0,
   'Teile deine Erfahrung',
   '<h2 style="color:#D4AF37;">Wie war deine Erfahrung?</h2><p>Dein Feedback hilft mir, noch besser zu werden — und anderen Menschen den Weg zur Numerologie zu zeigen.</p><p>Hast du 2 Minuten?</p><p><a href="https://g.page/r/numerologie-pro/review" style="color:#D4AF37;font-weight:bold;">Google-Bewertung schreiben →</a></p><p>Oder teil deine Erfahrung als Instagram-Story — ich freue mich ueber jede Nachricht!</p>',
   NULL, false),
  ((SELECT id FROM seq), 3, 7, 0,
   'Empfiehl mich weiter — 15% fuer dich',
   '<h2 style="color:#D4AF37;">Kennst du jemanden, der seine Zahlen kennen sollte?</h2><p>Empfiehl Numerologie PRO an Freunde und Familie — und erhalte 15% Rabatt auf deine naechste Sitzung.</p><p>So funktioniert es:</p><ol><li>Oeffne den Telegram-Bot @NumerologieProBot</li><li>Tippe /empfehlen</li><li>Teile deinen persoenlichen Link</li></ol><p>Sobald jemand ueber deinen Link bucht, bekommst du automatisch deinen 15%-Gutschein.</p>',
   'Empfiehl mich weiter und erhalte 15% Rabatt! Tippe /empfehlen im Telegram-Bot fuer deinen persoenlichen Link.',
   true),
  ((SELECT id FROM seq), 4, 14, 0,
   'Dein naechstes Paket',
   '<h2 style="color:#D4AF37;">Entdecke mehr ueber deine Zahlen</h2><p>Deine letzte Sitzung hat nur einen Teil deiner Matrix beleuchtet. Es gibt noch so viel mehr zu entdecken:</p><ul><li><strong>Beziehungsmatrix</strong> — Wer passt wirklich zu dir? (119 EUR)</li><li><strong>Geldkanal</strong> — Dein finanzielles Potenzial (99 EUR)</li><li><strong>Jahresprognose</strong> — Was bringt dir 2026? (119 EUR)</li></ul><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Alle Pakete ansehen →</a></p>',
   NULL, false),
  ((SELECT id FROM seq), 5, 30, 0,
   'Dein monatliches Numerologie-Update',
   '<h2 style="color:#D4AF37;">Dein Monats-Update</h2><p>Jeder Monat bringt neue Energien — und deine Zahlen koennen dir zeigen, worauf du achten solltest.</p><p>Hol dir deine persoenliche Monatsprognose — kompakt, konkret und auf dein Geburtsdatum zugeschnitten.</p><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Monatsprognose bestellen — nur 19 EUR →</a></p>',
   NULL, false);

-- Sequence 4: Re-Engagement (trigger: tag_added, filter: Inaktiv-30-Tage)
WITH seq AS (
  INSERT INTO public.email_sequences (name, description, trigger_event, trigger_filter, is_active)
  VALUES (
    'Re-Engagement',
    'Reaktivierung inaktiver Kontakte nach 30+ Tagen ohne Aktivitaet',
    'tag_added',
    '{"tag": "Inaktiv-30-Tage"}'::jsonb,
    true
  )
  RETURNING id
)
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_days, delay_hours, subject, content_html, content_telegram, send_telegram) VALUES
  ((SELECT id FROM seq), 1, 0, 0,
   'Wir vermissen dich',
   '<h2 style="color:#D4AF37;">Es ist eine Weile her...</h2><p>Ich wollte mich kurz melden — deine Zahlen aendern sich mit der Zeit, und deine Matrix zeigt dir immer wieder neue Seiten.</p><p>Hast du Lust auf eine kostenlose 15-Minuten-Beratung? Einfach zum Reden, ohne Verpflichtung.</p><p><a href="https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация" style="color:#D4AF37;font-weight:bold;">Kostenlose Beratung buchen →</a></p><p>Alles Liebe, Swetlana</p>',
   'Hallo! Es ist eine Weile her. Deine Zahlen aendern sich mit der Zeit — hast du Lust auf eine kostenlose Mini-Beratung?',
   true),
  ((SELECT id FROM seq), 2, 7, 0,
   'Was hat sich in deiner Matrix veraendert?',
   '<h2 style="color:#D4AF37;">Neue Energien, neue Chancen</h2><p>Wusstest du, dass sich deine persoenlichen Jahresenergien jedes Jahr aendern? Was letztes Jahr galt, muss dieses Jahr nicht mehr stimmen.</p><p>Schau dir an, was sich veraendert hat:</p><p><a href="https://numerologie-pro.com/de/rechner" style="color:#D4AF37;font-weight:bold;">Deinen Rechner erneut nutzen →</a></p>',
   NULL, false),
  ((SELECT id FROM seq), 3, 14, 0,
   'Exklusiv fuer dich: 20% Rabatt',
   '<h2 style="color:#D4AF37;">Ein besonderes Angebot fuer dich</h2><p>Ich moechte dir den Wiedereinstieg leicht machen — deshalb erhaeltst du exklusiv 20% Rabatt auf jedes Paket.</p><p>Egal ob PDF-Analyse, Beziehungsmatrix oder Jahresprognose — 20% weniger, 100% Klarheit.</p><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Alle Pakete mit 20% Rabatt →</a></p><p><em>Dieses Angebot gilt 7 Tage.</em></p>',
   NULL, false);

-- Sequence 5: Birthday Campaign (trigger: tag_added, filter: Geburtstags-Monat)
WITH seq AS (
  INSERT INTO public.email_sequences (name, description, trigger_event, trigger_filter, is_active)
  VALUES (
    'Geburtstags-Kampagne',
    'Sendet Geburtstags-Glueckwuensche mit 20% Gutschein',
    'tag_added',
    '{"tag": "Geburtstags-Monat"}'::jsonb,
    true
  )
  RETURNING id
)
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_days, delay_hours, subject, content_html, content_telegram, send_telegram) VALUES
  ((SELECT id FROM seq), 1, 0, 0,
   'Alles Gute zum Geburtstag!',
   '<h2 style="color:#D4AF37;">Alles Gute zum Geburtstag!</h2><p>Dein neues Lebensjahr bringt neue Energien — und ich moechte, dass du sie voll nutzen kannst.</p><p>Als Geburtstagsgeschenk erhaeltst du <strong>20% Rabatt</strong> auf jede Sitzung in deinem Geburtstagsmonat.</p><p>Entdecke, was das neue Jahr fuer dich bereithaelt:</p><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Jetzt mit 20% Rabatt buchen →</a></p><p>Alles Liebe und die besten Wuensche,<br/>Swetlana</p>',
   'Alles Gute zum Geburtstag! Als Geschenk erhaeltst du 20% Rabatt auf jede Sitzung. Buche jetzt: https://numerologie-pro.com/de/pakete',
   true);
