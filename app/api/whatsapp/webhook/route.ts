import { NextRequest, NextResponse } from 'next/server';
import { verifyMetaSignature } from '@/lib/meta/verify';
import { adminClient } from '@/lib/supabase/admin';
import { sendTextMessage, markAsRead } from '@/lib/whatsapp/client';

/**
 * WhatsApp Cloud API Webhook
 *
 * GET  — Meta webhook verification (subscribe)
 * POST — Incoming messages & status updates
 */

// ── GET: Webhook Verification ──
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// ── POST: Incoming Messages & Status Updates ──
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Verify signature
  const signature = request.headers.get('x-hub-signature-256');
  if (!verifyMetaSignature(rawBody, signature)) {
    console.warn('WhatsApp webhook: invalid signature — ignoring payload');
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Meta sends a nested structure: entry[].changes[].value
  const entries = payload.entry ?? [];

  for (const entry of entries) {
    const changes = entry.changes ?? [];

    for (const change of changes) {
      if (change.field !== 'messages') continue;
      const value = change.value;

      // Handle status updates (delivered, read, failed)
      const statuses = value.statuses ?? [];
      for (const status of statuses) {
        await handleStatusUpdate(status);
      }

      // Handle incoming messages
      const messages = value.messages ?? [];
      for (const message of messages) {
        const contact = value.contacts?.[0];
        await handleIncomingMessage(message, contact);
      }
    }
  }

  return NextResponse.json({ received: true });
}

async function handleStatusUpdate(status: any) {
  const { id: waMessageId, status: newStatus } = status;
  if (!waMessageId || !newStatus) return;

  // Map Meta status to our status
  const statusMap: Record<string, string> = {
    sent: 'sent',
    delivered: 'delivered',
    read: 'read',
    failed: 'failed',
  };

  const mappedStatus = statusMap[newStatus];
  if (!mappedStatus) return;

  await adminClient
    .from('whatsapp_messages')
    .update({ status: mappedStatus })
    .eq('wa_message_id', waMessageId);
}

async function handleIncomingMessage(message: any, contact: any) {
  const senderPhone = message.from; // E.164 without +
  const messageId = message.id;
  const messageType = message.type;
  const messageText = message.text?.body ?? '';
  const senderName = contact?.profile?.name ?? '';

  if (!senderPhone) return;

  // Idempotency: skip if this message was already processed
  const { data: existingMsg } = await adminClient
    .from('whatsapp_messages')
    .select('id')
    .eq('wa_message_id', messageId)
    .maybeSingle();
  if (existingMsg) return;

  // Mark as read
  markAsRead(messageId).catch(() => {});

  // Find profile by WhatsApp phone (try with and without +)
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, language')
    .or(`whatsapp_phone.eq.+${senderPhone},whatsapp_phone.eq.${senderPhone}`)
    .maybeSingle();

  // Log incoming message
  await adminClient.from('whatsapp_messages').insert({
    wa_id: senderPhone,
    profile_id: profile?.id ?? null,
    direction: 'in',
    message_text: messageText || `[${messageType}]`,
    wa_message_id: messageId,
    status: 'delivered',
    metadata: { type: messageType, sender_name: senderName },
  });

  // Auto-reply for text messages (within 24h window)
  if (messageType === 'text' && messageText) {
    const locale = (profile?.language ?? 'de') as 'de' | 'ru';
    const autoReply = locale === 'de'
      ? 'Danke für deine Nachricht! Ich melde mich so schnell wie möglich bei dir. 💫 Swetlana'
      : 'Спасибо за сообщение! Я отвечу тебе как можно скорее. 💫 Светлана';

    try {
      const response = await sendTextMessage(senderPhone, autoReply);

      // Log outgoing auto-reply
      await adminClient.from('whatsapp_messages').insert({
        wa_id: senderPhone,
        profile_id: profile?.id ?? null,
        direction: 'out',
        message_text: autoReply,
        wa_message_id: response.messages?.[0]?.id ?? null,
        status: 'sent',
        metadata: { auto_reply: true },
      });
    } catch (err) {
      console.error('WhatsApp auto-reply failed:', err);
    }
  }

  // Link phone to profile if not linked yet
  if (!profile) {
    // No profile found — could optionally create a lead here
    console.log(`WhatsApp message from unknown number: ${senderPhone}`);
  }
}
