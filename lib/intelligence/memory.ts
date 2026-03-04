/**
 * 3+1 Tier Memory Manager
 *
 * Tier 1: Core Memory (always in prompt, pinned, no decay)
 * Tier 2: Recall Memory (last 30 days, Supabase queries)
 * Tier 3: Archival Memory (Pinecone vectors, unlimited, time-decay)
 * Tier K: Knowledge Base (Pinecone "knowledge" namespace, filtered by source/method)
 */

import { adminClient } from '@/lib/supabase/admin';
import {
  generateEmbedding,
  upsertToPinecone,
  querySimilarWithDecay,
  type PineconeMetadata,
  type DecayedResult,
} from './embeddings';
import {
  searchKnowledge,
  formatKnowledgeForPrompt,
  type KnowledgeSearchResult,
} from './knowledge';

// ── Types ──────────────────────────────────────────────────────────────

export interface CoreMemoryContext {
  brand_voice: string;
  top_patterns: string;
  strategy: string;
  campaigns: string;
}

export interface RecallContext {
  recentPosts: Array<{ id: string; title: string; funnel_stage: string | null; content_type: string; created_at: string | null }>;
  recentIntel: Array<{ id: string; ai_summary: string | null; source_platform: string; ai_funnel_stage: string | null }>;
}

export interface FullContext {
  core: CoreMemoryContext;
  recall: RecallContext;
  archival: DecayedResult[];
  knowledge: KnowledgeSearchResult[];
  duplicateWarning: string | null;
}

export interface GenerationInput {
  topic: string;
  contentType?: string;
  funnelStage?: string;
  inspiredByIntelId?: string;
  useKnowledge?: boolean;
  knowledgeSource?: string; // Filter by course name
}

// ── Tier 1: Core Memory ────────────────────────────────────────────────

export async function loadCoreMemory(): Promise<CoreMemoryContext> {
  const { data } = await adminClient
    .from('content_core_memory')
    .select('memory_key, memory_value')
    .eq('is_pinned', true);

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.memory_key] = row.memory_value;
  }

  return {
    brand_voice: map.brand_voice ?? '',
    top_patterns: map.top_patterns ?? '',
    strategy: map.strategy ?? '',
    campaigns: map.campaigns ?? '',
  };
}

export async function updateCoreMemory(key: string, value: string): Promise<void> {
  await adminClient
    .from('content_core_memory')
    .upsert({
      memory_key: key,
      memory_value: value,
      is_pinned: true,
      last_updated_at: new Date().toISOString(),
    }, { onConflict: 'memory_key' });
}

/**
 * AI-powered brand voice extraction from recent posts.
 * Should be called after every 10th generation.
 */
export async function updateBrandVoice(recentPosts: Array<{ title: string; body: string | null; funnel_stage: string | null; content_type: string }>): Promise<void> {
  if (recentPosts.length < 5) return;

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) return;

  const summary = recentPosts.slice(0, 15).map((p, i) =>
    `${i + 1}. [${p.content_type}/${p.funnel_stage}] ${p.title}\n${p.body?.substring(0, 300) ?? ''}`,
  ).join('\n\n');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://numerologie-pro.com',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'system',
          content: 'Analysiere die folgenden Posts und extrahiere den Brand Voice Stil. Beschreibe: Ton (formell/locker), Humor-Level, Emoji-Nutzung, durchschnittliche Hook-Länge, CTA-Stil, bevorzugte psychologische Trigger, Themen-Affinität. Antworte in 3-5 Sätzen, knapp und präzise.',
        },
        { role: 'user', content: summary },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!res.ok) return;

  const data = await res.json();
  const voice = data.choices?.[0]?.message?.content;
  if (voice) {
    await updateCoreMemory('brand_voice', voice);
  }
}

// ── Tier 2: Recall Memory ──────────────────────────────────────────────

export async function getRecentContext(limit = 20): Promise<RecallContext> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: posts }, { data: intel }] = await Promise.all([
    adminClient
      .from('content_posts')
      .select('id, title, funnel_stage, content_type, created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(limit),
    adminClient
      .from('content_intel')
      .select('id, ai_summary, source_platform, ai_funnel_stage')
      .gte('scraped_at', thirtyDaysAgo)
      .eq('is_bookmarked', true)
      .order('scraped_at', { ascending: false })
      .limit(10),
  ]);

  return {
    recentPosts: posts ?? [],
    recentIntel: intel ?? [],
  };
}

/**
 * Auto-Capture: Extract insights from a saved post and store as memory.
 */
export async function extractMemories(
  sourceType: 'post' | 'intel' | 'generation',
  sourceId: string,
  content: string,
  tags: string[] = [],
): Promise<void> {
  await adminClient
    .from('content_memories')
    .insert({
      memory_type: sourceType === 'intel' ? 'competitor_insight' : 'style_pattern',
      content: content.substring(0, 1000),
      source_type: sourceType,
      source_id: sourceId,
      tags,
      confidence: 0.5,
    }).then(() => {}, () => {});
}

// ── Tier 3: Archival Memory ────────────────────────────────────────────

/**
 * Store a content piece in Pinecone for archival retrieval.
 * Called async (fire-and-forget) after post/intel save.
 */
export async function archiveContent(
  id: string,
  text: string,
  metadata: PineconeMetadata,
  namespace: string,
): Promise<void> {
  try {
    const embedding = await generateEmbedding(text);
    await upsertToPinecone(id, embedding, metadata, namespace);
  } catch (err) {
    console.error('[Memory] Archive failed:', err);
  }
}

/**
 * Search archival memory with time-decay scoring.
 */
