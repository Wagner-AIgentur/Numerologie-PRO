import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';

export async function GET() {
  if (!(await requirePermission('content.edit'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await adminClient
    .from('content_triggers')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  return NextResponse.json({ triggers: data ?? [] });
}
