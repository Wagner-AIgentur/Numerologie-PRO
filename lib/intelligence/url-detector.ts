/**
 * URL Auto-Detection Service
 *
 * Detects platform from any URL input and extracts handle/username.
 * Supports: Instagram, TikTok, YouTube, Facebook, LinkedIn, generic websites.
 */

export interface DetectedUrl {
  platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'linkedin' | 'website';
  handle: string | null;
  url: string;
  type: 'social' | 'website';
}

const PLATFORM_PATTERNS: Array<{
  platform: DetectedUrl['platform'];
  regex: RegExp;
  handleIndex: number;
}> = [
  {
    platform: 'instagram',
    regex: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?/,
    handleIndex: 1,
  },
  {
    platform: 'tiktok',
    regex: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?([a-zA-Z0-9._]+)\/?/,
    handleIndex: 1,
  },
  {
    platform: 'youtube',
    regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:@|channel\/|c\/)?([a-zA-Z0-9._-]+)\/?/,
    handleIndex: 1,
  },
  {
    platform: 'facebook',
    regex: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([a-zA-Z0-9._-]+)\/?/,
    handleIndex: 1,
  },
  {
    platform: 'linkedin',
    regex: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:company|in)\/([a-zA-Z0-9._-]+)\/?/,
    handleIndex: 1,
  },
];

/** Validate that input looks like a URL or social handle */
export function validateUrlInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return 'URL darf nicht leer sein';
  if (trimmed.length < 3) return 'URL ist zu kurz';

  // Bare handle without platform context — ambiguous
  if (trimmed.startsWith('@') && !trimmed.includes('.')) {
    return 'Bitte eine vollständige URL eingeben (z.B. https://instagram.com/' + trimmed.replace('@', '') + ')';
  }

  // Must contain a dot (domain) or be a known social URL
  const hasKnownPlatform = PLATFORM_PATTERNS.some(({ regex }) => regex.test(trimmed));
  if (!hasKnownPlatform && !trimmed.includes('.')) {
    return 'Bitte eine gültige URL eingeben (z.B. https://example.com oder https://instagram.com/username)';
  }

  return null; // valid
}

/** Detect platform and extract handle from any URL or handle string */
export function detectUrl(input: string): DetectedUrl {
  const trimmed = input.trim();

  for (const { platform, regex, handleIndex } of PLATFORM_PATTERNS) {
    const match = trimmed.match(regex);
    if (match?.[handleIndex]) {
      const handle = match[handleIndex].replace('@', '');
      const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      return { platform, handle, url, type: 'social' };
    }
  }

  // Generic website — ensure it has a domain
  const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  return { platform: 'website', handle: null, url, type: 'website' };
}

/** Detect multiple URLs from newline-separated input */
export function detectUrls(input: string): DetectedUrl[] {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(detectUrl);
}
