// ============================================================================
// OWNSTAY AUTHENTICATION TYPES & RBAC CAPABILITY DEFINITIONS
// Authoritative TypeScript interfaces matching WordPress ownstay-core plugin
// ============================================================================

export type AccountType = 'tenant' | 'owner';

export type RoleSlug =
  | 'ownstay_tenant'
  | 'ownstay_owner'
  | 'administrator'
  | 'guest'
  | 'TENANT'
  | 'OWNER'
  | 'ADMIN'
  | 'GUEST';

export type Capability =
  // Tenant capabilities
  | 'ownstay_manage_wishlist'
  | 'ownstay_book_visit'
  | 'ownstay_cancel_own_visit'
  | 'ownstay_request_booking'
  | 'ownstay_make_payment'
  | 'ownstay_view_agreement'
  | 'ownstay_create_review'
  | 'ownstay_chat'
  // Owner capabilities
  | 'ownstay_create_property'
  | 'ownstay_edit_own_property'
  | 'ownstay_delete_own_property'
  | 'ownstay_upload_property_media'
  | 'ownstay_manage_rooms'
  | 'ownstay_manage_availability'
  | 'ownstay_manage_visits'
  | 'ownstay_manage_bookings'
  | 'ownstay_view_owner_payments'
  // Admin capabilities
  | 'ownstay_verify_owner'
  | 'ownstay_verify_property'
  | 'ownstay_manage_users'
  | 'ownstay_manage_properties'
  | 'ownstay_manage_complaints'
  | 'ownstay_manage_payments'
  | 'ownstay_view_analytics'
  | 'ownstay_view_revenue'
  | 'ownstay_moderate_reviews'
  // Generic read
  | 'read';

export type OwnerVerificationStatus =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'suspended'
  | 'VERIFIED'
  | 'UNVERIFIED';

export interface UserProfileMetadata {
  avatar?: string | null;
  phone?: string | null;
  first_name?: string;
  last_name?: string;
  owner_verification_status?: OwnerVerificationStatus;
  verification_status?: OwnerVerificationStatus;
  [key: string]: any;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string | null;
  role: string; // 'ownstay_tenant' | 'ownstay_owner' | 'administrator' | 'guest'
  capabilities: Capability[] | string[];
  owner_verification_status?: OwnerVerificationStatus;
  verification_status?: OwnerVerificationStatus;
  profile: UserProfileMetadata;
  [key: string]: any;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  account_type: AccountType;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface SwitchRolePayload {
  role: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  key: string;
  login: string;
  password: string;
}

export interface AuthResponse<T = UserProfile> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  status?: number;
}
