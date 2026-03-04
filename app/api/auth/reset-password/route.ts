import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { authPasswordResetEmail } from '@/lib/email/templates/auth-password-reset';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!await rateLimit(`reset:${ip}`, { preset: 'auth' })) {
      return NextResponse.json({ success: true });
    }

    const { email, locale } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const lang = locale === 'ru' ? 'ru' : 'de';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://numerologie-pro.com';
    const redirectTo = `${siteUrl}/${lang}/auth/update-password`;

    // Generate recovery link via admin API — no Supabase email sent
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error('[Auth Reset] generateLink error:', error);
      // Don't reveal whether the email exists — always return success
      return NextResponse.json({ success: true });
    }

    const resetUrl = data.properties?.action_link;

    if (!resetUrl) {
      // User might not exist — still return success (no information leak)
      return NextResponse.json({ success: true });
    }

    // Send branded reset email via Resend
    const { subject, html } = authPasswordResetEmail({
      language: lang,
      resetUrl,
    });

    const emailResult = await sendEmail({
      to: email,
      subject,
      html,
      template: 'auth-password-reset',
      profileId: data.user?.id ?? null,
    });

    if (!emailResult.success) {
      console.error('[Auth Reset] Email send failed:', emailResult.error);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Auth Reset] Unexpected error:', err);
    // Always return success for security
    return NextResponse.json({ success: true });
  }
}
