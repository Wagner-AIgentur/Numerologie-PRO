import { baseTemplate, goldButton, heading, paragraph } from './base';

export function leadWelcomeEmail({
  email,
  language = 'de',
}: {
  email: string;
  language?: 'de' | 'ru';
}): { subject: string; html: string } {
  const isDE = language === 'de';

  const subject = isDE
    ? 'Deine Zahlen haben eine Botschaft — Swetlana'
    : 'Твои числа несут послание — Светлана';

  const content = `
    ${heading(isDE ? 'Deine Zahlen sprechen' : 'Твои числа говорят')}
    ${paragraph(isDE
      ? 'Schön, dass du den Numerologie-Rechner ausprobiert hast! Hinter jedem Geburtsdatum verbirgt sich eine Botschaft — über deine Stärken, dein Potenzial und deinen Lebensweg.'
      : 'Рада, что ты воспользовался нумерологическим калькулятором! За каждой датой рождения скрывается послание — о твоих силах, потенциале и жизненном пути.'
    )}
    ${paragraph(isDE
      ? 'In einer <strong style="color:#D4AF37;">persönlichen Beratung</strong> gehen wir gemeinsam tiefer: Ich zeige dir, wie deine Zahlen zusammenwirken und welche Chancen sich gerade jetzt öffnen.'
      : 'На <strong style="color:#D4AF37;">персональной консультации</strong> мы пойдём глубже вместе: я покажу, как твои числа взаимодействуют и какие возможности открываются прямо сейчас.'
    )}
    ${goldButton(
      isDE ? 'Beratung mit mir buchen' : 'Записаться на консультацию',
      'https://numerologie-pro.com/de/kontakt'
    )}
    ${paragraph(`<span style="font-size:13px; color:#7a776d;">${isDE
      ? 'Ich freue mich auf dich! 💫 Alles Liebe, Swetlana'
      : 'Буду рада! 💫 С любовью, Светлана'
    }</span>`)}
  `;

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: isDE ? 'Entdecke, was deine Zahlen über dich verraten.' : 'Узнай, что твои числа говорят о тебе.',
      content,
    }),
  };
}