export async function searchArchival(
  query: string,
  namespace = 'posts',
  topK = 5,
): Promise<DecayedResult[]> {
  return querySimilarWithDecay(query, namespace, topK);
}

// ── Combined: Auto-Recall Pipeline ─────────────────────────────────────

/**
 * Build full generation context from all 3 tiers.
 * Called before every AI generation to inject relevant context.
 */
export async function buildGenerationContext(input: GenerationInput): Promise<FullContext> {
  // Load all tiers + optional knowledge in parallel
  const [core, recall, archival, knowledge] = await Promise.all([
    loadCoreMemory(),
    getRecentContext(),
    input.topic ? searchArchival(input.topic, 'posts', 5).catch(() => []) : Promise.resolve([]),
    // Tier K: Knowledge Base (nur wenn aktiviert)
    input.useKnowledge && input.topic
      ? searchKnowledge({
          query: input.topic,
          topK: 6,
          sourceName: input.knowledgeSource,
        }).catch(() => [])
      : Promise.resolve([]),
  ]);

  // Duplicate check: if any archival result has >0.8 similarity, warn
  let duplicateWarning: string | null = null;
  const highSimilarity = archival.find((r) => r.score > 0.8);
  if (highSimilarity) {
    duplicateWarning = `Ähnlicher Content existiert bereits (${Math.round(highSimilarity.score * 100)}% Übereinstimmung): "${highSimilarity.metadata.title ?? highSimilarity.id}"`;
  }

  return { core, recall, archival, knowledge, duplicateWarning };
}

/**
 * Format context into prompt sections for injection into AI generation.
 */
export function formatContextForPrompt(ctx: FullContext): string {
  const sections: string[] = [];

  // Core Memory
  if (ctx.core.brand_voice) {
    sections.push(`[Brand Voice]\n${ctx.core.brand_voice}`);
  }
  if (ctx.core.top_patterns) {
    sections.push(`[Top-Performer Patterns]\n${ctx.core.top_patterns}`);
  }
  if (ctx.core.strategy) {
    sections.push(`[Content-Strategie]\n${ctx.core.strategy}`);
  }

  // Recall: Recent posts
  if (ctx.recall.recentPosts.length > 0) {
    const postSummary = ctx.recall.recentPosts.slice(0, 5).map((p) =>
      `- ${p.title} (${p.funnel_stage}, ${p.content_type})`,
    ).join('\n');
    sections.push(`[Kürzlich erstellte Posts]\n${postSummary}`);
  }

  // Archival: Similar content
  if (ctx.archival.length > 0) {
    const archSummary = ctx.archival.slice(0, 3).map((r) =>
      `- ${r.metadata.title ?? r.id} (${Math.round(r.score * 100)}% ähnlich, ${Math.round(r.ageHours / 24)}d alt)`,
    ).join('\n');
    sections.push(`[Historischer Kontext]\n${archSummary}`);
  }

  // Knowledge Base (Tier K)
  if (ctx.knowledge.length > 0) {
    sections.push(formatKnowledgeForPrompt(ctx.knowledge));
  }

  // Duplicate warning
  if (ctx.duplicateWarning) {
    sections.push(`[⚠️ Duplikat-Warnung]\n${ctx.duplicateWarning}\nErstelle einzigartigen Content, der sich klar unterscheidet.`);
  }

  return sections.length > 0
    ? `\n--- CONTENT INTELLIGENCE ---\n${sections.join('\n\n')}\n--- END INTELLIGENCE ---\n`
    : '';
}

// ── Auto-Capture Hooks ─────────────────────────────────────────────────

/**
 * Called after a post is saved. Performs:
 * 1. Embedding → Pinecone (Tier 3)
 * 2. Memory extraction (Tier 2)
 * 3. Brand voice update every 10 posts
 */
export async function onPostSaved(post: {
  id: string;
  title: string;
  body: string | null;
  funnel_stage: string;
  content_type: string;
  triggers_used: string[];
  target_platforms: string[];
  language: string;
}): Promise<void> {
  const text = `${post.title}\n\n${post.body ?? ''}`;

  // 1. Archive to Pinecone
  archiveContent(post.id, text, {
    type: 'post',
    title: post.title,
    funnel_stage: post.funnel_stage,
    content_type: post.content_type,
    triggers: post.triggers_used,
    platform: post.target_platforms?.[0],
    language: post.language,
    created_at: new Date().toISOString(),
  }, 'posts').catch(() => {});

  // 2. Extract memories
  extractMemories('post', post.id, text, [post.funnel_stage, post.content_type]).catch(() => {});

  // 3. Check if brand voice update needed (every 10 posts)
  const { count } = await adminClient
    .from('content_posts')
    .select('*', { count: 'exact', head: true });

  if (count && count % 10 === 0) {
    const { data: recent } = await adminClient
      .from('content_posts')
      .select('title, body, funnel_stage, content_type')
      .order('created_at', { ascending: false })
      .limit(15);

    if (recent) {
      updateBrandVoice(recent).catch(() => {});
    }
  }
}

/**
 * Called after intel is analyzed. Archives to Pinecone.
 */
export async function onIntelAnalyzed(intel: {
  id: string;
  content: string;
  ai_summary: string | null;
  source_platform: string;
  ai_funnel_stage: string | null;
  competitor_id: string;
}): Promise<void> {
  const text = intel.ai_summary ?? intel.content;

  archiveContent(intel.id, text, {
    type: 'intel',
    funnel_stage: intel.ai_funnel_stage ?? undefined,
    platform: intel.source_platform,
    created_at: new Date().toISOString(),
  }, 'intel').catch(() => {});

  extractMemories('intel', intel.id, text, [intel.source_platform]).catch(() => {});
}
