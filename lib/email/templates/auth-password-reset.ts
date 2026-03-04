import { baseTemplate, goldButton, heading, paragraph, infoBox } from './base';

export function authPasswordResetEmail({
  language = 'de',
  resetUrl,
}: {
  language: 'de' | 'ru';
  resetUrl: string;
}): { subject: string; html: string } {
  const isDE = language === 'de';

  const subject = isDE
    ? 'Passwort zurücksetzen'
    : 'Сброс пароля';

  const content = `
    ${heading(isDE ? 'Passwort zurücksetzen' : 'Сброс пароля')}
    ${paragraph(isDE
      ? 'Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Klicke auf den Button, um ein neues Passwort zu vergeben.'
      : 'Вы запросили сброс пароля. Нажмите на кнопку ниже, чтобы установить новый пароль.'
    )}
    ${goldButton(
      isDE ? 'Neues Passwort setzen' : 'Установить новый пароль',
      resetUrl
    )}
    ${infoBox(`
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; line-height:1.6; margin:0;">
        ${isDE
          ? 'Dieser Link ist 1 Stunde gültig. Falls du kein Passwort-Reset angefordert hast, kannst du diese E-Mail ignorieren.'
          : 'Ссылка действительна 1 час. Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.'}
      </p>
    `)}
  `;

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: isDE
        ? 'Setze dein Passwort für Numerologie PRO zurück.'
        : 'Сбросьте пароль для вашего аккаунта Numerologie PRO.',
      content,
    }),
  };
}
