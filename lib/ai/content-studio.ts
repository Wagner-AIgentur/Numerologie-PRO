/**
 * Content Studio — AI Generation Engine
 *
 * Resolves templates, injects triggers, handles 2-step pipelines (Script → Caption),
 * and manages the connection between OpenRouter and the Content Studio UI.
 */

import { adminClient } from '@/lib/supabase/admin';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StudioGenerateInput {
  template_id?: string;
  content_type: string;
  topic: string;
  language: 'de' | 'ru' | 'en';
  tone?: string;
  model?: string;
  temperature?: number;
  funnel_stage?: string;
  triggers?: string[];
  additional_context?: string;
  word_count?: number;
  platform?: string;
  manychat_cta?: boolean;
  inspired_by_intel_id?: string;
  pipeline_step?: 'script' | 'caption';
  script_input?: string;
}

export interface StudioGenerateResult {
  output: string;
  output_json?: Record<string, unknown>;
  model_used: string;
  template_slug?: string;
  pipeline_step: 'script' | 'caption' | 'single';
  tokens_used?: number;
}

interface PromptTemplate {
  id: string;
  slug: string;
  system_prompt: string;
  user_prompt_template: string | null;
  default_model: string | null;
  default_temperature: number | null;
  default_triggers: string[] | null;
  default_funnel_stage: string | null;
  pipeline_type: string | null;
  caption_template_id: string | null;
}

interface TriggerRecord {
  slug: string;
  prompt_snippet: string;
}

// ---------------------------------------------------------------------------
// Brand Context (shared across all prompts)
// ---------------------------------------------------------------------------

const BRAND_CONTEXT = `Du schreibst für "Numerologie PRO" (numerologie-pro.com) — eine Premium-Numerologie-Beratungsplattform.
Beraterin: Swetlana Wagner, erfahrene Numerologin mit über 500 Beratungen.
Angebote: Pythagoras Psychomatrix Analyse (PDF 9,99€), Live-Beratungspakete (ab 99€), kostenloser Online-Rechner.
Tonalität: Premium, mystisch aber seriös, warmherzig, professionell. Keine Esoterik-Klischees.
Zielgruppe: Frauen 25-55, interessiert an Persönlichkeitsentwicklung, Selbstfindung, Beziehungen.`;

const FUNNEL_STAGE_CONTEXT: Record<string, string> = {
  tofu: 'FUNNEL-STAGE: TOFU (Top of Funnel / Awareness). Ziel: Reichweite, Aufmerksamkeit, Pattern Interruption. Der Content soll viral gehen, neugierig machen, zum Teilen animieren.',
  mofu: 'FUNNEL-STAGE: MOFU (Middle of Funnel / Consideration). Ziel: Vertrauen aufbauen, Autorität zeigen. Edukation, How-To-Content, Behind-the-Scenes, Case Studies.',
  bofu: 'FUNNEL-STAGE: BOFU (Bottom of Funnel / Conversion). Ziel: Handlung auslösen. Testimonials, Urgency, klare CTAs, Angebote, Social Proof.',
  retention: 'FUNNEL-STAGE: Retention (Bindung). Ziel: Bestehende Kunden binden. Community, exklusive Tipps, Upsell-Vorbereitung, Wiederkauf.',
};

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  de: 'Schreibe den gesamten Inhalt auf Deutsch. Verwende "du" als Anrede.',
  ru: 'Напиши весь контент на русском языке. Обращайся на "ты".',
  en: 'Write the entire content in English. Use an informal "you" tone.',
};

const MANYCHAT_CTA_INSTRUCTION = `MANYCHAT CTA-MODUS AKTIV: Der CTA am Ende des Scripts soll den User auffordern, ein bestimmtes KEYWORD in die Kommentare zu schreiben. Beispiel: "Schreib NUMEROLOGIE in die Kommentare und ich schicke dir den Link per DM!" Generiere außerdem ein passendes Keyword (1 Wort, GROSSBUCHSTABEN) und eine kurze DM-Antwort die automatisch gesendet wird.
Füge zum JSON hinzu: "manychat_keyword": "KEYWORD", "manychat_dm_text": "DM-Antwortnachricht mit Link-Platzhalter"`;

// ---------------------------------------------------------------------------
// Core: Generate Content
// ---------------------------------------------------------------------------

