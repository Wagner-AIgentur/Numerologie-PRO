/**
 * Birthday Code PDF Generator — V3 (11-page layout)
 *
 * Matches the design of Numerologie_SwetlanaWagner_GeburtstagsCode.pdf:
 * - Playfair Display (titles) + Poppins (body)
 * - Photo cover with overlay
 * - 11 pages, generous whitespace, one concept per page
 *
 * Pages:
 *  1. Cover (photo background + name + birthdate + arcana badge)
 *  2. Intro — What your birthdate means
 *  3. Calculation explanation
 *  4. Active energy period (until ~28 years)
 *  5. Arcana description + Arcana image
 *  6. Positive traits
 *  7. Shadow side (negative traits)
 *  8. Karmic task + Realization advice
 *  9. Professional realization + professions
 * 10. Closing message + Cross-sell
 * 11. Thank you + Social links
 */

import { calculateBirthdayCode, type BirthdayCodeResult } from './calculate';
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

// ─── Translations ────────────────────────────────────────────────

const T = {
  de: {
    coverTitle: 'GEBURTSTAGS-CODE',
    coverSubtitle: 'Karmische Numerologie — deine persönliche Analyse auf Basis der 22 Arkana',
    preparedFor: 'Erstellt für',
    birthdate: 'Geburtsdatum',
    arcanaLabel: 'Arkana',
    createdOn: 'Erstellt am',
    productName: 'Geburtstags-Code',

    // Page 2
    introTitle: 'Geburtstags-Code',
    introP1: 'In unserem Geburtsdatum gibt es keine einzige zufällige Zahl.',
    introP2: 'Das Geburtsdatum ist ein Ausgangspunkt. Es ist ein Code, in dem ein enormes Potenzial verborgen liegt.',
    introP3: 'Jede Ziffer hat ihre Bedeutung. Jede Ziffer ist wichtig.',
    introP4: 'Das Geburtsdatum besteht aus Tag, Monat und Jahr. Jede Zahl ist für einen bestimmten Lebensbereich verantwortlich und trägt bestimmte Aufgaben.',
    introP5: 'Der Geburtstag ist unsere Visitenkarte. Es ist der erste Eindruck von uns als Persönlichkeit. Es sind unsere Talente und Fähigkeiten. Es ist das Potenzial, das es zu entfalten gilt.',
    introP6: 'Es ist die gesammelte Erfahrung aus der vergangenen Inkarnation sowie die Fehler, mit denen wir in dieses Leben gekommen sind.',

    // Page 3
    calcTitle: 'Berechnung des Geburtstags-Arkanums',
    calcSystem: 'Das System basiert auf den 22 Großen Arkana.',
    calcNeedTo: 'Für die Berechnung muss das Geburtsdatum in ein Arkanum umgewandelt werden:',
    calcRule1: 'Wenn du zwischen dem 1. und 22. geboren wurdest — das ist dein Geburtstags-Arkanum.',
    calcRule2: 'Wenn du am 23., 24., 25., 26., 27., 28., 29., 30. oder 31. geboren wurdest — ziehe 22 ab.',

    // Page 4
    activeTitle: 'Die aktive Phase deines Codes',
    activeP1: 'Der Geburtstags-Code entfaltet sich besonders aktiv in der ersten Lebenshälfte. Etwa bis zum 28. Lebensjahr zeigt sich die Energie deines Arkanums am deutlichsten und bildet die Grundlage der Persönlichkeit.',
    activeP2: 'In dieser Zeit werden die Entwicklungsrichtung, die Wahl des Tätigkeitsbereichs, berufliche Interessen und die ersten ernsthaften Schritte in der Verwirklichung gelegt.',
    activeP3: 'Der Geburtstag — das sind bereits erarbeitete Qualitäten und Fähigkeiten aus der vergangenen Inkarnation. Sie zeigen sich natürlich, wie ein angeborenes Talent.',
    activeP4: 'Daher deutet die Energie des Geburtstages oft darauf hin, in welchem Bereich es einem Menschen am leichtesten fällt, sich zu verwirklichen.',
    activeP5: 'Bis zum 28. Lebensjahr fühlt sich der Mensch intuitiv zu den Richtungen hingezogen, die seinem Arkanum entsprechen. Und die gewählten Berufe spiegeln den inneren Code wider.',

    // Page 5
    arcanaTitle: (num: number, name: string) => `${num}. Arkanum — ${name}`,
    arcanaIntro: (num: number) => `Du bist unter der Energie des ${num}. Arkanums geboren.`,

    // Page 6
    positiveTitle: 'Positive Qualitäten',
    positiveIntro: (num: number, name: string) => `Menschen, die unter dem ${num}. Arkanum (${name}) geboren sind:`,

    // Page 7
    shadowTitle: 'Was du vermeiden solltest',
    shadowSubtitle: (num: number, name: string) => `Schattenseite des ${num}. Arkanums (${name}):`,
    shadowNote: 'Es ist wichtig zu lernen, Begonnenes zum Ergebnis zu führen.',

    // Page 8
    karmicTaskTitle: 'Karmische Aufgabe',

    // Page 9
    realizationTitle: 'Rat zur Energierealisierung',
    realizationFallback: 'Achte auf die Lebensbereiche, die dich persönlich glücklich machen. Lass nicht zu, dass Ängste deine Wünsche zurückhalten. Sei aufmerksam und konzentriert auf dein Ziel. Lass Negativität los und begegne deiner Umgebung mit Verständnis und Liebe.',

    // Page 10
    profTitle: 'Berufliche Realisierung',
    profListIntro: (num: number, name: string) => `Menschen, die unter dem ${num}. Arkanum geboren sind, können sich finden in:`,
    profDirections: () => `Dir liegen Richtungen, die Gedankenfreiheit, Innovation und Ideenmut erfordern:`,

    // Page 11
    closingTitle: 'Zusammenfassung',
    closingFallback: 'Dein Talent besteht darin, deine einzigartige Energie einzusetzen. Denke daran: Jede Energie hat auch eine Kehrseite. Bleib in der Realität, sei ein Praktiker und gib dich nicht Illusionen hin.',

    // Page 12 (cross-sell before thank-you)
    crossSellTitle: 'Weitere Aspekte deines Geburtsdatums',
    crossSellIntro: 'Du kannst noch mehr über dich erfahren. Zusätzlich verfügbar:',
    cs1Title: 'Selbstverwirklichungs-Code',
    cs1Desc: 'Zeigt, in welchem Bereich du dich am besten entfalten kannst und welchen Beruf du wählen solltest.',
    cs2Title: 'Karmischer-Knoten-Code',
    cs2Desc: 'Enthüllt die Fehler der vergangenen Inkarnation und warnt vor Prüfungen in diesem Leben.',
    cs3Title: 'Jahresprognose',
    cs3Desc: 'Zeigt den Vektor, wohin du deine Energie am besten lenken solltest, um dein Potenzial maximal zu realisieren.',
  },
  ru: {
    coverTitle: 'КОД ДНЯ РОЖДЕНИЯ',
    coverSubtitle: 'Кармическая нумерология — ваш персональный анализ на основе 22 арканов',
    preparedFor: 'Подготовлено для',
    birthdate: 'Дата рождения',
    arcanaLabel: 'Аркан',
    createdOn: 'Создано',
    productName: 'Код дня рождения',

    introTitle: 'Код Дня Рождения',
    introP1: 'В нашей дате рождения нет ни одного случайного числа.',
    introP2: 'Дата рождения — это точка отсчёта. Это код, в котором скрыт огромный потенциал.',
    introP3: 'Каждая цифра имеет своё значение. Каждая цифра важна.',
    introP4: 'Дата рождения состоит из дня, месяца и года. Каждое число отвечает за определённую сферу жизни и несёт определённые задачи.',
    introP5: 'День рождения — это наша визитная карточка. Это первое впечатление о нас как о личности. Это наши таланты и способности. Это потенциал, который необходимо раскрыть.',
    introP6: 'Это наработанный опыт прошлого воплощения, а также ошибки, с которыми мы пришли в эту жизнь.',

    calcTitle: 'Расчёт Аркана Дня Рождения',
    calcSystem: 'Система основана на 22 Старших Арканах.',
    calcNeedTo: 'Для расчёта необходимо перевести дату рождения в Аркан:',
    calcRule1: 'Если вы родились с 1 по 22 число — это и есть ваш Аркан Дня Рождения.',
    calcRule2: 'Если вы родились 23, 24, 25, 26, 27, 28, 29, 30 или 31 числа — необходимо вычесть 22.',

    activeTitle: 'Активная фаза вашего кода',
    activeP1: 'Код Дня Рождения особенно активно раскрывается в первой половине жизни. Примерно до 28 лет энергия вашего Аркана проявляется наиболее ярко и формирует основу личности.',
    activeP2: 'Именно в этот период закладывается направление развития, выбор сферы деятельности, профессиональные интересы и первые серьёзные шаги в реализации.',
    activeP3: 'День рождения — это уже наработанные качества и способности из прошлого воплощения. Они проявляются естественно, как врождённый талант.',
    activeP4: 'Поэтому энергия дня рождения часто подсказывает, в какой сфере человеку легче всего реализоваться.',
    activeP5: 'До 28 лет человек интуитивно тянется к тем направлениям, которые соответствуют его Аркану. И выбранные профессии отражают внутренний код.',

    arcanaTitle: (num: number, name: string) => `${num} Аркан — ${name}`,
    arcanaIntro: (num: number) => `Вы пришли под энергией ${num} Аркана.`,

    positiveTitle: 'Позитивные качества',
    positiveIntro: (num: number, name: string) => `Родившиеся под ${num} Арканом (${name}):`,

    shadowTitle: 'Что важно избегать',
    shadowSubtitle: (num: number, name: string) => `Теневая сторона ${num} Аркана (${name}):`,
    shadowNote: 'Важно учиться доводить начатое до результата.',

    karmicTaskTitle: 'Кармическая задача',

    realizationTitle: 'Совет по реализации энергии',
    realizationFallback: 'Обращайте внимание на те сферы жизни, которые делают счастливыми лично вас. Не позволяйте страхам сдерживать ваши желания. Будьте внимательны и сосредоточены на своей цели. Необходимо отпускать негатив и относиться к окружающим с пониманием и любовью.',

    profTitle: 'Профессиональная реализация',
    profListIntro: (num: number, name: string) => `Люди, рождённые под ${num} Арканом, могут найти себя:`,
    profDirections: () => `Им подходят направления, где требуется свобода мышления, новаторство и смелость идей:`,

    closingTitle: 'Итоги',
    closingFallback: 'Ваш талант — использовать вашу уникальную энергию. Помните: у каждой энергии есть обратная сторона. Требование вашего кода — находиться в реальности, быть практиком и не поддаваться иллюзиям.',

    crossSellTitle: 'Узнайте о себе ещё больше',
    crossSellIntro: 'Вы можете узнать о себе ещё больше. В дополнение доступны:',
    cs1Title: 'Код самореализации',
    cs1Desc: 'Показывает, в какой сфере вам лучше всего раскрыться и какую профессию выбрать.',
    cs2Title: 'Код кармического узла',
    cs2Desc: 'Раскрывает ошибки прошлого воплощения и предупреждает о проверках в этой жизни.',
    cs3Title: 'Прогноз на год',
    cs3Desc: 'Указывает вектор, куда лучше направить свою энергию, чтобы максимально реализовать потенциал и достичь результатов.',
  },
};

