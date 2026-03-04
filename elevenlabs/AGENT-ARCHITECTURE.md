# Voice Agent: Komplette Multi-Agent Architektur

> Alles was du brauchst um den Voice Agent aufzubauen.
> Prompts, Conditions, Tools, Knowledge Base — alles an einem Ort.

---

## Architektur-Uebersicht

```
                    ┌─────────────────────┐
                    │   ANRUFER (Telefon)  │
                    └─────────┬───────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │   MAIN AGENT (Lisa)    │
                 │   = System Prompt      │
                 │   + First Message      │
                 │                        │
                 │   Begruesst, fuehrt    │
                 │   das Gespraech,       │
                 │   klassifiziert und    │
                 │   leitet weiter        │
                 └──┬──────┬──────┬──┬───┘
                    │      │      │  │
       Forward:     │      │      │  │  Forward:
       PAKETBERATUNG│      │      │  │  NOTFALL
                    │      │      │  │
       ┌────────────┘      │      │  └──────────────┐
       ▼                   ▼      ▼                  ▼
┌────────────┐ ┌────────────┐ ┌────────────┐  ┌───────────┐
│ SUB-AGENT 2│ │ SUB-AGENT 3│ │ SUB-AGENT 4│  │ TELEFON   │
│ Paketberat.│ │ FAQ/Allgem.│ │ Account/   │  │ WEITERLEI │
│            │ │            │ │ Support    │  │ TUNG      │
│ Pakete     │ │ Psycho-    │ │ Login      │  │           │
│ Preise     │ │ matrix     │ │ Zahlung    │  │ +49 XXX  │
│ Buchung    │ │ Swetlana   │ │ Dashboard  │  │ XXXXXXX   │
└─────┬──────┘ └─────┬──────┘ └─────┬──────┘  │ (Admin)   │
      │              │              │          └───────────┘
      └──────────────┼──────────────┘
                     │
           Backward: │ Themenwechsel ODER Eskalation
                     ▼
              MAIN AGENT (neu klassifizieren)
```

---

## Einstellungen (fuer JEDEN Agent gleich)

| Setting | Wert |
|---------|------|
| Audio Saving | **AUS** (DSGVO Plan A) |
| Transcript Retention | 90 Tage |
| Text Normalization | `elevenlabs` |
| TTS Model | `eleven_turbo_v2_5` |
| Default Language | `de` |
| Language Presets | DE + RU |

---

## Agent-Uebersicht

| # | Agent | Typ | Datei | Aufgabe |
|---|-------|-----|-------|---------|
| 0 | Lisa (Main) | System Prompt | `00-main-agent.md` | Begruessung + Gespraechsfuehrung + Klassifizierung |
| ~~1~~ | ~~Qualifier~~ | ~~Sub-Agent~~ | ~~`01-qualifier.md`~~ | **DEPRECATED** — integriert in `00-main-agent.md` |
| 2 | Paketberatung | Sub-Agent | `02-paketberatung.md` | Pakete, Preise, Empfehlungen, Buchung |
| 3 | FAQ/Allgemein | Sub-Agent | `03-faq-allgemein.md` | Psychomatrix, Swetlana, Rechner, FAQ |
| 4 | Account/Support | Sub-Agent | `04-account-support.md` | Login, Zahlung, Dashboard, Stornierung |

---

## Alle Conditions (Routing)

### Forward Conditions

| # | Von | Nach | Condition Name | Trigger / Beschreibung |
|---|-----|------|---------------|----------------------|
| F1 | Main Agent | Paketberatung | `route_paketberatung` | Preis, Paket, buchen, Empfehlung, Kosten, Beziehungskarte, Lebenskarte, Jahresprognose, Geldkanal, Persoenliches Wachstum, Bestimmung, Mein Kind, PDF-Analyse, Erstgespraech, Budget |
| F2 | Main Agent | FAQ | `route_faq` | was ist, wie funktioniert, wer ist, Psychomatrix, Numerologie, Pythagoras, Rechner, Swetlana, wissenschaftlich, Kompatibilitaet, Telegram Bot, erklaeren, informieren |
| F3 | Main Agent | Account/Support | `route_support` | Login, Passwort, Konto, Zahlung, Stornierung, Dashboard, PDF herunterladen, Fehler, funktioniert nicht, Empfehlungscode, Support, Hilfe |
| F4 | Main Agent | **Telefon: +49 XXX XXXXXXX** | `route_eskalation` | Mensch, echte Person, Vorgesetzter, Manager, Beschwerde, Anwalt, Klage, unzufrieden, Frechheit, sofort jemand, will nicht mit KI, verbinde mich, Notfall, dringend, inakzeptabel |

