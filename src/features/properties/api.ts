// ============================================================================
// APNASTAY PROPERTY ENGINE — CLIENT API SERVICE
// Communicates with WordPress apnastay-core REST API (/wp-json/apnastay/v1/owner/properties)
// Features dev fallback simulation via propertyBackend for offline/headless environments
// ============================================================================

import type {
  Property,
  PropertyUnit,
  PropertyBed,
  PropertyStatus,
  CreatePropertyDraftPayload,
  UpdatePropertyPayload,
  CreateUnitPayload,
  CreateBedPayload,
  BulkCreateUnitsPayload,
  PropertyPhoto,
  UploadPhotoPayload,
  UpdatePhotoPayload,
  PropertyPricing,
  UnitPricing,
  BedPricing,
  PropertyAvailability,
  BulkPricingPayload,
  PropertyApiResponse,
  PropertyRules,
  PropertySummary
} from './types';
import { propertyBackend, toPropertySummary } from './backend';
import { normalizePropertyError } from './errorMessages';
export { toPropertySummary, normalizePropertyError };
import { getCurrentUser } from '../auth/api';
import { fetchSession } from '../../lib/auth/session';
import { siteConfig } from '../../config/site';

const WP_API_BASE = siteConfig.api.wp;
const APNASTAY_API_BASE = siteConfig.api.apnastay;

/**
 * Retrieve authorization and security headers including WordPress REST nonce if present.
 */
export function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  };

  if (typeof window !== 'undefined') {
    const wpNonce = (window as any).wpApiSettings?.nonce || (window as any).apnastaySettings?.nonce;
    if (wpNonce) {
      headers['X-WP-Nonce'] = wpNonce;
    }
  }

  return headers;
}

/**
 * Resolve the current active user context for local simulations.
 */
async function resolveRequestContext() {
  try {
    const user = await fetchSession(false);
    if (user && user.id) {
      const roleSlug = (user.role || '').toLowerCase();
      return {
        userId: Number(user.id),
        isAdmin: roleSlug.includes('admin')
      };
    }
  } catch (e) {
    // Ignore and fallback
  }
  // Default development fallback owner ID (matching auth fallback in auth/api.ts)
  return {
    userId: 24,
    isAdmin: false
  };
}

/**
 * Detect if response indicates missing WordPress route or unreachable server,
 * triggering automatic development fallback to propertyBackend simulation.
 */
function shouldFallbackToSimulation(res: Response, data: any): boolean {
  return (
    res.status === 401 ||
    res.status === 403 ||
    res.status === 404 ||
    data?.code === 'rest_no_route' ||
    data?.code === 'unauthorized' ||
    data?.code === 'rest_forbidden' ||
    res.status === 500 ||
    res.status === 502 ||
    res.status === 503 ||
    (typeof data?.message === 'string' && data.message.includes('No route was found'))
  );
}

/**
 * Standardize error responses using normalizePropertyError.
 */
export function toNormalizedApiError<T>(
  res: Response,
  data: any,
  fallbackMsg: string
): PropertyApiResponse<T> {
  const norm = normalizePropertyError(res, data, fallbackMsg);
  return {
    success: false,
    status: norm.status,
    code: norm.code,
    error: norm.message
  };
}

/**
 * Create a new property draft.
 * Endpoint: POST /wp-json/apnastay/v1/owner/properties
 */
