import { MetadataRoute } from 'next';
import { getBlogPosts } from '@/lib/blog';

const BASE_URL = 'https://numerologie-pro.com';

const publicRoutes = [
  '',
  '/rechner',
  '/rechner/kompatibilitaet',
  '/pakete',
  '/ueber-mich',
  '/kontakt',
  '/blog',
  '/zertifikate',
  '/karmic/birthday-code',
  '/karmic/selfrealization',
  '/karmic/karmic-knots',
  '/karmic/year-forecast',
  '/agb',
  '/datenschutz',
  '/impressum',
  '/widerruf',
  '/voice-agent',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['de', 'ru'];

  const entries: MetadataRoute.Sitemap = [];

  // Static pages with fixed lastModified dates
  const lastUpdated = new Date('2026-03-01');
  for (const route of publicRoutes) {
    for (const locale of locales) {
      const url = `${BASE_URL}/${locale}${route}`;
      const isMainPage = route === '' || route === '/rechner' || route === '/pakete' || route === '/blog';

      entries.push({
        url,
        lastModified: lastUpdated,
        changeFrequency: isMainPage ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : isMainPage ? 0.8 : 0.6,
        alternates: {
          languages: {
            de: `${BASE_URL}/de${route}`,
            ru: `${BASE_URL}/ru${route}`,
            uk: `${BASE_URL}/ru${route}`,
            'x-default': `${BASE_URL}/de${route}`,
          },
        },
      });
    }
  }

  // Blog posts with hreflang alternates
  for (const locale of locales) {
    const posts = getBlogPosts(locale);
    for (const post of posts) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: {
            de: `${BASE_URL}/de/blog/${post.slug}`,
            ru: `${BASE_URL}/ru/blog/${post.slug}`,
            uk: `${BASE_URL}/ru/blog/${post.slug}`,
            'x-default': `${BASE_URL}/de/blog/${post.slug}`,
          },
        },
      });
    }
  }

  return entries;
}
