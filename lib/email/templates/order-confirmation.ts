import { baseTemplate, goldButton, heading, paragraph, infoBox } from './base';

export function orderConfirmationEmail({
  name,
  productName,
  amount,
  currency = 'EUR',
  language = 'de',
}: {
  name: string;
  productName: string;
  amount: number;
  currency?: string;
  language?: 'de' | 'ru';
}): { subject: string; html: string } {
  const isDE = language === 'de';
  const formattedAmount = new Intl.NumberFormat(isDE ? 'de-DE' : 'ru-RU', {
    style: 'currency',
    currency,
  }).format(amount / 100);

  const subject = isDE
    ? `Danke für deine Buchung! — Swetlana`
    : `Спасибо за заказ! — Светлана`;

  const content = `
    ${heading(isDE ? `Vielen Dank, ${name}!` : `Спасибо, ${name}!`)}
    ${paragraph(isDE
      ? 'Deine Zahlung wurde erfolgreich verarbeitet. Ich freue mich, dich auf deiner numerologischen Reise zu begleiten!'
      : 'Твой платёж успешно обработан. Я рада сопровождать тебя на твоём нумерологическом пути!'
    )}
    ${infoBox(`
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="font-family:'Montserrat',Arial,sans-serif; font-size:12px; color:#8a8778; padding-bottom:4px; text-transform:uppercase; letter-spacing:1px;">${isDE ? 'Paket' : 'Пакет'}</td>
        </tr>
        <tr>
          <td style="font-family:'Cormorant Garamond',Georgia,serif; font-size:20px; font-weight:600; color:#D4AF37; padding-bottom:16px;">${productName}</td>
        </tr>
        <tr>
          <td style="font-family:'Montserrat',Arial,sans-serif; font-size:12px; color:#8a8778; padding-bottom:4px; text-transform:uppercase; letter-spacing:1px;">${isDE ? 'Betrag' : 'Сумма'}</td>
        </tr>
        <tr>
          <td style="font-family:'Montserrat',Arial,sans-serif; font-size:18px; font-weight:600; color:#e8e4d9;">${formattedAmount}</td>
        </tr>
      </table>
    `)}
    ${paragraph(isDE
      ? 'Ich melde mich in Kürze bei dir, um einen Termin zu vereinbaren. Alle Details findest du in deinem persönlichen Bereich.'
      : 'Я свяжусь с тобой в ближайшее время для согласования даты. Все детали доступны в твоём личном кабинете.'
    )}
    ${goldButton(
      isDE ? 'Mein Bereich öffnen' : 'Открыть кабинет',
      `https://numerologie-pro.com/${language}/dashboard`
    )}
    ${paragraph(`<span style="font-size:13px; color:#7a776d;">${isDE
      ? 'Bei Fragen schreib mir an info@numerologie-pro.com — ich bin für dich da! 💫 Alles Liebe, Swetlana'
      : 'По вопросам пиши мне на info@numerologie-pro.com — я на связи! 💫 С любовью, Светлана'
    }</span>`)}
  `;

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: isDE ? `Danke für deine Buchung von ${productName}!` : `Спасибо за заказ ${productName}!`,
      content,
    }),
  };
}
