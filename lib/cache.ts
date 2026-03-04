/**
 * Caching utilities for admin data fetching.
 *
 * Uses Next.js unstable_cache for server-side data caching
 * and revalidatePath/revalidateTag for cache invalidation.
 *
 * Strategy:
 * - Dashboard stats: 60s cache (frequently viewed, rarely changes)
 * - Analytics: 120s cache (heavy queries, slow-changing data)
 * - List endpoints: 30s cache (need to feel fresh)
 * - Mutations: revalidate related tags after write
 */

import { unstable_cache } from 'next/cache';

// Re-export for convenience
export { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Cache tags used across the application.
 * Use these when calling revalidateTag() after mutations.
 */
export const CacheTags = {
  DASHBOARD: 'dashboard-stats',
  ANALYTICS: 'analytics',
  CUSTOMERS: 'customers',
  LEADS: 'leads',
  ORDERS: 'orders',
  SESSIONS: 'sessions',
  DEALS: 'deals',
  TASKS: 'tasks',
  SEQUENCES: 'sequences',
  BROADCASTS: 'broadcasts',
  COUPONS: 'coupons',
  INBOX: 'inbox',
  EMAIL_LOG: 'email-log',
  AUTOMATIONS: 'automations',
} as const;

/**
 * Create a cached data-fetching function.
 * Wraps Next.js unstable_cache with sensible defaults.
 *
 * @param fn - The async function to cache
 * @param keyParts - Cache key parts (must be unique per query)
 * @param tags - Cache tags for invalidation
 * @param revalidateSeconds - Cache TTL in seconds (default: 30)
 */
export function cached<T>(
  fn: () => Promise<T>,
  keyParts: string[],
  tags: string[],
  revalidateSeconds = 30
): Promise<T> {
  return unstable_cache(fn, keyParts, {
    revalidate: revalidateSeconds,
    tags,
  })();
}
