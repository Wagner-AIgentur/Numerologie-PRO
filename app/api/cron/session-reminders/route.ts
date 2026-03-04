import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { sessionReminderEmail } from '@/lib/email/templates/session-reminder';
import { upsellConsultationEmail } from '@/lib/email/templates/upsell-consultation';
import { notifySessionReminder } from '@/lib/telegram/notify';
import { notifySessionReminderWA } from '@/lib/whatsapp/notify';
import { safeCompare } from '@/lib/rate-limit';

const UPSELL_COUPON_CODE = 'MATRIX10';
const UPSELL_DELAY_HOURS = 48; // Send upsell 2 days after PDF purchase

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets Authorization header automatically)
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || !safeCompare(authHeader ?? '', `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [remindersSent, upsellsSent] = await Promise.all([
    sendSessionReminders(),
    sendPdfUpsellEmails(),
  ]);

  return NextResponse.json({
    reminders_sent: remindersSent,
    upsells_sent: upsellsSent,
  });
}

// ── Session Reminders (existing logic) ──
async function sendSessionReminders(): Promise<number> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: sessions, error } = await adminClient
    .from('sessions')
    .select('id, profile_id, scheduled_at, package_type, meeting_link, profiles(email, language, full_name, preferred_channel)')
    .eq('status', 'scheduled')
    .is('reminder_sent_at', null)
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', windowEnd.toISOString());

  if (error || !sessions?.length) return 0;

  let sentCount = 0;

  for (const session of sessions) {
    const profile = (session.profiles as any) as { email: string; language: string; full_name: string | null; preferred_channel: string | null } | null;
    if (!profile?.email || !session.scheduled_at) continue;

    const locale = (profile.language === 'ru' ? 'ru' : 'de') as 'de' | 'ru';

    try {
      const { subject, html } = sessionReminderEmail(locale, {
        scheduledAt: session.scheduled_at,
        packageType: session.package_type ?? 'consultation',
        meetingLink: session.meeting_link,
      });

      await sendEmail({
        to: profile.email,
        subject,
        html,
        template: 'session-reminder',
        profileId: session.profile_id,
      });

      await adminClient
        .from('sessions')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', session.id);

      if (session.profile_id) {
        const channel = profile.preferred_channel ?? 'telegram';
        const reminderOpts = {
          profileId: session.profile_id,
          packageType: session.package_type ?? 'consultation',
          scheduledAt: session.scheduled_at,
          meetingLink: session.meeting_link,
          locale,
        };
        if (channel === 'whatsapp') {
          notifySessionReminderWA(reminderOpts).catch(() => {});
        } else {
          notifySessionReminder(reminderOpts).catch(() => {});
        }
      }

      sentCount++;
      console.log(`Reminder sent to ${profile.email} for session ${session.id}`);
    } catch (err) {
      console.error(`Failed to send reminder for session ${session.id}:`, err);
    }
  }

  return sentCount;
}

// ── PDF Purchase Upsell (new: send 48h after PDF purchase) ──
async function sendPdfUpsellEmails(): Promise<number> {
  const now = new Date();
  const upsellWindowStart = new Date(now.getTime() - (UPSELL_DELAY_HOURS + 24) * 60 * 60 * 1000);
  const upsellWindowEnd = new Date(now.getTime() - UPSELL_DELAY_HOURS * 60 * 60 * 1000);

  // Find PDF orders paid 48-72h ago that haven't had an upsell email yet
  // and where the customer has NOT already booked a consultation
  const { data: orders, error } = await adminClient
    .from('orders')
    .select('id, customer_email, profile_id, metadata, paid_at')
    .eq('status', 'paid')
    .gte('paid_at', upsellWindowStart.toISOString())
    .lte('paid_at', upsellWindowEnd.toISOString());

  if (error || !orders?.length) return 0;

  // Filter to PDF orders only
  const pdfOrders = orders.filter(
    (o) => (o.metadata as any)?.package_key === 'pdf_analyse'
  );

  if (!pdfOrders.length) return 0;

  let sentCount = 0;

  for (const order of pdfOrders) {
    const email = order.customer_email;
    if (!email) continue;

    // Check if upsell was already sent (via email_log)
    const { data: existingUpsell } = await adminClient
      .from('email_log')
      .select('id')
      .eq('to_email', email)
      .eq('template', 'upsell-consultation')
      .limit(1);

    if (existingUpsell && existingUpsell.length > 0) continue;

    // Check if customer already booked a paid consultation
    const { data: existingSession } = await adminClient
      .from('sessions')
      .select('id')
      .eq('session_type', 'paid')
      .eq('profile_id', order.profile_id ?? '')
      .limit(1);

    if (existingSession && existingSession.length > 0) continue;

    const locale = ((order.metadata as any)?.locale ?? 'de') as 'de' | 'ru';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://numerologie-pro.com';
    const packagesUrl = `${baseUrl}/${locale}/pakete?coupon=${UPSELL_COUPON_CODE}`;

    try {
      const { subject, html } = upsellConsultationEmail(locale, UPSELL_COUPON_CODE, packagesUrl);

      await sendEmail({
        to: email,
        subject,
        html,
        template: 'upsell-consultation',
        profileId: order.profile_id,
      });

      sentCount++;
      console.log(`Upsell email sent to ${email} for order ${order.id}`);
    } catch (err) {
      console.error(`Failed to send upsell for order ${order.id}:`, err);
    }
  }

  return sentCount;
}
