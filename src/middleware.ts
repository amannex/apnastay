import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route aliases mapping short/custom paths to canonical dashboard pages.
 */
const ALIAS_ROUTES: Record<string, string> = {
  '/favorites': '/dashboard/wishlist',
  '/my-visits': '/dashboard/visits',
  '/profile': '/dashboard/profile',
  '/owner/properties': '/owner/dashboard/properties',
  '/owner/properties/new': '/owner/dashboard/properties/new',
  '/owner/leads': '/owner/dashboard/visits',
  '/owner/profile': '/owner/dashboard/profile'
};

const PUBLIC_ALIASES: Record<string, string> = {
  '/auth/forgot-password': '/forgot-password',
  '/auth/reset-password': '/reset-password'
};

/**
 * Next.js Edge Middleware for ApnaStay India
 * Protects authenticated tenant and property owner routes before rendering UI.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle public route aliases (preserve query parameters)
  if (pathname in PUBLIC_ALIASES) {
    const targetUrl = new URL(PUBLIC_ALIASES[pathname], request.url);
    targetUrl.search = request.nextUrl.search;
    return NextResponse.redirect(targetUrl);
  }

  // Identify protected areas
  const isAliasRoute = pathname in ALIAS_ROUTES;
  const isTenantProtected = pathname.startsWith('/dashboard') || isAliasRoute;
  const isOwnerProtected = pathname.startsWith('/owner');

  if (isTenantProtected || isOwnerProtected) {
    // Check for authoritative ApnaStay session cookie or WordPress login cookie
    const sessionCookie = request.cookies.get('apnastay_session');
    const wpCookie = request.cookies.getAll().find(c => c.name.startsWith('wordpress_logged_in_'));
    const isAuthenticated = Boolean(
      (sessionCookie && sessionCookie.value && sessionCookie.value !== 'deleted') ||
      (wpCookie && wpCookie.value && wpCookie.value !== 'deleted')
    );

    // 1. Unauthenticated user -> redirect immediately to login
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Authenticated user visiting alias route -> redirect to canonical destination
    if (isAliasRoute) {
      const targetPath = ALIAS_ROUTES[pathname];
      const targetUrl = new URL(targetPath, request.url);
      return NextResponse.redirect(targetUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dashboard',
    '/owner/:path*',
    '/owner',
    '/favorites',
    '/my-visits',
    '/profile',
    '/auth/:path*'
  ]
};
