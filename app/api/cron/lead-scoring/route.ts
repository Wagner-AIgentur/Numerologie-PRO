import { NextRequest, NextResponse } from 'next/server';
import { recalculateAllScores } from '@/lib/scoring/engine';
import { safeCompare } from '@/lib/rate-limit';

/**
 * GET /api/cron/lead-scoring
 *
 * Nightly cron job that recalculates lead scores for all profiles.
 * Secured via CRON_SECRET bearer token.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || !safeCompare(authHeader ?? '', `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await recalculateAllScores();

  console.log(
    `[Lead-Scoring Cron] Scored: ${result.profiles_scored}, Errors: ${result.errors}`,
  );

  return NextResponse.json(result);
}
