import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { safeCompare } from '@/lib/rate-limit';
import { triggerAutomations } from '@/lib/automation/engine';
import { safeParseJSON } from '@/lib/utils';

const MANYCHAT_WEBHOOK_SECRET = process.env.MANYCHAT_WEBHOOK_SECRET;

/**
 * ManyChat Incoming Webhook
 *
 * Receives events from ManyChat Custom Actions:
 * - keyword_triggered: User commented a keyword → DM sent
 * - subscriber_created: New ManyChat subscriber
 * - custom_field_updated: ManyChat collected data from user
 */
export async function POST(request: NextRequest) {
  // Verify webhook secret (timing-safe comparison)
  const authHeader = request.headers.get('authorization');
  if (!MANYCHAT_WEBHOOK_SECRET || !safeCompare(authHeader ?? '', `Bearer ${MANYCHAT_WEBHOOK_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parseResult = await safeParseJSON<Record<string, unknown>>(request);
  if (parseResult.error) {
    return NextResponse.json({ error: parseResult.error }, { status: 400 });
  }
  const payload = parseResult.data!;
  const eventType = payload.event_type ?? payload.type;

  try {
    switch (eventType) {
      case 'keyword_triggered':
        await handleKeywordTriggered(payload);
        break;

      case 'subscriber_created':
        await handleSubscriberCreated(payload);
        break;

      case 'custom_field_updated':
        await handleCustomFieldUpdated(payload);
        break;

      default:
        console.log('[ManyChat Webhook] Unknown event type:', eventType);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[ManyChat Webhook] Error:', err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

/** Fire-and-forget wrapper for Supabase queries */
async function safe<T>(promise: PromiseLike<T>): Promise<T | null> {
  try { return await promise; } catch { return null; }
}

async function handleKeywordTriggered(payload: Record<string, unknown>) {
  const keyword = (payload.keyword as string)?.toUpperCase();
  const subscriberName = payload.subscriber_name as string;
  const subscriberId = payload.subscriber_id as string;
  const igUsername = payload.ig_username as string | undefined;

  if (!keyword) return;

  // 1. Find content_post with matching keyword
  const { data: post } = await adminClient
    .from('content_posts')
    .select('id, title')
    .eq('manychat_enabled', true)
    .ilike('manychat_keyword', keyword)
    .limit(1)
    .single();

  // 2. Find or create profile
  let profileId: string | null = null;
  if (igUsername) {
    const { data: existing } = await adminClient
      .from('profiles')
      .select('id')
      .eq('instagram_sender_id', igUsername)
      .limit(1)
      .single();

    if (existing) {
      profileId = existing.id;
    }
  }

  // 3. Store DM as instagram_message (outbound from ManyChat)
  await safe(adminClient
    .from('instagram_messages')
    .insert({
      sender_id: 'manychat',
      recipient_id: igUsername ?? subscriberId,
      message_text: `[ManyChat DM] Keyword: ${keyword}`,
      direction: 'out',
      source: 'manychat',
    }));

  // 4. Log in activity_feed
  await safe(adminClient
    .from('activity_feed')
    .insert({
      profile_id: profileId,
      activity_type: 'manychat_dm_sent',
      title: `ManyChat DM via Keyword "${keyword}"`,
      preview: post ? `Post: ${post.title}` : `Subscriber: ${subscriberName}`,
      source_id: post?.id ?? subscriberId ?? '',
      source_table: 'content_posts',
    }));

  // 5. Create content_lead entry (Post → Lead attribution)
  if (post) {
    await safe(adminClient
      .from('content_leads')
      .insert({
        post_id: post.id,
        profile_id: profileId,
        source: 'manychat',
        keyword_used: keyword,
        manychat_subscriber_id: subscriberId,
      }));

    // 6. Increment conversion counter
    await safe(adminClient.rpc('increment_manychat_conversions', { post_uuid: post.id }));
  }

  // 7. Trigger automation engine (direct call, fire-and-forget)
  triggerAutomations('manychat_keyword_triggered', {
    profileId,
    data: { keyword, post_id: post?.id, subscriber_id: subscriberId },
  }).catch(() => {});
}

async function handleSubscriberCreated(payload: Record<string, unknown>) {
  const subscriberName = payload.name as string;
  const subscriberId = payload.subscriber_id as string;
  const email = payload.email as string | undefined;

  // Log in activity_feed
  await safe(adminClient
    .from('activity_feed')
    .insert({
      activity_type: 'manychat_lead_captured',
      title: `Neuer ManyChat Subscriber: ${subscriberName}`,
      preview: `Subscriber: ${subscriberId}`,
      source_id: subscriberId ?? '',
      source_table: 'profiles',
    }));

  // Trigger automation (direct call, fire-and-forget)
  triggerAutomations('manychat_subscriber_created', {
    email: email ?? undefined,
    data: { subscriber_id: subscriberId, name: subscriberName },
  }).catch(() => {});
}

async function handleCustomFieldUpdated(payload: Record<string, unknown>) {
  const subscriberId = payload.subscriber_id as string;
  const fieldName = payload.field_name as string;
  const fieldValue = payload.field_value as string;

  // Log for potential CRM sync
  console.log(`[ManyChat] Custom field updated: ${fieldName}=${fieldValue} for ${subscriberId}`);
}
