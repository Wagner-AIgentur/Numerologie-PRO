import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';

/**
 * Content-Gap-Analyse: Compares own posts vs competitor intel
 * to find topics/stages where competitors are active but we aren't.
 */
export async function GET(_request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Own posts distribution
  const { data: ownPosts } = await adminClient
    .from('content_posts')
    .select('funnel_stage, content_type, target_platforms')
    .not('status', 'eq', 'archived');

  // Competitor intel distribution
  const { data: intel } = await adminClient
    .from('content_intel')
    .select('ai_funnel_stage, content_format, source_platform, ai_topics, engagement_data, content_competitors(name)')
    .order('scraped_at', { ascending: false })
    .limit(500);

  if (!ownPosts || !intel) {
    return NextResponse.json({ gaps: [], recommendations: [] });
  }

  // Aggregate own content by funnel stage
  const ownByFunnel: Record<string, number> = { tofu: 0, mofu: 0, bofu: 0, retention: 0 };
  for (const p of ownPosts) {
    if (p.funnel_stage && ownByFunnel[p.funnel_stage] !== undefined) {
      ownByFunnel[p.funnel_stage]++;
    }
  }

  // Aggregate competitor content by funnel stage
  const compByFunnel: Record<string, number> = { tofu: 0, mofu: 0, bofu: 0, retention: 0 };
  for (const i of intel) {
    if (i.ai_funnel_stage && compByFunnel[i.ai_funnel_stage] !== undefined) {
      compByFunnel[i.ai_funnel_stage]++;
    }
  }

  // Collect topic clusters from competitor intel
  const topicMap = new Map<string, { count: number; funnel: string; platform: string; totalEngagement: number }>();
  for (const i of intel) {
    const topics = (i.ai_topics ?? []) as string[];
    const engagement = (i.engagement_data as Record<string, number>) ?? {};
    const engScore = (engagement.likes ?? 0) + (engagement.comments ?? 0) * 3 + (engagement.shares ?? 0) * 5;

    for (const topic of topics) {
      const key = topic.toLowerCase();
      const existing = topicMap.get(key);
      if (existing) {
        existing.count++;
        existing.totalEngagement += engScore;
      } else {
        topicMap.set(key, {
          count: 1,
          funnel: i.ai_funnel_stage ?? 'tofu',
          platform: i.source_platform,
          totalEngagement: engScore,
        });
      }
    }
  }

  // Find gaps: topics competitors cover heavily but we have few/no posts about
  const gaps = Array.from(topicMap.entries())
    .filter(([_, v]) => v.count >= 2)
    .sort((a, b) => b[1].totalEngagement - a[1].totalEngagement)
    .slice(0, 20)
    .map(([topic, data]) => ({
      topic,
      competitor_count: data.count,
      own_count: 0, // TODO: semantic matching in Schritt 7
      funnel_stage: data.funnel,
      platform: data.platform,
      avg_engagement: Math.round(data.totalEngagement / data.count),
      suggestion: `Wettbewerber haben ${data.count} Beiträge zu "${topic}" (${data.funnel.toUpperCase()}) — erstelle eigenen Content.`,
    }));

  // Funnel balance recommendations
  const recommendations: string[] = [];
  const ownTotal = Object.values(ownByFunnel).reduce((s, v) => s + v, 0) || 1;

  if (ownByFunnel.bofu / ownTotal < 0.1 && compByFunnel.bofu > 5) {
    recommendations.push('Deine Wettbewerber haben mehr BOFU-Content (Conversions). Erstelle mehr Angebots- und Testimonial-Posts.');
  }
  if (ownByFunnel.tofu / ownTotal < 0.3 && compByFunnel.tofu > 10) {
    recommendations.push('Deine Wettbewerber investieren stark in TOFU (Reichweite). Erstelle mehr virale Hooks und Pattern Interrupts.');
  }
  if (ownByFunnel.retention === 0 && compByFunnel.retention > 3) {
    recommendations.push('Du hast keinen Retention-Content. Erstelle Community-Posts und exklusive Tipps für Bestandskunden.');
  }

  return NextResponse.json({
    own_distribution: ownByFunnel,
    competitor_distribution: compByFunnel,
    gaps,
    recommendations,
  });
}
