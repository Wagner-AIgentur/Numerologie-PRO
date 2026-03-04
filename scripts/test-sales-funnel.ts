/**
 * Sales Funnel Test Script
 * Tests each email sequence and automation step by step.
 * Sends REAL emails to the test address.
 *
 * Usage:
 *   npx tsx scripts/test-sales-funnel.ts <step>
 *
 * Steps:
 *   profile    — Create/verify test profile
 *   nurture-1  — Lead Nurture: Email 1 "Deine Zahlen sprechen"
 *   nurture-2  — Lead Nurture: Email 2 "Schicksalszahl"
 *   nurture-3  — Lead Nurture: Email 3 "PDF Report"
 *   nurture-4  — Lead Nurture: Email 4 "Kunden-Testimonials"
 *   nurture-5  — Lead Nurture: Email 5 "Report wartet"
 *   upsell-1   — PDF Upsell: Email 1 "Verborgene Botschaften"
 *   upsell-2   — PDF Upsell: Email 2 "Was bringt 2026"
 *   upsell-3   — PDF Upsell: Email 3 "Swetlana kennenlernen"
 *   upsell-4   — PDF Upsell: Email 4 "Gutschein läuft ab"
 *   session-1   — Post-Session: Email 1 "Danke"
 *   session-2   — Post-Session: Email 2 "Teile Erfahrung"
 *   session-3   — Post-Session: Email 3 "Empfehlung"
 *   session-4   — Post-Session: Email 4 "Nächstes Paket"
 *   session-5   — Post-Session: Email 5 "Monats-Update"
 *   reeng-1    — Re-Engagement: Email 1 "Wir vermissen dich"
 *   reeng-2    — Re-Engagement: Email 2 "Matrix verändert"
 *   reeng-3    — Re-Engagement: Email 3 "20% Rabatt"
 *   birthday   — Birthday: "Alles Gute!"
 *   cart       — Abandoned Cart Recovery Email
 *   all        — Alle Emails nacheinander (5s Pause dazwischen)
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';

// ─── Load env ───
const scriptDir = typeof __dirname !== 'undefined' ? __dirname : dirname(new URL(import.meta.url).pathname);
function loadEnvFile(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch { /* skip */ }
}
loadEnvFile(resolve(scriptDir, '../.env.production.local'));
loadEnvFile(resolve(scriptDir, '../.env.local'));

// ─── Config ───
const TEST_EMAIL = 'test@example.com';
const TEST_BIRTHDATE = '04.11.1990'; // DD.MM.YYYY
const LOCALE = 'de';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendKey = process.env.RESEND_API_KEY!;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@numerologie-pro.com';

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendKey);

