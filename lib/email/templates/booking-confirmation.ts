import { baseTemplate, heading, paragraph, goldButton, infoBox } from './base';
import { getDateLocale } from '@/lib/i18n/admin';

const TEXT = {
  de: {
    subject: 'Danke für deine Buchung! — Swetlana',
    preheader: 'Ich freue mich sehr auf unseren Termin!',
    heading: 'Danke für deine Buchung!',
    body: 'Ich freue mich sehr auf unseren gemeinsamen Termin! Hier sind die Details:',
    dateLabel: 'Datum & Uhrzeit',
    packageLabel: 'Paket',
    platformLabel: 'Plattform',
    meetingLabel: 'Meeting-Link',
    joinButton: 'Meeting beitreten',
    dashboardText: 'Alle Details findest du auch in deinem persönlichen Bereich unter "Sitzungen".',
    dashboardButton: 'Mein Dashboard',
    reminderNote: 'Ich schicke dir 30 Minuten vorher noch eine Erinnerung. Bis bald! 💫 Alles Liebe, Swetlana',
  },
  ru: {
    subject: 'Спасибо за запись! — Светлана',
    preheader: 'Я очень жду нашу встречу!',
    heading: 'Спасибо за запись!',
    body: 'Я очень жду нашу встречу! Вот детали:',
    dateLabel: 'Дата и время',
    packageLabel: 'Пакет',
    platformLabel: 'Платформа',
    meetingLabel: 'Ссылка на встречу',
    joinButton: 'Войти в встречу',
    dashboardText: 'Все детали также доступны в твоём личном кабинете в разделе "Сессии".',
    dashboardButton: 'Мой кабинет',
    reminderNote: 'Я пришлю тебе напоминание за 30 минут. До встречи! 💫 С любовью, Светлана',
  },
};

const PACKAGE_NAMES: Record<string, { de: string; ru: string }> = {
  beziehungsmatrix: { de: 'Beziehungsmatrix', ru: 'Матрица отношений' },
  lebensbestimmung: { de: 'Lebensbestimmung', ru: 'Предназначение' },
  wachstumsplan: { de: 'Wachstumsplan', ru: 'План роста' },
  mein_kind: { de: 'Mein Kind', ru: 'Мой ребёнок' },
  free_consultation: { de: 'Kostenlose Beratung', ru: 'Бесплатная консультация' },
};

export function bookingConfirmationEmail(
  locale: 'de' | 'ru',
  options: {
    scheduledAt: string;
    packageType: string;
    meetingLink: string | null;
    platform: string | null;
    dashboardUrl: string;
  }
): { subject: string; html: string } {
  const t = TEXT[locale];
  const pkgName = PACKAGE_NAMES[options.packageType]?.[locale] ?? options.packageType;

  const dateFormatted = new Date(options.scheduledAt).toLocaleString(
    getDateLocale(locale),
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  const infoContent = `
    <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0 0 8px;">
      <strong style="color:#D4AF37;">${t.dateLabel}:</strong> ${dateFormatted}
    </p>
    <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0 0 8px;">
      <strong style="color:#D4AF37;">${t.packageLabel}:</strong> ${pkgName}
    </p>
    ${options.platform ? `
    <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0 0 8px;">
      <strong style="color:#D4AF37;">${t.platformLabel}:</strong> ${options.platform}
    </p>` : ''}
    <p style="font-family:'Montserrat',Arial,sans-serif; font-size:12px; color:#6e6b62; margin:12px 0 0; font-style:italic;">
      ${t.reminderNote}
    </p>
  `;

  const content = [
    heading(t.heading),
    paragraph(t.body),
    infoBox(infoContent),
    options.meetingLink ? goldButton(t.joinButton, options.meetingLink) : '',
    `<div style="margin-top:24px; padding-top:20px; border-top:1px solid #143028;">`,
    paragraph(`<em style="color:#8a8778;">${t.dashboardText}</em>`),
    goldButton(t.dashboardButton, options.dashboardUrl),
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

// Admin notification email (simpler format)
export function adminBookingNotificationEmail(options: {
  customerName: string;
  customerEmail: string;
  packageType: string;
  scheduledAt: string;
  meetingLink: string | null;
  sessionType: 'paid' | 'free';
}): { subject: string; html: string } {
  const pkgName = PACKAGE_NAMES[options.packageType]?.de ?? options.packageType;
  const typeLabel = options.sessionType === 'free' ? 'KOSTENLOS' : 'BEZAHLT';

  const dateFormatted = new Date(options.scheduledAt).toLocaleString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const content = [
    heading('Neuer Termin gebucht!'),
    paragraph(`<strong>${options.customerName || options.customerEmail}</strong> hat einen Termin gebucht.`),
    infoBox(`
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0 0 8px;">
        <strong style="color:#D4AF37;">Typ:</strong> ${typeLabel}
      </p>
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0 0 8px;">
        <strong style="color:#D4AF37;">Paket:</strong> ${pkgName}
      </p>
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0 0 8px;">
        <strong style="color:#D4AF37;">Datum:</strong> ${dateFormatted}
      </p>
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0 0 8px;">
        <strong style="color:#D4AF37;">E-Mail:</strong> ${options.customerEmail}
      </p>
      ${options.meetingLink ? `
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0;">
        <strong style="color:#D4AF37;">Meeting:</strong> <a href="${options.meetingLink}" style="color:#D4AF37;">${options.meetingLink}</a>
      </p>` : ''}
    `),
  ].join('\n');

  return {
    subject: `Neuer Termin: ${pkgName} (${typeLabel}) — ${options.customerName || options.customerEmail}`,
    html: baseTemplate({
      title: 'Neuer Termin',
      preheader: `${options.customerName || options.customerEmail} hat einen ${typeLabel.toLowerCase()}en Termin gebucht.`,
      content,
    }),
  };
}
