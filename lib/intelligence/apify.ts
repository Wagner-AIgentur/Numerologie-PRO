/**
 * Apify Social Media Scraping Client
 *
 * Scrapes competitor profiles from Instagram, TikTok, YouTube
 * using Apify actors. Results are stored as content_intel entries.
 */

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_BASE = 'https://api.apify.com/v2';

export interface ApifyScrapeResult {
  platform: string;
  posts: ApifyPost[];
}

export interface ApifyPost {
  url: string;
  caption: string;
  media_type: 'video' | 'image' | 'carousel' | 'article';
  media_urls: string[];
  posted_at: string | null;
  engagement: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    saves?: number;
  };
}

// Apify actor IDs for each platform
const ACTORS: Record<string, string> = {
  instagram: 'apify~instagram-profile-scraper',
  tiktok: 'apify~tiktok-scraper',
  youtube: 'clockworks~youtube-scraper',
};

const APIFY_TIMEOUT_MS = 45_000; // 45s — safe margin for Vercel serverless

async function runActor(actorId: string, input: Record<string, unknown>): Promise<unknown[]> {
  if (!APIFY_API_TOKEN) throw new Error('APIFY_API_TOKEN nicht konfiguriert — bitte APIFY_API_TOKEN in .env setzen');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), APIFY_TIMEOUT_MS);

  try {
    const res = await fetch(`${APIFY_BASE}/acts/${actorId}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      const platform = actorId.split('~')[1] ?? actorId;
      console.error(`[Apify] Actor ${actorId} failed:`, res.status, err);
      throw new Error(`${platform} Scraper Fehler (${res.status}): ${err.substring(0, 100)}`);
    }

    return res.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Scraping Timeout nach ${APIFY_TIMEOUT_MS / 1000}s — Profil zu groß oder Apify überlastet`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function scrapeInstagram(handle: string, maxPosts = 20): Promise<ApifyPost[]> {
  const items = await runActor(ACTORS.instagram, {
    usernames: [handle.replace('@', '')],
    resultsLimit: maxPosts,
    resultsType: 'posts',
  }) as Array<Record<string, unknown>>;

  return items.map((item) => ({
    url: (item.url as string) ?? '',
    caption: (item.caption as string) ?? '',
    media_type: detectMediaType(item),
    media_urls: extractMediaUrls(item),
    posted_at: (item.timestamp as string) ?? null,
    engagement: {
      likes: item.likesCount as number | undefined,
      comments: item.commentsCount as number | undefined,
      views: item.videoViewCount as number | undefined,
    },
  }));
}

export async function scrapeTikTok(handle: string, maxPosts = 20): Promise<ApifyPost[]> {
  const items = await runActor(ACTORS.tiktok, {
    profiles: [handle.replace('@', '')],
    resultsPerPage: maxPosts,
    shouldDownloadVideos: false,
  }) as Array<Record<string, unknown>>;

  return items.map((item) => ({
    url: (item.webVideoUrl as string) ?? '',
    caption: (item.text as string) ?? '',
    media_type: 'video' as const,
    media_urls: item.videoUrl ? [item.videoUrl as string] : [],
    posted_at: (item.createTimeISO as string) ?? null,
    engagement: {
      likes: item.diggCount as number | undefined,
      comments: item.commentCount as number | undefined,
      shares: item.shareCount as number | undefined,
      views: item.playCount as number | undefined,
    },
  }));
}

export async function scrapeYouTube(channelUrl: string, maxPosts = 20): Promise<ApifyPost[]> {
  const items = await runActor(ACTORS.youtube, {
    startUrls: [{ url: channelUrl }],
    maxResults: maxPosts,
    sortBy: 'date',
  }) as Array<Record<string, unknown>>;

  return items.map((item) => ({
    url: (item.url as string) ?? '',
    caption: (item.title as string) ?? '',
    media_type: isShort(item) ? 'video' : 'video',
    media_urls: item.thumbnailUrl ? [item.thumbnailUrl as string] : [],
    posted_at: (item.date as string) ?? null,
    engagement: {
      likes: item.likes as number | undefined,
      comments: item.commentsCount as number | undefined,
      views: item.viewCount as number | undefined,
    },
  }));
}

/** Scrape a competitor on a given platform */
export async function scrapeCompetitor(
  platform: string,
  handle: string,
  maxPosts = 12,
): Promise<ApifyScrapeResult> {
  let posts: ApifyPost[];

  switch (platform) {
    case 'instagram':
      posts = await scrapeInstagram(handle, maxPosts);
      break;
    case 'tiktok':
      posts = await scrapeTikTok(handle, maxPosts);
      break;
    case 'youtube':
      posts = await scrapeYouTube(handle, maxPosts);
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  return { platform, posts };
}

// Helpers
function detectMediaType(item: Record<string, unknown>): ApifyPost['media_type'] {
  if (item.type === 'Sidecar' || item.childPosts) return 'carousel';
  if (item.type === 'Video' || item.isVideo) return 'video';
  return 'image';
}

function extractMediaUrls(item: Record<string, unknown>): string[] {
  if (item.displayUrl) return [item.displayUrl as string];
  if (item.imageUrl) return [item.imageUrl as string];
  return [];
}

function isShort(item: Record<string, unknown>): boolean {
  const url = (item.url as string) ?? '';
  return url.includes('/shorts/');
}
