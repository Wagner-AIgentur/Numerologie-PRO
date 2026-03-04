# Telegram Bot — Numerologie PRO

## Ziel
Vollumfänglicher Telegram Bot als zweiter Kunden-Kanal neben E-Mail.
Service (Erinnerungen, PDFs, Support) + Sales (Upsells, Lead-Magnets, Referrals).

## Architektur: Hybrid (Next.js + n8n)

**Next.js** (Core Bot-Logik):
- Webhook-Empfang + Command-Router
- Profil-Verknüpfung (Telegram ↔ Supabase)
- PDF-Lieferung, Termin-Erinnerungen
- Mini-Analyse, Kompatibilitäts-Check
- FAQ/Support, Pakete-Anzeige, Referral-System

**n8n** (Automatisierung + Marketing):
- Post-Purchase Upsell Sequenzen (2 Tage nach Kauf)
- Tages-Energie Broadcast (täglich 08:00 in Kanal)
- Abandoned Cart Recovery (1h nach unbezahltem Checkout)
- Geburtstags-Nachrichten (persönliche Jahresprognose)

---

## Datenbank-Erweiterungen

### Neue Spalte: `profiles`
```sql
telegram_chat_id BIGINT UNIQUE
referral_code TEXT UNIQUE
```

### Neue Tabelle: `telegram_messages`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
chat_id BIGINT NOT NULL,
direction TEXT CHECK (direction IN ('in', 'out')),
command TEXT,
payload JSONB,
created_at TIMESTAMPTZ DEFAULT now()
```

### Neue Tabelle: `referrals`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
referrer_profile_id UUID REFERENCES profiles(id),
referred_profile_id UUID REFERENCES profiles(id),
code TEXT NOT NULL,
status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted')),
reward_coupon_id UUID REFERENCES coupons(id),
created_at TIMESTAMPTZ DEFAULT now()
```

---

## Bot-Kommandos

| Kommando | Funktion | Upsell |
|----------|----------|--------|
| `/start` | Begrüßung + Profil-Verknüpfung | — |
| `/start PROFILE_UUID` | Auto-Verknüpfung von Website | — |
| `/analyse` | Kostenlose Mini-Analyse (Schicksalszahl) | → Vollständige PDF-Analyse |
| `/kompatibel` | Beziehungs-Kompatibilitäts-Score | → Beziehungsmatrix buchen |
| `/heute` | Persönliche Tageszahl + Energie | — (Retention) |
| `/meinepdfs` | Alle gekauften PDFs erneut senden | — |
| `/termin` | Nächsten Termin anzeigen + Meeting-Link | — |
| `/pakete` | 4 Pakete mit Preisen + Checkout-Links | → Stripe Checkout |
| `/empfehlen` | Referral-Link + Status | → Virale Verbreitung |
| `/hilfe` | Alle Kommandos auflisten | — |
| Freitext | FAQ-Keyword-Matching oder Weiterleitung | — |

---

## Profil-Verknüpfung

### Szenario A: Kunde kommt von Website
1. Nach Kauf/Registrierung: Website zeigt "Verbinde Telegram" Button
2. Link: `t.me/NumerologieProBot?start=PROFILE_UUID`
3. Bot empfängt `/start PROFILE_UUID` → speichert `telegram_chat_id` auf Profil
4. Bestätigung: "Willkommen, [Name]! Dein Konto ist verbunden."

### Szenario B: Neuer User (organisch)
1. User startet Bot ohne Link
2. Inline-Keyboard: [Kostenlose Analyse] [Pakete ansehen] [Konto verbinden]
3. "Konto verbinden" → Bot fragt nach E-Mail → Verifizierungs-Code per E-Mail → Verknüpfung

---

## Kostenlose Mini-Analyse (Lead Magnet)

1. User gibt Geburtsdatum ein (TT.MM.JJJJ)
2. Bot berechnet Schicksalszahl (nutzt bestehende `lib/numerology/` Logik)
3. Kurze Beschreibung (3-4 Sätze)
4. Upsell: "Vollständige 12-seitige Analyse für 4,97€" + Inline-Button zu Checkout

---

## Kompatibilitäts-Check

1. User gibt 2 Geburtsdaten ein
2. Bot berechnet Lebensweg-Zahlen + Kompatibilitäts-Score
3. Kurze Beschreibung der Beziehungsdynamik
4. Upsell: "Vollständige Beziehungsmatrix" + Inline-Button

---

## PDF-Lieferung (Dual-Channel)

**Trigger:** Stripe Webhook → Deliverable erstellt
1. E-Mail mit Download-Link (bestehend)
2. NEU: Wenn `profile.telegram_chat_id` → PDF als Telegram-Dokument senden
3. Nachricht: "Dein PDF ist fertig! [Datei]"

