# SEO Action Plan — numerologie-pro.com

**Aktueller Score:** 72/100
**Ziel-Score:** 88+/100
**Geschätzter Zeitrahmen:** 4-6 Wochen

---

## Critical (Sofort beheben)

### 1. x-default Hreflang hinzufügen
**Impact:** +5 Score | **Aufwand:** 15 Min
**Datei:** `app/layout.tsx`

Ohne `x-default` weiß Google nicht, welche Sprache Nutzern angezeigt werden soll, die weder DE noch RU sprechen.

**Fix:** In `app/layout.tsx` alternates ergänzen:
```typescript
alternates: {
  canonical: BASE_URL,
  languages: {
    'de': `${BASE_URL}/de`,
    'ru': `${BASE_URL}/ru`,
    'x-default': `${BASE_URL}/de`,  // ← HINZUFÜGEN
  },
},
```

Und in `lib/seo/metadata.ts` → `getPageMetadata()`:
```typescript
languages: {
  de: `${BASE_URL}/de${routePath}`,
  ru: `${BASE_URL}/ru${routePath}`,
  'x-default': `${BASE_URL}/de${routePath}`,  // ← HINZUFÜGEN
},
```

### 2. Blog-Posts ohne hreflang in Sitemap
**Impact:** +3 Score | **Aufwand:** 10 Min
**Datei:** `app/sitemap.ts`

Blog-Posts haben aktuell KEINE hreflang-Alternates in der Sitemap.

