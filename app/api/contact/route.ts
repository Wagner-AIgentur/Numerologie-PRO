import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminClient } from '@/lib/supabase/admin';
import { sendEmail, sendAdminEmail } from '@/lib/email/send';
import { contactConfirmationEmail } from '@/lib/email/templates/contact-confirmation';
import { adminNewContactEmail } from '@/lib/email/templates/admin-new-contact';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { addToFeed } from '@/lib/inbox/feed';
import { triggerAutomations } from '@/lib/automation/engine';

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  topic: z.enum([
    'beziehungsmatrix', 'lebensbestimmung', 'wachstumsplan', 'mein_kind',
    'geldkanal', 'jahresprognose', 'lebenskarte', 'pdf_analyse',
    'free_consultation', 'other',
  ]).optional(),
  message: z.string().min(10).max(2000),
  language: z.enum(['de', 'ru']).default('de'),
});

/** Sanitize user input by HTML-entity-encoding dangerous characters */
function sanitizeInput(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per minute per IP
    const ip = getClientIp(request);
    if (!await rateLimit(`contact:${ip}`, { max: 5, windowSeconds: 60 })) {
      return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    // Normalize empty topic to undefined so optional() works
    if (body.topic === '') delete body.topic;
    const data = contactSchema.parse(body);

    // Sanitize user input to prevent XSS in emails
    data.name = sanitizeInput(data.name);
    data.message = sanitizeInput(data.message);
    if (data.phone) data.phone = sanitizeInput(data.phone);

    // Save to Supabase
    const { data: inserted, error } = await adminClient.from('contact_submissions').insert({
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      topic: data.topic ?? null,
      message: data.message,
      language: data.language,
      ip_address: request.headers.get('x-forwarded-for') ?? null,
      user_agent: request.headers.get('user-agent') ?? null,
    }).select('id').single();

    if (error) {
      console.error('Supabase insert error:', error);
      // Don't fail the request — data might still send via email
    }

    // Add to activity feed (fire-and-forget)
    if (inserted?.id) {
      addToFeed({
        activityType: 'contact_form',
        sourceTable: 'contact_submissions',
        sourceId: inserted.id,
        title: `${data.language === 'de' ? 'Kontaktanfrage' : 'Обращение'}: ${data.name}`,
        preview: data.message.substring(0, 120),
        requiresAction: true,
      }).catch(() => {});
    }

    // Trigger automation rules (fire-and-forget)
    triggerAutomations('contact_submitted', {
      email: data.email,
      data: { name: data.name, topic: data.topic, language: data.language },
    }).catch(() => {});

    // Send confirmation to customer
    const { subject: confSubject, html: confHtml } = contactConfirmationEmail({ name: data.name, language: data.language });
    await sendEmail({ to: data.email, subject: confSubject, html: confHtml, template: 'contact-confirmation' });

    // Notify admin (Swetlana)
    const { subject: adminSubject, html: adminHtml } = adminNewContactEmail({
      name: data.name, email: data.email, phone: data.phone, topic: data.topic, message: data.message, language: data.language,
    });
    await sendAdminEmail({ subject: adminSubject, html: adminHtml, template: 'admin-new-contact' });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }
    console.error('Contact form error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