// ─── Email Template Helpers (inline version of lib/email/templates/base.ts) ───
function baseTemplate({ title, preheader, content }: { title: string; preheader: string; content: string }): string {
  return `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { background-color: #051a24 !important; font-family: 'Montserrat', Arial, sans-serif; color: #e8e4d9; }
    u + .body { background-color: #051a24 !important; }
  </style>
</head>
<body class="body" bgcolor="#051a24" style="background-color:#051a24; margin:0; padding:0;">
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#051a24;">${preheader}</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#051a24" style="background-color:#051a24; min-height:100vh;">
    <tr>
      <td align="center" bgcolor="#051a24" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a2533" style="max-width:600px; width:100%; background-color:#0a2533; border-radius:16px; border:1px solid #2a4a3a;">
          <tr><td bgcolor="#D4AF37" style="background:#D4AF37; height:4px; font-size:0;">&nbsp;</td></tr>
          <tr>
            <td align="center" bgcolor="#0a2533" style="padding:36px 40px 24px;">
              <div style="font-family:'Cormorant Garamond', Georgia, serif; font-size:26px; font-weight:700; color:#D4AF37; letter-spacing:2px;">
                NUMEROLOGIE <span style="color:#ECC558;">PRO</span>
              </div>
              <div style="margin-top:6px; width:60px; height:2px; background:#D4AF37; margin-left:auto; margin-right:auto;"></div>
              <div style="margin-top:8px; font-family:'Montserrat', Arial, sans-serif; font-size:11px; font-weight:500; color:#8a8778; letter-spacing:3px; text-transform:uppercase;">
                Swetlana Wagner
              </div>
            </td>
          </tr>
          <tr><td bgcolor="#0a2533" style="padding:0 40px 40px;">${content}</td></tr>
          <tr><td bgcolor="#0a2533" style="padding:0 40px;"><div style="height:1px; background:#1a3a2e;"></div></td></tr>
          <tr>
            <td align="center" bgcolor="#0a2533" style="padding:20px 40px;">
              <p style="font-family:'Montserrat',Arial,sans-serif; font-size:10px; color:#4a4840; text-align:center; font-style:italic;">
                &#9881; TEST-EMAIL — Vertriebsplan Test | ${new Date().toLocaleString('de-DE')}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" bgcolor="#0a2533" style="padding:8px 40px 36px;">
              <p style="font-family:'Montserrat',Arial,sans-serif; font-size:12px; color:#5e5c54; text-align:center;">
                &copy; ${new Date().getFullYear()} Numerologie PRO &middot; Swetlana Wagner<br/>
                <a href="https://numerologie-pro.com" style="color:#D4AF37; text-decoration:none;">numerologie-pro.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function goldBtn(label: string, href: string) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin: 28px auto;"><tr><td align="center" style="background:#D4AF37; border-radius:50px;"><a href="${href}" style="display:inline-block; padding:14px 36px; font-family:'Montserrat',Arial,sans-serif; font-size:13px; font-weight:600; color:#051a24; text-decoration:none; letter-spacing:1.5px; text-transform:uppercase; border-radius:50px;">${label}</a></td></tr></table>`;
}
function h2(text: string) { return `<h2 style="font-family:'Cormorant Garamond',Georgia,serif; font-size:28px; font-weight:600; color:#D4AF37; letter-spacing:1px; margin:0 0 20px;">${text}</h2>`; }
function p(text: string) { return `<p style="font-family:'Montserrat',Arial,sans-serif; font-size:15px; color:#cdc9be; line-height:1.8; margin:0 0 16px;">${text}</p>`; }
function box(content: string) { return `<div style="background-color:#0e2935; border:1px solid #2a4a3a; border-radius:12px; padding:20px 24px; margin:20px 0;">${content}</div>`; }
function quote(text: string) { return `<blockquote style="margin:24px 0; padding:16px 20px; border-left:3px solid #D4AF37; background:#0c2830; border-radius:0 8px 8px 0;"><p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#8a8778; font-style:italic; margin:0;">${text}</p></blockquote>`; }

// ─── Email Definitions ───

const SITE = 'https://numerologie-pro.com';
const CAL = 'https://cal.com/swetlana-wagner-vn81pp/%D0%B1%D0%B5%D1%81%D0%BF%D0%BB%D0%B0%D1%82%D0%BD%D0%B0%D1%8F-%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8F';

interface TestEmail {
  key: string;
  sequence: string;
  step: number;
  subject: string;
  content: string;
}

