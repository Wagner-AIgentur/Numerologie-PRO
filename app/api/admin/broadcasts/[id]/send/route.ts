import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/admin-guard';
import { isValidUUID } from '@/lib/validations/admin';
import { resolveAudience } from '@/lib/broadcast/audience';
import { sendBroadcastChunk } from '@/lib/broadcast/sender';
import type { AudienceFilter } from '@/lib/broadcast/audience';

const CHUNK_SIZE = 50; // Process all recipients inline in chunks

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requirePermission('content.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  // 1. Fetch broadcast
  const { data: broadcast } = await adminClient
    .from('broadcasts')
    .select('*')
    .eq('id', id)
    .single();

  if (!broadcast) {
    return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
  }

  if (!['draft', 'scheduled'].includes(broadcast.status)) {
    return NextResponse.json(
      { error: 'Broadcast is already being sent or has been sent' },
      { status: 400 },
    );
  }

  // Validate content exists for selected channels
  const channels = broadcast.channels as string[];
  if (channels.includes('email') && !broadcast.content_email) {
    return NextResponse.json({ error: 'Email content is required' }, { status: 400 });
  }
  if (channels.includes('telegram') && !broadcast.content_telegram) {
    return NextResponse.json({ error: 'Telegram content is required' }, { status: 400 });
  }

  // 2. Resolve audience
  const recipients = await resolveAudience(
    broadcast.audience_filter as unknown as AudienceFilter,
    broadcast.language as 'de' | 'ru' | 'all',
  );

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No recipients match the audience filter' }, { status: 400 });
  }

  // 3. Create broadcast_recipients rows
  const recipientRows = recipients.flatMap((r) => {
    const rows = [];

    if (channels.includes('email') && r.email) {
      rows.push({
        broadcast_id: id,
        profile_id: r.profile_id,
        channel: 'email' as const,
        recipient_email: r.email,
        recipient_chat_id: null,
        status: 'pending' as const,
      });
    }

    if (channels.includes('telegram') && r.telegram_chat_id) {
      rows.push({
        broadcast_id: id,
        profile_id: r.profile_id,
        channel: 'telegram' as const,
        recipient_email: null,
        recipient_chat_id: r.telegram_chat_id,
        status: 'pending' as const,
      });
    }

    return rows;
  });

  if (recipientRows.length === 0) {
    return NextResponse.json(
      { error: 'No recipients have the selected channel (email/telegram) configured' },
      { status: 400 },
    );
  }

  // Insert recipients
  const { error: insertErr } = await adminClient
    .from('broadcast_recipients')
    .insert(recipientRows);

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // 4. Update broadcast status
  await adminClient
    .from('broadcasts')
    .update({
      status: 'sending',
      total_recipients: recipientRows.length,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  // 5. Send all recipients inline in chunks (no cron dependency)
  let totalSent = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const sent = await sendBroadcastChunk(id, CHUNK_SIZE);
      totalSent += sent;
      hasMore = sent === CHUNK_SIZE; // Continue if chunk was full
    } catch (err) {
      console.error('[Broadcast Send] Chunk error:', err);
      hasMore = false;
    }
  }

  // Re-fetch final status
  const { data: updated } = await adminClient
    .from('broadcasts')
    .select('status, sent_count, failed_count, total_recipients')
    .eq('id', id)
    .single();

  return NextResponse.json({
    status: updated?.status ?? 'sending',
    sent_count: updated?.sent_count ?? totalSent,
    failed_count: updated?.failed_count ?? 0,
    total_recipients: updated?.total_recipients ?? recipientRows.length,
  });
}
