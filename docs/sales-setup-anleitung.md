# Vertriebsplan Setup-Anleitung fuer Swetlana

Diese Anleitung beschreibt alle Schritte, die im CRM-Admin-Panel eingerichtet werden muessen, um den Vertriebsplan zu aktivieren.

---

## 1. Stripe Dashboard: Webhook-Event aktivieren

**Wo:** https://dashboard.stripe.com/webhooks -> Dein Webhook Endpoint auswaehlen -> Events bearbeiten

**Aktiviere dieses Event:**
- `checkout.session.expired` (fuer Abandoned Cart Recovery)

Ohne dieses Event werden keine Warenkorb-Abbruch-Emails versendet.

---

## 2. Automation-Regeln einrichten (Admin -> Automatisierung)

### Regel 1: Automatischer Status-Wechsel nach Kauf
- **Name:** Lead zu Kunde nach Kauf
- **Trigger:** `order_completed`
- **Bedingungen:** keine
- **Aktion:** `change_status` -> Wert: `client`

### Regel 2: PDF-Kaeufer Telegram Upsell
- **Name:** PDF Upsell via Telegram
- **Trigger:** `order_completed`
- **Bedingungen:**
  - Feld: `package_key`, Operator: `eq`, Wert: `pdf_analyse`
- **Aktion:** `send_telegram` -> Nachricht:
  - DE: "Danke fuer deine PDF-Analyse! Fuer die tiefe persoenliche Deutung buche jetzt eine Sitzung mit 10% Rabatt: numerologie-pro.com/de/pakete"
  - RU: "Spasibo za PDF-analiz! Dlya glubokogo lichnostnog razbora zapishis na konsultaciyu so skidkoy 10%: numerologie-pro.com/ru/pakete"

### Regel 3: Post-Session Referral Push
- **Name:** Empfehlungs-Erinnerung nach Sitzung
- **Trigger:** `session_completed`
- **Bedingungen:** keine
- **Aktion:** `send_telegram` -> Nachricht:
  - DE: "Danke fuer die Sitzung! Empfiehl mich weiter und erhalte 15% auf deine naechste Buchung. Tippe /empfehlen"
  - RU: "Spasibo za sessiyu! Porekomenduuy menya i poluchi skidku 15% na sleduyushchuyu zapis. Napishi /empfehlen"

### Regel 4: VIP-Upgrade fuer High-Value Kunden
- **Name:** High-Value zu VIP
- **Trigger:** `tag_added`
- **Bedingungen:**
  - Feld: `tags`, Operator: `contains`, Wert: `High-Value`
- **Aktion:** `change_status` -> Wert: `vip`

### Regel 5: Reaktivierung inaktiver Kontakte
- **Name:** Inaktive Lead Reaktivierung
- **Trigger:** `tag_added`
- **Bedingungen:**
  - Feld: `tags`, Operator: `contains`, Wert: `Inaktiv-30-Tage`
- **Aktion:** `enroll_sequence` -> Sequenz: "Re-Engagement" (erst erstellen, siehe Abschnitt 3)

### Regel 6: Birthday-Kampagne
- **Name:** Geburtstags-Kampagne
- **Trigger:** `tag_added`
- **Bedingungen:**
  - Feld: `tags`, Operator: `contains`, Wert: `Geburtstags-Monat`
- **Aktion:** `enroll_sequence` -> Sequenz: "Birthday" (erst erstellen, siehe Abschnitt 3)

---

## 3. Email-Sequenzen einrichten (Admin -> Sequenzen)

### Sequenz 1: Lead-Nurture
- **Name:** Lead Nurture Sequenz
- **Trigger:** `lead_verified`
- **Status:** Aktiv
- **Steps:**

| # | Verzoegerung | Betreff (DE) | Betreff (RU) |
|---|-------------|-------------|-------------|
| 1 | 0 Tage | Deine Zahlen sprechen | Tvoi chisla govoryat |
| 2 | 2 Tage | Was bedeutet Schicksalszahl fuer dich? | Chto oznachaet chislo sudby? |
| 3 | 5 Tage | Dein persoenlicher Numerologie-Report | Tvoi personalnyy otchyot |
| 4 | 8 Tage | Das sagen meine Kunden | Chto govoryat moi klienty |
| 5 | 12 Tage | Dein Report wartet auf dich | Tvoi otchyot zhdyot tebya |

