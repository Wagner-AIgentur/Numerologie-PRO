import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { invalidatePromptCache } from '@/lib/ai/prompt-loader';
import { safeParseJSON } from '@/lib/utils';

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/admin/ai-prompts/[id] */
export async function GET(_request: NextRequest, ctx: Ctx) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;

  const { data, error } = await adminClient
    .from('ai_system_prompts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(data);
}

/** PATCH /api/admin/ai-prompts/[id] */
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  const parseResult = await safeParseJSON<Record<string, unknown>>(request);
  if (parseResult.error) {
    return NextResponse.json({ error: parseResult.error }, { status: 400 });
  }
  const body = parseResult.data as Record<string, unknown>;

  const allowed = [
    'system_prompt', 'model', 'temperature', 'max_tokens',
    'content_format', 'platform', 'description', 'is_active', 'prompt_key',
  ];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const key of allowed) {
    if (body[key] !== undefined) {
      updates[key] = body[key];
    }
  }

  const { data, error } = await adminClient
    .from('ai_system_prompts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  invalidatePromptCache();
  return NextResponse.json(data);
}

/** DELETE /api/admin/ai-prompts/[id] — Only non-default prompts can be deleted */
export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;

  // Check if it's a default prompt
  const { data: prompt } = await adminClient
    .from('ai_system_prompts')
    .select('is_default')
    .eq('id', id)
    .single();

  if (!prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (prompt.is_default) {
    return NextResponse.json(
      { error: 'Default-Prompts können nicht gelöscht werden. Deaktiviere sie stattdessen.' },
      { status: 403 },
    );
  }

  const { error } = await adminClient
    .from('ai_system_prompts')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  invalidatePromptCache();
  return NextResponse.json({ success: true });
}
