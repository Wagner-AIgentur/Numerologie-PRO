import { baseTemplate, heading, paragraph, goldButton, infoBox } from './base';
import { getDateLocale } from '@/lib/i18n/admin';

const TEXT = {
  de: {
    subject: 'Unser Termin startet gleich! — Swetlana',
    preheader: 'Ich freue mich auf dich! Unser Termin beginnt in 30 Minuten.',
    heading: 'Gleich geht es los!',
    body: 'Unser Termin beginnt in 30 Minuten — ich freue mich schon auf dich!',
    dateLabel: 'Datum & Uhrzeit',
    packageLabel: 'Paket',
    joinButton: 'Jetzt Meeting beitreten',
    tip: 'Bitte stelle sicher, dass du eine ruhige Umgebung hast und dein Mikrofon & Kamera funktionieren. Alles Liebe, Swetlana 💫',
  },
  ru: {
    subject: 'Наша встреча скоро! — Светлана',
    preheader: 'Я уже жду тебя! Наша консультация начнётся через 30 минут.',
    heading: 'Скоро начинаем!',
    body: 'Наша встреча начнётся через 30 минут — я уже жду тебя!',
    dateLabel: 'Дата и время',
    packageLabel: 'Пакет',
    joinButton: 'Войти в встречу',
    tip: 'Пожалуйста, убедись, что ты в тихом месте и что твой микрофон и камера работают. С любовью, Светлана 💫',
  },
};

const PACKAGE_NAMES: Record<string, { de: string; ru: string }> = {
  beziehungsmatrix: { de: 'Beziehungsmatrix', ru: 'Матрица отношений' },
  lebensbestimmung: { de: 'Lebensbestimmung', ru: 'Предназначение' },
  wachstumsplan: { de: 'Wachstumsplan', ru: 'План роста' },
  mein_kind: { de: 'Mein Kind', ru: 'Мой ребёнок' },
  free_consultation: { de: 'Kostenlose Beratung', ru: 'Бесплатная консультация' },
};

export function sessionReminderEmail(
  locale: 'de' | 'ru',
  options: {
    scheduledAt: string;
    packageType: string;
    meetingLink: string | null;
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

  const content = [
    heading(t.heading),
    paragraph(t.body),
    infoBox(`
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0 0 8px;">
        <strong style="color:#D4AF37;">${t.dateLabel}:</strong> ${dateFormatted}
      </p>
      <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0;">
        <strong style="color:#D4AF37;">${t.packageLabel}:</strong> ${pkgName}
      </p>
    `),
    options.meetingLink ? goldButton(t.joinButton, options.meetingLink) : '',
    paragraph(`<em style="color:#8a8778; font-size:13px;">${t.tip}</em>`),
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
