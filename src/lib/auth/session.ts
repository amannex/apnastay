// ============================================================================
// APNASTAY SESSION MANAGEMENT MODULE
// Synchronizes client-side session with authoritative /me endpoint
// ============================================================================

import { getCurrentUser, logoutUser } from '../../features/auth/api';
import type { UserProfile } from '../../features/auth/types';

let cachedSessionUser: UserProfile | null = null;
let sessionFetchPromise: Promise<UserProfile | null> | null = null;

/**
 * Fetch authoritative user profile from /me endpoint with request deduplication.
 * Can be called anywhere in Next.js client layout or context.
 */
export async function fetchSession(forceRefresh: boolean = false): Promise<UserProfile | null> {
  if (!forceRefresh && cachedSessionUser) {
    return cachedSessionUser;
  }

  if (sessionFetchPromise && !forceRefresh) {
    return sessionFetchPromise;
  }

  sessionFetchPromise = getCurrentUser().then((user) => {
    cachedSessionUser = user;
    sessionFetchPromise = null;
    return user;
  });

  return sessionFetchPromise;
}

/**
 * Synchronize session state on application mount.
 */
export async function syncSessionUser(onUserUpdate: (user: UserProfile | null) => void): Promise<void> {
  try {
    const user = await fetchSession(true);
    onUserUpdate(user);
  } catch (err) {
    console.error('[ApnaStay Session] Error syncing session:', err);
    onUserUpdate(null);
  }
}

/**
 * Update client cached session manually after login or role switch.
 */
export function setCachedSession(user: UserProfile | null): void {
  cachedSessionUser = user;
}

/**
 * Get current cached session without triggering a network fetch.
 */
export function getCachedSession(): UserProfile | null {
  return cachedSessionUser;
}

/**
 * Terminate client session and clear HttpOnly secure cookies.
 */
export async function clearClientSession(): Promise<void> {
  cachedSessionUser = null;
  sessionFetchPromise = null;
  try {
    await logoutUser();
  } finally {
    if (typeof document !== 'undefined') {
      document.cookie = 'apnastay_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'apnastay_session=deleted; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }
}

/**
 * Normalize role string from UserProfile (returns 'tenant', 'owner', 'administrator', or 'guest').
 */
export function getSessionRole(user: UserProfile | null | undefined): string {
  if (!user || !user.role) return 'guest';
  return user.role.toLowerCase().replace(/^apnastay_/, '');
}

/**
 * Check if the user's KYC / account verification status is VERIFIED.
 */
export function isSessionVerified(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return user.verification_status === 'VERIFIED' || user.profile?.verification_status === 'VERIFIED';
}

/**
 * Calculates the role-aware destination URL after login or registration.
 *
 * TENANT  → /dashboard
 * OWNER   → /owner/dashboard
 * ADMIN   → WordPress /wp-admin/
 * Guest   → /login?redirect=/dashboard
 */
export function getRoleRedirectUrl(user: UserProfile | null | undefined, customRedirect?: string | null): string {
  const role = getSessionRole(user);

  if (!user || role === 'guest') {
    const target = customRedirect && customRedirect.startsWith('/') ? customRedirect : '/dashboard';
    return `/login?redirect=${encodeURIComponent(target)}`;
  }

  // If a custom redirect parameter was passed from a login attempt, validate it against role permissions
  if (customRedirect && customRedirect.startsWith('/')) {
    if (role === 'administrator' || role === 'admin') {
      return customRedirect;
    }
    if (role === 'owner' && (customRedirect.startsWith('/owner') || customRedirect.startsWith('/dashboard'))) {
      return customRedirect;
    }
    if (role === 'tenant' && customRedirect.startsWith('/dashboard') && !customRedirect.startsWith('/owner')) {
      return customRedirect;
    }
  }

  // Default authoritative redirects by role
  if (role === 'administrator' || role === 'admin') {
    return (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WP_ADMIN_URL) || 'http://localhost:8888/wp-admin/';
  }
  if (role === 'owner') {
    return '/owner/dashboard';
  }

  return '/dashboard';
}

/**
 * Execute role-aware navigation after login.
 * Automatically handles external URLs (e.g. WordPress /wp-admin/) vs App Router paths.
 */
export function handleRoleRedirect(
  user: UserProfile | null | undefined,
  customRedirect?: string | null,
  router?: { push: (url: string) => void }
): void {
  const destination = getRoleRedirectUrl(user, customRedirect);

  if (destination.startsWith('http://') || destination.startsWith('https://')) {
    if (typeof window !== 'undefined') {
      window.location.href = destination;
    }
  } else if (router && typeof router.push === 'function') {
    router.push(destination);
  } else if (typeof window !== 'undefined') {
    window.location.href = destination;
  }
}

