/**
 * Self-Realization Code PDF Generator — V3 (10-page layout)
 *
 * Product 2: Career, profession, and self-realization potential
 * based on the full birthdate digit sum mapped to 22 arcana.
 *
 * Pages:
 *  1. Cover
 *  2. Intro — Your path to self-realization
 *  3. Calculation explanation
 *  4. Arcana description + image
 *  5. Professional potential (professions list)
 *  6. Work energy + Karmic mission
 *  7. Strengths for career
 *  8. What can hold you back
 *  9. Health hints + Cross-sell
 * 10. Thank-you + Social
 */

import { calculateSelfRealizationCode, type SelfRealizationResult } from './calculate';
import {
  COLORS,
  COVER_PHOTO,
  type Locale,
  splitTraits,
  renderPdf,
  coverPage,
  pageFrame,
  pageHeader,
  pageFooter,
  arcanaCardHtml,
  generateThankYouPage,
} from './pdf-shared';
import { getDateLocale } from '@/lib/i18n/admin';

const T = {
  de: {
    coverTitle: 'SELBSTVERWIRKLICHUNGS-CODE',
    coverSubtitle: 'Karmische Numerologie — dein Weg zur beruflichen Entfaltung',
    preparedFor: 'Erstellt für',
    birthdate: 'Geburtsdatum',
    arcanaLabel: 'Arkana',
    createdOn: 'Erstellt am',
    productName: 'Selbstverwirklichungs-Code',

    introTitle: 'Dein Weg zur Selbstverwirklichung',
    introP1: (name: string, num: number) =>
      `Dein vollständiges Geburtsdatum verbirgt einen mächtigen Code — den Selbstverwirklichungs-Code. Er entsteht aus der Quersumme aller Ziffern deines Geburtsdatums und zeigt die Richtung, in der du dich beruflich und persönlich am stärksten entfalten kannst.`,
    introP2: 'Dieser Code beschreibt nicht nur passende Berufsfelder, sondern auch die innere Energie, die dich in deiner Arbeit antreibt. Er zeigt, wo deine Stärken liegen und welche Hindernisse du auf dem Weg zum Erfolg überwinden musst.',
    introHighlight: 'Nutze diesen Code als Kompass für berufliche Entscheidungen. Er zeigt dir die Richtung, in der du deine Talente am wirkungsvollsten einsetzen und finanziellen Wohlstand erreichen kannst.',

    calcTitle: 'Berechnung des Selbstverwirklichungs-Codes',
    calcP1: 'Der Selbstverwirklichungs-Code wird aus der Quersumme aller Ziffern deines vollständigen Geburtsdatums berechnet.',
    calcP2: 'Alle Ziffern von Tag, Monat und Jahr werden addiert und auf eine Zahl von 1 bis 22 reduziert.',

    arcanaTitle: (num: number, name: string) => `${num}. Arkanum — ${name}`,
    arcanaIntro: (num: number, name: string, meaning: string) =>
      `Dein Selbstverwirklichungs-Code entspricht der Arkana ${name} (${num}). ${meaning}`,

    profTitle: 'Dein berufliches Potenzial',
    profIntro: (name: string) =>
      `Die Arkana ${name} offenbart dein berufliches Potenzial. Die folgenden Berufsfelder und Tätigkeiten resonieren mit deiner Energie.`,
    workLabel: 'Deine Arbeitsenergie:',

    strengthsTitle: 'Deine Stärken für die Karriere',
    strengthsIntro: (name: string) =>
      `Die positiven Qualitäten der Arkana ${name} sind deine natürlichen Talente für die berufliche Laufbahn.`,

    weakTitle: 'Was dich bremsen kann',
    weakIntro: (name: string) =>
      `Jede Arkana hat auch Schattenaspekte, die deine berufliche Entwicklung behindern können. Wenn die Energie von ${name} ins Minus kippt, können diese Muster deinen Karriereweg blockieren.`,
    weakImportant: 'Wichtig:',

    missionTitle: 'Deine karmische Mission',
    missionIntro: 'Die karmische Mission ist dein wichtigster Wachstumsvektor. Sie zeigt nicht nur, worin du gut bist, sondern vor allem, wohin du dich entwickeln solltest.',
    missionFollowup: 'Wenn du deiner karmischen Mission folgst, entfaltest du nach und nach die positive Energie deiner Arkana. Das ist der Weg zu beruflicher Erfüllung und innerem Gleichgewicht.',
    healthLabel: 'Achte auf deine Gesundheit:',

    crossSellTitle: 'Entdecke das vollständige Bild',
    crossSellIntro: 'Der Selbstverwirklichungs-Code ist ein wichtiger Teil deiner karmischen Karte.',
    cs1Title: 'Geburtstags-Code',
    cs1Desc: 'Wie nehmen andere dich wahr? Welche Talente hast du aus vergangenen Leben mitgebracht?',
    cs2Title: 'Karmischer-Knoten-Code',
    cs2Desc: 'Welche karmischen Schulden trägst du mit dir? Welche Prüfungen erwarten dich?',
    cs3Title: 'Jahresprognose',
    cs3Desc: 'Welche Energien erwarten dich im kommenden Jahr? Welche Monate sind günstig?',
  },
  ru: {
    coverTitle: 'КОД САМОРЕАЛИЗАЦИИ',
    coverSubtitle: 'Кармическая нумерология — ваш путь к профессиональной реализации',
    preparedFor: 'Подготовлено для',
    birthdate: 'Дата рождения',
    arcanaLabel: 'Аркан',
    createdOn: 'Создано',
    productName: 'Код самореализации',

    introTitle: 'Ваш путь к самореализации',
    introP1: (name: string, num: number) =>
      `Ваша полная дата рождения скрывает мощный код — Код самореализации. Он формируется из суммы всех цифр даты рождения и показывает направление, в котором вы можете максимально раскрыть свой потенциал.`,
    introP2: 'Этот код описывает не только подходящие профессии, но и внутреннюю энергию, которая движет вами в работе. Он показывает, в чём ваши сильные стороны и какие препятствия вам нужно преодолеть на пути к успеху.',
    introHighlight: 'Используйте этот код как компас для карьерных решений. Он показывает направление, в котором вы сможете максимально эффективно реализовать свои таланты и достичь финансового благополучия.',

    calcTitle: 'Расчёт Кода Самореализации',
    calcP1: 'Код самореализации рассчитывается из суммы всех цифр вашей полной даты рождения.',
    calcP2: 'Все цифры дня, месяца и года складываются и сводятся к числу от 1 до 22.',

    arcanaTitle: (num: number, name: string) => `${num} Аркан — ${name}`,
    arcanaIntro: (num: number, name: string, meaning: string) =>
      `Ваш Код самореализации соответствует аркану ${name} (${num}). ${meaning}`,

    profTitle: 'Ваш профессиональный потенциал',
    profIntro: (name: string) =>
      `Аркан ${name} раскрывает ваш профессиональный потенциал. Следующие профессии и направления резонируют с вашей энергией.`,
    workLabel: 'Ваша рабочая энергия:',

    strengthsTitle: 'Ваши сильные стороны для карьеры',
    strengthsIntro: (name: string) =>
      `Позитивные качества аркана ${name} — это ваши природные таланты для профессиональной деятельности.`,

    weakTitle: 'Что может вас сдерживать',
    weakIntro: (name: string) =>
      `Каждый аркан имеет и теневые аспекты. Когда энергия ${name} уходит в минус, эти паттерны могут блокировать ваш карьерный путь.`,
    weakImportant: 'Важно:',

    missionTitle: 'Ваша кармическая миссия',
    missionIntro: 'Кармическая миссия — это ваш главный вектор роста. Она показывает не только то, в чём вы сильны, но прежде всего то, куда вам следует развиваться.',
    missionFollowup: 'Следуя своей кармической миссии, вы постепенно раскрываете позитивную энергию вашего аркана. Это путь к профессиональной реализации и внутреннему равновесию.',
    healthLabel: 'Обратите внимание на здоровье:',

    crossSellTitle: 'Откройте полную картину',
    crossSellIntro: 'Код самореализации — это важная часть вашей кармической карты.',
    cs1Title: 'Код дня рождения',
    cs1Desc: 'Как вас воспринимают другие? Какие таланты вы принесли из прошлых жизней?',
    cs2Title: 'Код кармического узла',
    cs2Desc: 'Какие кармические долги вы несёте? Какие проверки вас ждут?',
    cs3Title: 'Прогноз на год',
    cs3Desc: 'Какие энергии ждут вас в ближайшем году? Какие месяцы благоприятны?',
  },
};

