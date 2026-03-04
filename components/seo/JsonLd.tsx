export function LocalBusinessJsonLd({ locale }: { locale: string }) {
  const isDE = locale === 'de';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Numerologie PRO — Swetlana Wagner',
    description: isDE
      ? 'Professionelle Numerologie-Beratung nach Pythagoras. Psychomatrix-Analyse, Persönlichkeitsberatung und Lebensberatung.'
      : 'Профессиональная нумерологическая консультация по Пифагору. Анализ психоматрицы, консультации по личности и жизни.',
    url: `https://numerologie-pro.com/${locale}`,
    image: 'https://numerologie-pro.com/og-image.png',
    telephone: '+4915151668273',
    email: 'info@numerologie-pro.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'München',
      addressRegion: 'Bayern',
      addressCountry: 'DE',
    },
    priceRange: '€€',
    areaServed: {
      '@type': 'GeoShape',
      name: isDE ? 'Weltweit (Online)' : 'По всему миру (онлайн)',
    },
    serviceType: isDE ? 'Numerologie-Beratung' : 'Нумерологическая консультация',
    availableLanguage: [
      { '@type': 'Language', name: 'German', alternateName: 'de' },
      { '@type': 'Language', name: 'Russian', alternateName: 'ru' },
    ],
    sameAs: [
      'https://www.instagram.com/numerologie_pro',
      'https://t.me/numerologie_pro',
      'https://www.tiktok.com/@numerologie_pro',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: isDE ? 'Numerologie Beratungspakete' : 'Пакеты нумерологических консультаций',
      itemListElement: [
        {
          '@type': 'Offer',
          name: isDE ? 'Beziehungsmatrix' : 'Матрица отношений',
          price: '99.00',
          priceCurrency: 'EUR',
          description: isDE
            ? '90-120 Minuten Numerologie-Beratung zu Partnerschaft & Liebe'
            : '90-120 минут нумерологической консультации по отношениям и любви',
          availability: 'https://schema.org/OnlineOnly',
          url: `https://numerologie-pro.com/${locale}/pakete`,
        },
        {
          '@type': 'Offer',
          name: isDE ? 'Lebensbestimmung' : 'Предназначение',
          price: '99.00',
          priceCurrency: 'EUR',
          description: isDE
            ? '90-120 Minuten Numerologie-Beratung zu Lebensweg & Beruf'
            : '90-120 минут нумерологической консультации по жизненному пути и карьере',
          availability: 'https://schema.org/OnlineOnly',
          url: `https://numerologie-pro.com/${locale}/pakete`,
        },
        {
          '@type': 'Offer',
          name: 'PDF-Analyse',
          price: '9.99',
          priceCurrency: 'EUR',
          description: isDE
            ? 'Detaillierte Psychomatrix PDF-Analyse per Email'
            : 'Детальный PDF-анализ психоматрицы по электронной почте',
          availability: 'https://schema.org/OnlineOnly',
          url: `https://numerologie-pro.com/${locale}/pakete`,
        },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '47',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Marina K.' },
        datePublished: '2025-11-15',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody: isDE
          ? 'Swetlana hat mir mit ihrer Psychomatrix-Analyse die Augen geöffnet. Sehr professionell!'
          : 'Светлана открыла мне глаза своим анализом психоматрицы. Очень профессионально!',
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Thomas W.' },
        datePublished: '2025-12-03',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody: isDE
          ? 'Die Beratung war unglaublich tiefgründig. Kann ich nur weiterempfehlen.'
          : 'Консультация была невероятно глубокой. Могу только рекомендовать.',
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Elena S.' },
        datePublished: '2026-01-20',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody: isDE
          ? 'Meine Jahresprognose war erstaunlich genau. Vielen Dank, Swetlana!'
          : 'Мой годовой прогноз оказался удивительно точным. Большое спасибо, Светлана!',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function PersonJsonLd({ locale }: { locale: string }) {
  const isDE = locale === 'de';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Swetlana Wagner',
    jobTitle: isDE ? 'Zertifizierte Numerologin' : 'Сертифицированный нумеролог',
    url: `https://numerologie-pro.com/${locale}/ueber-mich`,
    image: 'https://numerologie-pro.com/images/swetlana-hero.jpg',
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

export function WebSiteJsonLd({ locale = 'de' }: { locale?: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Numerologie PRO',
    url: 'https://numerologie-pro.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: `https://numerologie-pro.com/${locale}/blog?q={search_term_string}`,
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

export function BlogPostJsonLd({
  post,
  locale,
}: {
  post: { title: string; description: string; date: string; author: string; slug: string; image?: string };
  locale: string;
}) {
  const isDE = locale === 'de';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.author,
      url: `https://numerologie-pro.com/${locale}/ueber-mich`,
      jobTitle: isDE ? 'Zertifizierte Numerologin' : 'Сертифицированный нумеролог',
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
    inLanguage: locale,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebApplicationJsonLd({ locale }: { locale: string }) {
  const isDE = locale === 'de';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Numerologie PRO Psychomatrix Rechner',
    description: isDE
      ? 'Kostenloser Pythagoras Psychomatrix Rechner — berechne deine Persönlichkeitsmatrix anhand deines Geburtsdatums.'
      : 'Бесплатный калькулятор психоматрицы Пифагора — рассчитайте вашу матрицу личности по дате рождения.',
    url: `https://numerologie-pro.com/${locale}/rechner`,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    inLanguage: [locale],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function CollectionPageJsonLd({
  locale,
  posts,
}: {
  locale: string;
  posts: { title: string; slug: string; description: string; date: string }[];
}) {
  const isDE = locale === 'de';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: isDE ? 'Numerologie Blog' : 'Блог нумерологии',
    description: isDE
      ? 'Expertenwissen rund um Pythagoras Psychomatrix, Persönlichkeitsentwicklung und die Kraft der Zahlen.'
      : 'Экспертные знания о психоматрице Пифагора, развитии личности и силе чисел.',
    url: `https://numerologie-pro.com/${locale}/blog`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://numerologie-pro.com/${locale}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
