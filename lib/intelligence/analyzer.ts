/**
 * AI Content Analyzer
 *
 * Analyzes competitor content using OpenRouter with DB-loaded prompts:
 * - Funnel-Stage classification
 * - Psychological trigger detection
 * - Hook analysis
 * - CTA / ManyChat keyword detection
 * - Strategy report generation
 */

import { loadPrompt } from '@/lib/ai/prompt-loader';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

interface AnalyzeInput {
  content: string;
  platform: string;
  engagement?: Record<string, unknown>;
  media_type?: string;
}

export interface AnalysisResult {
  ai_summary: string;
  ai_topics: string[];
  ai_strategy_notes: string;
  ai_funnel_stage: 'tofu' | 'mofu' | 'bofu' | 'retention';
  ai_triggers_detected: string[];
  ai_hook_analysis: string;
  ai_cta_analysis: string;
  ai_manychat_detected: boolean;
  ai_manychat_keyword: string | null;
  content_format: string;
}

export interface GapAnalysisResult {
  gaps: ContentGap[];
  recommendations: string[];
}

export interface ContentGap {
  topic: string;
  competitor_count: number;
  own_count: number;
  funnel_stage: string;
  platform: string;
  avg_engagement: number;
  suggestion: string;
}

export async function analyzeContent(input: AnalyzeInput): Promise<AnalysisResult> {
  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');

  // Load analysis prompt from DB (format-agnostic for competitor analysis)
  const analysisPrompt = await loadPrompt('analysis');

  const userPrompt = `Plattform: ${input.platform}
Format: ${input.media_type ?? 'unknown'}
${input.engagement ? `Engagement: ${JSON.stringify(input.engagement)}` : ''}

Content:
${input.content.substring(0, 3000)}`;

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://numerologie-pro.com',
      'X-Title': 'Numerologie PRO Intel',
    },
    body: JSON.stringify({
      model: analysisPrompt.model,
      messages: [
        { role: 'system', content: analysisPrompt.system_prompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: analysisPrompt.temperature,
      max_tokens: analysisPrompt.max_tokens,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[Analyzer] Error:', res.status, err);
    throw new Error(`Analyzer error: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Analyzer returned empty response');

  return JSON.parse(content) as AnalysisResult;
}

export interface StrategyReport {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  top_topics: string[];
  posting_patterns: string;
  funnel_distribution: Record<string, number>;
  dominant_triggers: string[];
  manychat_usage: string;
  actionable_insights: string[];
}

export async function generateStrategyReport(
  competitorName: string,
  intelEntries: Array<{ content: string; platform: string; engagement: unknown; ai_funnel_stage: string; ai_triggers_detected: string[] }>,
): Promise<StrategyReport> {
  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');

  // Load strategy prompt from DB
  const strategyPrompt = await loadPrompt('strategy');

  const summary = intelEntries.slice(0, 30).map((e, i) =>
    `${i + 1}. [${e.platform}] Funnel: ${e.ai_funnel_stage}, Trigger: ${e.ai_triggers_detected?.join(', ')}, Engagement: ${JSON.stringify(e.engagement)}\nContent: ${e.content?.substring(0, 200)}`,
  ).join('\n\n');

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://numerologie-pro.com',
      'X-Title': 'Numerologie PRO Strategy',
    },
    body: JSON.stringify({
      model: strategyPrompt.model,
      messages: [
        { role: 'system', content: strategyPrompt.system_prompt },
        { role: 'user', content: `Wettbewerber: ${competitorName}\n\nIntel-Daten (${intelEntries.length} Einträge):\n\n${summary}` },
      ],
      temperature: strategyPrompt.temperature,
      max_tokens: strategyPrompt.max_tokens,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) throw new Error(`Strategy report error: ${res.status}`);

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty strategy response');

  return JSON.parse(content) as StrategyReport;
}
