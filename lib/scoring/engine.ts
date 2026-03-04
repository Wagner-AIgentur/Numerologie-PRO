/**
 * KI-Lead-Scoring Engine
 *
 * Calculates and updates lead scores for all non-admin profiles.
 * Uses the PostgreSQL calculate_lead_score() RPC function.
 */

import { adminClient } from '@/lib/supabase/admin';

interface RecalculateResult {
  profiles_scored: number;
  errors: number;
}

/**
 * Recalculate lead scores for ALL non-admin profiles.
 * Called by /api/cron/lead-scoring and /api/admin/lead-scoring/recalculate
 */
export async function recalculateAllScores(): Promise<RecalculateResult> {
  const result: RecalculateResult = { profiles_scored: 0, errors: 0 };

  // Paginate profiles to avoid silent truncation at Supabase default 1000 rows
  const PAGE_SIZE = 500;
  let allProfiles: { id: string }[] = [];
  let from = 0;
  while (true) {
    const { data: page } = await adminClient
      .from('profiles')
      .select('id')
      .neq('crm_status', 'admin')
      .range(from, from + PAGE_SIZE - 1);
    if (!page?.length) break;
    allProfiles = allProfiles.concat(page);
    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  const profiles = allProfiles;

  if (!profiles.length) return result;

  const now = new Date().toISOString();

  for (const profile of profiles) {
    try {
      const { data: score, error } = await adminClient
        .rpc('calculate_lead_score', { p_profile_id: profile.id });

      if (error) {
        console.error(`[Lead-Scoring] RPC error for ${profile.id}:`, error.message);
        result.errors++;
        continue; // Keep existing score instead of setting to 0
      }

      // Only update score if RPC returned a valid value
      if (score != null) {
        await adminClient
          .from('profiles')
          .update({
            lead_score: score,
            lead_score_updated_at: now,
          })
          .eq('id', profile.id);
      }

      result.profiles_scored++;
    } catch (err) {
      console.error(`[Lead-Scoring] Error for ${profile.id}:`, err);
      result.errors++;
    }
  }

  return result;
}

/**
 * Update last_activity_at for a profile (called after key events like orders).
 */
export async function updateLastActivity(profileId: string): Promise<void> {
  await adminClient
    .from('profiles')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', profileId);
}
