import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { evaluateAllTagRules } from '@/lib/tagging/engine';

/**
 * POST /api/admin/tag-rules/run — Manually trigger auto-tagger (admin only)
 * Replaces direct cron endpoint call that leaked CRON_SECRET to client
 */
export async function POST() {
  const user = await requirePermission('tags.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await evaluateAllTagRules();
  return NextResponse.json(result);
}
