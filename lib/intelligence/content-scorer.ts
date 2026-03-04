/**
 * Content Scoring System
 *
 * Pre-publish scoring that evaluates content quality across 5 dimensions.
 * Loads format-specific prompts from DB (ai_system_prompts) with fallback.
 * Uses competitor intelligence + own top-performers as benchmarks.
 */

import { loadPrompt, loadPromptByKey } from '@/lib/ai/prompt-loader';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

// ── Types ─────────────────────────────────────────────

export interface ContentScore {
  overall: number;
  dimensions: {
    hook_strength: number;
    cta_clarity: number;
    trigger_usage: number;
    funnel_fit: number;
    engagement_prediction: number;
  };
  feedback: {
    hook_strength: string;
    cta_clarity: string;
    trigger_usage: string;
    funnel_fit: string;
    engagement_prediction: string;
  };
  suggestions: string[];
  competitor_benchmark: number | null;
}

export interface ScoreInput {
  content: string;
  funnel_stage: string;
  platform: string;
  content_format?: string;
  triggers_used: string[];
  competitor_avg_score?: number;
}

// ── Score Function ────────────────────────────────────

export async function scoreContent(input: ScoreInput): Promise<ContentScore> {
  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');

  // Load format-specific scoring prompt from DB
  const scoringPrompt = await loadPrompt('scoring', input.content_format, input.platform);

  // Load funnel context if available
  const funnelKey = `funnel_${input.funnel_stage}`;
  const funnelPrompt = await loadPromptByKey(funnelKey);

  // Build system prompt: scoring instructions + funnel context
  const systemParts = [scoringPrompt.system_prompt];
  if (funnelPrompt) {
    systemParts.push(funnelPrompt.system_prompt);
  }

  const userPrompt = `Plattform: ${input.platform}
Funnel-Stage: ${input.funnel_stage}
Format: ${input.content_format ?? 'unbekannt'}
Verwendete Trigger: ${input.triggers_used.length > 0 ? input.triggers_used.join(', ') : 'keine'}
${input.competitor_avg_score ? `Competitor-Durchschnitt: ${input.competitor_avg_score}/100` : ''}

Content:
${input.content.substring(0, 3000)}`;

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://numerologie-pro.com',
      'X-Title': 'Numerologie PRO Scorer',
    },
    body: JSON.stringify({
      model: scoringPrompt.model,
      messages: [
        { role: 'system', content: systemParts.join('\n\n') },
        { role: 'user', content: userPrompt },
      ],
      temperature: scoringPrompt.temperature,
      max_tokens: scoringPrompt.max_tokens,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[Scorer] Error:', res.status, err);
    throw new Error(`Scorer error: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Scorer returned empty response');

  const parsed = JSON.parse(content) as ContentScore;
  parsed.competitor_benchmark = input.competitor_avg_score ?? null;

  return parsed;
}
