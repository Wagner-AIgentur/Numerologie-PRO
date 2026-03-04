import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/automations/logs — Paginated automation log viewer
 * Query: ?page=1&limit=50&rule_id=xxx&status=failed
 */
export async function GET(request: NextRequest) {
  const user = await requirePermission('automations.view');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10));
  const ruleId = searchParams.get('rule_id');
  const status = searchParams.get('status');
  const offset = (page - 1) * limit;

  let query = adminClient
    .from('automation_logs')
    .select('*, automation_rules!inner(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (ruleId) query = query.eq('rule_id', ruleId);
  if (status) query = query.eq('status', status);

  const { data, count, error } = await query;

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json({
    logs: data ?? [],
    total: count ?? 0,
    page,
    pages: Math.ceil((count ?? 0) / limit),
  });
}
