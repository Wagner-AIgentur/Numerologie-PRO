import { baseTemplate, goldButton, heading, paragraph, infoBox } from './base';

export function contactConfirmationEmail({
  name,
  language = 'de',
}: {
  name: string;
  language?: 'de' | 'ru';
}): { subject: string; html: string } {
  const isDE = language === 'de';

  const subject = isDE
    ? 'Danke für deine Nachricht! — Swetlana'
    : 'Спасибо за сообщение! — Светлана';

  const content = `
    ${heading(isDE ? `Danke, ${name}!` : `Спасибо, ${name}!`)}
    ${paragraph(isDE
      ? 'Deine Nachricht ist bei mir angekommen. Ich melde mich innerhalb von <strong style="color:#D4AF37;">24 Stunden</strong> persönlich bei dir.'
      : 'Твоё сообщение получено. Я отвечу тебе лично в течение <strong style="color:#D4AF37;">24 часов</strong>.'
    )}
    ${paragraph(isDE
      ? 'Numerologie öffnet eine neue Perspektive auf dein Leben — ich freue mich, dich auf diesem Weg zu begleiten. 💫 Alles Liebe, Swetlana'
      : 'Нумерология открывает новый взгляд на твою жизнь — я рада помочь тебе на этом пути. 💫 С любовью, Светлана'
    )}
    ${infoBox(`
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0 0 4px;">
        ${isDE ? 'Bei Fragen erreichst du mich unter:' : 'По вопросам вы можете связаться:'}
      </p>
      <a href="mailto:info@numerologie-pro.com" style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#D4AF37; text-decoration:none;">info@numerologie-pro.com</a>
    `)}
    ${goldButton(
      isDE ? 'Zur Website' : 'На сайт',
      'https://numerologie-pro.com'
    )}
  `;

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: isDE ? `Hallo ${name}, danke für deine Nachricht!` : `Привет ${name}, спасибо за сообщение!`,
      content,
    }),
  };
}
