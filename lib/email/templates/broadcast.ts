/**
 * Broadcast Email Template
 *
 * Wraps admin-composed content in the standard Numerologie PRO
 * email base template (dark premium design with gold accents).
 * Includes DSGVO-compliant unsubscribe link.
 */

import { baseTemplate } from './base';

export function broadcastEmail({
  subject,
  content,
  unsubscribeUrl,
  aiGenerated,
}: {
  subject: string;
  content: string; // Already HTML-formatted content from the composer
  unsubscribeUrl?: string;
  aiGenerated?: boolean;
}): { subject: string; html: string } {
  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: subject,
      content,
      unsubscribeUrl,
      aiGenerated,
    }),
  };
}
