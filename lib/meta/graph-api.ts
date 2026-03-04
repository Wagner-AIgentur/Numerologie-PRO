/**
 * Meta Graph API Client
 *
 * Thin wrapper around the Facebook / Instagram Graph API.
 * No external SDK — uses native fetch().
 * Follows the same pattern as lib/telegram/bot.ts.
 */

// ── Config ──────────────────────────────────────────────────────────────

const GRAPH_BASE = 'https://graph.facebook.com/v20.0';
const IG_BASE = 'https://graph.instagram.com';

function getAccessToken(): string {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error('[Meta] META_ACCESS_TOKEN is not set');
  return token;
}

function getIgAccountId(): string {
  const id = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!id) throw new Error('[Meta] INSTAGRAM_BUSINESS_ACCOUNT_ID is not set');
  return id;
}

// ── Types ───────────────────────────────────────────────────────────────

export interface LeadFieldData {
  name: string;
  values: string[];
}

export interface LeadData {
  id: string;
  created_time: string;
  field_data: LeadFieldData[];
}

interface GraphApiError {
  error?: {
    message: string;
    type: string;
    code: number;
    fbtrace_id?: string;
  };
}

interface SendMessageResponse {
  recipient_id?: string;
  message_id?: string;
}

// ── Internal Helpers ────────────────────────────────────────────────────

/**
 * Generic GET request against the Graph API.
 */
async function graphGet<T = unknown>(
  url: string,
  params?: Record<string, string>,
): Promise<T> {
  const searchParams = new URLSearchParams({
    access_token: getAccessToken(),
    ...params,
  });

  const res = await fetch(`${url}?${searchParams.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const json = (await res.json()) as T & GraphApiError;

  if (!res.ok || json.error) {
    const msg = json.error?.message ?? `HTTP ${res.status}`;
    console.error('[Meta Graph GET] Error:', msg);
    throw new Error(`Meta Graph API error: ${msg}`);
  }

  return json;
}

/**
 * Generic POST request against the Graph API.
 */
async function graphPost<T = unknown>(
  url: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as T & GraphApiError;

  if (!res.ok || json.error) {
    const msg = json.error?.message ?? `HTTP ${res.status}`;
    console.error('[Meta Graph POST] Error:', msg);
    throw new Error(`Meta Graph API error: ${msg}`);
  }

  return json;
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Fetch lead data from a Facebook Lead Ad.
 *
 * GET graph.facebook.com/v20.0/{lead_id}?fields=id,created_time,field_data
 */
export async function fetchLeadData(leadId: string): Promise<LeadData> {
  return graphGet<LeadData>(`${GRAPH_BASE}/${leadId}`, {
    fields: 'id,created_time,field_data',
  });
}

/**
 * Send a direct message on Instagram via the Instagram Messaging API.
 *
 * POST graph.instagram.com/{IG_ACCOUNT_ID}/messages
 */
export async function sendInstagramDM(
  recipientId: string,
  text: string,
): Promise<SendMessageResponse> {
  const igAccountId = getIgAccountId();

  return graphPost<SendMessageResponse>(
    `${IG_BASE}/${igAccountId}/messages`,
    {
      recipient: { id: recipientId },
      message: { text },
    },
  );
}

/**
 * Extract a single field value from Lead Ad field_data.
 *
 * @param fieldData  The `field_data` array from a Lead Ad response.
 * @param fieldName  The name of the field to extract (e.g. "email", "full_name").
 * @returns The first value of the matching field, or `undefined` if not found.
 */
export function extractLeadField(
  fieldData: LeadFieldData[],
  fieldName: string,
): string | undefined {
  const field = fieldData.find(
    (f) => f.name.toLowerCase() === fieldName.toLowerCase(),
  );
  return field?.values?.[0];
}
