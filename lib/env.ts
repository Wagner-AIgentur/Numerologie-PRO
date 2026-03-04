/**
 * Centralized environment variable validation.
 * Import this module early to get clear error messages for missing config.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[ENV] Missing required environment variable: ${name}. ` +
      `Check your .env.local file or Vercel environment settings.`
    );
  }
  return value;
}

function optionalEnv(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

/**
 * Validated environment variables.
 * Import and use instead of raw process.env for critical secrets.
 *
 * Usage:
 *   import { env } from '@/lib/env';
 *   const client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
 */
export const env = {
  // Supabase
  supabaseUrl: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),

  // Stripe
  stripeSecretKey: requireEnv('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: requireEnv('STRIPE_WEBHOOK_SECRET'),

  // Cron
  cronSecret: requireEnv('CRON_SECRET'),

  // Site
  siteUrl: optionalEnv('NEXT_PUBLIC_SITE_URL', 'https://numerologie-pro.com'),

  // Email
  resendApiKey: optionalEnv('RESEND_API_KEY'),
  resendFromEmail: optionalEnv('RESEND_FROM_EMAIL'),
  adminEmail: optionalEnv('ADMIN_EMAIL'),

  // Telegram
  telegramBotToken: optionalEnv('TELEGRAM_BOT_TOKEN'),
  telegramWebhookSecret: optionalEnv('TELEGRAM_WEBHOOK_SECRET'),

  // Meta / Instagram
  metaAppSecret: optionalEnv('META_APP_SECRET'),
  metaVerifyToken: optionalEnv('META_VERIFY_TOKEN'),
  metaAccessToken: optionalEnv('META_ACCESS_TOKEN'),

  // Redis (rate limiting)
  upstashRedisUrl: optionalEnv('UPSTASH_REDIS_REST_URL'),
  upstashRedisToken: optionalEnv('UPSTASH_REDIS_REST_TOKEN'),
} as const;
