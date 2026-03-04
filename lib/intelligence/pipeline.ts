/**
 * Unified Competitor Scrape Pipeline
 *
 * Single entry point: URL in → full competitor analysis out.
 * Orchestrates: URL detection → scraping → AI analysis → storage → strategy report.
 */

import { detectUrl, type DetectedUrl } from './url-detector';
import { scrapeCompetitor, type ApifyPost } from './apify';
import { scrapeCompetitorWebsite, classifyPage, type ScrapedPage } from './firecrawl';
import { analyzeContent, generateStrategyReport, type StrategyReport } from './analyzer';
import { onIntelAnalyzed } from './memory';
import { adminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/types';

// ── Types ─────────────────────────────────────────────

export interface PipelineProgress {
  step: 'detecting' | 'scraping' | 'analyzing' | 'reporting' | 'done' | 'error';
  progress: number;
  message: string;
  data?: unknown;
}

export type ProgressCallback = (progress: PipelineProgress) => void;

export interface PipelineResult {
  competitorId: string;
  competitorName: string;
  platform: DetectedUrl['platform'];
  intelCount: number;
  analyzedCount: number;
  report: StrategyReport | null;
  errors: string[];
  warnings: string[];
}

// ── Pipeline ──────────────────────────────────────────

export async function runCompetitorPipeline(
  url: string,
  onProgress?: ProgressCallback,
): Promise<PipelineResult> {
  const notify = onProgress ?? (() => {});
  const errors: string[] = [];
  const warnings: string[] = [];

  // Step 1: Detect URL
  notify({ step: 'detecting', progress: 5, message: 'URL wird erkannt...' });
  const detected = detectUrl(url);
  notify({ step: 'detecting', progress: 10, message: `Platform erkannt: ${detected.platform}`, data: detected });

  // Step 2: Find or create competitor
  const competitorName = detected.handle ?? new URL(detected.url).hostname;
  const socialAccounts: Record<string, string> = {};
  if (detected.type === 'social' && detected.handle) {
    socialAccounts[detected.platform] = detected.handle;
  }

  // Try to find existing competitor first
  const { data: existing } = await adminClient
    .from('content_competitors')
    .select('id, name')
    .eq('name', competitorName)
    .maybeSingle();

  let compId: string;

  if (existing) {
    compId = existing.id as string;
    // Update with latest info
    await adminClient
      .from('content_competitors')
      .update({
        website_url: detected.type === 'website' ? detected.url : undefined,
        social_accounts: Object.keys(socialAccounts).length > 0 ? socialAccounts : undefined,
        is_active: true,
      })
      .eq('id', compId);
  } else {
    const { data: inserted, error: insertErr } = await adminClient
      .from('content_competitors')
      .insert({
        name: competitorName,
        website_url: detected.type === 'website' ? detected.url : null,
        social_accounts: socialAccounts,
        is_active: true,
        scrape_frequency: 'weekly',
      })
      .select('id')
      .single();

    if (insertErr || !inserted) throw new Error(`Failed to create competitor: ${insertErr?.message}`);
    compId = inserted.id as string;
  }
  notify({ step: 'scraping', progress: 15, message: 'Scraping gestartet...' });

  // Step 3: Scrape
  let posts: Array<{ caption: string; url: string; media_type: string; media_urls: string[]; posted_at: string | null; engagement: Record<string, unknown> }> = [];

  if (detected.type === 'social' && detected.handle) {
    try {
      const result = await scrapeCompetitor(detected.platform, detected.handle, 20);
      posts = result.posts.map((p: ApifyPost) => ({
        caption: p.caption,
        url: p.url,
        media_type: p.media_type,
        media_urls: p.media_urls,
        posted_at: p.posted_at,
        engagement: p.engagement as unknown as Record<string, unknown>,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Scrape fehlgeschlagen';
      errors.push(`Scraping (${detected.platform}): ${msg}`);
      notify({ step: 'scraping', progress: 40, message: `Scrape-Fehler: ${msg}` });
      console.error('[Pipeline] Social scrape failed:', err);
    }
  } else {
    try {
      const website = await scrapeCompetitorWebsite(detected.url);
      // Convert all website pages to post-like entries with smart content extraction
      const allPages: ScrapedPage[] = [
        website.homepage,
        ...website.blogPosts,
        ...website.productPages,
        ...website.otherPages,
      ];
      posts = allPages.map((page) => ({
        caption: summarizePageContent(page),
        url: page.url,
        media_type: classifyPage(page) as string,
        media_urls: extractImagesFromMarkdown(page.markdown),
        posted_at: null,
        engagement: {},
      }));
      if (website.productPages.length > 0) {
        warnings.push(`${website.productPages.length} Produkt-Seiten gefunden`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Website-Scrape fehlgeschlagen';
      errors.push(`Website-Scraping: ${msg}`);
      notify({ step: 'scraping', progress: 40, message: `Scrape-Fehler: ${msg}` });
      console.error('[Pipeline] Website scrape failed:', err);
    }
  }

  notify({ step: 'scraping', progress: 45, message: `${posts.length} Inhalte gefunden` });

  // Step 4: Analyze each post
  notify({ step: 'analyzing', progress: 50, message: 'AI analysiert Content...' });
  let analyzedCount = 0;
  const intelEntries: Array<{ content: string; platform: string; engagement: unknown; ai_funnel_stage: string; ai_triggers_detected: string[] }> = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const progressPct = 50 + Math.round((i / posts.length) * 35);
    notify({ step: 'analyzing', progress: progressPct, message: `Analysiere ${i + 1}/${posts.length}...` });

    let analysis = null;
    try {
      analysis = await analyzeContent({
        content: post.caption,
        platform: detected.platform,
        engagement: post.engagement,
        media_type: post.media_type,
      });
      analyzedCount++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analyse fehlgeschlagen';
      warnings.push(`AI-Analyse für Post ${i + 1}: ${msg}`);
    }

    const { data: intelRow } = await adminClient
      .from('content_intel')
      .insert({
        competitor_id: compId,
        source_platform: detected.platform,
        source_url: post.url,
        content: post.caption,
        media_urls: post.media_urls,
        media_type: post.media_type,
        posted_at: post.posted_at,
        engagement_data: post.engagement as unknown as Json,
        ...(analysis ?? {}),
      })
      .select('id')
      .single();

    if (intelRow && analysis) {
      onIntelAnalyzed({
        id: intelRow.id,
        content: post.caption,
        ai_summary: analysis.ai_summary,
        source_platform: detected.platform,
        ai_funnel_stage: analysis.ai_funnel_stage,
        competitor_id: compId,
      }).catch(() => {});

      intelEntries.push({
        content: post.caption,
        platform: detected.platform,
        engagement: post.engagement,
        ai_funnel_stage: analysis.ai_funnel_stage,
        ai_triggers_detected: analysis.ai_triggers_detected,
      });
    }
  }

  // Step 5: Generate strategy report
  notify({ step: 'reporting', progress: 90, message: 'Strategie-Report wird erstellt...' });
  let report: StrategyReport | null = null;

  if (intelEntries.length > 0) {
    try {
      report = await generateStrategyReport(competitorName, intelEntries);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Report fehlgeschlagen';
      warnings.push(`Strategy-Report: ${msg}`);
      console.error('[Pipeline] Strategy report failed:', err);
    }
  }

  // Update last_scraped_at
  await adminClient
    .from('content_competitors')
    .update({ last_scraped_at: new Date().toISOString() })
    .eq('id', compId);

  notify({ step: 'done', progress: 100, message: 'Fertig!', data: { report } });

  return {
    competitorId: compId,
    competitorName,
    platform: detected.platform,
    intelCount: posts.length,
    analyzedCount,
    report,
    errors,
    warnings,
  };
}

// ── Helpers ──────────────────────────────────────────

/** Extract image URLs from markdown content */
function extractImagesFromMarkdown(md: string): string[] {
  const matches = md.matchAll(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/g);
  return [...matches].map((m) => m[1]).slice(0, 5);
}

/** Build a structured content summary for AI analysis (preserves SEO meta + key content) */
function summarizePageContent(page: ScrapedPage): string {
  const parts: string[] = [];
  if (page.title) parts.push(`Titel: ${page.title}`);
  if (page.description) parts.push(`Meta-Description: ${page.description}`);
  parts.push(`URL: ${page.url}`);
  // Use up to 3000 chars of markdown content
  if (page.markdown) parts.push(`Inhalt:\n${page.markdown.substring(0, 3000)}`);
  return parts.join('\n');
}

/** Run pipeline for multiple URLs (batch mode) */
export async function runBatchPipeline(
  urls: string[],
  onProgress?: (urlIndex: number, progress: PipelineProgress) => void,
): Promise<PipelineResult[]> {
  const results: PipelineResult[] = [];

  for (let i = 0; i < urls.length; i++) {
    try {
      const result = await runCompetitorPipeline(urls[i], (p) => onProgress?.(i, p));
      results.push(result);
    } catch (err) {
      console.error(`[BatchPipeline] URL ${i} failed:`, err);
    }
  }

  return results;
}
