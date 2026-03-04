import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, adminRateLimit } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { cached, CacheTags } from '@/lib/cache';

/**
 * GET /api/admin/dashboard/stats
 * Returns KPI counts for the admin dashboard.
 * Cached for 60 seconds to reduce DB load.
 */
export async function GET(request: NextRequest) {
  const user = await requirePermission('analytics.view');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!await adminRateLimit(request)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const stats = await cached(
      async () => {
        const [
          { count: totalKunden },
          { count: neueAnfragen },
          { count: offeneBestellungen },
          { count: geplanteTermine },
        ] = await Promise.all([
          adminClient.from('profiles').select('*', { count: 'exact', head: true }).neq('crm_status', 'admin'),
          adminClient.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('status', 'new'),
          adminClient.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
          adminClient.from('sessions').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
        ]);

        return {
          totalKunden: totalKunden ?? 0,
          neueAnfragen: neueAnfragen ?? 0,
          offeneBestellungen: offeneBestellungen ?? 0,
          geplanteTermine: geplanteTermine ?? 0,
        };
      },
      ['dashboard-stats'],
      [CacheTags.DASHBOARD],
      60
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[Dashboard Stats] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
