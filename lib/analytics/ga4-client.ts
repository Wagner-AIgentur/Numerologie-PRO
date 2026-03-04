/**
 * Google Analytics 4 Data API client (server-side only).
 *
 * Auth via service account credentials stored in env vars:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL
 * - GOOGLE_SERVICE_ACCOUNT_KEY (Base64-encoded private key)
 * - GA4_PROPERTY_ID
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';

export const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID ?? '';

let _client: BetaAnalyticsDataClient | null = null;

export function getGA4Client(): BetaAnalyticsDataClient | null {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const keyBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!email || !keyBase64 || !GA4_PROPERTY_ID) {
    console.warn('[GA4] Missing credentials — GA4 Data API disabled');
    return null;
  }

  if (_client) return _client;

  // Decode Base64 private key
  const privateKey = Buffer.from(keyBase64, 'base64').toString('utf8');

  _client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: email,
      private_key: privateKey,
    },
  });

  return _client;
}
