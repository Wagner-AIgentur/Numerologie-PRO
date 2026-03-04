import { baseTemplate, heading, paragraph, goldButton, infoBox } from './base';
import { PACKAGES, type PackageKey } from '@/lib/stripe/products';

const TEXT = {
  de: {
    subject: 'Du hast etwas vergessen — dein Report wartet',
    preheader: 'Deine Numerologie-Analyse ist nur einen Klick entfernt.',
    heading: 'Du hast etwas vergessen',
    body: 'Wir haben bemerkt, dass du den Checkout nicht abgeschlossen hast. Dein Numerologie-Paket wartet noch auf dich:',
    cta: 'Jetzt abschließen',
    closing: 'Falls du Fragen hast, antworte einfach auf diese E-Mail oder buche dir eine kostenlose 15-Minuten-Beratung mit mir.',
    freeButton: 'Kostenlose Erstberatung',
    closingName: 'Alles Liebe, Swetlana',
  },
  ru: {
    subject: 'Ты кое-что забыл — твой отчёт ждёт',
    preheader: 'Твой нумерологический анализ — всего в одном клике.',
    heading: 'Ты кое-что забыл',
    body: 'Мы заметили, что ты не завершил оплату. Твой нумерологический пакет всё ещё ждёт тебя:',
    cta: 'Завершить покупку',
    closing: 'Если у тебя есть вопросы, просто ответь на это письмо или запишись на бесплатную 15-минутную консультацию.',
    freeButton: 'Бесплатная консультация',
    closingName: 'С любовью, Светлана',
  },
};

const CAL_URL = 'https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация';

export function abandonedCartEmail({
  locale,
  packageKey,
  checkoutUrl,
}: {
  locale: 'de' | 'ru';
  packageKey: string;
  checkoutUrl: string;
}): { subject: string; html: string } {
  const t = TEXT[locale];
  const pkg = PACKAGES[packageKey as PackageKey];
  const productName = pkg
    ? (locale === 'de' ? pkg.name_de : pkg.name_ru)
    : packageKey;
  const price = pkg ? `${(pkg.price_cents / 100).toFixed(2)} EUR` : '';

  const content = [
    heading(t.heading),
    paragraph(t.body),
    infoBox(`
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:16px; color:#D4AF37; font-weight:600; margin:0 0 4px; text-align:center;">
        ${productName}
      </p>
      ${price ? `<p style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#9a9789; margin:0; text-align:center;">${price}</p>` : ''}
    `),
    goldButton(t.cta, checkoutUrl),
    `<div style="margin-top:24px; text-align:center;">
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#7a776d; margin:0 0 8px;">
        ${t.closing}
      </p>
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#7a776d; margin:0;">
        ${t.closingName}
      </p>
    </div>`,
    goldButton(t.freeButton, CAL_URL),
  ].join('\n');

  return {
    subject: t.subject,
    html: baseTemplate({
      title: t.subject,
      preheader: t.preheader,
      content,
    }),
  };
}
