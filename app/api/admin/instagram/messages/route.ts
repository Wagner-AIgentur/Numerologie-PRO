import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/admin-guard';

/**
 * GET /api/admin/instagram/messages?sender_id=...&limit=50&offset=0
 * Paginated messages for a specific conversation.
 */
export async function GET(request: NextRequest) {
  if (!(await requirePermission('instagram.view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const senderId = searchParams.get('sender_id');

  if (!senderId) {
    return NextResponse.json({ error: 'sender_id is required' }, { status: 400 });
  }

  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  const { data: messages, count, error } = await adminClient
    .from('instagram_messages')
    .select('*, profiles:profile_id(id, full_name, email, avatar_url)', { count: 'exact' })
    .eq('sender_id', senderId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[Admin Instagram] Messages fetch error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }

  return NextResponse.json({ messages: messages ?? [], total: count ?? 0 });
}
