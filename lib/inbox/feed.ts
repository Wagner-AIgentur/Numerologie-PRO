import { adminClient } from '@/lib/supabase/admin';

export type ActivityType =
  | 'email_received'
  | 'email_sent'
  | 'telegram_in'
  | 'telegram_out'
  | 'contact_form'
  | 'order'
  | 'session'
  | 'note'
  | 'deal_update'
  | 'instagram_dm_in'
  | 'instagram_dm_out'
  | 'instagram_lead';

interface AddToFeedParams {
  profileId?: string | null;
  activityType: ActivityType;
  sourceTable: string;
  sourceId: string;
  title: string;
  preview?: string;
  requiresAction?: boolean;
}

/**
 * Add a new entry to the unified activity feed (inbox).
 * Fire-and-forget safe — errors are logged but don't throw.
 */
export async function addToFeed(params: AddToFeedParams) {
  const { error } = await adminClient.from('activity_feed').insert({
    profile_id: params.profileId ?? null,
    activity_type: params.activityType,
    source_table: params.sourceTable,
    source_id: params.sourceId,
    title: params.title,
    preview: params.preview ?? null,
    requires_action: params.requiresAction ?? false,
  });

  if (error) {
    console.error('[activity_feed] Insert failed:', error.message);
  }
}
