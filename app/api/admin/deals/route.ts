import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, dealCreateSchema } from '@/lib/validations/admin';
import { getPagination, paginatedResponse } from '@/lib/pagination';

/**
 * GET /api/admin/deals — List deals with optional filters + pagination
 * Query params: stage, profile_id, page, limit
 */
export async function GET(request: NextRequest) {
  const user = await requirePermission('deals.view');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get('stage');
  const profileId = searchParams.get('profile_id');
  const { page, limit, offset } = getPagination(request);

  let query = adminClient
    .from('deals')
    .select('*, profiles!deals_profile_id_fkey(id, email, full_name), products(id, name_de, name_ru)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (stage) {
    query = query.eq('stage', stage);
  }
  if (profileId) {
    query = query.eq('profile_id', profileId);
  }

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, { page, limit, offset }));
}

/**
 * POST /api/admin/deals — Create a new deal
 */
export async function POST(request: NextRequest) {
  const user = await requirePermission('deals.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: body, error: validationError } = await validateBody(request, dealCreateSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }
  const { profile_id, title, product_id, value_cents, currency, stage, probability, expected_close_date, notes } = body as any;

  const insertData = {
    profile_id: profile_id as string,
    title: (title as string).trim(),
    product_id: (product_id as string | null) ?? null,
    value_cents: (value_cents as number | null) ?? 0,
    currency: (currency as string | null) ?? 'eur',
    stage: (stage as string | null) ?? 'new',
    probability: (probability as number | null) ?? 50,
    expected_close_date: (expected_close_date as string | null) ?? null,
    notes: (notes as string | null) ?? null,
    won_at: null as string | null,
    lost_at: null as string | null,
  };

  // If creating as won/lost, set timestamps
  if (insertData.stage === 'won') {
    insertData.won_at = new Date().toISOString();
  } else if (insertData.stage === 'lost') {
    insertData.lost_at = new Date().toISOString();
  }

  const { data, error } = await adminClient
    .from('deals')
    .insert(insertData)
    .select('*, profiles!deals_profile_id_fkey(id, email, full_name), products(id, name_de, name_ru)')
    .single();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
