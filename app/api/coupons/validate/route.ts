import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { PACKAGES, type PackageKey } from '@/lib/stripe/products';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 requests per minute per IP (prevent brute-force on coupon codes)
    const ip = getClientIp(request);
    if (!await rateLimit(`coupon:${ip}`, { max: 10, windowSeconds: 60 })) {
      return NextResponse.json({ valid: false, error: 'rate_limited' }, { status: 429 });
    }

    const body = await request.json();
    const { code, packageKey, email } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'missing_code' }, { status: 400 });
    }

    const trimmedCode = code.trim().toUpperCase();

    // Fetch coupon
    const { data: coupon, error } = await adminClient
      .from('coupons')
      .select('*')
      .eq('code', trimmedCode)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: 'invalid_code' });
    }

    // Check active
    if (!coupon.active) {
      return NextResponse.json({ valid: false, error: 'inactive' });
    }

    // Check valid_from / valid_until
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({ valid: false, error: 'not_yet_valid' });
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json({ valid: false, error: 'expired' });
    }

    // Check max_uses
    if (coupon.max_uses !== null && (coupon.used_count ?? 0) >= coupon.max_uses) {
      return NextResponse.json({ valid: false, error: 'max_uses_reached' });
    }

    // Check applies_to
    const pkg = packageKey ?? 'pdf_analyse';
    if (coupon.applies_to !== 'all') {
      if (coupon.applies_to === 'pdf_analyse' && pkg !== 'pdf_analyse') {
        return NextResponse.json({ valid: false, error: 'not_applicable' });
      }
      if (coupon.applies_to === 'packages' && pkg === 'pdf_analyse') {
        return NextResponse.json({ valid: false, error: 'not_applicable' });
      }
    }

    // Check duplicate usage by email
    if (email) {
      const { data: existingUsage } = await adminClient
        .from('coupon_usages')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('email', email)
        .single();

      if (existingUsage) {
        return NextResponse.json({ valid: false, error: 'already_used' });
      }
    }

    // Resolve the actual package price (instead of hardcoded PDF price)
    const resolvedKey = (pkg in PACKAGES ? pkg : 'pdf_analyse') as PackageKey;
    const priceCents = PACKAGES[resolvedKey]?.price_cents ?? 999;

    // Calculate discount
    let discountCents: number;
    if (coupon.type === 'percent') {
      discountCents = Math.round(priceCents * (coupon.value / 100));
    } else {
      discountCents = Math.round(coupon.value * 100); // value is in EUR
    }

    const finalPriceCents = Math.max(0, priceCents - discountCents);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount_cents: discountCents,
      final_price_cents: finalPriceCents,
      stripe_promotion_code_id: coupon.stripe_promotion_code_id,
    });
  } catch (err) {
    console.error('Coupon validation error:', err);
    return NextResponse.json({ valid: false, error: 'server_error' }, { status: 500 });
  }
}
