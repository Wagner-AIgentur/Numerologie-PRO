/**
 * Workflow Automation Engine (ECA - Event-Condition-Action)
 *
 * Processes automation rules when CRM events occur.
 * Each rule has: trigger event, conditions (JSONB array), actions (JSONB array).
 *
 * Conditions: [{ field, operator, value }]
 * Actions: [{ type, ...params }]
 */

import { adminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/types';
import { sendEmail } from '@/lib/email/send';
import { broadcastEmail } from '@/lib/email/templates/broadcast';
import { enrollInSequence } from '@/lib/sequences/enroll';

type TriggerEvent =
  | 'lead_created' | 'lead_verified' | 'profile_updated'
  | 'order_completed' | 'order_refunded' | 'session_scheduled'
  | 'session_completed' | 'tag_added' | 'tag_removed'
  | 'contact_submitted' | 'crm_status_changed' | 'follow_up_due'
  | 'instagram_dm_received' | 'instagram_lead_received'
  | 'manychat_keyword_triggered' | 'manychat_subscriber_created';

interface TriggerContext {
  profileId?: string | null;
  email?: string;
  data?: Record<string, unknown>;
}

interface Condition {
  field: string;    // e.g. 'language', 'crm_status', 'tags', 'order_amount', 'lead_score'
  operator: string; // 'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'not_contains'
  value: string;
}

interface Action {
  type: string;
  [key: string]: unknown;
}

interface AutomationResult {
  rulesTriggered: number;
  actionsExecuted: number;
  errors: number;
}

/**
 * Main entry point: Trigger all active automation rules for an event.
 * Called from API routes after CRM events occur.
 */
export async function triggerAutomations(
  event: TriggerEvent,
  context: TriggerContext,
): Promise<AutomationResult> {
  const result: AutomationResult = { rulesTriggered: 0, actionsExecuted: 0, errors: 0 };

  // Fetch active rules for this event
  const { data: rules } = await adminClient
    .from('automation_rules')
    .select('*')
    .eq('trigger_event', event)
    .eq('is_active', true);

  if (!rules?.length) return result;

  // Fetch profile data if we have a profileId, or fallback to email lookup
  let profileData: Record<string, unknown> | null = null;
  if (context.profileId) {
    const { data } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', context.profileId)
      .single();
    profileData = data as Record<string, unknown> | null;
  } else if (context.email) {
    // Fallback: resolve profile by email when profileId is not available
    const { data } = await adminClient
      .from('profiles')
      .select('*')
      .eq('email', context.email)
      .maybeSingle();
    if (data) {
      profileData = data as Record<string, unknown>;
      context.profileId = data.id as string;
    }
  }

  for (const rule of rules) {
    const conditions = (rule.conditions ?? []) as unknown as Condition[];
    const actions = (rule.actions ?? []) as Action[];

    // Evaluate conditions
    if (!evaluateConditions(conditions, profileData, context.data)) {
      continue;
    }

    result.rulesTriggered++;
    const executedActions: Action[] = [];
    let ruleError: string | null = null;

    // Execute actions
    for (const action of actions) {
      try {
        await executeAction(action, context, profileData);
        executedActions.push(action);
        result.actionsExecuted++;
      } catch (err) {
        ruleError = err instanceof Error ? err.message : String(err);
        result.errors++;
        console.error(`[Automation] Action failed for rule ${rule.id}:`, err);
      }
    }

    // Log execution
    await adminClient.from('automation_logs').insert({
      rule_id: rule.id,
      profile_id: context.profileId ?? null,
      trigger_event: event,
      trigger_data: (context.data ?? {}) as unknown as Json,
      actions_executed: executedActions as unknown as Json,
      status: ruleError ? (executedActions.length > 0 ? 'partial' : 'failed') : 'success',
      error: ruleError,
    });

    // Update rule stats
    await adminClient
      .from('automation_rules')
      .update({
        run_count: (rule.run_count ?? 0) + 1,
        last_run_at: new Date().toISOString(),
      })
      .eq('id', rule.id);
  }

  return result;
}

/**
 * Evaluate an array of conditions against profile data.
 * All conditions must be true (AND logic).
 */
function evaluateConditions(
  conditions: Condition[],
  profile: Record<string, unknown> | null,
  eventData?: Record<string, unknown>,
): boolean {
  if (conditions.length === 0) return true;
  if (!profile && !eventData) return false;

  const merged = { ...profile, ...eventData };

  return conditions.every((cond) => {
    const fieldValue = merged[cond.field];
    const compareValue = cond.value;

    switch (cond.operator) {
      case 'eq':
        return String(fieldValue) === compareValue;
      case 'neq':
        return String(fieldValue) !== compareValue;
      case 'gt':
        return Number(fieldValue) > Number(compareValue);
      case 'gte':
        return Number(fieldValue) >= Number(compareValue);
      case 'lt':
        return Number(fieldValue) < Number(compareValue);
      case 'lte':
        return Number(fieldValue) <= Number(compareValue);
      case 'contains':
        if (Array.isArray(fieldValue)) return fieldValue.includes(compareValue);
        return String(fieldValue).includes(compareValue);
      case 'not_contains':
        if (Array.isArray(fieldValue)) return !fieldValue.includes(compareValue);
        return !String(fieldValue).includes(compareValue);
      default:
        return false;
    }
  });
}

/**
 * Execute a single automation action.
 */
async function executeAction(
  action: Action,
  context: TriggerContext,
  profile: Record<string, unknown> | null,
): Promise<void> {
  switch (action.type) {
    case 'add_tag': {
      if (!context.profileId) return;
      const tag = action.value as string;
      const currentTags = (profile?.tags as string[]) ?? [];
      if (!currentTags.includes(tag)) {
        await adminClient
          .from('profiles')
          .update({ tags: [...currentTags, tag], updated_at: new Date().toISOString() })
          .eq('id', context.profileId);
      }
      break;
    }

    case 'remove_tag': {
      if (!context.profileId) return;
      const tag = action.value as string;
      const currentTags = (profile?.tags as string[]) ?? [];
      if (currentTags.includes(tag)) {
        await adminClient
          .from('profiles')
          .update({ tags: currentTags.filter((t) => t !== tag), updated_at: new Date().toISOString() })
          .eq('id', context.profileId);
      }
      break;
    }

    case 'change_status': {
      if (!context.profileId) return;
      const FORBIDDEN_STATUSES = ['admin'];
      if (FORBIDDEN_STATUSES.includes(action.value as string)) {
        throw new Error('Cannot set crm_status to admin via automation');
      }
      await adminClient
        .from('profiles')
        .update({ crm_status: action.value as string, updated_at: new Date().toISOString() })
        .eq('id', context.profileId);
      break;
    }

    case 'send_email': {
      const email = context.email ?? (profile?.email as string);
      if (!email) return;
      // Locale-aware: pick RU content if user is Russian and translation exists
      const locale = (profile?.language as string) ?? 'de';
      const content = (locale === 'ru' && action.value_ru)
        ? action.value_ru as string
        : action.value as string;
      if (!content) return;
      const { subject, html } = broadcastEmail({
        subject: (action.subject as string) ?? '',
        content,
      });
      await sendEmail({
        to: email,
        subject,
        html,
        template: `automation:${action.type}`,
        profileId: context.profileId,
      });
      break;
    }

    case 'send_telegram': {
      if (!context.profileId) return;
      const chatId = profile?.telegram_chat_id as number | null;
      if (!chatId) return;
      // Locale-aware: pick RU message if user is Russian and translation exists
      const locale = (profile?.language as string) ?? 'de';
      const text = (locale === 'ru' && action.value_ru)
        ? action.value_ru as string
        : action.value as string;
      if (!text) return;
      const { sendMessage } = await import('@/lib/telegram/bot');
      await sendMessage({ chat_id: chatId, text });
      break;
    }

    case 'create_note': {
      if (!context.profileId) return;
      await adminClient.from('crm_notes').insert({
        profile_id: context.profileId,
        content: action.content as string,
        type: (action.note_type as string) ?? 'note',
        created_by: 'automation',
      });
      break;
    }

    case 'create_task': {
      if (!context.profileId) return;
      await adminClient.from('tasks').insert({
        profile_id: context.profileId,
        title: action.title as string,
        description: action.description as string | undefined,
        type: (action.task_type as string) ?? 'follow_up',
        priority: (action.priority as string) ?? 'medium',
        due_date: action.due_days
          ? new Date(Date.now() + Number(action.due_days) * 86400000).toISOString().split('T')[0]
          : null,
        source_type: 'automation',
      });
      break;
    }

    case 'enroll_sequence': {
      const email = context.email ?? (profile?.email as string);
      if (!email || !action.sequence_id) return;
      await enrollInSequence({
        sequenceId: action.sequence_id as string,
        email,
        profileId: context.profileId,
      });
      break;
    }

    case 'send_instagram_dm': {
      if (!context.profileId) return;
      const igSenderId = profile?.instagram_sender_id as string | null;
      if (!igSenderId) return;
      // Send via ManyChat (preferred) — fallback to Meta API if no ManyChat token
      if (process.env.MANYCHAT_API_TOKEN) {
        const { sendContent } = await import('@/lib/manychat/api');
        await sendContent(igSenderId, { type: 'text', text: action.message as string });
      } else {
        const { sendInstagramDM } = await import('@/lib/meta/graph-api');
        await sendInstagramDM(igSenderId, action.message as string);
      }
      break;
    }

    default:
      console.warn(`[Automation] Unknown action type: ${action.type}`);
  }
}
