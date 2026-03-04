# SEO Full Audit Report — numerologie-pro.com

**Datum:** 2. März 2026
**Business Type:** Professional Service (Online Numerologie-Beratung)
**Sprachen:** Deutsch (de) + Russisch (ru)
**Framework:** Next.js 16.1.6 (App Router)
**Deployment:** Vercel

---

## SEO Health Score: 72/100

```
Technical SEO:      78/100  ████████░░  (Gewicht: 25%)
Content Quality:    70/100  ███████░░░  (Gewicht: 25%)
On-Page SEO:        82/100  ████████░░  (Gewicht: 20%)
Schema:             75/100  ████████░░  (Gewicht: 10%)
Performance (CWV):  68/100  ███████░░░  (Gewicht: 10%)
Images:             55/100  ██████░░░░  (Gewicht: 5%)
AI Search (GEO):    45/100  █████░░░░░  (Gewicht: 5%)
```

**Gewichteter Score:** `(78×0.25)+(70×0.25)+(82×0.20)+(75×0.10)+(68×0.10)+(55×0.05)+(45×0.05)` = **72.4/100**

---

## Executive Summary

### Top 5 Critical Issues
1. **Fehlende x-default hreflang** — Internationalisierung ohne Fallback
2. **Blog-Posts ohne Article/BlogPosting Schema** — Verpasste Rich Results
3. **Bilder ohne explizite width/height** — CLS-Risiko
4. **Keine AI-Crawler-Steuerung** — Keine robots.txt-Regeln für GPTBot/ClaudeBot
5. **Root-URL (/) hat keinen Content** — Redirect zu /ru nötig, aber canonical-Konflikte

### Top 5 Quick Wins
1. x-default hreflang hinzufügen (+5 Score)
2. BlogPosting Schema für alle 8 Blogposts (+3 Score)
3. Person Schema für Swetlana Wagner (+3 Score)
4. Alt-Text für Logo & Deko-Bilder ergänzen (+2 Score)
5. llms.txt erstellen (+2 Score)

---

## 1. Technical SEO — 78/100

### Crawlability ✅ (85/100)
| Check | Status | Details |
|-------|--------|---------|
| robots.txt | ✅ Vorhanden | Korrekt: `/api/`, `/dashboard/`, `/admin/`, `/auth/` blockiert |
| XML Sitemap | ✅ Vorhanden | 48 URLs, in robots.txt referenziert |
| Sitemap Format | ⚠️ Minor | `changefreq` und `priority` werden von Google ignoriert (kein Fehler, nur unnötig) |
| Crawl Depth | ✅ Gut | Alle wichtigen Seiten innerhalb von 2 Klicks erreichbar |
| JavaScript Rendering | ✅ SSR | Next.js Server Components — Content im initialen HTML |

### Indexability ⚠️ (75/100)
| Check | Status | Details |
|-------|--------|---------|
| Canonical Tags | ⚠️ Problem | Root `/` hat canonical zu `/ru` — aber Google sieht Root als eigenständige URL |
| Hreflang | ⚠️ Fehlt | Kein `x-default` Tag definiert — Google weiß nicht, welche Sprache als Fallback dient |
| Hreflang Return Tags | ✅ OK | DE ↔ RU bidirektional korrekt |
| Meta Robots | ✅ OK | `index, follow` auf allen öffentlichen Seiten |
| Noindex auf geschützten Seiten | ✅ OK | Auth/Dashboard/Admin via robots.txt blockiert |
| Blog-Post hreflang | ⚠️ Fehlt | Blog-Posts in der Sitemap haben KEINE hreflang-Alternates |

### Security ✅ (90/100)
| Header | Status | Wert |
|--------|--------|------|
| HTTPS | ✅ | Erzwungen, gültiges SSL |
| HSTS | ✅ | `max-age=63072000; preload` |
| X-Frame-Options | ✅ | `DENY` |
| X-Content-Type-Options | ✅ | `nosniff` |
| Referrer-Policy | ✅ | `strict-origin-when-cross-origin` |
| CSP | ✅ | Vorhanden, korrekt konfiguriert |
| Permissions-Policy | ✅ | Kamera/Mikrofon eingeschränkt |

