import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for OwnStay India
 * Protects authenticated areas (/dashboard, /owner) on the server before rendering UI.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const isTenantProtected = pathname.startsWith('/dashboard');
  const isOwnerProtected = pathname.startsWith('/owner');

  if (isTenantProtected || isOwnerProtected) {
    // Check for authoritative OwnStay session cookie or WordPress login cookie
    const sessionCookie = request.cookies.get('ownstay_session');
    const wpCookie = request.cookies.getAll().find(c => c.name.startsWith('wordpress_logged_in_'));

    if (!sessionCookie && !wpCookie) {
      // Unauthenticated visitor -> redirect on server before UI renders
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match protected paths: /dashboard, /dashboard/:path*, /owner, /owner/:path*
     */
    '/dashboard/:path*',
    '/dashboard',
    '/owner/:path*',
    '/owner'
  ]
};
