/**
 * Year Forecast PDF Generator — V3 (10-page layout)
 *
 * Product 4: Personal year forecast based on birthdate + year.
 *
 * Pages:
 *  1. Cover (with forecast year display)
 *  2. Intro — Your year energy
 *  3. Arcana description + image
 *  4. Positive aspects of the year
 *  5. Challenges and warnings
 *  6. Work and career
 *  7. Health + Recommendations
 *  8. Cross-sell
 *  9. Thank-you + Social
 */

import { calculateYearForecast, type YearForecastResult } from './calculate';
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
    coverTitle: 'JAHRESPROGNOSE',
    coverSubtitle: 'Karmische Numerologie — deine persönliche Energieprognose',
    preparedFor: 'Erstellt für',
    birthdate: 'Geburtsdatum',
    arcanaLabel: 'Arkana',
    createdOn: 'Erstellt am',
    forecastYearLabel: 'Prognosejahr',
    productName: 'Jahresprognose',

    introTitle: 'Deine Jahresenergie',
    introP1: (name: string, num: number, year: number) =>
      `Jedes Jahr bringt seine eigene Arkana-Energie mit sich — eine einzigartige Schwingung, die deinen Lebensweg, deine Entscheidungen und deine Chancen beeinflusst. Das Jahr <strong style="color: ${COLORS.gold};">${year}</strong> steht für dich unter dem Einfluss der Arkana <strong style="color: ${COLORS.gold};">${name}</strong> (${num}).`,
    introP2: 'Das persönliche Jahr wird aus deinem Geburtsdatum und dem aktuellen Jahr berechnet. Es zeigt dir, welche Energien dominieren, welche Themen in den Vordergrund treten und wie du das Jahr optimal für dich nutzen kannst.',
    introHighlight: 'Nutze diese Prognose, um das Jahr bewusst zu planen. Die Arkana-Energie ist kein starres Schicksal, sondern ein Kompass — sie zeigt Richtungen und Potenziale, die du aktiv nutzen kannst.',

    arcanaTitle: (num: number, name: string) => `${num}. Arkanum — ${name}`,
    arcanaIntro: (num: number, name: string, meaning: string) =>
      `Deine Jahresarkana ist <strong style="color: ${COLORS.gold};">${name}</strong> (${num}). ${meaning}`,

    positiveTitle: 'Positive Aspekte des Jahres',
    positiveIntro: (name: string, year: number) =>
      `Das Jahr ${year} bringt unter dem Einfluss der Arkana <strong style="color: ${COLORS.gold};">${name}</strong> besonders günstige Energien mit sich. Nutze diese positiven Strömungen bewusst.`,
    positiveHighlight: (year: number) =>
      `Das Jahr ${year} bietet dir hervorragende Möglichkeiten, diese Qualitäten zu entfalten. Setze bewusst auf deine Stärken und nutze die günstige Energie, um neue Projekte zu starten.`,

    challengesTitle: 'Herausforderungen und Warnungen',
    challengesIntro: (name: string, year: number) =>
      `Neben den positiven Aspekten bringt das Jahr ${year} unter der Arkana <strong style="color: ${COLORS.red};">${name}</strong> auch Herausforderungen mit sich. Bewusstheit ist der Schlüssel.`,
    challengesImportant: 'Achtung:',

    workTitle: 'Arbeit und Karriere',
    workIntro: (year: number) =>
      `Im Bereich Arbeit und Karriere bringt das Jahr ${year} spezifische Energien und Chancen mit sich. Hier erfährst du, worauf du beruflich achten solltest.`,
    workProfessions: 'Günstige Richtungen:',

    healthTitle: 'Gesundheitsprognose',
    healthIntro: (year: number) =>
      `Deine Gesundheit verdient im Jahr ${year} besondere Aufmerksamkeit. Die Arkana-Energie weist auf bestimmte Bereiche hin, die du im Auge behalten solltest.`,

    recoTitle: 'Empfehlungen für das Jahr',
    recoIntro: (year: number) =>
      `Zum Abschluss deiner Jahresprognose für ${year} möchten wir dir folgende Empfehlungen mit auf den Weg geben:`,
    recoHealth: 'Gesundheitsempfehlung:',
    recoHealthText: 'Achte in diesem Jahr besonders auf eine ausgewogene Ernährung, regelmäßige Bewegung und ausreichend Erholung. Meditation und Achtsamkeitspraktiken helfen dir, deine Energie im Gleichgewicht zu halten.',
    recoGeneral: 'Dieses Jahr ist eine Einladung, bewusst zu leben und die Energien der Arkana aktiv für deine persönliche Entwicklung zu nutzen.',

    crossSellTitle: 'Entdecke das vollständige Bild',
    crossSellIntro: 'Die Jahresprognose ist ein wichtiger Baustein deiner karmischen Karte.',
    cs1Title: 'Geburtstags-Code',
    cs1Desc: 'Welche Talente und Qualitäten hast du aus früheren Leben mitgebracht?',
    cs2Title: 'Selbstverwirklichungs-Code',
    cs2Desc: 'In welchem Bereich kannst du dich maximal entfalten?',
    cs3Title: 'Karmischer-Knoten-Code',
    cs3Desc: 'Welche karmischen Schulden trägst du mit dir und wie löst du diese auf?',
  },
  ru: {
    coverTitle: 'ПРОГНОЗ НА ГОД',
    coverSubtitle: 'Кармическая нумерология — ваш персональный энергетический прогноз',
    preparedFor: 'Подготовлено для',
    birthdate: 'Дата рождения',
    arcanaLabel: 'Аркан',
    createdOn: 'Создано',
    forecastYearLabel: 'Год прогноза',
    productName: 'Прогноз на год',

    introTitle: 'Ваша энергия года',
    introP1: (name: string, num: number, year: number) =>
      `Каждый год несёт свою уникальную энергию аркана — вибрацию, которая влияет на ваш жизненный путь, решения и возможности. Год <strong style="color: ${COLORS.gold};">${year}</strong> проходит для вас под влиянием аркана <strong style="color: ${COLORS.gold};">${name}</strong> (${num}).`,
    introP2: 'Персональный год рассчитывается на основе вашей даты рождения и текущего года. Он показывает, какие энергии доминируют и как вы можете оптимально использовать этот год.',
    introHighlight: 'Используйте этот прогноз для осознанного планирования года. Энергия аркана — это не жёсткая судьба, а компас: она указывает направления и потенциалы, которые вы можете активно использовать.',

    arcanaTitle: (num: number, name: string) => `${num} Аркан — ${name}`,
    arcanaIntro: (num: number, name: string, meaning: string) =>
      `Ваш аркан года — <strong style="color: ${COLORS.gold};">${name}</strong> (${num}). ${meaning}`,

    positiveTitle: 'Позитивные аспекты года',
    positiveIntro: (name: string, year: number) =>
      `Год ${year} под влиянием аркана <strong style="color: ${COLORS.gold};">${name}</strong> приносит особенно благоприятные энергии. Используйте эти позитивные потоки осознанно.`,
    positiveHighlight: (year: number) =>
      `Год ${year} предоставляет вам отличные возможности для раскрытия этих качеств. Осознанно опирайтесь на свои сильные стороны и используйте благоприятную энергию.`,

    challengesTitle: 'Вызовы и предупреждения',
    challengesIntro: (name: string, year: number) =>
      `Наряду с позитивными аспектами, год ${year} под арканом <strong style="color: ${COLORS.red};">${name}</strong> несёт и определённые вызовы. Осознанность — ключ к успеху.`,
    challengesImportant: 'Внимание:',

    workTitle: 'Работа и карьера',
    workIntro: (year: number) =>
      `В сфере работы и карьеры год ${year} приносит специфические энергии и возможности. Здесь вы узнаете, на что стоит обратить внимание.`,
    workProfessions: 'Благоприятные направления:',

    healthTitle: 'Прогноз здоровья',
    healthIntro: (year: number) =>
      `Ваше здоровье заслуживает особого внимания в ${year} году. Энергия аркана указывает на области, за которыми стоит следить.`,

    recoTitle: 'Рекомендации на год',
    recoIntro: (year: number) =>
      `В завершение вашего прогноза на ${year} год, хотим дать вам следующие рекомендации:`,
    recoHealth: 'Рекомендация по здоровью:',
    recoHealthText: 'Уделите в этом году особое внимание сбалансированному питанию, регулярной физической активности и достаточному отдыху. Медитация и практики осознанности помогут поддерживать энергетический баланс.',
    recoGeneral: 'Этот год — приглашение жить осознанно и активно использовать энергии аркана для вашего личного развития.',

    crossSellTitle: 'Откройте полную картину',
    crossSellIntro: 'Прогноз на год — это важный элемент вашей кармической карты.',
    cs1Title: 'Код дня рождения',
    cs1Desc: 'Какие таланты и качества вы принесли из прошлых жизней?',
    cs2Title: 'Код самореализации',
    cs2Desc: 'В какой сфере вы можете реализоваться по максимуму?',
    cs3Title: 'Код кармического узла',
    cs3Desc: 'Какие кармические долги вы несёте и как их проработать?',
  },
};

