/**
 * AI System Prompt Loader
 *
 * Loads scoring, analysis, and strategy prompts from the DB with a
 * 3-level fallback chain: format+platform → format → default → hardcoded.
 * Includes a 5-minute in-memory cache to minimize DB queries.
 */

import { adminClient } from '@/lib/supabase/admin';

// ── Types ─────────────────────────────────────────────

export interface LoadedPrompt {
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  prompt_key: string;
  source: 'db' | 'fallback';
}

type PromptType = 'scoring' | 'analysis' | 'strategy' | 'brand_context' | 'funnel_context';

interface CacheEntry {
  data: LoadedPrompt;
  expires: number;
}

// ── Cache ─────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

function cacheKey(type: PromptType, format?: string | null, platform?: string | null): string {
  return `${type}:${format ?? '*'}:${platform ?? '*'}`;
}

export function invalidatePromptCache(): void {
  cache.clear();
}

// ── Hardcoded Fallbacks ───────────────────────────────

const FALLBACK_SCORING = `Du bist ein Content-Qualitäts-Analyst. Bewerte den folgenden Social-Media-Beitrag auf einer Skala von 0-100 in 5 Dimensionen. Antworte als JSON:

{
  "overall": 75,
  "dimensions": {
    "hook_strength": 80,
    "cta_clarity": 60,
    "trigger_usage": 70,
    "funnel_fit": 85,
    "engagement_prediction": 65
  },
  "feedback": {
    "hook_strength": "Kurzes Feedback zum Hook (1 Satz)",
    "cta_clarity": "Kurzes Feedback zum CTA (1 Satz)",
    "trigger_usage": "Kurzes Feedback zu Triggern (1 Satz)",
    "funnel_fit": "Kurzes Feedback zum Funnel-Fit (1 Satz)",
    "engagement_prediction": "Kurzes Feedback zur Engagement-Prognose (1 Satz)"
  },
  "suggestions": [
    "Konkreter Verbesserungsvorschlag 1",
    "Konkreter Verbesserungsvorschlag 2",
    "Konkreter Verbesserungsvorschlag 3"
  ]
}

Bewertungskriterien:
- hook_strength: Stoppt der erste Satz/Bild den Scroll? Pattern Interrupt vorhanden?
- cta_clarity: Gibt es einen klaren Call-to-Action? Ist er stark genug?
- trigger_usage: Werden psychologische Trigger effektiv eingesetzt?
- funnel_fit: Passt der Content zur angegebenen Funnel-Stage?
- engagement_prediction: Wie wahrscheinlich sind Likes, Kommentare, Shares?

overall = Gewichteter Durchschnitt: hook(25%) + cta(20%) + trigger(20%) + funnel(15%) + engagement(20%)`;

const FALLBACK_ANALYSIS = `Du bist ein Content-Strategie-Analyst. Analysiere den folgenden Social-Media-Beitrag und gib ein JSON-Objekt zurück:

{
  "ai_summary": "2-3 Sätze Zusammenfassung",
  "ai_topics": ["thema1", "thema2"],
  "ai_strategy_notes": "Strategische Bewertung",
  "ai_funnel_stage": "tofu|mofu|bofu|retention",
  "ai_triggers_detected": [],
  "ai_hook_analysis": "Hook-Analyse",
  "ai_cta_analysis": "CTA-Analyse",
  "ai_manychat_detected": false,
  "ai_manychat_keyword": null,
  "content_format": "reel|carousel|static|story|long_video|article"
}`;

const FALLBACK_STRATEGY = `Du bist ein Content-Strategie-Berater. Erstelle einen Strategie-Report als JSON:

{
  "summary": "Executive Summary",
  "strengths": [],
  "weaknesses": [],
  "top_topics": [],
  "posting_patterns": "",
  "funnel_distribution": { "tofu": 60, "mofu": 25, "bofu": 10, "retention": 5 },
  "dominant_triggers": [],
  "manychat_usage": "",
  "actionable_insights": []
}`;