### Backward Conditions

| # | Von | Nach | Condition Name | Trigger / Beschreibung |
|---|-----|------|---------------|----------------------|
| B1 | Paketberatung | Main Agent | `themenwechsel` | Anrufer wechselt das Thema |
| B2 | FAQ | Main Agent | `themenwechsel` | Anrufer wechselt das Thema |
| B3 | Account/Support | Main Agent | `themenwechsel` | Anrufer wechselt das Thema |
| B4 | Paketberatung | Main Agent | `eskalation` | Anrufer verlangt Menschen, ist veraergert, droht |
| B5 | FAQ | Main Agent | `eskalation` | Anrufer verlangt Menschen, ist veraergert, droht |
| B6 | Account/Support | Main Agent | `eskalation` | Anrufer verlangt Menschen, ist veraergert, droht |

> **Eskalations-Pfad:** Sub-Agent erkennt Eskalation → Backward zum Main Agent → Main Agent erkennt NOTFALL → Forward F4 → Telefon-Weiterleitung an **+49 XXX XXXXXXX** (IT Admin)

---

# ═══════════════════════════════════════════════
# MAIN AGENT: Lisa (System Prompt)
# ═══════════════════════════════════════════════

**Name:** `Numerologie PRO - Lisa (Main)`
**Typ:** System Prompt (Haupt-Agent)
**Datei:** `prompts/00-main-agent.md`

### First Message (DE)
```
Hallo! Hier ist Lisa, deine KI-Assistentin bei Numerologie PRO. Wie kann ich dir helfen?
```

### First Message (RU)
```
Привет! Это Лиза, ИИ-ассистент Numerologie PRO. Чем могу помочь?
```

### System Prompt

> Siehe `prompts/00-main-agent.md` fuer den vollstaendigen, aktuellen Prompt.
> Kernpunkte: KI-Sprachassistentin, Du-Form, 4 Kategorien (Paketberatung, FAQ, Support, Eskalation), max. 2 Saetze pro Antwort.

### Tools (Main Agent)

| Tool | Vorhanden |
|------|-----------|
| end_call_summary | JA |
| search_knowledge | NEIN |
| qualify_lead | NEIN |
| book_consultation | NEIN |

### Knowledge Base
**Keine.** Der Main Agent fuehrt nur das Gespraech, klassifiziert und leitet weiter.

### Forward Conditions → Sub-Agents

Der Main Agent klassifiziert das Anliegen direkt in eine von 4 Kategorien und leitet weiter (siehe Routing-Tabelle oben).

---

# ═══════════════════════════════════════════════
# ~~SUB-AGENT 1: Qualifier (Klassifizierung)~~ — DEPRECATED
# ═══════════════════════════════════════════════

> **DEPRECATED (seit Commit 8e2755c)**
> Die Qualifier-Logik wurde in `00-main-agent.md` integriert.
> Der Main Agent klassifiziert jetzt direkt in 4 Kategorien und leitet weiter.
> Siehe `prompts/01-qualifier.md` fuer die alte Referenz.

---

# ═══════════════════════════════════════════════
# SUB-AGENT 2: Paketberatung
# ═══════════════════════════════════════════════

**Name:** `Numerologie PRO - Paketberatung`
**Typ:** Sub-Agent
**Datei:** `prompts/02-paketberatung.md`

### System Prompt

> Siehe `prompts/02-paketberatung.md` fuer den vollstaendigen, aktuellen Prompt.
> Kernpunkte: Du-Form, 11 Pakete mit TTS-optimierten Preisen, 5-Schritt-Buchungsablauf, Einwandbehandlung (4 Szenarien).

