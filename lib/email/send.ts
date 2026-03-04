import { adminClient } from '@/lib/supabase/admin';
import { resend } from '@/lib/email/resend';
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@numerologie-pro.com';
const ADMIN_EMAIL = 'info@numerologie-pro.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://numerologie-pro.com';

interface Attachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  template: string;
  profileId?: string | null;
  attachments?: Attachment[];
  unsubscribeToken?: string | null;
}

/** Generate an unsubscribe URL from a token */
export function getUnsubscribeUrl(token: string): string {
  return `${SITE_URL}/api/email/unsubscribe?token=${token}`;
}

export async function sendEmail({ to, subject, html, template, profileId, attachments, unsubscribeToken }: SendEmailOptions) {
  try {
    // Build List-Unsubscribe headers (RFC 8058) for marketing emails
    const headers: Record<string, string> = {};
    if (unsubscribeToken) {
      const unsubUrl = getUnsubscribeUrl(unsubscribeToken);
      headers['List-Unsubscribe'] = `<${unsubUrl}>`;
      headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
    }

    const { data, error } = await resend.emails.send({
      from: `Swetlana Wagner · Numerologie PRO <${FROM}>`,
      to,
      subject,
      html,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      ...(attachments && attachments.length > 0 && {
        attachments: attachments.map((a) => ({
          filename: a.filename,
          content: a.content,
          content_type: a.contentType,
        })),
      }),
    });

    // Log to Supabase
    await adminClient.from('email_log').insert({
      to_email: to,
      subject,
      template,
      status: error ? 'failed' : 'sent',
      resend_id: data?.id ?? null,
      profile_id: profileId ?? null,
    });

    if (error) {
      console.error('[Resend] Failed to send email:', error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[Resend] Unexpected error:', err);
    return { success: false, error: err };
  }
}

export async function sendAdminEmail({ subject, html, template }: Omit<SendEmailOptions, 'to' | 'profileId'>) {
  return sendEmail({ to: ADMIN_EMAIL, subject, html, template });
}
