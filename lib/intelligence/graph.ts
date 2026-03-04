/**
 * Content Knowledge Graph
 *
 * Manages relationships between content entities:
 * - Post → Intel (inspired_by)
 * - Post → Post (similar_to)
 * - Post → Trigger (uses_trigger)
 * - Intel → Competitor (from_competitor)
 * - Topic clusters via embedding proximity
 */

import { adminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/types';

export interface ContentRelationship {
  source_type: string;
  source_id: string;
  relation: string;
  target_type: string;
  target_id: string;
  strength?: number | null;
  metadata?: Record<string, unknown>;
}

export interface GraphPath {
  nodes: Array<{ type: string; id: string }>;
  edges: Array<{ relation: string; strength: number }>;
}

export interface TopicCluster {
  label: string;
  post_count: number;
  avg_funnel_stage: string;
  post_ids: string[];
}

export interface CompetitorPattern {
  competitor_id: string;
  dominant_triggers: Array<{ trigger: string; count: number }>;
  funnel_distribution: Record<string, number>;
  top_formats: Array<{ format: string; count: number }>;
}

// ── CRUD ───────────────────────────────────────────────────────────────

export async function addRelationship(rel: ContentRelationship): Promise<void> {
  await adminClient
    .from('content_relationships')
    .insert({
      source_type: rel.source_type,
      source_id: rel.source_id,
      relation: rel.relation,
      target_type: rel.target_type,
      target_id: rel.target_id,
      strength: rel.strength ?? 1.0,
      metadata: (rel.metadata ?? {}) as Json,
    }).then(() => {}, () => {});
}

export async function getRelationships(
  entityType: string,
  entityId: string,
  relation?: string,
): Promise<ContentRelationship[]> {
  let query = adminClient
    .from('content_relationships')
    .select('*')
    .or(`and(source_type.eq.${entityType},source_id.eq.${entityId}),and(target_type.eq.${entityType},target_id.eq.${entityId})`);

  if (relation) {
    query = query.eq('relation', relation);
  }

  const { data } = await query.limit(100);
  return (data ?? []) as unknown as ContentRelationship[];
}

// ── Graph Traversal ────────────────────────────────────────────────────

export async function findRelatedPosts(postId: string): Promise<Array<{ id: string; relation: string; strength: number }>> {
  const rels = await getRelationships('post', postId);

  return rels
    .filter((r) =>
      (r.source_type === 'post' && r.source_id !== postId) ||
      (r.target_type === 'post' && r.target_id !== postId),
    )
    .map((r) => ({
      id: r.source_type === 'post' && r.source_id !== postId ? r.source_id : r.target_id,
      relation: r.relation,
      strength: r.strength ?? 1.0,
    }));
}

export async function getInspirationChain(postId: string): Promise<GraphPath> {
  // Trace: Post → Intel → Competitor
  const nodes: Array<{ type: string; id: string }> = [{ type: 'post', id: postId }];
  const edges: Array<{ relation: string; strength: number }> = [];

  // Check if post was inspired by intel
  const { data: post } = await adminClient
    .from('content_posts')
    .select('inspired_by_intel_id')
    .eq('id', postId)
    .single();

  if (post?.inspired_by_intel_id) {
    nodes.push({ type: 'intel', id: post.inspired_by_intel_id });
    edges.push({ relation: 'inspired_by', strength: 1.0 });

    // Get competitor from intel
    const { data: intel } = await adminClient
      .from('content_intel')
      .select('competitor_id')
      .eq('id', post.inspired_by_intel_id)
      .single();

    if (intel?.competitor_id) {
      nodes.push({ type: 'competitor', id: intel.competitor_id });
      edges.push({ relation: 'from_competitor', strength: 1.0 });
    }
  }

  return { nodes, edges };
}

// ── Competitor Patterns ────────────────────────────────────────────────

export async function getCompetitorPatterns(competitorId: string): Promise<CompetitorPattern> {
  const { data: intel } = await adminClient
    .from('content_intel')
    .select('ai_funnel_stage, ai_triggers_detected, content_format')
    .eq('competitor_id', competitorId)
    .limit(200);

  const entries = intel ?? [];

  // Dominant triggers
  const triggerCount = new Map<string, number>();
  for (const e of entries) {
    for (const t of (e.ai_triggers_detected ?? []) as string[]) {
      triggerCount.set(t, (triggerCount.get(t) ?? 0) + 1);
    }
  }
  const dominant_triggers = Array.from(triggerCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([trigger, count]) => ({ trigger, count }));

  // Funnel distribution
  const funnel_distribution: Record<string, number> = { tofu: 0, mofu: 0, bofu: 0, retention: 0 };
  for (const e of entries) {
    if (e.ai_funnel_stage && funnel_distribution[e.ai_funnel_stage] !== undefined) {
      funnel_distribution[e.ai_funnel_stage]++;
    }
  }

  // Top formats
  const formatCount = new Map<string, number>();
  for (const e of entries) {
    if (e.content_format) {
      formatCount.set(e.content_format, (formatCount.get(e.content_format) ?? 0) + 1);
    }
  }
  const top_formats = Array.from(formatCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([format, count]) => ({ format, count }));

  return { competitor_id: competitorId, dominant_triggers, funnel_distribution, top_formats };
}

// ── Auto-Graph Hooks ───────────────────────────────────────────────────

/**
 * Called after post save to create graph edges.
 */
export async function onPostSavedGraph(post: {
  id: string;
  inspired_by_intel_id: string | null;
  triggers_used: string[];
  funnel_stage: string;
}): Promise<void> {
  // Link to inspiration source
  if (post.inspired_by_intel_id) {
    await addRelationship({
      source_type: 'post',
      source_id: post.id,
      relation: 'inspired_by',
      target_type: 'intel',
      target_id: post.inspired_by_intel_id,
    });
  }

  // Link to triggers used
  for (const trigger of post.triggers_used ?? []) {
    await addRelationship({
      source_type: 'post',
      source_id: post.id,
      relation: 'uses_trigger',
      target_type: 'trigger',
      target_id: trigger,
      metadata: { funnel_stage: post.funnel_stage },
    });
  }
}