const EMAILS: TestEmail[] = [
  // ── Lead Nurture (5) ──
  {
    key: 'nurture-1', sequence: 'Lead Nurture', step: 1,
    subject: 'Deine Zahlen sprechen — hör zu',
    content: [
      h2('Willkommen bei Numerologie PRO'),
      p('Deine Psychomatrix wurde berechnet — und sie hat eine Geschichte zu erzählen.'),
      p('Jede Zahl in deiner Matrix verrät etwas über deine Persönlichkeit, deine Stärken und deine verborgenen Talente.'),
      goldBtn('Schau dir deine Matrix an →', `${SITE}/de/rechner`),
      p('Alles Liebe,<br/>Swetlana'),
    ].join('\n'),
  },
  {
    key: 'nurture-2', sequence: 'Lead Nurture', step: 2,
    subject: 'Was bedeutet deine Schicksalszahl für dich?',
    content: [
      h2('Deine Schicksalszahl'),
      p('Wusstest du, dass deine Schicksalszahl dir zeigt, welche Aufgaben du in diesem Leben hast?'),
      p('Sie verrät dir:'),
      `<ul style="padding-left:20px; margin:16px 0 24px;">
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;">Deine natürlichen Talente und Stärken</li>
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;">Deine Lebensaufgabe</li>
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;">Bereiche, in denen du wachsen kannst</li>
      </ul>`,
      p('In deiner vollständigen Matrix stecken noch viel mehr Antworten.'),
      goldBtn('Deine vollständige Matrix ansehen →', `${SITE}/de/rechner`),
    ].join('\n'),
  },
  {
    key: 'nurture-3', sequence: 'Lead Nurture', step: 3,
    subject: 'Dein persönlicher Numerologie-Report',
    content: [
      h2('Deine vollständige Psychomatrix als PDF'),
      p('Stell dir vor, du hältst einen persönlichen Report in den Händen, der dir zeigt:'),
      `<ul style="padding-left:20px; margin:16px 0 24px;">
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;">Alle 9 Positionen deiner Psychomatrix erklärt</li>
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;">Deine Charakterstärken und Wachstumsbereiche</li>
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;">Konkrete Hinweise für Beziehung, Beruf und Gesundheit</li>
      </ul>`,
      p('Dein persönlicher PDF-Report — generiert in Sekunden, basierend auf deinem Geburtsdatum.'),
      goldBtn('PDF-Analyse bestellen — nur 9,99€ →', `${SITE}/de/pakete`),
    ].join('\n'),
  },
  {
    key: 'nurture-4', sequence: 'Lead Nurture', step: 4,
    subject: 'Das sagen meine Kunden',
    content: [
      h2('Was Kunden über ihre Analyse sagen'),
      quote('"Ich war zuerst skeptisch, aber Swetlana hat Dinge gesehen, die kein Test zeigen kann. Die Beratung hat mir Klarheit gegeben." — Ljudmila K.'),
      quote('"Die PDF-Analyse war der Einstieg — die persönliche Sitzung hat alles verändert." — Marina S.'),
      p('Möchtest du auch Klarheit? Starte mit deiner kostenlosen Beratung.'),
      goldBtn('Kostenlose 15-Min Beratung buchen →', CAL),
    ].join('\n'),
  },
  {
    key: 'nurture-5', sequence: 'Lead Nurture', step: 5,
    subject: 'Dein Report wartet auf dich',
    content: [
      h2('Ich habe deinen Report vorbereitet'),
      p('Deine Psychomatrix ist berechnet. Dein persönlicher PDF-Report wartet nur noch auf einen Klick.'),
      p('9 Positionen. Deine Zahlen. Deine Geschichte.'),
      p('<strong>Nur 9,99€</strong> — und du hältst deinen Report in wenigen Sekunden in den Händen.'),
      goldBtn('Jetzt PDF-Report bestellen →', `${SITE}/de/pakete`),
      p('Deine Zahlen warten. Alles Liebe, Swetlana'),
    ].join('\n'),
  },

  // ── PDF Upsell (4) ──
  {
    key: 'upsell-1', sequence: 'PDF Upsell', step: 1,
    subject: '3 verborgene Botschaften in deiner Matrix',
    content: [
      h2('Was deine Matrix über deine Beziehungen verrät'),
      p('Deine PDF-Analyse zeigt dir die Grundlagen deiner Psychomatrix. Aber wusstest du, dass bestimmte Zahlenkombinationen verborgene Botschaften enthalten?'),
      p('In einer persönlichen Sitzung entdecken wir gemeinsam:'),
      `<ul style="padding-left:20px; margin:16px 0 24px;">
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;">Welche Partner wirklich zu dir passen</li>
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;">Warum bestimmte Beziehungen immer scheitern</li>
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;">Wie du deine Beziehungsmatrix aktiv nutzen kannst</li>
      </ul>`,
      goldBtn('Beziehungsmatrix buchen (119€) →', `${SITE}/de/pakete`),
    ].join('\n'),
  },
  {
    key: 'upsell-2', sequence: 'PDF Upsell', step: 2,
    subject: 'Was bringt dir 2026?',
    content: [
      h2('Deine Jahresprognose 2026'),
      p('Jedes Jahr bringt neue Energien — und deine Zahlen verraten, was auf dich zukommt.'),
      p('Die Jahresprognose zeigt dir:'),
      `<ul style="padding-left:20px; margin:16px 0 24px;">
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;">Welche Monate besonders günstig sind</li>
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;">Wo Herausforderungen warten</li>
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;">Wie du das Jahr optimal für dich nutzt</li>
      </ul>`,
      goldBtn('Jahresprognose buchen (119€) →', `${SITE}/de/pakete`),
    ].join('\n'),
  },
  {
    key: 'upsell-3', sequence: 'PDF Upsell', step: 3,
    subject: 'Swetlana persönlich kennenlernen',
    content: [
      h2('Lass uns persönlich sprechen'),
      p('Die PDF ist ein guter Anfang — aber eine persönliche Sitzung geht 10x tiefer.'),
      quote('"Die PDF war interessant, aber erst in der persönlichen Sitzung hat sich alles zusammengefügt." — Elena R.'),
      p('Buch dir jetzt eine kostenlose 15-Minuten-Beratung — ohne Verpflichtung.'),
      goldBtn('Kostenlose Erstberatung buchen →', CAL),
    ].join('\n'),
  },
  {
    key: 'upsell-4', sequence: 'PDF Upsell', step: 4,
    subject: 'Dein 10% Gutschein läuft bald ab',
    content: [
      h2('Letzte Erinnerung: Dein Gutschein'),
      p('Dein 10%-Gutschein für eine persönliche Numerologie-Sitzung läuft in 7 Tagen ab.'),
      p('Eine Sitzung mit Swetlana — 90 Minuten, in denen wir gemeinsam deine Zahlen entschlüsseln.'),
      p('<strong>Nutze deinen Gutschein jetzt, bevor er verfällt.</strong>'),
      goldBtn('Jetzt Sitzung buchen →', `${SITE}/de/pakete`),
    ].join('\n'),
  },

  // ── Post-Session (5) ──
  {
    key: 'session-1', sequence: 'Post-Session', step: 1,
    subject: 'Danke für deine Sitzung',
    content: [
      h2('Danke für unsere gemeinsame Sitzung'),
      p('Es war mir eine Freude, deine Zahlen mit dir zu entdecken. Ich hoffe, die Analyse hat dir neue Perspektiven eröffnet.'),
      p('Falls du Fragen hast, antworte einfach auf diese Email — ich bin für dich da.'),
      p('Alles Liebe,<br/>Swetlana'),
    ].join('\n'),
  },
  {
    key: 'session-2', sequence: 'Post-Session', step: 2,
    subject: 'Teile deine Erfahrung',
    content: [
      h2('Wie war deine Erfahrung?'),
      p('Dein Feedback hilft mir, noch besser zu werden — und anderen Menschen den Weg zur Numerologie zu zeigen.'),
      p('Hast du 2 Minuten?'),
      goldBtn('Google-Bewertung schreiben →', 'https://g.page/r/numerologie-pro/review'),
      p('Oder teil deine Erfahrung als Instagram-Story — ich freue mich über jede Nachricht!'),
    ].join('\n'),
  },
  {
    key: 'session-3', sequence: 'Post-Session', step: 3,
    subject: 'Empfiehl mich weiter — 15% für dich',
    content: [
      h2('Kennst du jemanden, der seine Zahlen kennen sollte?'),
      p('Empfiehl Numerologie PRO an Freunde und Familie — und erhalte 15% Rabatt auf deine nächste Sitzung.'),
      p('So funktioniert es:'),
      `<ol style="padding-left:20px; margin:16px 0 24px;">
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;">Öffne den Telegram-Bot @NumerologieProBot</li>
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;">Tippe /empfehlen</li>
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;">Teile deinen persönlichen Link</li>
      </ol>`,
      p('Sobald jemand über deinen Link bucht, bekommst du automatisch deinen 15%-Gutschein.'),
    ].join('\n'),
  },
  {
    key: 'session-4', sequence: 'Post-Session', step: 4,
    subject: 'Dein nächstes Paket',
    content: [
      h2('Entdecke mehr über deine Zahlen'),
      p('Deine letzte Sitzung hat nur einen Teil deiner Matrix beleuchtet. Es gibt noch so viel mehr zu entdecken:'),
      `<ul style="padding-left:20px; margin:16px 0 24px;">
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;"><strong>Beziehungsmatrix</strong> — Wer passt wirklich zu dir? (119€)</li>
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;"><strong>Geldkanal</strong> — Dein finanzielles Potenzial (99€)</li>
        <li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px;"><strong>Jahresprognose</strong> — Was bringt dir 2026? (119€)</li>
      </ul>`,
      goldBtn('Alle Pakete ansehen →', `${SITE}/de/pakete`),
    ].join('\n'),
  },
  {
    key: 'session-5', sequence: 'Post-Session', step: 5,
    subject: 'Dein monatliches Numerologie-Update',
    content: [
      h2('Dein Monats-Update'),
      p('Jeder Monat bringt neue Energien — und deine Zahlen können dir zeigen, worauf du achten solltest.'),
      p('Hol dir deine persönliche Monatsprognose — kompakt, konkret und auf dein Geburtsdatum zugeschnitten.'),
      goldBtn('Monatsprognose bestellen — nur 19€ →', `${SITE}/de/pakete`),
    ].join('\n'),
  },

  // ── Re-Engagement (3) ──
  {
    key: 'reeng-1', sequence: 'Re-Engagement', step: 1,
    subject: 'Wir vermissen dich',
    content: [
      h2('Es ist eine Weile her...'),
      p('Ich wollte mich kurz melden — deine Zahlen ändern sich mit der Zeit, und deine Matrix zeigt dir immer wieder neue Seiten.'),
      p('Hast du Lust auf eine kostenlose 15-Minuten-Beratung? Einfach zum Reden, ohne Verpflichtung.'),
      goldBtn('Kostenlose Beratung buchen →', CAL),
      p('Alles Liebe, Swetlana'),
    ].join('\n'),
  },
  {
    key: 'reeng-2', sequence: 'Re-Engagement', step: 2,
    subject: 'Was hat sich in deiner Matrix verändert?',
    content: [
      h2('Neue Energien, neue Chancen'),
      p('Wusstest du, dass sich deine persönlichen Jahresenergien jedes Jahr ändern? Was letztes Jahr galt, muss dieses Jahr nicht mehr stimmen.'),
      p('Schau dir an, was sich verändert hat:'),
      goldBtn('Deinen Rechner erneut nutzen →', `${SITE}/de/rechner`),
    ].join('\n'),
  },
  {
    key: 'reeng-3', sequence: 'Re-Engagement', step: 3,
    subject: 'Exklusiv für dich: 20% Rabatt',
    content: [
      h2('Ein besonderes Angebot für dich'),
      p('Ich möchte dir den Wiedereinstieg leicht machen — deshalb erhältst du exklusiv 20% Rabatt auf jedes Paket.'),
      p('Egal ob PDF-Analyse, Beziehungsmatrix oder Jahresprognose — 20% weniger, 100% Klarheit.'),
      goldBtn('Alle Pakete mit 20% Rabatt →', `${SITE}/de/pakete`),
      p('<em>Dieses Angebot gilt 7 Tage.</em>'),
    ].join('\n'),
  },

  // ── Birthday (1) ──
  {
    key: 'birthday', sequence: 'Birthday', step: 1,
    subject: 'Alles Gute zum Geburtstag!',
    content: [
      h2('Alles Gute zum Geburtstag! 🎂'),
      p('Dein neues Lebensjahr bringt neue Energien — und ich möchte, dass du sie voll nutzen kannst.'),
      p('Als Geburtstagsgeschenk erhältst du <strong>20% Rabatt</strong> auf jede Sitzung in deinem Geburtstagsmonat.'),
      p('Entdecke, was das neue Jahr für dich bereithält:'),
      goldBtn('Jetzt mit 20% Rabatt buchen →', `${SITE}/de/pakete`),
      p('Alles Liebe und die besten Wünsche,<br/>Swetlana'),
    ].join('\n'),
  },

  // ── Abandoned Cart (1) ──
  {
    key: 'cart', sequence: 'Abandoned Cart', step: 1,
    subject: 'Du hast etwas vergessen — dein Report wartet',
    content: [
      h2('Du hast etwas vergessen'),
      p('Wir haben bemerkt, dass du den Checkout nicht abgeschlossen hast. Dein Numerologie-Paket wartet noch auf dich:'),
      box(`
        <p style="font-family:'Montserrat',Arial,sans-serif; font-size:16px; color:#D4AF37; font-weight:600; margin:0 0 4px; text-align:center;">PDF-Analyse</p>
        <p style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#9a9789; margin:0; text-align:center;">9.99 EUR</p>
      `),
      goldBtn('Jetzt abschließen →', `${SITE}/de/pakete`),
      `<div style="margin-top:24px; text-align:center;">
        <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#7a776d; margin:0 0 8px;">
          Falls du Fragen hast, antworte einfach auf diese E-Mail oder buche dir eine kostenlose 15-Minuten-Beratung mit mir.
        </p>
        <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#7a776d; margin:0;">Alles Liebe, Swetlana</p>
      </div>`,
      goldBtn('Kostenlose Erstberatung', CAL),
    ].join('\n'),
  },
];

