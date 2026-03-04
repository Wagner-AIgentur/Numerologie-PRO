# Telegram Bot — Implementation Plan

**Goal:** Vollumfänglicher Telegram Bot für Numerologie PRO — Service (Erinnerungen, PDFs, Support) + Sales (Mini-Analyse, Kompatibilität, Upsells, Referrals) + n8n-Integration für Marketing-Automatisierung.

**Architecture:** Next.js Webhook-Handler empfängt Telegram-Updates, routet an Command-Handler. Jeder Handler nutzt bestehende Supabase/Stripe-Infrastruktur. n8n wird über einen internen Webhook für Marketing-Flows angebunden.

**Tech Stack:** Telegram Bot API (direkt, kein Framework), Next.js API Routes, Supabase (PostgreSQL), bestehende Numerologie-Berechnungen (`lib/numerology/`), Resend E-Mail (dual-channel).

**Estimated Tasks:** 28 Tasks in 6 Phasen

---

## Phase 1: Foundation — DB + Bot-Client + Webhook (Tasks 1-5)

### Task 1: DB-Migration erstellen und ausführen

**Files:**
- Create: `supabase/migrations/009_telegram_bot.sql`

**SQL:**
```sql
-- 1. Telegram-Verknüpfung auf profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT UNIQUE;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- 2. Telegram-Nachrichten-Log
CREATE TABLE IF NOT EXISTS public.telegram_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id BIGINT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  command TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_chat_id ON public.telegram_messages(chat_id);

-- 3. Referral-System
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  referred_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted')),
  reward_coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_profile_id);

-- 4. Indexes für Telegram-Lookups
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_chat_id ON public.profiles(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
```

**Steps:**
1. Datei erstellen mit obigem SQL
2. Migration ausführen (wie zuvor mit `pg`-Client oder Supabase Dashboard)
3. Verifizieren: `SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('telegram_chat_id', 'referral_code')`

---

### Task 2: Supabase Types aktualisieren

**Files:**
- Modify: `lib/supabase/types.ts`

**Steps:**
1. Zu `profiles` Row/Insert/Update hinzufügen:
   - `telegram_chat_id: number | null`
   - `referral_code: string | null`
2. Neue Tabelle `telegram_messages` typisieren:
   - Row: `id, chat_id, direction, command, payload, created_at`
3. Neue Tabelle `referrals` typisieren:
   - Row: `id, referrer_profile_id, referred_profile_id, code, status, reward_coupon_id, created_at`

---

### Task 3: Telegram Bot API Client

**Files:**
- Create: `lib/telegram/bot.ts`

**Code:**
```typescript
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function sendMessage(chatId: number, text: string, options?: {
  parse_mode?: 'HTML' | 'MarkdownV2';
  reply_markup?: any;
}) {
  const res = await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode ?? 'HTML',
      reply_markup: options?.reply_markup,
    }),
  });
  return res.json();
}

export async function sendDocument(chatId: number, document: Buffer, filename: string, caption?: string) {
  const form = new FormData();
  form.append('chat_id', chatId.toString());
  form.append('document', new Blob([document]), filename);
  if (caption) form.append('caption', caption);
  form.append('parse_mode', 'HTML');

  const res = await fetch(`${API}/sendDocument`, { method: 'POST', body: form });
  return res.json();
}

export async function setWebhook(url: string, secret: string) {
  const res = await fetch(`${API}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, secret_token: secret }),
  });
  return res.json();
}

export function inlineKeyboard(buttons: { text: string; url?: string; callback_data?: string }[][]) {
  return { inline_keyboard: buttons };
}
```

**Steps:**
1. Datei erstellen
2. TypeScript-Check: `npx tsc --noEmit lib/telegram/bot.ts`

---

### Task 4: Bilingual Bot-Texte (i18n)

**Files:**
- Create: `lib/telegram/i18n.ts`

**Inhalt:** Alle Bot-Nachrichten auf Deutsch + Russisch.

```typescript
type Locale = 'de' | 'ru';

