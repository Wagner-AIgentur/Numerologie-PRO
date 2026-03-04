-- 036_cleanup_test_data_and_set_admin.sql
-- Entfernt alle Test-/Kundendaten und setzt die Produktions-Admin-Credentials
-- WARNUNG: Dieses Skript ist DESTRUKTIV und NICHT umkehrbar!
-- SICHERHEITSHINWEIS: Nach Ausfuehrung diese Datei NICHT in ein oeffentliches Repo committen.

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 1: Alle Kunden-/Testdaten loeschen (Kind-Tabellen zuerst wg. FK)
-- ══════════════════════════════════════════════════════════════════════════

-- Automation & Logging
DELETE FROM public.automation_logs;
DELETE FROM public.activity_feed;
DELETE FROM public.email_log;
DELETE FROM public.click_events;
DELETE FROM public.page_views;

-- Messaging
DELETE FROM public.telegram_messages;
DELETE FROM public.instagram_messages;
DELETE FROM public.whatsapp_messages;
DELETE FROM public.meta_capi_events;

-- CRM Daten
DELETE FROM public.crm_notes;
DELETE FROM public.tasks;
DELETE FROM public.deals;
DELETE FROM public.custom_field_values;

-- Sequenz-Enrollments (Templates/Steps bleiben erhalten!)
DELETE FROM public.email_sequence_enrollments;

-- Broadcasts (Empfaenger + Broadcasts selbst)
DELETE FROM public.broadcast_recipients;
DELETE FROM public.broadcasts;

-- Commerce
DELETE FROM public.orders;
DELETE FROM public.sessions;
DELETE FROM public.coupon_usages;

-- Affiliates
DELETE FROM public.affiliate_clicks;
DELETE FROM public.affiliate_payouts;
DELETE FROM public.affiliates;

-- Content Studio (User-Generated Content)
DELETE FROM public.content_leads;
DELETE FROM public.content_relationships;
DELETE FROM public.content_memories;
DELETE FROM public.content_posts;
DELETE FROM public.content_calendar;
DELETE FROM public.content_intel;

-- Referrals
DELETE FROM public.referrals;

-- Leads & Kontakte
DELETE FROM public.leads;

-- Telegram Bot State
DELETE FROM public.telegram_bot_state;

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 2: Nicht-Admin Profile + Auth-User loeschen
-- ══════════════════════════════════════════════════════════════════════════

-- Alle Nicht-Admin Profile loeschen
DELETE FROM public.profiles WHERE crm_status IS DISTINCT FROM 'admin';

-- Verwaiste Auth-User loeschen (kein passendes Profil mehr)
DELETE FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles);

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 3: Admin-Credentials aktualisieren
-- ══════════════════════════════════════════════════════════════════════════

-- Admin-Profil: E-Mail setzen
UPDATE public.profiles
SET email = 'info@numerologie-pro.com',
    updated_at = NOW()
WHERE crm_status = 'admin';

-- Auth-User: E-Mail + Passwort setzen
UPDATE auth.users
SET email = 'info@numerologie-pro.com',
    encrypted_password = crypt('RStXMe$&qGeC65', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"email": "info@numerologie-pro.com"}'::jsonb,
    updated_at = NOW()
WHERE id = (SELECT id FROM public.profiles WHERE crm_status = 'admin');

-- Auth-Identities: E-Mail synchronisieren
UPDATE auth.identities
SET identity_data = identity_data || '{"email": "info@numerologie-pro.com"}'::jsonb,
    updated_at = NOW()
WHERE user_id = (SELECT id FROM public.profiles WHERE crm_status = 'admin');

-- ══════════════════════════════════════════════════════════════════════════
-- PHASE 4: Zaehler zuruecksetzen
-- ══════════════════════════════════════════════════════════════════════════

-- Automation Run-Counter zuruecksetzen (da alle Logs geloescht)
UPDATE public.automation_rules
SET run_count = 0,
    last_run_at = NULL;

COMMIT;
