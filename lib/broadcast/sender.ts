/**
 * Broadcast Sending Engine
 *
 * Processes broadcast recipients in chunks with rate limiting.
 * Used by both the immediate send (inline) and the cron processor.
 */

import { adminClient } from '@/lib/supabase/admin';
import { sendEmail, getUnsubscribeUrl } from '@/lib/email/send';
import { sendMessage } from '@/lib/telegram/bot';
import { sendTemplateMessage } from '@/lib/whatsapp/client';
import { TEMPLATES, buildBroadcastParams, waLanguageCode } from '@/lib/whatsapp/templates';
import { broadcastEmail } from '@/lib/email/templates/broadcast';

const DELAY_MS = 100; // 100ms between messages (rate limiting)

/**
 * Send a chunk of pending recipients for a given broadcast.
 * Returns the number of processed recipients.
 */
export async function sendBroadcastChunk(
  broadcastId: string,
  chunkSize: number = 25,
): Promise<number> {
  // 1. Fetch broadcast content
  const { data: broadcast } = await adminClient
    .from('broadcasts')
    .select('*')
    .eq('id', broadcastId)
    .single();

  if (!broadcast) {
    console.error(`[Broadcast] Broadcast ${broadcastId} not found`);
    return 0;
  }

  // 2. Fetch pending recipients
  const { data: recipients } = await adminClient
    .from('broadcast_recipients')
    .select('*')
    .eq('broadcast_id', broadcastId)
    .eq('status', 'pending')
    .limit(chunkSize);

  if (!recipients?.length) return 0;

  // 3. Fetch unsubscribe tokens for email recipients
  const emailRecipientIds = recipients
    .filter((r) => r.channel === 'email' && r.profile_id)
    .map((r) => r.profile_id!);

  const tokenMap = new Map<string, string>();
  if (emailRecipientIds.length > 0) {
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, unsubscribe_token')
      .in('id', emailRecipientIds);
    for (const p of profiles ?? []) {
      if (p.unsubscribe_token) tokenMap.set(p.id, p.unsubscribe_token);
    }
  }

  // 4. Process each recipient
  for (const recipient of recipients) {
    try {
      if (recipient.channel === 'email' && recipient.recipient_email) {
        const token = recipient.profile_id ? tokenMap.get(recipient.profile_id) : undefined;
        const unsubscribeUrl = token ? getUnsubscribeUrl(token) : undefined;

        const { subject, html } = broadcastEmail({
          subject: broadcast.subject_email ?? broadcast.title,
          content: broadcast.content_email ?? '',
          unsubscribeUrl,
          aiGenerated: !!(broadcast.ai_prompt || broadcast.ai_model),
        });

        await sendEmail({
          to: recipient.recipient_email,
          subject,
          html,
          template: 'broadcast',
          profileId: recipient.profile_id,
          unsubscribeToken: token,
        });
      }

      if (recipient.channel === 'telegram' && recipient.recipient_chat_id) {
        await sendMessage({
          chat_id: recipient.recipient_chat_id,
          text: broadcast.content_telegram ?? broadcast.title,
          parse_mode: 'HTML',
        });

        // Log outgoing telegram message
        await adminClient.from('telegram_messages').insert({
          chat_id: recipient.recipient_chat_id,
          direction: 'out',
          command: `broadcast:${broadcastId}`,
          payload: { broadcast_id: broadcastId, title: broadcast.title },
        });
      }

      if (recipient.channel === 'whatsapp' && recipient.recipient_wa_phone) {
        const locale = (broadcast.language ?? 'de') as 'de' | 'ru';
        const contentText = broadcast.content_telegram ?? broadcast.title;

        await sendTemplateMessage({
          to: recipient.recipient_wa_phone,
          templateName: TEMPLATES.BROADCAST,
          languageCode: waLanguageCode(locale),
          components: buildBroadcastParams(contentText),
        });

        // Log outgoing WhatsApp message
        await adminClient.from('whatsapp_messages').insert({
          wa_id: recipient.recipient_wa_phone,
          profile_id: recipient.profile_id,
          direction: 'out',
          template_name: TEMPLATES.BROADCAST,
          message_text: contentText,
          status: 'sent',
        });
      }

      // Mark as sent
      await adminClient
        .from('broadcast_recipients')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', recipient.id);
    } catch (err) {
      console.error(`[Broadcast] Failed to send to ${recipient.id}:`, err);

      await adminClient
        .from('broadcast_recipients')
        .update({
          status: 'failed',
          error: err instanceof Error ? err.message : String(err),
        })
        .eq('id', recipient.id);
    }

    // Rate limit delay
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  // 4. Update broadcast stats
  await adminClient.rpc('update_broadcast_stats', { broadcast_uuid: broadcastId });

  // 5. Check if all recipients are processed
  const { count: pending } = await adminClient
    .from('broadcast_recipients')
    .select('*', { count: 'exact', head: true })
    .eq('broadcast_id', broadcastId)
    .eq('status', 'pending');

  if (pending === 0) {
    const { count: failed } = await adminClient
      .from('broadcast_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('broadcast_id', broadcastId)
      .eq('status', 'failed');

    await adminClient
      .from('broadcasts')
      .update({
        status: failed && failed > 0 ? 'partially_sent' : 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', broadcastId);
  }

  return recipients.length;
}
