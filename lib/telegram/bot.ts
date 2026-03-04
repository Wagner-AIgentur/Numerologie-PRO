/**
 * Telegram Bot API Client
 *
 * Thin wrapper around the Telegram Bot HTTP API.
 * No external dependencies — uses native fetch().
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API = `https://api.telegram.org/bot${TOKEN}`;

// ── Types ────────────────────────────────────────────────────────────────

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  document?: { file_id: string; file_name?: string };
}

export interface CallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: CallbackQuery;
}

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

interface SendMessageOptions {
  chat_id: number;
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  reply_markup?: {
    inline_keyboard: InlineKeyboardButton[][];
  };
}

// ── API Helpers ──────────────────────────────────────────────────────────

async function callApi<T = unknown>(method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) {
    console.error(`[Telegram] ${method} failed:`, json);
    throw new Error(`Telegram API error: ${json.description ?? 'unknown'}`);
  }
  return json.result as T;
}

// ── Public API ───────────────────────────────────────────────────────────

export async function sendMessage(opts: SendMessageOptions) {
  return callApi<TelegramMessage>('sendMessage', {
    chat_id: opts.chat_id,
    text: opts.text,
    parse_mode: opts.parse_mode ?? 'HTML',
    ...(opts.reply_markup && { reply_markup: opts.reply_markup }),
  });
}

export async function sendDocument(chatId: number, fileUrl: string, caption?: string) {
  return callApi('sendDocument', {
    chat_id: chatId,
    document: fileUrl,
    ...(caption && { caption, parse_mode: 'HTML' }),
  });
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  return callApi('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    ...(text && { text }),
  });
}

export async function setWebhook(url: string, secret: string) {
  return callApi('setWebhook', {
    url,
    secret_token: secret,
    allowed_updates: ['message', 'callback_query'],
  });
}

export async function deleteWebhook() {
  return callApi('deleteWebhook', {});
}

/**
 * Build an inline keyboard from rows of buttons.
 * Each row is an array of buttons.
 */
export function inlineKeyboard(rows: InlineKeyboardButton[][]) {
  return { inline_keyboard: rows };
}

/**
 * Shorthand to create a single-button row.
 */
export function button(text: string, opts: { url?: string; callback_data?: string }): InlineKeyboardButton[] {
  return [{ text, ...opts }];
}