export const t = {
  welcome: {
    de: (name?: string) => `Willkommen${name ? `, ${name}` : ''}! Ich bin der digitale Assistent von Swetlana.\n\nWas möchtest du tun?`,
    ru: (name?: string) => `Добро пожаловать${name ? `, ${name}` : ''}! Я цифровой помощник Светланы.\n\nЧто ты хочешь сделать?`,
  },
  linked: {
    de: (name: string) => `Hallo ${name}! 🎉 Dein Konto ist jetzt verbunden.\n\nDu bekommst Termin-Erinnerungen und deine PDFs direkt hier.`,
    ru: (name: string) => `Привет, ${name}! 🎉 Твой аккаунт подключён.\n\nТы будешь получать напоминания и PDF прямо сюда.`,
  },
  askBirthdate: {
    de: 'Gib dein Geburtsdatum ein (TT.MM.JJJJ):',
    ru: 'Введи дату рождения (ДД.ММ.ГГГГ):',
  },
  noPdfs: {
    de: 'Du hast noch keine PDFs. Entdecke unsere Analysen!',
    ru: 'У тебя пока нет PDF. Посмотри наши анализы!',
  },
  noSession: {
    de: 'Du hast aktuell keinen geplanten Termin.',
    ru: 'У тебя нет запланированных встреч.',
  },
  sessionReminder: {
    de: (pkg: string, time: string, link?: string) =>
      `🗓 Erinnerung: Dein Termin mit Swetlana ist heute!\n\n📍 ${pkg}\n⏰ ${time}\n${link ? `🔗 ${link}` : ''}\n\nSwetlana freut sich auf dich! 💫`,
    ru: (pkg: string, time: string, link?: string) =>
      `🗓 Напоминание: Сегодня твоя встреча со Светланой!\n\n📍 ${pkg}\n⏰ ${time}\n${link ? `🔗 ${link}` : ''}\n\nСветлана ждёт тебя! 💫`,
  },
  pdfReady: {
    de: (title: string) => `📄 Dein PDF ist fertig!\n${title}\n\n✨ Tipp: Schreibe /meinepdfs um alle deine PDFs nochmal zu erhalten.`,
    ru: (title: string) => `📄 Твой PDF готов!\n${title}\n\n✨ Совет: Напиши /meinepdfs чтобы получить все PDF повторно.`,
  },
  faqFallback: {
    de: 'Ich habe deine Frage an Swetlana weitergeleitet. Sie meldet sich bald! 💬',
    ru: 'Я передал(а) твой вопрос Светлане. Она скоро ответит! 💬',
  },
  referralInfo: {
    de: (code: string, count: number, available: number) =>
      `🎁 Dein Empfehlungs-Link:\nhttps://numerologie-pro.com/?ref=${code}\n\nWenn jemand über deinen Link bucht:\n• Du bekommst 15% Rabatt\n• Dein Freund bekommt eine kostenlose Mini-Analyse\n\n📊 Empfohlen: ${count} · Gutscheine verfügbar: ${available}`,
    ru: (code: string, count: number, available: number) =>
      `🎁 Твоя реферальная ссылка:\nhttps://numerologie-pro.com/?ref=${code}\n\nКогда кто-то купит по твоей ссылке:\n• Ты получишь скидку 15%\n• Твой друг получит бесплатный мини-анализ\n\n📊 Приглашено: ${count} · Купонов доступно: ${available}`,
  },
  hilfe: {
    de: `📋 <b>Verfügbare Befehle:</b>\n\n/analyse — Kostenlose Numerologie-Kurzanalyse\n/kompatibel — Beziehungs-Kompatibilität prüfen\n/heute — Deine persönliche Tageszahl\n/meinepdfs — Alle gekauften PDFs erneut erhalten\n/termin — Nächsten Termin anzeigen\n/pakete — Beratungspakete ansehen\n/empfehlen — Freunde einladen & Rabatt erhalten\n/hilfe — Diese Übersicht`,
    ru: `📋 <b>Доступные команды:</b>\n\n/analyse — Бесплатный мини-анализ\n/kompatibel — Проверка совместимости\n/heute — Твоё число дня\n/meinepdfs — Получить все купленные PDF\n/termin — Показать следующую встречу\n/pakete — Посмотреть пакеты\n/empfehlen — Пригласить друзей и получить скидку\n/hilfe — Эта справка`,
  },
} as const;

