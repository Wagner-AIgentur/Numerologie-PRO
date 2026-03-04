import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/admin-guard';
import { validateBody, zodErrorResponse, affiliateCreateSchema, affiliateUpdateSchema } from '@/lib/validations/admin';
import { createStripeCoupon } from '@/lib/stripe/sync-coupon';

// GET: List all affiliates with their coupon data
export async function GET() {
  if (!(await requirePermission('affiliates.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await adminClient
    .from('affiliates')
    .select('*, coupons!affiliates_coupon_id_fkey(id, code, type, value, used_count, active, stripe_coupon_id)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Affiliates GET error:', error);
    // Fallback without join
    const { data: fallback } = await adminClient
      .from('affiliates')
      .select('*')
      .order('created_at', { ascending: false });
    return NextResponse.json(fallback ?? []);
  }

  return NextResponse.json(data);
}

// POST: Create affiliate + auto-generate coupon
export async function POST(request: NextRequest) {
  if (!(await requirePermission('affiliates.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: body, error: validationError } = await validateBody(request, affiliateCreateSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const { name, email, commission_percent, discount_percent, notes, sync_to_stripe } = body;

  // Generate unique tracking code
  const trackingCode = `AFF-${randomCode(8)}`;

  // Generate unique coupon code for this affiliate
  const namePrefix = name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'AFF';
  const couponCode = `${namePrefix}${randomCode(4)}`;

  // Create coupon in DB (+ optional Stripe sync)
  let stripe_coupon_id: string | null = null;
  let stripe_promotion_code_id: string | null = null;

  if (sync_to_stripe) {
    try {
      const result = await createStripeCoupon({
        code: couponCode,
        type: 'percent',
        value: discount_percent ?? 10,
      });
      stripe_coupon_id = result.stripe_coupon_id;
      stripe_promotion_code_id = result.stripe_promotion_code_id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Stripe sync failed';
      return NextResponse.json({ error: `Stripe-Fehler: ${msg}` }, { status: 400 });
    }
  }

  // Insert coupon first
  const { data: coupon, error: couponErr } = await adminClient
    .from('coupons')
    .insert({
      code: couponCode,
      type: 'percent',
      value: discount_percent ?? 10,
      applies_to: 'all',
      purpose: 'affiliate',
      active: true,
      stripe_coupon_id,
      stripe_promotion_code_id,
    })
    .select()
    .single();

  if (couponErr) {
    console.error('Affiliate coupon create error:', couponErr);
    return NextResponse.json({ error: 'Coupon-Erstellung fehlgeschlagen' }, { status: 500 });
  }

  // Insert affiliate
  const { data: affiliate, error: affErr } = await adminClient
    .from('affiliates')
    .insert({
      name,
      email,
      commission_percent,
      coupon_id: coupon.id,
      tracking_code: trackingCode,
      notes: notes ?? null,
    })
    .select()
    .single();

  if (affErr) {
    console.error('Affiliate create error:', affErr);
    // Clean up orphan coupon
    await adminClient.from('coupons').delete().eq('id', coupon.id);
    return NextResponse.json({ error: 'Affiliate-Erstellung fehlgeschlagen' }, { status: 500 });
  }

  // Link coupon back to affiliate
  await adminClient
    .from('coupons')
    .update({ affiliate_id: affiliate.id })
    .eq('id', coupon.id);

  return NextResponse.json({ affiliate: { ...affiliate, coupons: coupon } }, { status: 201 });
}

// PATCH: Update affiliate
export async function PATCH(request: NextRequest) {
  if (!(await requirePermission('affiliates.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: body, error: validationError } = await validateBody(request, affiliateUpdateSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const { id, ...rest } = body;
  if (!id) {
    return NextResponse.json({ error: 'Missing affiliate id' }, { status: 400 });
  }

  const allowed = ['name', 'email', 'commission_percent', 'notes', 'is_active'];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in rest) updates[key] = (rest as Record<string, unknown>)[key];
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await adminClient
    .from('affiliates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Update fehlgeschlagen' }, { status: 500 });
  }

  return NextResponse.json({ affiliate: data });
}

// DELETE: Soft-deactivate affiliate
export async function DELETE(request: NextRequest) {
  if (!(await requirePermission('affiliates.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing affiliate id' }, { status: 400 });
  }

  const { error } = await adminClient
    .from('affiliates')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Deaktivierung fehlgeschlagen' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

function randomCode(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
