import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { scoreContent } from '@/lib/intelligence/content-scorer';
import { safeParseJSON } from '@/lib/utils';

/** Inline content scoring — no saved post required */
export async function POST(request: NextRequest) {
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

  if (!content || content.trim().length < 20) {
    return NextResponse.json({ error: 'Content must be at least 20 characters' }, { status: 400 });
  }

  try {
    const score = await scoreContent({
      content,
      funnel_stage: funnel_stage ?? 'tofu',
      platform: platform ?? 'instagram',
      triggers_used: triggers_used ?? [],
    });

    return NextResponse.json(score);
  } catch (err) {
    console.error('[Score] Inline scoring failed:', err);
    return NextResponse.json(
      { error: 'Scoring failed', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
