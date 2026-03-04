import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * POST /api/referral/track
 *
 * Called when a referred user completes a purchase.
 * Creates a referral entry and (if converted) rewards the referrer.
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(req);
    if (!await rateLimit(`referral:${ip}`, { max: 5, windowSeconds: 60 })) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Require authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { referralCode, referredProfileId, converted } = await req.json();

    // Ensure the referredProfileId matches the authenticated user
    if (referredProfileId && referredProfileId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!referralCode) {
      return NextResponse.json({ error: 'Missing referral code' }, { status: 400 });
    }

    // Find the referrer by code
    const { data: referrer } = await adminClient
      .from('profiles')
      .select('id, telegram_chat_id, language')
      .eq('referral_code', referralCode)
      .single();

    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // Check if this referral already exists
    const { data: existing } = await adminClient
      .from('referrals')
      .select('id')
      .eq('code', referralCode)
      .eq('referred_profile_id', referredProfileId)
      .single();

    if (existing) {
      // Update if now converted
      if (converted) {
        await adminClient
          .from('referrals')
          .update({ status: 'converted' })
          .eq('id', existing.id);
      }
      return NextResponse.json({ ok: true, existing: true });
    }

    // Create referral entry
    await adminClient.from('referrals').insert({
      referrer_profile_id: referrer.id,
      referred_profile_id: referredProfileId ?? null,
      code: referralCode,
      status: converted ? 'converted' : 'pending',
    });

    // If converted, notify referrer via Telegram
    if (converted && referrer.telegram_chat_id) {
      const { sendMessage } = await import('@/lib/telegram/bot');
      const locale = (referrer.language ?? 'de') as 'de' | 'ru';

      await sendMessage({
        chat_id: referrer.telegram_chat_id,
        text: locale === 'de'
          ? '🎉 <b>Deine Empfehlung hat gebucht!</b>\n\nDein 15%-Gutschein wird bald erstellt. Vielen Dank fürs Weiterempfehlen!'
          : '🎉 <b>Твой приглашённый сделал покупку!</b>\n\nТвой купон на 15% скоро будет создан. Спасибо за рекомендацию!',
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Referral Track] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
