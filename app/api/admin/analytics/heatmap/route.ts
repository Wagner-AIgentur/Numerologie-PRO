import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';

const GRID_COLS = 10;
const GRID_ROWS = 10;

/**
 * GET /api/admin/analytics/heatmap?days=30&page=/de/pakete
 *
 * Returns click analytics: page stats, top elements, heat grid.
 */
export async function GET(request: NextRequest) {
  const user = await requirePermission('analytics.view');
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const days = Math.min(Number(searchParams.get('days') ?? '30'), 365);
  const selectedPage = searchParams.get('page') ?? null;

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceISO = since.toISOString();

  // ---- 1) Page stats: click count per page ----
  const { data: allClicks, error: clicksError } = await adminClient
    .from('click_events')
    .select('page_path, element_tag, element_text, element_href, section, x_percent, y_percent')
    .gte('created_at', sinceISO)
    .order('created_at', { ascending: false })
    .limit(10000);

  if (clicksError) {
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  const clicks = allClicks ?? [];

  // Aggregate page stats
  const pageMap = new Map<string, number>();
  for (const c of clicks) {
    pageMap.set(c.page_path, (pageMap.get(c.page_path) ?? 0) + 1);
  }

  const pageStats = Array.from(pageMap.entries())
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count);

  // ---- 2) Filter by selected page (or use top page) ----
  const targetPage = selectedPage ?? pageStats[0]?.page ?? null;
  const pageClicks = targetPage
    ? clicks.filter((c) => c.page_path === targetPage)
    : [];

  // ---- 3) Top elements ----
  const elementMap = new Map<string, { tag: string; text: string | null; href: string | null; count: number }>();
  for (const c of pageClicks) {
    const key = `${c.element_tag}::${c.element_text ?? ''}::${c.element_href ?? ''}`;
    const existing = elementMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      elementMap.set(key, {
        tag: c.element_tag ?? '',
        text: c.element_text,
        href: c.element_href,
        count: 1,
      });
    }
  }

  const topElements = Array.from(elementMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // ---- 4) Heat grid (10x10) ----
  const grid: number[][] = Array.from({ length: GRID_ROWS }, () =>
    Array(GRID_COLS).fill(0)
  );

  for (const c of pageClicks) {
    const col = Math.min(Math.floor(((c.x_percent ?? 0) / 100) * GRID_COLS), GRID_COLS - 1);
    const row = Math.min(Math.floor(((c.y_percent ?? 0) / 100) * GRID_ROWS), GRID_ROWS - 1);
    grid[row][col]++;
  }

  // ---- 5) Section stats ----
  const sectionMap = new Map<string, number>();
  for (const c of pageClicks) {
    if (c.section) {
      sectionMap.set(c.section, (sectionMap.get(c.section) ?? 0) + 1);
    }
  }

  const sectionStats = Array.from(sectionMap.entries())
    .map(([section, count]) => ({ section, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    days,
    selectedPage: targetPage,
    totalClicks: clicks.length,
    pageStats,
    topElements,
    heatGrid: grid,
    sectionStats,
  });
}
