import { adminClient } from '@/lib/supabase/admin';
import { sendMessage } from '@/lib/telegram/bot';
import * as i18n from '@/lib/telegram/i18n';

/**
 * FAQ Keyword Matcher
 *
 * Matches free text to known keywords and responds with relevant info.
 * If no match: forwards message to admin.
 */

interface FaqRule {
  keywords: string[];
  respond: (locale: 'de' | 'ru') => string;
}

const faqRules: FaqRule[] = [
  {
    keywords: ['stornieren', 'cancel', 'storno', 'widerruf', 'отмена', 'отменить', 'возврат'],
    respond: (locale) => i18n.faqCancel(locale),
  },
  {
    keywords: ['preis', 'kosten', 'price', 'цена', 'стоимость', 'сколько стоит'],
    respond: (locale) => i18n.faqPricing(locale),
  },
  {
    keywords: ['termin', 'buchen', 'booking', 'appointment', 'запись', 'записаться'],
    respond: (locale) =>
      locale === 'de'
        ? '📅 Nutze /termin um deinen nächsten Termin zu sehen, oder /pakete um eine Beratung zu buchen.'
        : '📅 Используй /termin чтобы увидеть следующую сессию, или /pakete чтобы записаться.',
  },
  {
    keywords: ['kontakt', 'swetlana', 'contact', 'контакт', 'светлана'],
    respond: (locale) => i18n.faqContact(locale),
  },
  {
    keywords: ['datenschutz', 'privacy', 'dsgvo', 'конфиденциальность', 'приватность'],
    respond: (locale) => i18n.faqPrivacy(locale),
  },
  {
    keywords: ['pdf', 'download', 'herunterladen', 'скачать'],
    respond: (locale) =>
      locale === 'de'
        ? '📂 Nutze /meinepdfs um deine gekauften PDFs erneut zu erhalten.'
        : '📂 Используй /meinepdfs чтобы получить твои купленные PDF.',
  },
  {
    keywords: ['hallo', 'hello', 'hi', 'hey', 'привет', 'здравствуйте'],
    respond: (locale) =>
      locale === 'de'
        ? '👋 Hallo! Nutze /hilfe um alle Befehle zu sehen, oder schreib mir einfach deine Frage.'
        : '👋 Привет! Используй /hilfe чтобы увидеть все команды, или просто напиши свой вопрос.',
  },
];

export async function handleFaq(chatId: number, text: string, locale: 'de' | 'ru') {
  const lower = text.toLowerCase();

  // Check each FAQ rule
  for (const rule of faqRules) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      await sendMessage({ chat_id: chatId, text: rule.respond(locale) });
      return;
    }
  }

  // No match — forward to admin and inform user
  await sendMessage({ chat_id: chatId, text: i18n.faqForwarded(locale) });

  // Forward the message to admin via Telegram (send to Swetlana's channel or admin chat)
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminChatId) {
    // Look up profile info for context
    const { data: profile } = await adminClient
      .from('profiles')
      .select('full_name, email')
      .eq('telegram_chat_id', chatId)
      .single();

    const from = profile
      ? `${profile.full_name ?? 'Unbekannt'} (${profile.email})`
      : `Chat ID: ${chatId}`;

    // Strip HTML tags from user text to prevent Telegram HTML injection
    const safeText = text.replace(/<[^>]*>/g, '');
    const safeFrom = from.replace(/<[^>]*>/g, '');
    await sendMessage({
      chat_id: parseInt(adminChatId),
      text: `📨 Neue Frage von ${safeFrom}:\n\n${safeText}`,
    });
  }
}