// ─── Page Generators ────────────────────────────────────────────

function p1Cover(result: BirthdayCodeResult, name: string, birthdate: string, locale: Locale): string {
  const t = T[locale];
  const today = new Date().toLocaleDateString(getDateLocale(locale), { day: '2-digit', month: '2-digit', year: 'numeric' });
  return coverPage({
    coverPhotoUri: COVER_PHOTO,
    title: t.coverTitle,
    subtitle: t.coverSubtitle,
    customerName: name,
    birthdate,
    arcanaLabel: t.arcanaLabel,
    arcanaNumber: result.arcanaNumber,
    arcanaName: result.arcana.name,
    preparedForLabel: t.preparedFor,
    birthdateLabel: t.birthdate,
    createdOnLabel: t.createdOn,
    todayFormatted: today,
  });
}

function p2Intro(result: BirthdayCodeResult, locale: Locale): string {
  const t = T[locale];
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.introTitle}</div>
        <div class="section-text">
          <p>${t.introP1}</p>
          <p>${t.introP2}</p>
          <p>${t.introP3}</p>
          <p>${t.introP4}</p>
          <p>${t.introP5}</p>
          <p>${t.introP6}</p>
        </div>
        <div class="highlight-box">
          <p>${locale === 'de'
            ? 'Die Qualitäten des Geburtstages zeigen sich besonders aktiv in der ersten Lebenshälfte.'
            : 'Именно качества дня рождения особенно активно проявляются в первой половине жизни.'
          }</p>
        </div>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 2)}
    </div>
  `;
}

function p3CalcAndActive(result: BirthdayCodeResult, locale: Locale): string {
  const t = T[locale];
  let calcHtml = '';
  if (result.day > 22) {
    const exLabel = locale === 'de'
      ? `Beispiel: Geburtsdatum — ${result.day}. Tag`
      : `Пример: Дата рождения — ${result.day} число`;
    const exCalc = `${result.day} – 22 = ${result.arcanaNumber}`;
    const exResult = locale === 'de'
      ? `Dein Geburtstags-Arkanum — ${result.arcanaNumber}.`
      : `Ваш Аркан Дня Рождения — ${result.arcanaNumber}.`;
    calcHtml = `<div class="calc-example">${exLabel}<br/>${exCalc}<br/>${exResult}</div>`;
  } else {
    const exResult = locale === 'de'
      ? `Dein Geburtstag ist der ${result.day}. — das ist dein Arkanum ${result.arcanaNumber}.`
      : `Вы родились ${result.day} числа — это и есть ваш Аркан ${result.arcanaNumber}.`;
    calcHtml = `<div class="calc-example">${exResult}</div>`;
  }

  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.calcTitle}</div>
        <div class="calc-box">
          <p>${t.calcSystem}</p>
          <p>${t.calcNeedTo}</p>
          <p>${t.calcRule1}</p>
          <p>${t.calcRule2}</p>
          ${calcHtml}
        </div>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 3)}
    </div>
  `;
}

