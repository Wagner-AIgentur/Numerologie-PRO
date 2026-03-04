-- ============================================================
-- 037: Seed Marketing Coupons
-- Creates the three marketing coupons referenced in email sequences
-- and the upsell cron job. These need Stripe sync via admin dashboard.
-- ============================================================

-- MATRIX10: 10% off consultations — used in PDF buyer upsell emails
INSERT INTO public.coupons (code, type, value, max_uses, applies_to, active, purpose, valid_from)
VALUES ('MATRIX10', 'percent', 10, NULL, 'packages', true, 'marketing', now())
ON CONFLICT DO NOTHING;

-- COMEBACK20: 20% off all packages — used in re-engagement sequence
INSERT INTO public.coupons (code, type, value, max_uses, applies_to, active, purpose, valid_from)
VALUES ('COMEBACK20', 'percent', 20, NULL, 'all', true, 'marketing', now())
ON CONFLICT DO NOTHING;

-- BIRTHDAY20: 20% off all packages — used in birthday campaign sequence
INSERT INTO public.coupons (code, type, value, max_uses, applies_to, active, purpose, valid_from)
VALUES ('BIRTHDAY20', 'percent', 20, NULL, 'all', true, 'marketing', now())
ON CONFLICT DO NOTHING;


-- ============================================================
-- Update sequence email HTML to include actual coupon codes
-- ============================================================

-- PDF Buyer Upsell Step 4: "Dein 10% Gutschein laeuft bald ab"
-- Add MATRIX10 code prominently + link with ?coupon= param
UPDATE public.email_sequence_steps SET
  content_html = '<h2 style="color:#D4AF37;">Letzte Erinnerung: Dein Gutschein</h2><p>Dein <strong>10% Gutschein</strong> auf eine persönliche Numerologie-Sitzung läuft in 7 Tagen ab.</p><div style="text-align:center;margin:24px 0;padding:20px;border:2px dashed #D4AF37;border-radius:12px;background:rgba(212,175,55,0.05);"><p style="margin:0;font-size:12px;color:#999;">Dein Gutscheincode:</p><p style="margin:8px 0 0;font-size:24px;font-weight:bold;color:#D4AF37;letter-spacing:2px;">MATRIX10</p></div><p>Eine Sitzung mit Swetlana — 90 Minuten, in denen wir gemeinsam deine Zahlen entschlüsseln.</p><p><strong>Nutze deinen Gutschein jetzt, bevor er abläuft.</strong></p><p><a href="https://numerologie-pro.com/de/pakete?coupon=MATRIX10" style="color:#D4AF37;font-weight:bold;">Jetzt Sitzung buchen mit 10% Rabatt →</a></p>',
  content_html_ru = '<h2 style="color:#D4AF37;">Последнее напоминание: твой купон</h2><p>Твой купон на <strong>10% скидку</strong> на персональную нумерологическую сессию истекает через 7 дней.</p><div style="text-align:center;margin:24px 0;padding:20px;border:2px dashed #D4AF37;border-radius:12px;background:rgba(212,175,55,0.05);"><p style="margin:0;font-size:12px;color:#999;">Твой купон:</p><p style="margin:8px 0 0;font-size:24px;font-weight:bold;color:#D4AF37;letter-spacing:2px;">MATRIX10</p></div><p>Сессия со Светланой — 90 минут, в которые мы вместе расшифруем твои числа.</p><p><strong>Используй свой купон сейчас, пока он не истёк.</strong></p><p><a href="https://numerologie-pro.com/ru/pakete?coupon=MATRIX10" style="color:#D4AF37;font-weight:bold;">Записаться на сессию со скидкой 10% →</a></p>'
WHERE subject = 'Dein 10% Gutschein laeuft bald ab';