// ─── Send function ───
async function sendTestEmail(email: TestEmail): Promise<boolean> {
  const html = baseTemplate({
    title: email.subject,
    preheader: `[TEST] ${email.sequence} — Step ${email.step}`,
    content: email.content,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: `Swetlana Wagner · Numerologie PRO <${fromEmail}>`,
      to: TEST_EMAIL,
      subject: `[TEST] ${email.subject}`,
      html,
    });

    if (error) {
      console.error(`  ✗ Resend error:`, error);
      return false;
    }

    // Log to Supabase
    await supabase.from('email_log').insert({
      to_email: TEST_EMAIL,
      subject: `[TEST] ${email.subject}`,
      template: `test-${email.key}`,
      status: 'sent',
      resend_id: data?.id ?? null,
    });

    console.log(`  ✓ Sent! Resend ID: ${data?.id}`);
    return true;
  } catch (err) {
    console.error(`  ✗ Failed:`, err);
    return false;
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ─── Main ───
async function main() {
  const step = process.argv[2] ?? 'help';

  if (!supabaseUrl || !supabaseKey || !resendKey) {
    console.error('Missing env vars. Check .env.production.local');
    process.exit(1);
  }

  console.log(`\n📧 Sales Funnel Test — Emails gehen an: ${TEST_EMAIL}\n`);

  if (step === 'profile') {
    console.log('👤 Checking/creating test profile...');
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, email, crm_status, birthdate')
      .eq('email', TEST_EMAIL)
      .maybeSingle();

    if (existing) {
      console.log(`  ✓ Profile exists: ${existing.id}`);
      console.log(`    Status: ${existing.crm_status}`);
      console.log(`    Birthdate: ${existing.birthdate}`);
    } else {
      console.log('  → Creating test profile...');
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({
          email: TEST_EMAIL,
          full_name: 'Test User (Danja)',
          birthdate: '1990-11-04',
          language: 'de',
          crm_status: 'lead',
        })
        .select('id')
        .single();
      if (error) {
        console.error('  ✗ Failed:', error.message);
        console.log('  ℹ️  Profile might require auth.users entry. Checking leads table...');
        // Try creating a lead entry instead
        const { data: lead, error: leadErr } = await supabase
          .from('leads')
          .insert({
            email: TEST_EMAIL,
            full_name: 'Test User (Danja)',
            birthdate: '1990-11-04',
            language: 'de',
            source: 'test-script',
            email_verified: true,
          })
          .select('id')
          .single();
        if (leadErr) {
          console.error('  ✗ Lead creation also failed:', leadErr.message);
        } else {
          console.log(`  ✓ Lead created: ${lead?.id}`);
        }
      } else {
        console.log(`  ✓ Profile created: ${newProfile?.id}`);
      }
    }
    return;
  }

  if (step === 'help') {
    console.log('Verfügbare Befehle:\n');
    console.log('  npx tsx scripts/test-sales-funnel.ts profile     — Test-Profil erstellen');
    console.log('  npx tsx scripts/test-sales-funnel.ts nurture-1   — Lead Nurture Email 1');
    console.log('  npx tsx scripts/test-sales-funnel.ts nurture-2   — Lead Nurture Email 2');
    console.log('  npx tsx scripts/test-sales-funnel.ts nurture-3   — Lead Nurture Email 3');
    console.log('  npx tsx scripts/test-sales-funnel.ts nurture-4   — Lead Nurture Email 4');
    console.log('  npx tsx scripts/test-sales-funnel.ts nurture-5   — Lead Nurture Email 5');
    console.log('  npx tsx scripts/test-sales-funnel.ts upsell-1    — PDF Upsell Email 1');
    console.log('  npx tsx scripts/test-sales-funnel.ts upsell-2    — PDF Upsell Email 2');
    console.log('  npx tsx scripts/test-sales-funnel.ts upsell-3    — PDF Upsell Email 3');
    console.log('  npx tsx scripts/test-sales-funnel.ts upsell-4    — PDF Upsell Email 4');
    console.log('  npx tsx scripts/test-sales-funnel.ts session-1   — Post-Session Email 1');
    console.log('  npx tsx scripts/test-sales-funnel.ts session-2   — Post-Session Email 2');
    console.log('  npx tsx scripts/test-sales-funnel.ts session-3   — Post-Session Email 3');
    console.log('  npx tsx scripts/test-sales-funnel.ts session-4   — Post-Session Email 4');
    console.log('  npx tsx scripts/test-sales-funnel.ts session-5   — Post-Session Email 5');
    console.log('  npx tsx scripts/test-sales-funnel.ts reeng-1     — Re-Engagement Email 1');
    console.log('  npx tsx scripts/test-sales-funnel.ts reeng-2     — Re-Engagement Email 2');
    console.log('  npx tsx scripts/test-sales-funnel.ts reeng-3     — Re-Engagement Email 3');
    console.log('  npx tsx scripts/test-sales-funnel.ts birthday    — Birthday Email');
    console.log('  npx tsx scripts/test-sales-funnel.ts cart        — Abandoned Cart Email');
    console.log('  npx tsx scripts/test-sales-funnel.ts all         — ALLE Emails (5s Pause)');
    console.log('  npx tsx scripts/test-sales-funnel.ts nurture     — Alle Lead Nurture (5)');
    console.log('  npx tsx scripts/test-sales-funnel.ts upsell      — Alle PDF Upsell (4)');
    console.log('  npx tsx scripts/test-sales-funnel.ts session     — Alle Post-Session (5)');
    console.log('  npx tsx scripts/test-sales-funnel.ts reeng       — Alle Re-Engagement (3)');
    return;
  }

  // Find matching emails
  let toSend: TestEmail[] = [];

  if (step === 'all') {
    toSend = EMAILS;
  } else if (step === 'nurture') {
    toSend = EMAILS.filter(e => e.key.startsWith('nurture-'));
  } else if (step === 'upsell') {
    toSend = EMAILS.filter(e => e.key.startsWith('upsell-'));
  } else if (step === 'session') {
    toSend = EMAILS.filter(e => e.key.startsWith('session-'));
  } else if (step === 'reeng') {
    toSend = EMAILS.filter(e => e.key.startsWith('reeng-'));
  } else {
    const found = EMAILS.find(e => e.key === step);
    if (found) toSend = [found];
  }

  if (toSend.length === 0) {
    console.error(`Unbekannter Step: "${step}". Nutze "help" für die Liste.`);
    process.exit(1);
  }

  console.log(`Sende ${toSend.length} Email(s)...\n`);

  let sent = 0;
  for (const email of toSend) {
    console.log(`📨 [${email.sequence}] Step ${email.step}: "${email.subject}"`);
    const ok = await sendTestEmail(email);
    if (ok) sent++;

    if (toSend.length > 1 && email !== toSend[toSend.length - 1]) {
      console.log('   ⏳ 5 Sekunden Pause...');
      await sleep(5000);
    }
  }

  console.log(`\n✅ Fertig: ${sent}/${toSend.length} Emails gesendet an ${TEST_EMAIL}`);
  console.log('📬 Prüfe dein Postfach (auch Spam-Ordner)!\n');
}

main().catch(console.error);
