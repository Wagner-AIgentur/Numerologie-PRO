import { baseTemplate, heading, paragraph, goldButton, infoBox } from './base';

const TEXT = {
  de: {
    subject: 'Bereit für den nächsten Schritt? — Swetlana',
    preheader: 'In einer Live-Beratung gehen wir gemeinsam 10x tiefer.',
    heading: 'Bereit für den nächsten Schritt?',
    body: 'Du hast deine Psychomatrix-PDF erhalten — großartig! Aber die PDF zeigt dir nur die Oberfläche. In einer persönlichen 90-Minuten-Beratung entdecken wir gemeinsam:',
    bullets: [
      'Die verborgenen Zusammenhänge zwischen deinen Zahlen',
      'Konkrete Handlungsempfehlungen für dein Leben',
      'Antworten auf deine persönlichen Fragen',
      'Beziehungs-, Berufs- oder Wachstumsanalyse nach Wahl',
    ],
    testimonial: '"Ich war zuerst skeptisch, aber Swetlana hat Dinge gesehen, die kein Test zeigen kann. Die Beratung hat mir Klarheit gegeben." — Ljudmila K.',
    offerHeading: 'Exklusiv für dich: 10% Rabatt',
    offerText: 'Als Dankeschön für deine PDF-Bestellung erhältst du 10% Rabatt auf deine erste Live-Beratung. Nutze den Code beim Checkout:',
    couponLabel: 'Dein Gutscheincode',
    ctaButton: 'Jetzt Beratung buchen (99€ → 89,10€)',
    freeConsultation: 'Noch unsicher? Buch dir zuerst eine kostenlose 15-Minuten-Beratung mit mir. Ich freue mich! 💫 Alles Liebe, Swetlana',
    freeButton: 'Kostenlose Erstberatung mit mir',
  },
  ru: {
    subject: 'Готов к следующему шагу? — Светлана',
    preheader: 'На живой консультации мы погрузимся в матрицу в 10 раз глубже.',
    heading: 'Готов к следующему шагу?',
    body: 'Ты получил свой PDF-анализ психоматрицы — отлично! Но PDF показывает лишь поверхность. На персональной 90-минутной консультации мы вместе откроем:',
    bullets: [
      'Скрытые связи между твоими числами',
      'Конкретные рекомендации для твоей жизни',
      'Ответы на твои личные вопросы',
      'Анализ отношений, карьеры или личностного роста — на выбор',
    ],
    testimonial: '"Сначала я скептически относилась, но Светлана увидела то, что не покажет ни один тест. Консультация дала мне ясность." — Людмила К.',
    offerHeading: 'Эксклюзивно для тебя: скидка 10%',
    offerText: 'В благодарность за покупку PDF-анализа — скидка 10% на первую живую консультацию. Используй код при оплате:',
    couponLabel: 'Твой код скидки',
    ctaButton: 'Записаться на консультацию (99€ → 89,10€)',
    freeConsultation: 'Ещё не уверен? Запишись на бесплатную 15-минутную консультацию со мной. Буду рада! 💫 С любовью, Светлана',
    freeButton: 'Бесплатная консультация со мной',
  },
};

const CAL_URL = 'https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация';

export function upsellConsultationEmail(
  locale: 'de' | 'ru',
  couponCode: string,
  packagesUrl: string
): { subject: string; html: string } {
  const t = TEXT[locale];

  const bulletList = t.bullets
    .map(
      (b) =>
        `<li style="font-family:'Montserrat',Arial,sans-serif; font-size:14px; color:#a8a59b; margin-bottom:8px; padding-left:4px;">${b}</li>`
    )
    .join('');

  const content = [
    heading(t.heading),
    paragraph(t.body),
    `<ul style="padding-left:20px; margin:16px 0 24px;">${bulletList}</ul>`,
    `<blockquote style="margin:24px 0; padding:16px 20px; border-left:3px solid #D4AF37; background:#0c2830; border-radius:0 8px 8px 0;">
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#8a8778; font-style:italic; margin:0;">
        ${t.testimonial}
      </p>
    </blockquote>`,
    infoBox(`
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:15px; color:#D4AF37; font-weight:600; margin:0 0 8px; text-align:center;">
        ${t.offerHeading}
      </p>
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0 0 12px; text-align:center;">
        ${t.offerText}
      </p>
      <div style="text-align:center; padding:12px; background:#143028; border:1px dashed #3a5a3e; border-radius:8px;">
        <p style="font-family:'Montserrat',Arial,sans-serif; font-size:11px; color:#6e6b62; margin:0 0 4px; text-transform:uppercase; letter-spacing:1px;">
          ${t.couponLabel}
        </p>
        <p style="font-family:'Montserrat',Arial,sans-serif; font-size:20px; color:#D4AF37; font-weight:700; margin:0; letter-spacing:2px;">
          ${couponCode}
        </p>
      </div>
    `),
    goldButton(t.ctaButton, packagesUrl),
    `<div style="margin-top:24px; text-align:center;">
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#7a776d; margin:0 0 12px;">
        ${t.freeConsultation}
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
