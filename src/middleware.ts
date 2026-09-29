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
 * 1. Handles global maintenance mode with HTTP 503 SEO protection & secret bypass.
 * 2. Protects authenticated tenant and property owner routes before rendering UI.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ============================================================================
  // 1. MAINTENANCE MODE CONTROLLER
  // ============================================================================
  const isMaintenanceMode =
    process.env.MAINTENANCE_MODE === 'true' ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  const bypassParam = request.nextUrl.searchParams.get('bypass');
  const bypassSecret = process.env.MAINTENANCE_BYPASS_TOKEN || 'apnastay-preview';

  // Allow admins/team to activate bypass via query parameter: ?bypass=apnastay-preview
  if (bypassParam && bypassParam === bypassSecret) {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete('bypass');
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set('apnastay_maintenance_bypass', 'true', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });
    return response;
  }

  // Allow clearing bypass cookie: ?bypass=off
  if (bypassParam === 'off' || bypassParam === 'clear') {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete('bypass');
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.delete('apnastay_maintenance_bypass');
    return response;
  }

  const hasBypass = request.cookies.get('apnastay_maintenance_bypass')?.value === 'true';

  // If maintenance mode is active and user has not bypassed it:
  if (isMaintenanceMode && !hasBypass) {
    // If already on /maintenance, serve it directly
    if (pathname === '/maintenance') {
      return NextResponse.next();
    }

    // Return 503 JSON for API routes
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Service Unavailable', message: 'ApnaStay is undergoing scheduled maintenance' },
        {
          status: 503,
          headers: {
            'Retry-After': '3600',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      );
    }

    // Redirect all web pages cleanly to /maintenance (307 Temporary Redirect)
    const maintenanceUrl = new URL('/maintenance', request.url);
    return NextResponse.redirect(maintenanceUrl, 307);
  }

  // If maintenance mode is OFF but user visits /maintenance, send them to homepage (allow during development)
  if (!isMaintenanceMode && pathname === '/maintenance' && process.env.NODE_ENV !== 'development') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // ============================================================================
  // 2. ROUTE ALIASES & REDIRECTS
  // ============================================================================
  if (pathname in PUBLIC_ALIASES) {
    const targetUrl = new URL(PUBLIC_ALIASES[pathname], request.url);
    targetUrl.search = request.nextUrl.search;
    return NextResponse.redirect(targetUrl);
  }

  // ============================================================================
  // 3. AUTHENTICATION & ACCESS CONTROL
  // ============================================================================
  const isAliasRoute = pathname in ALIAS_ROUTES;
  const isTenantProtected = pathname.startsWith('/dashboard') || isAliasRoute;
  const isOwnerProtected = pathname.startsWith('/owner');

  if (isTenantProtected || isOwnerProtected) {
    const sessionCookie = request.cookies.get('apnastay_session');
    const wpCookie = request.cookies.getAll().find(c => c.name.startsWith('wordpress_logged_in_'));
    const isAuthenticated = Boolean(
      (sessionCookie && sessionCookie.value && sessionCookie.value !== 'deleted') ||
      (wpCookie && wpCookie.value && wpCookie.value !== 'deleted')
    );

    // 1. Unauthenticated user -> redirect immediately to signup/login
    if (!isAuthenticated) {
      if (pathname.includes('/properties/new')) {
        const registerUrl = new URL('/register', request.url);
        registerUrl.searchParams.set('role', 'property_owner');
        registerUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(registerUrl);
      }
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.png, icon.png, logo-icon.png
     * - static image/font extensions
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.png|icon\\.png|logo-icon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