**Fix:** In `app/sitemap.ts` Blog-Sektion ergänzen:
```typescript
// Blog posts — MIT hreflang
for (const locale of locales) {
  const posts = getBlogPosts(locale);
  for (const post of posts) {
    entries.push({
      url: `${BASE_URL}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {        // ← HINZUFÜGEN
        languages: {
          de: `${BASE_URL}/de/blog/${post.slug}`,
          ru: `${BASE_URL}/ru/blog/${post.slug}`,
        },
      },
    });
  }
}
```

### 3. AggregateRating Risiko entschärfen
**Impact:** Penalty-Prävention | **Aufwand:** 30 Min

500 Reviews bei 5.0 Sternen ohne nachweisbare Quelle — Google könnte manuelle Aktion auslösen.

**Optionen:**
- A) Reviews auf eine Drittplattform bringen (Google Business, Trustpilot) und als `review` Schema verlinken
- B) `reviewCount` auf tatsächliche nachweisbare Anzahl reduzieren
- C) Reviews mit `Review` Sub-Schemas und echten Kundennamen versehen

---

## High Priority (Innerhalb 1 Woche)

### 4. BlogPosting Schema für alle Blog-Posts
**Impact:** +3 Score | **Aufwand:** 45 Min
**Neue Datei:** `components/seo/BlogPostJsonLd.tsx`

```typescript
export function BlogPostJsonLd({ post, locale }: { post: BlogPost; locale: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    author: {
      '@type': 'Person',
      name: 'Swetlana Wagner',
      url: `https://numerologie-pro.com/${locale}/ueber-mich`,
      jobTitle: locale === 'de' ? 'Zertifizierte Numerologin' : 'Сертифицированный нумеролог',
    },
    datePublished: post.date,
    dateModified: post.date,
    image: post.image || 'https://numerologie-pro.com/og-image.png',
    publisher: {
      '@type': 'Organization',
      name: 'Numerologie PRO',
      logo: {
        '@type': 'ImageObject',
        url: 'https://numerologie-pro.com/images/Logo_SwetlanaWagner_1080x1080px_weiss_Kreis.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://numerologie-pro.com/${locale}/blog/${post.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### 5. Person Schema für Swetlana Wagner
**Impact:** +3 Score | **Aufwand:** 30 Min
**Datei:** `components/seo/JsonLd.tsx` — neue Export-Funktion

```typescript
export function PersonJsonLd({ locale }: { locale: string }) {
  const isDE = locale === 'de';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Swetlana Wagner',
    jobTitle: isDE ? 'Zertifizierte Numerologin' : 'Сертифицированный нумеролог',
    url: `https://numerologie-pro.com/${locale}/ueber-mich`,
    image: 'https://numerologie-pro.com/images/swetlana-about.jpg',
    worksFor: {
      '@type': 'Organization',
      name: 'Numerologie PRO',
    },
    sameAs: [
      'https://www.instagram.com/numerologie_pro',
      'https://t.me/numerologie_pro',
      'https://www.tiktok.com/@numerologie_pro',
    ],
    knowsAbout: ['Numerologie', 'Psychomatrix', 'Pythagoras'],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

Einbinden auf `/ueber-mich` und in Blog-Posts.

### 6. BreadcrumbList Schema
**Impact:** +2 Score | **Aufwand:** 45 Min
**Neue Datei:** `components/seo/BreadcrumbJsonLd.tsx`

```typescript
export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### 7. AI-Crawler in robots.txt konfigurieren
**Impact:** +3 Score | **Aufwand:** 15 Min
**Datei:** `app/robots.ts`

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/auth/'],
      },
      // AI-Crawler explizit erlauben für AI-Sichtbarkeit
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      // AI-Training blockieren
      { userAgent: 'CCBot', disallow: '/' },
      { userAgent: 'Google-Extended', disallow: '/' },
      { userAgent: 'Bytespider', disallow: '/' },
    ],
    sitemap: 'https://numerologie-pro.com/sitemap.xml',
  };
}
```

---

## Medium Priority (Innerhalb 1 Monat)

### 8. llms.txt erstellen
**Impact:** +2 Score | **Aufwand:** 20 Min
**Neue Datei:** `public/llms.txt`

```
# Numerologie PRO — Swetlana Wagner
> Professionelle Numerologie-Beratung nach Pythagoras. Psychomatrix-Analyse und Lebensberatung.

## Kernseiten
- [Kostenloser Psychomatrix Rechner](https://numerologie-pro.com/de/rechner): Berechne deine Persönlichkeitsmatrix nach Pythagoras kostenlos
- [Beratungspakete](https://numerologie-pro.com/de/pakete): 4 Beratungspakete ab 99€, 90-120 Min per Zoom/Telegram
- [Über Swetlana Wagner](https://numerologie-pro.com/de/ueber-mich): Zertifizierte Numerologin mit 10+ Jahren Erfahrung
- [Numerologie Blog](https://numerologie-pro.com/de/blog): Expertenwissen zu Psychomatrix und Numerologie

## Key Facts
- 500+ zufriedene Klienten
- 11 Zertifikate in Numerologie
- Sprachen: Deutsch und Russisch
- Online-Beratung weltweit verfügbar
```

### 9. Meta Descriptions verlängern
**Impact:** +1 Score | **Aufwand:** 30 Min
**Datei:** `lib/seo/metadata.ts`

Alle Descriptions auf 140-160 Zeichen erweitern. Aktuelle Längen (96-106) verschenken CTR-Potential.

### 10. Title Tags kürzen
**Impact:** +1 Score | **Aufwand:** 15 Min

Rechner-Title (73 Zeichen) und Pakete-Title (68 Zeichen) kürzen auf max. 60 Zeichen:
- Rechner: `"Kostenloser Psychomatrix Rechner | Numerologie PRO"` (49 Zeichen)
- Pakete: `"Numerologie-Beratung ab 99€ | Numerologie PRO"` (46 Zeichen)

### 11. Alt-Texte für alle Bilder ergänzen
**Impact:** +2 Score | **Aufwand:** 30 Min

| Bild | Empfohlener Alt-Text |
|------|---------------------|
| `blume.webp` | `alt=""` (dekorativ, role="presentation") |
| Header-Logo | `"Numerologie PRO — Swetlana Wagner Logo"` |
| Footer-Logo | `"Numerologie PRO"` |
| `logo-banner-ru.png` | `"Numerologie PRO Banner Russisch"` |

### 12. WebSite Schema mit SearchAction
**Impact:** +1 Score | **Aufwand:** 20 Min

```typescript
export function WebSiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Numerologie PRO',
    url: 'https://numerologie-pro.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://numerologie-pro.com/de/blog?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### 13. Sitemap lastmod korrigieren
**Impact:** +1 Score | **Aufwand:** 15 Min
**Datei:** `app/sitemap.ts`

Statt `new Date()` (identische Timestamps) echte Änderungsdaten verwenden oder feste Daten setzen.

### 14. Blog-Strategie: Content-Kalender
**Impact:** +5 Score (langfristig) | **Aufwand:** laufend

Aktuell nur 4 Blog-Posts. Empfehlung:
- 2 Posts pro Woche für 3 Monate
- Themen: Schicksalszahlen 1-9, Jahresprognosen, Beziehungstypen
- Jeder Post 1.500+ Wörter mit Answer-First-Format
- Interne Verlinkung zum Rechner und zu Paketen

---

## Low Priority (Backlog)

### 15. YouTube-Kanal aufbauen
YouTube-Mentions haben die stärkste Korrelation (0.737) mit AI-Zitationen. Kurze Videos zu Numerologie-Themen.

### 16. LinkedIn-Profil für Swetlana Wagner
Stärkt E-E-A-T Authoritativeness und AI-Brand-Signale.

### 17. Google Business Profile erstellen
Für lokale Sichtbarkeit (auch wenn online-basiert, Standort in DE).

### 18. Breadcrumb-Navigation im UI implementieren
Neben dem Schema auch visuell auf der Seite darstellen.

### 19. Hero-Bild fetchpriority="high"
Auf der Homepage `fetchpriority="high"` für das Hero-Bild setzen, um LCP zu verbessern.

### 20. Blog-Posts intern vernetzen
Jeder Blog-Post sollte 3-5 interne Links enthalten (zu anderen Posts, zum Rechner, zu Paketen).

---

## Score-Projektion nach Umsetzung

| Phase | Maßnahmen | Erwarteter Score |
|-------|-----------|-----------------|
| Jetzt | 72/100 | Aktuell |
| Woche 1 (Critical) | #1-3 | 78/100 |
| Woche 2 (High) | #4-7 | 85/100 |
| Monat 1 (Medium) | #8-14 | 88/100 |
| Monat 3+ (Low + Content) | #15-20 | 92+/100 |

---

*Report generiert am 2. März 2026 — Claude SEO Skill v1.0*