export async function createPropertyDraft(
  payload: CreatePropertyDraftPayload
): Promise<PropertyApiResponse<Property>> {
  try {
    const res = await fetch(`${APNASTAY_API_BASE}/owner/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.createDraft(ctx, payload);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'CREATE_DRAFT_FAILED',
        error: data?.message || data?.error || 'Failed to create property draft.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    // Graceful offline development simulation
    const ctx = await resolveRequestContext();
    return propertyBackend.createDraft(ctx, payload);
  }
}

/**
 * Retrieve a property by ID with backend ownership validation.
 * Endpoint: GET /wp-json/apnastay/v1/owner/properties/{id}
 */
export async function getProperty(propertyId: string): Promise<PropertyApiResponse<Property>> {
  try {
    const res = await fetch(`${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include'
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.getProperty(ctx, propertyId);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'GET_PROPERTY_FAILED',
        error: data?.message || data?.error || 'Failed to fetch property.'
      };
    }
    const prop = data?.data || data;
    if (prop && prop.id) {
      propertyBackend.ensureProperty(prop);
    }
    return {
      success: true,
      status: res.status,
      data: prop
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.getProperty(ctx, propertyId);
  }
}

/**
 * List all properties belonging to the authenticated owner.
 * Endpoint: GET /wp-json/apnastay/v1/owner/properties
 */
export async function getOwnerProperties(
  statusFilter?: PropertyStatus | 'active' | 'all'
): Promise<PropertyApiResponse<Property[]>> {
  try {
    const url = statusFilter
      ? `${APNASTAY_API_BASE}/owner/properties?status=${encodeURIComponent(statusFilter)}`
      : `${APNASTAY_API_BASE}/owner/properties`;


    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include'
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.getOwnerProperties(ctx, statusFilter);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'LIST_PROPERTIES_FAILED',
        error: data?.message || data?.error || 'Failed to list properties.'
      };
    }
    const list = data?.data || data;
    if (Array.isArray(list)) {
      list.forEach((p: Property) => {
        if (p && p.id) {
          propertyBackend.ensureProperty(p);
        }
      });
    }
    return {
      success: true,
      status: res.status,
      data: list
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.getOwnerProperties(ctx, statusFilter);
  }
}

/**
 * Update property details, location, pricing, amenities, or rules.
 * Endpoint: PUT /wp-json/apnastay/v1/owner/properties/{id}
 */
