import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { getOpenRouterModels } from '@/lib/ai/content-studio';

export async function GET() {
  if (!(await requirePermission('ai.use'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const models = await getOpenRouterModels();
  return NextResponse.json({ models });
}
