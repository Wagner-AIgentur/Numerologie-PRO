import { baseTemplate, goldButton, heading, paragraph, infoBox } from './base';
import { getPositionTieredInterpretation } from '@/lib/numerology/interpret';

const CAL_URL = 'https://cal.com/swetlana-wagner-vn81pp/бесплатная-консультация';

const positionNames: Record<number, { de: string; ru: string }> = {
  1: { de: 'Charakter & Willenskraft', ru: 'Характер и сила воли' },
  2: { de: 'Energie & Bioenergie', ru: 'Энергия и биоэнергия' },
  3: { de: 'Kreativität & Interessen', ru: 'Творчество и интересы' },
  4: { de: 'Gesundheit', ru: 'Здоровье' },
  5: { de: 'Logik & Intuition', ru: 'Логика и интуиция' },
  6: { de: 'Arbeit & Handwerk', ru: 'Труд и мастерство' },
  7: { de: 'Glück & Schicksal', ru: 'Удача и судьба' },
  8: { de: 'Pflicht & Verantwortung', ru: 'Долг и ответственность' },
  9: { de: 'Intelligenz & Gedächtnis', ru: 'Интеллект и память' },
};

function digitRepeat(position: number, count: number): string {
  if (count === 0) return '—';
  return String(position).repeat(count);
}

