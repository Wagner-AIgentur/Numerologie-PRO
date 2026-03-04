/**
 * WhatsApp Cloud API Client
 *
 * Thin wrapper around the Meta Graph API for WhatsApp Business.
 * Mirrors lib/telegram/bot.ts — no external dependencies, uses native fetch().
 */

const GRAPH_BASE = 'https://graph.facebook.com/v20.0';

function getPhoneNumberId(): string {
  return process.env.WHATSAPP_PHONE_NUMBER_ID!;
}

function getAccessToken(): string {
  return process.env.META_ACCESS_TOKEN!;
}

// ── Types ────────────────────────────────────────────────────────────────

export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters: Array<{
    type: 'text' | 'document' | 'image';
    text?: string;
    document?: { link: string; filename?: string };
  }>;
  sub_type?: 'url';
  index?: number;
}

export interface WhatsAppMessageResponse {
  messaging_product: 'whatsapp';
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

// ── Core API caller ──────────────────────────────────────────────────────

async function callApi<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const url = `${GRAPH_BASE}/${getPhoneNumberId()}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ messaging_product: 'whatsapp', ...body }),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error('[WhatsApp] API call failed:', json);
    throw new Error(`WhatsApp API error: ${json.error?.message ?? res.status}`);
  }
  return json as T;
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Send a pre-approved template message (required for business-initiated conversations).
 */
export async function sendTemplateMessage(opts: {
  to: string;
  templateName: string;
  languageCode: string;
  components?: TemplateComponent[];
}): Promise<WhatsAppMessageResponse> {
  return callApi<WhatsAppMessageResponse>({
    recipient_type: 'individual',
    to: opts.to,
    type: 'template',
    template: {
      name: opts.templateName,
      language: { code: opts.languageCode },
      ...(opts.components?.length && { components: opts.components }),
    },
  });
}

/**
 * Send a free-form text message (only within 24h customer service window).
 */
export async function sendTextMessage(to: string, text: string): Promise<WhatsAppMessageResponse> {
  return callApi<WhatsAppMessageResponse>({
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: true, body: text },
  });
}

/**
 * Send a document (PDF) via URL.
 */
export async function sendDocument(
  to: string,
  documentUrl: string,
  caption?: string,
  filename?: string,
): Promise<WhatsAppMessageResponse> {
  return callApi<WhatsAppMessageResponse>({
    recipient_type: 'individual',
    to,
    type: 'document',
    document: {
      link: documentUrl,
      ...(caption && { caption }),
      ...(filename && { filename }),
    },
  });
}

/**
 * Mark a received message as read.
 */
export async function markAsRead(messageId: string): Promise<void> {
  await callApi({
    status: 'read',
    message_id: messageId,
  });
}