function p1Cover(result: SelfRealizationResult, name: string, locale: Locale): string {
  const t = T[locale];
  const today = new Date().toLocaleDateString(getDateLocale(locale), { day: '2-digit', month: '2-digit', year: 'numeric' });
  return coverPage({
    coverPhotoUri: COVER_PHOTO,
    title: t.coverTitle,
    subtitle: t.coverSubtitle,
    customerName: name,
    birthdate: result.birthdate,
    arcanaLabel: t.arcanaLabel,
    arcanaNumber: result.arcanaNumber,
    arcanaName: result.arcana.name,
    preparedForLabel: t.preparedFor,
    birthdateLabel: t.birthdate,
    createdOnLabel: t.createdOn,
    todayFormatted: today,
  });
}

function p2Intro(result: SelfRealizationResult, locale: Locale): string {
  const t = T[locale];
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.introTitle}</div>
        <div class="section-text">
          <p>${t.introP1(result.arcana.name, result.arcanaNumber)}</p>
          <p>${t.introP2}</p>
        </div>
        <div class="highlight-box"><p>${t.introHighlight}</p></div>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 2)}
    </div>
  `;
}

function p3Calc(result: SelfRealizationResult, locale: Locale): string {
  const t = T[locale];
  const digits = result.birthdate.replace(/\./g, '');
  const sum = digits.split('').reduce((s, c) => s + (parseInt(c, 10) || 0), 0);
  const exLabel = locale === 'de'
    ? `Deine Berechnung: ${digits.split('').join(' + ')} = ${sum} → Arkana ${result.arcanaNumber}`
    : `Ваш расчёт: ${digits.split('').join(' + ')} = ${sum} → Аркан ${result.arcanaNumber}`;

  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.calcTitle}</div>
        <div class="calc-box">
          <p>${t.calcP1}</p>
          <p>${t.calcP2}</p>
          <div class="calc-example">${exLabel}</div>
        </div>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 3)}
    </div>
  `;
}

