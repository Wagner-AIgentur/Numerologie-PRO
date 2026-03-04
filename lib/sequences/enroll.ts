/**
 * Sequence Enrollment Engine
 *
 * Handles automatic enrollment of leads/profiles into email sequences
 * based on trigger events and filters.
 */

import { adminClient } from '@/lib/supabase/admin';

type TriggerEvent =
  | 'lead_created'
  | 'lead_verified'
  | 'profile_created'
  | 'order_completed'
  | 'session_completed'
  | 'tag_added'
  | 'manual';

interface EnrollContext {
  email: string;
  profileId?: string | null;
  leadId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Find active sequences matching a trigger event and enroll the contact.
 * Skips if already enrolled in the same sequence.
 */
export async function triggerSequenceEnrollment(
  event: TriggerEvent,
  context: EnrollContext,
): Promise<number> {
  const { data: sequences } = await adminClient
    .from('email_sequences')
    .select('id, trigger_filter')
    .eq('trigger_event', event)
    .eq('is_active', true);

  if (!sequences?.length) return 0;

  let enrolled = 0;

  for (const seq of sequences) {
    // Check trigger filter match
    if (!matchesFilter(seq.trigger_filter, context.metadata)) continue;

    // Enroll (upsert to skip duplicates)
    const { error } = await enrollInSequence({
      sequenceId: seq.id,
      email: context.email,
      profileId: context.profileId,
      leadId: context.leadId,
    });

    if (!error) enrolled++;
  }

  return enrolled;
}

/**
 * Manually enroll a contact into a specific sequence.
 */
export async function enrollInSequence({
  sequenceId,
  email,
  profileId,
  leadId,
}: {
  sequenceId: string;
  email: string;
  profileId?: string | null;
  leadId?: string | null;
}): Promise<{ error: string | null }> {
  // Check if already enrolled
  const { data: existing } = await adminClient
    .from('email_sequence_enrollments')
    .select('id, status')
    .eq('sequence_id', sequenceId)
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    // Allow re-enrollment if previously completed or unsubscribed
    if (existing.status === 'active' || existing.status === 'paused') {
      return { error: 'Already enrolled' };
    }
  }

  // Get first step to calculate initial next_send_at
  const { data: firstStep } = await adminClient
    .from('email_sequence_steps')
    .select('delay_days, delay_hours')
    .eq('sequence_id', sequenceId)
    .eq('is_active', true)
    .order('step_order', { ascending: true })
    .limit(1)
    .maybeSingle();

  const now = new Date();
  let nextSend = now;
  if (firstStep) {
    nextSend = new Date(
      now.getTime() +
        firstStep.delay_days * 86400000 +
        firstStep.delay_hours * 3600000,
    );
  }

  if (existing) {
    // Re-enroll: reset to step 0
    await adminClient
      .from('email_sequence_enrollments')
      .update({
        current_step: 0,
        status: 'active',
        next_send_at: nextSend.toISOString(),
        completed_at: null,
      })
      .eq('id', existing.id);
  } else {
    await adminClient.from('email_sequence_enrollments').insert({
      sequence_id: sequenceId,
      email,
      profile_id: profileId ?? null,
      lead_id: leadId ?? null,
      current_step: 0,
      status: 'active',
      next_send_at: nextSend.toISOString(),
    });
  }

  return { error: null };
}

/**
 * Check if metadata matches a trigger filter.
 * Empty filter = match all.
 */
function matchesFilter(
  filter: unknown,
  metadata?: Record<string, unknown>,
): boolean {
  if (!filter || typeof filter !== 'object') return true;

  const f = filter as Record<string, unknown>;
  if (Object.keys(f).length === 0) return true;

  if (!metadata) return false;

  // Simple key-value match: all filter keys must match metadata values
  return Object.entries(f).every(
    ([key, value]) => metadata[key] === value,
  );
}