### Tools (Paketberatung)

| Tool | Webhook URL | Pflichtfelder |
|------|-------------|---------------|
| check_availability | `/api/voice-agent/tools/check-availability` | language (optional) |
| search_knowledge | `/api/voice-agent/tools/knowledge` | query |
| qualify_lead | `/api/voice-agent/tools/qualify` | name |
| book_consultation | `/api/voice-agent/tools/book-demo` | lead_name, lead_email, lead_phone, lead_birthdate, lead_communication_preference |
| end_call_summary | `/api/voice-agent/tools/summary` | summary |

### Knowledge Base (Paketberatung)

**Im Prompt eingebettet (Fallback):**
- Alle 11 Pakete mit Preisen (TTS-optimiert), Dauer, Beschreibung
- Empfehlungslogik (welches Paket fuer welches Thema)
- Einwandbehandlung (4 Szenarien: teuer, unsicher, keine Zeit, skeptisch)

**Via search_knowledge Tool (Supabase RAG):**
- Kategorie `package` — Detaillierte Paketbeschreibungen
- Kategorie `recommendation` — Empfehlungsregeln
- Kategorie `objection` — Einwandbehandlung

### Backward Condition → Main Agent

**Name:** `themenwechsel`
**Beschreibung:** Der Anrufer stellt eine Frage die nicht zu Paketen/Preisen/Buchung gehoert (z.B. Login-Problem oder allgemeine Frage).

---

# ═══════════════════════════════════════════════
# SUB-AGENT 3: FAQ und Allgemein
# ═══════════════════════════════════════════════

**Name:** `Numerologie PRO - FAQ`
**Typ:** Sub-Agent
**Datei:** `prompts/03-faq-allgemein.md`

### System Prompt

> Siehe `prompts/03-faq-allgemein.md` fuer den vollstaendigen, aktuellen Prompt.
> Kernpunkte: Du-Form, Psychomatrix-Wissen, Swetlana-Bio, 5 FAQ, Rechner-Links, Preisredirect zur Paketberatung.

### Tools (FAQ)

| Tool | Webhook URL | Pflichtfelder |
|------|-------------|---------------|
| search_knowledge | `/api/voice-agent/tools/knowledge` | query |
| book_consultation | `/api/voice-agent/tools/book-demo` | lead_name, lead_email |
| end_call_summary | `/api/voice-agent/tools/summary` | summary |

### Knowledge Base (FAQ)

**Im Prompt eingebettet (Fallback):**
- Psychomatrix (9 Positionen, 3 Zeilen, 3 Spalten, 2 Diagonalen)
- Swetlana Wagner (10+ Jahre, 500+ Beratungen, 11 Zertifikate)
- Beratungsablauf (Zoom/Telegram, 90-120 Min)
- Kostenloser Rechner + Kompatibilitaetsrechner
- Telegram Bot
- 5 haeufige Fragen mit Antworten

**Via search_knowledge Tool (Supabase RAG):**
- Kategorie `faq` — Alle FAQ-Eintraege
- Kategorie `about` — Ueber Swetlana und Numerologie PRO
- Kategorie `service` — Beratungsablauf und Angebot

### Backward Condition → Main Agent

**Name:** `themenwechsel`
**Beschreibung:** Der Anrufer stellt eine Frage die nicht zu FAQ/Numerologie/allgemeinen Infos gehoert (z.B. will Paket buchen oder hat Login-Problem).

---

# ═══════════════════════════════════════════════
# SUB-AGENT 4: Account und Support
# ═══════════════════════════════════════════════

**Name:** `Numerologie PRO - Support`
**Typ:** Sub-Agent
**Datei:** `prompts/04-account-support.md`

### System Prompt

> Siehe `prompts/04-account-support.md` fuer den vollstaendigen, aktuellen Prompt.
> Kernpunkte: Du-Form, Login/Dashboard/Zahlung/Stornierung/Empfehlungsprogramm, Eskalation an info at numerologie-pro.com.

### Tools (Account/Support)

| Tool | Webhook URL | Pflichtfelder |
|------|-------------|---------------|
| search_knowledge | `/api/voice-agent/tools/knowledge` | query |
| end_call_summary | `/api/voice-agent/tools/summary` | summary |

