import { NextRequest, NextResponse } from 'next/server';
import { safeCompare } from '@/lib/rate-limit';
import { adminClient } from '@/lib/supabase/admin';
import { sendMessage } from '@/lib/telegram/bot';
import { onPostSaved } from '@/lib/intelligence/memory';

/**
 * GET /api/cron/publish-scheduled
 *
 * Publishes scheduled content posts from the Content Studio to Telegram.
 * Called by n8n Workflow 06 (Scheduled Content Publisher).
 *
 * Finds posts with status='scheduled' and scheduled_at <= now(),
 * sends them to the Telegram channel, and updates status to 'published'.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || !safeCompare(authHeader ?? '', `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!channelId) {
    return NextResponse.json({ error: 'TELEGRAM_CHANNEL_ID not configured' }, { status: 500 });
  }

  // Find posts ready to publish
  const { data: posts, error } = await adminClient
    .from('content_posts')
    .select('id, title, body, language, funnel_stage, content_type, triggers_used, target_platforms, platform_variants')
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(10);

  if (error) {
    console.error('[Publish Scheduled] Query error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!posts || posts.length === 0) {
    return NextResponse.json({ published_count: 0, message: 'No posts to publish' });
  }

  let publishedCount = 0;
  const errors: string[] = [];

  for (const post of posts) {
    // Extract Telegram content: prefer platform variant, fallback to body
    const variants = post.platform_variants as Record<string, string> | null;
    const telegramText = variants?.telegram || post.body;

    if (!telegramText) {
      errors.push(`Post ${post.id}: no content`);
      continue;
    }

    try {
      // Send to Telegram channel
      await sendMessage({
        chat_id: parseInt(channelId),
        text: telegramText,
        parse_mode: 'HTML',
      });

      // Update status to published
      await adminClient
        .from('content_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id);

      // Fire memory hooks (archive + pattern extraction)
      onPostSaved({
        id: post.id,
        title: post.title,
        body: post.body,
        funnel_stage: post.funnel_stage ?? 'tofu',
        content_type: post.content_type,
        triggers_used: post.triggers_used ?? [],
        target_platforms: post.target_platforms ?? [],
        language: post.language ?? 'ru',
      }).catch(() => {});

      publishedCount++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error';
      errors.push(`Post ${post.id}: ${msg}`);
      console.error(`[Publish Scheduled] Failed to publish ${post.id}:`, err);
    }
  }

  console.log(`[Publish Scheduled] Published: ${publishedCount}, Errors: ${errors.length}`);

  return NextResponse.json({
    published_count: publishedCount,
    errors: errors.length > 0 ? errors : undefined,
  });
}
