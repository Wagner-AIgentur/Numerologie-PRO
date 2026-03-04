import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { scrapeCompetitor } from '@/lib/intelligence/apify';
import { scrapeCompetitorWebsite } from '@/lib/intelligence/firecrawl';
import { analyzeContent } from '@/lib/intelligence/analyzer';
import { onIntelAnalyzed } from '@/lib/intelligence/memory';
import { safeCompare } from '@/lib/rate-limit';

const MAX_PER_RUN = 3;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || !safeCompare(authHeader ?? '', `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get competitors due for scraping
  const { data: competitors } = await adminClient
    .from('content_competitors')
    .select('*')
    .eq('is_active', true)
    .neq('scrape_frequency', 'manual')
    .order('last_scraped_at', { ascending: true, nullsFirst: true })
    .limit(MAX_PER_RUN * 2);

  if (!competitors || competitors.length === 0) {
    return NextResponse.json({ message: 'No competitors to scrape', scraped: 0 });
  }

  // Filter by frequency
  const due = competitors.filter((c) => {
    if (c.scrape_frequency === 'daily') return true;
    if (c.scrape_frequency === 'weekly') {
      return !c.last_scraped_at || c.last_scraped_at < sevenDaysAgo;
    }
    return false;
  }).slice(0, MAX_PER_RUN);

  const results: Array<{ id: string; name: string; scraped: number; analyzed: number }> = [];

  for (const comp of due) {
    const socialAccounts = (comp.social_accounts ?? {}) as Record<string, string>;
    let totalScraped = 0;
    let totalAnalyzed = 0;

    // Scrape social accounts
    for (const [platform, handle] of Object.entries(socialAccounts)) {
      if (!handle) continue;

      try {
        const result = await scrapeCompetitor(platform, handle, 15);

        for (const post of result.posts) {
          let analysis = null;
          try {
            analysis = await analyzeContent({
              content: post.caption,
              platform,
              engagement: post.engagement,
              media_type: post.media_type,
            });
            totalAnalyzed++;
          } catch {
            // Continue without analysis
          }

          const { data: intelRow } = await adminClient
            .from('content_intel')
            .insert({
              competitor_id: comp.id,
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

          if (intelRow && analysis) {
            onIntelAnalyzed({
              id: intelRow.id,
              content: post.caption,
              ai_summary: analysis.ai_summary,
              source_platform: platform,
              ai_funnel_stage: analysis.ai_funnel_stage,
              competitor_id: comp.id,
            }).catch(() => {});
          }

          totalScraped++;
        }
      } catch (err) {
        console.error(`[CronScrape] ${platform}/${handle} failed:`, err);
      }
    }

    // Scrape website if configured
    if (comp.website_url && Object.keys(socialAccounts).length === 0) {
      try {
        const website = await scrapeCompetitorWebsite(comp.website_url);
        const pages = [website.homepage, ...website.blogPosts];

        for (const page of pages) {
          let analysis = null;
          try {
            analysis = await analyzeContent({
              content: page.markdown.substring(0, 2000),
              platform: 'website',
              media_type: 'article',
            });
            totalAnalyzed++;
          } catch {
            // Continue without analysis
          }

          await adminClient.from('content_intel').insert({
            competitor_id: comp.id,
            source_platform: 'website',
            source_url: page.url,
            content: page.markdown.substring(0, 2000),
            media_type: 'article',
            ...(analysis ?? {}),
          });

          totalScraped++;
        }
      } catch (err) {
        console.error(`[CronScrape] Website ${comp.website_url} failed:`, err);
      }
    }

    // Update timestamp
    await adminClient
      .from('content_competitors')
      .update({ last_scraped_at: now.toISOString() })
      .eq('id', comp.id);

    results.push({ id: comp.id, name: comp.name, scraped: totalScraped, analyzed: totalAnalyzed });
  }

  return NextResponse.json({ success: true, scraped: results.length, results });
}
