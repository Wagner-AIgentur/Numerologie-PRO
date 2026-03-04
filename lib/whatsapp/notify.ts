/**
 * WhatsApp Notification Helpers
 *
 * Mirrors lib/telegram/notify.ts — used by existing flows (cron, webhooks)
 * to send WhatsApp messages alongside email notifications.
 * Always fire-and-forget — a WhatsApp failure should never block the primary flow.
 */

import { adminClient } from '@/lib/supabase/admin';
import { getDateLocale } from '@/lib/i18n/admin';
import { sendTemplateMessage } from '@/lib/whatsapp/client';
import {
  TEMPLATES,
  waLanguageCode,
  buildBookingConfirmationParams,
  buildSessionReminderParams,
  buildBookingCancelledParams,
  buildPdfDeliveryParams,
} from '@/lib/whatsapp/templates';

/**
 * Send booking confirmation via WhatsApp (called from Cal.com webhook).
 */
export async function notifyBookingConfirmationWA(opts: {
  profileId: string;
  packageType: string;
  scheduledAt: string;
  meetingLink: string | null;
  locale: 'de' | 'ru';
}) {
  const phone = await getWhatsAppPhone(opts.profileId);
  if (!phone) return;

  const dateStr = new Date(opts.scheduledAt).toLocaleString(
    getDateLocale(opts.locale),
    { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' },
  );

  try {
    const result = await sendTemplateMessage({
      to: phone,
      templateName: TEMPLATES.BOOKING_CONFIRMATION,
      languageCode: waLanguageCode(opts.locale),
      components: buildBookingConfirmationParams(
        opts.packageType,
        dateStr,
        opts.meetingLink,
      ),
    });
    await logOutgoing(phone, TEMPLATES.BOOKING_CONFIRMATION, opts.profileId, result.messages?.[0]?.id);
  } catch (err) {
    console.error(`[WhatsApp] Failed to send booking confirmation to ${phone}:`, err);
  }
}

/**
 * Send session reminder via WhatsApp (called from cron job).
 */
export async function notifySessionReminderWA(opts: {
  profileId: string;
  packageType: string;
  scheduledAt: string;
  meetingLink: string | null;
  locale: 'de' | 'ru';
}) {
  const phone = await getWhatsAppPhone(opts.profileId);
  if (!phone) return;

  const dateStr = new Date(opts.scheduledAt).toLocaleString(
    getDateLocale(opts.locale),
    { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' },
  );

  try {
    const result = await sendTemplateMessage({
      to: phone,
      templateName: TEMPLATES.SESSION_REMINDER,
      languageCode: waLanguageCode(opts.locale),
      components: buildSessionReminderParams(
        opts.packageType,
        dateStr,
        opts.meetingLink,
      ),
    });
    await logOutgoing(phone, TEMPLATES.SESSION_REMINDER, opts.profileId, result.messages?.[0]?.id);
  } catch (err) {
    console.error(`[WhatsApp] Failed to send session reminder to ${phone}:`, err);
  }
}

/**
 * Send PDF delivery notification via WhatsApp (called from Stripe webhook).
 */
export async function notifyPdfDeliveryWA(opts: {
  profileId: string;
  title: string;
  fileUrl: string;
  locale: 'de' | 'ru';
}) {
  const phone = await getWhatsAppPhone(opts.profileId);
  if (!phone) return;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://numerologie-pro.com';
  const dashboardUrl = `${baseUrl}/${opts.locale}/dashboard/unterlagen`;

  try {
    const result = await sendTemplateMessage({
      to: phone,
      templateName: TEMPLATES.PDF_DELIVERY,
      languageCode: waLanguageCode(opts.locale),
      components: buildPdfDeliveryParams(opts.title, dashboardUrl),
    });
    await logOutgoing(phone, TEMPLATES.PDF_DELIVERY, opts.profileId, result.messages?.[0]?.id);
  } catch (err) {
    console.error(`[WhatsApp] Failed to send PDF delivery to ${phone}:`, err);
  }
}

/**
 * Send cancellation notification via WhatsApp.
 */
export async function notifyBookingCancelledWA(opts: {
  profileId: string | null;
  locale: 'de' | 'ru';
}) {
  if (!opts.profileId) return;
  const phone = await getWhatsAppPhone(opts.profileId);
  if (!phone) return;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://numerologie-pro.com';
  const packagesUrl = `${baseUrl}/${opts.locale}/pakete`;

  try {
    const result = await sendTemplateMessage({
      to: phone,
      templateName: TEMPLATES.BOOKING_CANCELLED,
      languageCode: waLanguageCode(opts.locale),
      components: buildBookingCancelledParams(packagesUrl),
    });
    await logOutgoing(phone, TEMPLATES.BOOKING_CANCELLED, opts.profileId, result.messages?.[0]?.id);
  } catch (err) {
    console.error(`[WhatsApp] Failed to send cancellation to ${phone}:`, err);
  }
}

// ── Internal helpers ─────────────────────────────────────────────────────

async function getWhatsAppPhone(profileId: string): Promise<string | null> {
  const { data } = await adminClient
    .from('profiles')
    .select('whatsapp_phone')
    .eq('id', profileId)
    .single();
  return data?.whatsapp_phone ?? null;
}

async function logOutgoing(
  phone: string,
  templateName: string,
  profileId: string | null,
  waMessageId?: string,
) {
  await adminClient.from('whatsapp_messages').insert({
    wa_id: phone,
    profile_id: profileId,
    direction: 'out',
    template_name: templateName,
    wa_message_id: waMessageId ?? null,
  });
}
