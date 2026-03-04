import { sendMessage, inlineKeyboard, type InlineKeyboardButton } from '@/lib/telegram/bot';
import * as i18n from '@/lib/telegram/i18n';

/**
 * /hilfe — Show all available commands with inline buttons
 */
export async function handleHilfe(chatId: number, locale: 'de' | 'ru') {
  const isDE = locale === 'de';

  const buttons: InlineKeyboardButton[][] = [
    // Row 1: Core features
    [
      { text: '🔮 ' + (isDE ? 'Analyse' : 'Анализ'), callback_data: 'cmd_analyse' },
      { text: '💕 ' + (isDE ? 'Kompatibilität' : 'Совместимость'), callback_data: 'cmd_kompatibel' },
    ],
    // Row 2: Personal
    [
      { text: '✨ ' + (isDE ? 'Tageszahl' : 'Число дня'), callback_data: 'cmd_heute' },
      { text: '📂 ' + (isDE ? 'Meine PDFs' : 'Мои PDF'), callback_data: 'cmd_meinepdfs' },
    ],
    // Row 3: Services
    [
      { text: '🛍️ ' + (isDE ? 'Pakete' : 'Пакеты'), callback_data: 'cmd_pakete' },
      { text: '📅 ' + (isDE ? 'Termin' : 'Сессия'), callback_data: 'cmd_termin' },
    ],
    // Row 4: Account
    [
      { text: '🎁 ' + (isDE ? 'Empfehlen' : 'Рекомендовать'), callback_data: 'cmd_empfehlen' },
      { text: '🔗 ' + (isDE ? 'Konto verbinden' : 'Привязать аккаунт'), callback_data: 'cmd_verbinden' },
    ],
    // Row 5: Settings
    [
      { text: '🌐 ' + (isDE ? 'Sprache ändern' : 'Сменить язык'), callback_data: 'cmd_sprache' },
    ],
  ];

  await sendMessage({
    chat_id: chatId,
    text: i18n.hilfe(locale),
    reply_markup: inlineKeyboard(buttons),
  });
}
