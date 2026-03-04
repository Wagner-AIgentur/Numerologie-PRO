import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/admin-guard';
import { adminClient } from '@/lib/supabase/admin';
import { validateBody, zodErrorResponse, dealUpdateSchema, isValidUUID } from '@/lib/validations/admin';

interface Params { params: Promise<{ id: string }> }

/**
 * GET /api/admin/deals/[id] — Get a single deal with profile + product
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await requirePermission('deals.view');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { data, error } = await adminClient
    .from('deals')
    .select('*, profiles!deals_profile_id_fkey(id, email, full_name), products(id, name_de, name_ru)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

/**
 * PATCH /api/admin/deals/[id] — Update deal (stage changes, value, etc.)
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await requirePermission('deals.edit');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const { data: body, error: validationError } = await validateBody(request, dealUpdateSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const allowed = [
    'title', 'product_id', 'value_cents', 'currency',
    'stage', 'probability', 'expected_close_date',
    'won_at', 'lost_at', 'lost_reason', 'notes',
  ];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const key of allowed) {
    if (key in body) updates[key] = (body as Record<string, unknown>)[key];
  }

  // Auto-set timestamps on stage transitions
  if (updates.stage === 'won') {
    updates.won_at = updates.won_at ?? new Date().toISOString();
    updates.probability = 100;
  } else if (updates.stage === 'lost') {
    updates.lost_at = updates.lost_at ?? new Date().toISOString();
    updates.probability = 0;
  } else if (updates.stage && updates.stage !== 'won' && updates.stage !== 'lost') {
    // Moving back from won/lost → clear timestamps
    updates.won_at = null;
    updates.lost_at = null;
    updates.lost_reason = null;
  }

  const { data, error } = await adminClient
    .from('deals')
    .update(updates)
    .eq('id', id)
    .select('*, profiles!deals_profile_id_fkey(id, email, full_name), products(id, name_de, name_ru)')
    .single();

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json(data);
}

/**
 * DELETE /api/admin/deals/[id] — Delete deal permanently
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await requirePermission('team.manage');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const { error } = await adminClient
    .from('deals')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json({ success: true });
}
