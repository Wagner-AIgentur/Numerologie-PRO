import { adminClient } from '@/lib/supabase/admin';
import { sendMessage } from '@/lib/telegram/bot';
import * as i18n from '@/lib/telegram/i18n';

/**
 * /heute — Personal day number based on linked birthdate + today's date
 */
export async function handleHeute(chatId: number, locale: 'de' | 'ru') {
  // Get linked profile's birthdate
  const { data: profile } = await adminClient
    .from('profiles')
    .select('birthdate')
    .eq('telegram_chat_id', chatId)
    .single();

  if (!profile?.birthdate) {
    await sendMessage({ chat_id: chatId, text: i18n.heuteNoBirthdate(locale) });
    return;
  }

  const [year, month, day] = profile.birthdate.split('-').map(Number);
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayYear = today.getFullYear();

  // Personal day number = reduce(day of birth + month of birth + current date digits)
  const personalDay = reduceToSingle(day + month + todayDay + todayMonth + todayYear);

  const description = getDayDescription(personalDay, locale);

  await sendMessage({
    chat_id: chatId,
    text: i18n.heuteResult(personalDay, description)(locale),
  });
}

function reduceToSingle(n: number): number {
  let sum = n;
  while (sum > 9) {
    sum = sum.toString().split('').reduce((a, d) => a + parseInt(d), 0);
  }
  return sum;
}

function getDayDescription(num: number, locale: 'de' | 'ru'): string {
  const descriptions: Record<number, { de: string; ru: string }> = {
    1: {
      de: '🔥 Heute ist ein Tag der Initiative! Starte neue Projekte, triff mutige Entscheidungen. Die Energie unterstützt Eigeninitiative und Führung.',
      ru: '🔥 Сегодня день инициативы! Начинай новые проекты, принимай смелые решения. Энергия поддерживает лидерство.',
    },
    2: {
      de: '🤝 Ein Tag der Zusammenarbeit und Diplomatie. Pflege deine Beziehungen, höre zu und finde Kompromisse. Geduld wird belohnt.',
      ru: '🤝 День сотрудничества и дипломатии. Заботься об отношениях, слушай и ищи компромиссы. Терпение будет вознаграждено.',
    },
    3: {
      de: '🎨 Kreativität und Lebensfreude dominieren! Drücke dich aus, kommuniziere und genieße den Moment. Ideal für kreative Projekte und geselliges Beisammensein.',
      ru: '🎨 Творчество и радость жизни доминируют! Выражай себя, общайся и наслаждайся моментом. Идеально для творческих проектов.',
    },
    4: {
      de: '🏗️ Ein Tag für Struktur und harte Arbeit. Organisiere dich, erledige liegengebliebene Aufgaben. Disziplin bringt heute die besten Ergebnisse.',
      ru: '🏗️ День структуры и упорной работы. Организуй себя, доделай отложенные задачи. Дисциплина сегодня принесёт лучшие результаты.',
    },
    5: {
      de: '🌊 Veränderung liegt in der Luft! Sei offen für Neues, reise, lerne, experimentiere. Heute ist Flexibilität dein größter Vorteil.',
      ru: '🌊 Перемены витают в воздухе! Будь открыт(а) новому, путешествуй, учись, экспериментируй. Сегодня гибкость — твоё преимущество.',
    },
    6: {
      de: '🏡 Familie und Verantwortung stehen im Fokus. Kümmere dich um deine Liebsten, schaffe Harmonie zu Hause. Ein guter Tag für Versöhnung.',
      ru: '🏡 Семья и ответственность в фокусе. Позаботься о близких, создай гармонию дома. Хороший день для примирения.',
    },
    7: {
      de: '🔍 Ein Tag der inneren Einkehr. Meditiere, lerne, reflektiere. Deine Intuition ist heute besonders stark — vertraue ihr.',
      ru: '🔍 День внутреннего погружения. Медитируй, учись, размышляй. Твоя интуиция сегодня особенно сильна — доверяй ей.',
    },
    8: {
      de: '💰 Finanzen und Karriere stehen im Vordergrund. Triff geschäftliche Entscheidungen, verhandle und plane langfristig. Die Energie unterstützt materiellen Erfolg.',
      ru: '💰 Финансы и карьера на первом плане. Принимай деловые решения, договаривайся и планируй долгосрочно. Энергия поддерживает материальный успех.',
    },
    9: {
      de: '🌟 Ein Tag des Abschlusses und der Großzügigkeit. Lass los, was nicht mehr dient, und hilf anderen. Mitgefühl und Weisheit führen dich heute.',
      ru: '🌟 День завершения и щедрости. Отпусти то, что больше не служит, и помоги другим. Сострадание и мудрость ведут тебя сегодня.',
    },
  };

  return descriptions[num]?.[locale] ?? descriptions[1]![locale];
}
