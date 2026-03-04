import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { isValidUUID } from '@/lib/validations/admin';
import { scrapeCompetitor } from '@/lib/intelligence/apify';
import { analyzeContent } from '@/lib/intelligence/analyzer';
import { onIntelAnalyzed } from '@/lib/intelligence/memory';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, ctx: Ctx) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  // Load competitor
  const { data: competitor, error: compErr } = await adminClient
    .from('content_competitors')
    .select('*')
    .eq('id', id)
    .single();

  if (compErr || !competitor) return NextResponse.json({ error: 'Competitor not found' }, { status: 404 });

  const socialAccounts = (competitor.social_accounts ?? {}) as Record<string, string>;
  const results: { platform: string; scraped: number; analyzed: number }[] = [];

  // Scrape each configured platform
  for (const [platform, handle] of Object.entries(socialAccounts)) {
    if (!handle) continue;

    try {
      const scrapeResult = await scrapeCompetitor(platform, handle, 20);
      let analyzed = 0;

      // Store each post as intel entry
      for (const post of scrapeResult.posts) {
        // Analyze with AI
        let analysis = null;
        try {
          analysis = await analyzeContent({
            content: post.caption,
            platform,
            engagement: post.engagement,
            media_type: post.media_type,
          });
          analyzed++;
        } catch {
          // AI analysis failed — store without analysis
        }

        const { data: intelRow } = await adminClient
          .from('content_intel')
          .insert({
            competitor_id: id,
            source_platform: platform,
            source_url: post.url,
            content: post.caption,
            media_urls: post.media_urls,
            media_type: post.media_type,
            posted_at: post.posted_at,
            engagement_data: post.engagement,
            ...(analysis ?? {}),
          })
          .select('id')
          .single();

        // Fire-and-forget: Archive to Pinecone
        if (intelRow && analysis) {
          onIntelAnalyzed({
            id: intelRow.id,
            content: post.caption,
            ai_summary: analysis.ai_summary,
            source_platform: platform,
            ai_funnel_stage: analysis.ai_funnel_stage,
            competitor_id: id,
          }).catch(() => {});
        }
      }

      results.push({ platform, scraped: scrapeResult.posts.length, analyzed });
    } catch (err) {
      console.error(`[Scrape] ${platform} failed for ${handle}:`, err);
      results.push({ platform, scraped: 0, analyzed: 0 });
    }
  }

  // Update last_scraped_at
  await adminClient
    .from('content_competitors')
    .update({ last_scraped_at: new Date().toISOString() })
    .eq('id', id);

  return NextResponse.json({ success: true, results });
}