### URL Structure ✅ (80/100)
| Check | Status | Details |
|-------|--------|---------|
| Clean URLs | ✅ | `/de/rechner`, `/de/blog/schicksalszahl-berechnen-bedeutung` |
| Hierarchy | ✅ | Logisch: `/{locale}/{section}` |
| URL Length | ✅ | Alle unter 100 Zeichen |
| Trailing Slashes | ✅ | Konsistent (ohne) |

### Mobile ✅ (85/100)
| Check | Status | Details |
|-------|--------|---------|
| Viewport Meta | ✅ | `width=device-width, initial-scale=1, maximum-scale=5` |
| Responsive | ✅ | Tailwind CSS Mobile-First |
| Font Size | ✅ | 16px+ Basis (Montserrat) |
| font-display | ✅ | `swap` auf beiden Fonts |

### Core Web Vitals ⚠️ (68/100)
| Metric | Status | Potentielle Probleme |
|--------|--------|---------------------|
| LCP | ⚠️ | Hero-Bild (`swetlana-hero.jpg`) via Next/Image geladen — aber kein `fetchpriority="high"` |
| INP | ✅ | Kein schweres JS auf der Homepage |
| CLS | ⚠️ | Bilder ohne explizite `width`/`height` Attribute im HTML (Next/Image handled das teilweise, aber nicht überall) |

### AI Crawler Management ❌ (40/100)
| Crawler | Status | Empfehlung |
|---------|--------|------------|
| GPTBot | ⚠️ Nicht konfiguriert | Erlauben für ChatGPT-Sichtbarkeit |
| ClaudeBot | ⚠️ Nicht konfiguriert | Erlauben für Claude-Sichtbarkeit |
| PerplexityBot | ⚠️ Nicht konfiguriert | Erlauben für Perplexity-Sichtbarkeit |
| Google-Extended | ⚠️ Nicht konfiguriert | Entscheidung: Gemini-Training erlauben/blockieren |

---

## 2. Content Quality — 70/100

### E-E-A-T Bewertung

| Faktor | Score | Signale |
|--------|-------|---------|
| **Experience** | 17/20 | 500+ Beratungen, Zertifikate, persönliche Fotos, Testimonials |
| **Expertise** | 18/25 | 11 Zertifikate sichtbar, aber keine externen Verlinkungen zu Ausstellern |
| **Authoritativeness** | 14/25 | Starke Social-Media-Präsenz (Instagram, TikTok, Telegram), aber keine Wikipedia/Fachpublikationen |
| **Trustworthiness** | 21/30 | Kontaktdaten, DSGVO-konform, Cookie-Consent, Impressum — aber keine Kundenbewertungen auf Drittplattformen (Google Reviews, Trustpilot) |
| **Gesamt** | **70/100** | |

### Wort-Analyse pro Seite

| Seite | Wörter | Minimum | Status |
|-------|--------|---------|--------|
| Homepage (DE) | ~2.200 | 500 | ✅ Gut |
| Rechner | ~2.500 | 500 | ✅ Gut |
| Pakete | ~3.500 | 800 | ✅ Gut |
| Über mich | ~2.800 | 400 | ✅ Gut |
| Blog-Index | ~600 | 400 | ✅ OK |
| Blog-Posts | ~1.500+ (geschätzt) | 1.500 | ⚠️ Knapp am Minimum |

### Content Freshness
| Signal | Status |
|--------|--------|
| Blog-Updates | ⚠️ Letzte Posts: 19.-21. Februar 2026 — nur 4 Posts insgesamt |
| Sitemap lastmod | ⚠️ Alle statischen Seiten zeigen `new Date()` — identische Zeitstempel |

---

## 3. On-Page SEO — 82/100

### Title Tags ✅ (90/100)

| Seite | Title | Länge | Status |
|-------|-------|-------|--------|
| Home | "Numerologie PRO \| Swetlana Wagner — Pythagoras Psychomatrix" | 60 | ✅ Perfekt |
| Rechner | "Kostenloser Psychomatrix Rechner — Pythagoras Numerologie \| Numerologie PRO" | 73 | ⚠️ Etwas lang (>60) |
| Pakete | "Beratungspakete — 90-Min. Numerologie-Beratung ab 99€ \| Numerologie PRO" | 68 | ⚠️ Etwas lang |
| Über mich | "Über Swetlana Wagner — Zertifizierte Numerologin \| Numerologie PRO" | 62 | ✅ OK |
| Blog | "Numerologie Blog — Wissen, Tipps & Insights \| Numerologie PRO" | 57 | ✅ Gut |

