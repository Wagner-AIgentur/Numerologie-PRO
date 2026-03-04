/**
 * OpenRouter AI Client
 *
 * Generates broadcast content (email + Telegram) using various LLM models
 * via the OpenRouter unified API.
 */

import { getSystemPrompt, buildUserPrompt } from './prompts';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export type ContentType = 'newsletter' | 'telegram_post' | 'upsell' | 'event' | 'daily_tip';

export interface GenerateOptions {
  content_type: ContentType;
  language: 'de' | 'ru';
  topic?: string;
  additional_context?: string;
  model?: string;
}

export interface GenerateResult {
  email_content: string;
  telegram_content: string;
  subject: string;
}

/** Available models for the admin UI dropdown */
export const AVAILABLE_MODELS = [
  { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash', description: 'Schnell & günstig' },
  { id: 'anthropic/claude-sonnet-4.6', label: 'Claude Sonnet 4.6', description: 'Hohe Qualität (Standart)' },
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', description: 'Gutes Preis-Leistungs-Verhältnis' },
  { id: 'openai/gpt-4o', label: 'GPT-4o', description: 'Premium Qualität' },
] as const;

const DEFAULT_MODEL = 'anthropic/claude-sonnet-4.6';

export async function generateContent(opts: GenerateOptions): Promise<GenerateResult> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const systemPrompt = getSystemPrompt(opts.content_type, opts.language);
  const userPrompt = buildUserPrompt(opts);

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://numerologie-pro.com',
      'X-Title': 'Numerologie PRO Admin',
    },
    body: JSON.stringify({
      model: opts.model ?? DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.error('[OpenRouter] API error:', response.status, errBody);
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenRouter returned empty response');
  }

  const parsed = JSON.parse(content) as GenerateResult;

  // Validate required fields
  if (!parsed.email_content || !parsed.telegram_content || !parsed.subject) {
    throw new Error('AI response missing required fields (email_content, telegram_content, subject)');
  }

  return parsed;
}
