# Numerologie PRO — Voice Agent "Lisa"

> KI-gesteuerte Telefonberatung fuer Numerologie-Dienstleistungen. Gebaut fuer die Everlast AI Voice Agent Challenge.

**Live:** [numerologie-pro.com/voice-agent](https://numerologie-pro.com/voice-agent)
**Dashboard:** [numerologie-pro.com/admin/voice-agent](https://numerologie-pro.com/admin/voice-agent)

---

## Architektur-Ueberblick

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│  Next.js 14 (App Router) + Tailwind + Shadcn/UI                │
│                                                                 │
│  ┌──────────────┐    ┌──────────────────────────────────┐       │
│  │ VoiceWidget   │◄──►│ ElevenLabs WebSocket (Signed URL)│       │
│  │ (useConvers.) │    └──────────────────────────────────┘       │
│  └──────────────┘                                               │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ Admin Dashboard: KPIs, Calls, Leads, Config Editor   │       │
│  └──────────────────────────────────────────────────────┘       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                     API ROUTES (Next.js)                         │
│                                                                 │
│  /api/voice-agent/signed-url     → Signed URL fuer Widget       │
│  /api/voice-agent/webhook        → Post-Call Datenerfassung      │
│  /api/voice-agent/stats          → Dashboard KPIs               │
│  /api/voice-agent/config         → YAML Config Editor            │
│                                                                 │
│  SERVER TOOLS (von ElevenLabs aufgerufen):                      │
│  /api/voice-agent/tools/knowledge  → RAG Wissensdatenbank        │
│  /api/voice-agent/tools/qualify    → Lead-Qualifizierung         │
│  /api/voice-agent/tools/book-demo  → Cal.com Terminbuchung       │
│  /api/voice-agent/tools/summary    → Gespraechs-Summary          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      SUPABASE (PostgreSQL)                       │
│                                                                 │
│  voice_calls          → Transkript, Recording, Duration          │
│  voice_leads          → Score, Grade, Qualifizierung             │
│  voice_appointments   → Gebuchte Termine                         │
│  voice_call_events    → Greeting, Qualification, Drop-off        │
│  voice_knowledge      → RAG Knowledge Base (42 Eintraege)        │
│                                                                 │
│  RPC: search_voice_knowledge()  → Full-Text Search (tsvector)   │
│  RPC: get_voice_agent_stats()   → Dashboard-Aggregation          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNE SERVICES                              │
│                                                                 │
│  ElevenLabs Conversational AI  → Voice, LLM, TTS                │
│  Cal.com API                   → Terminbuchung                   │
│  Vercel                        → Hosting & Deployment            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Komponente | Technologie |
|------------|-------------|
| **Frontend** | Next.js 14 (App Router), React, TypeScript |
| **Styling** | Tailwind CSS, Shadcn/UI |
| **Voice Agent** | ElevenLabs Conversational AI (WebSocket) |
| **Voice Agent LLM** | GPT-4o mini (via ElevenLabs) |
| **Content Studio LLM** | Claude 4.6 Sonnet (Standart) |
| **TTS** | ElevenLabs Turbo v2.5 |
| **Datenbank** | Supabase (PostgreSQL) |
| **RAG** | PostgreSQL Full-Text Search (tsvector + GIN) |
| **Kalender** | Cal.com API |
| **Deployment** | Vercel |

---

## Features

### Voice Agent "Lisa"
- **Natuerliches Gespraech** — Empathische KI-Assistentin, kein starres Skript
- **Mehrsprachig** — Automatische Erkennung Deutsch/Russisch
- **RAG Knowledge Base** — 42 Wissenseintraege in Supabase, Echtzeit-Suche per Full-Text Search
- **DSGVO-konform** — KI-Kennzeichnung, Einwilligung, Human Handover, Datenminimierung

### Lead-Qualifizierung (6 Kriterien)

| Kriterium | Gewicht | Bewertung |
|-----------|---------|-----------|
| Interessengebiet | 25% | Konkretes Problem → Allgemein → Nur neugierig |
| Erfahrungslevel | 15% | Kennt Numerologie → Interessiert → Skeptisch |
| Budget-Bereitschaft | 25% | Direkt Beratung → Erstgespraech/PDF → Nur kostenlos |
| Zeitrahmen | 20% | Sofort → Naechste Wochen → Kein Plan |
| Entscheidungsbefugnis | 10% | Entscheidet selbst → Mit Partner → Muss ueberlegen |
| Engagement | 5% | Viele Fragen → Hoert zu → Desinteressiert |

**Scoring:** Gewichteter Score 0-100 → Grade A (≥70), B (≥40), C (<40)

### Terminbuchung
- Kostenloses 15-Minuten Erstgespraech mit Swetlana Wagner
- Cal.com API: Verfuegbare Slots abrufen → Automatisch buchen
- Graceful Retry: Automatische Wiederholung der Buchung ohne Telefonnummer bei Validierungsfehlern
- Fallback: Booking-Link wenn API nicht verfuegbar

### Dashboard KPIs

| KPI | Beschreibung |
|-----|-------------|
| **Conversion Rate** | Anteil der Calls die zu einem Termin fuehren |
| **Lead-Qualitaet** | A/B/C Verteilung als Donut-Chart |
| **Ø Gespraechsdauer** | Durchschnittliche Call-Laenge in Minuten |
| **Drop-off Points** | Haeufigste Einwaende als Bar-Chart |

---

## Design-Entscheidungen

### 1. Supabase RAG statt Hardcoded Knowledge

**Problem:** Wissen im System Prompt → grosser Prompt, langsame Verarbeitung, keine Aktualisierung ohne Redeploy.

**Loesung:** PostgreSQL Full-Text Search mit `tsvector` und GIN-Indexes.

**Vorteile:**
- Sub-10ms Abfragezeiten (schneller als Vector-DBs fuer strukturierte Daten)
- Deutsches Stemming (`to_tsvector('german', ...)`) versteht Wortformen
- Keyword-Array als Fallback fuer exakte Treffer
- Wissen ueber Dashboard editierbar ohne Redeploy
- System Prompt bleibt schlank (~150 Zeilen)

### 2. Signed URL statt Agent ID im Frontend

**Problem:** Agent ID im Frontend-Code = Missbrauchsrisiko.

**Loesung:** `/api/voice-agent/signed-url` generiert temporaere WebSocket-Tokens. Die Agent ID bleibt serverseitig.

### 3. conversation.yaml als Single Source of Truth

**Problem:** Gespraechslogik verstreut in Code, Prompts und DB.

**Loesung:** Eine YAML-Datei steuert alles: Persona, Regeln, Pakete, Einwandbehandlung, Qualifizierung, Farewell-Messages. Aenderbar ueber das Config-Dashboard ohne Code-Deployment.

### 4. force_pre_tool_speech

**Problem:** RAG-Abfragen brauchen 200-500ms → Stille fuer den Anrufer.

**Loesung:** `force_pre_tool_speech: "force"` zwingt den Agent, vor jeder Wissensabfrage "Moment, ich schaue nach..." zu sagen. Der Anrufer hoert nie Stille.

### 5. Event-basiertes Drop-off Tracking

**Problem:** "Wo steigen Leads aus?" ist schwer zu messen bei freien Gespraechen.

**Loesung:** Webhook analysiert jede Nachricht auf Keywords und erstellt Events:
- `greeting` → Erstkontakt
- `qualification` → Interesse erkannt
- `objection` → Einwand erhoben
- `booking_attempt` → Terminbuchung angeboten
- `drop_off` → Gespraech abgebrochen (<6 Nachrichten)

---

## Setup

### Voraussetzungen
- Node.js 18+
- Supabase Projekt
- ElevenLabs Account (Conversational AI)
- Cal.com Account
- Vercel Account

### 1. Repository klonen

```bash
git clone https://github.com/Wagner-AIgentur/Numerologie-PRO.git
cd Numerologie-PRO
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Folgende Werte eintragen:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ElevenLabs Voice Agent
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_AGENT_ID=agent_...
ELEVENLABS_WEBHOOK_SECRET=wsec_...

# Cal.com (optional, Fallback = Booking Link)
CALCOM_API_KEY=cal_live_...
CALCOM_EVENT_TYPE_ID=123456
```

### 3. Datenbank-Migrationen

Fuehre die Migrationen in Reihenfolge aus (Supabase SQL Editor oder psql):

```
supabase/migrations/039_voice_agent_calls.sql
supabase/migrations/040_voice_agent_leads.sql
supabase/migrations/041_voice_agent_appointments.sql
supabase/migrations/042_voice_agent_events.sql
supabase/migrations/043_voice_knowledge_base.sql
```

### 4. ElevenLabs Agent einrichten

1. Agent erstellen unter elevenlabs.io/app/conversational-ai
2. System Prompt aus `lib/elevenlabs/config-builder.ts` → `buildSystemPrompt()`
3. 4 Server Tools anlegen (search_knowledge, qualify_lead, book_consultation, end_call_summary)
4. Webhook konfigurieren → `https://your-domain.com/api/voice-agent/webhook`
5. Language Detection aktivieren (DE, RU)

### 5. Lokal starten

```bash
npm run dev
```

- Voice Agent: http://localhost:3000/voice-agent
- Dashboard: http://localhost:3000/admin/voice-agent

### 6. Deployment

```bash
git push origin main  # Vercel baut automatisch
```

---

## Projektstruktur (Voice Agent)

```
app/
  [locale]/
    voice-agent/page.tsx              # Landing Page
    admin/voice-agent/
      page.tsx                        # KPI Dashboard
      calls/page.tsx                  # Call History
      leads/page.tsx                  # Lead Management
      config/page.tsx                 # YAML Config Editor
  api/voice-agent/
    signed-url/route.ts               # WebSocket Auth
    webhook/route.ts                  # Post-Call Processing
    stats/route.ts                    # Dashboard KPIs
    config/route.ts                   # Config CRUD
    tools/
      knowledge/route.ts             # RAG Search
      qualify/route.ts               # Lead Scoring
      book-demo/route.ts             # Cal.com Booking
      summary/route.ts               # Call Summary

components/voice-agent/
  VoiceWidget.tsx                     # WebSocket Widget
  VoiceAgentLanding.tsx               # Landing Page

config/
  conversation.yaml                   # Single Source of Truth

lib/
  elevenlabs/config-builder.ts        # Prompt & Config Builder
  voice-scoring/lead-scorer.ts        # Weighted Scoring Engine

supabase/migrations/
  039_voice_agent_calls.sql           # Calls Table
  040_voice_agent_leads.sql           # Leads Table
  041_voice_agent_appointments.sql    # Appointments Table
  042_voice_agent_events.sql          # Events + Stats RPC
  043_voice_knowledge_base.sql        # Knowledge Base + Search RPC
```

---

## Challenge-Anforderungen — Erfuellungsnachweis

| Anforderung | Status | Nachweis |
|-------------|--------|----------|
| Natuerliches Gespraech | ✅ | Persona "Lisa", RAG-basierte Antworten, empathische Regeln |
| Lead-Qualifizierung (mind. 4) | ✅ | 6 gewichtete Kriterien mit Score 0-100 |
| Terminbuchung | ✅ | Cal.com API Integration mit Fallback |
| Gespraechs-Summary | ✅ | end_call_summary Tool + Webhook-Datenerfassung |
| Echtzeit-Voice < 1.5s | ✅ | ElevenLabs Turbo v2.5 + GPT-4o mini + PostgreSQL FTS |
| Flexible Gespraechslogik | ✅ | conversation.yaml mit 13 Paketen, 4 Einwandtypen, 7 Empfehlungsregeln |
| Dashboard: Conversion Rate | ✅ | KPI-Card im Admin Dashboard |
| Dashboard: Lead-Qualitaet | ✅ | A/B/C Donut-Chart |
| Dashboard: Gespraechsdauer | ✅ | KPI-Card mit Ø Minuten |
| Dashboard: Drop-off Points | ✅ | Objection Bar-Chart + Event-Tracking |
| Git-Repository | ✅ | github.com/Wagner-AIgentur/Numerologie-PRO |
| Konfigurationsdatei | ✅ | config/conversation.yaml (500+ Zeilen) |

---

## Gebaut von

**Wagner AIgentur** — [wagner-aigentur.com](https://wagner-aigentur.com)
CEO: Danil Wagner