export function getLocale(profile?: { language?: string } | null, telegramLang?: string): Locale {
  if (profile?.language === 'ru') return 'ru';
  if (telegramLang?.startsWith('ru')) return 'ru';
  return 'de';
}
```

---

### Task 5: Webhook-Route + Command-Router

**Files:**
- Create: `app/api/telegram/webhook/route.ts`

**Code-Struktur:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  // 1. Verify webhook secret
  const secret = request.headers.get('x-telegram-bot-api-secret-token');
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const update = await request.json();

  // 2. Extract message or callback_query
  const message = update.message;
  const callback = update.callback_query;

  if (callback) {
    await handleCallback(callback);
    return NextResponse.json({ ok: true });
  }

  if (!message?.text) {
    return NextResponse.json({ ok: true });
  }

  const chatId = message.chat.id;
  const text = message.text.trim();
  const telegramLang = message.from?.language_code;

  // 3. Log incoming message
  await adminClient.from('telegram_messages').insert({
    chat_id: chatId, direction: 'in', command: text.split(' ')[0], payload: { text }
  });

  // 4. Find linked profile
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, full_name, language, birthdate, referral_code')
    .eq('telegram_chat_id', chatId)
    .single();

  // 5. Route to command handler
  const ctx = { chatId, text, profile, telegramLang, message };

  if (text.startsWith('/start'))     return route(() => import('@/lib/telegram/commands/start'), ctx);
  if (text.startsWith('/analyse'))   return route(() => import('@/lib/telegram/commands/analyse'), ctx);
  if (text.startsWith('/kompatibel'))return route(() => import('@/lib/telegram/commands/kompatibel'), ctx);
  if (text.startsWith('/heute'))     return route(() => import('@/lib/telegram/commands/heute'), ctx);
  if (text.startsWith('/meinepdfs')) return route(() => import('@/lib/telegram/commands/meinepdfs'), ctx);
  if (text.startsWith('/termin'))    return route(() => import('@/lib/telegram/commands/termin'), ctx);
  if (text.startsWith('/pakete'))    return route(() => import('@/lib/telegram/commands/pakete'), ctx);
  if (text.startsWith('/empfehlen')) return route(() => import('@/lib/telegram/commands/empfehlen'), ctx);
  if (text.startsWith('/hilfe'))     return route(() => import('@/lib/telegram/commands/hilfe'), ctx);

  // 6. No command match → FAQ / freetext handler
  await handleFreetext(ctx);
  return NextResponse.json({ ok: true });
}

async function route(loader: () => Promise<{ handle: Function }>, ctx: any) {
  const mod = await loader();
  await mod.handle(ctx);
  return NextResponse.json({ ok: true });
}
```

**Steps:**
1. Datei erstellen
2. Env-Variable `TELEGRAM_BOT_TOKEN` und `TELEGRAM_WEBHOOK_SECRET` auf Vercel setzen (nach Bot-Erstellung bei @BotFather)
3. Commit: `feat: telegram bot foundation — client, i18n, webhook router`

---

## Phase 2: Core Commands — Start, Analyse, Kompatibilität (Tasks 6-11)

### Task 6: /start — Begrüßung + Profil-Verknüpfung

**Files:**
- Create: `lib/telegram/commands/start.ts`

**Logik:**
1. Prüfe ob `/start PROFILE_UUID` (Deep Link von Website)
   - Ja: `profiles.update({ telegram_chat_id: chatId }).eq('id', uuid)` → Bestätigungs-Nachricht
2. Prüfe ob `profile` bereits existiert (chat_id schon verknüpft)
   - Ja: "Willkommen zurück, [Name]!" + Inline-Keyboard mit Optionen
3. Sonst (neuer User):
   - Inline-Keyboard: [Kostenlose Analyse] [Pakete ansehen] [Konto verbinden]
   - "Konto verbinden" → Bot fragt nach E-Mail → Flow in Task 7

---

### Task 7: Konto-Verknüpfung per E-Mail

**Files:**
- Modify: `lib/telegram/commands/start.ts` (erweitern)
- Modify: `app/api/telegram/webhook/route.ts` (State-Handling für E-Mail-Eingabe)

**Logik:**
1. User tippt E-Mail → Bot prüft ob `profiles.email = input`
2. Gefunden: Generiere 6-stelligen Code → speichere in `telegram_messages.payload`
3. Sende Code per E-Mail an die Adresse (nutze `sendEmail()`)
4. User gibt Code ein → Bot prüft → Verknüpfung abgeschlossen

**State-Tracking:** Über letzte `telegram_messages`-Einträge (command = 'awaiting_email' / 'awaiting_code')

