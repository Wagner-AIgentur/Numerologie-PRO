import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { leadConfirmationEmail } from '@/lib/email/templates/lead-confirmation';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { triggerSequenceEnrollment } from '@/lib/sequences/enroll';
import { triggerAutomations } from '@/lib/automation/engine';
import { sendCAPIEvent } from '@/lib/meta/conversions';

const leadSchema = z.object({
  email: z.string().email(),
  birthdate: z.string().regex(/^\d{1,2}\.\d{1,2}\.\d{4}$/, 'Expected DD.MM.YYYY'),
  matrixData: z.record(z.any()).optional(),
  language: z.enum(['de', 'ru']).default('de'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per minute per IP
    const ip = getClientIp(request);
    if (!await rateLimit(`lead:${ip}`, { max: 5, windowSeconds: 60 })) {
      return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const data = leadSchema.parse(body);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    let token: string;

    // Check if email already exists in leads table
    const { data: existingLead, error: lookupError } = await adminClient
      .from('leads')
      .select('id, email_verified, verification_token')
      .eq('email', data.email)
      .maybeSingle();

    if (lookupError) {
      console.error('Lead lookup error:', lookupError);
      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }

    if (existingLead) {
      // Email already exists
      if (existingLead.email_verified) {
        // Already verified — return same generic message to prevent enumeration
        return NextResponse.json(
          { success: true, message: 'Confirmation email sent' },
          { status: 200 }
        );
      }

      // Not verified yet — regenerate token, update matrix_data, re-send confirmation
      const newToken = crypto.randomUUID();

      const { error: updateError } = await adminClient
        .from('leads')
        .update({
          verification_token: newToken,
          matrix_data: data.matrixData ?? null,
          birthdate: data.birthdate,
          language: data.language,
        })
        .eq('id', existingLead.id);

      if (updateError) {
        console.error('Lead update error:', updateError);
        return NextResponse.json(
          { success: false, message: 'Internal server error' },
          { status: 500 }
        );
      }

      token = newToken;
    } else {
      // New lead — insert and select back the auto-generated token
      const { data: inserted, error: insertError } = await adminClient
        .from('leads')
        .insert({
          email: data.email,
          birthdate: data.birthdate,
          matrix_data: data.matrixData ?? null,
          language: data.language,
          source: 'calculator',
        })
        .select('verification_token')
        .single();

      if (insertError || !inserted) {
        console.error('Lead insert error:', insertError);
        return NextResponse.json(
          { success: false, message: 'Internal server error' },
          { status: 500 }
        );
      }

      token = inserted.verification_token ?? '';
    }

    // Send confirmation email (double opt-in)
    const verifyUrl = `${baseUrl}/api/verify-email?token=${token}&lang=${data.language}`;
    const { subject, html } = leadConfirmationEmail({ language: data.language, verifyUrl });
    await sendEmail({ to: data.email, subject, html, template: 'lead-confirmation' });

    // Trigger sequence enrollment for new leads (fire-and-forget)
    if (!existingLead) {
      triggerSequenceEnrollment('lead_created', { email: data.email }).catch(() => {});
      triggerAutomations('lead_created', { email: data.email, data: { language: data.language, birthdate: data.birthdate } }).catch(() => {});
      sendCAPIEvent({ eventName: 'Lead', email: data.email, customData: { source: 'calculator', language: data.language } }).catch(() => {});
    }

    return NextResponse.json(
      { success: true, message: 'Confirmation email sent' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      );
    }

    console.error('Lead capture error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
