// ============================================================================
// OWNSTAY RBAC PERMISSIONS MODULE
// Centralized capability checks — Never rely only on role === 'owner'
// ============================================================================

import type { UserProfile, Capability } from './types';

/**
 * Default capability lists for reference and client-side fallback checks.
 */
export const TENANT_CAPABILITIES: Capability[] = [
  'read',
  'ownstay_manage_wishlist',
  'ownstay_book_visit',
  'ownstay_cancel_own_visit',
  'ownstay_request_booking',
  'ownstay_make_payment',
  'ownstay_view_agreement',
  'ownstay_create_review',
  'ownstay_chat'
];

export const OWNER_CAPABILITIES: Capability[] = [
  'read',
  'ownstay_create_property',
  'ownstay_edit_own_property',
  'ownstay_delete_own_property',
  'ownstay_upload_property_media',
  'ownstay_manage_rooms',
  'ownstay_manage_availability',
  'ownstay_manage_visits',
  'ownstay_manage_bookings',
  'ownstay_view_owner_payments',
  'ownstay_chat'
];

export const ADMIN_CAPABILITIES: Capability[] = [
  'read',
  ...TENANT_CAPABILITIES,
  ...OWNER_CAPABILITIES,
  'ownstay_verify_owner',
  'ownstay_verify_property',
  'ownstay_manage_users',
  'ownstay_manage_properties',
  'ownstay_manage_complaints',
  'ownstay_manage_payments',
  'ownstay_view_analytics',
  'ownstay_view_revenue',
  'ownstay_moderate_reviews'
];

/**
 * Core capability verification helper.
 *
 * Checks whether a user possesses a specific capability in their profile capabilities list.
 * Always mirrors the backend authorization model:
 * 1. Admin automatically possesses all platform capabilities.
 * 2. Never rely solely on user.role === 'owner'.
 * 3. Falls back to role capability mapping if capabilities array is omitted.
 */
export function can(user: UserProfile | null | undefined, capability: string): boolean {
  if (!user) {
    return false;
  }

  // Admin automatically possesses all platform capabilities
  const roleSlug = (user.role || '').toLowerCase().replace(/^ownstay_/, '');
  if (roleSlug === 'administrator' || roleSlug === 'admin') {
    return true;
  }

  // Check explicit capabilities array first
  if (Array.isArray(user.capabilities) && user.capabilities.length > 0) {
    return (user.capabilities as string[]).includes(capability);
  }

  // Fallback to centralized role capability mapping if explicit array wasn't passed
  if (roleSlug === 'owner') {
    return (OWNER_CAPABILITIES as string[]).includes(capability);
  }
  if (roleSlug === 'tenant') {
    return (TENANT_CAPABILITIES as string[]).includes(capability);
  }

  return false;
}

/**
 * Alias for can for backward compatibility.
 */
export const userCan = can;
export const hasCapability = can;

/**
 * Check if user possesses at least one of the provided capabilities.
 */
export function hasAnyCapability(user: UserProfile | null | undefined, capabilities: string[]): boolean {
  if (!user || !capabilities?.length) return false;
  return capabilities.some((cap) => userCan(user, cap));
}

/**
 * Check if user possesses all of the provided capabilities.
 */
export function hasAllCapabilities(user: UserProfile | null | undefined, capabilities: string[]): boolean {
  if (!user || !capabilities?.length) return false;
  return capabilities.every((cap) => userCan(user, cap));
}

/**
 * Check if user matches a specific role slug ('ownstay_tenant', 'ownstay_owner', 'administrator', 'guest').
 */
export function isRole(user: UserProfile | null | undefined, roleSlug: string): boolean {
  if (!user || !user.role) return false;
  const normalizedUserRole = user.role.toLowerCase().replace(/^ownstay_/, '');
  const normalizedTargetRole = roleSlug.toLowerCase().replace(/^ownstay_/, '');
  return normalizedUserRole === normalizedTargetRole || user.role.toLowerCase() === roleSlug.toLowerCase();
}

/**
 * Check if the user is either the owner of a resource or an Administrator who can bypass ownership.
 */
export function isResourceOwner(user: UserProfile | null | undefined, ownerId: number | string): boolean {
  if (!user || !user.id) {
    return false;
  }

  // Admin can bypass ownership where appropriate
  const roleSlug = (user.role || '').toLowerCase().replace(/^ownstay_/, '');
  if (roleSlug === 'administrator' || roleSlug === 'admin') {
    return true;
  }

  return Number(user.id) === Number(ownerId);
}

// ----------------------------------------------------------------------------
// Specialized Feature Permission Helpers
// ----------------------------------------------------------------------------

export function canManageWishlist(user?: UserProfile | null): boolean {
  return userCan(user, 'ownstay_manage_wishlist');
}

export function canBookVisit(user?: UserProfile | null): boolean {
  return userCan(user, 'ownstay_book_visit');
}

export function canRequestBooking(user?: UserProfile | null): boolean {
  return userCan(user, 'ownstay_request_booking');
}

export function canMakePayment(user?: UserProfile | null): boolean {
  return userCan(user, 'ownstay_make_payment');
}

