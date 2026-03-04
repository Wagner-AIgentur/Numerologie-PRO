/**
 * Firecrawl Website Scraping Client
 *
 * Crawls competitor websites, blogs, and landing pages.
 * Extracts structured content (Markdown), SEO data, and metadata.
 * Used alongside Apify (social media) for full competitor analysis.
 */

import FirecrawlApp from '@mendable/firecrawl-js';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

function getClient() {
  if (!FIRECRAWL_API_KEY) throw new Error('FIRECRAWL_API_KEY not set');
  return new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });
}

// ── Types ─────────────────────────────────────────────

export interface ScrapedPage {
  url: string;
  title: string;
  description: string;
  markdown: string;
  metadata: Record<string, string>;
  links: string[];
}

export interface CrawlResult {
  pages: ScrapedPage[];
  totalPages: number;
}

// ── Single Page Scrape ────────────────────────────────

export async function scrapePage(url: string): Promise<ScrapedPage> {
  const app = getClient();
  const result = await app.v1.scrapeUrl(url, { formats: ['markdown'] });

  if (!result.success) {
    throw new Error(`Firecrawl scrape failed: ${url}`);
  }

  const r = result as unknown as Record<string, unknown>;
  const meta = r.metadata as Record<string, string> | undefined;
  const md = r.markdown as string | undefined;
  const links = r.links as string[] | undefined;

  return {
    url,
    title: meta?.title ?? '',
    description: meta?.description ?? '',
    markdown: md ?? '',
    metadata: meta ?? {},
    links: links ?? [],
  };
}

// ── Full Website Crawl ────────────────────────────────

export async function crawlWebsite(
  url: string,
  options?: { maxPages?: number; includePaths?: string[]; excludePaths?: string[] },
): Promise<CrawlResult> {
  const app = getClient();
  const maxPages = options?.maxPages ?? 20;

  const result = await app.v1.crawlUrl(url, {
    limit: maxPages,
    scrapeOptions: { formats: ['markdown'] },
    ...(options?.includePaths && { includePaths: options.includePaths }),
    ...(options?.excludePaths && { excludePaths: options.excludePaths }),
  });

  if (!result.success) {
    throw new Error(`Firecrawl crawl failed: ${url}`);
  }

  const data = (result as unknown as Record<string, unknown>).data as Record<string, unknown>[] | undefined;

  const pages: ScrapedPage[] = (data ?? []).map((page) => {
    const meta = page.metadata as Record<string, string> | undefined;
    return {
      url: meta?.sourceURL ?? url,
      title: meta?.title ?? '',
      description: meta?.description ?? '',
      markdown: (page.markdown as string) ?? '',
      metadata: meta ?? {},
      links: (page.links as string[]) ?? [],
    };
  });

  return { pages, totalPages: pages.length };
}

// ── Blog Post Extraction ──────────────────────────────

export async function crawlBlog(
  websiteUrl: string,
  blogPath = '/blog',
  maxPosts = 10,
): Promise<ScrapedPage[]> {
  const result = await crawlWebsite(websiteUrl, {
    maxPages: maxPosts + 1,
    includePaths: [`${blogPath}/*`],
  });

  return result.pages.filter((p) => p.url !== `${websiteUrl}${blogPath}` && p.markdown.length > 200);
}

// ── Search + Scrape ───────────────────────────────────

export async function searchAndScrape(query: string, limit = 5): Promise<ScrapedPage[]> {
  const app = getClient();
  const result = await app.v1.search(query, { limit });

  if (!result.success) return [];

  const data = (result as unknown as Record<string, unknown>).data as Record<string, unknown>[] | undefined;

  return (data ?? []).map((item) => ({
    url: (item.url as string) ?? '',
    title: (item.title as string) ?? '',
    description: (item.description as string) ?? '',
    markdown: (item.markdown as string) ?? '',
    metadata: {},
    links: [],
  }));
}

// ── Page Classification Helpers ───────────────────────

const BLOG_PATTERNS = /\/(blog|artikel|beitraege|news|articles|beitrag|post|magazin|journal|ratgeber)\//i;
const PRODUCT_PATTERNS = /\/(produkt|product|shop|angebot|paket|pakete|pricing|preise|leistung|service|kurs|course)\//i;
const LEGAL_PATTERNS = /\/(impressum|datenschutz|agb|privacy|terms|legal|cookie|kontakt|contact)\/?$/i;

function isBlogPost(url: string): boolean {
  return BLOG_PATTERNS.test(url);
}

function isProductPage(page: ScrapedPage): boolean {
  if (PRODUCT_PATTERNS.test(page.url)) return true;
  const lowerMd = page.markdown.toLowerCase();
  return (lowerMd.includes('€') || lowerMd.includes('eur') || lowerMd.includes('preis')) &&
    (lowerMd.includes('buchen') || lowerMd.includes('kaufen') || lowerMd.includes('bestellen') || lowerMd.includes('add to cart'));
}

function isLegalPage(url: string): boolean {
  return LEGAL_PATTERNS.test(url);
}

function classifyPage(page: ScrapedPage): 'article' | 'product' | 'service' | 'landing' {
  if (isBlogPost(page.url)) return 'article';
  if (isProductPage(page)) return 'product';
  if (/\/(leistung|service|angebot|beratung|coaching)\//i.test(page.url)) return 'service';
  return 'landing';
}

// ── Competitor Website Analysis Helper ────────────────

export interface CompetitorWebsiteResult {
  homepage: ScrapedPage;
  blogPosts: ScrapedPage[];
  productPages: ScrapedPage[];
  otherPages: ScrapedPage[];
  totalPagesFound: number;
}

export async function scrapeCompetitorWebsite(websiteUrl: string): Promise<CompetitorWebsiteResult> {
  // Full site crawl instead of just homepage + blog
  const crawl = await crawlWebsite(websiteUrl, {
    maxPages: 15,
    excludePaths: ['/impressum*', '/datenschutz*', '/agb*', '/privacy*', '/terms*', '/cookie*'],
  });

  if (crawl.pages.length === 0) {
    // Fallback: try single page scrape if crawl returns nothing
    const homepage = await scrapePage(websiteUrl);
    return { homepage, blogPosts: [], productPages: [], otherPages: [], totalPagesFound: 1 };
  }

  // Find homepage (exact URL match or first page)
  const homepage = crawl.pages.find((p) => {
    const clean = p.url.replace(/\/$/, '');
    const target = websiteUrl.replace(/\/$/, '');
    return clean === target;
  }) ?? crawl.pages[0];

  // Filter out legal pages and pages with minimal content
  const contentPages = crawl.pages.filter(
    (p) => p !== homepage && !isLegalPage(p.url) && p.markdown.length > 50,
  );

  // Categorize pages
  const blogPosts = contentPages.filter((p) => isBlogPost(p.url));
  const productPages = contentPages.filter((p) => !isBlogPost(p.url) && isProductPage(p));
  const otherPages = contentPages.filter((p) => !blogPosts.includes(p) && !productPages.includes(p));

  return {
    homepage,
    blogPosts,
    productPages,
    otherPages,
    totalPagesFound: crawl.pages.length,
  };
}

export { classifyPage };
