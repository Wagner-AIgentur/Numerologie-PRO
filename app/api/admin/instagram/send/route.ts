import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/admin-guard';
import { sendInstagramDM } from '@/lib/meta/graph-api';
import { sendContent as sendViaManyChat } from '@/lib/manychat/api';
import { addToFeed } from '@/lib/inbox/feed';
import { validateBody, zodErrorResponse, instagramSendSchema } from '@/lib/validations/admin';

/**
 * POST /api/admin/instagram/send
 * Send an Instagram DM reply via ManyChat (preferred) or Meta Graph API (fallback).
 */
export async function POST(request: NextRequest) {
  if (!(await requirePermission('instagram.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: body, error: validationError } = await validateBody(request, instagramSendSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const { recipient_id, message } = body;

  // Validate that recipient_id is a known Instagram user in our system
  const { data: known } = await adminClient
    .from('instagram_messages')
    .select('id')
    .eq('sender_id', recipient_id)
    .limit(1);
  if (!known || known.length === 0) {
    return NextResponse.json({ error: 'Unknown Instagram recipient' }, { status: 400 });
  }

  try {
    // Send via ManyChat (preferred) or Meta Graph API (fallback)
    let externalMessageId: string | null = null;
    if (process.env.MANYCHAT_API_TOKEN) {
      await sendViaManyChat(recipient_id, { type: 'text', text: message.trim() });
    } else {
      const result = await sendInstagramDM(recipient_id, message.trim());
      externalMessageId = result.message_id ?? null;
    }

    // Log outgoing message to database
    const { data: insertedMsg } = await adminClient
      .from('instagram_messages')
      .insert({
        sender_id: recipient_id,
        profile_id: null,
        direction: 'out',
        message_text: message.trim(),
        message_type: 'text',
        ig_message_id: externalMessageId,
        source: process.env.MANYCHAT_API_TOKEN ? 'manychat' : 'meta_api',
      })
      .select('id')
      .single();

    const messageRowId = insertedMsg?.id ?? externalMessageId ?? 'unknown';

    // Add to activity feed
    addToFeed({
      activityType: 'instagram_dm_out',
      sourceTable: 'instagram_messages',
      sourceId: messageRowId,
      title: `Instagram DM gesendet an ${recipient_id}`,
      preview: message.trim().slice(0, 200),
      profileId: null,
    }).catch(() => {});

    return NextResponse.json({ ok: true, message_id: messageRowId });
  } catch (err) {
    console.error('[Admin Instagram] Send failed:', err);
    return NextResponse.json(
      { error: 'Send failed' },
      { status: 500 },
    );
  }
}
