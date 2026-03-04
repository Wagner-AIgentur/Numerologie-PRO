import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { getFlows } from '@/lib/manychat/api';

export async function GET(_request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const flows = await getFlows();
    return NextResponse.json({ flows });
  } catch (err) {
    console.error('[ManyChat Flows]', err);
    return NextResponse.json({ error: 'Failed to load ManyChat flows' }, { status: 500 });
  }
}
