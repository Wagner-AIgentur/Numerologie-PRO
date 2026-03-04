/**
 * Bot Config Resolver — DB-driven command and FAQ configuration
 *
 * Provides a cached layer between the webhook handler and Supabase.
 * In-memory cache with 60s TTL — suitable for Vercel serverless.
 */

import { adminClient } from '@/lib/supabase/admin';

// ── Types ────────────────────────────────────────────────────────

interface ButtonConfig {
  text_de: string;
  text_ru: string;
  url?: string;
  url_template?: string;
  callback_data?: string;
}

interface BotCommand {
  id: string;
  command: string;
  type: 'builtin' | 'custom';
  response_de: string;
  response_ru: string;
  buttons: ButtonConfig[];
  is_enabled: boolean;
  is_editable: boolean;
}

interface FaqRule {
  id: string;
  keywords: string[];
  response_de: string;
  response_ru: string;
  priority: number;
  is_enabled: boolean;
}

interface BotConfig {
  commands: Map<string, BotCommand>;
  faqRules: FaqRule[];
  settings: Map<string, unknown>;
  loadedAt: number;
}

// ── Cache ────────────────────────────────────────────────────────

let cachedConfig: BotConfig | null = null;
const CACHE_TTL_MS = 60_000; // 60 seconds

export async function getBotConfig(): Promise<BotConfig> {
  if (cachedConfig && Date.now() - cachedConfig.loadedAt < CACHE_TTL_MS) {
    return cachedConfig;
  }

  const [commandsRes, faqRes, settingsRes] = await Promise.all([
    adminClient.from('bot_commands').select('*').eq('is_enabled', true),
    adminClient.from('bot_faq_rules').select('*').eq('is_enabled', true).order('priority', { ascending: false }),
    adminClient.from('bot_settings').select('*'),
  ]);

  const commands = new Map<string, BotCommand>();
  for (const cmd of (commandsRes.data ?? []) as unknown as BotCommand[]) {
    commands.set(cmd.command, cmd);
  }

  const settings = new Map<string, unknown>();
  for (const s of (settingsRes.data ?? []) as { key: string; value: unknown }[]) {
    settings.set(s.key, s.value);
  }

  cachedConfig = {
    commands,
    faqRules: (faqRes.data ?? []) as FaqRule[],
    settings,
    loadedAt: Date.now(),
  };

  return cachedConfig;
}

/** Force cache invalidation (called after admin saves changes) */
export function invalidateBotConfig(): void {
  cachedConfig = null;
}

// ── Resolvers ────────────────────────────────────────────────────

/**
 * Resolve a custom/editable command response.
 * Returns null if the command isn't found, isn't editable, or has no response text.
 */
export async function resolveCustomCommand(
  command: string,
  locale: 'de' | 'ru',
): Promise<{ text: string; buttons: { text: string; url?: string; callback_data?: string }[] } | null> {
  const config = await getBotConfig();
  const cmd = config.commands.get(command);

  if (!cmd || !cmd.is_editable) return null;

  const text = locale === 'de' ? cmd.response_de : cmd.response_ru;
  if (!text) return null;

  const buttons = (cmd.buttons ?? []).map((b: ButtonConfig) => ({
    text: locale === 'de' ? b.text_de : b.text_ru,
    url: b.url_template ? b.url_template.replace('{locale}', locale) : b.url,
    callback_data: b.callback_data,
  }));

  return { text, buttons };
}

/**
 * Match FAQ rules against user text.
 * Returns the localized response or null if no rule matches.
 */
export async function matchFaqRules(
  text: string,
  locale: 'de' | 'ru',
): Promise<string | null> {
  const config = await getBotConfig();
  const lower = text.toLowerCase();

  for (const rule of config.faqRules) {
    if (rule.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return locale === 'de' ? rule.response_de : rule.response_ru;
    }
  }

  return null;
}

/** Get a bot setting value by key */
export async function getBotSetting<T = string>(key: string): Promise<T | null> {
  const config = await getBotConfig();
  const val = config.settings.get(key);
  return (val as T) ?? null;
}
