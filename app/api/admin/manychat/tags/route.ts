import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { getTags, createTag } from '@/lib/manychat/api';
import { safeParseJSON } from '@/lib/utils';

export async function GET(_request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const tags = await getTags();
    return NextResponse.json({ tags });
  } catch (err) {
    console.error('[ManyChat Tags]', err);
    return NextResponse.json({ error: 'Failed to load ManyChat tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: parseError } = await safeParseJSON(request);
  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 });
  }
  const { name } = body as { name?: string };
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  try {
    const tag = await createTag(name);
    return NextResponse.json(tag, { status: 201 });
  } catch (err) {
    console.error('[ManyChat Create Tag]', err);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
