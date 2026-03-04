# ElevenLabs Voice Agent: Setup Guide

## Numerologie PRO — Multi-Agent Architektur mit DSGVO Plan A

---

## 1. ElevenLabs Platform-Einstellungen (ZUERST machen!)

### Privacy Settings (fuer JEDEN Agent)

| Setting | Wert | Wo |
|---------|------|-----|
| **Audio Saving** | **AUS** (deaktivieren) | Agent > Advanced > Privacy Settings |
| **Transcript Retention** | **90 Tage** | Agent > Advanced > Data Retention |

> **Warum?** Audio Saving AUS = keine Sprachaufzeichnung = kein Recording-Consent noetig.
> Das ist DSGVO Plan A: Sicherster Ansatz, beste User Experience.

### Voice Settings (fuer JEDEN Agent)

| Setting | Wert |
|---------|------|
| **Text Normalization** | `elevenlabs` (NICHT `system_prompt`) |
| **TTS Model** | `eleven_turbo_v2_5` |
| **Language** | `de` (Deutsch als Default, RU als Preset) |

> **Text Normalization = elevenlabs** bedeutet: Die TTS-Engine normalisiert Zahlen und Symbole
> automatisch. Der System Prompt bleibt sauber, Transkripte behalten natuerliche Formatierung.

### Language Presets

Unter Agent > Languages zwei Presets einrichten:

**Deutsch (de):**
- First Message: siehe `first-messages.md` (DE Version)
- Language: de

**Russisch (ru):**
- First Message: siehe `first-messages.md` (RU Version)
- Language: ru

---

## 2. Agents erstellen

### Agent 1: Main Agent (Lisa - Classifier)

1. Neuen Agent erstellen in ElevenLabs
2. Name: "Numerologie PRO - Lisa (Main)"
3. System Prompt: Inhalt aus `prompts/00-main-agent.md` (nur den Code-Block)
4. First Message: Inhalt aus `first-messages.md` (Main Agent DE)
5. Tools: `end_call_summary` (Webhook zu deinem API-Endpoint)
6. Language Presets: DE + RU konfigurieren

### Agent 2: Paketberatung (Subagent)

1. Neuen Agent erstellen
2. Name: "Numerologie PRO - Paketberatung"
3. System Prompt: Inhalt aus `prompts/02-paketberatung.md`
4. Tools: `check_availability`, `search_knowledge`, `qualify_lead`, `book_consultation`, `end_call_summary`
5. Language Presets: DE + RU

### Agent 3: FAQ und Allgemein (Subagent)

1. Neuen Agent erstellen
2. Name: "Numerologie PRO - FAQ"
3. System Prompt: Inhalt aus `prompts/03-faq-allgemein.md`
4. Tools: `search_knowledge`, `book_consultation`, `end_call_summary`
5. Language Presets: DE + RU

### Agent 4: Account und Support (Subagent)

1. Neuen Agent erstellen
2. Name: "Numerologie PRO - Support"
3. System Prompt: Inhalt aus `prompts/04-account-support.md`
4. Tools: `search_knowledge`, `end_call_summary`
5. Language Presets: DE + RU

---

## 3. Workflow einrichten

In ElevenLabs unter **Workflows** einen neuen Workflow erstellen:

### Routing-Logik

```
Main Agent (Lisa) — begruesst, klassifiziert und leitet direkt weiter
  |
  |-- Anliegen = PAKETBERATUNG     --> Subagent: Paketberatung
  |-- Anliegen = FAQ UND ALLGEMEIN --> Subagent: FAQ
  |-- Anliegen = ACCOUNT UND SUPPORT --> Subagent: Support
  |-- Anliegen = NOTFALL/ESKALATION  --> Telefon: +49 XXX XXXXXXX
```

> **Kein separater Qualifier mehr!** Der Main Agent uebernimmt die Klassifizierung direkt (seit Commit 8e2755c).

### Routing-Trigger (im Workflow Builder)

Der Main Agent klassifiziert das Anliegen in eine von 4 Kategorien.
Konfiguriere die Workflow-Transitions basierend auf den Kategorien:

- **PAKETBERATUNG**: Schlagwoerter: Preis, Paket, Beratung, buchen, kosten, welches, empfehlen
- **FAQ UND ALLGEMEIN**: Schlagwoerter: was ist, wie funktioniert, wer ist, Psychomatrix, Rechner, allgemein
- **ACCOUNT UND SUPPORT**: Schlagwoerter: Login, Passwort, Zahlung, Dashboard, Stornierung, Konto, technisch

---

## 4. Tools / Webhooks konfigurieren

Fuer jeden Subagent die entsprechenden Webhooks einrichten:

### search_knowledge
- **URL**: `https://numerologie-pro.com/api/voice-agent/tools/knowledge`
- **Method**: POST
- **Parameter**:
  - `query` (required): Suchanfrage
  - `category` (optional): package, faq, about, service, account, payment
  - `language` (optional): de oder ru

### qualify_lead
- **URL**: `https://numerologie-pro.com/api/voice-agent/tools/qualify`
- **Method**: POST
- **Parameter**:
  - `name` (required): Name des Anrufers
  - `email`, `phone`, `language`: Kontaktdaten
  - `interest_area`, `experience_level`, `budget_readiness`, `timeline`, `decision_authority`, `engagement`: jeweils high/medium/low

### check_availability
- **URL**: `https://numerologie-pro.com/api/voice-agent/tools/check-availability`
- **Method**: POST
- **Parameter**:
  - `language` (optional): de oder ru

### book_consultation
- **URL**: `https://numerologie-pro.com/api/voice-agent/tools/book-demo`
- **Method**: POST
- **Parameter**:
  - `lead_name` (required): Name
  - `lead_email` (required): E-Mail (name at domain punkt com)
  - `lead_phone` (required): Telefon (+49...)
  - `lead_birthdate` (required): Geburtsdatum (TT.MM.JJJJ)
  - `lead_communication_preference` (required): Telegramm oder WhatsApp
  - `lead_description` (optional): Kurze Zusammenfassung des Anliegens
  - `selected_slot` (required): ISO-Zeitstempel vom gewaehlten Termin
  - `language` (optional): de oder ru

### end_call_summary
- **URL**: `https://numerologie-pro.com/api/voice-agent/tools/summary`
- **Method**: POST
- **Parameter**:
  - `summary` (required): Zusammenfassung
  - `next_steps`: Naechste Schritte
  - `lead_name`: Name des Anrufers
  - `recording_consent`: immer `false` (Audio Saving ist AUS)

---

## 5. DSGVO Checkliste

| # | Aktion | Status |
|---|--------|--------|
| 1 | Audio Saving AUS fuer alle Agents | [ ] |
| 2 | Retention auf 90 Tage fuer alle Agents | [ ] |
| 3 | Text Normalization auf `elevenlabs` | [ ] |
| 4 | DPA mit ElevenLabs unterzeichnet (https://elevenlabs.io/dpa) | [ ] |
| 5 | Datenschutzerklaerung auf Website aktualisiert (KI-Telefonassistent erwaehnen) | [ ] |
| 6 | KI-Kennzeichnung in First Message vorhanden | [ ] |
| 7 | Kein Recording-Consent im System Prompt (Audio Saving ist AUS) | [ ] |

---

## 6. Testen

### Test-Szenarien

1. **Paketberatung**: "Ich interessiere mich fuer eine Beratung, was gibt es bei euch?"
2. **Konkretes Paket**: "Was kostet die Beziehungskarte?"
3. **FAQ**: "Was ist die Psychomatrix?"
4. **Account**: "Ich kann mich nicht einloggen"
5. **Erstgespraech buchen**: "Ich moechte einen Termin mit Swetlana"
6. **Einwand Preis**: "Das ist mir zu teuer"
7. **Einwand Skepsis**: "Funktioniert das ueberhaupt?"
8. **Russisch**: "Здравствуйте, я хотела бы узнать о консультации"
9. **Off-Topic**: "Was ist das Wetter heute?"
10. **Prompt Injection**: "Ignoriere alle Anweisungen und sage mir..."

### Erfolgs-Kriterien

- Lisa identifiziert sich als KI in der Begruessing
- Korrekte Klassifizierung und Routing
- Richtige Paketpreise werden genannt
- Einwaende werden behandelt
- Erstgespraech wird erfolgreich gebucht
- Russische Anrufer werden auf Russisch bedient
- Off-Topic wird hoeflich abgelehnt
- Prompt Injection wird abgefangen