---

### Task 8: /analyse — Kostenlose Mini-Analyse (Lead Magnet)

**Files:**
- Create: `lib/telegram/commands/analyse.ts`

**Logik:**
1. Profil hat `birthdate`? → Direkt berechnen
2. Sonst: "Gib dein Geburtsdatum ein (TT.MM.JJJJ):" → State: `awaiting_birthdate_analyse`
3. Birthdate empfangen → Parse DD.MM.YYYY
4. `calculateMatrix(day, month, year)` aufrufen (aus `lib/numerology/calculate.ts`)
5. Schicksalszahl = WN2 (zweite Arbeitszahl)
6. Kurzinterpretation (3-4 Sätze) aus `lib/numerology/interpret.ts`
7. Antwort + Upsell:
   ```
   "Deine Schicksalszahl ist 7 — der Denker und Analyst.
    Du suchst immer nach tieferer Bedeutung...

    ✨ Deine vollständige 12-seitige Analyse wartet!"
   [Vollständige Analyse — 4,97€] (Link zu Stripe Checkout)
   ```

**Abhängigkeiten:** `calculateMatrix` aus `lib/numerology/calculate.ts`, Interpretationen aus `lib/numerology/interpret.ts`

---

### Task 9: /kompatibel — Beziehungs-Check

**Files:**
- Create: `lib/telegram/commands/kompatibel.ts`

**Logik:**
1. "Gib 2 Geburtsdaten ein (TT.MM.JJJJ und TT.MM.JJJJ):"
2. Parse beide Daten
3. `calculateCompatibility(person1, person2)` aufrufen
4. Score + Kurzbeschreibung + Upsell zur Beziehungsmatrix

**Abhängigkeit:** `calculateCompatibility` aus `lib/numerology/compatibility.ts`

---

### Task 10: /heute — Persönliche Tageszahl

**Files:**
- Create: `lib/telegram/commands/heute.ts`

**Logik:**
1. Profil hat `birthdate`? → Nutzen
2. Sonst: "Gib dein Geburtsdatum ein:" → State: `awaiting_birthdate_heute`
3. Berechnung: Tageszahl = Quersumme(Geburtstag + Geburtsmonat + heutiges Datum) → reduziere auf 1-9
4. Kurze Energie-Beschreibung für die Zahl

**Hinweis:** Neue kleine Funktion `calculateDailyNumber(birthdate, today)` in `lib/numerology/calculate.ts` oder direkt im Handler.

---

### Task 11: /hilfe — Kommando-Übersicht

**Files:**
- Create: `lib/telegram/commands/hilfe.ts`

**Logik:** Einfach `t.hilfe[locale]` senden. Fertig.

**Commit:** `feat: telegram core commands — start, analyse, kompatibel, heute, hilfe`

---

## Phase 3: Service Commands — PDFs, Termine, Pakete (Tasks 12-16)

### Task 12: /meinepdfs — Gekaufte PDFs senden

**Files:**
- Create: `lib/telegram/commands/meinepdfs.ts`

**Logik:**
1. Profil nicht verknüpft? → "Verbinde zuerst dein Konto mit /start"
2. Query: `deliverables WHERE profile_id = profile.id AND type = 'pdf'`
3. Für jedes PDF:
   - Download aus Supabase Storage
   - `sendDocument(chatId, buffer, filename, caption)` aufrufen
4. Keine PDFs? → `t.noPdfs[locale]` + Inline-Button zu `/pakete`

---

### Task 13: /termin — Nächsten Termin anzeigen

**Files:**
- Create: `lib/telegram/commands/termin.ts`

**Logik:**
1. Profil nicht verknüpft? → "Verbinde zuerst dein Konto"
2. Query: `sessions WHERE profile_id AND status = 'scheduled' ORDER BY scheduled_at LIMIT 1`
3. Gefunden:
   - Datum + Uhrzeit formatiert
   - Paketname
   - Meeting-Link als Inline-Button
4. Nicht gefunden: `t.noSession[locale]` + "Jetzt buchen" Button

---

### Task 14: /pakete — Beratungspakete anzeigen

**Files:**
- Create: `lib/telegram/commands/pakete.ts`