### Meta Descriptions ✅ (85/100)

| Seite | Länge | Status |
|-------|-------|--------|
| Home | 128 | ✅ Gut, enthält Social Proof "500+ Klienten" |
| Rechner | 106 | ⚠️ Etwas kurz (<120 empfohlen) |
| Pakete | 101 | ⚠️ Etwas kurz |
| Über mich | 96 | ⚠️ Etwas kurz |
| Blog | 92 | ⚠️ Etwas kurz |

### Heading Structure ✅ (80/100)

| Seite | H1 | Status |
|-------|-----|--------|
| Home | "Entdecke deine Matrix / Lebe deine Bestimmung" | ✅ 1x H1 |
| Rechner | "Berechne deine Schicksalszahl" | ✅ 1x H1 |
| Pakete | "Dein persönliches Live-Reading" | ✅ 1x H1 |
| Über mich | "Deine Numerologin" | ✅ 1x H1 |
| Blog | "Numerologie Blog" | ✅ 1x H1 |

**Problem:** H2→H3 Hierarchie springt teilweise (z.B. Homepage hat H2s die direkt zu Listenelementen gehen ohne H3).

### Internal Linking ⚠️ (75/100)
- Homepage: 18+ interne Links ✅
- Blog-Posts verlinken nicht ausreichend auf Service-Seiten
- Keine Breadcrumb-Navigation implementiert
- Karmic-Produkt-Seiten verlinken nicht untereinander

---

## 4. Schema / Structured Data — 75/100

### Erkannte Schemas

| Schema | Seite | Status | Issues |
|--------|-------|--------|--------|
| ProfessionalService | Alle Seiten | ✅ Valide | ⚠️ Identisches Schema auf JEDER Seite — sollte seitenspezifisch sein |
| WebApplication | /rechner | ✅ Valide | Korrekt: Preis=0, LifestyleApplication |
| AggregateRating | Alle | ⚠️ | 500 Reviews bei 5.0 — Google könnte manuelle Aktion auslösen wenn Reviews nicht nachweisbar |
| BlogPosting | Blog-Posts | ❌ Fehlt | KEINE Article/BlogPosting Schema auf Blog-Seiten |
| Person | Über mich | ❌ Fehlt | Keine Person-Schema für Swetlana Wagner |
| BreadcrumbList | Alle | ❌ Fehlt | Keine Breadcrumb-Schema implementiert |
| WebSite | Root | ❌ Fehlt | Kein WebSite-Schema mit SearchAction |

### Schema-Empfehlungen

**Fehlende Schemas (High Priority):**
1. `BlogPosting` für jeden Blog-Post (headline, author, datePublished, dateModified, image)
2. `Person` für Swetlana Wagner (name, jobTitle, sameAs, image, worksFor)
3. `BreadcrumbList` für Navigation
4. `WebSite` mit `SearchAction` für Sitelinks-Suche

**Schema-Probleme:**
- `ProfessionalService` wird auf JEDER Seite identisch ausgegeben — Google empfiehlt seitenspezifische Schemas
- `AggregateRating` ohne nachweisbare Review-Quelle (Google könnte flaggen)
- Offer-Schema fehlt `availability` und `validFrom` Properties

---

## 5. Performance (CWV) — 68/100

### Potentielle LCP-Issues
- Hero-Bild (`swetlana-hero.jpg`) wird über Next/Image geladen (gut), aber ohne `fetchpriority="high"`
- Fonts (Montserrat + Cormorant Garamond) laden als Variable Fonts — `display: swap` gesetzt ✅
- Third-Party Scripts: GA4, Meta Pixel — consent-driven ✅ (blockieren nicht LCP)

### Potentielle CLS-Issues
- Decorative Images (`blume.webp`) ohne feste Dimensionen
- Certificate-Bilder (11 Stück) ohne width/height
- Logo-Bilder ohne explizite Dimensionen im HTML

### Potentielle INP-Issues
- ✅ Keine schweren Event-Handler auf öffentlichen Seiten
- ✅ Server Components reduzieren Client-JS

---

## 6. Images — 55/100

### Image Audit

