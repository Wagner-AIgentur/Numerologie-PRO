/**
 * Smart Auto-Tagging Engine
 *
 * Evaluates tag rules against profiles and applies/removes tags automatically.
 * Can be run as a nightly cron or inline after specific events.
 */

import { adminClient } from '@/lib/supabase/admin';

interface TagRule {
  id: string;
  tag_name: string;
  condition_type: string;
  condition_value: string;
  auto_remove: boolean | null;
  is_active: boolean | null;
}

interface EvalResult {
  rules_evaluated: number;
  tags_added: number;
  tags_removed: number;
  profiles_updated: number;
}

/**
 * Evaluate all active tag rules against all non-admin profiles.
 * Called by /api/cron/auto-tagger
 */
export async function evaluateAllTagRules(): Promise<EvalResult> {
  const result: EvalResult = { rules_evaluated: 0, tags_added: 0, tags_removed: 0, profiles_updated: 0 };

  const { data: rules } = await adminClient
    .from('tag_rules')
    .select('*')
    .eq('is_active', true);

  if (!rules?.length) return result;

  // Paginate profiles to avoid silent truncation at Supabase default 1000 rows
  const PAGE_SIZE = 500;
  let allProfiles: { id: string; tags: string[] | null; telegram_chat_id: number | null; birthdate: string | null; source: string | null; language: string | null; created_at: string | null; updated_at: string | null }[] = [];
  let from = 0;
  while (true) {
    const { data: page } = await adminClient
      .from('profiles')
      .select('id, tags, telegram_chat_id, birthdate, source, language, created_at, updated_at')
      .neq('crm_status', 'admin')
      .range(from, from + PAGE_SIZE - 1);
    if (!page?.length) break;
    allProfiles = allProfiles.concat(page as typeof allProfiles);
    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  const profiles = allProfiles;

  if (!profiles.length) return result;

  // Pre-fetch aggregate data (paginated)
  let allOrders: { profile_id: string; amount_cents: number; metadata: unknown }[] = [];
  from = 0;
  while (true) {
    const { data: page } = await adminClient
      .from('orders')
      .select('profile_id, amount_cents, metadata')
      .eq('status', 'paid')
      .range(from, from + PAGE_SIZE - 1);
    if (!page?.length) break;
    allOrders = allOrders.concat(page as typeof allOrders);
    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  const orderStats = allOrders;

  const { data: sessionStats } = await adminClient
    .from('sessions')
    .select('profile_id')
    .in('status', ['scheduled', 'confirmed', 'completed'])
    .limit(5000);

  // Build lookup maps
  const ordersByProfile = new Map<string, { count: number; revenue: number; packageKeys: string[] }>();
  for (const order of orderStats ?? []) {
    if (!order.profile_id) continue;
    const existing = ordersByProfile.get(order.profile_id) ?? { count: 0, revenue: 0, packageKeys: [] };
    existing.count++;
    existing.revenue += order.amount_cents;
    const pk = (order.metadata as Record<string, unknown>)?.package_key;
    if (typeof pk === 'string') existing.packageKeys.push(pk);
    ordersByProfile.set(order.profile_id, existing);
  }

  const sessionsByProfile = new Map<string, number>();
  for (const sess of sessionStats ?? []) {
    sessionsByProfile.set(sess.profile_id, (sessionsByProfile.get(sess.profile_id) ?? 0) + 1);
  }

  const updatedProfiles = new Set<string>();

  for (const rule of rules) {
    result.rules_evaluated++;

    for (const profile of profiles) {
      const currentTags = profile.tags ?? [];
      const hasTag = currentTags.includes(rule.tag_name);
      const matches = evaluateCondition(rule, profile, ordersByProfile, sessionsByProfile);

      if (matches && !hasTag) {
        // Add tag
        const newTags = [...currentTags, rule.tag_name];
        await adminClient
          .from('profiles')
          .update({ tags: newTags, updated_at: new Date().toISOString() })
          .eq('id', profile.id);
        profile.tags = newTags;
        result.tags_added++;
        updatedProfiles.add(profile.id);
      } else if (!matches && hasTag && rule.auto_remove) {
        // Remove tag (only if auto_remove is enabled)
        const newTags = currentTags.filter((t: string) => t !== rule.tag_name);
        await adminClient
          .from('profiles')
          .update({ tags: newTags, updated_at: new Date().toISOString() })
          .eq('id', profile.id);
        profile.tags = newTags;
        result.tags_removed++;
        updatedProfiles.add(profile.id);
      }
    }
  }

  result.profiles_updated = updatedProfiles.size;
  return result;
}

/**
 * Evaluate a single tag rule for a specific profile (inline trigger).
 * Used after events like order completion.
 */
export async function evaluateTagRulesForProfile(profileId: string): Promise<void> {
  const { data: rules } = await adminClient
    .from('tag_rules')
    .select('*')
    .eq('is_active', true);

  if (!rules?.length) return;

  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, tags, telegram_chat_id, birthdate, source, language, created_at, updated_at')
    .eq('id', profileId)
    .single();

  if (!profile) return;

  const { data: orders } = await adminClient
    .from('orders')
    .select('profile_id, amount_cents, metadata')
    .eq('profile_id', profileId)
    .eq('status', 'paid');

  const { data: sessions } = await adminClient
    .from('sessions')
    .select('profile_id')
    .eq('profile_id', profileId)
    .in('status', ['scheduled', 'confirmed', 'completed']);

  const ordersByProfile = new Map<string, { count: number; revenue: number; packageKeys: string[] }>();
  const stats = { count: 0, revenue: 0, packageKeys: [] as string[] };
  for (const order of orders ?? []) {
    stats.count++;
    stats.revenue += order.amount_cents;
    const pk = (order.metadata as Record<string, unknown>)?.package_key;
    if (typeof pk === 'string') stats.packageKeys.push(pk);
  }
  ordersByProfile.set(profileId, stats);

  const sessionsByProfile = new Map<string, number>();
  sessionsByProfile.set(profileId, sessions?.length ?? 0);

  let currentTags = profile.tags ?? [];
  let changed = false;

  for (const rule of rules) {
    const hasTag = currentTags.includes(rule.tag_name);
    const matches = evaluateCondition(rule, profile, ordersByProfile, sessionsByProfile);

    if (matches && !hasTag) {
      currentTags = [...currentTags, rule.tag_name];
      changed = true;
    } else if (!matches && hasTag && rule.auto_remove) {
      currentTags = currentTags.filter((t: string) => t !== rule.tag_name);
      changed = true;
    }
  }

  if (changed) {
    await adminClient
      .from('profiles')
      .update({ tags: currentTags, updated_at: new Date().toISOString() })
      .eq('id', profileId);
  }
}

function evaluateCondition(
  rule: TagRule,
  profile: { id: string; telegram_chat_id: number | null; birthdate: string | null; source: string | null; language: string | null; updated_at: string | null },
  ordersByProfile: Map<string, { count: number; revenue: number; packageKeys: string[] }>,
  sessionsByProfile: Map<string, number>,
): boolean {
  const orders = ordersByProfile.get(profile.id) ?? { count: 0, revenue: 0, packageKeys: [] };
  const sessionCount = sessionsByProfile.get(profile.id) ?? 0;

  switch (rule.condition_type) {
    case 'order_count_gte':
      return orders.count >= parseInt(rule.condition_value, 10);

    case 'total_revenue_gte':
      return orders.revenue >= parseInt(rule.condition_value, 10);

    case 'has_product':
      return orders.packageKeys.includes(rule.condition_value);

    case 'has_session':
      return sessionCount > 0;

    case 'inactive_days_gte': {
      if (!profile.updated_at) return false;
      const lastActive = new Date(profile.updated_at);
      const daysSince = (Date.now() - lastActive.getTime()) / 86400000;
      return daysSince >= parseInt(rule.condition_value, 10);
    }

    case 'has_telegram':
      return profile.telegram_chat_id !== null;

    case 'language_is':
      return profile.language === rule.condition_value;

    case 'source_is':
      return profile.source === rule.condition_value;

    case 'has_birthdate':
      return profile.birthdate !== null;

    case 'birthdate_month': {
      if (!profile.birthdate) return false;
      const month = new Date(profile.birthdate).getMonth() + 1;
      return month === parseInt(rule.condition_value, 10);
    }

    default:
      return false;
  }
}
