import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { isValidUUID } from '@/lib/validations/admin';

type Ctx = { params: Promise<{ id: string }> };

/**
 * "Idee übernehmen" — Creates a new draft post inspired by an intel entry.
 * Returns the intel data needed to pre-fill the AI Studio.
 */
export async function POST(_request: NextRequest, ctx: Ctx) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  // Load intel entry with competitor name
  const { data: intel, error } = await adminClient
    .from('content_intel')
    .select('*, content_competitors(name)')
    .eq('id', id)
    .single();

  if (error || !intel) return NextResponse.json({ error: 'Intel not found' }, { status: 404 });

  // Mark as used
  await adminClient
    .from('content_intel')
    .update({ is_used_as_inspiration: true })
    .eq('id', id);

  // Return data for AI Studio pre-fill
  return NextResponse.json({
    intel_id: intel.id,
    competitor_name: (intel.content_competitors as { name: string })?.name,
    content: intel.content,
    platform: intel.source_platform,
    media_type: intel.media_type,
    engagement: intel.engagement_data,
    ai_summary: intel.ai_summary,
    ai_funnel_stage: intel.ai_funnel_stage,
    ai_triggers_detected: intel.ai_triggers_detected,
    ai_hook_analysis: intel.ai_hook_analysis,
    ai_cta_analysis: intel.ai_cta_analysis,
  });
}