// ─── Page Builders ─────────────────────────────────────────────────

function p1Cover(result: YearForecastResult, name: string, locale: Locale): string {
  const t = T[locale];
  const today = new Date().toLocaleDateString(getDateLocale(locale), { day: '2-digit', month: '2-digit', year: 'numeric' });
  const yearHtml = `
    <div class="cover-formula">
      ${t.forecastYearLabel}: <strong style="font-size: 1.3em;">${result.year}</strong>
    </div>
  `;
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
    extraHtml: yearHtml,
  });
}

function p2Intro(result: YearForecastResult, locale: Locale): string {
  const t = T[locale];
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.introTitle}</div>
        <div class="section-text">
          <p>${t.introP1(result.arcana.name, result.arcanaNumber, result.year)}</p>
          <p>${t.introP2}</p>
        </div>
        <div class="highlight-box"><p>${t.introHighlight}</p></div>
      </div>
      ${pageFooter(`${t.productName} ${result.year} — ${result.arcana.name}`, 2)}
    </div>
  `;
}

function p3ArcanaDesc(result: YearForecastResult, locale: Locale): string {
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
      ${pageFooter(`${t.productName} ${result.year} — ${result.arcana.name}`, 3)}
    </div>
  `;
}

function p4Positive(result: YearForecastResult, locale: Locale): string {
  const t = T[locale];
  const items = splitTraits(result.arcana.positiveTraits).map(tr => `<li>${tr}</li>`).join('\n');
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.positiveTitle}</div>
        <div class="section-text"><p>${t.positiveIntro(result.arcana.name, result.year)}</p></div>
        <ul class="trait-list">${items}</ul>
        <div class="highlight-box"><p>${t.positiveHighlight(result.year)}</p></div>
      </div>
      ${pageFooter(`${t.productName} ${result.year} — ${result.arcana.name}`, 4)}
    </div>
  `;
}

function p5Challenges(result: YearForecastResult, locale: Locale): string {
  const t = T[locale];
  const items = splitTraits(result.arcana.negativeTraits).map(tr => `<li>${tr}</li>`).join('\n');
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.challengesTitle}</div>
        <div class="section-text"><p>${t.challengesIntro(result.arcana.name, result.year)}</p></div>
        <ul class="trait-list negative">${items}</ul>
        ${result.arcana.psychologicalProblems ? `
        <div class="highlight-box warning">
          <p><strong>${t.challengesImportant}</strong> ${result.arcana.psychologicalProblems}</p>
        </div>` : ''}
      </div>
      ${pageFooter(`${t.productName} ${result.year} — ${result.arcana.name}`, 5)}
    </div>
  `;
}