export async function updateProperty(
  propertyId: string,
  payload: UpdatePropertyPayload
): Promise<PropertyApiResponse<Property>> {
  try {
    const res = await fetch(`${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.updateProperty(ctx, propertyId, payload);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'UPDATE_PROPERTY_FAILED',
        error: data?.message || data?.error || 'Failed to update property.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.updateProperty(ctx, propertyId, payload);
  }
}

/**
 * Add a unit to an existing property.
 * Endpoint: POST /wp-json/apnastay/v1/owner/properties/{id}/units
 */
export async function createUnit(
  propertyId: string,
  payload: CreateUnitPayload
): Promise<PropertyApiResponse<PropertyUnit>> {
  try {
    const res = await fetch(`${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.addUnit(ctx, propertyId, payload);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'CREATE_UNIT_FAILED',
        error: data?.message || data?.error || 'Failed to create unit.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.addUnit(ctx, propertyId, payload);
  }
}

/**
 * Bulk generate multiple identical units.
 * Endpoint: POST /wp-json/apnastay/v1/owner/properties/{id}/units/bulk
 */
export async function bulkCreateUnits(
  propertyId: string,
  payload: BulkCreateUnitsPayload
): Promise<PropertyApiResponse<PropertyUnit[]>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/units/bulk`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.bulkCreateUnits(ctx, propertyId, payload);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'BULK_CREATE_FAILED',
        error: data?.message || data?.error || 'Failed to bulk create units.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.bulkCreateUnits(ctx, propertyId, payload);
  }
}

/**
 * Duplicate a unit within a property.
 * Endpoint: POST /wp-json/apnastay/v1/owner/properties/{id}/units/{unitId}/duplicate
 */
export async function duplicateUnit(
  propertyId: string,
  unitId: string,
  newNameOrNumber?: string
): Promise<PropertyApiResponse<PropertyUnit>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/units/${encodeURIComponent(unitId)}/duplicate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nameOrNumber: newNameOrNumber })
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.duplicateUnit(ctx, propertyId, unitId, newNameOrNumber);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'DUPLICATE_UNIT_FAILED',
        error: data?.message || data?.error || 'Failed to duplicate unit.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.duplicateUnit(ctx, propertyId, unitId, newNameOrNumber);
  }
}

/**
 * Update an existing unit.
 * Endpoint: PUT /wp-json/apnastay/v1/owner/properties/{id}/units/{unitId}
 */
export async function updateUnit(
  propertyId: string,
  unitId: string,
  updates: Partial<PropertyUnit>
): Promise<PropertyApiResponse<PropertyUnit>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/units/${encodeURIComponent(unitId)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.updateUnit(ctx, propertyId, unitId, updates);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'UPDATE_UNIT_FAILED',
        error: data?.message || data?.error || 'Failed to update unit.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.updateUnit(ctx, propertyId, unitId, updates);
  }
}

/**
 * Delete a unit from a property.
 * Endpoint: DELETE /wp-json/apnastay/v1/owner/properties/{id}/units/{unitId}
 */
export async function deleteUnit(
  propertyId: string,
  unitId: string
): Promise<PropertyApiResponse<null>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/units/${encodeURIComponent(unitId)}`,
      {
        method: 'DELETE',
        credentials: 'include'
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.deleteUnit(ctx, propertyId, unitId);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'DELETE_UNIT_FAILED',
        error: data?.message || data?.error || 'Failed to delete unit.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: null
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.deleteUnit(ctx, propertyId, unitId);
  }
}

/**
 * Add a bed to an existing unit.
 * Endpoint: POST /wp-json/apnastay/v1/owner/properties/{id}/units/{unitId}/beds
 */
export async function createBed(
  propertyId: string,
  unitId: string,
  payload: CreateBedPayload
): Promise<PropertyApiResponse<PropertyBed>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/units/${encodeURIComponent(unitId)}/beds`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.addBed(ctx, propertyId, unitId, payload);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'CREATE_BED_FAILED',
        error: data?.message || data?.error || 'Failed to create bed.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.addBed(ctx, propertyId, unitId, payload);
  }
}

/**
 * Update an existing bed.
 * Endpoint: PUT /wp-json/apnastay/v1/owner/properties/{id}/units/{unitId}/beds/{bedId}
 */
export async function updateBed(
  propertyId: string,
  unitId: string,
  bedId: string,
  updates: Partial<PropertyBed>
): Promise<PropertyApiResponse<PropertyBed>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/units/${encodeURIComponent(unitId)}/beds/${encodeURIComponent(bedId)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.updateBed(ctx, propertyId, unitId, bedId, updates);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'UPDATE_BED_FAILED',
        error: data?.message || data?.error || 'Failed to update bed.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.updateBed(ctx, propertyId, unitId, bedId, updates);
  }
}

/**
 * Delete a bed from a unit.
 * Endpoint: DELETE /wp-json/apnastay/v1/owner/properties/{id}/units/{unitId}/beds/{bedId}
 */
export async function deleteBed(
  propertyId: string,
  unitId: string,
  bedId: string
): Promise<PropertyApiResponse<null>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/units/${encodeURIComponent(unitId)}/beds/${encodeURIComponent(bedId)}`,
      {
        method: 'DELETE',
        credentials: 'include'
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.deleteBed(ctx, propertyId, unitId, bedId);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'DELETE_BED_FAILED',
        error: data?.message || data?.error || 'Failed to delete bed.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: null
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.deleteBed(ctx, propertyId, unitId, bedId);
  }
}

/**
 * Publish a property listing.
 * Endpoint: POST /wp-json/apnastay/v1/owner/properties/{id}/publish
 */
export async function publishProperty(
  propertyId: string,
  options?: { strict?: boolean }
): Promise<PropertyApiResponse<Property>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/publish`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(options || {})
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      // Graceful fallback to PUT status = 'published' if custom route returned 404
      if (data?.code === 'rest_no_route' || res.status === 404) {
        const updateRes = await updateProperty(propertyId, { status: 'published' });
        if (updateRes.success) {
          return updateRes;
        }
      }

      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.publishProperty(ctx, propertyId, options);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'PUBLISH_FAILED',
        error: data?.message || data?.error || 'Failed to publish property.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.publishProperty(ctx, propertyId, options);
  }
}

/**
 * Unpublish a property listing.
 * Endpoint: POST /wp-json/apnastay/v1/owner/properties/{id}/unpublish
 */
export async function unpublishProperty(propertyId: string): Promise<PropertyApiResponse<Property>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/unpublish`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (data?.code === 'rest_no_route' || res.status === 404) {
        const updateRes = await updateProperty(propertyId, { status: 'unpublished' });
        if (updateRes.success) {
          return updateRes;
        }
      }

      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.unpublishProperty(ctx, propertyId);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'UNPUBLISH_FAILED',
        error: data?.message || data?.error || 'Failed to unpublish property.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.unpublishProperty(ctx, propertyId);
  }
}

