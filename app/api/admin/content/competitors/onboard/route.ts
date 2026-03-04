import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { runCompetitorPipeline, runBatchPipeline } from '@/lib/intelligence/pipeline';
import { validateUrlInput } from '@/lib/intelligence/url-detector';
import { safeParseJSON } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: parseError } = await safeParseJSON(request);
  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 });
  }
  const { url, urls } = body as { url?: string; urls?: string[] };

  // Batch mode
  if (urls && Array.isArray(urls) && urls.length > 0) {
    const filtered = urls.filter((u: string) => u.trim().length > 0).slice(0, 10);
    const results = await runBatchPipeline(filtered);
    return NextResponse.json({ success: true, batch: true, results });
  }

  // Single URL mode
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  // Validate URL format before running expensive pipeline
  const validationError = validateUrlInput(url);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const result = await runCompetitorPipeline(url.trim());
    return NextResponse.json({
      success: true,
      ...result,
      // Surface pipeline errors/warnings to frontend
      errors: result.errors,
      warnings: result.warnings,
    });
  } catch (err) {
    console.error('[Onboard] Pipeline failed:', err);
    return NextResponse.json(
      { error: 'Pipeline failed', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
