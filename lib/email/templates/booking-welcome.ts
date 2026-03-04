import { baseTemplate, heading, paragraph, goldButton, infoBox } from './base';
import { getDateLocale } from '@/lib/i18n/admin';

const TEXT = {
  de: {
    subject: 'Danke für deine Buchung! — Swetlana',
    preheader: 'Dein persönlicher Bereich ist fertig — ich freue mich auf dich!',
    heading: 'Danke für deine Buchung!',
    greeting: (name: string) => `Hallo ${name},`,
    body: 'Ich freue mich sehr auf unseren gemeinsamen Termin! Hier sind die Details:',
    dateLabel: 'Datum & Uhrzeit',
    packageLabel: 'Paket',
    platformLabel: 'Plattform',
    joinButton: 'Meeting beitreten',
    accountHeading: 'Dein persönlicher Bereich',
    accountBody: 'Ich habe alles für dich vorbereitet! Setze jetzt dein Passwort und du kannst alle Details zu deiner Sitzung, PDFs und mehr in deinem Dashboard einsehen.',
    passwordButton: 'Passwort setzen & Dashboard öffnen',
    telegramText: 'Möchtest du Erinnerungen auch per Telegram erhalten? Verbinde deinen Account mit einem Klick:',
    telegramButton: 'Telegram verbinden',
    signoff: 'Ich schicke dir vorher noch eine Erinnerung. Bis bald! 💫\n\nAlles Liebe,\nSwetlana',
  },
  ru: {
    subject: 'Спасибо за запись! — Светлана',
    preheader: 'Твой личный кабинет готов — жду тебя!',
    heading: 'Спасибо за запись!',
    greeting: (name: string) => `Привет, ${name}!`,
    body: 'Я очень жду нашу встречу! Вот детали:',
    dateLabel: 'Дата и время',
    packageLabel: 'Пакет',
    platformLabel: 'Платформа',
    joinButton: 'Войти в встречу',
    accountHeading: 'Твой личный кабинет',
    accountBody: 'Я всё подготовила для тебя! Установи пароль и ты сможешь видеть все детали сессии, PDF и многое другое в личном кабинете.',
    passwordButton: 'Установить пароль и открыть кабинет',
    telegramText: 'Хочешь получать напоминания в Telegram? Подключи аккаунт одним нажатием:',
    telegramButton: 'Подключить Telegram',
    signoff: 'Я пришлю тебе напоминание перед встречей. До встречи! 💫\n\nС любовью,\nСветлана',
  },
};

const PACKAGE_NAMES: Record<string, { de: string; ru: string }> = {
  beziehungsmatrix: { de: 'Beziehungsmatrix', ru: 'Матрица отношений' },
  lebensbestimmung: { de: 'Lebensbestimmung', ru: 'Предназначение' },
  wachstumsplan: { de: 'Wachstumsplan', ru: 'План роста' },
  mein_kind: { de: 'Mein Kind', ru: 'Мой ребёнок' },
  free_consultation: { de: 'Kostenlose Beratung', ru: 'Бесплатная консультация' },
};

export function bookingWelcomeEmail(
  locale: 'de' | 'ru',
  options: {
    userName: string;
    scheduledAt: string;
    packageType: string;
    meetingLink: string | null;
    platform: string | null;
    inviteUrl: string;
    dashboardUrl: string;
    telegramDeepLink?: string;
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

  // Booking details info box
  const infoContent = `
    <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0 0 8px;">
      <strong style="color:#D4AF37;">${t.dateLabel}:</strong> ${dateFormatted}
    </p>
    <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0 0 8px;">
      <strong style="color:#D4AF37;">${t.packageLabel}:</strong> ${pkgName}
    </p>
    ${options.platform ? `
    <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#9a9789; margin:0;">
      <strong style="color:#D4AF37;">${t.platformLabel}:</strong> ${options.platform}
    </p>` : ''}
  `;

  // Build content sections
  const sections: string[] = [
    heading(t.heading),
    paragraph(t.greeting(options.userName)),
    paragraph(t.body),
    infoBox(infoContent),
  ];

  // Meeting join button
  if (options.meetingLink) {
    sections.push(goldButton(t.joinButton, options.meetingLink));
  }

  // Divider + Account setup section
  sections.push(`<div style="margin-top:28px; padding-top:24px; border-top:1px solid #143028;">`);
  sections.push(heading(t.accountHeading));
  sections.push(paragraph(t.accountBody));
  sections.push(goldButton(t.passwordButton, options.inviteUrl));
  sections.push(`</div>`);

  // Telegram deep-link section (optional)
  if (options.telegramDeepLink) {
    sections.push(`<div style="margin-top:24px; padding-top:20px; border-top:1px solid #143028;">`);
    sections.push(paragraph(`<em style="color:#8a8778;">${t.telegramText}</em>`));
    sections.push(goldButton(t.telegramButton, options.telegramDeepLink));
    sections.push(`</div>`);
  }

  // Sign-off
  sections.push(paragraph(`<em style="color:#8a8778;">${t.signoff.replace(/\n/g, '<br>')}</em>`));

  return {
    subject: t.subject,
    html: baseTemplate({
      title: t.subject,
      preheader: t.preheader,
      content: sections.join('\n'),
    }),
  };
}
