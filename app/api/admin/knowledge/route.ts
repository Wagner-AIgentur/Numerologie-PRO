import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { searchKnowledge, getKnowledgeStats, getKnowledgeSources } from '@/lib/intelligence/knowledge';

/**
 * GET /api/admin/knowledge — Stats + verfuegbare Quellen
 * GET /api/admin/knowledge?action=search&q=...&source=... — Semantic Search
 */
export async function GET(request: NextRequest) {
  if (!(await requirePermission('ai.use'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'search') {
      const query = searchParams.get('q');
      if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" required' }, { status: 400 });
      }

      const sourceName = searchParams.get('source') || undefined;
      const method = searchParams.get('method') || undefined;
      const topK = Math.min(parseInt(searchParams.get('topK') ?? '8', 10), 20);

      const results = await searchKnowledge({ query, topK, sourceName, method });
      return NextResponse.json({ results });
    }

    if (action === 'sources') {
      const sources = await getKnowledgeSources();
      return NextResponse.json({ sources });
    }

    // Default: stats
    const stats = await getKnowledgeStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error('[Knowledge API] Error:', err);
    const message = err instanceof Error ? err.message : 'Knowledge query failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
