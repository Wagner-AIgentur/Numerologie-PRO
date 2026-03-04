import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ paid: false, error: 'Missing session_id' }, { status: 400 });
  }

  // Require authentication to prevent PII leakage
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ paid: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the session belongs to this user (strict: always require match)
    const sessionOwner = session.metadata?.profile_id;
    const sessionEmail = session.customer_email ?? session.customer_details?.email;
    if (
      (sessionOwner && sessionOwner !== user.id) ||
      (!sessionOwner && sessionEmail && sessionEmail !== user.email)
    ) {
      return NextResponse.json({ paid: false, error: 'Forbidden' }, { status: 403 });
    }

    if (session.payment_status === 'paid') {
      return NextResponse.json({
        paid: true,
        package_key: session.metadata?.package_key ?? '',
        birthdate: session.metadata?.birthdate ?? '',
        cal_link: session.metadata?.cal_link ?? '',
        locale: session.metadata?.locale ?? 'de',
      });
    }

    return NextResponse.json({ paid: false });
  } catch (error) {
    console.error('Stripe session verification failed:', error);
    return NextResponse.json({ paid: false, error: 'Verification failed' }, { status: 500 });
  }
}