function matrixGridHtml(grid: Record<number, number[]>): string {
  // Layout: 3x3 grid
  // Row 1: positions 1, 4, 7
  // Row 2: positions 2, 5, 8
  // Row 3: positions 3, 6, 9
  const rows = [
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
  ];

  const rowsHtml = rows.map((row) => {
    const cells = row.map((pos) => {
      const count = grid[pos]?.length ?? 0;
      const display = digitRepeat(pos, count);
      return `<td align="center" style="width:33.33%; padding:12px 8px; border:1px solid #2a4a3a; font-family:'Cormorant Garamond',Georgia,serif; font-size:22px; font-weight:700; color:#D4AF37; letter-spacing:2px;">${display}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('\n    ');

  return `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#051a24; border-radius:12px; border:1px solid #2a4a3a; border-collapse:collapse; margin:20px 0;">
    ${rowsHtml}
  </table>`;
}

function positionDetailHtml(
  position: number,
  count: number,
  locale: 'de' | 'ru'
): string {
  const interp = getPositionTieredInterpretation(position, count, locale);
  const name = positionNames[position]?.[locale] ?? '';
  const display = digitRepeat(position, count);

  const strengthColors: Record<string, string> = {
    none: '#5e5c54',
    weak: '#b87333',
    normal: '#D4AF37',
    strong: '#ECC558',
    dominant: '#FFD700',
  };
  const strengthColor = strengthColors[interp.strength] ?? '#D4AF37';

  return `<tr>
    <td style="padding:16px 0; border-bottom:1px solid #143028;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td width="56" valign="top">
            <div style="width:44px; height:44px; border-radius:10px; background:#102c28; border:1px solid #2a4a3a; text-align:center; line-height:44px; font-family:'Cormorant Garamond',Georgia,serif; font-size:18px; font-weight:700; color:#D4AF37;">
              ${display}
            </div>
          </td>
          <td valign="top">
            <p style="font-family:'Cormorant Garamond',Georgia,serif; font-size:17px; font-weight:600; color:${strengthColor}; margin:0 0 4px; line-height:1.3;">
              ${name}
            </p>
            <p style="font-family:'Montserrat',Arial,sans-serif; font-size:13px; color:#b3b0a5; line-height:1.7; margin:0;">
              ${interp.teaser}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export function leadAnalysisResultsEmail({
  language = 'de',
  matrixData,
  birthdate,
}: {
  language: 'de' | 'ru';
  matrixData: any;
  birthdate: string;
}): { subject: string; html: string } {
  const isDE = language === 'de';
  const locale = language;

  const subject = isDE
    ? 'Deine persönliche Psychomatrix-Analyse'
    : 'Ваш персональный анализ психоматрицы';

  const grid: Record<number, number[]> = matrixData.grid ?? {};
  const workingNumbers: number[] = matrixData.workingNumbers ?? [0, 0, 0, 0];
  const schicksalszahl = workingNumbers[1] ?? 0;

  // --- Build content sections ---

  const greetingSection = `
    ${heading(isDE ? 'Deine Psychomatrix-Analyse' : 'Ваш анализ психоматрицы')}
    ${paragraph(isDE
      ? `Geburtsdatum: <strong style="color:#D4AF37;">${birthdate}</strong>`
      : `Дата рождения: <strong style="color:#D4AF37;">${birthdate}</strong>`
    )}
  `;

  const schicksalSection = infoBox(`
    <p style="font-family:'Montserrat',Arial,sans-serif; font-size:12px; font-weight:500; color:#8a8778; letter-spacing:2px; text-transform:uppercase; margin:0 0 8px;">
      ${isDE ? 'Deine Schicksalszahl' : 'Ваше число судьбы'}
    </p>
    <p style="font-family:'Cormorant Garamond',Georgia,serif; font-size:48px; font-weight:700; color:#D4AF37; margin:0; line-height:1;">
      ${schicksalszahl}
    </p>
  `);

  const workingNumbersSection = infoBox(`
    <p style="font-family:'Montserrat',Arial,sans-serif; font-size:12px; font-weight:500; color:#8a8778; letter-spacing:2px; text-transform:uppercase; margin:0 0 12px;">
      ${isDE ? 'Arbeitszahlen' : 'Рабочие числа'}
    </p>
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:4px;">
          <span style="font-family:'Montserrat',Arial,sans-serif; font-size:11px; color:#8a8778;">I</span><br/>
          <span style="font-family:'Cormorant Garamond',Georgia,serif; font-size:24px; font-weight:700; color:#D4AF37;">${workingNumbers[0]}</span>
        </td>
        <td align="center" style="padding:4px;">
          <span style="font-family:'Montserrat',Arial,sans-serif; font-size:11px; color:#8a8778;">II</span><br/>
          <span style="font-family:'Cormorant Garamond',Georgia,serif; font-size:24px; font-weight:700; color:#D4AF37;">${workingNumbers[1]}</span>
        </td>
        <td align="center" style="padding:4px;">
          <span style="font-family:'Montserrat',Arial,sans-serif; font-size:11px; color:#8a8778;">III</span><br/>
          <span style="font-family:'Cormorant Garamond',Georgia,serif; font-size:24px; font-weight:700; color:#D4AF37;">${workingNumbers[2]}</span>
        </td>
        <td align="center" style="padding:4px;">
          <span style="font-family:'Montserrat',Arial,sans-serif; font-size:11px; color:#8a8778;">IV</span><br/>
          <span style="font-family:'Cormorant Garamond',Georgia,serif; font-size:24px; font-weight:700; color:#D4AF37;">${workingNumbers[3]}</span>
        </td>
      </tr>
    </table>
  `);

  const matrixSection = `
    <div style="margin:28px 0 8px;">
      <p style="font-family:'Cormorant Garamond',Georgia,serif; font-size:20px; font-weight:600; color:#D4AF37; margin:0 0 4px;">
        ${isDE ? 'Deine 3×3 Psychomatrix' : 'Ваша психоматрица 3×3'}
      </p>
    </div>
    ${matrixGridHtml(grid)}
  `;

  // Position details
  let positionRows = '';
  for (let pos = 1; pos <= 9; pos++) {
    const count = grid[pos]?.length ?? 0;
    positionRows += positionDetailHtml(pos, count, locale);
  }

  const detailSection = `
    <div style="margin:32px 0 12px;">
      <p style="font-family:'Cormorant Garamond',Georgia,serif; font-size:20px; font-weight:600; color:#D4AF37; margin:0 0 4px;">
        ${isDE ? 'Deine 9 Positionen im Detail' : 'Ваши 9 позиций подробно'}
      </p>
    </div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      ${positionRows}
    </table>
  `;

  const ctaSection = `
    ${paragraph(isDE
      ? 'Möchtest du verstehen, wie all diese Zahlen zusammenwirken und was sie für <strong style="color:#D4AF37;">dein Leben konkret bedeuten</strong>? In einer persönlichen Beratung gehe ich mit dir tief in deine Matrix.'
      : 'Хотите понять, как все эти числа взаимодействуют и что они <strong style="color:#D4AF37;">конкретно значат для вашей жизни</strong>? На персональной консультации мы подробно разберём вашу матрицу.'
    )}
    ${goldButton(
      isDE ? 'Persönliche Beratung buchen' : 'Записаться на консультацию',
      CAL_URL
    )}
    ${goldButton(
      isDE ? 'Zurück zum Rechner' : 'Вернуться к калькулятору',
      `https://numerologie-pro.com/${locale}/rechner`
    )}
  `;

  const content = `
    ${greetingSection}
    ${schicksalSection}
    ${workingNumbersSection}
    ${matrixSection}
    ${detailSection}
    ${ctaSection}
  `;

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: isDE
        ? `Deine Schicksalszahl ist ${schicksalszahl} — entdecke, was deine Zahlen verraten.`
        : `Ваше число судьбы — ${schicksalszahl}. Узнайте, что говорят ваши числа.`,
      content,
    }),
  };
}
