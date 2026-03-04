import type { CallbackQuery } from '@/lib/telegram/bot';
import { answerCallbackQuery } from '@/lib/telegram/bot';
import { adminClient } from '@/lib/supabase/admin';
import { handleAnalyse } from '@/lib/telegram/commands/analyse';
import { handleKompatibel } from '@/lib/telegram/commands/kompatibel';
import { handleHeute } from '@/lib/telegram/commands/heute';
import { handleMeinePdfs } from '@/lib/telegram/commands/meinepdfs';
import { handlePakete } from '@/lib/telegram/commands/pakete';
import { handleTermin } from '@/lib/telegram/commands/termin';
import { handleEmpfehlen } from '@/lib/telegram/commands/empfehlen';
import { handleHilfe } from '@/lib/telegram/commands/hilfe';
import { handleVerbinden } from '@/lib/telegram/commands/verbinden';
import { handleSprache, handleLanguageChange } from '@/lib/telegram/commands/sprache';

/**
 * Handle inline keyboard callback queries.
 *
 * Callback data format: "cmd_analyse", "cmd_pakete", "lang_de", etc.
 */
export async function handleCallback(query: CallbackQuery) {
  const chatId = query.message?.chat.id;
  if (!chatId || !query.data) {
    await answerCallbackQuery(query.id);
    return;
  }

  // Resolve locale (same logic as webhook, but lightweight for callbacks)
  const locale = await resolveCallbackLocale(chatId, query.from.language_code);

  // Acknowledge the callback immediately
  await answerCallbackQuery(query.id);

  // Handle language changes (special — uses the NEW locale, not current)
  if (query.data === 'lang_de') {
    await handleLanguageChange(chatId, 'de');
    return;
  }
  if (query.data === 'lang_ru') {
    await handleLanguageChange(chatId, 'ru');
    return;
  }

  // Route to command handler
  switch (query.data) {
    case 'cmd_analyse':
      await handleAnalyse(chatId, locale);
      break;
    case 'cmd_kompatibel':
      await handleKompatibel(chatId, locale);
      break;
    case 'cmd_heute':
      await handleHeute(chatId, locale);
      break;
    case 'cmd_meinepdfs':
      await handleMeinePdfs(chatId, locale);
      break;
    case 'cmd_pakete':
      await handlePakete(chatId, locale);
      break;
    case 'cmd_termin':
      await handleTermin(chatId, locale);
      break;
    case 'cmd_empfehlen':
      await handleEmpfehlen(chatId, locale);
      break;
    case 'cmd_hilfe':
      await handleHilfe(chatId, locale);
      break;
    case 'cmd_verbinden':
      await handleVerbinden(chatId, locale);
      break;
    case 'cmd_sprache':
      await handleSprache(chatId, locale);
      break;
    default:
      // Unknown callback — ignore
      break;
  }
}

/**
 * Resolve locale for callback queries.
 * Priority: 1) profiles.language  2) telegram_settings.locale  3) Telegram language_code
 */
async function resolveCallbackLocale(chatId: number, telegramLang?: string): Promise<'de' | 'ru'> {
  const { data: profile } = await adminClient
    .from('profiles')
    .select('language')
    .eq('telegram_chat_id', chatId)
    .single();

  if (profile?.language) return profile.language as 'de' | 'ru';

  const { data: settings } = await adminClient
    .from('telegram_settings')
    .select('locale')
    .eq('chat_id', chatId)
    .single();

  if (settings?.locale) return settings.locale as 'de' | 'ru';

  if (telegramLang === 'ru' || telegramLang === 'uk' || telegramLang === 'be') return 'ru';
  return 'de';
}