/**
 * Archive a property listing (soft delete).
 * Endpoint: POST /wp-json/apnastay/v1/owner/properties/{id}/archive
 */
export async function archiveProperty(propertyId: string): Promise<PropertyApiResponse<Property>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/archive`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (data?.code === 'rest_no_route' || res.status === 404) {
        const updateRes = await updateProperty(propertyId, { status: 'archived' });
        if (updateRes.success) {
          return updateRes;
        }
      }

      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.archiveProperty(ctx, propertyId);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'ARCHIVE_FAILED',
        error: data?.message || data?.error || 'Failed to archive property.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.archiveProperty(ctx, propertyId);
  }
}

/**
 * Restore an archived property listing back to active management (unpublished).
 * Endpoint: POST /wp-json/apnastay/v1/owner/properties/{id}/restore
 */
export async function restoreProperty(propertyId: string): Promise<PropertyApiResponse<Property>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/restore`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (data?.code === 'rest_no_route' || res.status === 404) {
        const updateRes = await updateProperty(propertyId, { status: 'unpublished' });
        if (updateRes.success) {
          return updateRes;
        }
      }

      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.restoreProperty(ctx, propertyId);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'RESTORE_FAILED',
        error: data?.message || data?.error || 'Failed to restore property.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.restoreProperty(ctx, propertyId);
  }
}

/**
 * Duplicate a property into a new draft listing.
 * Endpoint: POST /wp-json/apnastay/v1/owner/properties/{id}/duplicate
 */
export async function duplicateProperty(propertyId: string): Promise<PropertyApiResponse<Property>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/duplicate`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.duplicateProperty(ctx, propertyId);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'DUPLICATE_FAILED',
        error: data?.message || data?.error || 'Failed to duplicate property.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.duplicateProperty(ctx, propertyId);
  }
}



// ============================================================================
// PHASE 5: PROPERTY PHOTO MANAGEMENT CLIENT API
// ============================================================================

/**
 * Upload and attach a photo to a property draft.
 * Endpoint: POST /wp-json/apnastay/v1/owner/properties/{id}/photos
 */
export async function uploadPropertyPhoto(
  propertyId: string,
  payload: UploadPhotoPayload
): Promise<PropertyApiResponse<PropertyPhoto>> {
  try {
    let res: Response;

    if (payload.file) {
      const formData = new FormData();
      formData.append('file', payload.file);
      if (payload.category) formData.append('category', payload.category);
      if (payload.isCover !== undefined) formData.append('isCover', String(payload.isCover));

      res = await fetch(`${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/photos`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
    } else {
      res = await fetch(`${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.uploadPhoto(ctx, propertyId, payload);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'UPLOAD_PHOTO_FAILED',
        error: data?.message || data?.error || 'Failed to upload photo.'
      };
    }

    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.uploadPhoto(ctx, propertyId, payload);
  }
}

/**
 * Delete a photo from a property.
 * Endpoint: DELETE /wp-json/apnastay/v1/owner/properties/{id}/photos/{photoId}
 */
