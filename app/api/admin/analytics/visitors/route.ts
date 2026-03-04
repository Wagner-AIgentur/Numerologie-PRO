import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/analytics/visitors?days=30
 *
 * Returns visitor/traffic analytics: page views, unique visitors,
 * device/browser/os stats, referrers, UTM campaigns, bounce rate.
 */
export async function GET(request: NextRequest) {
  const user = await requirePermission('analytics.view');
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const days = Math.min(Number(searchParams.get('days') ?? '30'), 365);

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceISO = since.toISOString();

  // Fetch all page views in the time range (limit 50k for performance)
  const { data: rows, error } = await adminClient
    .from('page_views')
    .select('session_id, page_path, referrer, utm_source, utm_medium, utm_campaign, device_type, browser, os, language, duration_ms, is_bounce, created_at')
    .gte('created_at', sinceISO)
    .order('created_at', { ascending: false })
    .limit(50000);

  if (error) {
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  const views = rows ?? [];
  const totalPageViews = views.length;

  // Unique visitors (by session_id)
  const sessionSet = new Set<string>();
  for (const v of views) sessionSet.add(v.session_id);
  const uniqueVisitors = sessionSet.size;

  // Average duration (only views with duration_ms > 0)
  let durationSum = 0;
  let durationCount = 0;
  for (const v of views) {
    if (v.duration_ms && v.duration_ms > 0) {
      durationSum += v.duration_ms;
      durationCount++;
    }
  }
  const avgDurationSec = durationCount > 0 ? Math.round(durationSum / durationCount / 1000) : 0;

  // Bounce rate (% of sessions with only bounced views)
  const sessionBounce = new Map<string, boolean>();
  for (const v of views) {
    const current = sessionBounce.get(v.session_id);
    if (current === undefined) {
      sessionBounce.set(v.session_id, v.is_bounce);
    } else if (!v.is_bounce) {
      sessionBounce.set(v.session_id, false);
    }
  }
  let bouncedSessions = 0;
  for (const isBounce of sessionBounce.values()) {
    if (isBounce) bouncedSessions++;
  }
  const bounceRate = uniqueVisitors > 0 ? Math.round((bouncedSessions / uniqueVisitors) * 1000) / 10 : 0;

  // Views by day
  const dayMap = new Map<string, { views: number; sessions: Set<string> }>();
  for (const v of views) {
    const date = v.created_at.slice(0, 10);
    const entry = dayMap.get(date);
    if (entry) {
      entry.views++;
      entry.sessions.add(v.session_id);
    } else {
      dayMap.set(date, { views: 1, sessions: new Set([v.session_id]) });
    }
  }
  const viewsByDay = Array.from(dayMap.entries())
    .map(([date, d]) => ({ date, views: d.views, visitors: d.sessions.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top pages
  const pageMap = new Map<string, { views: number; sessions: Set<string>; durationSum: number; durationCount: number }>();
  for (const v of views) {
    const entry = pageMap.get(v.page_path);
    if (entry) {
      entry.views++;
      entry.sessions.add(v.session_id);
      if (v.duration_ms && v.duration_ms > 0) {
        entry.durationSum += v.duration_ms;
        entry.durationCount++;
      }
    } else {
      pageMap.set(v.page_path, {
        views: 1,
        sessions: new Set([v.session_id]),
        durationSum: v.duration_ms && v.duration_ms > 0 ? v.duration_ms : 0,
        durationCount: v.duration_ms && v.duration_ms > 0 ? 1 : 0,
      });
    }
  }
  const topPages = Array.from(pageMap.entries())
    .map(([page, d]) => ({
      page,
      views: d.views,
      visitors: d.sessions.size,
      avgDuration: d.durationCount > 0 ? Math.round(d.durationSum / d.durationCount / 1000) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 15);

  // Device stats
  const deviceMap = new Map<string, number>();
  for (const v of views) {
    const d = v.device_type ?? 'unknown';
    deviceMap.set(d, (deviceMap.get(d) ?? 0) + 1);
  }
  const deviceStats = Array.from(deviceMap.entries())
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);

  // Browser stats
  const browserMap = new Map<string, number>();
  for (const v of views) {
    const b = v.browser ?? 'Unknown';
    browserMap.set(b, (browserMap.get(b) ?? 0) + 1);
  }
  const browserStats = Array.from(browserMap.entries())
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // OS stats
  const osMap = new Map<string, number>();
  for (const v of views) {
    const o = v.os ?? 'Unknown';
    osMap.set(o, (osMap.get(o) ?? 0) + 1);
  }
  const osStats = Array.from(osMap.entries())
    .map(([os, count]) => ({ os, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Referrer stats
  const referrerMap = new Map<string, number>();
  for (const v of views) {
    if (!v.referrer) continue;
    let host: string;
    try {
      host = new URL(v.referrer).hostname.replace(/^www\./, '');
    } catch {
      host = v.referrer;
    }
    // Skip self-referrer
    if (host.includes('numerologie-pro')) continue;
    referrerMap.set(host, (referrerMap.get(host) ?? 0) + 1);
  }
  const referrerStats = Array.from(referrerMap.entries())
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // UTM stats
  const utmMap = new Map<string, { source: string; medium: string; campaign: string; count: number }>();
  for (const v of views) {
    if (!v.utm_source) continue;
    const key = `${v.utm_source}::${v.utm_medium ?? ''}::${v.utm_campaign ?? ''}`;
    const entry = utmMap.get(key);
    if (entry) {
      entry.count++;
    } else {
      utmMap.set(key, {
        source: v.utm_source,
        medium: v.utm_medium ?? '',
        campaign: v.utm_campaign ?? '',
        count: 1,
      });
    }
  }
  const utmStats = Array.from(utmMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Language stats
  const langMap = new Map<string, number>();
  for (const v of views) {
    const lang = v.language?.slice(0, 2) ?? 'unknown';
    langMap.set(lang, (langMap.get(lang) ?? 0) + 1);
  }
  const languageStats = Array.from(langMap.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return NextResponse.json({
    days,
    totalPageViews,
    uniqueVisitors,
    avgDurationSec,
    bounceRate,
    viewsByDay,
    topPages,
    deviceStats,
    browserStats,
    osStats,
    referrerStats,
    utmStats,
    languageStats,
  });
}
