/**
 * Generates a styled PDF of all notification messages for Swetlana to review.
 * Run: node scripts/generate-review-pdf.mjs
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(__dirname, '..', 'docs', 'Alle-Nachrichten-Review.pdf');

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cormorant+Garamond:wght@600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', Arial, sans-serif;
    font-size: 11px;
    line-height: 1.6;
    color: #1a1a1a;
    padding: 40px 50px;
    background: #fff;
  }

  h1 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 28px;
    font-weight: 700;
    color: #0a1628;
    margin-bottom: 6px;
    border-bottom: 3px solid #D4AF37;
    padding-bottom: 10px;
  }

  .subtitle {
    font-size: 12px;
    color: #666;
    margin-bottom: 30px;
    font-style: italic;
  }

  h2 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 20px;
    font-weight: 700;
    color: #0a1628;
    margin-top: 32px;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 2px solid #D4AF37;
    page-break-after: avoid;
  }

  h3 {
    font-size: 13px;
    font-weight: 700;
    color: #D4AF37;
    margin-top: 20px;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    page-break-after: avoid;
  }

  .trigger {
    font-size: 10px;
    color: #888;
    font-style: italic;
    margin-bottom: 16px;
  }

  .lang-label {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    color: #fff;
    padding: 2px 8px;
    border-radius: 3px;
    margin-bottom: 6px;
    margin-top: 12px;
  }
  .lang-de { background: #1a365d; }
  .lang-ru { background: #742a2a; }

  .subject {
    font-size: 10px;
    color: #555;
    margin-bottom: 4px;
  }
  .subject strong { color: #333; }

  .message-box {
    background: #f8f7f4;
    border: 1px solid #e8e4d9;
    border-left: 3px solid #D4AF37;
    border-radius: 0 6px 6px 0;
    padding: 12px 16px;
    margin-bottom: 12px;
    font-size: 11px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-wrap: break-word;
    page-break-inside: avoid;
  }

  .message-box .bold { font-weight: 700; }
  .message-box .gold { color: #D4AF37; font-weight: 600; }
  .message-box .dim { color: #888; font-size: 10px; }
  .message-box .button {
    display: inline-block;
    background: #D4AF37;
    color: #0a1628;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    margin: 4px 0;
  }

  .vars {
    font-size: 9px;
    color: #888;
    margin-top: 4px;
    font-style: italic;
  }

  .divider {
    border: none;
    border-top: 1px solid #e0ddd4;
    margin: 24px 0;
  }

  .section-divider {
    border: none;
    border-top: 2px solid #D4AF37;
    margin: 30px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 10px;
    page-break-inside: avoid;
  }
  th {
    background: #0a1628;
    color: #D4AF37;
    padding: 6px 10px;
    text-align: left;
    font-weight: 600;
    font-size: 10px;
  }
  td {
    padding: 5px 10px;
    border-bottom: 1px solid #e8e4d9;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: #faf9f6; }

  .tone-rules { margin-top: 20px; }
  .tone-rules .correct { color: #2d6a4f; }
  .tone-rules .wrong { color: #9b2226; }

  .page-break { page-break-before: always; }

  .footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid #ddd;
    font-size: 9px;
    color: #aaa;
    text-align: center;
  }

  .channel-badge {
    display: inline-block;
    font-size: 9px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 3px;
    margin-right: 4px;
  }
  .badge-email { background: #e8f4e8; color: #2d6a4f; }
  .badge-telegram { background: #e3f2fd; color: #1565c0; }
  .badge-whatsapp { background: #e8f5e9; color: #2e7d32; }
</style>
</head>
<body>

<h1>Alle Nachrichten — Review</h1>
<p class="subtitle">Numerologie PRO — Alle automatischen Nachrichten auf Deutsch und Russisch.<br>Bitte prüfe jeden Text auf Ton, Inhalt und Korrektheit. Stand: Februar 2026</p>

<!-- ============================================================ -->
<h2>1. Buchungsbestätigung</h2>
<p class="trigger">Wird gesendet wenn ein Kunde einen Termin über Cal.com bucht.</p>

<h3><span class="channel-badge badge-email">EMAIL</span> Buchungsbestätigung</h3>

<span class="lang-label lang-de">DEUTSCH</span>
<p class="subject"><strong>Betreff:</strong> Danke für deine Buchung! — Swetlana</p>
<div class="message-box"><span class="bold">Danke für deine Buchung!</span>

Ich freue mich sehr auf unseren gemeinsamen Termin! Hier sind die Details:

<span class="gold">Datum & Uhrzeit:</span> Montag, 15. März 2026, 14:00
<span class="gold">Paket:</span> Lebensbestimmung
<span class="gold">Plattform:</span> Zoom

<span class="dim">Ich schicke dir 30 Minuten vorher noch eine Erinnerung. Bis bald! 💫 Deine Swetlana</span>

<span class="dim">Alle Details findest du auch in deinem persönlichen Bereich unter "Sitzungen".</span>

<span class="button">Mein Dashboard</span>  <span class="button">Meeting beitreten</span></div>

<span class="lang-label lang-ru">RUSSISCH</span>
<p class="subject"><strong>Тема:</strong> Спасибо за запись! — Светлана</p>
<div class="message-box"><span class="bold">Спасибо за запись!</span>

Я очень жду нашу встречу! Вот детали:

<span class="gold">Дата и время:</span> Понедельник, 15 марта 2026, 14:00
<span class="gold">Пакет:</span> Предназначение
<span class="gold">Платформа:</span> Zoom

<span class="dim">Я пришлю тебе напоминание за 30 минут. До встречи! 💫 Твоя Светлана</span>

<span class="dim">Все детали также доступны в твоём личном кабинете в разделе "Сессии".</span>

<span class="button">Мой кабинет</span>  <span class="button">Войти в встречу</span></div>

<hr class="divider">

<h3><span class="channel-badge badge-telegram">TELEGRAM</span> Buchungsbestätigung</h3>

<span class="lang-label lang-de">DEUTSCH</span>
<div class="message-box">✅ <span class="bold">Danke für deine Buchung, ich freue mich sehr auf unseren Termin!</span>

📍 Lebensbestimmung
⏰ Montag, 15. März, 14:00

👉 Dein persönlicher Bereich:
https://numerologie-pro.com/de/dashboard/sitzungen

Bis bald! 💫
Deine Swetlana

<span class="button">🔗 Meeting beitreten</span></div>

<span class="lang-label lang-ru">RUSSISCH</span>
<div class="message-box">✅ <span class="bold">Спасибо за запись, я очень жду нашу встречу!</span>

📍 Предназначение
⏰ Понедельник, 15 марта, 14:00

👉 Твой личный кабинет:
https://numerologie-pro.com/ru/dashboard/sitzungen

До встречи! 💫
Твоя Светлана

<span class="button">🔗 Войти в встречу</span></div>

<hr class="divider">

<h3><span class="channel-badge badge-whatsapp">WHATSAPP</span> Buchungsbestätigung</h3>
<p class="vars">Template: booking_confirmation — Variablen: {{1}}=Paket, {{2}}=Datum, {{3}}=Zoom-Link, {{4}}=Dashboard-URL</p>

<span class="lang-label lang-de">DEUTSCH</span>
<div class="message-box">✅ Danke für deine Buchung, ich freue mich sehr auf unseren Termin!

📍 {{1}}
⏰ {{2}}
🔗 Zoom: {{3}}

Dein persönlicher Bereich: {{4}}
Dort findest du alle Details zu deiner Sitzung.

Bis bald! 💫
Deine Swetlana</div>

<span class="lang-label lang-ru">RUSSISCH</span>
<div class="message-box">✅ Спасибо за запись, я очень жду нашу встречу!

📍 {{1}}
⏰ {{2}}
🔗 Zoom: {{3}}

Твой личный кабинет: {{4}}
Там ты найдёшь все детали по сессии.

До встречи! 💫
Твоя Светлана</div>

<!-- ============================================================ -->
<hr class="section-divider">
<h2>2. Session-Erinnerung (30 Min. vor Termin)</h2>
<p class="trigger">Wird automatisch per Cron-Job gesendet, wenn der Termin in weniger als 24h stattfindet.</p>

<h3><span class="channel-badge badge-email">EMAIL</span> Session-Erinnerung</h3>

<span class="lang-label lang-de">DEUTSCH</span>
<p class="subject"><strong>Betreff:</strong> Unser Termin startet gleich! — Swetlana</p>
<div class="message-box"><span class="bold">Gleich geht es los!</span>

Unser Termin beginnt in 30 Minuten — ich freue mich schon auf dich!

<span class="gold">Datum & Uhrzeit:</span> Montag, 15. März 2026, 14:00
<span class="gold">Paket:</span> Lebensbestimmung

<span class="button">Jetzt Meeting beitreten</span>

<span class="dim">Bitte stelle sicher, dass du eine ruhige Umgebung hast und dein Mikrofon & Kamera funktionieren. Deine Swetlana 💫</span></div>

<span class="lang-label lang-ru">RUSSISCH</span>
<p class="subject"><strong>Тема:</strong> Наша встреча скоро! — Светлана</p>
<div class="message-box"><span class="bold">Скоро начинаем!</span>

Наша встреча начнётся через 30 минут — я уже жду тебя!

<span class="gold">Дата и время:</span> Понедельник, 15 марта 2026, 14:00
<span class="gold">Пакет:</span> Предназначение

<span class="button">Войти в встречу</span>

<span class="dim">Пожалуйста, убедись, что ты в тихом месте и что твой микрофон и камера работают. Твоя Светлана 💫</span></div>

<hr class="divider">

<h3><span class="channel-badge badge-telegram">TELEGRAM</span> Session-Erinnerung</h3>

<span class="lang-label lang-de">DEUTSCH</span>
<div class="message-box">🗓 <span class="bold">Hey! Unser Termin ist heute!</span>

📍 Lebensbestimmung
⏰ Montag, 15. März, 14:00

Ich freue mich auf dich! 💫
Deine Swetlana

<span class="button">🔗 Meeting beitreten</span></div>

<span class="lang-label lang-ru">RUSSISCH</span>
<div class="message-box">🗓 <span class="bold">Привет! Наша встреча сегодня!</span>

📍 Предназначение
⏰ Понедельник, 15 марта, 14:00

Жду тебя! 💫
Твоя Светлана

<span class="button">🔗 Войти в встречу</span></div>

<hr class="divider">

<h3><span class="channel-badge badge-whatsapp">WHATSAPP</span> Session-Erinnerung</h3>
<p class="vars">Template: session_reminder — Variablen: {{1}}=Paket, {{2}}=Datum, {{3}}=Zoom-Link</p>

<span class="lang-label lang-de">DEUTSCH</span>
<div class="message-box">🗓 Hey! Unser Termin ist heute!

📍 {{1}}
⏰ {{2}}
🔗 Zoom: {{3}}

Ich freue mich auf dich! 💫
Deine Swetlana</div>

<span class="lang-label lang-ru">RUSSISCH</span>
<div class="message-box">🗓 Привет! Наша встреча сегодня!

📍 {{1}}
⏰ {{2}}
🔗 Zoom: {{3}}

Жду тебя! 💫
Твоя Светлана</div>

<!-- ============================================================ -->
<hr class="section-divider">
<h2>3. Stornierung</h2>
<p class="trigger">Wird gesendet wenn ein Termin über Cal.com storniert wird.</p>

<h3><span class="channel-badge badge-telegram">TELEGRAM</span> Stornierung</h3>

<span class="lang-label lang-de">DEUTSCH</span>
<div class="message-box">❌ Schade, dein Termin wurde storniert.

Falls du einen neuen Termin buchen möchtest, schau hier: /pakete

Ich bin jederzeit für dich da! 💛
Deine Swetlana</div>

<span class="lang-label lang-ru">RUSSISCH</span>
<div class="message-box">❌ К сожалению, твоя сессия отменена.

Если хочешь записаться снова: /pakete

Я всегда на связи! 💛
Твоя Светлана</div>

<hr class="divider">

<h3><span class="channel-badge badge-whatsapp">WHATSAPP</span> Stornierung</h3>
<p class="vars">Template: booking_cancelled — Variablen: {{1}}=Pakete-URL</p>

<span class="lang-label lang-de">DEUTSCH</span>
<div class="message-box">❌ Schade, dein Termin wurde storniert.

Falls du einen neuen Termin buchen möchtest:
{{1}}

Ich bin jederzeit für dich da! 💛
Deine Swetlana</div>

<span class="lang-label lang-ru">RUSSISCH</span>
<div class="message-box">❌ К сожалению, твоя сессия отменена.

Если хочешь записаться снова:
{{1}}

Я всегда на связи! 💛
Твоя Светлана</div>

<!-- ============================================================ -->
<hr class="section-divider">
<h2>4. PDF-Zustellung</h2>
<p class="trigger">Wird gesendet nachdem der Kunde eine PDF-Analyse gekauft hat und die PDF generiert wurde.</p>

<h3><span class="channel-badge badge-email">EMAIL</span> PDF-Zustellung</h3>

<span class="lang-label lang-de">DEUTSCH</span>
<p class="subject"><strong>Betreff:</strong> Dein PDF ist fertig! — Swetlana</p>
<div class="message-box"><span class="bold">Dein PDF ist fertig!</span>

Danke für dein Vertrauen! Ich habe deine persönliche Psychomatrix-Analyse erstellt — du findest sie im Anhang.

<span class="gold">Geburtsdatum:</span> 15.03.1990

<span class="dim">Deine PDF-Datei ist als Anhang beigefügt. Du kannst sie auch jederzeit in deinem Dashboard unter "Unterlagen" herunterladen.</span>

<span class="button">Meine Unterlagen ansehen</span>

──────────────────────

<span class="dim">Möchtest du die Ergebnisse gemeinsam besprechen? Buch dir einen Termin mit mir — ich freue mich darauf! Deine Swetlana 💫</span>

<span class="button">Kostenlose Beratung buchen</span></div>

<span class="lang-label lang-ru">RUSSISCH</span>
<p class="subject"><strong>Тема:</strong> Твой PDF готов! — Светлана</p>
<div class="message-box"><span class="bold">Твой PDF готов!</span>

Спасибо за доверие! Я подготовила твой персональный анализ психоматрицы — он в приложении к письму.

<span class="gold">Дата рождения:</span> 15.03.1990

<span class="dim">Твой PDF-файл прикреплён к этому письму. Ты также можешь скачать его в любое время в разделе "Документы" в личном кабинете.</span>

<span class="button">Мои документы</span>

──────────────────────

<span class="dim">Хочешь обсудить результаты вместе? Запишись на консультацию — буду рада! Твоя Светлана 💫</span>

<span class="button">Записаться на бесплатную консультацию</span></div>

<hr class="divider">

<h3><span class="channel-badge badge-telegram">TELEGRAM</span> PDF-Zustellung</h3>

<span class="lang-label lang-de">DEUTSCH</span>
<div class="message-box">📄 <span class="bold">Dein PDF "Psychomatrix PDF-Analyse" ist fertig!</span>

Ich habe es dir auch per E-Mail geschickt. Du kannst es jederzeit in deinem Dashboard herunterladen.

Möchtest du die Ergebnisse gemeinsam besprechen? Buch dir einen Termin mit mir! 💫
Deine Swetlana</div>

<span class="lang-label lang-ru">RUSSISCH</span>
<div class="message-box">📄 <span class="bold">Твой PDF "PDF-Анализ Психоматрицы" готов!</span>

Я также отправила его на email. Скачать можно в любое время в личном кабинете.

Хочешь обсудить результаты вместе? Запишись на консультацию! 💫
Твоя Светлана</div>

<hr class="divider">

<h3><span class="channel-badge badge-whatsapp">WHATSAPP</span> PDF-Zustellung</h3>
<p class="vars">Template: pdf_delivery — Variablen: {{1}}=PDF-Titel, {{2}}=Dashboard-URL</p>

<span class="lang-label lang-de">DEUTSCH</span>
<div class="message-box">📄 Dein PDF "{{1}}" ist fertig!

Ich habe es dir auch per E-Mail geschickt. Du kannst es jederzeit herunterladen:
{{2}}

Möchtest du die Ergebnisse gemeinsam besprechen? Buch dir einen Termin mit mir! 💫
Deine Swetlana</div>

<span class="lang-label lang-ru">RUSSISCH</span>
<div class="message-box">📄 Твой PDF "{{1}}" готов!

Я также отправила его на email. Скачать можно в любое время:
{{2}}

Хочешь обсудить результаты вместе? Запишись на консультацию! 💫
Твоя Светлана</div>

<!-- ============================================================ -->
<div class="page-break"></div>
<h2>5. Bestellbestätigung (nach Zahlung)</h2>
<p class="trigger">Wird gesendet nachdem die Stripe-Zahlung erfolgreich war.</p>

<h3><span class="channel-badge badge-email">EMAIL</span> Bestellbestätigung</h3>

<span class="lang-label lang-de">DEUTSCH</span>
<p class="subject"><strong>Betreff:</strong> Danke für deine Buchung! — Swetlana</p>
<div class="message-box"><span class="bold">Vielen Dank, Lisa!</span>

Deine Zahlung wurde erfolgreich verarbeitet. Ich freue mich, dich auf deiner numerologischen Reise zu begleiten!

<span class="gold">Paket:</span> Lebensbestimmung
<span class="gold">Betrag:</span> 99,00 €

Ich melde mich in Kürze bei dir, um einen Termin zu vereinbaren. Alle Details findest du in deinem persönlichen Bereich.

<span class="button">Mein Bereich öffnen</span>

<span class="dim">Bei Fragen schreib mir an info@numerologie-pro.com — ich bin für dich da! 💫 Deine Swetlana</span></div>

<span class="lang-label lang-ru">RUSSISCH</span>
<p class="subject"><strong>Тема:</strong> Спасибо за заказ! — Светлана</p>
<div class="message-box"><span class="bold">Спасибо, Lisa!</span>

Твой платёж успешно обработан. Я рада сопровождать тебя на твоём нумерологическом пути!

<span class="gold">Пакет:</span> Предназначение
<span class="gold">Сумма:</span> 99,00 €

Я свяжусь с тобой в ближайшее время для согласования даты. Все детали доступны в твоём личном кабинете.

<span class="button">Открыть кабинет</span>

<span class="dim">По вопросам пиши мне на info@numerologie-pro.com — я на связи! 💫 Твоя Светлана</span></div>

<!-- ============================================================ -->
<hr class="section-divider">
<h2>6. Kontaktformular-Bestätigung</h2>
<p class="trigger">Wird gesendet wenn jemand das Kontaktformular auf der Website ausfüllt.</p>

<h3><span class="channel-badge badge-email">EMAIL</span> Kontaktbestätigung</h3>

<span class="lang-label lang-de">DEUTSCH</span>
<p class="subject"><strong>Betreff:</strong> Danke für deine Nachricht! — Swetlana</p>
<div class="message-box"><span class="bold">Danke, Lisa!</span>

Deine Nachricht ist bei mir angekommen. Ich melde mich innerhalb von <span class="gold">24 Stunden</span> persönlich bei dir.

Numerologie öffnet eine neue Perspektive auf dein Leben — ich freue mich, dich auf diesem Weg zu begleiten. 💫 Deine Swetlana

<span class="dim">Bei Fragen erreichst du mich unter:</span>
<span class="gold">info@numerologie-pro.com</span>

<span class="button">Zur Website</span></div>

<span class="lang-label lang-ru">RUSSISCH</span>
<p class="subject"><strong>Тема:</strong> Спасибо за сообщение! — Светлана</p>
<div class="message-box"><span class="bold">Спасибо, Lisa!</span>

Твоё сообщение получено. Я отвечу тебе лично в течение <span class="gold">24 часов</span>.

Нумерология открывает новый взгляд на твою жизнь — я рада помочь тебе на этом пути. 💫 Твоя Светлана

<span class="dim">По вопросам вы можете связаться:</span>
<span class="gold">info@numerologie-pro.com</span>

<span class="button">На сайт</span></div>

<!-- ============================================================ -->
<hr class="section-divider">
<h2>7. Lead-Welcome (nach Rechner-Nutzung)</h2>
<p class="trigger">Wird gesendet wenn ein Besucher den kostenlosen Numerologie-Rechner benutzt hat.</p>

<h3><span class="channel-badge badge-email">EMAIL</span> Lead-Welcome</h3>

<span class="lang-label lang-de">DEUTSCH</span>
<p class="subject"><strong>Betreff:</strong> Deine Zahlen haben eine Botschaft — Swetlana</p>
<div class="message-box"><span class="bold">Deine Zahlen sprechen</span>

Schön, dass du den Numerologie-Rechner ausprobiert hast! Hinter jedem Geburtsdatum verbirgt sich eine Botschaft — über deine Stärken, dein Potenzial und deinen Lebensweg.

In einer <span class="gold">persönlichen Beratung</span> gehen wir gemeinsam tiefer: Ich zeige dir, wie deine Zahlen zusammenwirken und welche Chancen sich gerade jetzt öffnen.

<span class="button">Beratung mit mir buchen</span>

<span class="dim">Ich freue mich auf dich! 💫 Deine Swetlana</span></div>

<span class="lang-label lang-ru">RUSSISCH</span>
<p class="subject"><strong>Тема:</strong> Твои числа несут послание — Светлана</p>
<div class="message-box"><span class="bold">Твои числа говорят</span>

Рада, что ты воспользовался нумерологическим калькулятором! За каждой датой рождения скрывается послание — о твоих силах, потенциале и жизненном пути.

На <span class="gold">персональной консультации</span> мы пойдём глубже вместе: я покажу, как твои числа взаимодействуют и какие возможности открываются прямо сейчас.

<span class="button">Записаться на консультацию</span>

<span class="dim">Буду рада! 💫 Твоя Светлана</span></div>

<!-- ============================================================ -->
<hr class="section-divider">
<h2>8. Upsell-Email (48h nach PDF-Kauf)</h2>
<p class="trigger">Wird automatisch 48h nach dem PDF-Kauf gesendet, wenn der Kunde noch keine Beratung gebucht hat.</p>

<h3><span class="channel-badge badge-email">EMAIL</span> Upsell</h3>

<span class="lang-label lang-de">DEUTSCH</span>
<p class="subject"><strong>Betreff:</strong> Bereit für den nächsten Schritt? — Swetlana</p>
<div class="message-box"><span class="bold">Bereit für den nächsten Schritt?</span>

Du hast deine Psychomatrix-PDF erhalten — großartig! Aber die PDF zeigt dir nur die Oberfläche. In einer persönlichen 90-Minuten-Beratung entdecken wir gemeinsam:

• Die verborgenen Zusammenhänge zwischen deinen Zahlen
• Konkrete Handlungsempfehlungen für dein Leben
• Antworten auf deine persönlichen Fragen
• Beziehungs-, Berufs- oder Wachstumsanalyse nach Wahl

<span class="dim">"Ich war zuerst skeptisch, aber Swetlana hat Dinge gesehen, die kein Test zeigen kann. Die Beratung hat mir Klarheit gegeben." — Ljudmila K.</span>

<span class="gold">Exklusiv für dich: 10% Rabatt</span>
Als Dankeschön für deine PDF-Bestellung erhältst du 10% Rabatt auf deine erste Live-Beratung. Nutze den Code beim Checkout:

<span class="bold" style="font-size:16px; color:#D4AF37;">MATRIX10</span>

<span class="button">Jetzt Beratung buchen (99€ → 89,10€)</span>

Noch unsicher? Buch dir zuerst eine kostenlose 15-Minuten-Beratung mit mir. Ich freue mich! 💫 Deine Swetlana

<span class="button">Kostenlose Erstberatung mit mir</span></div>

<span class="lang-label lang-ru">RUSSISCH</span>
<p class="subject"><strong>Тема:</strong> Готов к следующему шагу? — Светлана</p>
<div class="message-box"><span class="bold">Готов к следующему шагу?</span>

Ты получил свой PDF-анализ психоматрицы — отлично! Но PDF показывает лишь поверхность. На персональной 90-минутной консультации мы вместе откроем:

• Скрытые связи между твоими числами
• Конкретные рекомендации для твоей жизни
• Ответы на твои личные вопросы
• Анализ отношений, карьеры или личностного роста — на выбор

<span class="dim">"Сначала я скептически относилась, но Светлана увидела то, что не покажет ни один тест. Консультация дала мне ясность." — Людмила К.</span>

<span class="gold">Эксклюзивно для тебя: скидка 10%</span>
В благодарность за покупку PDF-анализа — скидка 10% на первую живую консультацию. Используй код при оплате:

<span class="bold" style="font-size:16px; color:#D4AF37;">MATRIX10</span>

<span class="button">Записаться на консультацию (99€ → 89,10€)</span>

Ещё не уверен? Запишись на бесплатную 15-минутную консультацию со мной. Буду рада! 💫 Твоя Светлана

<span class="button">Бесплатная консультация со мной</span></div>

<!-- ============================================================ -->
<hr class="section-divider">
<h2>9. WhatsApp Auto-Antwort</h2>
<p class="trigger">Wird gesendet wenn ein Kunde eine Nachricht über WhatsApp schreibt.</p>

<h3><span class="channel-badge badge-whatsapp">WHATSAPP</span> Auto-Antwort</h3>

<span class="lang-label lang-de">DEUTSCH</span>
<div class="message-box">Danke für deine Nachricht! Ich melde mich so schnell wie möglich bei dir. 💫 Deine Swetlana</div>

<span class="lang-label lang-ru">RUSSISCH</span>
<div class="message-box">Спасибо за сообщение! Я отвечу тебе как можно скорее. 💫 Твоя Светлана</div>

<!-- ============================================================ -->
<div class="page-break"></div>
<h2>10. Telegram Bot — Alle Befehle</h2>
<p class="trigger">Texte die der Telegram-Bot den Nutzern zeigt.</p>

<h3>/start — Neuer Nutzer</h3>
<span class="lang-label lang-de">DE</span>
<div class="message-box">🌟 Willkommen bei Numerologie PRO!

Ich bin Swetlana, deine persönliche Numerologin. Was kann ich für dich tun?</div>
<span class="lang-label lang-ru">RU</span>
<div class="message-box">🌟 Добро пожаловать в Нумерология PRO!

Я Светлана, твой персональный нумеролог. Чем могу помочь?</div>

<h3>/start — Bekannter Nutzer</h3>
<span class="lang-label lang-de">DE</span>
<div class="message-box">Willkommen zurück, {Name}! 🌟
Schön, dass du da bist. Was kann ich für dich tun?
Deine Swetlana</div>
<span class="lang-label lang-ru">RU</span>
<div class="message-box">С возвращением, {Name}! 🌟
Рада тебя видеть. Чем могу помочь?
Твоя Светлана</div>

<h3>/start — Konto verbunden</h3>
<span class="lang-label lang-de">DE</span>
<div class="message-box">✅ Perfekt, {Name}! Dein Telegram ist jetzt mit deinem Konto verbunden.

Du erhältst ab sofort Erinnerungen und PDFs auch hier.
Deine Swetlana</div>
<span class="lang-label lang-ru">RU</span>
<div class="message-box">✅ Отлично, {Name}! Твой Telegram теперь привязан к аккаунту.

Теперь ты будешь получать напоминания и PDF также здесь.
Твоя Светлана</div>

<h3>/analyse — Eingabeaufforderung</h3>
<span class="lang-label lang-de">DE</span>
<div class="message-box">🔮 Gib mir dein Geburtsdatum (TT.MM.JJJJ) und ich berechne deine Schicksalszahl!

Beispiel: 15.03.1990</div>
<span class="lang-label lang-ru">RU</span>
<div class="message-box">🔮 Напиши мне дату рождения (ДД.ММ.ГГГГ) и я рассчитаю твоё число судьбы!

Пример: 15.03.1990</div>

<h3>/analyse — Ergebnis</h3>
<span class="lang-label lang-de">DE</span>
<div class="message-box">🔮 <span class="bold">Deine Schicksalszahl: {Zahl}</span>

{Beschreibung}

💫 Möchtest du die vollständige 12-seitige Analyse? Ich erstelle sie persönlich für dich!</div>
<span class="lang-label lang-ru">RU</span>
<div class="message-box">🔮 <span class="bold">Твоё число судьбы: {Число}</span>

{Описание}

💫 Хочешь получить полный 12-страничный анализ? Я подготовлю его лично для тебя!</div>

<h3>/kompatibel</h3>
<span class="lang-label lang-de">DE</span>
<div class="message-box">💕 Gib mir zwei Geburtsdaten, getrennt durch ein Komma, und ich prüfe eure Kompatibilität!

Beispiel: 15.03.1990, 22.07.1988</div>
<span class="lang-label lang-ru">RU</span>
<div class="message-box">💕 Напиши мне две даты рождения через запятую и я проверю вашу совместимость!

Пример: 15.03.1990, 22.07.1988</div>

<h3>/heute — Tageszahl</h3>
<span class="lang-label lang-de">DE</span>
<div class="message-box">✨ <span class="bold">Deine persönliche Tageszahl: {Zahl}</span>

{Beschreibung}

Deine Swetlana 💫</div>
<span class="lang-label lang-ru">RU</span>
<div class="message-box">✨ <span class="bold">Твоё личное число дня: {Число}</span>

{Описание}

Твоя Светлана 💫</div>

<h3>/meinepdfs — Keine PDFs</h3>
<span class="lang-label lang-de">DE</span>
<div class="message-box">📂 Du hast noch keine PDFs.

Entdecke meine Analysen und starte deine Numerologie-Reise! 💫</div>
<span class="lang-label lang-ru">RU</span>
<div class="message-box">📂 У тебя ещё нет PDF.

Открой мои анализы и начни свой нумерологический путь! 💫</div>

<h3>/termin — Kein Termin</h3>
<span class="lang-label lang-de">DE</span>
<div class="message-box">📅 Du hast aktuell keinen geplanten Termin.

Buch dir eine Beratung unter /pakete — ich freue mich auf dich!</div>
<span class="lang-label lang-ru">RU</span>
<div class="message-box">📅 У тебя сейчас нет запланированной сессии.

Запишись на консультацию через /pakete — буду рада!</div>

<h3>/termin — Hat Termin</h3>
<span class="lang-label lang-de">DE</span>
<div class="message-box">📅 <span class="bold">Dein nächster Termin</span>

📍 Lebensbestimmung
⏰ Montag, 15. März, 14:00
🔗 Meeting beitreten

Ich freue mich auf dich! 💫
Deine Swetlana</div>
<span class="lang-label lang-ru">RU</span>
<div class="message-box">📅 <span class="bold">Твоя следующая сессия</span>

📍 Предназначение
⏰ Понедельник, 15 марта, 14:00
🔗 Войти в встречу

Жду тебя! 💫
Твоя Светлана</div>

<h3>/pakete</h3>
<span class="lang-label lang-de">DE</span>
<div class="message-box">🛍️ <span class="bold">Meine Pakete für dich:</span>

<span class="bold">Lebensbestimmung</span> — 99,00 €
Deine Lebensaufgabe, Talente und Potenziale
...</div>
<span class="lang-label lang-ru">RU</span>
<div class="message-box">🛍️ <span class="bold">Мои пакеты для тебя:</span>

<span class="bold">Предназначение</span> — 99,00 €
Твоя жизненная задача, таланты и потенциал
...</div>

<h3>/empfehlen</h3>
<span class="lang-label lang-de">DE</span>
<div class="message-box">🎁 <span class="bold">Dein persönlicher Empfehlungs-Link:</span>

https://numerologie-pro.com/?ref={CODE}

Teile ihn mit Freunden — als Dankeschön bekommst du für jede Buchung einen 15%-Gutschein! 🎉

📊 Einladungen: 3 | Davon gebucht: 1</div>
<span class="lang-label lang-ru">RU</span>
<div class="message-box">🎁 <span class="bold">Твоя персональная реферальная ссылка:</span>

https://numerologie-pro.com/?ref={КОД}

Поделись с друзьями — в благодарность за каждую покупку ты получишь купон на 15%! 🎉

📊 Приглашений: 3 | Из них купили: 1</div>

<h3>/hilfe</h3>
<span class="lang-label lang-de">DE</span>
<div class="message-box">📋 <span class="bold">Was ich für dich tun kann:</span>

/analyse — Kostenlose Mini-Analyse deiner Schicksalszahl
/kompatibel — Beziehungs-Kompatibilitäts-Check
/heute — Deine persönliche Tageszahl
/meinepdfs — Alle deine PDFs erneut senden
/termin — Deinen nächsten Termin anzeigen
/pakete — Meine Pakete mit Preisen
/empfehlen — Dein Empfehlungs-Link
/hilfe — Diese Übersicht

💬 Schreib mir einfach — ich bin für dich da!
Deine Swetlana</div>
<span class="lang-label lang-ru">RU</span>
<div class="message-box">📋 <span class="bold">Чем я могу тебе помочь:</span>

/analyse — Бесплатный мини-анализ числа судьбы
/kompatibel — Проверка совместимости
/heute — Твоё личное число дня
/meinepdfs — Отправить все твои PDF
/termin — Показать следующую сессию
/pakete — Мои пакеты с ценами
/empfehlen — Твоя реферальная ссылка
/hilfe — Эта справка

💬 Просто напиши мне — я на связи!
Твоя Светлана</div>

<h3>FAQ — Freitext / Stornierung / Preise / Kontakt / Datenschutz</h3>

<table>
<tr>
  <th>Thema</th>
  <th>Deutsch</th>
  <th>Russisch</th>
</tr>
<tr>
  <td>Freitext</td>
  <td>📨 Danke für deine Nachricht! Ich melde mich so schnell wie möglich bei dir. Deine Swetlana</td>
  <td>📨 Спасибо за сообщение! Я отвечу тебе как можно скорее. Твоя Светлана</td>
</tr>
<tr>
  <td>Stornierung</td>
  <td>📋 Für Stornierungen schreib mir an info@numerologie-pro.com oder nutze den Widerruf-Link in deiner Bestätigungs-E-Mail.</td>
  <td>📋 Для отмены напиши мне на info@numerologie-pro.com или используй ссылку отмены в письме-подтверждении.</td>
</tr>
<tr>
  <td>Preise</td>
  <td>💰 Alle Preise und Pakete findest du unter /pakete oder auf meiner Website: numerologie-pro.com/de/pakete</td>
  <td>💰 Все цены и пакеты ты найдёшь через /pakete или на моём сайте: numerologie-pro.com/ru/pakete</td>
</tr>
<tr>
  <td>Kontakt</td>
  <td>📞 So erreichst du mich: 📧 info@numerologie-pro.com 🌐 numerologie-pro.com — Deine Swetlana 💛</td>
  <td>📞 Мои контакты: 📧 info@numerologie-pro.com 🌐 numerologie-pro.com — Твоя Светлана 💛</td>
</tr>
<tr>
  <td>Datenschutz</td>
  <td>🔒 Datenschutz: numerologie-pro.com/de/datenschutz</td>
  <td>🔒 Конфиденциальность: numerologie-pro.com/ru/datenschutz</td>
</tr>
</table>

<h3>Telegram Buttons</h3>
<table>
<tr><th>Button</th><th>Deutsch</th><th>Russisch</th></tr>
<tr><td>Analyse</td><td>🔮 Kostenlose Analyse</td><td>🔮 Бесплатный анализ</td></tr>
<tr><td>Pakete</td><td>🛍️ Pakete ansehen</td><td>🛍️ Посмотреть пакеты</td></tr>
<tr><td>Konto</td><td>🔗 Konto verbinden</td><td>🔗 Привязать аккаунт</td></tr>
<tr><td>PDF</td><td>📄 PDF kaufen (9,99 €)</td><td>📄 Купить PDF (9,99 €)</td></tr>
<tr><td>Beratung</td><td>📅 Beratung buchen</td><td>📅 Записаться</td></tr>
<tr><td>PDFs</td><td>📂 Meine PDFs</td><td>📂 Мои PDF</td></tr>
</table>

<!-- ============================================================ -->
<hr class="section-divider">
<h2>11. Admin-Benachrichtigungen (intern)</h2>

<h3>Email — Neue Buchung (an Swetlana)</h3>
<p class="subject"><strong>Betreff:</strong> Neuer Termin: Lebensbestimmung (BEZAHLT) — Lisa Müller</p>
<div class="message-box"><span class="bold">Neuer Termin gebucht!</span>

<span class="bold">Lisa Müller</span> hat einen Termin gebucht.

<span class="gold">Typ:</span> BEZAHLT
<span class="gold">Paket:</span> Lebensbestimmung
<span class="gold">Datum:</span> Montag, 15. März 2026, 14:00
<span class="gold">E-Mail:</span> lisa@example.com
<span class="gold">Meeting:</span> https://zoom.us/j/...</div>

<h3>Telegram — Referral-Benachrichtigung</h3>
<span class="lang-label lang-de">DE</span>
<div class="message-box">🎉 <span class="bold">Deine Empfehlung hat gebucht!</span>

Dein 15%-Gutschein wird erstellt. Danke fürs Weiterempfehlen!</div>
<span class="lang-label lang-ru">RU</span>
<div class="message-box">🎉 <span class="bold">Твой приглашённый купил!</span>

Твой купон на 15% будет создан. Спасибо за рекомендацию!</div>

<!-- ============================================================ -->
<hr class="section-divider">
<h2>Ton-Regeln — Zusammenfassung</h2>

<table class="tone-rules">
<tr><th>✅ Richtig</th><th>❌ Falsch</th></tr>
<tr><td class="correct">"Ich freue mich auf unseren Termin!"</td><td class="wrong">"Swetlana freut sich auf dich!"</td></tr>
<tr><td class="correct">"Buch dir einen Termin mit mir"</td><td class="wrong">"Buchen Sie einen Termin"</td></tr>
<tr><td class="correct">"Deine Swetlana" / "Твоя Светлана"</td><td class="wrong">"Das Numerologie PRO Team"</td></tr>
<tr><td class="correct">"Ich melde mich bei dir"</td><td class="wrong">"Sie werden kontaktiert"</td></tr>
<tr><td class="correct">Du-Form überall</td><td class="wrong">Sie-Form nirgendwo</td></tr>
<tr><td class="correct">"Ich bin Swetlana, deine Numerologin"</td><td class="wrong">"Ich bin dein Numerologie-Assistent"</td></tr>
</table>

<div class="footer">
  Numerologie PRO — Alle Nachrichten-Review — Stand Februar 2026<br>
  Bei Änderungswünschen bitte direkt im Dokument markieren oder Danil mitteilen.
</div>

</body>
</html>`;

async function main() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });

  console.log('Generating PDF...');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="width:100%; text-align:center; font-size:8px; color:#bbb; font-family:Arial;">
        <span>Seite <span class="pageNumber"></span> von <span class="totalPages"></span></span>
      </div>
    `,
  });

  await browser.close();
  console.log('PDF saved to:', outputPath);
}

main().catch(console.error);
