/**
 * Meta / Instagram Webhook Handler
 *
 * GET  — Meta verification handshake (hub.mode + hub.verify_token)
 * POST — Event processing for Lead Ads and Instagram DMs
 *
 * ALWAYS returns 200 on POST (same pattern as Telegram webhook)
 * so Meta does not retry indefinitely.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { verifyMetaSignature } from '@/lib/meta/verify';
import { fetchLeadData, extractLeadField } from '@/lib/meta/graph-api';
import { sendCAPIEvent } from '@/lib/meta/conversions';
import { triggerAutomations } from '@/lib/automation/engine';
import { triggerSequenceEnrollment } from '@/lib/sequences/enroll';
import { addToFeed } from '@/lib/inbox/feed';
import { updateLastActivity } from '@/lib/scoring/engine';

// ── GET: Meta Verification Handshake ─────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (
    mode === 'subscribe' &&
    token === process.env.META_VERIFY_TOKEN &&
    challenge
  ) {
    console.log('[Meta Webhook] Verification successful');
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn('[Meta Webhook] Verification failed');
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// ── POST: Event Processing ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // Verify signature
    const signature = req.headers.get('x-hub-signature-256');
    if (!verifyMetaSignature(rawBody, signature)) {
      console.warn('[Meta Webhook] Invalid signature — ignoring payload');
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    const payload = JSON.parse(rawBody) as {
      object: string;
      entry?: Array<{
        id: string;
        time: number;
        changes?: Array<{ field: string; value: unknown }>;
        messaging?: Array<unknown>;
      }>;
    };

    // Route by object type
    if (payload.object === 'page') {
      for (const entry of payload.entry ?? []) {
        for (const change of entry.changes ?? []) {
          if (change.field === 'leadgen') {
            await handleLeadGen(change.value as { leadgen_id: string; page_id: string; form_id: string })
              .catch((err) => console.error('[Meta Webhook] handleLeadGen error:', err));
          }
        }
      }
    } else if (payload.object === 'instagram') {
      for (const entry of payload.entry ?? []) {
        for (const msg of entry.messaging ?? []) {
          const messaging = msg as {
            sender: { id: string };
            recipient: { id: string };
            timestamp: number;
            message?: { mid: string; text?: string; attachments?: unknown[] };
          };
          if (messaging.message) {
            await handleInstagramDM(messaging)
              .catch((err) => console.error('[Meta Webhook] handleInstagramDM error:', err));
          }
        }
      }
    }
  } catch (err) {
    console.error('[Meta Webhook] Unhandled error:', err);
  }

  // ALWAYS return 200 — never let Meta retry
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}

// ── Lead Ads Handler ─────────────────────────────────────────────────────

async function handleLeadGen(value: {
  leadgen_id: string;
  page_id: string;
  form_id: string;
}) {
  const { leadgen_id, page_id, form_id } = value;

  console.log(`[Meta Webhook] Lead Ad received: ${leadgen_id} (page=${page_id}, form=${form_id})`);

  // Idempotency: Skip if this leadgen_id was already processed
  const { data: existingByLeadgen } = await adminClient
    .from('leads')
    .select('id')
    .contains('matrix_data', { ig_lead_id: leadgen_id })
    .maybeSingle();
  if (existingByLeadgen) {
    console.log(`[Meta Webhook] Lead ${leadgen_id} already processed, skipping`);
    return;
  }

  // 1. Fetch full lead data from Graph API
  const leadData = await fetchLeadData(leadgen_id);

  // 2. Extract fields
  const email = extractLeadField(leadData.field_data, 'email');
  const full_name = extractLeadField(leadData.field_data, 'full_name');
  const phone = extractLeadField(leadData.field_data, 'phone_number') ??
                extractLeadField(leadData.field_data, 'phone');

  // 3. Skip if no email
  if (!email) {
    console.warn(`[Meta Webhook] Lead ${leadgen_id} has no email — skipping`);
    return;
  }

  const emailLower = email.toLowerCase();

  // 4. Check existing lead
  const { data: existingLead } = await adminClient
    .from('leads')
    .select('id, email_verified')
    .eq('email', emailLower)
    .maybeSingle();

  let leadId: string;

  if (existingLead) {
    // 5. Update existing lead
    await adminClient
      .from('leads')
      .update({
        source: 'instagram_lead_ads',
        matrix_data: {
          ig_lead_id: leadgen_id,
          full_name: full_name ?? null,
          phone: phone ?? null,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingLead.id);
    leadId = existingLead.id;
  } else {
    // 6. Insert new lead (Lead Ads are pre-verified)
    const { data: newLead } = await adminClient
      .from('leads')
      .insert({
        email: emailLower,
        email_verified: true,
        source: 'instagram_lead_ads',
        language: 'de',
        matrix_data: {
          ig_lead_id: leadgen_id,
          full_name: full_name ?? null,
          phone: phone ?? null,
        },
      })
      .select('id')
      .single();
    leadId = newLead?.id ?? leadgen_id;
  }

  // 7. Try to match profile
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', emailLower)
    .maybeSingle();

  const profileId = profile?.id ?? null;

  // 8. If profile found, link it to the lead
  if (profileId) {
    await adminClient
      .from('leads')
      .update({ profile_id: profileId })
      .eq('id', leadId);
  }

  // 9. Fire-and-forget side effects
  addToFeed({
    activityType: 'instagram_lead',
    sourceTable: 'leads',
    sourceId: leadId,
    title: `Instagram Lead Ad: ${full_name ?? emailLower}`,
    preview: `Email: ${emailLower}${phone ? `, Tel: ${phone}` : ''}`,
    profileId,
    requiresAction: true,
  }).catch(() => {});

  sendCAPIEvent({
    eventName: 'Lead',
    email: emailLower,
    phone: phone ?? undefined,
    firstName: full_name ?? undefined,
    profileId,
    eventId: `ig_lead_${leadgen_id}`,
    customData: { form_id, page_id, source: 'instagram_lead_ads' },
  }).catch(() => {});

  triggerAutomations('instagram_lead_received', {
    profileId,
    email: emailLower,
    data: {
      ig_lead_id: leadgen_id,
      full_name: full_name ?? null,
      phone: phone ?? null,
    },
  }).catch(() => {});

  triggerSequenceEnrollment('lead_created', {
    email: emailLower,
    profileId,
    leadId,
  }).catch(() => {});

  if (profileId) {
    updateLastActivity(profileId).catch(() => {});
  }

  console.log(`[Meta Webhook] Lead processed: ${emailLower} (leadId=${leadId})`);
}

// ── Instagram DM Handler ─────────────────────────────────────────────────

async function handleInstagramDM(messaging: {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: { mid: string; text?: string; attachments?: unknown[] };
}) {
  const senderId = messaging.sender.id;
  const igAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  // 1. Skip messages from our own account
  if (senderId === igAccountId) return;

  const message = messaging.message;
  if (!message) return;

  const messageText = message.text ?? '';
  const hasAttachments = (message.attachments?.length ?? 0) > 0;
  const messageType = hasAttachments ? 'image' : 'text';

  console.log(`[Meta Webhook] Instagram DM from ${senderId}: ${messageText.slice(0, 50)}`);

  // Idempotency: Skip if this message was already processed
  const { data: existingDM } = await adminClient
    .from('instagram_messages')
    .select('id')
    .eq('ig_message_id', message.mid)
    .maybeSingle();
  if (existingDM) return;

  // 2. Find profile by instagram_sender_id
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, email, full_name')
    .eq('instagram_sender_id', senderId)
    .maybeSingle();

  const profileId = profile?.id ?? null;
  const email = profile?.email ?? null;

  // 3. Insert into instagram_messages
  const { data: insertedMsg } = await adminClient
    .from('instagram_messages')
    .insert({
      sender_id: senderId,
      direction: 'in',
      message_type: messageType,
      message_text: messageText || null,
      ig_message_id: message.mid,
      metadata: {
        recipient_id: messaging.recipient.id,
        attachments: hasAttachments ? message.attachments : null,
      } as unknown as Record<string, never>,
      profile_id: profileId,
    })
    .select('id')
    .single();

  const messageRowId = insertedMsg?.id ?? message.mid;

  // 4. Fire-and-forget side effects
  addToFeed({
    activityType: 'instagram_dm_in',
    sourceTable: 'instagram_messages',
    sourceId: messageRowId,
    title: `Instagram DM von ${profile?.full_name ?? senderId}`,
    preview: messageText.slice(0, 200) || (hasAttachments ? '[Bild/Anhang]' : ''),
    profileId,
    requiresAction: true,
  }).catch(() => {});

  triggerAutomations('instagram_dm_received', {
    profileId,
    email: email ?? undefined,
    data: {
      sender_id: senderId,
      message_text: messageText,
    },
  }).catch(() => {});

  if (profileId) {
    updateLastActivity(profileId).catch(() => {});
  }
}