function p4ActivePhase(result: BirthdayCodeResult, locale: Locale): string {
  const t = T[locale];
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.activeTitle}</div>
        <div class="section-text">
          <p>${t.activeP1}</p>
          <p>${t.activeP2}</p>
          <p>${t.activeP3}</p>
          <p>${t.activeP4}</p>
          <p>${t.activeP5}</p>
        </div>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 4)}
    </div>
  `;
}

function p5ArcanaDesc(result: BirthdayCodeResult, locale: Locale): string {
  const t = T[locale];
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        ${arcanaCardHtml(result.arcanaNumber, t.arcanaLabel)}
        <div class="section-title">${t.arcanaTitle(result.arcanaNumber, result.arcana.name)}</div>
        <div class="section-text">
          <p>${t.arcanaIntro(result.arcanaNumber)}</p>
        </div>
        <div class="highlight-box">
          <p>${result.arcana.generalMeaning}</p>
        </div>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 5)}
    </div>
  `;
}

function p6PositiveTraits(result: BirthdayCodeResult, locale: Locale): string {
  const t = T[locale];
  const traits = splitTraits(result.arcana.positiveTraits);
  const items = traits.map((tr) => `<li>${tr}</li>`).join('\n');
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.positiveTitle}</div>
        <div class="section-text">
          <p>${t.positiveIntro(result.arcanaNumber, result.arcana.name)}</p>
        </div>
        <ul class="trait-list">
          ${items}
        </ul>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 6)}
    </div>
  `;
}

function p7ShadowSide(result: BirthdayCodeResult, locale: Locale): string {
  const t = T[locale];
  const negTraits = splitTraits(result.arcana.negativeTraits);
  const items = negTraits.map((tr) => `<li>${tr}</li>`).join('\n');
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.shadowTitle}</div>
        <div class="section-text">
          <p>${t.shadowSubtitle(result.arcanaNumber, result.arcana.name)}</p>
        </div>
        <ul class="trait-list negative">
          ${items}
        </ul>
        <div class="highlight-box warning">
          <p>${t.shadowNote}</p>
        </div>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 7)}
    </div>
  `;
}