**Logik:**
1. PACKAGES aus `lib/stripe/products.ts` laden
2. Für jedes Paket:
   ```
   📦 Beziehungsmatrix — 149€
   Tiefenanalyse eurer Beziehungsdynamik
   [Jetzt buchen] → Link zu /api/stripe/create-checkout?package_key=beziehungsmatrix
   ```
3. Inline-Keyboard mit 4 Buttons (einer pro Paket)
4. Klick → Checkout-URL generieren (wie Website-Flow)

**Hinweis:** Checkout-Links müssen über die Website laufen (Stripe Checkout braucht redirect_url). Buttons verlinken auf `numerologie-pro.com/{locale}/pakete#paket-name` oder direkt auf einen neuen API-Endpoint der die Checkout-URL zurückgibt.

---

### Task 15: FAQ / Freitext-Handler

**Files:**
- Create: `lib/telegram/faq.ts`

**Logik:** Keyword-Matching auf eingehende Nachrichten:
```typescript
const FAQ_RULES = [
  { keywords: ['stornieren', 'cancel', 'отмена'], response: { de: '...', ru: '...' } },
  { keywords: ['preis', 'kosten', 'price', 'цена'], handler: 'pakete' },
  { keywords: ['termin', 'buchen', 'записаться'], handler: 'termin' },
  { keywords: ['kontakt', 'swetlana', 'светлана'], response: { de: '...', ru: '...' } },
  { keywords: ['datenschutz', 'privacy'], response: { de: 'https://numerologie-pro.com/datenschutz', ru: '...' } },
];
```

Kein Match → Nachricht an Admin weiterleiten (E-Mail an info@numerologie-pro.com oder Telegram-Forward an Swetlanas Chat-ID).

---

### Task 16: Callback-Query Handler (Inline-Button Klicks)

**Files:**
- Modify: `app/api/telegram/webhook/route.ts` (handleCallback Funktion)

**Logik:**
1. Parse `callback_data` (z.B. `analyse_start`, `pakete_beziehungsmatrix`, `link_account`)
2. Route zu entsprechendem Handler
3. `answerCallbackQuery()` aufrufen (verhindert Ladeanzeige im Button)

**Commit:** `feat: telegram service commands — pdfs, termin, pakete, faq`

---

## Phase 4: Dual-Channel Integration (Tasks 17-20)

### Task 17: Telegram-Erinnerung im Cron-Job

**Files:**
- Modify: `app/api/cron/session-reminders/route.ts`

**Änderung:**
Nach dem E-Mail-Versand → zusätzlich Telegram-Nachricht senden:
```typescript
// Nach sendEmail() ...
if (profile.telegram_chat_id) {
  const locale = getLocale(profile);
  const timeStr = new Date(session.scheduled_at).toLocaleTimeString(locale === 'de' ? 'de-DE' : 'ru-RU', { hour: '2-digit', minute: '2-digit' });
  const text = t.sessionReminder[locale](session.package_type ?? 'Beratung', timeStr, session.meeting_link);

  await sendMessage(profile.telegram_chat_id, text, {
    reply_markup: session.meeting_link ? inlineKeyboard([[
      { text: locale === 'de' ? '🔗 Meeting beitreten' : '🔗 Войти в встречу', url: session.meeting_link }
    ]]) : undefined,
  });
}
```

**Wichtig:** `profiles`-Query muss `telegram_chat_id` mitselecten.

---

### Task 18: PDF-Lieferung per Telegram nach Kauf

**Files:**
- Modify: `app/api/stripe/webhook/route.ts`

**Änderung:** Nach erfolgreicher PDF-Generierung + E-Mail-Versand:
```typescript
// In deliverPDF() — nach sendEmail()
const { data: profile } = await adminClient
  .from('profiles')
  .select('telegram_chat_id, language')
  .eq('id', profileId)
  .single();

if (profile?.telegram_chat_id) {
  const locale = getLocale(profile);
  await sendDocument(
    profile.telegram_chat_id,
    pdfBuffer,
    `psychomatrix-${birthdate.replace(/\./g, '-')}.pdf`,
    t.pdfReady[locale](title)
  );
}
```

---

### Task 19: Buchungsbestätigung per Telegram

**Files:**
- Modify: `app/api/cal/webhook/route.ts`