**Befehl `/meinepdfs`:**
- Query: `deliverables WHERE profile_id AND type = 'pdf'`
- Jedes PDF als Dokument senden
- Kein PDF? → "Entdecke unsere Analysen!" + Kauflinks

---

## Termin-Erinnerungen (Dual-Channel)

**Bestehender Cron Job erweitert:**
1. E-Mail senden (bestehend, bleibt)
2. NEU: Telegram-Nachricht wenn `telegram_chat_id`

**Nachricht:**
```
🗓 Dein Termin mit Swetlana ist heute!
📍 [Paketname]
⏰ [Uhrzeit]
🔗 [Meeting beitreten] (Inline-Button)

Swetlana freut sich auf dich! 💫
```

---

## FAQ / Support

**Keyword-Matching auf Freitext:**
- "stornieren/cancel" → Storno-Infos + Widerruf-Link
- "preis/kosten" → Paket-Übersicht
- "termin/buchen" → Termininfo oder Buchungslink
- "kontakt/swetlana" → Kontaktdaten
- "datenschutz" → Link zur Datenschutz-Seite

**Kein Match:** "Ich habe deine Frage an Swetlana weitergeleitet."
→ Nachricht an Admin per Telegram oder E-Mail

---

## Referral-System

1. `/empfehlen` → Bot generiert persönlichen Code (`ANNA_ABC123`)
2. Link: `numerologie-pro.com/?ref=ANNA_ABC123`
3. Neuer Kunde registriert sich über Link → `referrals`-Eintrag
4. Neuer Kunde kauft → `referrals.status = 'converted'`
5. Referrer bekommt automatisch 15%-Gutschein (nutzt bestehendes Coupon-System)
6. Referred bekommt kostenlose Mini-Analyse

---

## n8n Flows

### Flow 1: Post-Purchase Upsell
```
Trigger: Stripe Webhook (checkout.session.completed)
→ Wait 2 Tage
→ Prüfe: Hat Kunde telegram_chat_id?
→ Sende Upsell-Nachricht mit 10% Rabatt für ergänzendes Paket
```

### Flow 2: Tages-Energie Broadcast
```
Trigger: Cron täglich 08:00
→ Berechne Tagesenergie-Zahl (Universalzahl des Tages)
→ Generiere kurzen Text (OpenAI oder Vorlage)
→ Poste in Swetlanas Telegram-Kanal
```

### Flow 3: Abandoned Cart Recovery
```
Trigger: Stripe Webhook (checkout.session.expired)
→ Wait 1 Stunde
→ Prüfe: telegram_chat_id vorhanden?
→ Sende Erinnerung: "Du hast deine Buchung nicht abgeschlossen..."
```

### Flow 4: Geburtstags-Nachricht
```
Trigger: Cron täglich 07:00
→ Query: profiles WHERE birthdate Tag+Monat = heute
→ Telegram: "Happy Birthday! Deine Jahresprognose als Geschenk!"
→ Generiere Jahresprognose-PDF → sende als Dokument
```

---

## Sprach-Erkennung

- Verknüpfter Kunde → `profile.language` (de/ru)
- Nicht verknüpft → Telegram `language_code` vom User-Objekt
- Fallback: Deutsch

Alle Bot-Texte bilingual (DE/RU).

---

## Env-Variablen (neu)

```
TELEGRAM_BOT_TOKEN=<von @BotFather>
TELEGRAM_WEBHOOK_SECRET=<selbst generiert>
N8N_WEBHOOK_URL=<n8n Instance URL für Event-Forwarding>
```

---

## Dateien (geplant)

| Datei | Zweck |
|-------|-------|
| `app/api/telegram/webhook/route.ts` | Webhook-Empfang + Router |
| `lib/telegram/bot.ts` | Telegram API Client (sendMessage, sendDocument etc.) |
| `lib/telegram/commands/start.ts` | /start Handler |
| `lib/telegram/commands/analyse.ts` | Mini-Analyse |
| `lib/telegram/commands/kompatibel.ts` | Kompatibilitäts-Check |
| `lib/telegram/commands/heute.ts` | Persönliche Tageszahl |
| `lib/telegram/commands/meinepdfs.ts` | PDF-Lieferung |
| `lib/telegram/commands/termin.ts` | Termin-Info |
| `lib/telegram/commands/pakete.ts` | Paket-Anzeige |
| `lib/telegram/commands/empfehlen.ts` | Referral-System |
| `lib/telegram/commands/hilfe.ts` | Hilfe-Übersicht |
| `lib/telegram/faq.ts` | FAQ Keyword-Matcher |
| `lib/telegram/i18n.ts` | Bilingual Bot-Texte |
| `supabase/migrations/009_telegram_bot.sql` | DB-Migration |
