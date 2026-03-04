# Voice Agent Analysepunkte — Numerologie PRO
# Datenfelder fuer die Gespraechszusammenfassung (end_call_summary)

---

## Anruferdaten / Данные звонящего

| Bezeichner | Datentyp | Beschreibung | Enum Values |
|------------|----------|--------------|-------------|
| anrufer_name | String | Der vollstaendige Name des Anrufers. Falls nicht genannt, leer lassen. | — |
| anrufer_email | String | Die E-Mail-Adresse des Anrufers. Wichtig fuer Buchungsbestaetigungen und PDF-Versand. | — |
| anrufer_telefon | String | Die Telefonnummer des Anrufers fuer Rueckrufe. | — |
| sprache | String | In welcher Sprache wurde das Gespraech gefuehrt? | de, ru |

---

## Gespraechsklassifikation / Классификация разговора

| Bezeichner | Datentyp | Beschreibung | Enum Values |
|------------|----------|--------------|-------------|
| kategorie | String | In welche Kategorie faellt das Anliegen? "Paketberatung" wenn es um Pakete, Preise oder Buchungen geht. "FAQ" wenn allgemeine Fragen zur Numerologie oder Psychomatrix. "Account_Support" wenn es um Login, Dashboard oder technische Probleme geht. "Terminbuchung" wenn der Hauptzweck eine Terminvereinbarung war. "Allgemein" bei sonstigen Fragen. | Paketberatung, FAQ, Account_Support, Terminbuchung, Allgemein |
| thema | String | Welches spezifische Thema beschaeftigt den Anrufer? Hilft bei der Nachbereitung und Marketing-Analyse. | Beziehung, Beruf_Sinnsuche, Kind, Finanzen, Persoenlichkeit, Jahresprognose, Allgemein |
| anliegen | String | Eine kurze Zusammenfassung des Anliegens in einem Satz. | — |

---

## Sales-Intelligence / Данные продаж

| Bezeichner | Datentyp | Beschreibung | Enum Values |
|------------|----------|--------------|-------------|
| interessiertes_paket | String | Fuer welches Paket hat der Anrufer Interesse gezeigt? Falls mehrere, das staerkste Interesse. Falls keines, "keines". | Lebenskarte, Beziehungskarte, Bestimmung, Persoenliches_Wachstum, Mein_Kind, Geldkanal, Jahresprognose, Jahresprognose_PDF, PDF_Analyse, Monatsprognose, Tagesprognose, Erstgespraech, keines |
| kaufbereitschaft | String | Wie kaufbereit war der Anrufer? "hoch" wenn er aktiv buchen wollte oder gebucht hat. "mittel" wenn Interesse da war aber noch Bedenken. "niedrig" wenn nur informativ. "unklar" wenn nicht einschaetzbar. | hoch, mittel, niedrig, unklar |
| einwand | String | Welchen Haupteinwand hatte der Anrufer? "keiner" wenn keiner geaeussert. | zu_teuer, nicht_sicher, keine_zeit, skeptisch, keiner |
| geburtsdatum_genannt | Boolean | Hat der Anrufer sein Geburtsdatum im Gespraech erwaehnt? Wichtig fuer Vorbereitung einer moeglichen Beratung. | true, false |

---

## Gespraechsergebnis / Результат разговора

