/**
 * ManyChat API Client
 *
 * Bidirectional integration: CRM → ManyChat (active control)
 * Base URL: https://api.manychat.com/fb/
 * Auth: Bearer Token (MANYCHAT_API_TOKEN)
 */

const MANYCHAT_API_TOKEN = process.env.MANYCHAT_API_TOKEN;
const MANYCHAT_BASE = 'https://api.manychat.com/fb';

export interface ManyChatFlow {
  ns: string;
  name: string;
  status: string;
}

export interface ManyChatSubscriber {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  ig_username: string | null;
  custom_fields: Record<string, unknown>;
  tags: Array<{ id: number; name: string }>;
}

export interface ManyChatTag {
  id: number;
  name: string;
}

interface ManyChatResponse<T> {
  status: string;
  data: T;
}

async function manyChatRequest<T>(
  method: string,
  endpoint: string,
  body?: unknown,
): Promise<T> {
  if (!MANYCHAT_API_TOKEN) throw new Error('MANYCHAT_API_TOKEN not configured');

  const res = await fetch(`${MANYCHAT_BASE}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${MANYCHAT_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[ManyChat] ${method} ${endpoint} failed:`, res.status, err);
    throw new Error(`ManyChat API error: ${res.status}`);
  }

  const json = (await res.json()) as ManyChatResponse<T>;
  return json.data;
}

// ── Flows ──────────────────────────────────────────────────────────────

export async function getFlows(): Promise<ManyChatFlow[]> {
  return manyChatRequest<ManyChatFlow[]>('GET', '/page/getFlows');
}

export async function sendFlow(subscriberId: string, flowNs: string): Promise<void> {
  await manyChatRequest('POST', '/sending/sendFlow', {
    subscriber_id: subscriberId,
    flow_ns: flowNs,
  });
}

// ── Subscribers ────────────────────────────────────────────────────────

export async function getSubscriberInfo(subscriberId: string): Promise<ManyChatSubscriber> {
  return manyChatRequest<ManyChatSubscriber>('GET', `/subscriber/getInfo?subscriber_id=${subscriberId}`);
}

export async function findSubscriberByEmail(email: string): Promise<ManyChatSubscriber | null> {
  try {
    return await manyChatRequest<ManyChatSubscriber>('GET', `/subscriber/findBySystemField?email=${encodeURIComponent(email)}`);
  } catch {
    return null;
  }
}

export async function findSubscriberByName(name: string): Promise<ManyChatSubscriber | null> {
  try {
    return await manyChatRequest<ManyChatSubscriber>('GET', `/subscriber/findByName?name=${encodeURIComponent(name)}`);
  } catch {
    return null;
  }
}

export async function createSubscriber(data: {
  first_name: string;
  last_name?: string;
  phone?: string;
  email?: string;
  consent_phrase?: string;
}): Promise<ManyChatSubscriber> {
  return manyChatRequest<ManyChatSubscriber>('POST', '/subscriber/createSubscriber', data);
}

// ── Messaging ──────────────────────────────────────────────────────────

export async function sendContent(
  subscriberId: string,
  content: {
    type: 'text';
    text: string;
  },
): Promise<void> {
  await manyChatRequest('POST', '/sending/sendContent', {
    subscriber_id: subscriberId,
    data: {
      version: 'v2',
      content: { messages: [{ type: content.type, text: content.text }] },
    },
  });
}

// ── Tags ───────────────────────────────────────────────────────────────

export async function getTags(): Promise<ManyChatTag[]> {
  return manyChatRequest<ManyChatTag[]>('GET', '/page/getTags');
}

export async function createTag(name: string): Promise<{ id: number }> {
  return manyChatRequest<{ id: number }>('POST', '/page/createTag', { name });
}

export async function addTag(subscriberId: string, tagId: number): Promise<void> {
  await manyChatRequest('POST', '/subscriber/addTag', {
    subscriber_id: subscriberId,
    tag_id: tagId,
  });
}

export async function removeTag(subscriberId: string, tagId: number): Promise<void> {
  await manyChatRequest('POST', '/subscriber/removeTag', {
    subscriber_id: subscriberId,
    tag_id: tagId,
  });
}

// ── Custom Fields ──────────────────────────────────────────────────────

export async function setCustomField(
  subscriberId: string,
  fieldId: number,
  value: string,
): Promise<void> {
  await manyChatRequest('POST', '/subscriber/setCustomField', {
    subscriber_id: subscriberId,
    field_id: fieldId,
    field_value: value,
  });
}

export async function setCustomFields(
  subscriberId: string,
  fields: Array<{ field_id: number; field_value: string }>,
): Promise<void> {
  await manyChatRequest('POST', '/subscriber/setCustomFields', {
    subscriber_id: subscriberId,
    fields,
  });
}

// ── Bot Fields ─────────────────────────────────────────────────────────

export async function setBotField(fieldId: number, value: string): Promise<void> {
  await manyChatRequest('POST', '/page/setBotField', {
    field_id: fieldId,
    field_value: value,
  });
}

// ── Page Info ──────────────────────────────────────────────────────────

export async function getPageInfo(): Promise<Record<string, unknown>> {
  return manyChatRequest<Record<string, unknown>>('GET', '/page/getInfo');
}
