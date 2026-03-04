import { sendMessage, inlineKeyboard, button } from '@/lib/telegram/bot';
import { calculateMatrix } from '@/lib/numerology/calculate';
import * as i18n from '@/lib/telegram/i18n';

/**
 * /analyse — prompts for birthdate
 */
export async function handleAnalyse(chatId: number, locale: 'de' | 'ru') {
  await sendMessage({
    chat_id: chatId,
    text: i18n.analyseAsk(locale),
  });
}

/**
 * Process a birthdate string and return the mini-analysis.
 * Called when user sends a date as free text after /analyse.
 */
export async function handleAnalyseDate(chatId: number, dateStr: string, locale: 'de' | 'ru') {
  const parsed = parseDate(dateStr);
  if (!parsed) {
    await sendMessage({ chat_id: chatId, text: i18n.analyseInvalidDate(locale) });
    return;
  }

  const { day, month, year } = parsed;
  const matrix = calculateMatrix(day, month, year);

  // Destiny number = digit sum of birthdate reduced to single digit
  const destinyNumber = reduceToSingle(day + month + year);

  // Get short interpretation for the destiny number
  const description = getDestinyDescription(destinyNumber, locale);

  await sendMessage({
    chat_id: chatId,
    text: i18n.analyseResult(destinyNumber, description)(locale),
    reply_markup: inlineKeyboard([
      button(i18n.analyseBuyPdf(locale), {
        url: `https://numerologie-pro.com/${locale}/pakete`,
      }),
      button(locale === 'de' ? '📊 Vollständige Matrix' : '📊 Полная матрица', {
        callback_data: `matrix_${day}_${month}_${year}`,
      }),
    ]),
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────

function parseDate(s: string): { day: number; month: number; year: number } | null {
  const parts = s.split('.');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2030) return null;
  return { day, month, year };
}

function reduceToSingle(n: number): number {
  let sum = n;
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((a, d) => a + parseInt(d), 0);
  }
  return sum;
}

/** Short destiny number descriptions (3-4 sentences) */
function getDestinyDescription(num: number, locale: 'de' | 'ru'): string {
  const descriptions: Record<number, { de: string; ru: string }> = {
    1: {
      de: 'Du bist ein geborener Anführer mit starkem Willen. Unabhängigkeit und Originalität zeichnen dich aus. Dein Lebensweg fordert dich auf, den Mut zu haben, deinen eigenen Weg zu gehen.',
      ru: 'Ты прирождённый лидер с сильной волей. Тебя отличают независимость и оригинальность. Твой жизненный путь призывает тебя идти своей дорогой.',
    },
    2: {
      de: 'Diplomatie und Harmonie sind deine Stärken. Du bist ein natürlicher Vermittler und findest immer den Mittelweg. Beziehungen und Partnerschaften spielen eine zentrale Rolle in deinem Leben.',
      ru: 'Дипломатия и гармония — твои сильные стороны. Ты прирождённый посредник. Отношения и партнёрство играют центральную роль в твоей жизни.',
    },
    3: {
      de: 'Kreativität und Ausdruckskraft sind deine Superkräfte. Du inspirierst andere mit deiner Lebensfreude. Kunst, Kommunikation und soziale Kontakte sind dein Element.',
      ru: 'Творчество и выразительность — твои суперсилы. Ты вдохновляешь других своей жизнерадостностью. Искусство, общение и социальные контакты — твоя стихия.',
    },
    4: {
      de: 'Stabilität und Struktur sind dein Fundament. Du baust mit Geduld und Ausdauer solide Grundlagen. Disziplin und harte Arbeit führen dich zum Erfolg.',
      ru: 'Стабильность и структура — твой фундамент. Ты строишь прочную основу с терпением и выносливостью. Дисциплина и упорный труд ведут тебя к успеху.',
    },
    5: {
      de: 'Freiheit und Abenteuer treiben dich an. Du liebst Veränderung und neue Erfahrungen. Deine Anpassungsfähigkeit macht dich zu einem Meister des Wandels.',
      ru: 'Свобода и приключения движут тобой. Ты любишь перемены и новый опыт. Твоя адаптивность делает тебя мастером перемен.',
    },
    6: {
      de: 'Verantwortung und Fürsorge definieren deinen Weg. Du bist der Fels in der Brandung für Familie und Freunde. Liebe und Harmonie im Heim sind dir am wichtigsten.',
      ru: 'Ответственность и забота определяют твой путь. Ты — скала для семьи и друзей. Любовь и гармония в доме для тебя важнее всего.',
    },
    7: {
      de: 'Weisheit und Spiritualität leiten dich. Du bist ein Wahrheitssucher mit scharfem Verstand. Innere Erkenntnis und Analyse sind deine natürlichen Talente.',
      ru: 'Мудрость и духовность ведут тебя. Ты искатель истины с острым умом. Внутреннее познание и анализ — твои природные таланты.',
    },
    8: {
      de: 'Erfolg und materieller Wohlstand sind in deiner Energie verankert. Du hast ein natürliches Talent für Geschäfte und Finanzen. Macht und Verantwortung gehen bei dir Hand in Hand.',
      ru: 'Успех и материальное благополучие заложены в твоей энергии. У тебя природный талант к бизнесу и финансам. Власть и ответственность идут рука об руку.',
    },
    9: {
      de: 'Mitgefühl und Weitsicht machen dich zum Humanisten. Du siehst das große Bild und willst die Welt besser machen. Dein Lebensweg ruft dich zum Dienst an anderen.',
      ru: 'Сострадание и дальновидность делают тебя гуманистом. Ты видишь общую картину и хочешь сделать мир лучше. Твой жизненный путь призывает тебя служить другим.',
    },
    11: {
      de: 'Du trägst die Meisterzahl 11 — höhere Intuition und spirituelle Führung. Du bist ein Visionär, der andere mit seiner Energie inspiriert und erleuchtet.',
      ru: 'Ты несёшь мастер-число 11 — высшая интуиция и духовное руководство. Ты визионер, вдохновляющий других своей энергией.',
    },
    22: {
      de: 'Die Meisterzahl 22 — der Meisterbaumeister. Du hast die Fähigkeit, große Visionen in die Realität umzusetzen. Dein Potenzial für Erfolg ist außergewöhnlich.',
      ru: 'Мастер-число 22 — мастер-строитель. У тебя есть способность воплощать великие замыслы в реальность. Твой потенциал для успеха исключителен.',
    },
    33: {
      de: 'Die Meisterzahl 33 — der Meisterheiler. Du bist hier, um durch bedingungslose Liebe und Mitgefühl zu lehren und zu heilen.',
      ru: 'Мастер-число 33 — мастер-целитель. Ты здесь, чтобы учить и исцелять через безусловную любовь и сострадание.',
    },
  };

  return descriptions[num]?.[locale] ?? descriptions[1]![locale];
}
