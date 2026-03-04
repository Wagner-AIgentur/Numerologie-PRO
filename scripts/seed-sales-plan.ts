/**
 * Seed Script: Sales Plan Automation Rules, Email Sequences, and Tag Rules
 *
 * Run with: npx tsx scripts/seed-sales-plan.ts
 *
 * This applies the same data as 029_sales_plan_seed.sql but via the Supabase JS client,
 * making it safe to run on an existing database without needing psql access.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load env manually (no dotenv dependency needed)
const scriptDir = typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(import.meta.url));
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
  } catch { /* file not found, skip */ }
}

loadEnvFile(resolve(scriptDir, '../.env.production.local'));
loadEnvFile(resolve(scriptDir, '../.env.local'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🚀 Seeding Sales Plan data...\n');

  // ── 1. Tag Rules ──
  console.log('📌 Creating tag rules...');

  const currentMonth = new Date().getMonth() + 1; // 1-12

  const tagRules = [
    { tag_name: 'Erster-Kauf', description: 'Hat mindestens eine Bestellung', condition_type: 'order_count_gte', condition_value: '1', auto_remove: false },
    { tag_name: 'Geburtstags-Monat', description: 'Geburtstag in diesem Monat', condition_type: 'birthdate_month', condition_value: String(currentMonth), auto_remove: true },
  ];

  for (const rule of tagRules) {
    // Check if tag rule already exists
    const { data: existing } = await supabase
      .from('tag_rules')
      .select('id')
      .eq('tag_name', rule.tag_name)
      .maybeSingle();

    if (existing) {
      console.log(`  ✓ Tag rule "${rule.tag_name}" already exists, skipping`);
    } else {
      const { error } = await supabase.from('tag_rules').insert(rule);
      if (error) console.error(`  ✗ Failed: ${rule.tag_name}`, error.message);
      else console.log(`  ✓ Created: ${rule.tag_name}`);
    }
  }

  // ── 2. Automation Rules ──
  console.log('\n⚡ Creating automation rules...');

  const automationRules = [
    {
      name: 'Lead zu Kunde nach Kauf',
      description: 'Setzt crm_status automatisch auf client nach jeder Bestellung',
      trigger_event: 'order_completed',
      conditions: [],
      actions: [{ type: 'change_status', value: 'client' }],
    },
    {
      name: 'PDF Upsell via Telegram',
      description: 'Sendet Telegram-Nachricht nach PDF-Kauf mit Upsell auf Consultation',
      trigger_event: 'order_completed',
      conditions: [{ field: 'package_key', operator: 'eq', value: 'pdf_analyse' }],
      actions: [{ type: 'send_telegram', value: 'Danke für deine PDF-Analyse! 📊 Die PDF zeigt dir die Oberfläche — in einer persönlichen Sitzung entdecken wir die verborgenen Zusammenhänge deiner Zahlen. Buche jetzt mit 10% Rabatt: https://numerologie-pro.com/de/pakete' }],
    },
    {
      name: 'Empfehlungs-Erinnerung nach Sitzung',
      description: 'Sendet Telegram-Nachricht nach abgeschlossener Sitzung mit Referral-Hinweis',
      trigger_event: 'session_completed',
      conditions: [],
      actions: [{ type: 'send_telegram', value: 'Danke für die Sitzung! 💫 Hat dir die Analyse gefallen? Empfiehl mich weiter und erhalte 15% auf deine nächste Buchung. Tippe /empfehlen' }],
    },
    {
      name: 'High-Value zu VIP',
      description: 'Setzt crm_status auf vip wenn High-Value Tag hinzugefügt wird',
      trigger_event: 'tag_added',
      conditions: [{ field: 'tags', operator: 'contains', value: 'High-Value' }],
      actions: [{ type: 'change_status', value: 'vip' }],
    },
    {
      name: 'Inaktive Lead Reaktivierung',
      description: 'Sendet Reaktivierungs-Email an inaktive Kontakte',
      trigger_event: 'tag_added',
      conditions: [{ field: 'tags', operator: 'contains', value: 'Inaktiv-30-Tage' }],
      actions: [{ type: 'send_email', value: 'Wir vermissen dich! Deine Zahlen haben sich seit deinem letzten Besuch verändert. Schau dir an, was sich in deiner Matrix getan hat: https://numerologie-pro.com/de/rechner' }],
    },
    {
      name: 'Geburtstags-Kampagne',
      description: 'Sendet Geburtstags-Email mit 20% Gutschein',
      trigger_event: 'tag_added',
      conditions: [{ field: 'tags', operator: 'contains', value: 'Geburtstags-Monat' }],
      actions: [{ type: 'send_email', value: 'Alles Gute zum Geburtstag! 🎂 Dein neues Lebensjahr bringt neue Energien. Als Geschenk erhältst du 20% Rabatt auf jede Sitzung: https://numerologie-pro.com/de/pakete' }],
    },
  ];

  for (const rule of automationRules) {
    const { data: existing } = await supabase
      .from('automation_rules')
      .select('id')
      .eq('name', rule.name)
      .maybeSingle();

    if (existing) {
      console.log(`  ✓ Rule "${rule.name}" already exists, skipping`);
    } else {
      const { error } = await supabase.from('automation_rules').insert(rule);
      if (error) console.error(`  ✗ Failed: ${rule.name}`, error.message);
      else console.log(`  ✓ Created: ${rule.name}`);
    }
  }

  // ── 3. Email Sequences ──
  console.log('\n📧 Creating email sequences...');

  await seedSequence({
    name: 'Lead Nurture',
    description: 'Führt neue verifizierte Leads durch einen 5-Step Funnel zur ersten PDF-Bestellung',
    trigger_event: 'lead_verified',
    trigger_filter: {},
    steps: [
      { step_order: 1, delay_days: 0, subject: 'Deine Zahlen sprechen — hör zu', content_html: '<h2 style="color:#D4AF37;">Willkommen bei Numerologie PRO</h2><p>Deine Psychomatrix wurde berechnet — und sie hat eine Geschichte zu erzählen.</p><p>Jede Zahl in deiner Matrix verrät etwas über deine Persönlichkeit, deine Stärken und deine verborgenen Talente.</p><p><a href="https://numerologie-pro.com/de/rechner" style="color:#D4AF37;font-weight:bold;">Schau dir deine Matrix an →</a></p><p>Alles Liebe,<br/>Swetlana</p>', content_telegram: 'Willkommen bei Numerologie PRO! Deine Psychomatrix wurde berechnet. Schau dir deine Zahlen an: https://numerologie-pro.com/de/rechner', send_telegram: true },
      { step_order: 2, delay_days: 2, subject: 'Was bedeutet deine Schicksalszahl für dich?', content_html: '<h2 style="color:#D4AF37;">Deine Schicksalszahl</h2><p>Wusstest du, dass deine Schicksalszahl dir zeigt, welche Aufgaben du in diesem Leben hast?</p><ul><li>Deine natürlichen Talente und Stärken</li><li>Deine Lebensaufgabe</li><li>Bereiche, in denen du wachsen kannst</li></ul><p><a href="https://numerologie-pro.com/de/rechner" style="color:#D4AF37;font-weight:bold;">Deine vollständige Matrix ansehen →</a></p>', content_telegram: 'Deine Schicksalszahl zeigt dir deine Lebensaufgabe. Entdecke alle 9 Positionen: https://numerologie-pro.com/de/rechner', send_telegram: true },
      { step_order: 3, delay_days: 5, subject: 'Dein persönlicher Numerologie-Report', content_html: '<h2 style="color:#D4AF37;">Deine vollständige Psychomatrix als PDF</h2><p>Alle 9 Positionen deiner Psychomatrix erklärt. Konkrete Hinweise für Beziehung, Beruf und Gesundheit.</p><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">PDF-Analyse bestellen — nur 9,99 EUR →</a></p>', content_telegram: 'Dein persönlicher Numerologie-Report — alle 9 Matrix-Positionen erklärt. Nur 9,99 EUR: https://numerologie-pro.com/de/pakete', send_telegram: true },
      { step_order: 4, delay_days: 8, subject: 'Das sagen meine Kunden', content_html: '<h2 style="color:#D4AF37;">Was Kunden über ihre Analyse sagen</h2><blockquote style="border-left:3px solid #D4AF37;padding:12px 16px;margin:16px 0;"><p><em>"Swetlana hat Dinge gesehen, die kein Test zeigen kann."</em> — Ljudmila K.</p></blockquote><p><a href="https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация" style="color:#D4AF37;font-weight:bold;">Kostenlose 15-Min Beratung buchen →</a></p>', send_telegram: false },
      { step_order: 5, delay_days: 12, subject: 'Dein Report wartet auf dich', content_html: '<h2 style="color:#D4AF37;">Ich habe deinen Report vorbereitet</h2><p>9 Positionen. Deine Zahlen. Deine Geschichte. <strong>Nur 9,99 EUR.</strong></p><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Jetzt PDF-Report bestellen →</a></p><p>Deine Zahlen warten. Alles Liebe, Swetlana</p>', content_telegram: 'Dein PDF-Report wartet! Nur 9,99 EUR: https://numerologie-pro.com/de/pakete', send_telegram: true },
    ],
  });

  await seedSequence({
    name: 'PDF Käufer Upsell',
    description: 'Führt PDF-Käufer durch Upsell-Funnel zu einer Live-Consultation',
    trigger_event: 'order_completed',
    trigger_filter: { package_key: 'pdf_analyse' },
    steps: [
      { step_order: 1, delay_days: 3, subject: '3 verborgene Botschaften in deiner Matrix', content_html: '<h2 style="color:#D4AF37;">Was deine Matrix über deine Beziehungen verrät</h2><p>Bestimmte Zahlenkombinationen enthalten verborgene Botschaften über deine Partnerschaften.</p><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Beziehungsmatrix buchen (119 EUR) →</a></p>', send_telegram: false },
      { step_order: 2, delay_days: 7, subject: 'Was bringt dir 2026?', content_html: '<h2 style="color:#D4AF37;">Deine Jahresprognose 2026</h2><p>Jedes Jahr bringt neue Energien. Die Jahresprognose zeigt dir günstige Monate und Herausforderungen.</p><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Jahresprognose buchen (119 EUR) →</a></p>', send_telegram: false },
      { step_order: 3, delay_days: 14, subject: 'Swetlana persönlich kennenlernen', content_html: '<h2 style="color:#D4AF37;">Lass uns persönlich sprechen</h2><blockquote style="border-left:3px solid #D4AF37;padding:12px;margin:16px 0;"><em>"Erst in der persönlichen Sitzung hat sich alles zusammengefügt."</em> — Elena R.</blockquote><p><a href="https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация" style="color:#D4AF37;font-weight:bold;">Kostenlose Erstberatung buchen →</a></p>', send_telegram: false },
      { step_order: 4, delay_days: 21, subject: 'Dein 10% Gutschein läuft bald ab', content_html: '<h2 style="color:#D4AF37;">Letzte Erinnerung</h2><p>Dein 10%-Gutschein für eine persönliche Sitzung läuft in 7 Tagen ab.</p><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Jetzt Sitzung buchen →</a></p>', send_telegram: false },
    ],
  });

  await seedSequence({
    name: 'Nach-Sitzung Follow-Up',
    description: 'Follow-Up nach abgeschlossener Sitzung: Danke, Review, Referral, Cross-Sell',
    trigger_event: 'session_completed',
    trigger_filter: {},
    steps: [
      { step_order: 1, delay_days: 1, subject: 'Danke für deine Sitzung', content_html: '<h2 style="color:#D4AF37;">Danke für unsere Sitzung</h2><p>Es war mir eine Freude, deine Zahlen mit dir zu entdecken. Bei Fragen bin ich für dich da.</p><p>Alles Liebe, Swetlana</p>', content_telegram: 'Danke für unsere Sitzung! Bei Fragen bin ich für dich da. 💫', send_telegram: true },
      { step_order: 2, delay_days: 3, subject: 'Teile deine Erfahrung', content_html: '<h2 style="color:#D4AF37;">Wie war deine Erfahrung?</h2><p>Dein Feedback hilft mir und zeigt anderen den Weg zur Numerologie.</p><p><a href="https://g.page/r/numerologie-pro/review" style="color:#D4AF37;font-weight:bold;">Google-Bewertung schreiben →</a></p>', send_telegram: false },
      { step_order: 3, delay_days: 7, subject: 'Empfiehl mich weiter — 15% für dich', content_html: '<h2 style="color:#D4AF37;">15% Rabatt für dich</h2><p>Empfiehl Numerologie PRO und erhalte 15% auf deine nächste Sitzung. Tippe /empfehlen im Telegram-Bot.</p>', content_telegram: 'Empfiehl mich weiter und erhalte 15% Rabatt! Tippe /empfehlen', send_telegram: true },
      { step_order: 4, delay_days: 14, subject: 'Dein nächstes Paket', content_html: '<h2 style="color:#D4AF37;">Entdecke mehr</h2><ul><li>Beziehungsmatrix (119 EUR)</li><li>Geldkanal (99 EUR)</li><li>Jahresprognose (119 EUR)</li></ul><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Alle Pakete →</a></p>', send_telegram: false },
      { step_order: 5, delay_days: 30, subject: 'Dein monatliches Update', content_html: '<h2 style="color:#D4AF37;">Monats-Update</h2><p>Deine persönliche Monatsprognose — kompakt und auf dein Geburtsdatum zugeschnitten.</p><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Monatsprognose — nur 19 EUR →</a></p>', send_telegram: false },
    ],
  });

  await seedSequence({
    name: 'Re-Engagement',
    description: 'Reaktivierung inaktiver Kontakte nach 30+ Tagen',
    trigger_event: 'tag_added',
    trigger_filter: { tag: 'Inaktiv-30-Tage' },
    steps: [
      { step_order: 1, delay_days: 0, subject: 'Wir vermissen dich', content_html: '<h2 style="color:#D4AF37;">Es ist eine Weile her...</h2><p>Deine Zahlen ändern sich mit der Zeit. Buch dir eine kostenlose 15-Minuten-Beratung.</p><p><a href="https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация" style="color:#D4AF37;font-weight:bold;">Kostenlose Beratung →</a></p>', content_telegram: 'Es ist eine Weile her! Hast du Lust auf eine kostenlose Mini-Beratung?', send_telegram: true },
      { step_order: 2, delay_days: 7, subject: 'Was hat sich verändert?', content_html: '<h2 style="color:#D4AF37;">Neue Energien</h2><p>Deine Jahresenergien ändern sich. Schau nach, was sich verändert hat.</p><p><a href="https://numerologie-pro.com/de/rechner" style="color:#D4AF37;font-weight:bold;">Rechner nutzen →</a></p>', send_telegram: false },
      { step_order: 3, delay_days: 14, subject: 'Exklusiv: 20% Rabatt für dich', content_html: '<h2 style="color:#D4AF37;">Dein Comeback-Angebot</h2><p>20% Rabatt auf jedes Paket. 7 Tage gültig.</p><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Pakete mit 20% Rabatt →</a></p>', send_telegram: false },
    ],
  });

  await seedSequence({
    name: 'Geburtstags-Kampagne',
    description: 'Geburtstags-Glückwünsche mit 20% Gutschein',
    trigger_event: 'tag_added',
    trigger_filter: { tag: 'Geburtstags-Monat' },
    steps: [
      { step_order: 1, delay_days: 0, subject: 'Alles Gute zum Geburtstag!', content_html: '<h2 style="color:#D4AF37;">Alles Gute!</h2><p>Dein neues Lebensjahr bringt neue Energien. Als Geschenk: <strong>20% Rabatt</strong> auf jede Sitzung.</p><p><a href="https://numerologie-pro.com/de/pakete" style="color:#D4AF37;font-weight:bold;">Mit 20% Rabatt buchen →</a></p><p>Alles Liebe, Swetlana 🎂</p>', content_telegram: 'Alles Gute zum Geburtstag! 🎂 Als Geschenk: 20% Rabatt auf jede Sitzung: https://numerologie-pro.com/de/pakete', send_telegram: true },
    ],
  });

  console.log('\n✅ Sales Plan seed complete!');
}

interface StepData {
  step_order: number;
  delay_days: number;
  delay_hours?: number;
  subject: string;
  content_html: string;
  content_telegram?: string;
  send_telegram: boolean;
}

async function seedSequence(config: {
  name: string;
  description: string;
  trigger_event: string;
  trigger_filter: Record<string, string>;
  steps: StepData[];
}) {
  // Check if sequence already exists
  const { data: existing } = await supabase
    .from('email_sequences')
    .select('id')
    .eq('name', config.name)
    .maybeSingle();

  if (existing) {
    console.log(`  ✓ Sequence "${config.name}" already exists, skipping`);
    return;
  }

  // Create sequence
  const { data: seq, error: seqError } = await supabase
    .from('email_sequences')
    .insert({
      name: config.name,
      description: config.description,
      trigger_event: config.trigger_event,
      trigger_filter: config.trigger_filter,
      is_active: true,
    })
    .select('id')
    .single();

  if (seqError || !seq) {
    console.error(`  ✗ Failed to create sequence "${config.name}":`, seqError?.message);
    return;
  }

  // Create steps
  const steps = config.steps.map((s) => ({
    sequence_id: seq.id,
    step_order: s.step_order,
    delay_days: s.delay_days,
    delay_hours: s.delay_hours ?? 0,
    subject: s.subject,
    content_html: s.content_html,
    content_telegram: s.content_telegram ?? null,
    send_telegram: s.send_telegram,
  }));

  const { error: stepsError } = await supabase
    .from('email_sequence_steps')
    .insert(steps);

  if (stepsError) {
    console.error(`  ✗ Failed to create steps for "${config.name}":`, stepsError.message);
  } else {
    console.log(`  ✓ Created: ${config.name} (${config.steps.length} steps)`);
  }
}

main().catch(console.error);
