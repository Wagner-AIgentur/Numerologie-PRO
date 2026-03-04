import { baseTemplate, heading, paragraph, goldButton, infoBox } from './base';

const TEXT = {
  de: {
    subject: 'Dein PDF ist fertig! — Swetlana',
    preheader: 'Ich habe deine persönliche Analyse erstellt — schau mal rein!',
    heading: 'Dein PDF ist fertig!',
    body: 'Danke für dein Vertrauen! Ich habe deine persönliche Psychomatrix-Analyse erstellt — du findest sie im Anhang.',
    birthdate: 'Geburtsdatum',
    infoText: 'Deine PDF-Datei ist als Anhang beigefügt. Du kannst sie auch jederzeit in deinem Dashboard unter "Unterlagen" herunterladen.',
    dashboardButton: 'Meine Unterlagen ansehen',
    ctaText: 'Möchtest du die Ergebnisse gemeinsam besprechen? Buch dir einen Termin mit mir — ich freue mich darauf! Alles Liebe, Swetlana 💫',
    ctaButton: 'Kostenlose Beratung buchen',
  },
  ru: {
    subject: 'Твой PDF готов! — Светлана',
    preheader: 'Я подготовила твой персональный анализ — загляни!',
    heading: 'Твой PDF готов!',
    body: 'Спасибо за доверие! Я подготовила твой персональный анализ психоматрицы — он в приложении к письму.',
    birthdate: 'Дата рождения',
    infoText: 'Твой PDF-файл прикреплён к этому письму. Ты также можешь скачать его в любое время в разделе "Документы" в личном кабинете.',
    dashboardButton: 'Мои документы',
    ctaText: 'Хочешь обсудить результаты вместе? Запишись на консультацию — буду рада! С любовью, Светлана 💫',
    ctaButton: 'Записаться на бесплатную консультацию',
  },
};

const CAL_URL = 'https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация';

export function pdfDeliveryEmail(
  locale: 'de' | 'ru',
  birthdate: string,
  dashboardUrl: string
): { subject: string; html: string } {
  const t = TEXT[locale];

  const content = [
    heading(t.heading),
    paragraph(t.body),
    infoBox(`
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0 0 4px;">
        <strong style="color:#D4AF37;">${t.birthdate}:</strong> ${birthdate}
      </p>
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#8a8778; margin:8px 0 0; line-height:1.6;">
        ${t.infoText}
      </p>
    `),
    goldButton(t.dashboardButton, dashboardUrl),
    `<div style="margin-top:32px; padding-top:24px; border-top:1px solid #143028;">`,
    paragraph(`<em style="color:#8a8778;">${t.ctaText}</em>`),
    goldButton(t.ctaButton, CAL_URL),
    `</div>`,
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
