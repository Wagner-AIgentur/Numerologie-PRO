import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { clickBatchSchema } from '@/lib/validations/admin';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const allowed = await rateLimit(`clicks:${ip}`, { preset: 'default' });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = clickBatchSchema.safeParse(raw);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { session_id, events } = result.data;

  const rows = events.map((e) => ({
    page_path: e.page_path,
    element_tag: e.element_tag,
    element_text: e.element_text,
    element_id: e.element_id,
    element_href: e.element_href,
    section: e.section,
    x_percent: e.x_percent,
    y_percent: e.y_percent,
    viewport_w: e.viewport_w,
    session_id,
  }));

  const { error } = await adminClient.from('click_events').insert(rows);

  if (error) {
    console.error('[ClickTrack] Insert failed:', error.message);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