### Knowledge Base (Account/Support)

**Im Prompt eingebettet (Fallback):**
- Registrierung, Login-Probleme, Passwort vergessen
- Dashboard-Funktionen
- Zahlungsmethoden (Stripe)
- Stornierung und Rueckerstattung
- Empfehlungsprogramm (15%)
- Telegram Bot
- Kontaktdaten

**Via search_knowledge Tool (Supabase RAG):**
- Kategorie `account` — Konto und Login
- Kategorie `payment` — Zahlung und Stornierung
- Kategorie `contact` — Kontaktinformationen

### Backward Condition → Main Agent

**Name:** `themenwechsel`
**Beschreibung:** Der Anrufer stellt eine Frage die nicht zu Account/Support gehoert (z.B. will Paket buchen oder hat allgemeine Frage).

---

# ═══════════════════════════════════════════════
# ZUSAMMENFASSUNG
# ═══════════════════════════════════════════════

## Komplette Routing-Tabelle

### Forward (vorwaerts)

| # | Von | Nach | Condition | Trigger |
|---|-----|------|-----------|---------|
| F1 | Main Agent | Paketberatung | `route_paketberatung` | Preis/Paket/Buchung/Empfehlung |
| F2 | Main Agent | FAQ | `route_faq` | Psychomatrix/Swetlana/Rechner/Info |
| F3 | Main Agent | Account/Support | `route_support` | Login/Zahlung/Dashboard/Problem |
| F4 | Main Agent | **Tel: +49 XXX XXXXXXX** | `route_eskalation` | Mensch/Beschwerde/Anwalt/Notfall |

### Backward (zurueck)

| # | Von | Nach | Condition | Trigger |
|---|-----|------|-----------|---------|
| B1 | Paketberatung | Main Agent | `themenwechsel` | Anrufer wechselt Thema |
| B2 | FAQ | Main Agent | `themenwechsel` | Anrufer wechselt Thema |
| B3 | Account/Support | Main Agent | `themenwechsel` | Anrufer wechselt Thema |
| B4 | Paketberatung | Main Agent | `eskalation` | Anrufer verlangt Menschen/droht |
| B5 | FAQ | Main Agent | `eskalation` | Anrufer verlangt Menschen/droht |
| B6 | Account/Support | Main Agent | `eskalation` | Anrufer verlangt Menschen/droht |

### Eskalations-Pfad

```
Sub-Agent erkennt Eskalation
  → Backward zum Main Agent
    → Main Agent erkennt NOTFALL
      → Forward F4: Telefon-Weiterleitung an +49 XXX XXXXXXX (IT Admin)
```

## Tool-Verteilung

| Tool | Main | Paketberatung | FAQ | Support |
|------|------|---------------|-----|---------|
| end_call_summary | JA | JA | JA | JA |
| search_knowledge | — | JA | JA | JA |
| check_availability | — | JA | — | — |
| qualify_lead | — | JA | — | — |
| book_consultation | — | JA | JA | — |

## Webhook-URLs (Base: numerologie-pro.com)

| Tool | Endpoint | Method |
|------|----------|--------|
| check_availability | `/api/voice-agent/tools/check-availability` | POST |
| search_knowledge | `/api/voice-agent/tools/knowledge` | POST |
| qualify_lead | `/api/voice-agent/tools/qualify` | POST |
| book_consultation | `/api/voice-agent/tools/book-demo` | POST |
| end_call_summary | `/api/voice-agent/tools/summary` | POST |

## DSGVO Checkliste

| # | Aktion | Status |
|---|--------|--------|
| 1 | Audio Saving AUS fuer alle Agents | [ ] |
| 2 | Retention auf 90 Tage | [ ] |
| 3 | Text Normalization = elevenlabs | [ ] |
| 4 | DPA mit ElevenLabs unterzeichnet | [ ] |
| 5 | Datenschutzerklaerung aktualisiert | [ ] |
| 6 | KI-Kennzeichnung in First Message | [ ] |
| 7 | recording_consent immer false | [ ] |
