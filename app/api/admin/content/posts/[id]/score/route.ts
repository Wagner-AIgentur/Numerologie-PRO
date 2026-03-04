import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { isValidUUID } from '@/lib/validations/admin';
import { scoreContent } from '@/lib/intelligence/content-scorer';
import { safeParseJSON } from '@/lib/utils';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, ctx: Ctx) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  // Load the post
  const { data: post, error: postErr } = await adminClient
    .from('content_posts')
    .select('body, funnel_stage, target_platforms, triggers_used')
    .eq('id', id)
    .single();

  if (postErr || !post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  // Get competitor avg score for benchmark (optional)
  let competitorAvg: number | undefined;
  try {
    const { data: recentScores } = await adminClient
      .from('content_intel')
      .select('engagement_data')
      .not('engagement_data', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (recentScores && recentScores.length > 0) {
      const engagements = recentScores
        .map((r) => {
          const d = r.engagement_data as Record<string, number> | null;
          return (d?.likes ?? 0) + (d?.comments ?? 0) + (d?.shares ?? 0);
        })
        .filter((v) => v > 0);

      if (engagements.length > 0) {
        competitorAvg = Math.round(engagements.reduce((a, b) => a + b, 0) / engagements.length);
      }
    }
  } catch {
    // Benchmark is optional
  }

  const score = await scoreContent({
    content: post.body ?? '',
    funnel_stage: post.funnel_stage ?? 'tofu',
    platform: (post.target_platforms as string[])?.[0] ?? 'instagram',
    triggers_used: (post.triggers_used as string[]) ?? [],
    competitor_avg_score: competitorAvg,
  });

  return NextResponse.json(score);
}

/** Score content directly without a saved post */
export async function PUT(request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: parseError } = await safeParseJSON(request);
  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 });
  }
  const { content, funnel_stage, platform, triggers_used } = body as {
    content: string;
    funnel_stage: string;
    platform: string;
    triggers_used: string[];
  };

  if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 });

  const score = await scoreContent({
    content,
    funnel_stage: funnel_stage ?? 'tofu',
    platform: platform ?? 'instagram',
    triggers_used: triggers_used ?? [],
  });

  return NextResponse.json(score);
}
