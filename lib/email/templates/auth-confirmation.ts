import { baseTemplate, goldButton, heading, paragraph, infoBox } from './base';

export function authConfirmationEmail({
  language = 'de',
  confirmUrl,
  userName,
}: {
  language: 'de' | 'ru';
  confirmUrl: string;
  userName?: string;
}): { subject: string; html: string } {
  const isDE = language === 'de';

  const subject = isDE
    ? 'Bestätige deine E-Mail-Adresse'
    : 'Подтвердите ваш email-адрес';

  const greeting = userName
    ? (isDE ? `Hallo ${userName},` : `Здравствуйте, ${userName},`)
    : (isDE ? 'Hallo,' : 'Здравствуйте,');

  const content = `
    ${heading(isDE ? 'Willkommen bei Numerologie PRO' : 'Добро пожаловать в Numerologie PRO')}
    ${paragraph(greeting)}
    ${paragraph(isDE
      ? 'Vielen Dank für deine Registrierung! Bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren und Zugang zu deinem persönlichen Dashboard zu erhalten.'
      : 'Спасибо за регистрацию! Пожалуйста, подтвердите свой email-адрес, чтобы активировать аккаунт и получить доступ к личному кабинету.'
    )}
    ${goldButton(
      isDE ? 'E-Mail bestätigen' : 'Подтвердить email',
      confirmUrl
    )}
    ${infoBox(`
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; line-height:1.6; margin:0;">
        ${isDE
          ? 'Dieser Link ist 24 Stunden gültig. Falls du dich nicht registriert hast, kannst du diese E-Mail ignorieren.'
          : 'Ссылка действительна 24 часа. Если вы не регистрировались, просто проигнорируйте это письмо.'}
      </p>
    `)}
  `;

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: isDE
        ? 'Bestätige deine E-Mail und aktiviere dein Numerologie-PRO-Konto.'
        : 'Подтвердите email и активируйте ваш аккаунт Numerologie PRO.',
      content,
    }),
  };
}
