import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { querySimilarWithDecay } from '@/lib/intelligence/embeddings';

export async function GET(request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const namespace = searchParams.get('namespace') ?? 'posts';
  const topK = parseInt(searchParams.get('limit') ?? '10', 10);

  if (!query) return NextResponse.json({ error: 'Query (q) required' }, { status: 400 });

  try {
    const results = await querySimilarWithDecay(query, namespace, topK);
    return NextResponse.json({ results });
  } catch (err) {
    console.error('[Semantic Search]', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
