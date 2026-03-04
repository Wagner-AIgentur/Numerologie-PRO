import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { loadCoreMemory, updateCoreMemory } from '@/lib/intelligence/memory';
import { safeParseJSON } from '@/lib/utils';

export async function GET(_request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const core = await loadCoreMemory();
  return NextResponse.json(core);
}

export async function PATCH(request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: parseError } = await safeParseJSON<Record<string, unknown>>(request);
  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 });
  }
  const { key, value } = body as { key?: string; value?: unknown };
  if (!key || typeof value !== 'string') {
    return NextResponse.json({ error: 'key and value required' }, { status: 400 });
  }

  const validKeys = ['brand_voice', 'top_patterns', 'strategy', 'campaigns'];
  if (!validKeys.includes(key)) {
    return NextResponse.json({ error: `Invalid key. Must be one of: ${validKeys.join(', ')}` }, { status: 400 });
  }

  await updateCoreMemory(key, value);
  return NextResponse.json({ success: true });
}