export function canCreateProperty(user?: UserProfile | null): boolean {
  return userCan(user, 'ownstay_create_property');
}

export function canEditProperty(user?: UserProfile | null): boolean {
  return userCan(user, 'ownstay_edit_own_property');
}

export function canManageBookings(user?: UserProfile | null): boolean {
  return userCan(user, 'ownstay_manage_bookings');
}

export function canVerifyOwner(user?: UserProfile | null): boolean {
  return userCan(user, 'ownstay_verify_owner');
}

export function canVerifyProperty(user?: UserProfile | null): boolean {
  return userCan(user, 'ownstay_verify_property');
}

export function canViewAnalytics(user?: UserProfile | null): boolean {
  return userCan(user, 'ownstay_view_analytics');
}

/**
 * Retrieve current normalized lowercase owner verification status ('unverified' | 'pending' | 'verified' | 'rejected' | 'suspended').
 */
export function getOwnerVerificationStatus(user?: UserProfile | null): 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended' {
  if (!user) {
    return 'unverified';
  }
  const statusRaw = user.owner_verification_status || user.verification_status || user.profile?.owner_verification_status || user.profile?.verification_status;
  const status = (statusRaw || '').toString().toLowerCase();

  if (['unverified', 'pending', 'verified', 'rejected', 'suspended'].includes(status)) {
    return status as 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended';
  }

  const roleSlug = (user.role || '').toLowerCase().replace(/^ownstay_/, '');
  if (roleSlug === 'administrator' || roleSlug === 'admin' || roleSlug === 'tenant') {
    return 'verified';
  }

  return 'unverified';
}

/**
 * Check if the owner account is verified (or administrator).
 * DO NOT confuse role === 'owner' with owner is verified!
 */
export function isOwnerVerified(user?: UserProfile | null): boolean {
  if (!user) return false;
  const roleSlug = (user.role || '').toLowerCase().replace(/^ownstay_/, '');
  if (roleSlug === 'administrator' || roleSlug === 'admin') {
    return true;
  }
  return getOwnerVerificationStatus(user) === 'verified';
}

export function isOwnerOrAdmin(user?: UserProfile | null): boolean {
  return hasAnyCapability(user, ['ownstay_create_property', 'ownstay_verify_property']);
}

export interface PropertyPublicationValidationResult {
  allowed: boolean;
  reason?: string;
  code?:
    | 'UNAUTHENTICATED'
    | 'MISSING_CAPABILITY'
    | 'OWNER_NOT_VERIFIED'
    | 'INVALID_TITLE'
    | 'INVALID_DESCRIPTION'
    | 'INVALID_RENT'
    | 'INVALID_CITY';
}

export interface PropertyPublicationInput {
  title?: string;
  description?: string;
  rent?: number;
  city?: string;
}

/**
 * Combine RBAC + domain business rules to determine if a user can publish a property.
 * RBAC answers: "What is this user allowed to do?" (userCan(user, 'ownstay_create_property'))
 * Business Rules answer: "Under what conditions can they do it?" (KYC verified, valid property invariants)
 */
export function canPublishProperty(
  user?: UserProfile | null,
  propertyData?: PropertyPublicationInput
): PropertyPublicationValidationResult {
  // 1. Authenticated check
  if (!user || !user.id) {
    return {
      allowed: false,
      reason: 'You must be logged in to publish a property.',
      code: 'UNAUTHENTICATED',
    };
  }

  // 2. RBAC Capability check: ownstay_create_property
  if (!userCan(user, 'ownstay_create_property')) {
    return {
      allowed: false,
      reason: 'You do not have permission to publish property listings.',
      code: 'MISSING_CAPABILITY',
    };
  }

  // 3. Business Rule: Owner Verified? (KYC check)
  if (!isOwnerVerified(user)) {
    return {
      allowed: false,
      reason: 'Your owner account must be KYC-verified by an administrator before you can publish properties.',
      code: 'OWNER_NOT_VERIFIED',
    };
  }

  // 4. Business Rule: Property Valid? (if property payload is provided)
  if (propertyData) {
    const title = (propertyData.title || '').trim();
    const description = (propertyData.description || '').trim();
    const rent = typeof propertyData.rent === 'number' ? propertyData.rent : 0;
    const city = (propertyData.city || '').trim();

    if (title.length < 5) {
      return {
        allowed: false,
        reason: 'Property title must be at least 5 characters long.',
        code: 'INVALID_TITLE',
      };
    }

    if (description.length < 20) {
      return {
        allowed: false,
        reason: 'Property description must be at least 20 characters long to provide adequate details for tenants.',
        code: 'INVALID_DESCRIPTION',
      };
    }

    if (rent < 1000) {
      return {
        allowed: false,
        reason: 'Minimum monthly rent must be at least ₹1,000 to prevent spam/fake listings.',
        code: 'INVALID_RENT',
      };
    }

    if (!city) {
      return {
        allowed: false,
        reason: 'Property city is required.',
        code: 'INVALID_CITY',
      };
    }
  }

  // All checks passed!
  return {
    allowed: true,
  };
}
