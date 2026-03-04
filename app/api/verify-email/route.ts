import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { leadAnalysisResultsEmail } from '@/lib/email/templates/lead-analysis-results';
import { triggerSequenceEnrollment } from '@/lib/sequences/enroll';
import { triggerAutomations } from '@/lib/automation/engine';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const lang = (searchParams.get('lang') === 'ru' ? 'ru' : 'de') as 'de' | 'ru';

  // Missing token
  if (!token) {
    return NextResponse.redirect(new URL(`/${lang}/verify?status=invalid`, request.url));
  }

  // Rate limit to prevent token brute-force
  const ip = getClientIp(request);
  if (!await rateLimit(`verify:${ip}`, { preset: 'auth' })) {
    return NextResponse.redirect(new URL(`/${lang}/verify?status=error`, request.url));
  }

  try {
    // Look up lead by verification_token
    const { data: lead, error: lookupError } = await adminClient
      .from('leads')
      .select('id, email, birthdate, matrix_data, email_verified, language')
      .eq('verification_token', token)
      .maybeSingle();

    if (lookupError) {
      console.error('[verify-email] Lookup error:', lookupError);
      return NextResponse.redirect(new URL(`/${lang}/verify?status=error`, request.url));
    }

    // Token not found
    if (!lead) {
      return NextResponse.redirect(new URL(`/${lang}/verify?status=invalid`, request.url));
    }

    // Already verified
    if (lead.email_verified) {
      return NextResponse.redirect(new URL(`/${lang}/verify?status=already`, request.url));
    }

    // Mark as verified
    const { error: updateError } = await adminClient
      .from('leads')
      .update({
        email_verified: true,
        verified_at: new Date().toISOString(),
        marketing_consent: true,
      })
      .eq('id', lead.id);

    if (updateError) {
      console.error('[verify-email] Update error:', updateError);
      return NextResponse.redirect(new URL(`/${lang}/verify?status=error`, request.url));
    }

    // Send analysis results email
    const leadLanguage = (lead.language === 'ru' ? 'ru' : 'de') as 'de' | 'ru';

    try {
      const { subject, html } = leadAnalysisResultsEmail({
        language: leadLanguage,
        birthdate: lead.birthdate ?? '',
        matrixData: lead.matrix_data ?? {},
      });

      await sendEmail({
        to: lead.email,
        subject,
        html,
        template: 'lead-analysis-results',
      });
    } catch (emailError) {
      // Log but don't fail the verification — email can be retried
      console.error('[verify-email] Failed to send analysis email:', emailError);
    }

    // Trigger sequence enrollment for verified leads (fire-and-forget)
    triggerSequenceEnrollment('lead_verified', {
      email: lead.email,
      leadId: lead.id,
    }).catch(() => {});

    // Trigger automation rules (fire-and-forget)
    triggerAutomations('lead_verified', {
      email: lead.email,
      data: { language: lead.language, birthdate: lead.birthdate },
    }).catch(() => {});

    return NextResponse.redirect(new URL(`/${lang}/verify?status=success`, request.url));
  } catch (error) {
    console.error('[verify-email] Unexpected error:', error);
    return NextResponse.redirect(new URL(`/${lang}/verify?status=error`, request.url));
  }
}
