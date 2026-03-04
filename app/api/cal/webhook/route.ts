import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { bookingConfirmationEmail, adminBookingNotificationEmail } from '@/lib/email/templates/booking-confirmation';
import { bookingWelcomeEmail } from '@/lib/email/templates/booking-welcome';
import { notifyBookingConfirmation, notifyBookingCancelled } from '@/lib/telegram/notify';
import { notifyBookingConfirmationWA, notifyBookingCancelledWA } from '@/lib/whatsapp/notify';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const body = await request.text();

  // Verify webhook signature (MANDATORY — never process unverified payloads)
  const signature = request.headers.get('x-cal-signature-256');
  const secret = process.env.CAL_WEBHOOK_SECRET?.replace(/\\n$/, '');

  if (!secret) {
    console.error('Cal.com webhook: CAL_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
    if (!isValid) {
      console.error('Cal.com webhook signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } catch {
    console.error('Cal.com webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { triggerEvent } = payload;

  try {
    switch (triggerEvent) {
      case 'BOOKING_CREATED':
        await handleBookingCreated(payload.payload);
        break;
      case 'BOOKING_CANCELLED':
        await handleBookingCancelled(payload.payload);
        break;
      case 'BOOKING_RESCHEDULED':
        await handleBookingRescheduled(payload.payload);
        break;
    }
  } catch (err) {
    // Always return 200 to prevent Cal.com retry storms on handler errors
    console.error('Cal.com webhook handler error:', err);
  }

  return NextResponse.json({ received: true });
}

async function handleBookingCreated(event: any) {
  const attendeeEmail = event.attendees?.[0]?.email?.toLowerCase();
  const attendeeName = event.attendees?.[0]?.name ?? '';
  const calBookingId = event.uid;
  const startTime = event.startTime;
  const meetingLink = event.videoCallData?.url ?? event.metadata?.videoCallUrl ?? null;
  const eventSlug = event.eventType?.slug ?? null;

  if (!attendeeEmail || !calBookingId) {
    console.error('Cal.com webhook: missing attendee email or booking ID');
    return;
  }

  // Idempotency guard — prevent duplicate sessions on webhook retries
  const { data: existingSession } = await adminClient
    .from('sessions')
    .select('id')
    .eq('cal_booking_id', calBookingId)
    .maybeSingle();
  if (existingSession) {
    console.log(`Session already exists for booking ${calBookingId}, skipping`);
    return;
  }

  // Extract phone number from Cal.com responses
  const phone = event.responses?.phone
    ?? event.responses?.telefon
    ?? event.attendees?.[0]?.phone
    ?? null;

  // Extract preferred channel
  const rawChannel = event.responses?.preferred_channel
    ?? event.responses?.Komunication
    ?? event.metadata?.preferred_channel
    ?? 'telegram';
  const preferredChannel = String(rawChannel).toLowerCase().startsWith('telegram')
    ? 'telegram'
    : String(rawChannel).toLowerCase().startsWith('whatsapp')
      ? 'whatsapp'
      : 'telegram';

  // ── Find or create profile ──────────────────────────────────────────────
  let profileId: string | null = null;
  let locale: 'de' | 'ru' = 'de';
  let isNewUser = false;
  let inviteUrl: string | null = null;

  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id, language')
    .eq('email', attendeeEmail)
    .single();

  if (existingProfile) {
    profileId = existingProfile.id;
    locale = (existingProfile.language ?? 'de') as 'de' | 'ru';
  } else {
    // Auto-create account for new customer
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://numerologie-pro.com';
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.generateLink({
      type: 'invite',
      email: attendeeEmail,
      options: {
        data: { full_name: attendeeName, language: 'de' },
        redirectTo: `${baseUrl}/de/auth/callback?next=/de/dashboard/sitzungen`,
      },
    });

    if (inviteError) {
      console.error('[Cal.com] Auto-account creation failed:', inviteError.message);
      // Continue without profile — email will still be sent
    } else if (inviteData?.user) {
      profileId = inviteData.user.id;
      inviteUrl = inviteData.properties?.action_link ?? null;
      isNewUser = true;

      // Set language on the auto-created profile
      await adminClient.from('profiles')
        .update({ language: locale, full_name: attendeeName })
        .eq('id', profileId);

      console.log(`[Cal.com] Auto-created account for ${attendeeEmail} (${profileId})`);
    }
  }

  // Save phone + channel preference on profile
  if (profileId) {
    const updateData: Record<string, unknown> = { preferred_channel: preferredChannel };
    if (phone) updateData.whatsapp_phone = phone;
    await adminClient.from('profiles').update(updateData).eq('id', profileId);
  }

  // ── Find or create session ──────────────────────────────────────────────
  let sessionUpdated = false;
  if (profileId) {
    const { data: pendingSession } = await adminClient
      .from('sessions')
      .select('id, package_type')
      .eq('profile_id', profileId)
      .is('cal_booking_id', null)
      .not('order_id', 'is', null)
      .eq('status', 'scheduled')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pendingSession) {
      await adminClient
        .from('sessions')
        .update({
          cal_booking_id: calBookingId,
          scheduled_at: startTime,
          meeting_link: meetingLink,
          platform: meetingLink?.includes('zoom') ? 'Zoom' : 'Video',
          cal_event_slug: eventSlug,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pendingSession.id);

      sessionUpdated = true;
      console.log(`Updated paid session ${pendingSession.id} with Cal.com booking ${calBookingId}`);
    }
  }

  if (!sessionUpdated) {
    await adminClient.from('sessions').insert({
      profile_id: profileId!,
      order_id: null,
      package_type: 'free_consultation',
      session_type: 'free',
      cal_booking_id: calBookingId,
      scheduled_at: startTime,
      meeting_link: meetingLink,
      platform: meetingLink?.includes('zoom') ? 'Zoom' : 'Video',
      cal_event_slug: eventSlug,
      status: 'scheduled',
    });
    console.log(`Created free consultation session for ${attendeeEmail}`);
  }

  // ── Send emails ──────────────────────────────────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://numerologie-pro.com';
  const dashboardUrl = `${baseUrl}/${locale}/dashboard/sitzungen`;
  const packageType = sessionUpdated
    ? ((await adminClient.from('sessions').select('package_type').eq('cal_booking_id', calBookingId).single()).data?.package_type ?? 'consultation')
    : 'free_consultation';
  const platform = meetingLink?.includes('zoom') ? 'Zoom' : null;

  if (isNewUser && inviteUrl) {
    // New customer: combined booking confirmation + account setup email
    const telegramDeepLink = preferredChannel === 'telegram' && profileId
      ? `https://t.me/NumerologieProBot?start=${profileId}`
      : undefined;

    const { subject, html } = bookingWelcomeEmail(locale, {
      userName: attendeeName || attendeeEmail.split('@')[0],
      scheduledAt: startTime,
      packageType,
      meetingLink,
      platform,
      inviteUrl,
      dashboardUrl,
      telegramDeepLink,
    });

    await sendEmail({
      to: attendeeEmail,
      subject,
      html,
      template: 'booking-welcome',
      profileId,
    });
  } else {
    // Existing customer: standard booking confirmation
    const { subject, html } = bookingConfirmationEmail(locale, {
      scheduledAt: startTime,
      packageType,
      meetingLink,
      platform,
      dashboardUrl,
    });

    await sendEmail({
      to: attendeeEmail,
      subject,
      html,
      template: 'booking-confirmation',
      profileId,
    });
  }

  // Send admin notification
  const adminEmail = process.env.ADMIN_EMAIL ?? 'info@numerologie-pro.com';
  const { subject: adminSubject, html: adminHtml } = adminBookingNotificationEmail({
    customerName: attendeeName,
    customerEmail: attendeeEmail,
    packageType,
    scheduledAt: startTime,
    meetingLink,
    sessionType: sessionUpdated ? 'paid' : 'free',
  });

  await sendEmail({
    to: adminEmail,
    subject: adminSubject,
    html: adminHtml,
    template: 'admin-booking-notification',
  });

  // ── Notify via preferred channel (fire-and-forget) ──────────────────────
  if (profileId && startTime) {
    const notifyOpts = { profileId, packageType, scheduledAt: startTime, meetingLink, locale };
    if (preferredChannel === 'whatsapp') {
      notifyBookingConfirmationWA(notifyOpts).catch(() => {});
    } else {
      notifyBookingConfirmation(notifyOpts).catch(() => {});
    }
  }
}

async function handleBookingCancelled(event: any) {
  const calBookingId = event.uid;
  if (!calBookingId) return;

  // Get session + profile info before cancelling
  const { data: session } = await adminClient
    .from('sessions')
    .select('profile_id, profiles(language, preferred_channel)')
    .eq('cal_booking_id', calBookingId)
    .single();

  await adminClient
    .from('sessions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('cal_booking_id', calBookingId);

  // Notify via preferred channel
  if (session?.profile_id) {
    const locale = ((session.profiles as any)?.language ?? 'de') as 'de' | 'ru';
    const channel = (session.profiles as any)?.preferred_channel ?? 'telegram';
    if (channel === 'whatsapp') {
      notifyBookingCancelledWA({ profileId: session.profile_id, locale }).catch(() => {});
    } else {
      notifyBookingCancelled({ profileId: session.profile_id, locale }).catch(() => {});
    }
  }

  console.log(`Cancelled session with Cal.com booking ${calBookingId}`);
}

async function handleBookingRescheduled(event: any) {
  const calBookingId = event.uid;
  const newStartTime = event.startTime;
  const newMeetingLink = event.videoCallData?.url ?? event.metadata?.videoCallUrl ?? null;

  if (!calBookingId) return;

  const updateData: any = {
    scheduled_at: newStartTime,
    status: 'scheduled',
    reminder_sent_at: null, // Reset reminder so a new one will be sent
    updated_at: new Date().toISOString(),
  };

  if (newMeetingLink) {
    updateData.meeting_link = newMeetingLink;
  }

  await adminClient
    .from('sessions')
    .update(updateData)
    .eq('cal_booking_id', calBookingId);

  console.log(`Rescheduled session with Cal.com booking ${calBookingId} to ${newStartTime}`);
}
