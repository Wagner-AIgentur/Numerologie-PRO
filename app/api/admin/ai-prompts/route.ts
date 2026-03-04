import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { invalidatePromptCache } from '@/lib/ai/prompt-loader';
import { safeParseJSON } from '@/lib/utils';

/** GET /api/admin/ai-prompts — List all prompts, optionally filtered by type */
export async function GET(request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const type = request.nextUrl.searchParams.get('type');

  let query = adminClient
    .from('ai_system_prompts')
    .select('*')
    .order('prompt_type')
    .order('content_format', { nullsFirst: true })
    .order('platform', { nullsFirst: true });

  if (type) {
    query = query.eq('prompt_type', type);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

/** POST /api/admin/ai-prompts — Create a new prompt */
export async function POST(request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: parseError } = await safeParseJSON(request);
  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 });
  }
  const {
    prompt_key, prompt_type, content_format, platform,
    system_prompt, model, temperature, max_tokens, description,
  } = body as Record<string, unknown>;

  if (!prompt_key || !prompt_type || !system_prompt) {
    return NextResponse.json({ error: 'prompt_key, prompt_type, and system_prompt are required' }, { status: 400 });
  }

  const validTypes = ['scoring', 'analysis', 'strategy', 'brand_context', 'funnel_context'];
  if (!validTypes.includes(prompt_type as string)) {
    return NextResponse.json({ error: `Invalid prompt_type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from('ai_system_prompts')
    .insert({
      prompt_key: prompt_key as string,
      prompt_type: prompt_type as string,
      content_format: (content_format as string | null) ?? null,
      platform: (platform as string | null) ?? null,
      system_prompt: system_prompt as string,
      model: (model as string | null) ?? 'google/gemini-2.0-flash-001',
      temperature: (temperature as number | null) ?? 0.3,
      max_tokens: (max_tokens as number | null) ?? 1500,
      description: (description as string | null) ?? null,
      is_default: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  invalidatePromptCache();
  return NextResponse.json(data, { status: 201 });
}
