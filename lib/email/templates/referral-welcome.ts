import { baseTemplate, goldButton, heading, paragraph, infoBox } from './base';

export function referralWelcomeEmail({
  name,
  referralCode,
  referralLink,
  dashboardUrl,
  language = 'de',
}: {
  name: string;
  referralCode: string;
  referralLink: string;
  dashboardUrl: string;
  language: 'de' | 'ru';
}): { subject: string; html: string } {
  const isDE = language === 'de';

  const subject = isDE
    ? 'Dein Empfehlungs-Code — teile & spare 15%!'
    : 'Твой код рекомендации — делись и экономь 15%!';

  const content = `
    ${heading(isDE ? `${name}, empfehle uns weiter!` : `${name}, рекомендуй нас!`)}
    ${paragraph(isDE
      ? 'Ab sofort hast du deinen persönlichen Empfehlungs-Code. Teile ihn mit Freunden und Familie — und jedes Mal, wenn jemand über deinen Link bucht, erhältst du <strong style="color:#D4AF37;">15% Rabatt</strong> auf deine nächste Bestellung.'
      : 'Теперь у тебя есть персональный код рекомендации. Поделись им с друзьями и семьёй — каждый раз, когда кто-то закажет по твоей ссылке, ты получишь <strong style="color:#D4AF37;">скидку 15%</strong> на следующий заказ.'
    )}
    ${infoBox(`
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="font-family:'Montserrat',Arial,sans-serif; font-size:11px; color:#8a8778; padding-bottom:8px; text-transform:uppercase; letter-spacing:2px;">${isDE ? 'Dein persönlicher Code' : 'Твой персональный код'}</td>
        </tr>
        <tr>
          <td style="font-family:'Cormorant Garamond',Georgia,serif; font-size:32px; font-weight:700; color:#D4AF37; letter-spacing:4px; padding-bottom:16px;">${referralCode}</td>
        </tr>
        <tr>
          <td style="font-family:'Montserrat',Arial,sans-serif; font-size:11px; color:#8a8778; padding-bottom:6px; text-transform:uppercase; letter-spacing:2px;">${isDE ? 'Dein Empfehlungs-Link' : 'Твоя ссылка'}</td>
        </tr>
        <tr>
          <td style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#D4AF37; word-break:break-all;">
            <a href="${referralLink}" style="color:#D4AF37; text-decoration:none;">${referralLink}</a>
          </td>
        </tr>
      </table>
    `)}
    ${paragraph(isDE
      ? '<strong style="color:#e8e4d9;">So funktioniert es:</strong>'
      : '<strong style="color:#e8e4d9;">Как это работает:</strong>'
    )}
    ${paragraph(isDE
      ? '1. Teile deinen Link per WhatsApp, Telegram oder E-Mail<br/>2. Dein Freund bucht eine Beratung oder PDF-Analyse<br/>3. Du erhältst automatisch einen 15%-Gutschein'
      : '1. Отправь ссылку через WhatsApp, Telegram или e-mail<br/>2. Друг заказывает консультацию или PDF-анализ<br/>3. Ты автоматически получаешь купон на 15%'
    )}
    ${goldButton(
      isDE ? 'ZUM EMPFEHLUNGS-DASHBOARD' : 'К РЕКОМЕНДАЦИЯМ',
      dashboardUrl
    )}
    ${paragraph(isDE
      ? 'Du kannst unbegrenzt viele Freunde einladen — für jede erfolgreiche Empfehlung gibt es einen neuen Gutschein!'
      : 'Количество приглашений не ограничено — за каждую успешную рекомендацию ты получаешь новый купон!'
    )}
  `;

  const html = baseTemplate({
    title: subject,
    preheader: isDE
      ? 'Teile deinen persönlichen Code und spare 15% auf jede Empfehlung'
      : 'Поделись персональным кодом и получи скидку 15% за каждую рекомендацию',
    content,
  });

  return { subject, html };
}
