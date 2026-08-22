// ============================================================================
// APNASTAY AUTHENTICATION TYPES & RBAC CAPABILITY DEFINITIONS
// Authoritative TypeScript interfaces matching WordPress apnastay-core plugin
// ============================================================================

export type AccountType = 'tenant' | 'owner';

export type RoleSlug =
  | 'apnastay_tenant'
  | 'apnastay_owner'
  | 'administrator'
  | 'guest'
  | 'TENANT'
  | 'OWNER'
  | 'ADMIN'
  | 'GUEST';

export type Capability =
  // Tenant capabilities
  | 'apnastay_manage_wishlist'
  | 'apnastay_book_visit'
  | 'apnastay_cancel_own_visit'
  | 'apnastay_request_booking'
  | 'apnastay_make_payment'
  | 'apnastay_view_agreement'
  | 'apnastay_create_review'
  | 'apnastay_chat'
  // Owner capabilities
  | 'apnastay_create_property'
  | 'apnastay_edit_own_property'
  | 'apnastay_delete_own_property'
  | 'apnastay_upload_property_media'
  | 'apnastay_manage_rooms'
  | 'apnastay_manage_availability'
  | 'apnastay_manage_visits'
  | 'apnastay_manage_bookings'
  | 'apnastay_view_owner_payments'
  // Admin capabilities
  | 'apnastay_verify_owner'
  | 'apnastay_verify_property'
  | 'apnastay_manage_users'
  | 'apnastay_manage_properties'
  | 'apnastay_manage_complaints'
  | 'apnastay_manage_payments'
  | 'apnastay_view_analytics'
  | 'apnastay_view_revenue'
  | 'apnastay_moderate_reviews'
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
  role: string; // 'apnastay_tenant' | 'apnastay_owner' | 'administrator' | 'guest'
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
