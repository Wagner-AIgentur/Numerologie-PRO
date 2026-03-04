import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { recalculateAllScores } from '@/lib/scoring/engine';

/**
 * POST /api/admin/lead-scoring/recalculate
 *
 * Manual trigger for admin to recalculate all lead scores.
 */
export async function POST() {
  const user = await requirePermission('leads.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await recalculateAllScores();

  console.log(
    `[Lead-Scoring Admin] Triggered by ${user.email} — Scored: ${result.profiles_scored}, Errors: ${result.errors}`,
  );

  return NextResponse.json(result);
}