| Bezeichner | Datentyp | Beschreibung | Enum Values |
|------------|----------|--------------|-------------|
| status | String | Wie wurde das Gespraech abgeschlossen? "Termin_gebucht" wenn ein Termin erfolgreich gebucht wurde. "Interesse_geweckt" wenn der Anrufer interessiert ist aber noch nicht gebucht hat. "FAQ_beantwortet" wenn die Frage vollstaendig beantwortet wurde. "Eskaliert" wenn an Swetlana persoenlich weitergeleitet wurde. "Abgebrochen" wenn der Anrufer aufgelegt hat oder das Gespraech abgebrochen wurde. | Termin_gebucht, Interesse_geweckt, FAQ_beantwortet, Eskaliert, Abgebrochen |
| termin_gebucht | Boolean | Wurde ein Termin (kostenlose Erstberatung oder Paket) erfolgreich gebucht? | true, false |
| termin_datum | String | Falls ein Termin gebucht wurde: Das Datum und die Uhrzeit im ISO-Format. Falls nicht gebucht: leer lassen. | — |
| follow_up_noetig | Boolean | Ist nach dem Anruf eine Aktion noetig? JA wenn: Interesse geweckt aber nicht gebucht, Rueckruf versprochen, Eskalation an Swetlana, technisches Problem gemeldet. NEIN wenn: Frage vollstaendig beantwortet, Termin gebucht, kein Follow-up noetig. | true, false |
| naechster_schritt | String | Was muss als naechstes passieren? "Keine_Aktion" wenn erledigt. "Rueckruf_Swetlana" wenn Swetlana persoenlich zurueckrufen soll. "Follow_up_Email" wenn eine Nachfass-Email geschickt werden soll. "PDF_senden" wenn ein PDF-Produkt versendet werden muss. "Termin_bestaetigen" wenn ein gebuchter Termin bestaetigt werden muss. | Keine_Aktion, Rueckruf_Swetlana, Follow_up_Email, PDF_senden, Termin_bestaetigen |

---

## Gesamtzusammenfassung / Общая сводка

| Bezeichner | Datentyp | Beschreibung |
|------------|----------|--------------|
| zusammenfassung | String | Freitext-Zusammenfassung des gesamten Gespraechs in 2-3 Saetzen. Wichtige Details, Stimmung des Anrufers, besondere Wuensche. |

---

## Vergleich: Heimstein vs. Numerologie PRO

| Heimstein (Hausverwaltung) | Numerologie PRO | Grund der Aenderung |
|---------------------------|-----------------|---------------------|
| anrufer_name | anrufer_name | Gleich |
| anrufer_adresse | anrufer_email | E-Mail statt Adresse (Online-Business, PDF-Versand) |
| anrufer_telefon | anrufer_telefon | Gleich |
| — | sprache | NEU: Bilingual DE/RU Tracking |
| kategorie (Technisch, Abrechnung...) | kategorie (Paketberatung, FAQ...) | Angepasst auf Numerologie-Kategorien |
| — | thema | NEU: Spezifisches Thema fuer Marketing-Analyse |
| anliegen | anliegen | Gleich |
| dringlichkeit | kaufbereitschaft | Statt Dringlichkeit: Sales-Readiness |
| — | interessiertes_paket | NEU: Welches Paket (13 Optionen inkl. keines) |
| — | einwand | NEU: Einwandtyp fuer Sales-Optimierung |
| — | geburtsdatum_genannt | NEU: Vorbereitung fuer Beratung |
| status (Erledigt, Weiterleitung...) | status (Termin_gebucht, Interesse...) | Angepasst auf Sales-Funnel |
| ticket_erforderlich | follow_up_noetig | Gleiche Logik, anderer Name |
| — | termin_gebucht | NEU: Boolean fuer schnelle Auswertung |
| — | termin_datum | NEU: Konkretes Datum wenn gebucht |
| naechster_schritt | naechster_schritt | Angepasst auf Numerologie-Aktionen |

---

## Insgesamt: 15 Analysepunkte

| # | Feld | Typ | Pflicht |
|---|------|-----|---------|
| 1 | anrufer_name | String | Nein |
| 2 | anrufer_email | String | Nein |
| 3 | anrufer_telefon | String | Nein |
| 4 | sprache | Enum | Ja |
| 5 | kategorie | Enum | Ja |
| 6 | thema | Enum | Ja |
| 7 | anliegen | String | Ja |
| 8 | interessiertes_paket | Enum | Ja |
| 9 | kaufbereitschaft | Enum | Ja |
| 10 | einwand | Enum | Ja |
| 11 | geburtsdatum_genannt | Boolean | Ja |
| 12 | status | Enum | Ja |
| 13 | termin_gebucht | Boolean | Ja |
| 14 | termin_datum | String | Nein |
| 15 | follow_up_noetig | Boolean | Ja |
| 16 | naechster_schritt | Enum | Ja |
| 17 | zusammenfassung | String | Ja |
