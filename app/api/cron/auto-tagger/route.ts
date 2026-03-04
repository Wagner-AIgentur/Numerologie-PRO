import { NextRequest, NextResponse } from 'next/server';
import { evaluateAllTagRules } from '@/lib/tagging/engine';
import { safeCompare } from '@/lib/rate-limit';

/**
 * GET /api/cron/auto-tagger
 *
 * Nightly cron job that evaluates all tag rules against all profiles.
 * Adds and removes tags based on behavior patterns.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || !safeCompare(authHeader ?? '', `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await evaluateAllTagRules();

  console.log(
    `[Auto-Tagger] Rules: ${result.rules_evaluated}, Added: ${result.tags_added}, Removed: ${result.tags_removed}, Profiles updated: ${result.profiles_updated}`,
  );

  return NextResponse.json(result);
}