-- Re-Engagement Step 3: "Exklusiv fuer dich: 20% Rabatt"
-- Add COMEBACK20 code prominently + link with ?coupon= param
UPDATE public.email_sequence_steps SET
  content_html = '<h2 style="color:#D4AF37;">Exklusives Angebot für dich</h2><p>Ich möchte dir den Wiedereinstieg leicht machen — deshalb bekommst du einen exklusiven <strong>20% Rabatt</strong> auf ein Paket deiner Wahl.</p><div style="text-align:center;margin:24px 0;padding:20px;border:2px dashed #D4AF37;border-radius:12px;background:rgba(212,175,55,0.05);"><p style="margin:0;font-size:12px;color:#999;">Dein Gutscheincode:</p><p style="margin:8px 0 0;font-size:24px;font-weight:bold;color:#D4AF37;letter-spacing:2px;">COMEBACK20</p></div><p>Egal ob PDF-Analyse, Beziehungsmatrix oder Jahresprognose — 20% Rabatt, 100% Klarheit.</p><p><a href="https://numerologie-pro.com/de/pakete?coupon=COMEBACK20" style="color:#D4AF37;font-weight:bold;">Alle Pakete mit 20% Rabatt ansehen →</a></p><p><em>Angebot gilt 7 Tage.</em></p>',
  content_html_ru = '<h2 style="color:#D4AF37;">Особое предложение для тебя</h2><p>Хочу облегчить тебе возвращение — поэтому дарю эксклюзивную <strong>скидку 20%</strong> на любой пакет.</p><div style="text-align:center;margin:24px 0;padding:20px;border:2px dashed #D4AF37;border-radius:12px;background:rgba(212,175,55,0.05);"><p style="margin:0;font-size:12px;color:#999;">Твой купон:</p><p style="margin:8px 0 0;font-size:24px;font-weight:bold;color:#D4AF37;letter-spacing:2px;">COMEBACK20</p></div><p>Неважно, PDF-анализ, матрица отношений или годовой прогноз — 20% скидка, 100% ясность.</p><p><a href="https://numerologie-pro.com/ru/pakete?coupon=COMEBACK20" style="color:#D4AF37;font-weight:bold;">Все пакеты со скидкой 20% →</a></p><p><em>Предложение действует 7 дней.</em></p>'
WHERE subject = 'Exklusiv fuer dich: 20% Rabatt';


-- Birthday Campaign: "Alles Gute zum Geburtstag!"
-- Add BIRTHDAY20 code prominently + link with ?coupon= param
UPDATE public.email_sequence_steps SET
  content_html = '<h2 style="color:#D4AF37;">Alles Gute zum Geburtstag! 🎂</h2><p>Dein neues Lebensjahr bringt neue Energien — und ich möchte, dass du sie voll nutzen kannst.</p><p>Als Geschenk bekommst du <strong>20% Rabatt</strong> auf jede Session in deinem Geburtsmonat.</p><div style="text-align:center;margin:24px 0;padding:20px;border:2px dashed #D4AF37;border-radius:12px;background:rgba(212,175,55,0.05);"><p style="margin:0;font-size:12px;color:#999;">Dein Geburtstags-Gutschein:</p><p style="margin:8px 0 0;font-size:24px;font-weight:bold;color:#D4AF37;letter-spacing:2px;">BIRTHDAY20</p></div><p>Entdecke, was dein neues Jahr für dich bereithält:</p><p><a href="https://numerologie-pro.com/de/pakete?coupon=BIRTHDAY20" style="color:#D4AF37;font-weight:bold;">Jetzt mit 20% Rabatt buchen →</a></p><p>Alles Liebe und die besten Wünsche,<br/>Swetlana</p>',
  content_html_ru = '<h2 style="color:#D4AF37;">С днём рождения! 🎂</h2><p>Твой новый год жизни приносит новые энергии — и я хочу, чтобы ты мог(ла) использовать их на полную.</p><p>В подарок — <strong>скидка 20%</strong> на любую сессию в твоём месяце рождения.</p><div style="text-align:center;margin:24px 0;padding:20px;border:2px dashed #D4AF37;border-radius:12px;background:rgba(212,175,55,0.05);"><p style="margin:0;font-size:12px;color:#999;">Твой купон на день рождения:</p><p style="margin:8px 0 0;font-size:24px;font-weight:bold;color:#D4AF37;letter-spacing:2px;">BIRTHDAY20</p></div><p>Открой, что новый год приготовил для тебя:</p><p><a href="https://numerologie-pro.com/ru/pakete?coupon=BIRTHDAY20" style="color:#D4AF37;font-weight:bold;">Записаться со скидкой 20% →</a></p><p>С любовью и наилучшими пожеланиями,<br/>Светлана</p>'
WHERE subject = 'Alles Gute zum Geburtstag!';
