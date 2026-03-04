/**
 * WhatsApp Template Message Definitions
 *
 * Template names must match those approved in Meta Business Manager.
 * Each builder function produces the TemplateComponent[] array that fills
 * the template variables with dynamic data.
 */

import type { TemplateComponent } from './client';

// ── Template Names (must match Meta Business Manager) ────────────────────

export const TEMPLATES = {
  BOOKING_CONFIRMATION: 'booking_confirmation',
  SESSION_REMINDER: 'session_reminder',
  BOOKING_CANCELLED: 'booking_cancelled',
  PDF_DELIVERY: 'pdf_delivery',
  BROADCAST: 'broadcast_message',
} as const;

// ── Language Code Mapping ────────────────────────────────────────────────

export function waLanguageCode(locale: 'de' | 'ru'): string {
  return locale === 'de' ? 'de' : 'ru';
}

// ── Parameter Builders ───────────────────────────────────────────────────

/**
 * booking_confirmation template:
 * Body: {{1}} = packageType, {{2}} = dateStr, {{3}} = meetingLink
 * Button: URL with dashboard link (configured in Meta template)
 */
export function buildBookingConfirmationParams(
  packageType: string,
  dateStr: string,
  meetingLink: string | null,
): TemplateComponent[] {
  return [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: packageType },
        { type: 'text', text: dateStr },
        { type: 'text', text: meetingLink ?? '—' },
      ],
    },
  ];
}

/**
 * session_reminder template:
 * Body: {{1}} = packageType, {{2}} = dateStr, {{3}} = meetingLink
 */
export function buildSessionReminderParams(
  packageType: string,
  dateStr: string,
  meetingLink: string | null,
): TemplateComponent[] {
  return [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: packageType },
        { type: 'text', text: dateStr },
        { type: 'text', text: meetingLink ?? '—' },
      ],
    },
  ];
}

/**
 * booking_cancelled template:
 * Body: {{1}} = packagesUrl
 */
export function buildBookingCancelledParams(
  packagesUrl: string,
): TemplateComponent[] {
  return [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: packagesUrl },
      ],
    },
  ];
}

/**
 * pdf_delivery template:
 * Body: {{1}} = title, {{2}} = dashboardUrl
 */
export function buildPdfDeliveryParams(
  title: string,
  dashboardUrl: string,
): TemplateComponent[] {
  return [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: title },
        { type: 'text', text: dashboardUrl },
      ],
    },
  ];
}

/**
 * broadcast_message template:
 * Body: {{1}} = content
 */
export function buildBroadcastParams(
  content: string,
): TemplateComponent[] {
  return [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: content },
      ],
    },
  ];
}
