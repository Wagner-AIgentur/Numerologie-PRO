/**
 * Stripe Coupon & Promotion Code Sync
 *
 * Creates/deactivates Stripe Coupons and Promotion Codes
 * from the admin coupon management UI.
 */

import { stripe } from './client';

interface SyncCouponParams {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  maxUses?: number | null;
  validUntil?: string | null;
}

interface SyncResult {
  stripe_coupon_id: string;
  stripe_promotion_code_id: string;
}

/**
 * Create a Stripe Coupon + Promotion Code.
 * Uses `NUMPRO_` prefix for idempotent coupon IDs.
 */
export async function createStripeCoupon(params: SyncCouponParams): Promise<SyncResult> {
  const couponId = `NUMPRO_${params.code}`;

  // Build coupon creation params
  const couponParams: Record<string, unknown> = {
    id: couponId,
    name: `Numerologie PRO: ${params.code}`,
    duration: 'once',
  };

  if (params.type === 'percent') {
    couponParams.percent_off = params.value;
  } else {
    couponParams.amount_off = Math.round(params.value * 100); // EUR → cents
    couponParams.currency = 'eur';
  }

  if (params.maxUses) {
    couponParams.max_redemptions = params.maxUses;
  }

  if (params.validUntil) {
    couponParams.redeem_by = Math.floor(new Date(params.validUntil).getTime() / 1000);
  }

  // Create or retrieve existing coupon
  let stripeCoupon;
  try {
    stripeCoupon = await stripe.coupons.create(couponParams as Parameters<typeof stripe.coupons.create>[0]);
  } catch (err: unknown) {
    const stripeErr = err as { code?: string };
    if (stripeErr.code === 'resource_already_exists') {
      stripeCoupon = await stripe.coupons.retrieve(couponId);
    } else {
      throw err;
    }
  }

  // Create the customer-facing Promotion Code
  // API 2026-01-28.clover uses nested promotion object
  const promoParams: Record<string, unknown> = {
    promotion: { type: 'coupon', coupon: stripeCoupon.id },
    code: params.code,
  };

  if (params.maxUses) {
    promoParams.max_redemptions = params.maxUses;
  }

  if (params.validUntil) {
    promoParams.expires_at = Math.floor(new Date(params.validUntil).getTime() / 1000);
  }

  const promoCode = await stripe.promotionCodes.create(
    promoParams as unknown as Parameters<typeof stripe.promotionCodes.create>[0]
  );

  return {
    stripe_coupon_id: stripeCoupon.id,
    stripe_promotion_code_id: promoCode.id,
  };
}

/**
 * Deactivate a Stripe Coupon (deletes it to prevent future use).
 */
export async function deactivateStripeCoupon(stripeCouponId: string): Promise<void> {
  try {
    await stripe.coupons.del(stripeCouponId);
  } catch (err) {
    // Log but don't throw — coupon may already be deleted in Stripe
    console.error('[Stripe] Failed to deactivate coupon:', stripeCouponId, err);
  }
}