export async function studioGenerate(input: StudioGenerateInput): Promise<StudioGenerateResult> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  // 1. Load template if provided
  let template: PromptTemplate | null = null;
  if (input.template_id) {
    const { data } = await adminClient
      .from('ai_prompt_templates')
      .select('id, slug, system_prompt, user_prompt_template, default_model, default_temperature, default_triggers, default_funnel_stage, pipeline_type, caption_template_id')
      .eq('id', input.template_id)
      .single();
    template = data;
  }

  // 2. Determine pipeline step
  const pipelineType = template?.pipeline_type ?? 'single';
  let pipelineStep: 'script' | 'caption' | 'single' = 'single';

  if (pipelineType === 'script_then_caption') {
    pipelineStep = input.pipeline_step ?? 'script';
  } else if (pipelineType === 'caption_only') {
    pipelineStep = 'caption';
  }

  // 3. For caption step, load caption template
  if (pipelineStep === 'caption' && template?.caption_template_id) {
    const { data: captionTemplate } = await adminClient
      .from('ai_prompt_templates')
      .select('id, slug, system_prompt, user_prompt_template, default_model, default_temperature, default_triggers, default_funnel_stage, pipeline_type, caption_template_id')
      .eq('id', template.caption_template_id)
      .single();
    if (captionTemplate) template = captionTemplate;
  }

  // 4. Load trigger snippets
  const triggerSlugs = input.triggers ?? template?.default_triggers ?? [];
  let triggerBlock = '';
  if (triggerSlugs.length > 0) {
    const { data: triggers } = await adminClient
      .from('content_triggers')
      .select('slug, prompt_snippet')
      .in('slug', triggerSlugs)
      .eq('is_active', true);

    if (triggers && triggers.length > 0) {
      triggerBlock = '\n\nPSYCHOLOGISCHE TRIGGER (wende diese im Content an):\n' +
        (triggers as TriggerRecord[]).map((tr) => `- ${tr.prompt_snippet}`).join('\n');
    }
  }

  // 5. Build system prompt
  const systemParts: string[] = [BRAND_CONTEXT];

  if (template?.system_prompt) {
    // Replace {{triggers}} placeholder with actual trigger block
    systemParts.push(template.system_prompt.replace('{{triggers}}', triggerBlock));
  } else {
    systemParts.push(triggerBlock);
  }

  const funnelStage = input.funnel_stage ?? template?.default_funnel_stage;
  if (funnelStage && FUNNEL_STAGE_CONTEXT[funnelStage]) {
    systemParts.push(FUNNEL_STAGE_CONTEXT[funnelStage]);
  }

  systemParts.push(LANGUAGE_INSTRUCTIONS[input.language] ?? LANGUAGE_INSTRUCTIONS.de);

  if (input.manychat_cta) {
    systemParts.push(MANYCHAT_CTA_INSTRUCTION);
  }

  // 6. Build user prompt
  let userPrompt: string;
  if (template?.user_prompt_template) {
    userPrompt = template.user_prompt_template
      .replace('{{topic}}', input.topic)
      .replace('{{language}}', input.language)
      .replace('{{tone}}', input.tone ?? 'professionell')
      .replace('{{funnel_stage}}', funnelStage ?? 'tofu')
      .replace('{{platform}}', input.platform ?? '')
      .replace('{{word_count}}', String(input.word_count ?? ''))
      .replace('{{script}}', input.script_input ?? '');
  } else {
    userPrompt = `Erstelle Content zum Thema: ${input.topic}`;
    if (input.tone) userPrompt += `\nTon: ${input.tone}`;
    if (input.platform) userPrompt += `\nPlattform: ${input.platform}`;
    if (input.word_count) userPrompt += `\nUngefähre Länge: ${input.word_count} Wörter`;
  }

  if (input.additional_context) {
    userPrompt += `\n\nZusätzlicher Kontext: ${input.additional_context}`;
  }

  // 7. Load intel context if inspired_by
  if (input.inspired_by_intel_id) {
    const { data: intel } = await adminClient
      .from('content_intel')
      .select('content, ai_summary, ai_topics, source_platform')
      .eq('id', input.inspired_by_intel_id)
      .single();

    if (intel) {
      userPrompt += `\n\nINSPIRATION (erstelle eigenständigen Content basierend auf diesem Wettbewerber-Intel):
Plattform: ${intel.source_platform}
Themen: ${(intel.ai_topics as string[] ?? []).join(', ')}
Zusammenfassung: ${intel.ai_summary ?? ''}
Original: ${(intel.content ?? '').substring(0, 500)}
WICHTIG: Erstelle eigenen, einzigartigen Content. Nicht kopieren!`;
    }
  }

  // 8. Call OpenRouter
  const model = input.model ?? template?.default_model ?? DEFAULT_MODEL;
  const temperature = input.temperature ?? template?.default_temperature ?? 0.7;

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://numerologie-pro.com',
      'X-Title': 'Numerologie PRO Content Studio',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemParts.join('\n\n') },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: input.word_count ? Math.min(input.word_count * 4, 8000) : 4000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.error('[ContentStudio] OpenRouter error:', response.status, errBody);
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) throw new Error('AI returned empty response');

  const tokensUsed = data.usage?.total_tokens;

  // 9. Increment template usage
  if (template?.id) {
    adminClient.rpc('increment_template_usage', { template_uuid: template.id }).then(() => { }, () => { });
  }

  // 10. Parse and return
  let outputJson: Record<string, unknown> | undefined;
  try {
    outputJson = JSON.parse(rawContent);
  } catch {
    // Not JSON — return raw text
  }

  return {
    output: rawContent,
    output_json: outputJson,
    model_used: model,
    template_slug: template?.slug,
    pipeline_step: pipelineStep,
    tokens_used: tokensUsed,
  };
}