function p8KarmicTaskAndAdvice(result: BirthdayCodeResult, locale: Locale): string {
  const t = T[locale];
  const advice = result.arcana.realizationAdvice || t.realizationFallback;
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.karmicTaskTitle}</div>
        <div class="section-text">
          <p>${result.arcana.karmicTask}</p>
        </div>
        <div class="section-title" style="margin-top: 28pt;">${t.realizationTitle}</div>
        <div class="section-text">
          <p>${advice}</p>
        </div>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 8)}
    </div>
  `;
}

function p9Professions(result: BirthdayCodeResult, locale: Locale): string {
  const t = T[locale];
  const profList = result.arcana.professions.split(/[,.]/).map((s) => s.trim()).filter((s) => s.length > 3);
  const items = profList.map((p) => `<li>${p}</li>`).join('\n');
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.profTitle}</div>
        <div class="section-text">
          <p>${t.profListIntro(result.arcanaNumber, result.arcana.name)}</p>
        </div>
        <ul class="trait-list">
          ${items}
        </ul>
        <div class="section-text" style="margin-top: 14px;">
          <p>${t.profDirections()}</p>
        </div>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 9)}
    </div>
  `;
}

function p10ClosingAndCrossSell(result: BirthdayCodeResult, locale: Locale): string {
  const t = T[locale];
  const closing = result.arcana.closingMessage || t.closingFallback;
  return `
    <div class="page">
      ${pageFrame()}
      ${pageHeader(t.arcanaLabel, result.arcanaNumber, result.arcana.name)}
      <div class="content">
        <div class="section-title">${t.closingTitle}</div>
        <div class="section-text">
          <p>${closing}</p>
        </div>
        <div class="section-title" style="margin-top: 28pt;">${t.crossSellTitle}</div>
        <div class="section-text"><p>${t.crossSellIntro}</p></div>
        <div class="cross-sell-item">
          <h4>${t.cs1Title}</h4>
          <p>${t.cs1Desc}</p>
        </div>
        <div class="cross-sell-item">
          <h4>${t.cs2Title}</h4>
          <p>${t.cs2Desc}</p>
        </div>
        <div class="cross-sell-item">
          <h4>${t.cs3Title}</h4>
          <p>${t.cs3Desc}</p>
        </div>
      </div>
      ${pageFooter(`${t.productName} — ${result.arcana.name}`, 10)}
    </div>
  `;
}

// ─── Main PDF Generator ───────────────────────────────────────────

export async function generateBirthdayCodePDF(
  birthdate: string,
  customerName: string,
  locale: Locale = 'ru',
  execPath?: string
): Promise<Buffer> {
  const day = parseInt(birthdate.split('.')[0], 10);
  const result = calculateBirthdayCode(day, locale);

  const pages = [
    p1Cover(result, customerName, birthdate, locale),
    p2Intro(result, locale),
    p3CalcAndActive(result, locale),
    p4ActivePhase(result, locale),
    p5ArcanaDesc(result, locale),
    p6PositiveTraits(result, locale),
    p7ShadowSide(result, locale),
    p8KarmicTaskAndAdvice(result, locale),
    p9Professions(result, locale),
    p10ClosingAndCrossSell(result, locale),
    generateThankYouPage(locale),
  ];

  return renderPdf(pages, locale, execPath);
}
