import { NextRequest, NextResponse } from 'next/server';
import { safeCompare } from '@/lib/rate-limit';
import { adminClient } from '@/lib/supabase/admin';

/**
 * POST /api/n8n/profile-lookup
 *
 * Secure profile lookup for n8n workflows.
 * Uses service_role key (bypasses RLS) instead of anon key.
 *
 * Body:
 *   { email?: string, profile_id?: string, birthdate_today?: boolean }
 *
 * Returns: profile data array
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || !safeCompare(authHeader ?? '', `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { email, profile_id, birthdate_today } = body as {
    email?: string;
    profile_id?: string;
    birthdate_today?: boolean;
  };

  const select = 'id, full_name, email, telegram_chat_id, language, birthdate';

  // Birthday lookup: find all profiles with today's birthday
  if (birthdate_today) {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const pattern = `%-${mm}-${dd}`;

    const { data, error } = await adminClient
      .from('profiles')
      .select(select)
      .not('telegram_chat_id', 'is', null)
      .like('birthdate', pattern);

    if (error) {
      console.error('[Profile Lookup] Birthday query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  }

  // Single profile lookup by email or profile_id
  if (!email && !profile_id) {
    return NextResponse.json({ error: 'email or profile_id required' }, { status: 400 });
  }

  let query = adminClient.from('profiles').select(select);

  if (profile_id) {
    query = query.eq('id', profile_id);
  } else if (email) {
    query = query.eq('email', email);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Profile Lookup] Query error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