function p4ArcanaDesc(result: SelfRealizationResult, locale: Locale): string {
  const t = T[locale];
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        ${arcanaCardHtml(result.arcanaNumber, t.arcanaLabel)}
        <div class="section-title">${t.arcanaTitle(result.arcanaNumber, result.arcana.name)}</div>
        <div class="section-text">
          <p>${t.arcanaIntro(result.arcanaNumber, result.arcana.name, result.arcana.generalMeaning)}</p>
        </div>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 4)}
    </div>
  `;
}

function p5Professions(result: SelfRealizationResult, locale: Locale): string {
  const t = T[locale];
  const items = result.arcana.professions.split(/[,.]/).map(s => s.trim()).filter(s => s.length > 3).map(p => `<li>${p}</li>`).join('\n');
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.profTitle}</div>
        <div class="section-text"><p>${t.profIntro(result.arcana.name)}</p></div>
        <ul class="trait-list">${items}</ul>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 5)}
    </div>
  `;
}

function p6WorkAndMission(result: SelfRealizationResult, locale: Locale): string {
  const t = T[locale];
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.workLabel}</div>
        <div class="section-text"><p>${result.arcana.work}</p></div>
        <div class="section-title" style="margin-top: 28pt;">${t.missionTitle}</div>
        <div class="section-text"><p>${t.missionIntro}</p></div>
        <div class="section-text"><p>${result.arcana.karmicTask}</p></div>
        <div class="section-text"><p>${t.missionFollowup}</p></div>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 6)}
    </div>
  `;
}

function p7Strengths(result: SelfRealizationResult, locale: Locale): string {
  const t = T[locale];
  const items = splitTraits(result.arcana.positiveTraits).map(tr => `<li>${tr}</li>`).join('\n');
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.strengthsTitle}</div>
        <div class="section-text"><p>${t.strengthsIntro(result.arcana.name)}</p></div>
        <ul class="trait-list">${items}</ul>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 7)}
    </div>
  `;
}

function p8Weaknesses(result: SelfRealizationResult, locale: Locale): string {
  const t = T[locale];
  const items = splitTraits(result.arcana.negativeTraits).map(tr => `<li>${tr}</li>`).join('\n');
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.weakTitle}</div>
        <div class="section-text"><p>${t.weakIntro(result.arcana.name)}</p></div>
        <ul class="trait-list negative">${items}</ul>
        ${result.arcana.psychologicalProblems ? `
        <div class="highlight-box warning">
          <p><strong>${t.weakImportant}</strong> ${result.arcana.psychologicalProblems}</p>
        </div>` : ''}
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 8)}
    </div>
  `;
}

function p9HealthAndCrossSell(result: SelfRealizationResult, locale: Locale): string {
  const t = T[locale];
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.healthLabel}</div>
        ${result.arcana.health ? `<div class="section-text"><p>${result.arcana.health}</p></div>` : ''}
        <div class="section-title" style="margin-top: 28pt;">${t.crossSellTitle}</div>
        <div class="section-text"><p>${t.crossSellIntro}</p></div>
        <div class="cross-sell-item"><h4>${t.cs1Title}</h4><p>${t.cs1Desc}</p></div>
        <div class="cross-sell-item"><h4>${t.cs2Title}</h4><p>${t.cs2Desc}</p></div>
        <div class="cross-sell-item"><h4>${t.cs3Title}</h4><p>${t.cs3Desc}</p></div>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 9)}
    </div>
  `;
}

// ─── Main PDF Generator ───────────────────────────────────────────

export async function generateSelfRealizationPDF(
  birthdate: string,
  customerName: string,
  locale: Locale = 'ru',
  execPath?: string
): Promise<Buffer> {
  const result = calculateSelfRealizationCode(birthdate, locale);

  const pages = [
    p1Cover(result, customerName, locale),
    p2Intro(result, locale),
    p3Calc(result, locale),
    p4ArcanaDesc(result, locale),
    p5Professions(result, locale),
    p6WorkAndMission(result, locale),
    p7Strengths(result, locale),
    p8Weaknesses(result, locale),
    p9HealthAndCrossSell(result, locale),
    generateThankYouPage(locale),
  ];

  return renderPdf(pages, locale, execPath);
}