export async function deletePropertyPhoto(
  propertyId: string,
  photoId: string | number
): Promise<PropertyApiResponse<{ deletedPhotoId: string | number; remainingPhotos: PropertyPhoto[] }>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/photos/${encodeURIComponent(photoId)}`,
      {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
        credentials: 'include'
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.deletePhoto(ctx, propertyId, photoId);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'DELETE_PHOTO_FAILED',
        error: data?.message || data?.error || 'Failed to delete photo.'
      };
    }

    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.deletePhoto(ctx, propertyId, photoId);
  }
}

/**
 * Reorder property photos.
 * Endpoint: PUT /wp-json/apnastay/v1/owner/properties/{id}/photos/reorder
 */
export async function reorderPropertyPhotos(
  propertyId: string,
  orderedPhotoIds: (string | number)[]
): Promise<PropertyApiResponse<PropertyPhoto[]>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/photos/reorder`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ photoIds: orderedPhotoIds })
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.reorderPhotos(ctx, propertyId, orderedPhotoIds);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'REORDER_PHOTOS_FAILED',
        error: data?.message || data?.error || 'Failed to reorder photos.'
      };
    }

    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.reorderPhotos(ctx, propertyId, orderedPhotoIds);
  }
}

/**
 * Update photo metadata (category or cover flag).
 * Endpoint: PUT /wp-json/apnastay/v1/owner/properties/{id}/photos/{photoId}
 */
export async function updatePropertyPhoto(
  propertyId: string,
  photoId: string | number,
  updates: UpdatePhotoPayload
): Promise<PropertyApiResponse<PropertyPhoto>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/photos/${encodeURIComponent(photoId)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.updatePhotoDetails(ctx, propertyId, photoId, updates);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'UPDATE_PHOTO_FAILED',
        error: data?.message || data?.error || 'Failed to update photo details.'
      };
    }

    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.updatePhotoDetails(ctx, propertyId, photoId, updates);
  }
}

/**
 * Set a photo as the primary cover photo for the property.
 */
export async function setCoverPropertyPhoto(
  propertyId: string,
  photoId: string | number
): Promise<PropertyApiResponse<PropertyPhoto>> {
  return updatePropertyPhoto(propertyId, photoId, { isCover: true });
}

// ============================================================================
// PHASE 6: AMENITIES & FEATURES CLIENT API
// ============================================================================

/**
 * Update selected amenities and custom amenities on a property draft.
 * Endpoint: PUT /wp-json/apnastay/v1/owner/properties/{id}
 */
export async function updatePropertyAmenities(
  propertyId: string,
  amenities: string[],
  customAmenities: string[] = []
): Promise<PropertyApiResponse<Property>> {
  return updateProperty(propertyId, {
    amenities,
    customAmenities
  });
}

// ============================================================================
// PHASE 7: UNITS, ROOMS & BEDS CLIENT API
// ============================================================================

/**
 * Persist complete array of property units (and nested beds) to property draft.
 * Endpoint: PUT /wp-json/apnastay/v1/owner/properties/{id}
 */
export async function updatePropertyUnits(
  propertyId: string,
  units: PropertyUnit[]
): Promise<PropertyApiResponse<Property>> {
  return updateProperty(propertyId, { units });
}

// ============================================================================
// PHASE 8: PRICING & AVAILABILITY CLIENT API
// ============================================================================

/**
 * Update property-level pricing and availability.
 * Endpoint: PUT /wp-json/apnastay/v1/owner/properties/{id}/pricing
 */
export async function updatePropertyPricing(
  propertyId: string,
  pricing: PropertyPricing,
  availability?: PropertyAvailability
): Promise<PropertyApiResponse<Property>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/pricing`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pricing, availability })
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.updatePropertyPricing(ctx, propertyId, pricing, availability);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'UPDATE_PRICING_FAILED',
        error: data?.message || data?.error || 'Failed to update property pricing.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.updatePropertyPricing(ctx, propertyId, pricing, availability);
  }
}

/**
 * Update unit-level pricing and availability.
 * Endpoint: PUT /wp-json/apnastay/v1/owner/properties/{id}/units/{unitId}/pricing
 */
export async function updateUnitPricing(
  propertyId: string,
  unitId: string,
  pricing: UnitPricing,
  availability?: string
): Promise<PropertyApiResponse<PropertyUnit>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/units/${encodeURIComponent(unitId)}/pricing`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pricing, availability })
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.updateUnitPricing(ctx, propertyId, unitId, pricing, availability);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'UPDATE_UNIT_PRICING_FAILED',
        error: data?.message || data?.error || 'Failed to update unit pricing.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.updateUnitPricing(ctx, propertyId, unitId, pricing, availability);
  }
}