**Änderung:** Nach `BOOKING_CREATED` → wenn `telegram_chat_id`:
```typescript
if (profile?.telegram_chat_id) {
  const locale = getLocale(profile);
  const dateStr = new Date(scheduledAt).toLocaleString(locale === 'de' ? 'de-DE' : 'ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  });
  await sendMessage(profile.telegram_chat_id,
    locale === 'de'
      ? `✅ Termin bestätigt!\n\n📅 ${dateStr}\n📍 ${packageType}\n\nSwetlana freut sich auf dich!`
      : `✅ Встреча подтверждена!\n\n📅 ${dateStr}\n📍 ${packageType}\n\nСветлана ждёт тебя!`,
    { reply_markup: meetingLink ? inlineKeyboard([[{ text: '🔗 Meeting-Link', url: meetingLink }]]) : undefined }
  );
}
```

---

### Task 20: "Verbinde Telegram" auf Website anzeigen

**Files:**
- Modify: `app/[locale]/buchung/erfolg/page.tsx` (Telegram-Button nach Cal.com)
- Modify: `app/[locale]/dashboard/page.tsx` (Telegram-Banner wenn noch nicht verknüpft)

**Logik:**
1. Erfolgsseite: Unter dem Cal.com-Button ein dezenter "Erhalte Updates per Telegram" Link
2. Dashboard: Wenn `profile.telegram_chat_id IS NULL` → Banner "Verbinde Telegram für Erinnerungen + PDFs"
3. Link: `t.me/NumerologieProBot?start={profile.id}`

**Commit:** `feat: telegram dual-channel — reminders, pdf delivery, booking confirmation`

---

## Phase 5: Referral-System + Sales (Tasks 21-24)

### Task 21: /empfehlen — Referral-Link generieren

**Files:**
- Create: `lib/telegram/commands/empfehlen.ts`

**Logik:**
1. Profil nicht verknüpft? → "Verbinde zuerst dein Konto"
2. `profile.referral_code` leer? → Generiere: `${firstName.toUpperCase()}_${randomHex(4)}`
3. Referral-Stats abfragen: `referrals WHERE referrer_profile_id AND status`
4. Sende `t.referralInfo[locale](code, count, availableCoupons)`

---

### Task 22: Referral-Tracking bei Registrierung

**Files:**
- Modify: `app/[locale]/auth/register/page.tsx` (oder Registration-API)
- Modify: `middleware.ts` (optional: `?ref=` Parameter in Cookie speichern)

**Logik:**
1. `?ref=CODE` in URL → in Cookie/Session speichern
2. Bei Registrierung: `referrals` Eintrag erstellen (status: 'pending')
3. Bei erstem Kauf: `referrals.status = 'converted'` → Coupon für Referrer generieren

---

### Task 23: Referral-Conversion im Stripe Webhook

**Files:**
- Modify: `app/api/stripe/webhook/route.ts`

**Logik:** Nach erfolgreichem Kauf prüfen:
1. Hat der neue Kunde einen offenen Referral-Eintrag (status: 'pending')?
2. Ja: Status auf 'converted' setzen
3. 15%-Coupon für den Referrer erstellen (nutze bestehendes Coupon-System)
4. Wenn Referrer `telegram_chat_id` hat → Benachrichtigung: "Dein Freund hat gebucht! 🎉 Hier ist dein 15%-Gutschein: CODE"

---

### Task 24: Sales-Links in Bot-Antworten

**Files:**
- Modify: diverse Command-Handler

**Logik:** Überall wo sinnvoll Upsell-Buttons einbauen:
- Nach `/analyse`: [Vollständige PDF-Analyse — 4,97€]
- Nach `/kompatibel`: [Beziehungsmatrix buchen — 149€]
- Nach `/heute`: [Tagesenergie vertiefen — Wachstumsplan]

**Commit:** `feat: telegram referral system + sales upsells`

---

## Phase 6: n8n-Integration + Webhook Setup (Tasks 25-28)

### Task 25: n8n Event-Forwarding Endpoint

**Files:**
- Create: `app/api/telegram/n8n-event/route.ts`

**Logik:** Next.js leitet bestimmte Events an n8n weiter:
```typescript
export async function POST(request: NextRequest) {
  // Auth check
  const { event, data } = await request.json();

  if (process.env.N8N_WEBHOOK_URL) {
    await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data, timestamp: new Date().toISOString() }),
    });
  }

  return NextResponse.json({ ok: true });
}
```

**Events die an n8n gehen:**
- `purchase_completed` (nach Stripe Webhook)
- `checkout_abandoned` (nach Stripe checkout.session.expired)
- `birthday_today` (aus Cron-Job)