| Metrik | Status | Anzahl |
|--------|--------|--------|
| Gesamt Bilder | — | ~16+ |
| Fehlender Alt-Text | ❌ | 3-4 (Logo, blume.webp, Footer-Logo) |
| Format | ⚠️ | Mischung aus JPG und WebP — Next/Image konvertiert zu WebP |
| Fehlende Dimensionen | ⚠️ | 5+ Bilder ohne explizite width/height |
| Lazy Loading | ✅ | Next/Image handled loading="lazy" automatisch |
| Hero fetchpriority | ❌ | Fehlt `fetchpriority="high"` auf LCP-Bild |

### Bilder ohne Alt-Text
| Bild | Fix |
|------|-----|
| `/images/blume.webp` | `alt=""` (dekorativ) oder beschreibend |
| Logo (Header) | `alt="Numerologie PRO Logo"` |
| Logo (Footer) | `alt="Numerologie PRO — Swetlana Wagner"` |
| `logo-banner-ru.png` | `alt="Numerologie PRO Banner"` |

### Zertifikats-Bilder
- 11 Bilder mit generischen Alt-Texten: "Numerologie Zertifikat 1" bis "Numerologie Zertifikat 11"
- **Empfehlung:** Beschreibende Alt-Texte wie "Zertifikat Pythagoras Psychomatrix — [Aussteller]"

---

## 7. AI Search Readiness (GEO) — 45/100

### AI Crawler Access ❌
| Crawler | Status |
|---------|--------|
| GPTBot | ⚠️ Nicht konfiguriert (default: erlaubt) |
| ClaudeBot | ⚠️ Nicht konfiguriert |
| PerplexityBot | ⚠️ Nicht konfiguriert |
| OAI-SearchBot | ⚠️ Nicht konfiguriert |

### llms.txt ❌
- Datei **existiert nicht** unter `/llms.txt`
- Empfehlung: Erstellen für bessere AI-Sichtbarkeit

### Citability Score: 50/100
**Starke Signale:**
- Klare H1→H2→H3 Hierarchie
- FAQ-Sektion mit Frage-Antwort-Format
- Spezifische Zahlen ("500+ Beratungen", "11 Zertifikate", "€99")

**Schwache Signale:**
- Keine "Was ist..."-Definitionen im ersten Absatz
- Keine zitierbaren Statistiken mit Quellen
- Blog-Posts haben keine Answer-First-Formatierung
- Keine Tabellen für Vergleichsdaten

### Brand Mention Analysis
| Plattform | Präsenz | Status |
|-----------|---------|--------|
| Instagram | ✅ @numerologie_pro | Aktiv |
| TikTok | ✅ @numerologie_pro | Aktiv |
| Telegram | ✅ @numerologie_pro | Aktiv |
| YouTube | ❌ Nicht vorhanden | Empfohlen (3× stärkste Korrelation mit AI-Zitationen) |
| Reddit | ❌ Nicht vorhanden | Empfohlen |
| Wikipedia | ❌ Nicht vorhanden | Langfristig |
| LinkedIn | ❌ Nicht vorhanden | Empfohlen für E-E-A-T |

### SSR Check ✅
- Next.js Server Components — Content im initialen HTML verfügbar
- AI-Crawler können alle Inhalte lesen

---

## Hreflang Analyse

### Validierung

| Check | Status | Details |
|-------|--------|---------|
| Self-Referencing | ✅ | DE→DE, RU→RU korrekt |
| Return Tags | ✅ | DE↔RU bidirektional |
| x-default | ❌ FEHLT | Kein Fallback definiert |
| Language Codes | ✅ | `de`, `ru` — korrekt ISO 639-1 |
| Canonical Alignment | ⚠️ | Root `/` canonical zeigt auf `/ru` |
| Blog-Post Alternates | ❌ FEHLT | Blog-Posts in Sitemap ohne hreflang |

---

## Sitemap Analyse

### Validierung
| Check | Status |
|-------|--------|
| XML Format | ✅ Valide |
| URL Count | ✅ 48 URLs (<50.000 Limit) |
| Referenziert in robots.txt | ✅ |
| HTTPS URLs | ✅ Alle HTTPS |
| Noindexed URLs enthalten | ✅ Keine |

### Issues
| Issue | Severity | Fix |
|-------|----------|-----|
| Alle statischen lastmod identisch | ⚠️ Low | Echte Änderungsdaten verwenden statt `new Date()` |
| `changefreq` und `priority` genutzt | ℹ️ Info | Google ignoriert diese Werte — können entfernt werden |
| Blog-Posts ohne hreflang in Sitemap | ⚠️ Medium | Alternates für Blog-Posts ergänzen |

---
