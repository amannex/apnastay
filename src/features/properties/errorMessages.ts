// ============================================================================
// APNASTAY PROPERTY ENGINE — ERROR NORMALIZATION & ACTIONABLE MESSAGES
// Centralized mapping of HTTP statuses, API error codes, and network exceptions
// into clear, user-friendly, actionable error messages.
// ============================================================================

export interface NormalizedError {
  code: string;
  message: string;
  status: number;
  actionableHint?: string;
  hint?: string;
  isSessionExpired?: boolean;
}

export type NormalizedPropertyError = NormalizedError;

/**
 * Normalizes any error response, status code, or network exception
 * into a clean, human-readable, and actionable format.
 */
function resolvePropertyError(
  resOrStatus?: Response | number | null,
  data?: any,
  fallbackMessage: string = 'An unexpected error occurred. Please try again.'
): NormalizedError {
  let explicitStatus: number | null = null;
  if (typeof resOrStatus === 'number') {
    explicitStatus = resOrStatus;
  } else if (resOrStatus && typeof resOrStatus.status === 'number') {
    explicitStatus = resOrStatus.status;
  } else if (data?.status) {
    explicitStatus = Number(data.status);
  }
  const status = explicitStatus ?? 500;

  const rawCode = data?.code || data?.error_code || '';
  const rawMessage = data?.message || data?.error || '';

  // 1. Session Expiration & Authentication
  if (
    status === 401 ||
    rawCode === 'UNAUTHENTICATED' ||
    rawCode === 'rest_not_logged_in' ||
    rawCode === 'jwt_auth_invalid_token' ||
    rawCode === 'rest_cookie_invalid_nonce'
  ) {
    return {
      status: explicitStatus ?? 401,
      code: 'UNAUTHENTICATED',
      message: 'Your session has expired. Please sign in again to continue.',
      actionableHint: 'Sign In',
      isSessionExpired: true
    };
  }

  // 2. Ownership & Authorization (IDOR)
  if (
    status === 403 ||
    rawCode === 'NOT_PROPERTY_OWNER' ||
    rawCode === 'rest_forbidden' ||
    rawCode === 'rest_cannot_edit'
  ) {
    return {
      status: explicitStatus ?? 403,
      code: 'NOT_PROPERTY_OWNER',
      message: 'Access denied: You do not have permission to manage this listing.',
      actionableHint: 'Check that you are logged into the correct owner account.'
    };
  }

  // 3. Resource Not Found
  if (status === 404 || rawCode === 'PROPERTY_NOT_FOUND' || rawCode === 'rest_no_route') {
    return {
      status: explicitStatus ?? 404,
      code: 'PROPERTY_NOT_FOUND',
      message: 'The requested property listing was not found or has been removed.',
      actionableHint: 'It may have been removed or the link may be invalid.'
    };
  }

  if (rawCode === 'UNIT_NOT_FOUND') {
    return {
      status: explicitStatus ?? 404,
      code: 'UNIT_NOT_FOUND',
      message: 'The specified unit or room could not be found on this property.',
      actionableHint: 'Please refresh the page to see the latest unit configuration.'
    };
  }

  if (rawCode === 'BED_NOT_FOUND') {
    return {
      status: explicitStatus ?? 404,
      code: 'BED_NOT_FOUND',
      message: 'The specified bed could not be found.',
      actionableHint: 'Please refresh the page to see the latest bed inventory.'
    };
  }

  if (rawCode === 'PHOTO_NOT_FOUND') {
    return {
      status: explicitStatus ?? 404,
      code: 'PHOTO_NOT_FOUND',
      message: 'The selected photo was not found or was already deleted.',
      actionableHint: 'Please refresh your gallery to view current photos.'
    };
  }

  // 4. Relational Integrity & Mismatches
  if (rawCode === 'RELATIONSHIP_MISMATCH') {
    return {
      status: explicitStatus ?? 404,
      code: 'RELATIONSHIP_MISMATCH',
      message: 'Relationship mismatch: The specified unit, bed, or photo does not belong to this property.',
      actionableHint: 'Please refresh the page to reload your property configuration.'
    };
  }

  // 5. Incomplete Listing & Publishing Guards
  if (rawCode === 'LISTING_INCOMPLETE') {
    return {
      status: explicitStatus ?? 422,
      code: 'LISTING_INCOMPLETE',
      message: rawMessage || 'Please complete all required fields (pricing, location, and photos) before publishing.',
      actionableHint: 'Review incomplete sections in Step 10 before publishing.'
    };
  }

  if (rawCode === 'MISSING_UNITS') {
    return {
      status: explicitStatus ?? 400,
      code: 'MISSING_UNITS',
      message: 'Properties of this type require at least one configured unit before publishing.',
      actionableHint: 'Go to Step 7 (Units & Rooms) to add or generate units.'
    };
  }

  if (rawCode === 'INVALID_PRICING') {
    return {
      status: explicitStatus ?? 400,
      code: 'INVALID_PRICING',
      message: rawMessage || 'Please enter a valid monthly rent greater than ₹0 before continuing.',
      actionableHint: 'Set pricing in Step 8.'
    };
  }

  // 6. Status Lifecycle Transitions
  if (rawCode === 'INVALID_STATUS_TRANSITION') {
    return {
      status: explicitStatus ?? 400,
      code: 'INVALID_STATUS_TRANSITION',
      message: rawMessage || 'This listing action is not permitted for the current property status.',
      actionableHint: rawMessage.includes('archived') ? 'Please restore the archived property before editing.' : undefined
    };
  }

  // 7. Media & Upload Errors
  if (rawCode === 'IMAGE_TOO_LARGE' || status === 413) {
    return {
      status: explicitStatus ?? 413,
      code: 'IMAGE_TOO_LARGE',
      message: 'The selected image exceeds the 10MB maximum file size limit.',
      actionableHint: 'Please compress the image or choose a smaller file.'
    };
  }

  if (rawCode === 'INVALID_IMAGE_FORMAT') {
    return {
      status: 400,
      code: 'INVALID_IMAGE_FORMAT',
      message: 'Unsupported image format. Please upload JPG, PNG, WebP, GIF, or HEIC files.',
      actionableHint: 'Convert your image to JPEG or PNG.'
    };
  }

  if (rawCode === 'CORRUPTED_IMAGE') {
    return {
      status: 400,
      code: 'CORRUPTED_IMAGE',
      message: 'The image file appears empty or corrupted (0 bytes).',
      actionableHint: 'Please select a valid image file.'
    };
  }

  // 8. Form Validation Errors
  if (rawCode === 'INVALID_PINCODE') {
    return {
      status: 400,
      code: 'INVALID_PINCODE',
      message: 'Please enter a valid 6-digit Indian PIN code (e.g. 560001).',
      actionableHint: 'Check the location postal code.'
    };
  }

  if (rawCode === 'INVALID_DATE_FORMAT') {
    return {
      status: 400,
      code: 'INVALID_DATE_FORMAT',
      message: 'Please provide a valid date in YYYY-MM-DD format.',
      actionableHint: 'Pick a date from the calendar.'
    };
  }

  if (rawCode === 'INVALID_RENTAL_STRUCTURE' || rawCode === 'INVALID_PROPERTY_TYPE') {
    return {
      status: 400,
      code: rawCode,
      message: rawMessage || 'The selected rental structure is incompatible with this property type.',
      actionableHint: 'Select an allowed rental structure for your property type.'
    };
  }

  // 9. Server & Network Errors
  if (status >= 500) {
    return {
      status,
      code: 'SERVER_ERROR',
      message: 'The server encountered an issue processing your request. Please try again shortly.',
      actionableHint: 'If this problem persists, please contact ApnaStay Support.'
    };
  }

  // 10. Fallback with user message if provided
  return {
    status,
    code: rawCode || 'OPERATION_FAILED',
    message: rawMessage || fallbackMessage
  };
}

export function normalizePropertyError(
  resOrStatus?: Response | number | null,
  data?: any,
  fallbackMessage: string = 'An unexpected error occurred. Please try again.'
): NormalizedError {
  const result = resolvePropertyError(resOrStatus, data, fallbackMessage);
  if (result.actionableHint && !result.hint) {
    result.hint = result.actionableHint;
  }
  return result;
}
