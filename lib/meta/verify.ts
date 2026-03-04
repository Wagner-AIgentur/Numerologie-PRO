/**
 * Meta Webhook Signature Verification
 *
 * Validates incoming webhook payloads from Meta (Facebook / Instagram)
 * using HMAC-SHA256 with the app secret. Uses timing-safe comparison
 * to prevent timing attacks.
 */

import crypto from 'crypto';

/**
 * Verify the X-Hub-Signature-256 header sent by Meta on every webhook.
 *
 * @param rawBody  The raw request body as a string (before JSON.parse).
 * @param signature  The value of the `X-Hub-Signature-256` header.
 * @returns `true` when the signature is valid, `false` otherwise.
 */
export function verifyMetaSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !signature) return false;

  const expected =
    'sha256=' +
    crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    );
  } catch {
    // Buffer length mismatch → signatures are definitely different
    return false;
  }
}
