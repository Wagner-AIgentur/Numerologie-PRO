import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { isValidUUID } from '@/lib/validations/admin';
import { generateStrategyReport } from '@/lib/intelligence/analyzer';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, ctx: Ctx) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  // Load competitor
  const { data: competitor } = await adminClient
    .from('content_competitors')
    .select('name')
    .eq('id', id)
    .single();

  if (!competitor) return NextResponse.json({ error: 'Competitor not found' }, { status: 404 });

  // Load intel entries
  const { data: intel } = await adminClient
    .from('content_intel')
    .select('content, source_platform, engagement_data, ai_funnel_stage, ai_triggers_detected')
    .eq('competitor_id', id)
    .order('scraped_at', { ascending: false })
    .limit(50);

  if (!intel || intel.length === 0) {
    return NextResponse.json({ error: 'No intel data available. Scrape first.' }, { status: 400 });
  }

  const report = await generateStrategyReport(
    competitor.name,
    intel.map((i) => ({
      content: i.content ?? '',
      platform: i.source_platform,
      engagement: i.engagement_data,
      ai_funnel_stage: i.ai_funnel_stage ?? 'tofu',
      ai_triggers_detected: i.ai_triggers_detected ?? [],
    })),
  );

  return NextResponse.json(report);
}
