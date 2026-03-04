import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? `/${locale}/dashboard`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Code exchange succeeded — user is now logged in
      const lang = locale === 'ru' ? 'ru' : 'de';
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles')
          .update({ language: lang })
          .eq('id', user.id);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    // PKCE code exchange failed — email was confirmed by Supabase before redirect
    return NextResponse.redirect(`${origin}/${locale}/auth/login?confirmed=true`);
  }

  // No code parameter — Supabase may redirect with error params instead of code
  // when PKCE can't complete (admin.generateLink registration flow).
  // The email IS confirmed before Supabase redirects, so show success.
  const hasSupabaseError = searchParams.get('error') || searchParams.get('error_code');
  if (hasSupabaseError) {
    return NextResponse.redirect(`${origin}/${locale}/auth/login?confirmed=true`);
  }

  // Truly no context — someone navigated here directly
  return NextResponse.redirect(`${origin}/${locale}/auth/login`);
}
