import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission, isDemoReviewer } from '@/lib/auth/admin-guard';

/**
 * GET /api/admin/inbox
 * Paginated activity feed with optional filters.
 * Query params: ?type=contact_form&read=false&limit=50&offset=0
 */
export async function GET(request: NextRequest) {
  if (!(await requirePermission('inbox.view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Demo reviewers: return empty inbox (no real customer messages)
  if (await isDemoReviewer()) {
    return NextResponse.json({ items: [], total: 0 });
  }

  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type');
  const read = searchParams.get('read');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  let query = adminClient
    .from('activity_feed')
    .select('*, profiles:profile_id(id, full_name, email, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq('activity_type', type);
  }

  if (read === 'true') {
    query = query.eq('is_read', true);
  } else if (read === 'false') {
    query = query.eq('is_read', false);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('[inbox] Fetch error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch inbox' }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [], total: count ?? 0 });
}
