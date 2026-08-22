// ============================================================================
// APNASTAY AUTHENTICATION & RBAC GUARDS
// High-level route and action guards for Next.js views and components
// ============================================================================

import {
  can,
  userCan,
  hasAnyCapability,
  isRole,
  isResourceOwner,
  getOwnerVerificationStatus,
  isOwnerVerified,
  canPublishProperty,
} from '../../features/auth/permissions';
import type {
  PropertyPublicationValidationResult,
  PropertyPublicationInput,
} from '../../features/auth/permissions';
import type { UserProfile } from '../../features/auth/types';

export {
  can,
  isResourceOwner,
  getOwnerVerificationStatus,
  isOwnerVerified,
  canPublishProperty,
};
export type {
  PropertyPublicationValidationResult,
  PropertyPublicationInput,
};

/**
 * Guard that verifies whether an action or view is accessible to a user based on capability.
 * If fallback callback is provided, executes it when authorization fails.
 */
export function requireCapability(
  user: UserProfile | null | undefined,
  capability: string,
  onUnauthorized?: () => void
): boolean {
  const allowed = userCan(user, capability);
  if (!allowed && onUnauthorized) {
    onUnauthorized();
  }
  return allowed;
}

/**
 * Guard checking if the user has any of the specified capabilities.
 */
export function requireAnyCapability(
  user: UserProfile | null | undefined,
  capabilities: string[],
  onUnauthorized?: () => void
): boolean {
  const allowed = hasAnyCapability(user, capabilities);
  if (!allowed && onUnauthorized) {
    onUnauthorized();
  }
  return allowed;
}

/**
 * Guard checking if user has a specific role slug.
 * Prefer requireCapability over requireRole whenever possible.
 */
export function requireRole(
  user: UserProfile | null | undefined,
  roleSlug: string,
  onUnauthorized?: () => void
): boolean {
  const allowed = isRole(user, roleSlug);
  if (!allowed && onUnauthorized) {
    onUnauthorized();
  }
  return allowed;
}

/**
 * Verifies that a user is authenticated (not null or guest).
 */
export function requireAuthenticated(user: UserProfile | null | undefined): boolean {
  return !!user && user.id !== 0 && (user.role || '').toLowerCase() !== 'guest';
}

/**
 * Checks whether a user is allowed to access the Property Owner Dashboard / Portal.
 * Validates capability: apnastay_create_property (or admin).
 */
export function canAccessOwnerPortal(user: UserProfile | null | undefined): boolean {
  return userCan(user, 'apnastay_create_property');
}

/**
 * Checks whether a user is allowed to access the Admin Management Portal.
 * Validates capability: apnastay_verify_owner.
 */
export function canAccessAdminPortal(user: UserProfile | null | undefined): boolean {
  return userCan(user, 'apnastay_verify_owner');
}

/**
 * Verifies if user can execute tenant-specific actions like booking visits or wishlisting.
 */
export function canPerformTenantAction(user: UserProfile | null | undefined, actionCap: string): boolean {
  if (!requireAuthenticated(user)) {
    return false;
  }
  return userCan(user, actionCap);
}
