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
  PropertyApiResponse
} from './types';
import { propertyBackend } from './backend';
import { getCurrentUser } from '../auth/api';
import { fetchSession } from '../../lib/auth/session';

const WP_API_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WP_API_URL) || 'http://localhost:8888/wp-json';
const APNASTAY_API_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APNASTAY_API_URL) || `${WP_API_BASE}/apnastay/v1`;

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
    res.status === 404 ||
    data?.code === 'rest_no_route' ||
    res.status === 502 ||
    res.status === 503 ||
    (typeof data?.message === 'string' && data.message.includes('No route was found'))
  );
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
    return {
      success: true,
      status: res.status,
      data: data?.data || data
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
  statusFilter?: PropertyStatus
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
    return {
      success: true,
      status: res.status,
      data: data?.data || data
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
export async function publishProperty(propertyId: string): Promise<PropertyApiResponse<Property>> {
  try {
    const res = await fetch(
      `${APNASTAY_API_BASE}/owner/properties/${encodeURIComponent(propertyId)}/publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (shouldFallbackToSimulation(res, data)) {
        const ctx = await resolveRequestContext();
        return propertyBackend.publishProperty(ctx, propertyId);
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
    return propertyBackend.publishProperty(ctx, propertyId);
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
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
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
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
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