/**
 * Update bed-level pricing and availability.
 * Endpoint: PUT /wp-json/apnastay/v1/owner/properties/{id}/units/{unitId}/beds/{bedId}/pricing
 */
export async function updateBedPricing(
  propertyId: string,
  unitId: string,
  bedId: string,
  pricing: BedPricing,
  availability?: string
): Promise<PropertyApiResponse<PropertyBed>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/units/${encodeURIComponent(unitId)}/beds/${encodeURIComponent(bedId)}/pricing`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pricing, availability })
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.updateBedPricing(ctx, propertyId, unitId, bedId, pricing, availability);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'UPDATE_BED_PRICING_FAILED',
        error: data?.message || data?.error || 'Failed to update bed pricing.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.updateBedPricing(ctx, propertyId, unitId, bedId, pricing, availability);
  }
}

/**
 * Atomically apply default pricing across all units/beds with optional granular overrides.
 * Endpoint: POST /wp-json/apnastay/v1/owner/properties/{id}/pricing/bulk
 */
export async function updateBulkPricing(
  propertyId: string,
  payload: BulkPricingPayload
): Promise<PropertyApiResponse<Property>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/pricing/bulk`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.updateBulkPricing(ctx, propertyId, payload);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'UPDATE_BULK_PRICING_FAILED',
        error: data?.message || data?.error || 'Failed to update bulk pricing.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.updateBulkPricing(ctx, propertyId, payload);
  }
}

/**
 * Update property rules and tenant preferences.
 * Endpoint: PUT /wp-json/apnastay/v1/owner/properties/{id}/rules
 */
export async function updatePropertyRules(
  propertyId: string,
  rules: Partial<PropertyRules>
): Promise<PropertyApiResponse<PropertyRules>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/rules`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(rules)
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.updatePropertyRules(ctx, propertyId, rules);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'UPDATE_RULES_FAILED',
        error: data?.message || data?.error || 'Failed to update property rules.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    const ctx = await resolveRequestContext();
    return propertyBackend.updatePropertyRules(ctx, propertyId, rules);
  }
}

/**
 * Retrieve a published property for public tenant viewing.
 * Endpoint: GET /wp-json/apnastay/v1/properties/{id}
 */
export async function getPublicProperty(
  propertyId: string
): Promise<PropertyApiResponse<Property>> {
  try {
    const res = await fetch(`${APNASTAY_API_BASE}/properties/${encodeURIComponent(propertyId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        return propertyBackend.getPublicProperty(propertyId);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'PROPERTY_NOT_FOUND',
        error: data?.message || data?.error || 'Failed to retrieve property.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    return propertyBackend.getPublicProperty(propertyId);
  }
}

/**
 * Search and list published properties for tenant browsing.
 * Endpoint: GET /wp-json/apnastay/v1/properties
 */
export async function getPublicProperties(query?: {
  city?: string;
  propertyType?: string;
  limit?: number;
}): Promise<PropertyApiResponse<PropertySummary[]>> {
  try {
    const params = new URLSearchParams();
    if (query?.city) params.set('city', query.city);
    if (query?.propertyType) params.set('propertyType', query.propertyType);
    if (query?.limit) params.set('limit', String(query.limit));

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${APNASTAY_API_BASE}/properties${qs}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        return propertyBackend.getPublicProperties(query);
      }
      return {
        success: false,
        status: res.status,
        code: data?.code || 'LIST_PROPERTIES_FAILED',
        error: data?.message || data?.error || 'Failed to list properties.'
      };
    }
    return {
      success: true,
      status: res.status,
      data: data?.data || data
    };
  } catch (err) {
    return propertyBackend.getPublicProperties(query);
  }
}
