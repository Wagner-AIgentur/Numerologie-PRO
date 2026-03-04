import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { resolveAudience } from '@/lib/broadcast/audience';
import { sendBroadcastChunk } from '@/lib/broadcast/sender';
import { safeCompare } from '@/lib/rate-limit';
import type { AudienceFilter } from '@/lib/broadcast/audience';

const CHUNK_SIZE = 50;

/**
 * Cron job: Activate and send scheduled broadcasts.
 * Runs daily at 6:05 AM via Vercel Cron (Hobby plan: 1x/day).
 *
 * Activates scheduled broadcasts where scheduled_at <= now,
 * then sends all recipients inline.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || !safeCompare(authHeader ?? '', `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: string[] = [];

  // Activate scheduled broadcasts that are due
  const { data: scheduledBroadcasts } = await adminClient
    .from('broadcasts')
    .select('id, audience_filter, language, channels')
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString());

  for (const broadcast of scheduledBroadcasts ?? []) {
    try {
      const recipients = await resolveAudience(
        broadcast.audience_filter as unknown as AudienceFilter,
        broadcast.language as 'de' | 'ru' | 'all',
      );

      const channels = broadcast.channels as string[];
      const recipientRows = recipients.flatMap((r) => {
        const rows = [];
        if (channels.includes('email') && r.email) {
          rows.push({
            broadcast_id: broadcast.id,
            profile_id: r.profile_id,
            channel: 'email' as const,
            recipient_email: r.email,
            recipient_chat_id: null,
            recipient_wa_phone: null,
            status: 'pending' as const,
          });
        }
        if (channels.includes('telegram') && r.telegram_chat_id) {
          rows.push({
            broadcast_id: broadcast.id,
            profile_id: r.profile_id,
            channel: 'telegram' as const,
            recipient_email: null,
            recipient_chat_id: r.telegram_chat_id,
            recipient_wa_phone: null,
            status: 'pending' as const,
          });
        }
        if (channels.includes('whatsapp') && r.whatsapp_phone) {
          rows.push({
            broadcast_id: broadcast.id,
            profile_id: r.profile_id,
            channel: 'whatsapp' as const,
            recipient_email: null,
            recipient_chat_id: null,
            recipient_wa_phone: r.whatsapp_phone,
            status: 'pending' as const,
          });
        }
        return rows;
      });

      if (recipientRows.length > 0) {
        await adminClient.from('broadcast_recipients').insert(recipientRows);
      }

      await adminClient
        .from('broadcasts')
        .update({
          status: 'sending',
          total_recipients: recipientRows.length,
          updated_at: new Date().toISOString(),
        })
        .eq('id', broadcast.id);

      // Send recipients in limited chunks to prevent Vercel timeout (max 50s)
      const MAX_CHUNKS = 10; // 10 * 50 * 100ms = ~50s — safe for 60s timeout
      let hasMore = true;
      let chunks = 0;
      while (hasMore && chunks < MAX_CHUNKS) {
        const sent = await sendBroadcastChunk(broadcast.id, CHUNK_SIZE);
        hasMore = sent === CHUNK_SIZE;
        chunks++;
      }
      if (hasMore) {
        console.log(`[Cron] Broadcast ${broadcast.id}: chunk limit reached, remaining deferred to next run`);
      }

      results.push(`Broadcast ${broadcast.id}: ${recipientRows.length} recipients processed`);
    } catch (err) {
      console.error(`[Cron] Failed broadcast ${broadcast.id}:`, err);
      results.push(`Failed ${broadcast.id}: ${err}`);
    }
  }

  return NextResponse.json({
    ok: true,
    processed: results,
    timestamp: new Date().toISOString(),
  });
}
