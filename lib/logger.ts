/**
 * Structured Logger
 *
 * Provides consistent, tagged logging across the application.
 * In production, suppresses debug-level logs.
 */

const isProd = process.env.NODE_ENV === 'production';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function formatMessage(tag: string, message: string): string {
  return `[${tag}] ${message}`;
}

export const log = {
  debug(tag: string, message: string, data?: unknown) {
    if (isProd) return;
    if (data) console.log(formatMessage(tag, message), data);
    else console.log(formatMessage(tag, message));
  },

  info(tag: string, message: string, data?: unknown) {
    if (data) console.log(formatMessage(tag, message), data);
    else console.log(formatMessage(tag, message));
  },

  warn(tag: string, message: string, data?: unknown) {
    if (data) console.warn(formatMessage(tag, message), data);
    else console.warn(formatMessage(tag, message));
  },

  error(tag: string, message: string, data?: unknown) {
    if (data) console.error(formatMessage(tag, message), data);
    else console.error(formatMessage(tag, message));
  },
};
