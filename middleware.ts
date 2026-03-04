import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const protectedRoutes = ['/dashboard', '/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip all API routes from intl middleware (but add defense-in-depth for admin APIs)
  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/admin/')) {
      // Defense-in-depth: reject unauthenticated requests to admin APIs at middleware level
      const supabaseCheck = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return request.cookies.getAll(); },
            setAll() {},
          },
        }
      );
      const { data: { user: apiUser } } = await supabaseCheck.auth.getUser();
      if (!apiUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    return NextResponse.next();
  }

  // Run Supabase session refresh
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Check if route needs protection (strip locale prefix)
  const strippedPath = pathname.replace(/^\/(de|ru)/, '') || '/';
  const isProtected = protectedRoutes.some((route) =>
    strippedPath.startsWith(route)
  );

  if (isProtected && !user) {
    // Get locale from URL
    const localeMatch = pathname.match(/^\/(de|ru)/);
    const locale = localeMatch ? localeMatch[1] : 'ru';
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Apply intl middleware for locale routing
  const intlResponse = intlMiddleware(request);
  // Preserve Supabase auth cookies (session refresh tokens)
  response.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });
  return intlResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html|xml|txt|ico)$).*)'],
};
