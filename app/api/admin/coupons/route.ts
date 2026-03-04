import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/admin-guard';
import { validateBody, zodErrorResponse, couponCreateSchema, couponUpdateSchema } from '@/lib/validations/admin';
import { createStripeCoupon, deactivateStripeCoupon } from '@/lib/stripe/sync-coupon';

// GET: List all coupons
export async function GET() {
  if (!(await requirePermission('coupons.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await adminClient
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST: Create coupon (with optional Stripe auto-sync)
export async function POST(request: NextRequest) {
  if (!(await requirePermission('coupons.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: body, error: validationError } = await validateBody(request, couponCreateSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }

  const {
    code, discount_type: type, discount_value: value, max_uses,
    valid_from, valid_until, package_keys, is_active,
    purpose, affiliate_id, sync_to_stripe,
  } = body;

  const cleanCode = code.trim().toUpperCase();
  let stripe_coupon_id: string | null = null;
  let stripe_promotion_code_id: string | null = null;

  // Auto-create in Stripe if requested
  if (sync_to_stripe) {
    try {
      const result = await createStripeCoupon({
        code: cleanCode,
        type,
        value,
        maxUses: max_uses ?? null,
        validUntil: valid_until ?? null,
      });
      stripe_coupon_id = result.stripe_coupon_id;
      stripe_promotion_code_id = result.stripe_promotion_code_id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Stripe sync failed';
      return NextResponse.json({ error: `Stripe-Fehler: ${msg}` }, { status: 400 });
    }
  }

  const applies_to = package_keys?.length === 1 && package_keys[0] === 'pdf_analyse'
    ? 'pdf_analyse'
    : package_keys?.length ? 'packages' : 'all';

  const { data, error } = await adminClient
    .from('coupons')
    .insert({
      code: cleanCode,
      type,
      value,
      max_uses: max_uses ?? null,
      valid_from: valid_from ?? new Date().toISOString(),
      valid_until: valid_until ?? null,
      applies_to,
      active: is_active ?? true,
      purpose: purpose ?? 'general',
      affiliate_id: affiliate_id ?? null,
      stripe_coupon_id,
      stripe_promotion_code_id,
    })
    .select()
    .single();

  if (error) {
    console.error('Coupon create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ coupon: data }, { status: 201 });
}

// PATCH: Update coupon
export async function PATCH(request: NextRequest) {
  if (!(await requirePermission('coupons.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: body, error: validationError } = await validateBody(request, couponUpdateSchema);
  if (validationError) {
    return NextResponse.json(zodErrorResponse(validationError), { status: 400 });
  }
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing coupon id' }, { status: 400 });
  }

  const allowed = [
    'code', 'type', 'value', 'max_uses', 'valid_from', 'valid_until',
    'applies_to', 'active', 'stripe_coupon_id', 'stripe_promotion_code_id',
    'purpose', 'affiliate_id',
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = (body as Record<string, unknown>)[key];
  }

  if (updates.code) {
    updates.code = (updates.code as string).trim().toUpperCase();
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await adminClient
    .from('coupons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ coupon: data });
}

// DELETE: Soft-deactivate coupon (+ deactivate in Stripe)
export async function DELETE(request: NextRequest) {
  if (!(await requirePermission('coupons.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing coupon id' }, { status: 400 });
  }

  // Check if coupon has Stripe ID — deactivate there too
  const { data: coupon } = await adminClient
    .from('coupons')
    .select('stripe_coupon_id')
    .eq('id', id)
    .single();

  if (coupon?.stripe_coupon_id) {
    await deactivateStripeCoupon(coupon.stripe_coupon_id);
  }

  const { error } = await adminClient
    .from('coupons')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
