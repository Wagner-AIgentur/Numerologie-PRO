/**
 * Meta Conversions API (CAPI) Event Sender
 *
 * Sends server-side events to Meta for improved attribution and
 * measurement. PII fields are hashed with SHA-256 before transmission
 * as required by the Conversions API specification.
 *
 * Fire-and-forget safe: errors are logged but never thrown, so callers
 * can await this without wrapping in try/catch.
 */

import crypto from 'crypto';
import { adminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/types';

// ── Config ──────────────────────────────────────────────────────────────

const GRAPH_BASE = 'https://graph.facebook.com/v20.0';

// ── Types ───────────────────────────────────────────────────────────────

export type CAPIEventName = 'Lead' | 'Purchase' | 'ViewContent';

export interface CAPIEventParams {
  eventName: CAPIEventName;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  profileId?: string | null;
  eventId?: string;
  customData?: Record<string, unknown>;
  sourceUrl?: string;
}

interface CAPIUserData {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  external_id?: string;
}

interface CAPIEventPayload {
  event_name: string;
  event_time: number;
  event_id?: string;
  event_source_url?: string;
  action_source: 'website';
  user_data: CAPIUserData;
  custom_data?: Record<string, unknown>;
}

// ── Helpers ─────────────────────────────────────────────────────────────

/**
 * SHA-256 hash a PII value after trimming and lowercasing,
 * as required by Meta Conversions API.
 */
function hashPII(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value.trim().toLowerCase())
    .digest('hex');
}

/**
 * Build the `user_data` object, hashing all PII fields.
 */
function buildUserData(params: CAPIEventParams): CAPIUserData {
  const ud: CAPIUserData = {};

  if (params.email) ud.em = hashPII(params.email);
  if (params.phone) ud.ph = hashPII(params.phone);
  if (params.firstName) ud.fn = hashPII(params.firstName);
  if (params.lastName) ud.ln = hashPII(params.lastName);
  if (params.profileId) ud.external_id = params.profileId;

  return ud;
}

/**
 * Log the CAPI event to the `meta_capi_events` Supabase table.
 * Fire-and-forget: errors are logged but not thrown.
 */
async function logEventToSupabase(
  params: CAPIEventParams,
  success: boolean,
  errorMessage?: string,
): Promise<void> {
  try {
    await adminClient.from('meta_capi_events').insert({
      event_name: params.eventName,
      event_id: params.eventId ?? crypto.randomUUID(),
      profile_id: params.profileId ?? null,
      email_hash: params.email ? hashPII(params.email) : null,
      event_data: {
        source_url: params.sourceUrl ?? null,
        custom_data: (params.customData ?? null) as unknown as Json,
        error_message: errorMessage ?? null,
      } as unknown as Json,
      status: success ? 'sent' : 'failed',
    });
  } catch (err) {
    console.error('[Meta CAPI] Failed to log event to Supabase:', err);
  }
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Send a server-side event to Meta Conversions API.
 *
 * This function is fire-and-forget safe: it will never throw.
 * Errors are logged to the console and persisted in Supabase.
 *
 * @param params  Event parameters including PII and custom data.
 */
export async function sendCAPIEvent(params: CAPIEventParams): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn(
      '[Meta CAPI] Missing META_PIXEL_ID or META_ACCESS_TOKEN — skipping event.',
    );
    return;
  }

  const eventPayload: CAPIEventPayload = {
    event_name: params.eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    user_data: buildUserData(params),
    ...(params.eventId && { event_id: params.eventId }),
    ...(params.sourceUrl && { event_source_url: params.sourceUrl }),
    ...(params.customData && { custom_data: params.customData }),
  };

  try {
    const res = await fetch(`${GRAPH_BASE}/${pixelId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [eventPayload],
        access_token: accessToken,
      }),
    });

    const json = await res.json();

    if (!res.ok || json.error) {
      const msg = json.error?.message ?? `HTTP ${res.status}`;
      console.error('[Meta CAPI] API error:', msg);
      await logEventToSupabase(params, false, msg);
      return;
    }

    console.log(
      `[Meta CAPI] ${params.eventName} event sent successfully (event_id: ${params.eventId ?? 'auto'})`,
    );
    await logEventToSupabase(params, true);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Meta CAPI] Network/runtime error:', message);
    await logEventToSupabase(params, false, message);
  }
}