function p6Work(result: YearForecastResult, locale: Locale): string {
  const t = T[locale];
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.workTitle}</div>
        <div class="section-text"><p>${t.workIntro(result.year)}</p></div>
        <div class="section-text"><p>${result.arcana.work}</p></div>
        ${result.arcana.professions ? `
        <div class="highlight-box">
          <p><strong>${t.workProfessions}</strong> ${result.arcana.professions}</p>
        </div>` : ''}
      </div>
      ${pageFooter(`${t.productName} ${result.year} — ${result.arcana.name}`, 6)}
    </div>
  `;
}

function p7HealthAndRecommendations(result: YearForecastResult, locale: Locale): string {
  const t = T[locale];
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.healthTitle}</div>
        <div class="section-text"><p>${t.healthIntro(result.year)}</p></div>
        <div class="section-text"><p>${result.arcana.health}</p></div>

        <div class="section-title" style="margin-top: 28pt;">${t.recoTitle}</div>
        <div class="section-text"><p>${t.recoIntro(result.year)}</p></div>
        <div class="section-text"><p>${t.recoGeneral}</p></div>
      </div>
      ${pageFooter(`${t.productName} ${result.year} — ${result.arcana.name}`, 7)}
    </div>
  `;
}

function p8CrossSell(result: YearForecastResult, locale: Locale): string {
  const t = T[locale];
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.crossSellTitle}</div>
        <div class="section-text"><p>${t.crossSellIntro}</p></div>
        <div class="cross-sell-item"><h4>${t.cs1Title}</h4><p>${t.cs1Desc}</p></div>
        <div class="cross-sell-item"><h4>${t.cs2Title}</h4><p>${t.cs2Desc}</p></div>
        <div class="cross-sell-item"><h4>${t.cs3Title}</h4><p>${t.cs3Desc}</p></div>
      </div>
      ${pageFooter(`${t.productName} ${result.year} — ${result.arcana.name}`, 8)}
    </div>
  `;
}

// ─── Main PDF Generator ───────────────────────────────────────────

export async function generateYearForecastPDF(
  birthdate: string,
  customerName: string,
  year: number,
  locale: Locale = 'ru',
  execPath?: string
): Promise<Buffer> {
  const result = calculateYearForecast(birthdate, year, locale);

  const pages = [
    p1Cover(result, customerName, locale),
    p2Intro(result, locale),
    p3ArcanaDesc(result, locale),
    p4Positive(result, locale),
    p5Challenges(result, locale),
    p6Work(result, locale),
    p7HealthAndRecommendations(result, locale),
    p8CrossSell(result, locale),
    generateThankYouPage(locale),
  ];

  return renderPdf(pages, locale, execPath);
}