---

### Task 26: n8n Broadcast-Endpoint

**Files:**
- Create: `app/api/telegram/broadcast/route.ts`

**Logik:** n8n ruft diesen Endpoint auf um an den Telegram-Kanal oder alle User zu senden:
```typescript
export async function POST(request: NextRequest) {
  // Auth: Bearer token check (N8N_API_SECRET)
  const { target, text, photo } = await request.json();

  if (target === 'channel') {
    // Sende an Swetlanas Kanal (TELEGRAM_CHANNEL_ID)
    await sendMessage(Number(process.env.TELEGRAM_CHANNEL_ID), text);
  } else if (target === 'all_users') {
    // Query alle profiles mit telegram_chat_id
    // Sende an jeden (mit Rate-Limiting: max 30/Sekunde laut Telegram API)
  }
}
```

---

### Task 27: Webhook registrieren + Bot-Befehle setzen

**Files:**
- Create: `scripts/setup-telegram-bot.ts` (einmalig ausführen)

**Logik:**
1. `setWebhook(url, secret)` aufrufen
2. `setMyCommands()` — registriert Befehle im Telegram-Menü:
   ```
   analyse - Kostenlose Numerologie-Kurzanalyse
   kompatibel - Beziehungs-Kompatibilität prüfen
   heute - Deine persönliche Tageszahl
   meinepdfs - Alle gekauften PDFs erneut erhalten
   termin - Nächsten Termin anzeigen
   pakete - Beratungspakete ansehen
   empfehlen - Freunde einladen & Rabatt erhalten
   hilfe - Alle Befehle anzeigen
   ```

---

### Task 28: Env Vars + Deploy + Verifikation

**Files:**
- Modify: `vercel.json` (keine Änderung nötig, Webhook ist kein Cron)

**Steps:**
1. Bei @BotFather: `/newbot` → Token erhalten
2. Vercel Env Vars setzen:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_WEBHOOK_SECRET` (selbst generiert)
   - `TELEGRAM_CHANNEL_ID` (Swetlanas Kanal)
   - `N8N_WEBHOOK_URL` (n8n Instance)
   - `N8N_API_SECRET` (für Broadcast-Auth)
3. Deploy: `vercel --prod`
4. Setup-Script ausführen: Webhook registrieren + Befehle setzen
5. Test: Bot starten → /start → /analyse → /hilfe

**Commit:** `feat: telegram bot complete — n8n integration, webhook setup`

---

## Env-Variablen (gesamt)

```
TELEGRAM_BOT_TOKEN=<von @BotFather>
TELEGRAM_WEBHOOK_SECRET=<selbst generiert, z.B. openssl rand -hex 32>
TELEGRAM_CHANNEL_ID=<Swetlanas Kanal Chat-ID>
N8N_WEBHOOK_URL=<n8n Webhook-URL für Event-Forwarding>
N8N_API_SECRET=<Bearer Token für n8n → Broadcast-Endpoint>
```

---

## Verifikation

- [ ] `/start` → Begrüßung mit Inline-Keyboard
- [ ] `/start PROFILE_UUID` → Konto verknüpft, Name angezeigt
- [ ] `/analyse` → Geburtsdatum-Abfrage → Schicksalszahl + Upsell
- [ ] `/kompatibel` → 2 Daten → Score + Upsell
- [ ] `/heute` → Persönliche Tageszahl
- [ ] `/meinepdfs` → PDFs als Dokumente gesendet
- [ ] `/termin` → Nächster Termin mit Meeting-Link Button
- [ ] `/pakete` → 4 Pakete mit Checkout-Links
- [ ] `/empfehlen` → Referral-Code + Link + Stats
- [ ] `/hilfe` → Alle Befehle
- [ ] Freitext "preis" → Paket-Übersicht
- [ ] Freitext unklar → "Frage an Swetlana weitergeleitet"
- [ ] Cron-Erinnerung → E-Mail + Telegram-Nachricht
- [ ] PDF-Kauf → E-Mail + Telegram-Dokument
- [ ] Cal.com Buchung → Bestätigung per Telegram
- [ ] Referral-Link teilen → Freund registriert → Referrer bekommt Coupon
- [ ] n8n Broadcast → Nachricht im Kanal erscheint
