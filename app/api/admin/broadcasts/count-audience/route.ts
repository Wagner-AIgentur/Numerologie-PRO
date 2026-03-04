import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { countAudience } from '@/lib/broadcast/audience';
import type { AudienceFilter } from '@/lib/broadcast/audience';
import { safeParseJSON } from '@/lib/utils';

// POST: Count audience for preview in composer
export async function POST(request: NextRequest) {
  if (!(await requirePermission('content.view'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parseResult = await safeParseJSON<Record<string, unknown>>(request);
  if (parseResult.error) {
    return NextResponse.json({ error: parseResult.error }, { status: 400 });
  }
  const body = parseResult.data!;

  const filter: AudienceFilter = (body.audience_filter as AudienceFilter) ?? { type: 'all' };
  const lang = (body.language as 'de' | 'ru' | 'all') ?? 'all';

  const count = await countAudience(filter, lang);

  return NextResponse.json({ count });
}
