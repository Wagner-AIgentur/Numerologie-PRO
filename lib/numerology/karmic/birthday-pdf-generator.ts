/**
 * Karmic Numerology — Birthday Code PDF Generator
 *
 * Generates a premium PDF for "Код дня рождения" (Birthday Code).
 * Uses Puppeteer HTML→PDF with dark navy + gold design.
 *
 * PDF Structure (compact):
 * 1. Cover page
 * 2. Introduction + Arcana description
 * 3. Positive traits (how people see you in +)
 * 4. What to avoid + development period
 * 5. Professions from Birthday Code
 * 6. Cross-sell teasers
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { calculateBirthdayCode, type BirthdayCodeResult } from './calculate';
import { getDateLocale } from '@/lib/i18n/admin';

// ─── Color Palette ────────────────────────────────────────────────

const COLORS = {
  darkNavy: '#051A24',
  navy: '#0a2533',
  gold: '#D4AF37',
  goldLight: 'rgba(212, 175, 55, 0.15)',
  goldMuted: 'rgba(212, 175, 55, 0.6)',
  white: '#ffffff',
  white80: 'rgba(255, 255, 255, 0.8)',
  white60: 'rgba(255, 255, 255, 0.6)',
  white50: 'rgba(255, 255, 255, 0.5)',
  white40: 'rgba(255, 255, 255, 0.4)',
  white10: 'rgba(255, 255, 255, 0.1)',
};

// ─── CSS Styles (compact) ────────────────────────────────────────

function getStyles(): string {
  return `
    @page {
      size: A4;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      -webkit-font-smoothing: antialiased;
      color: ${COLORS.white};
      background: ${COLORS.darkNavy};
    }

    .font-serif {
      font-family: 'Cormorant', Georgia, serif;
    }

    /* Page container — compact */
    .page {
      position: relative;
      width: 210mm;
      min-height: 297mm;
      padding: 36px 50px 50px;
      background: linear-gradient(135deg, ${COLORS.darkNavy} 0%, ${COLORS.navy} 50%, ${COLORS.darkNavy} 100%);
      page-break-after: always;
      overflow: hidden;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* Cover page */
    .cover {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px 50px;
    }

    .cover-logo {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 3px solid ${COLORS.gold};
      background: ${COLORS.goldLight};
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32px;
    }

    .cover-logo span {
      font-family: 'Cormorant', Georgia, serif;
      font-size: 36px;
      font-weight: 700;
      color: ${COLORS.gold};
    }

    .cover-title {
      font-family: 'Cormorant', Georgia, serif;
      font-size: 40px;
      font-weight: 700;
      color: ${COLORS.gold};
      margin-bottom: 10px;
      line-height: 1.2;
    }

    .cover-subtitle {
      font-size: 16px;
      color: ${COLORS.white80};
      margin-bottom: 40px;
      max-width: 420px;
      line-height: 1.6;
    }

    .cover-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 40px;
    }

    .cover-divider-line {
      width: 80px;
      height: 1px;
      background: linear-gradient(to right, transparent, ${COLORS.gold});
    }

    .cover-divider-line.right {
      background: linear-gradient(to left, transparent, ${COLORS.gold});
    }

    .cover-divider-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${COLORS.gold};
    }

    .cover-name {
      font-family: 'Cormorant', Georgia, serif;
      font-size: 32px;
      font-weight: 700;
      color: ${COLORS.gold};
      margin-bottom: 6px;
    }

    .cover-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: ${COLORS.white50};
      margin-bottom: 6px;
    }

    .cover-birthdate {
      font-size: 20px;
      font-weight: 600;
      color: ${COLORS.white};
      margin-bottom: 32px;
    }

    .cover-arcana-badge {
      display: inline-block;
      padding: 10px 28px;
      border: 2px solid ${COLORS.gold};
      border-radius: 50px;
      background: ${COLORS.goldLight};
      margin-bottom: 50px;
    }

    .cover-arcana-badge span {
      font-family: 'Cormorant', Georgia, serif;
      font-size: 18px;
      font-weight: 700;
      color: ${COLORS.gold};
    }

    .cover-footer {
      position: absolute;
      bottom: 30px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 10px;
      color: ${COLORS.white40};
    }

    /* Background orbs */
    .bg-orb {
      position: absolute;
      border-radius: 50%;
      background: ${COLORS.gold};
      opacity: 0.04;
      filter: blur(80px);
    }

    .bg-orb-1 { top: 10%; left: 15%; width: 300px; height: 300px; }
    .bg-orb-2 { bottom: 15%; right: 10%; width: 350px; height: 350px; }

    /* Content pages — compact */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid ${COLORS.white10};
    }

    .page-header-brand {
      font-family: 'Cormorant', Georgia, serif;
      font-size: 13px;
      color: ${COLORS.gold};
      font-weight: 700;
    }

    .page-header-arcana {
      font-size: 10px;
      color: ${COLORS.white50};
    }

    .section-number {
      font-family: 'Cormorant', Georgia, serif;
      font-size: 48px;
      font-weight: 700;
      color: ${COLORS.goldLight};
      line-height: 1;
      margin-bottom: 4px;
    }

    .section-title {
      font-family: 'Cormorant', Georgia, serif;
      font-size: 26px;
      font-weight: 700;
      color: ${COLORS.gold};
      margin-bottom: 14px;
      line-height: 1.3;
    }

    .section-text {
      font-size: 12.5px;
      line-height: 1.7;
      color: ${COLORS.white80};
      margin-bottom: 10px;
    }

    .section-text p {
      margin-bottom: 8px;
    }

    .section-text p:last-child {
      margin-bottom: 0;
    }

    /* Trait lists — compact */
    .trait-list {
      list-style: none;
      padding: 0;
      margin: 12px 0;
    }

    .trait-list li {
      position: relative;
      padding: 5px 0 5px 22px;
      font-size: 12.5px;
      line-height: 1.5;
      color: ${COLORS.white80};
      border-bottom: 1px solid ${COLORS.white10};
    }

    .trait-list li:last-child {
      border-bottom: none;
    }

    .trait-list li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 11px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${COLORS.gold};
    }

    .trait-list.negative li::before {
      background: #c0392b;
    }

    /* Highlight box — compact */
    .highlight-box {
      background: ${COLORS.goldLight};
      border-left: 3px solid ${COLORS.gold};
      padding: 14px 18px;
      margin: 14px 0;
      border-radius: 0 8px 8px 0;
    }

    .highlight-box p {
      font-size: 12.5px;
      line-height: 1.6;
      color: ${COLORS.white};
      font-style: italic;
    }

    .highlight-box.warning {
      border-left-color: #c0392b;
      background: rgba(192, 57, 43, 0.1);
    }

    /* Summary two-column */
    .summary-columns {
      display: flex;
      gap: 16px;
      margin: 14px 0;
    }

    .summary-col {
      flex: 1;
      padding: 14px;
      border-radius: 8px;
    }

    .summary-col.plus {
      background: rgba(39, 174, 96, 0.1);
      border: 1px solid rgba(39, 174, 96, 0.3);
    }

    .summary-col.minus {
      background: rgba(192, 57, 43, 0.1);
      border: 1px solid rgba(192, 57, 43, 0.3);
    }

    .summary-col-title {
      font-family: 'Cormorant', Georgia, serif;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .summary-col.plus .summary-col-title { color: #27ae60; }
    .summary-col.minus .summary-col-title { color: #c0392b; }

    .summary-col p {
      font-size: 12px;
      line-height: 1.6;
      color: ${COLORS.white80};
    }

    /* Profession list */
    .profession-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 12px 0;
    }

    .profession-tag {
      display: inline-block;
      padding: 6px 14px;
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 20px;
      background: ${COLORS.goldLight};
      font-size: 12px;
      color: ${COLORS.gold};
    }

    /* Cross-sell */
    .cross-sell-card {
      background: ${COLORS.goldLight};
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 12px;
      padding: 16px 20px;
      margin: 10px 0;
    }

    .cross-sell-card h4 {
      font-family: 'Cormorant', Georgia, serif;
      font-size: 18px;
      font-weight: 700;
      color: ${COLORS.gold};
      margin-bottom: 6px;
    }

    .cross-sell-card p {
      font-size: 12px;
      line-height: 1.6;
      color: ${COLORS.white80};
    }

    .cross-sell-price {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 14px;
      background: ${COLORS.gold};
      color: ${COLORS.darkNavy};
      font-weight: 700;
      font-size: 12px;
      border-radius: 20px;
    }

    /* Page footer */
    .page-footer {
      position: absolute;
      bottom: 24px;
      left: 50px;
      right: 50px;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: ${COLORS.white40};
    }
  `;
}

// ─── Helpers ──────────────────────────────────────────────────────

function splitTraits(text: string): string[] {
  return text
    .split(/[.]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);
}

// ─── i18n ─────────────────────────────────────────────────────────

type Locale = 'de' | 'ru';

const T = {
  de: {
    coverTitle: 'Geburtstags-Code',
    coverSubtitle: 'Karmische Numerologie — Ihre persönliche Analyse auf Basis der 22 Arkana',
    preparedFor: 'Erstellt für',
    birthdate: 'Geburtsdatum',
    arcanaLabel: 'Arkana',
    createdOn: 'Erstellt am',

    // Section 1 — Introduction
    s1Title: 'Ihr Geburtstag — Ihr persönlicher Code',
    s1p1: 'Ihr Geburtsdatum ist ein Ausgangspunkt. In Ihrem Geburtsdatum gibt es keine zufälligen Zahlen. Ihr Geburtsdatum ist ein Code, in dem ein enormes Potenzial verborgen liegt. Jede Ziffer darin ist wichtig.',
    s1p2: 'Der Geburtstag ist Ihre Visitenkarte. Er ist der erste Eindruck von Ihnen als Persönlichkeit. Es sind Ihre Talente und Fähigkeiten, Ihr Potenzial, das es zu entfalten gilt. Es ist gesammelte Erfahrung aus der Vergangenheit und entsprechend auch Ihre Fehler der Vergangenheit.',
    s1p3: (name: string, num: number) =>
      `Ihr Geburtstag wird über die Arkana berechnet. Bei einem Tag über 22 wird 22 abgezogen, um die Energie zu bestimmen, mit der Sie gekommen sind. Ihre Arkana ist <strong style="color: ${COLORS.gold};">${name}</strong> (${num}).`,
    s1arcana: (meaning: string) => meaning,
    s1highlight: 'Die Qualitäten dieser Arkana sind das, womit Sie in dieses Leben gekommen sind. Sie können sich positiv oder negativ manifestieren — und davon hängt ab, wie Ihre Mitmenschen Sie wahrnehmen.',

    // Section 2 — Positive traits
    s2Title: 'Ihre Stärken — wie Menschen Sie im Plus sehen',
    s2intro: (name: string) =>
      `Da jede Zahl und jede Energie sowohl negative als auch positive Eigenschaften hervorbringen kann, ist es wichtig zu verstehen: Die Aufgabe besteht darin, die negativen Charakterzüge in positive Qualitäten umzuwandeln. Wenn Sie die Energie der Arkana <strong style="color: ${COLORS.gold};">${name}</strong> im Plus leben, sehen Menschen in Ihnen eine helle, kommunikative Persönlichkeit:`,

    // Section 3 — Negative traits
    s3Title: 'Was Sie vermeiden sollten',
    s3intro: (name: string) =>
      `Jede Arkana hat auch eine Schattenseite. Wenn die Energie von <strong style="color: #c0392b;">${name}</strong> sich im Minus zeigt, kann das zu folgenden Problemen führen. Bewusstsein ist der erste Schritt zur Veränderung:`,
    s3devPeriod: 'Entwicklungsperiode:',

    // Section 4 — Professions
    s4Title: 'Berufe aus dem Geburtstags-Code',
    s4intro: (name: string) =>
      `Nach dem Geburtstags-Code wählen wir in der Regel unseren ersten Beruf. Die Arkana <strong style="color: ${COLORS.gold};">${name}</strong> gibt Ihnen den Wunsch, sich in Berufen zu verwirklichen, die mit dem Wort verbunden sind:`,
    s4more: 'Eine detailliertere Analyse Ihrer beruflichen Stärken und konkreten Aufgaben erhalten Sie durch die klassische Pythagoras-Psychomatrix, in der wir die konkreten beruflichen Aufgaben, Hauptressourcen und Qualitäten sehen, die Ihnen helfen, Ihr Potenzial und Ihre Bestimmung zu entfalten.',

    // Section 5 — Cross-sell
    crossSellTitle: 'Entdecken Sie weitere Aspekte Ihres Geburtsdatums',
    crossSellIntro: 'Der Geburtstags-Code ist nur die erste Schicht. Entdecken Sie weitere Codes Ihrer karmischen Karte:',
    crossSell1Title: 'Selbstverwirklichungs-Code',
    crossSell1Text: 'In welchem Bereich können Sie sich maximal entfalten? Welche Berufe und Richtungen passen zu Ihnen?',
    crossSell2Title: 'Karmischer-Knoten-Code',
    crossSell2Text: 'Welche Fehler aus der Vergangenheit tragen Sie mit sich? Welche Prüfungen und Herausforderungen erwarten Sie?',
    crossSell3Title: 'Jahresprognose',
    crossSell3Text: 'Welche Energien erwarten Sie im kommenden Jahr? Welche Monate sind günstig, welche herausfordernd?',
    crossSellBundle: '<strong>Alle 4 Produkte zusammen:</strong> Komplette karmische Karte für 35 EUR (statt 40 EUR). Schreiben Sie uns: <strong style="color: ' + COLORS.gold + ';">info@numerologie-pro.de</strong>',
    learnMore: 'Erfahren Sie mehr',
    birthdayCode: 'Geburtstags-Code',
  },
  ru: {
    coverTitle: 'Код дня рождения',
    coverSubtitle: 'Кармическая нумерология — ваш персональный анализ на основе 22 арканов',
    preparedFor: 'Подготовлено для',
    birthdate: 'Дата рождения',
    arcanaLabel: 'Аркан',
    createdOn: 'Создано',

    // Section 1 — Introduction
    s1Title: 'Ваш день рождения — ваш персональный код',
    s1p1: 'Дата рождения — это некая точка отсчёта. В нашей дате рождения нет случайных чисел. Дата нашего рождения — это код, в котором скрыт огромный потенциал. В нём важна каждая цифра.',
    s1p2: 'День рождения — это наша визитная карточка. Это первое впечатление о нас как о личности. Это наши таланты и способности, наш потенциал, который нужно раскрыть. Это наработанный опыт в прошлом и, соответственно, наши ошибки прошлого.',
    s1p3: (name: string, num: number) =>
      `День рождения рассчитывается через арканы. Если число дня рождения превышает 22, то отнимается 22, чтобы узнать, с какой энергией вы пришли. Ваш аркан — <strong style="color: ${COLORS.gold};">${name}</strong> (${num}).`,
    s1arcana: (meaning: string) => meaning,
    s1highlight: 'Качества этого аркана — это то, с чем вы пришли в эту жизнь. Они могут проявляться в плюсе или в минусе, и от этого зависит, как вас будут воспринимать окружающие.',

    // Section 2 — Positive traits
    s2Title: 'Ваши сильные стороны — как вас видят в плюсе',
    s2intro: (name: string) =>
      `Так как каждое число и каждая энергия могут проявляться как отрицательные, так и положительные качества, важно понимать, что задача воплощения заключается в том, чтобы свои отрицательные черты характера переводить в положительные качества. Если вы проявляете себя по положительной характеристике аркана <strong style="color: ${COLORS.gold};">${name}</strong>, то человек видит в вас яркую, коммуникативную личность:`,

    // Section 3 — Negative traits
    s3Title: 'Чего вам следует избегать',
    s3intro: (name: string) =>
      `Каждый аркан имеет и теневую сторону. Когда энергия <strong style="color: #c0392b;">${name}</strong> проявляется в минусе, это может привести к следующим проблемам. Осознание — первый шаг к изменению:`,
    s3devPeriod: 'Период развития:',

    // Section 4 — Professions
    s4Title: 'Профессии по коду дня рождения',
    s4intro: (name: string) =>
      `По коду дня рождения мы, как правило, выбираем первую профессию. Аркан <strong style="color: ${COLORS.gold};">${name}</strong> — эта энергия даёт вам желание проявиться в профессии, которая связана со словом:`,
    s4more: 'Более подробную информацию раскрывает классическая Психоматрица Пифагора, в которой мы уже видим конкретные задачи профессии, основные ресурсы и качества, которые помогают прийти и раскрыть свой потенциал и своё предназначение.',

    // Section 5 — Cross-sell
    crossSellTitle: 'Узнайте другие аспекты вашей даты рождения',
    crossSellIntro: 'Код дня рождения — это лишь первый слой. Откройте следующие коды вашей кармической карты:',
    crossSell1Title: 'Код самореализации',
    crossSell1Text: 'В какой сфере вы можете реализоваться по максимуму? Какие профессии и направления вам подходят?',
    crossSell2Title: 'Код кармического узла',
    crossSell2Text: 'Какие ошибки из прошлого вы несёте с собой? Какие проверки и испытания ждут вас в этой жизни?',
    crossSell3Title: 'Прогноз на год',
    crossSell3Text: 'Какие энергии ждут вас в ближайшем году? Какие месяцы будут благоприятными, а какие — сложными?',
    crossSellBundle: '<strong>Все 4 продукта вместе:</strong> Полная кармическая карта за 35 EUR (вместо 40 EUR). Напишите нам: <strong style="color: ' + COLORS.gold + ';">info@numerologie-pro.de</strong>',
    learnMore: 'Узнайте больше',
    birthdayCode: 'Код дня рождения',
  },
};

// ─── HTML Generators ──────────────────────────────────────────────

function generateCoverPage(
  result: BirthdayCodeResult,
  customerName: string,
  birthdate: string,
  locale: Locale
): string {
  const t = T[locale];
  const today = new Date().toLocaleDateString(getDateLocale(locale), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return `
    <div class="page cover">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>

      <div class="cover-logo">
        <span>NP</span>
      </div>

      <div class="cover-title">${t.coverTitle}</div>
      <div class="cover-subtitle">${t.coverSubtitle}</div>

      <div class="cover-divider">
        <div class="cover-divider-line"></div>
        <div class="cover-divider-dot"></div>
        <div class="cover-divider-line right"></div>
      </div>

      <div class="cover-label">${t.preparedFor}</div>
      <div class="cover-name">${customerName}</div>

      <div class="cover-label" style="margin-top: 20px;">${t.birthdate}</div>
      <div class="cover-birthdate">${birthdate}</div>

      <div class="cover-arcana-badge">
        <span>${t.arcanaLabel} ${result.arcanaNumber} — ${result.arcana.name}</span>
      </div>

      <div class="cover-footer">
        ${t.createdOn} ${today} &nbsp;·&nbsp; numerologie-pro.de
      </div>
    </div>
  `;
}

function generateIntroPage(result: BirthdayCodeResult, locale: Locale): string {
  const t = T[locale];
  return `
    <div class="page">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>

      <div class="page-header">
        <span class="page-header-brand">NUMEROLOGIE PRO</span>
        <span class="page-header-arcana">${t.arcanaLabel} ${result.arcanaNumber} — ${result.arcana.name}</span>
      </div>

      <div class="section-number">01</div>
      <div class="section-title">${t.s1Title}</div>

      <div class="section-text">
        <p>${t.s1p1}</p>
        <p>${t.s1p2}</p>
        <p>${t.s1p3(result.arcana.name, result.arcanaNumber)}</p>
      </div>

      <div class="highlight-box" style="margin-top: 16px;">
        <p>${t.s1arcana(result.arcana.generalMeaning)}</p>
      </div>

      <div class="section-text" style="margin-top: 14px;">
        <p>${t.s1highlight}</p>
      </div>

      <div class="page-footer">
        <span>${t.birthdayCode} — ${result.arcana.name}</span>
        <span>2</span>
      </div>
    </div>
  `;
}

function generatePositiveTraitsPage(result: BirthdayCodeResult, locale: Locale): string {
  const t = T[locale];
  const traits = splitTraits(result.arcana.positiveTraits);
  const traitItems = traits.map((tr) => `<li>${tr}</li>`).join('\n');

  return `
    <div class="page">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>

      <div class="page-header">
        <span class="page-header-brand">NUMEROLOGIE PRO</span>
        <span class="page-header-arcana">${t.arcanaLabel} ${result.arcanaNumber} — ${result.arcana.name}</span>
      </div>

      <div class="section-number">02</div>
      <div class="section-title">${t.s2Title}</div>

      <div class="section-text">
        <p>${t.s2intro(result.arcana.name)}</p>
      </div>

      <ul class="trait-list">
        ${traitItems}
      </ul>

      <div class="page-footer">
        <span>${t.birthdayCode} — ${result.arcana.name}</span>
        <span>3</span>
      </div>
    </div>
  `;
}

function generateNegativeTraitsPage(result: BirthdayCodeResult, locale: Locale): string {
  const t = T[locale];
  const traits = splitTraits(result.arcana.negativeTraits);
  const traitItems = traits.map((tr) => `<li>${tr}</li>`).join('\n');

  return `
    <div class="page">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>

      <div class="page-header">
        <span class="page-header-brand">NUMEROLOGIE PRO</span>
        <span class="page-header-arcana">${t.arcanaLabel} ${result.arcanaNumber} — ${result.arcana.name}</span>
      </div>

      <div class="section-number">03</div>
      <div class="section-title">${t.s3Title}</div>

      <div class="section-text">
        <p>${t.s3intro(result.arcana.name)}</p>
      </div>

      <ul class="trait-list negative">
        ${traitItems}
      </ul>

      ${result.arcana.psychologicalProblems ? `
      <div class="highlight-box warning">
        <p>
          <strong>${t.s3devPeriod}</strong> ${result.arcana.psychologicalProblems}
        </p>
      </div>
      ` : ''}

      <div class="page-footer">
        <span>${t.birthdayCode} — ${result.arcana.name}</span>
        <span>4</span>
      </div>
    </div>
  `;
}

function generateProfessionsPage(result: BirthdayCodeResult, locale: Locale): string {
  const t = T[locale];

  // Split professions into tags
  const profList = result.arcana.professions
    .split(/[,.]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
  const profTags = profList.map((p) => `<span class="profession-tag">${p}</span>`).join('\n');

  // Karmic task as guiding text
  const taskText = result.arcana.karmicTask;

  return `
    <div class="page">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>

      <div class="page-header">
        <span class="page-header-brand">NUMEROLOGIE PRO</span>
        <span class="page-header-arcana">${t.arcanaLabel} ${result.arcanaNumber} — ${result.arcana.name}</span>
      </div>

      <div class="section-number">04</div>
      <div class="section-title">${t.s4Title}</div>

      <div class="section-text">
        <p>${t.s4intro(result.arcana.name)}</p>
      </div>

      <div class="profession-grid">
        ${profTags}
      </div>

      <div class="highlight-box" style="margin-top: 16px;">
        <p>${taskText}</p>
      </div>

      <div class="section-text" style="margin-top: 14px;">
        <p>${t.s4more}</p>
      </div>

      <div class="page-footer">
        <span>${t.birthdayCode} — ${result.arcana.name}</span>
        <span>5</span>
      </div>
    </div>
  `;
}

function generateCrossSellPage(result: BirthdayCodeResult, locale: Locale): string {
  const t = T[locale];
  return `
    <div class="page">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>

      <div class="page-header">
        <span class="page-header-brand">NUMEROLOGIE PRO</span>
        <span class="page-header-arcana">${t.learnMore}</span>
      </div>

      <div class="section-number">&#10022;</div>
      <div class="section-title">${t.crossSellTitle}</div>

      <div class="section-text">
        <p>${t.crossSellIntro}</p>
      </div>

      <div class="cross-sell-card">
        <h4>${t.crossSell1Title}</h4>
        <p>${t.crossSell1Text}</p>
        <span class="cross-sell-price">10 EUR</span>
      </div>

      <div class="cross-sell-card">
        <h4>${t.crossSell2Title}</h4>
        <p>${t.crossSell2Text}</p>
        <span class="cross-sell-price">10 EUR</span>
      </div>

      <div class="cross-sell-card">
        <h4>${t.crossSell3Title}</h4>
        <p>${t.crossSell3Text}</p>
        <span class="cross-sell-price">10 EUR</span>
      </div>

      <div class="highlight-box" style="margin-top: 16px; text-align: center;">
        <p>${t.crossSellBundle}</p>
      </div>

      <div class="page-footer">
        <span>numerologie-pro.de</span>
        <span>6</span>
      </div>
    </div>
  `;
}

// ─── Main PDF Generator ───────────────────────────────────────────

export async function generateBirthdayCodePDF(
  day: number,
  customerName: string,
  birthdate: string,
  locale: Locale = 'ru'
): Promise<Buffer> {
  const result = calculateBirthdayCode(day, locale);

  const pages = [
    generateCoverPage(result, customerName, birthdate, locale),
    generateIntroPage(result, locale),
    generatePositiveTraitsPage(result, locale),
    generateNegativeTraitsPage(result, locale),
    generateProfessionsPage(result, locale),
    generateCrossSellPage(result, locale),
  ];

  const htmlLang = locale === 'de' ? 'de' : 'ru';
  const fullHTML = `
    <!DOCTYPE html>
    <html lang="${htmlLang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Cormorant:wght@400;700&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
        <style>${getStyles()}</style>
      </head>
      <body>
        ${pages.join('\n')}
      </body>
    </html>
  `;

  const executablePath = await chromium.executablePath();
  const browser = await puppeteer.launch({
    args: [...chromium.args, '--disable-gpu', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1920, height: 1080 },
    executablePath,
    headless: true,
    timeout: 30_000,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(fullHTML, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      preferCSSPageSize: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