const FALLBACK_PROMPTS: Partial<Record<PromptType, string>> = {
  scoring: FALLBACK_SCORING,
  analysis: FALLBACK_ANALYSIS,
  strategy: FALLBACK_STRATEGY,
};

const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

// ── Loader ────────────────────────────────────────────

/**
 * Load the best-matching prompt from DB with fallback chain:
 * 1. Exact: type + format + platform
 * 2. Format: type + format (platform NULL)
 * 3. Default: type (format NULL, platform NULL)
 * 4. Hardcoded fallback
 */
export async function loadPrompt(
  type: PromptType,
  format?: string | null,
  platform?: string | null,
): Promise<LoadedPrompt> {
  const key = cacheKey(type, format, platform);
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  // Try exact match first, then progressively broader
  const candidates = buildCandidateKeys(type, format, platform);

  for (const candidate of candidates) {
    const result = await queryPrompt(candidate.type, candidate.format, candidate.platform);
    if (result) {
      cache.set(key, { data: result, expires: Date.now() + CACHE_TTL_MS });
      return result;
    }
  }

  // Hardcoded fallback
  const fallback: LoadedPrompt = {
    system_prompt: FALLBACK_PROMPTS[type] ?? '',
    model: DEFAULT_MODEL,
    temperature: 0.3,
    max_tokens: 1500,
    prompt_key: `${type}_fallback`,
    source: 'fallback',
  };

  cache.set(key, { data: fallback, expires: Date.now() + CACHE_TTL_MS });
  return fallback;
}

/**
 * Load a specific prompt by key (e.g., 'funnel_tofu', 'brand_context')
 */
export async function loadPromptByKey(promptKey: string): Promise<LoadedPrompt | null> {
  const cachedKey = `key:${promptKey}`;
  const cached = cache.get(cachedKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const { data } = await adminClient
    .from('ai_system_prompts')
    .select('prompt_key, system_prompt, model, temperature, max_tokens')
    .eq('prompt_key', promptKey)
    .eq('is_active', true)
    .maybeSingle();

  if (!data) return null;

  const loaded: LoadedPrompt = {
    system_prompt: data.system_prompt,
    model: data.model ?? DEFAULT_MODEL,
    temperature: Number(data.temperature) || 0.3,
    max_tokens: data.max_tokens ?? 1500,
    prompt_key: data.prompt_key,
    source: 'db',
  };

  cache.set(cachedKey, { data: loaded, expires: Date.now() + CACHE_TTL_MS });
  return loaded;
}

// ── Helpers ───────────────────────────────────────────

function buildCandidateKeys(
  type: PromptType,
  format?: string | null,
  platform?: string | null,
): Array<{ type: PromptType; format: string | null; platform: string | null }> {
  const candidates: Array<{ type: PromptType; format: string | null; platform: string | null }> = [];

  // 1. Exact: type + format + platform
  if (format && platform) {
    candidates.push({ type, format, platform });
  }

  // 2. Format only: type + format
  if (format) {
    candidates.push({ type, format, platform: null });
  }

  // 3. Platform only: type + platform
  if (platform && !format) {
    candidates.push({ type, format: null, platform });
  }

  // 4. Default: type only
  candidates.push({ type, format: null, platform: null });

  return candidates;
}

async function queryPrompt(
  type: PromptType,
  format: string | null,
  platform: string | null,
): Promise<LoadedPrompt | null> {
  let query = adminClient
    .from('ai_system_prompts')
    .select('prompt_key, system_prompt, model, temperature, max_tokens')
    .eq('prompt_type', type)
    .eq('is_active', true);

  if (format) {
    query = query.eq('content_format', format);
  } else {
    query = query.is('content_format', null);
  }

  if (platform) {
    query = query.eq('platform', platform);
  } else {
    query = query.is('platform', null);
  }

  const { data } = await query.maybeSingle();
  if (!data) return null;

  return {
    system_prompt: data.system_prompt,
    model: data.model ?? DEFAULT_MODEL,
    temperature: Number(data.temperature) || 0.3,
    max_tokens: data.max_tokens ?? 1500,
    prompt_key: data.prompt_key,
    source: 'db',
  };
}
