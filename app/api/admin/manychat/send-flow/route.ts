import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { sendFlow } from '@/lib/manychat/api';
import { safeParseJSON } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const user = await requirePermission('content.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: parseError } = await safeParseJSON(request);
  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 });
  }
  const { subscriber_id, flow_ns } = body as { subscriber_id?: string; flow_ns?: string };
  if (!subscriber_id || !flow_ns) {
    return NextResponse.json({ error: 'subscriber_id and flow_ns required' }, { status: 400 });
  }

  try {
    await sendFlow(subscriber_id, flow_ns);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[ManyChat Send Flow]', err);
    return NextResponse.json({ error: 'Failed to send flow' }, { status: 500 });
  }
}
