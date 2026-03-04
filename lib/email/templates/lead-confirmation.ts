import { baseTemplate, goldButton, heading, paragraph } from './base';

export function leadConfirmationEmail({
  language = 'de',
  verifyUrl,
}: {
  language: 'de' | 'ru';
  verifyUrl: string;
}): { subject: string; html: string } {
  const isDE = language === 'de';

  const subject = isDE
    ? 'Bitte bestätige deine E-Mail-Adresse'
    : 'Подтвердите свой email-адрес';

  const content = `
    ${heading(isDE ? 'Nur noch ein Schritt' : 'Остался один шаг')}
    ${paragraph(isDE
      ? 'Du hast soeben deine Psychomatrix berechnet — und die Ergebnisse sind bereit für dich.'
      : 'Вы только что рассчитали свою психоматрицу — и результаты уже готовы для вас.'
    )}
    ${paragraph(isDE
      ? 'Bestätige jetzt deine E-Mail-Adresse, um deine <strong style="color:#D4AF37;">detaillierte Analyse</strong> zu erhalten.'
      : 'Подтвердите свой email-адрес, чтобы получить <strong style="color:#D4AF37;">подробный анализ</strong>.'
    )}
    ${goldButton(
      isDE ? 'E-Mail bestätigen' : 'Подтвердить email',
      verifyUrl
    )}
    ${paragraph(`<span style="font-size:12px; color:#5e5c54; line-height:1.6;">${isDE
      ? 'Mit der Bestätigung stimmst du zu, gelegentlich Numerologie-Tipps und Angebote zu erhalten. Du kannst dich jederzeit abmelden.'
      : 'Подтверждая, вы соглашаетесь получать периодические советы по нумерологии и предложения. Вы можете отписаться в любое время.'
    }</span>`)}
  `;

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: isDE
        ? 'Bestätige deine E-Mail und erhalte deine Psychomatrix-Analyse.'
        : 'Подтвердите email и получите анализ вашей психоматрицы.',
      content,
    }),
  };
}
