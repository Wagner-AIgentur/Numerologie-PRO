import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { getGA4Client, GA4_PROPERTY_ID } from '@/lib/analytics/ga4-client';

/**
 * GET /api/admin/analytics/ga4?days=30
 *
 * Returns Google Analytics 4 data: sessions, users, geo, channels, realtime.
 */
export async function GET(request: NextRequest) {
  const user = await requirePermission('analytics.view');
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getGA4Client();
  if (!client) {
    return NextResponse.json({ error: 'GA4 not configured' }, { status: 503 });
  }

  const { searchParams } = request.nextUrl;
  const days = Math.min(Number(searchParams.get('days') ?? '30'), 365);
  const property = `properties/${GA4_PROPERTY_ID}`;

  try {
    // Run 3 reports in parallel
    const [trendResult, geoChannelResult, realtimeResult] = await Promise.all([
      // 1) Daily trend report
      client.runReport({
        property,
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'newUsers' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
          { name: 'engagementRate' },
        ],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
      }),

      // 2) Geo + Channel breakdown
      client.runReport({
        property,
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [
          { name: 'country' },
          { name: 'city' },
          { name: 'sessionDefaultChannelGroup' },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
        ],
        limit: 500,
      }),

      // 3) Realtime report
      client.runRealtimeReport({
        property,
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'unifiedScreenName' }],
        limit: 10,
      }).catch(() => null), // Realtime may fail if no active users
    ]);

    // --- Parse daily trend ---
    const dailyTrend: { date: string; sessions: number; users: number; pageViews: number }[] = [];
    let totalSessions = 0;
    let totalUsers = 0;
    let totalNewUsers = 0;
    let totalPageViews = 0;
    let durationSum = 0;
    let bounceSum = 0;
    let engagementSum = 0;
    let rowCount = 0;

    for (const row of trendResult[0]?.rows ?? []) {
      const dateRaw = row.dimensionValues?.[0]?.value ?? '';
      const date = dateRaw.length === 8
        ? `${dateRaw.slice(0, 4)}-${dateRaw.slice(4, 6)}-${dateRaw.slice(6, 8)}`
        : dateRaw;

      const sessions = Number(row.metricValues?.[0]?.value ?? 0);
      const users = Number(row.metricValues?.[1]?.value ?? 0);
      const newUsers = Number(row.metricValues?.[2]?.value ?? 0);
      const pageViews = Number(row.metricValues?.[3]?.value ?? 0);
      const avgDuration = Number(row.metricValues?.[4]?.value ?? 0);
      const bounce = Number(row.metricValues?.[5]?.value ?? 0);
      const engagement = Number(row.metricValues?.[6]?.value ?? 0);

      dailyTrend.push({ date, sessions, users, pageViews });

      totalSessions += sessions;
      totalUsers += users;
      totalNewUsers += newUsers;
      totalPageViews += pageViews;
      durationSum += avgDuration;
      bounceSum += bounce;
      engagementSum += engagement;
      rowCount++;
    }

    const avgSessionDuration = rowCount > 0 ? Math.round(durationSum / rowCount) : 0;
    const bounceRate = rowCount > 0 ? Math.round((bounceSum / rowCount) * 1000) / 10 : 0;
    const engagementRate = rowCount > 0 ? Math.round((engagementSum / rowCount) * 1000) / 10 : 0;

    // --- Parse geo + channel data ---
    const countryMap = new Map<string, { sessions: number; users: number }>();
    const cityMap = new Map<string, { sessions: number; users: number }>();
    const channelMap = new Map<string, { sessions: number; users: number }>();

    for (const row of geoChannelResult[0]?.rows ?? []) {
      const country = row.dimensionValues?.[0]?.value ?? '(unknown)';
      const city = row.dimensionValues?.[1]?.value ?? '(unknown)';
      const channel = row.dimensionValues?.[2]?.value ?? '(unknown)';
      const sessions = Number(row.metricValues?.[0]?.value ?? 0);
      const users = Number(row.metricValues?.[1]?.value ?? 0);

      // Aggregate countries
      const c = countryMap.get(country);
      if (c) { c.sessions += sessions; c.users += users; }
      else countryMap.set(country, { sessions, users });

      // Aggregate cities
      if (city !== '(not set)') {
        const ci = cityMap.get(city);
        if (ci) { ci.sessions += sessions; ci.users += users; }
        else cityMap.set(city, { sessions, users });
      }

      // Aggregate channels
      const ch = channelMap.get(channel);
      if (ch) { ch.sessions += sessions; ch.users += users; }
      else channelMap.set(channel, { sessions, users });
    }

    const countries = Array.from(countryMap.entries())
      .map(([country, d]) => ({ country, ...d }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    const cities = Array.from(cityMap.entries())
      .map(([city, d]) => ({ city, ...d }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    const channels = Array.from(channelMap.entries())
      .map(([channel, d]) => ({ channel, ...d }))
      .sort((a, b) => b.sessions - a.sessions);

    // --- Parse realtime ---
    let activeUsers = 0;
    const realtimePages: { page: string; users: number }[] = [];

    if (realtimeResult?.[0]) {
      for (const row of realtimeResult[0].rows ?? []) {
        const page = row.dimensionValues?.[0]?.value ?? '';
        const users = Number(row.metricValues?.[0]?.value ?? 0);
        activeUsers += users;
        if (page) realtimePages.push({ page, users });
      }
    }

    return NextResponse.json({
      days,
      realtime: { activeUsers, topPages: realtimePages.slice(0, 5) },
      overview: {
        totalSessions,
        totalUsers,
        newUsers: totalNewUsers,
        pageViews: totalPageViews,
        avgSessionDuration,
        bounceRate,
        engagementRate,
      },
      dailyTrend,
      countries,
      cities,
      channels,
    });
  } catch (err) {
    console.error('[GA4] API error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'GA4 API error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