// ---------------------------------------------------------------------------
// Fetch OpenRouter Models (cached in-memory for 1 hour)
// ---------------------------------------------------------------------------

interface OpenRouterModel {
  id: string;
  name: string;
  pricing: { prompt: string; completion: string };
  context_length: number;
  top_provider?: { max_completion_tokens: number };
}

interface ModelInfo {
  id: string;
  name: string;
  tier: 'fast' | 'balanced' | 'premium';
  price_prompt: number;
  price_completion: number;
  context_length: number;
}

let modelsCache: { models: ModelInfo[]; fetchedAt: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Fallback models if OpenRouter API is unreachable
const FALLBACK_MODELS: ModelInfo[] = [
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', tier: 'fast', price_prompt: 0.1, price_completion: 0.4, context_length: 1048576 },
  { id: 'anthropic/claude-sonnet-4.6', name: 'Claude Sonnet 4.6', tier: 'balanced', price_prompt: 3, price_completion: 15, context_length: 200000 },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', tier: 'fast', price_prompt: 0.15, price_completion: 0.6, context_length: 128000 },
  { id: 'openai/gpt-4o', name: 'GPT-4o', tier: 'premium', price_prompt: 2.5, price_completion: 10, context_length: 128000 },
  { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4', tier: 'premium', price_prompt: 15, price_completion: 75, context_length: 200000 },
  { id: 'google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro', tier: 'balanced', price_prompt: 1.25, price_completion: 10, context_length: 1048576 },
  { id: 'deepseek/deepseek-chat-v3', name: 'DeepSeek V3', tier: 'fast', price_prompt: 0.27, price_completion: 1.1, context_length: 131072 },
  { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', tier: 'fast', price_prompt: 0.2, price_completion: 0.6, context_length: 1048576 },
];

function classifyTier(pricePerMillion: number): 'fast' | 'balanced' | 'premium' {
  if (pricePerMillion < 1) return 'fast';
  if (pricePerMillion < 5) return 'balanced';
  return 'premium';
}

export async function getOpenRouterModels(): Promise<ModelInfo[]> {
  if (modelsCache && Date.now() - modelsCache.fetchedAt < CACHE_TTL) {
    return modelsCache.models;
  }

  try {
    const res = await fetch(`${OPENROUTER_BASE}/models`, {
      headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}` },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Models API: ${res.status}`);

    const { data } = await res.json() as { data: OpenRouterModel[] };

    const models: ModelInfo[] = data
      .filter((m) => m.pricing && parseFloat(m.pricing.prompt) >= 0)
      .map((m) => ({
        id: m.id,
        name: m.name,
        tier: classifyTier(parseFloat(m.pricing.prompt) * 1_000_000),
        price_prompt: parseFloat(m.pricing.prompt) * 1_000_000,
        price_completion: parseFloat(m.pricing.completion) * 1_000_000,
        context_length: m.context_length,
      }))
      .sort((a, b) => a.price_prompt - b.price_prompt);

    modelsCache = { models, fetchedAt: Date.now() };
    return models;
  } catch (err) {
    console.error('[ContentStudio] Failed to fetch models:', err);
    return FALLBACK_MODELS;
  }
}
