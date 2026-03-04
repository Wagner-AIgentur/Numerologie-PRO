/**
 * Sequence Processor
 *
 * Processes due sequence enrollments: sends the current step email
 * (+ optional Telegram), advances to next step, and calculates
 * the next send time. Automatically resolves the recipient's
 * language from their profile/lead and serves the matching
 * translation (RU columns) with DE fallback.
 *
 * Called by the /api/cron/sequence-processor endpoint.
 */

import { adminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { broadcastEmail } from '@/lib/email/templates/broadcast';

interface ProcessResult {
  processed: number;
  sent: number;
  telegramSent: number;
  completed: number;
  errors: number;
}

export async function processSequenceQueue(): Promise<ProcessResult> {
  const now = new Date().toISOString();
  const result: ProcessResult = { processed: 0, sent: 0, telegramSent: 0, completed: 0, errors: 0 };

  // Fetch enrollments due for sending
  const { data: enrollments, error } = await adminClient
    .from('email_sequence_enrollments')
    .select(`
      id, sequence_id, profile_id, lead_id, email, current_step, status,
      email_sequences (id, name, is_active)
    `)
    .eq('status', 'active')
    .lte('next_send_at', now)
    .limit(50); // Process in batches

  if (error || !enrollments?.length) return result;

  for (const enrollment of enrollments) {
    result.processed++;

    // Skip if sequence was deactivated
    const seq = enrollment.email_sequences as unknown as { id: string; name: string; is_active: boolean } | null;
    if (!seq?.is_active) {
      await adminClient
        .from('email_sequence_enrollments')
        .update({ status: 'paused' })
        .eq('id', enrollment.id);
      continue;
    }

    // DSGVO: Skip if profile has no marketing consent or has unsubscribed
    {
      let consentProfile: { marketing_consent: boolean | null; email_unsubscribed: boolean | null } | null = null;
      if (enrollment.profile_id) {
        const { data } = await adminClient
          .from('profiles')
          .select('marketing_consent, email_unsubscribed')
          .eq('id', enrollment.profile_id)
          .maybeSingle();
        consentProfile = data;
      } else if (enrollment.email) {
        // Fallback: check consent by email when profile_id is null
        const { data } = await adminClient
          .from('profiles')
          .select('marketing_consent, email_unsubscribed')
          .eq('email', enrollment.email)
          .maybeSingle();
        consentProfile = data;
      }

      if (consentProfile && (!consentProfile.marketing_consent || consentProfile.email_unsubscribed)) {
        await adminClient
          .from('email_sequence_enrollments')
          .update({ status: 'cancelled' })
          .eq('id', enrollment.id);
        continue;
      }
    }

    // Get current step
    const { data: steps } = await adminClient
      .from('email_sequence_steps')
      .select('*')
      .eq('sequence_id', enrollment.sequence_id)
      .eq('is_active', true)
      .order('step_order', { ascending: true });

    if (!steps?.length) continue;

    const currentStepIndex = enrollment.current_step ?? 0;
    const currentStepData = steps[currentStepIndex];
    if (!currentStepData) {
      // No more steps — mark as completed
      await adminClient
        .from('email_sequence_enrollments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', enrollment.id);
      result.completed++;
      continue;
    }

    // ── Resolve recipient language (Profile > Lead > DE fallback) ──
    const locale = await resolveLocale(enrollment.profile_id, enrollment.lead_id);

    // ── Pick locale-aware content (RU if available, else DE fallback) ──
    const subject = (locale === 'ru' && currentStepData.subject_ru)
      ? currentStepData.subject_ru
      : currentStepData.subject;
    const contentHtml = (locale === 'ru' && currentStepData.content_html_ru)
      ? currentStepData.content_html_ru
      : currentStepData.content_html;
    const contentTelegram = (locale === 'ru' && currentStepData.content_telegram_ru)
      ? currentStepData.content_telegram_ru
      : currentStepData.content_telegram;

    // Send the email
    try {
      const { subject: wrappedSubject, html } = broadcastEmail({
        subject,
        content: contentHtml,
      });

      await sendEmail({
        to: enrollment.email,
        subject: wrappedSubject,
        html,
        template: `sequence:${seq.name}:step-${currentStepIndex + 1}`,
        profileId: enrollment.profile_id,
      });

      result.sent++;

      // ── Send Telegram message if enabled and content exists ──
      if (currentStepData.send_telegram && contentTelegram && enrollment.profile_id) {
        try {
          const { data: tgProfile } = await adminClient
            .from('profiles')
            .select('telegram_chat_id')
            .eq('id', enrollment.profile_id)
            .maybeSingle();
          const chatId = tgProfile?.telegram_chat_id as number | null;
          if (chatId) {
            const { sendMessage } = await import('@/lib/telegram/bot');
            await sendMessage({ chat_id: chatId, text: contentTelegram });
            result.telegramSent++;
          }
        } catch (tgErr) {
          // Telegram failure should never block the email flow
          console.error(`[Sequence] Telegram failed for enrollment ${enrollment.id}:`, tgErr);
        }
      }

      // Advance to next step
      const nextStepIndex = currentStepIndex + 1;
      const nextStep = steps[nextStepIndex];

      if (nextStep) {
        // Calculate next send time based on next step's delay
        const nextSendAt = new Date(
          Date.now() +
            nextStep.delay_days * 86400000 +
            nextStep.delay_hours * 3600000,
        );

        await adminClient
          .from('email_sequence_enrollments')
          .update({
            current_step: nextStepIndex,
            next_send_at: nextSendAt.toISOString(),
          })
          .eq('id', enrollment.id);
      } else {
        // Last step sent — mark as completed
        await adminClient
          .from('email_sequence_enrollments')
          .update({
            status: 'completed',
            current_step: nextStepIndex,
            completed_at: new Date().toISOString(),
          })
          .eq('id', enrollment.id);
        result.completed++;
      }
    } catch (err) {
      console.error(`[Sequence] Failed to send step for enrollment ${enrollment.id}:`, err);
      result.errors++;
    }

    // Small delay between emails to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return result;
}

// ── Helpers ──────────────────────────────────────────────────────────────

/** Resolve locale from profile or lead, fallback to 'de' */
async function resolveLocale(
  profileId: string | null,
  leadId: string | null,
): Promise<'de' | 'ru'> {
  if (profileId) {
    const { data } = await adminClient
      .from('profiles')
      .select('language')
      .eq('id', profileId)
      .maybeSingle();
    if (data?.language === 'ru') return 'ru';
    if (data?.language) return data.language as 'de' | 'ru';
  }
  if (leadId) {
    const { data } = await adminClient
      .from('leads')
      .select('language')
      .eq('id', leadId)
      .maybeSingle();
    if (data?.language === 'ru') return 'ru';
    if (data?.language) return data.language as 'de' | 'ru';
  }
  return 'de';
}
