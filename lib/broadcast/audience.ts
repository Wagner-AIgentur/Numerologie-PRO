/**
 * Audience Resolution
 *
 * Resolves a broadcast audience filter into concrete recipient records
 * (profile IDs with their email/telegram_chat_id).
 */

import { adminClient } from '@/lib/supabase/admin';

export interface AudienceFilter {
  type: 'all' | 'status' | 'leads' | 'tags' | 'language' | 'custom';
  values?: string[];
  profile_ids?: string[];
}

export interface ResolvedRecipient {
  profile_id: string;
  email: string | null;
  telegram_chat_id: number | null;
  whatsapp_phone: string | null;
  language: string;
}

/**
 * Resolve audience filter to a list of recipients.
 * Excludes admins. Applies language filter if set.
 */
export async function resolveAudience(
  filter: AudienceFilter,
  languageFilter: 'de' | 'ru' | 'all',
): Promise<ResolvedRecipient[]> {
  let query = adminClient
    .from('profiles')
    .select('id, email, telegram_chat_id, whatsapp_phone, language')
    .neq('crm_status', 'admin')
    .neq('email_unsubscribed', true);

  // Language filter
  if (languageFilter !== 'all') {
    query = query.eq('language', languageFilter);
  }

  // Audience filter
  switch (filter.type) {
    case 'all':
      // No additional filter — all non-admin profiles
      break;

    case 'status':
      if (filter.values?.length) {
        query = query.in('crm_status', filter.values);
      }
      break;

    case 'tags':
      if (filter.values?.length) {
        query = query.overlaps('tags', filter.values);
      }
      break;

    case 'language':
      if (filter.values?.length) {
        query = query.in('language', filter.values);
      }
      break;

    case 'custom':
      if (filter.profile_ids?.length) {
        query = query.in('id', filter.profile_ids);
      }
      break;

    case 'leads':
      // Leads are handled separately below
      break;
  }

  if (filter.type === 'leads') {
    // Query verified leads with marketing consent
    let leadsQuery = adminClient
      .from('leads')
      .select('id, email, language, profile_id')
      .eq('email_verified', true)
      .eq('marketing_consent', true)
      .neq('email_unsubscribed', true);

    if (languageFilter !== 'all') {
      leadsQuery = leadsQuery.eq('language', languageFilter);
    }

    const { data: leads } = await leadsQuery;

    // Leads that already have a linked profile — use profile data
    // Leads without profile — email only (no telegram)
    const recipients: ResolvedRecipient[] = [];
    const seenEmails = new Set<string>();

    for (const lead of leads ?? []) {
      if (seenEmails.has(lead.email)) continue;
      seenEmails.add(lead.email);

      if (lead.profile_id) {
        // Fetch profile for telegram_chat_id
        const { data: profile } = await adminClient
          .from('profiles')
          .select('id, email, telegram_chat_id, whatsapp_phone, language')
          .eq('id', lead.profile_id)
          .single();

        if (profile) {
          recipients.push({
            profile_id: profile.id,
            email: profile.email,
            telegram_chat_id: profile.telegram_chat_id,
            whatsapp_phone: profile.whatsapp_phone,
            language: profile.language ?? 'de',
          });
          continue;
        }
      }

      // Lead without linked profile — email-only
      recipients.push({
        profile_id: lead.id, // use lead id as fallback identifier
        email: lead.email,
        telegram_chat_id: null,
        whatsapp_phone: null,
        language: lead.language ?? 'de',
      });
    }

    return recipients;
  }

  const { data: profiles } = await query;

  return (profiles ?? []).map((p) => ({
    profile_id: p.id,
    email: p.email,
    telegram_chat_id: p.telegram_chat_id,
    whatsapp_phone: p.whatsapp_phone ?? null,
    language: p.language ?? 'de',
  }));
}

/**
 * Count audience without fetching full data — used for preview in composer.
 */
export async function countAudience(
  filter: AudienceFilter,
  languageFilter: 'de' | 'ru' | 'all',
): Promise<number> {
  if (filter.type === 'leads') {
    let q = adminClient
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('email_verified', true)
      .eq('marketing_consent', true)
      .neq('email_unsubscribed', true);
    if (languageFilter !== 'all') q = q.eq('language', languageFilter);
    const { count } = await q;
    return count ?? 0;
  }

  let query = adminClient
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .neq('crm_status', 'admin')
    .neq('email_unsubscribed', true);

  if (languageFilter !== 'all') query = query.eq('language', languageFilter);

  switch (filter.type) {
    case 'status':
      if (filter.values?.length) query = query.in('crm_status', filter.values);
      break;
    case 'tags':
      if (filter.values?.length) query = query.overlaps('tags', filter.values);
      break;
    case 'language':
      if (filter.values?.length) query = query.in('language', filter.values);
      break;
    case 'custom':
      if (filter.profile_ids?.length) query = query.in('id', filter.profile_ids);
      break;
  }

  const { count } = await query;
  return count ?? 0;
}
