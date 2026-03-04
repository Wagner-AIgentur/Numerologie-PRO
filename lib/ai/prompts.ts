/**
 * System prompts and user prompt builders for AI content generation.
 *
 * Each content type (newsletter, telegram_post, etc.) has a tailored system
 * prompt that captures the Numerologie PRO brand voice and output format.
 */

import type { ContentType, GenerateOptions } from './openrouter';

const BRAND_CONTEXT = `
Du schreibst für "Numerologie PRO" (numerologie-pro.com) — eine Premium-Numerologie-Beratungsplattform.
Beraterin: Swetlana Wagner, erfahrene Numerologin mit über 500 Beratungen.
Angebote: Pythagoras Psychomatrix Analyse (PDF 9,99€), Live-Beratungspakete (ab 99€), kostenloser Online-Rechner.
Tonalität: Premium, mystisch aber seriös, warmherzig, professionell. Keine Esoterik-Klischees.
Zielgruppe: Frauen 25-55, interessiert an Persönlichkeitsentwicklung, Selbstfindung, Beziehungen.
`.trim();

const OUTPUT_FORMAT = `
Antworte ausschließlich als gültiges JSON-Objekt mit genau diesen 3 Feldern:
{
  "subject": "Email-Betreffzeile (max 60 Zeichen, fesselnd)",
  "email_content": "HTML-formatierter Email-Inhalt. Nutze <strong>, <em>, <br>, <p>. Kein komplettes HTML-Dokument — nur der Body-Inhalt.",
  "telegram_content": "Telegram-HTML-Text. Nutze <b>, <i>, <a href='...'>, Emojis. Max 4000 Zeichen. Kein Markdown."
}
`.trim();

const CONTENT_TYPE_INSTRUCTIONS: Record<ContentType, string> = {
  newsletter: `
Erstelle einen Newsletter-Beitrag. Struktur:
- Ansprache (persönlich, "du")
- Hauptthema mit 2-3 Absätzen
- Praktischer Numerologie-Tipp oder Insight
- Call-to-Action (Beratung buchen oder Rechner nutzen)
Email: 150-300 Wörter, visuell strukturiert mit Absätzen.
Telegram: Kompaktere Version, 80-150 Wörter, mit Emojis.
  `.trim(),

  telegram_post: `
Erstelle einen Telegram-Kanal-Post. Kurz, fesselnd, mit Emojis.
- Hook in der ersten Zeile (Frage oder Statement)
- 2-3 kurze Absätze
- Abschluss mit Tipp oder Frage an die Community
Telegram: 50-120 Wörter, lebendig, interaktiv.
Email: Erweiterte Version mit mehr Detail, 100-200 Wörter.
  `.trim(),

  upsell: `
Erstelle eine Upsell-Nachricht für bestehende Kunden.
- Wertschätzung für bisherigen Kauf
- Hinweis auf weiterführendes Angebot
- Konkreter Nutzen/Mehrwert
- Zeitlich begrenztes Angebot oder Rabatt wenn passend
- Klarer CTA
Email: 100-200 Wörter, überzeugend aber nicht aufdringlich.
Telegram: 60-100 Wörter, direkt und persönlich.
  `.trim(),

  event: `
Erstelle eine Event-/Ankündigung.
- Aufmerksamkeitsstarke Headline
- Was, Wann, Warum
- Nutzen für den Empfänger
- Anmeldungs-CTA
Email: 100-200 Wörter mit klarer Struktur.
Telegram: 60-120 Wörter mit Emojis und Dringlichkeit.
  `.trim(),

  daily_tip: `
Erstelle einen täglichen Numerologie-Tipp.
- Kurzer, inspirierender Numerologie-Insight
- Bezug zum aktuellen Tag/Energie
- Praktische Anwendung im Alltag
Email: 80-150 Wörter, warm und inspirierend.
Telegram: 40-80 Wörter mit passendem Emoji am Anfang.
  `.trim(),
};

const LANGUAGE_INSTRUCTIONS: Record<'de' | 'ru', string> = {
  de: 'Schreibe den gesamten Inhalt auf Deutsch. Verwende "du" als Anrede.',
  ru: 'Напиши весь контент на русском языке. Обращайся на "ты".',
};

export function getSystemPrompt(contentType: ContentType, language: 'de' | 'ru'): string {
  return [
    BRAND_CONTEXT,
    '',
    '---',
    '',
    CONTENT_TYPE_INSTRUCTIONS[contentType],
    '',
    LANGUAGE_INSTRUCTIONS[language],
    '',
    '---',
    '',
    OUTPUT_FORMAT,
  ].join('\n');
}

export function buildUserPrompt(opts: GenerateOptions): string {
  const parts: string[] = [];

  parts.push(`Erstelle einen "${opts.content_type}" Beitrag.`);

  if (opts.topic) {
    parts.push(`Thema: ${opts.topic}`);
  }

  if (opts.additional_context) {
    parts.push(`Zusätzlicher Kontext: ${opts.additional_context}`);
  }

  parts.push(`Sprache: ${opts.language === 'de' ? 'Deutsch' : 'Russisch'}`);

  return parts.join('\n');
}
