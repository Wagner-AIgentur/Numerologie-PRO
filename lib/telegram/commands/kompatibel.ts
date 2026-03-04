import { sendMessage, inlineKeyboard, button } from '@/lib/telegram/bot';
import { calculateCompatibility, getOverallText } from '@/lib/numerology/compatibility';
import * as i18n from '@/lib/telegram/i18n';

/**
 * /kompatibel — prompts for two birthdates
 */
export async function handleKompatibel(chatId: number, locale: 'de' | 'ru') {
  await sendMessage({
    chat_id: chatId,
    text: i18n.compatAsk(locale),
  });
}

/**
 * Process two dates and return compatibility result.
 */
export async function handleKompatibelDates(chatId: number, text: string, locale: 'de' | 'ru') {
  const [d1, d2] = text.split(',').map((s) => s.trim());
  const p1 = parseDate(d1);
  const p2 = parseDate(d2);

  if (!p1 || !p2) {
    await sendMessage({ chat_id: chatId, text: i18n.analyseInvalidDate(locale) });
    return;
  }

  const result = calculateCompatibility(
    { day: p1.day, month: p1.month, year: p1.year },
    { day: p2.day, month: p2.month, year: p2.year },
  );

  const levelLabels: Record<string, { de: string; ru: string }> = {
    excellent: { de: 'Ausgezeichnet', ru: 'Отлично' },
    good: { de: 'Gut', ru: 'Хорошо' },
    moderate: { de: 'Moderat', ru: 'Умеренно' },
    challenging: { de: 'Herausfordernd', ru: 'Сложно' },
  };

  const levelLabel = levelLabels[result.overallLevel]?.[locale] ?? result.overallLevel;
  const summary = getOverallText(result.overallLevel, locale);

  await sendMessage({
    chat_id: chatId,
    text: i18n.compatResult(result.overallScore, levelLabel, summary)(locale),
    reply_markup: inlineKeyboard([
      button(i18n.compatBuy(locale), {
        url: `https://numerologie-pro.com/${locale}/pakete`,
      }),
    ]),
  });
}

function parseDate(s: string): { day: number; month: number; year: number } | null {
  if (!s) return null;
  const parts = s.split('.');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2030) return null;
  return { day, month, year };
}
