import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { getPagination, paginatedResponse } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const competitorId = searchParams.get('competitor_id');
  const platform = searchParams.get('platform');
  const funnelStage = searchParams.get('funnel_stage');
  const bookmarked = searchParams.get('bookmarked');
  const { page, limit, offset } = getPagination(request);

  let query = adminClient
    .from('content_intel')
    .select('*, content_competitors!inner(name)', { count: 'exact' })
    .order('scraped_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (competitorId) query = query.eq('competitor_id', competitorId);
  if (platform) query = query.eq('source_platform', platform);
  if (funnelStage) query = query.eq('ai_funnel_stage', funnelStage);
  if (bookmarked === 'true') query = query.eq('is_bookmarked', true);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, { page, limit, offset }));
}
