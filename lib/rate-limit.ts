/**
 * Rate limiter with Upstash Redis backend.
 * Falls back to in-memory store when UPSTASH env vars are missing (dev mode).
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ---------------------------------------------------------------------------
// Upstash Redis client (only created when env vars are present)
// ---------------------------------------------------------------------------

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

if (!redis && process.env.NODE_ENV === 'production') {
  console.warn('[SECURITY] Upstash Redis not configured — rate limiting uses in-memory fallback. This is UNSAFE in production with multiple serverless instances.');
}

// ---------------------------------------------------------------------------
// Pre-configured limiters (reuse across requests for connection pooling)
// ---------------------------------------------------------------------------

/** Default: 10 req / 60s sliding window */
const defaultLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '60 s') })
  : null;

/** Auth endpoints: 3 req / 5min */
const authLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '5 m') })
  : null;

/** Strict: 5 req / 60s (for sensitive ops) */
const strictLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '60 s') })
  : null;

// ---------------------------------------------------------------------------
// In-memory fallback (development only)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memStore = new Map<string, RateLimitEntry>();

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    memStore.forEach((entry, key) => {
      if (entry.resetAt < now) memStore.delete(key);
    });
  }, 5 * 60 * 1000);
}

function memoryRateLimit(
  identifier: string,
  max: number,
  windowSeconds: number
): boolean {
  const now = Date.now();
  const entry = memStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    memStore.set(identifier, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }

  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type RateLimitPreset = 'default' | 'auth' | 'strict';

interface RateLimitOptions {
  /** Max requests per window (used for in-memory fallback) */
  max?: number;
  /** Window size in seconds (used for in-memory fallback) */
  windowSeconds?: number;
  /** Preset limiter to use with Upstash */
  preset?: RateLimitPreset;
}

const presetMap = {
  default: { limiter: defaultLimiter, max: 10, window: 60 },
  auth: { limiter: authLimiter, max: 3, window: 300 },
  strict: { limiter: strictLimiter, max: 5, window: 60 },
};

/**
 * Check if a request should be rate-limited.
 * @returns `true` if the request is allowed, `false` if rate-limited.
 */
export async function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): Promise<boolean> {
  const preset = options.preset ?? 'default';
  const config = presetMap[preset];

  // Upstash path
  if (config.limiter) {
    const { success } = await config.limiter.limit(identifier);
    return success;
  }

  // In-memory fallback
  const max = options.max ?? config.max;
  const windowSeconds = options.windowSeconds ?? config.window;
  return memoryRateLimit(identifier, max, windowSeconds);
}

/**
 * Extract client IP from request headers.
 * Uses Vercel's trusted header first (cannot be spoofed by clients),
 * then falls back to x-forwarded-for for local dev.
 */
export function getClientIp(request: Request): string {
  return (
    // Vercel sets this from its own edge infrastructure — trustworthy
    request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    // Fallback for local dev / other platforms
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Timing-safe string comparison to prevent timing attacks on secret tokens.
 * Uses HMAC to normalize both values to equal-length digests,
 * preventing length disclosure via timing side-channel.
 */
export function safeCompare(a: string, b: string): boolean {
  try {
    const crypto = require('crypto');
    // HMAC normalizes both values to 32-byte digests — no length leak
    const key = Buffer.alloc(32);
    const hmacA = crypto.createHmac('sha256', key).update(a).digest();
    const hmacB = crypto.createHmac('sha256', key).update(b).digest();
    return crypto.timingSafeEqual(hmacA, hmacB);
  } catch {
    return false;
  }
}