### Sequenz 2: PDF-Upsell
- **Name:** PDF Kaeufer Upsell
- **Trigger:** `order_completed`
- **Filter:** package_key = pdf_analyse
- **Steps:**

| # | Verzoegerung | Betreff |
|---|-------------|---------|
| 1 | 0 Tage | Dein naechster Schritt (10% Gutschein) |
| 2 | 3 Tage | 3 verborgene Botschaften in deiner Matrix |
| 3 | 7 Tage | Was bringt dir 2026? |
| 4 | 14 Tage | Swetlana persoenlich kennenlernen |
| 5 | 21 Tage | Dein Gutschein laeuft bald ab! |

### Sequenz 3: Post-Session Follow-Up
- **Name:** Nach-Sitzung Follow-Up
- **Trigger:** `session_completed`
- **Steps:**

| # | Verzoegerung | Betreff |
|---|-------------|---------|
| 1 | 1 Tag | Danke fuer deine Sitzung |
| 2 | 3 Tage | Teile deine Erfahrung |
| 3 | 7 Tage | Empfiehl mich weiter - 15% fuer dich |
| 4 | 14 Tage | Dein naechstes Paket |
| 5 | 30 Tage | Dein Monats-Update |

### Sequenz 4: Re-Engagement
- **Name:** Re-Engagement (Inaktive)
- **Trigger:** `tag_added`
- **Filter:** tag = Inaktiv-30-Tage
- **Steps:**

| # | Verzoegerung | Betreff |
|---|-------------|---------|
| 1 | 0 Tage | Wir vermissen dich |
| 2 | 7 Tage | Was hat sich in deiner Matrix veraendert? |
| 3 | 14 Tage | Exklusiv: 20% Rabatt fuer dich |

### Sequenz 5: Birthday
- **Name:** Geburtstags-Kampagne
- **Trigger:** `tag_added`
- **Filter:** tag = Geburtstags-Monat
- **Steps:**

| # | Verzoegerung | Betreff |
|---|-------------|---------|
| 1 | 0 Tage | Alles Gute zum Geburtstag! (20% Gutschein) |

---

## 4. Tag-Regeln einrichten (Admin -> Auto-Tags)

### Neue Regel: Geburtstags-Monat
- **Tag:** Geburtstags-Monat
- **Bedingung:** `birthdate_month` = (aktueller Monat, z.B. 3 fuer Maerz)
- **Auto-Remove:** Ja (wird naechsten Monat automatisch entfernt)

**Hinweis:** Diese Regel muss jeden Monat aktualisiert werden, ODER es wird ein Cron-Job eingerichtet, der den Monat automatisch setzt.

### Neue Regel: Erster-Kauf
- **Tag:** Erster-Kauf
- **Bedingung:** `order_count_gte` = 1
- **Auto-Remove:** Nein

---

## 5. Reihenfolge der Einrichtung

1. Zuerst: Email-Sequenzen erstellen (weil Automations auf sie verweisen)
2. Dann: Tag-Regeln erstellen (weil Automations auf Tags reagieren)
3. Zuletzt: Automation-Regeln erstellen (die auf Sequenzen und Tags verweisen)
4. Stripe Dashboard: checkout.session.expired Event aktivieren

---

## 6. Testen

Nach der Einrichtung:
1. **Lead-Nurture:** Neuen Lead ueber den Rechner erstellen, Email verifizieren -> Sequenz sollte starten
2. **PDF-Upsell:** Test-PDF-Kauf -> Upsell-Email mit 10% Gutschein pruefen
3. **Status-Wechsel:** Nach Kauf sollte crm_status automatisch auf "client" wechseln
4. **Abandoned Cart:** Stripe Test-Checkout starten und Seite schliessen -> Recovery-Email pruefen
5. **VIP-Upgrade:** Profil mit >200 EUR Revenue -> Auto-Tag "High-Value" -> Status sollte auf "vip" wechseln
