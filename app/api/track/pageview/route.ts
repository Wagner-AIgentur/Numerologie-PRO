import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { pageViewSchema } from '@/lib/validations/admin';

// ---------------------------------------------------------------------------
// Simple UA parsing (server-side)
// ---------------------------------------------------------------------------

function parseDevice(ua: string, viewportW?: number): string {
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|android.*mobile|iphone|ipod/i.test(ua)) return 'mobile';
  if (viewportW && viewportW < 768) return 'mobile';
  if (viewportW && viewportW < 1024) return 'tablet';
  return 'desktop';
}

function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return 'Opera';
  if (/firefox\//i.test(ua)) return 'Firefox';
  if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) return 'Chrome';
  if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) return 'Safari';
  if (/msie|trident/i.test(ua)) return 'IE';
  return 'Other';
}

function parseOS(ua: string): string {
  if (/windows/i.test(ua)) return 'Windows';
  if (/macintosh|mac os/i.test(ua)) return 'macOS';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
}

// ---------------------------------------------------------------------------
// POST /api/track/pageview
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const allowed = await rateLimit(`pv:${ip}`, { preset: 'default' });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = pageViewSchema.safeParse(raw);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const data = result.data;
  const ua = request.headers.get('user-agent') ?? '';

  if (data.type === 'view') {
    // Insert new page view
    const { error } = await adminClient.from('page_views').insert({
      session_id: data.session_id,
      page_path: data.page_path,
      referrer: data.referrer || null,
      utm_source: data.utm_source || null,
      utm_medium: data.utm_medium || null,
      utm_campaign: data.utm_campaign || null,
      device_type: parseDevice(ua, data.viewport_w),
      browser: parseBrowser(ua),
      os: parseOS(ua),
      screen_w: data.screen_w ?? null,
      screen_h: data.screen_h ?? null,
      viewport_w: data.viewport_w ?? null,
      language: data.language || null,
      is_bounce: true,
    });

    if (error) {
      console.error('[PageView] Insert failed:', error.message);
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }

    // Check if session has >1 page view → mark all as non-bounce
    const { count } = await adminClient
      .from('page_views')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', data.session_id);

    if (count && count > 1) {
      await adminClient
        .from('page_views')
        .update({ is_bounce: false })
        .eq('session_id', data.session_id);
    }
  } else {
    // Duration update — update the most recent page view for this session+path
    const { error } = await adminClient
      .from('page_views')
      .update({ duration_ms: data.duration_ms })
      .eq('session_id', data.session_id)
      .eq('page_path', data.page_path)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('[PageView] Duration update failed:', error.message);
    }
  }

  return NextResponse.json({ ok: true });
}
