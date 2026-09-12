// ============================================================================
// APNASTAY PROPERTY ENGINE — BACKEND REPOSITORY & SECURITY ENGINE
// Server-level authorization, validation, and relational Property -> Unit -> Bed operations
// ============================================================================

import type {
  Property,
  PropertyUnit,
  PropertyBed,
  PropertyType,
  RentalStructure,
  PropertyStatus,
  UnitStatus,
  BedStatus,
  CreatePropertyDraftPayload,
  UpdatePropertyPayload,
  CreateUnitPayload,
  CreateBedPayload,
  BulkCreateUnitsPayload,
  PropertyPhoto,
  PhotoCategory,
  UploadPhotoPayload,
  UpdatePhotoPayload,
  PropertyPricing,
  UnitPricing,
  BedPricing,
  GenericRentablePricing,
  PropertyAvailability,
  BulkPricingPayload,
  BackendRequestContext,
  PropertyApiResponse,
  PropertyRules,
  PropertySummary
} from './types';
import { getPropertyTemplate, validateStructureForTemplate } from './templates';
import { validatePricingPayload, calculateEffectiveDeposit, formatPricingDisplay } from './pricing';
import { validatePropertyRules, sanitizePropertyRules } from './rules';
import { evaluateListingCompleteness } from './completeness';
import {
  sanitizeText,
  validateAndSanitizePincode,
  isValidIsoDateString,
  validatePropertyTitle,
  validatePropertyDescription,
  validateTypeAndStructure,
  sanitizeStringArray,
  sanitizeMediaUrl
} from './validation';

export type { BackendRequestContext };

/**
 * Convert a full Property entity into a lightweight PropertySummary projection for listing cards.
 */
export function toPropertySummary(property: Property): PropertySummary {
  const coverPhoto = property.photos?.find((p) => p.isCover) || property.photos?.[0];
  const unitsCount = property.units?.length || 0;
  const photosCount = property.photos?.length || 0;

  let displayPrice = 'Price on Request';
  let monthlyRent: number | undefined = undefined;

  if (property.pricing && property.pricing.monthlyRent !== undefined && property.pricing.monthlyRent > 0) {
    monthlyRent = property.pricing.monthlyRent;
    displayPrice = formatPricingDisplay(property.pricing, property.pricing.monthlyRent);
  } else if (property.units && property.units.length > 0) {
    const unitPrices = property.units
      .map((u) => u.pricing?.monthlyRent)
      .filter((p): p is number => typeof p === 'number' && p > 0);
    if (unitPrices.length > 0) {
      const minPrice = Math.min(...unitPrices);
      displayPrice = `Starts at ₹${minPrice.toLocaleString('en-IN')}/mo`;
      monthlyRent = minPrice;
    }
  }

  return {
    id: property.id,
    ownerId: property.ownerId,
    title: property.title,
    propertyType: property.propertyType,
    customPropertyType: property.customPropertyType,
    rentalStructure: property.rentalStructure,
    status: property.status,
    completenessScore: property.completenessScore,
    location: property.location ? {
      addressLine1: property.location.addressLine1,
      locality: property.location.locality,
      city: property.location.city,
      state: property.location.state,
      pincode: property.location.pincode
    } : undefined,
    coverPhotoUrl: coverPhoto?.thumbnailUrl || coverPhoto?.url,
    photosCount,
    unitsCount,
    displayPrice,
    monthlyRent,
    publishedAt: property.publishedAt,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt
  };
}

/**
 * Generate lightweight unique IDs (cryptographically secure where available, RFC4122 v4 fallback).
 */
export function generateEntityId(prefix: string = 'ent'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${randomStr}`;
}

/**
 * In-memory / persistent backend data store for properties.
 */
class PropertyBackendStore {
  private properties: Map<string, Property> = new Map();
  private storageKey = 'apnastay_properties_store_v1';

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed: Property[] = JSON.parse(raw);
          parsed.forEach((p) => this.properties.set(p.id, p));
        }
      } catch (e) {
        console.warn('[PropertyStore] Failed to hydrate store from localStorage:', e);
      }
    }
  }

  private persist() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const arr = Array.from(this.properties.values());
        window.localStorage.setItem(this.storageKey, JSON.stringify(arr));
      } catch (e) {
        console.warn('[PropertyStore] Failed to persist store to localStorage:', e);
      }
    }
  }

  /**
   * Reset store (used in test suites).
   */
  public reset() {
    this.properties.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Synchronize / upsert a property into the backend store.
   * Ensures that properties loaded from external CMS or restored from session
   * are immediately available in the local store.
   */
  public ensureProperty(partial: Partial<Property> & { id: string }): Property {
    const existing = this.properties.get(partial.id);
    if (existing) {
      const merged: Property = {
        ...existing,
        ...partial,
        units: partial.units !== undefined ? partial.units : (existing.units || []),
        photos: partial.photos !== undefined ? partial.photos : (existing.photos || []),
        amenities: partial.amenities !== undefined ? partial.amenities : (existing.amenities || []),
        customAmenities: partial.customAmenities !== undefined ? partial.customAmenities : (existing.customAmenities || []),
        updatedAt: new Date().toISOString()
      };
      merged.completenessScore = this.computeCompletenessScore(merged);
      this.properties.set(partial.id, merged);
      this.persist();
      return merged;
    }

    const now = new Date().toISOString();
    const created: Property = {
      id: partial.id,
      ownerId: partial.ownerId || 24,
      propertyType: partial.propertyType || 'apartment',
      customPropertyType: partial.customPropertyType,
      rentalStructure: partial.rentalStructure || 'multiple_units',
      title: partial.title || `Property ${partial.id}`,
      description: partial.description || '',
      status: partial.status || 'draft',
      location: partial.location,
      availability: partial.availability,
      pricing: partial.pricing,
      amenities: partial.amenities || [],
      customAmenities: partial.customAmenities || [],
      rules: partial.rules || {
        tenantPreference: 'all',
        smokingAllowed: false,
        alcoholAllowed: false,
        petsAllowed: false,
        visitorsAllowed: true
      },
      photos: partial.photos || [],
      completenessScore: partial.completenessScore || 40,
      units: partial.units || [],
      createdAt: partial.createdAt || now,
      updatedAt: now
    };
    created.completenessScore = this.computeCompletenessScore(created);
    this.properties.set(partial.id, created);
    this.persist();
    return created;
  }

  /**
   * Retrieve an existing property with strict 404 if missing and ownership enforcement.
   */
  public getOrEnsureProperty(propertyId: string, ctx: BackendRequestContext): Property {
    const property = this.properties.get(propertyId);
    if (!property) {
      const error: any = new Error(`Property with ID '${propertyId}' not found.`);
      error.code = 'PROPERTY_NOT_FOUND';
      error.status = 404;
      throw error;
    }
    this.assertOwnership(property, ctx);
    return property;
  }

  // --------------------------------------------------------------------------
  // Authorization & Relational Guards
  // --------------------------------------------------------------------------
  private assertOwnership(property: Property, ctx: BackendRequestContext): void {
    if (ctx.isAdmin) {
      return; // Administrator can bypass ownership check
    }
    if (!ctx.userId || Number(property.ownerId) !== Number(ctx.userId)) {
      const error: any = new Error('Access denied: You do not own this property.');
      error.code = 'NOT_PROPERTY_OWNER';
      error.status = 403;
      throw error;
    }
  }

  private assertAuthenticated(ctx: BackendRequestContext): void {
    if (!ctx.userId || ctx.userId <= 0) {
      const error: any = new Error('Authentication required.');
      error.code = 'UNAUTHENTICATED';
      error.status = 401;
      throw error;
    }
  }

  private assertNotArchived(property: Property): void {
    if (property.status === 'archived') {
      const error: any = new Error('Archived properties cannot be modified. Please restore the listing first.');
      error.code = 'INVALID_STATUS_TRANSITION';
      error.status = 400;
      throw error;
    }
  }

  private assertUnitBelongsToProperty(property: Property, unitId: string): PropertyUnit {
    const unit = (property.units || []).find((u) => u.id === unitId);
    if (!unit) {
      const error: any = new Error(`Unit with ID '${unitId}' does not belong to property '${property.id}'.`);
      error.code = 'RELATIONSHIP_MISMATCH';
      error.status = 404;
      throw error;
    }
    return unit;
  }

  private assertBedBelongsToUnit(unit: PropertyUnit, bedId: string): PropertyBed {
    const bed = (unit.beds || []).find((b) => b.id === bedId);
    if (!bed) {
      const error: any = new Error(`Bed with ID '${bedId}' does not belong to unit '${unit.id}'.`);
      error.code = 'RELATIONSHIP_MISMATCH';
      error.status = 404;
      throw error;
    }
    return bed;
  }

  // --------------------------------------------------------------------------
  // Property Operations
  // --------------------------------------------------------------------------

  /**
   * Create a new property draft.
   */
  public createDraft(
    ctx: BackendRequestContext,
    payload: CreatePropertyDraftPayload
  ): PropertyApiResponse<Property> {
    try {
      this.assertAuthenticated(ctx);

      const typeValidation = validateTypeAndStructure(payload.propertyType, payload.rentalStructure);
      if (!typeValidation.isValid) {
        return {
          success: false,
          status: 400,
          code: typeValidation.error?.includes('Rental structure') ? 'INVALID_RENTAL_STRUCTURE' : 'INVALID_PROPERTY_TYPE',
          error: typeValidation.error || `Rental structure '${payload.rentalStructure}' is not supported for property type '${payload.propertyType}'.`
        };
      }

      const template = getPropertyTemplate(payload.propertyType);
      const rentalStructure = payload.rentalStructure || template.defaultRentalStructure;

      // Pincode validation if provided
      if (payload.location?.pincode) {
        const pinRes = validateAndSanitizePincode(payload.location.pincode);
        if (!pinRes.isValid) {
          return {
            success: false,
            status: 400,
            code: 'INVALID_PINCODE',
            error: 'Pincode must be a valid 6-digit Indian postal code.'
          };
        }
      }

      // Availability date validation
      if (
        payload.availability?.type === 'specific_date' &&
        payload.availability.availableFrom &&
        !isValidIsoDateString(payload.availability.availableFrom)
      ) {
        return {
          success: false,
          status: 400,
          code: 'INVALID_DATE_FORMAT',
          error: 'availableFrom date must be in YYYY-MM-DD format.'
        };
      }

      const now = new Date().toISOString();
      const id = generateEntityId('prop');

      const sanitizedTitle = payload.title ? sanitizeText(payload.title, 150) : `New ${template.label} Draft`;
      const sanitizedDesc = payload.description ? sanitizeText(payload.description, 5000) : '';

      const property: Property = {
        id,
        ownerId: ctx.userId,
        propertyType: payload.propertyType,
        customPropertyType: payload.propertyType === 'other' && payload.customPropertyType ? sanitizeText(payload.customPropertyType, 100) : undefined,
        rentalStructure,
        title: sanitizedTitle,
        description: sanitizedDesc,
        status: 'draft',
        location: payload.location ? {
          addressLine1: sanitizeText(payload.location.addressLine1 || '', 200),
          locality: payload.location.locality ? sanitizeText(payload.location.locality, 150) : undefined,
          addressLine2: payload.location.addressLine2 ? sanitizeText(payload.location.addressLine2, 200) : undefined,
          city: sanitizeText(payload.location.city || '', 100),
          state: payload.location.state ? sanitizeText(payload.location.state, 100) : undefined,
          pincode: payload.location.pincode ? validateAndSanitizePincode(payload.location.pincode).value : '',
          latitude: payload.location.latitude,
          longitude: payload.location.longitude,
          landmark: payload.location.landmark ? sanitizeText(payload.location.landmark, 150) : undefined,
          hideExactAddress: payload.location.hideExactAddress
        } : undefined,
        availability: payload.availability ? {
          type: payload.availability.type,
          availableFrom: payload.availability.type === 'specific_date' ? payload.availability.availableFrom : undefined
        } : undefined,
        pricing: payload.pricing ? {
          monthlyRent: payload.pricing.monthlyRent || 0,
          securityDeposit: payload.pricing.securityDeposit,
          maintenance: payload.pricing.maintenance,
          lockInMonths: payload.pricing.lockInMonths,
          noticePeriodDays: payload.pricing.noticePeriodDays,
          foodIncluded: payload.pricing.foodIncluded,
          foodChargesMonthly: payload.pricing.foodChargesMonthly
        } : undefined,
        amenities: [],
        rules: {
          tenantPreference: 'all',
          smokingAllowed: false,
          alcoholAllowed: false,
          petsAllowed: false,
          visitorsAllowed: true
        },
        photos: [],
        completenessScore: 15,
        units: [],
        createdAt: now,
        updatedAt: now
      };
      property.completenessScore = this.computeCompletenessScore(property);

      this.properties.set(id, property);
      this.persist();

      return {
        success: true,
        status: 201,
        data: property
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'CREATE_DRAFT_ERROR',
        error: err.message || 'Failed to create property draft.'
      };
    }
  }

  /**
   * Retrieve a property with strict ownership check.
   */
  public getProperty(ctx: BackendRequestContext, propertyId: string): PropertyApiResponse<Property> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);

      return {
        success: true,
        status: 200,
        data: property
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'GET_PROPERTY_ERROR',
        error: err.message || 'Failed to retrieve property.'
      };
    }
  }

  /**
   * List all properties belonging to an owner.
   * By default or with 'active', hides archived listings.
   */
  public getOwnerProperties(
    ctx: BackendRequestContext,
    filterStatus?: PropertyStatus | 'active' | 'all'
  ): PropertyApiResponse<Property[]> {
    try {
      this.assertAuthenticated(ctx);

      const list = Array.from(this.properties.values()).filter((p) => {
        const belongsToOwner = Number(p.ownerId) === Number(ctx.userId);
        if (!belongsToOwner) return false;

        if (!filterStatus || filterStatus === 'active') {
          // Default: hide archived listings from the active portfolio
          return p.status !== 'archived';
        }
        if (filterStatus === 'all') {
          return true;
        }
        return p.status === filterStatus;
      });

      // Sort newest first
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      return {
        success: true,
        status: 200,
        data: list
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'LIST_PROPERTIES_ERROR',
        error: err.message || 'Failed to list properties.'
      };
    }
  }

  /**
   * Update property metadata, details, location, amenities, or pricing.
   */
  public updateProperty(
    ctx: BackendRequestContext,
    propertyId: string,
    payload: UpdatePropertyPayload
  ): PropertyApiResponse<Property> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      // Validate structure compatibility if propertyType or rentalStructure is updated
      const newType = payload.propertyType || property.propertyType;
      const newStructure = payload.rentalStructure || property.rentalStructure;
      const typeValidation = validateTypeAndStructure(newType, newStructure);
      if (!typeValidation.isValid) {
        return {
          success: false,
          status: 400,
          code: typeValidation.error?.includes('Rental structure') ? 'INVALID_RENTAL_STRUCTURE' : 'INVALID_PROPERTY_TYPE',
          error: typeValidation.error || `Rental structure '${newStructure}' is not supported for property type '${newType}'.`
        };
      }

      const now = new Date().toISOString();

      if (payload.title !== undefined) {
        property.title = sanitizeText(payload.title, 150);
      }
      if (payload.description !== undefined) {
        property.description = sanitizeText(payload.description, 5000);
      }
      if (payload.propertyType !== undefined) property.propertyType = payload.propertyType;
      if (payload.customPropertyType !== undefined) {
        property.customPropertyType = payload.customPropertyType ? sanitizeText(payload.customPropertyType, 100) : undefined;
      }
      if (payload.rentalStructure !== undefined) property.rentalStructure = payload.rentalStructure;

      if (payload.location !== undefined) {
        if (payload.location.pincode) {
          const pinRes = validateAndSanitizePincode(payload.location.pincode);
          if (!pinRes.isValid) {
            return {
              success: false,
              status: 400,
              code: 'INVALID_PINCODE',
              error: 'Pincode must be a valid 6-digit Indian postal code.'
            };
          }
        }
        property.location = {
          addressLine1: payload.location.addressLine1 !== undefined ? sanitizeText(payload.location.addressLine1, 200) : (property.location?.addressLine1 ?? ''),
          locality: payload.location.locality !== undefined ? (payload.location.locality ? sanitizeText(payload.location.locality, 150) : undefined) : property.location?.locality,
          addressLine2: payload.location.addressLine2 !== undefined ? (payload.location.addressLine2 ? sanitizeText(payload.location.addressLine2, 200) : undefined) : property.location?.addressLine2,
          city: payload.location.city !== undefined ? sanitizeText(payload.location.city, 100) : (property.location?.city ?? ''),
          state: payload.location.state !== undefined ? (payload.location.state ? sanitizeText(payload.location.state, 100) : undefined) : property.location?.state,
          pincode: payload.location.pincode !== undefined ? validateAndSanitizePincode(payload.location.pincode).value : (property.location?.pincode ?? ''),
          latitude: payload.location.latitude ?? property.location?.latitude,
          longitude: payload.location.longitude ?? property.location?.longitude,
          landmark: payload.location.landmark !== undefined ? (payload.location.landmark ? sanitizeText(payload.location.landmark, 150) : undefined) : property.location?.landmark,
          hideExactAddress: payload.location.hideExactAddress ?? property.location?.hideExactAddress
        };
      }

      if (payload.availability !== undefined) {
        if (
          payload.availability.type === 'specific_date' &&
          payload.availability.availableFrom &&
          !isValidIsoDateString(payload.availability.availableFrom)
        ) {
          return {
            success: false,
            status: 400,
            code: 'INVALID_DATE_FORMAT',
            error: 'availableFrom date must be in YYYY-MM-DD format.'
          };
        }
        property.availability = {
          type: payload.availability.type,
          availableFrom: payload.availability.type === 'specific_date' ? payload.availability.availableFrom : undefined
        };
      }

      if (payload.pricing !== undefined) {
        property.pricing = {
          ...property.pricing,
          ...payload.pricing,
          monthlyRent: payload.pricing.monthlyRent ?? property.pricing?.monthlyRent ?? 0
        };
      }

      if (payload.amenities !== undefined) {
        property.amenities = sanitizeStringArray(payload.amenities, 100, 100);
      }

      if (payload.customAmenities !== undefined) {
        property.customAmenities = sanitizeStringArray(payload.customAmenities, 50, 100);
      }

      if (payload.rules !== undefined) {
        property.rules = sanitizePropertyRules({
          ...property.rules,
          ...payload.rules
        });
      }

      if (payload.photos !== undefined) {
        const normalized = payload.photos.map((p, idx) => ({
          ...p,
          fileName: p.fileName ? sanitizeText(p.fileName, 255) : undefined,
          order: typeof p.order === 'number' ? p.order : idx
        }));
        const hasCover = normalized.some((p) => p.isCover);
        if (!hasCover && normalized.length > 0) {
          normalized[0].isCover = true;
        }
        property.photos = normalized;
      }

      if (payload.units !== undefined) {
        property.units = payload.units;
      }

      if (payload.status !== undefined && payload.status !== property.status) {
        if (property.status === 'archived' && payload.status !== 'unpublished') {
          return {
            success: false,
            status: 400,
            code: 'INVALID_STATUS_TRANSITION',
            error: 'Archived properties must be restored before changing status.'
          };
        }
        if (payload.status === 'unpublished' && property.status !== 'published') {
          return {
            success: false,
            status: 400,
            code: 'INVALID_STATUS_TRANSITION',
            error: `Cannot unpublish listing with status '${property.status}'. Only active published listings can be unpublished.`
          };
        }
        if (payload.status === 'published') {
          const evalRes = evaluateListingCompleteness(property);
          if (!evalRes.isPublishable) {
            return {
              success: false,
              status: 400,
              code: 'LISTING_INCOMPLETE',
              error: 'Cannot publish listing: required fields are missing.'
            };
          }
          property.publishedAt = now;
        }
        property.status = payload.status;
      }


      property.completenessScore = this.computeCompletenessScore(property);
      property.updatedAt = now;
      this.persist();

      return {
        success: true,
        status: 200,
        data: property
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'UPDATE_PROPERTY_ERROR',
        error: err.message || 'Failed to update property.'
      };
    }
  }

  // --------------------------------------------------------------------------
  // Completeness Scoring Helper
  // --------------------------------------------------------------------------
  public computeCompletenessScore(property: Property): number {
    let score = 15; // baseline draft created
    if (
      property.title &&
      property.title.length >= 3 &&
      !property.title.startsWith('New ') &&
      !property.title.endsWith('Draft')
    ) {
      score += 5;
    }
    if (property.description && property.description.length >= 10) score += 5;
    if (
      property.pricing &&
      (property.pricing.monthlyRent > 0 || property.pricing.pricingMode === 'on_request')
    ) {
      score += 5;
    }
    if (property.availability) score += 5;
    if (property.location?.city && property.location?.addressLine1 && property.location?.pincode) {
      score += 15;
    } else if (property.location?.city) {
      score += 8;
    }
    if (property.photos && property.photos.length > 0) score += 20;
    const hasAmenities =
      (property.amenities && property.amenities.length > 0) ||
      (property.customAmenities && property.customAmenities.length > 0);
    if (hasAmenities) score += 10;

    // Phase 8: Detailed pricing configurations on entities
    const hasDetailedPricing = Boolean(
      property.pricing?.securityDepositConfig ||
      property.pricing?.maintenanceChargesConfig ||
      property.pricing?.electricityChargesConfig
    );
    if (hasDetailedPricing) score += 5;

    // Phase 9: Rules & Preferences scoring
    const hasConfiguredRules = Boolean(
      property.rules &&
      (
        (property.rules.suitableFor && property.rules.suitableFor.length > 0) ||
        (property.rules.guestPolicy && property.rules.guestPolicy !== 'not_specified') ||
        (property.rules.petPolicy && property.rules.petPolicy !== 'not_specified') ||
        (property.rules.smokingPolicy && property.rules.smokingPolicy !== 'not_specified') ||
        (property.rules.alcoholPolicy && property.rules.alcoholPolicy !== 'not_specified') ||
        (property.rules.timingType && property.rules.timingType !== 'not_specified') ||
        (property.rules.foodPolicy && property.rules.foodPolicy !== 'not_specified') ||
        (property.rules.kitchenAccess && property.rules.kitchenAccess !== 'not_specified') ||
        (property.rules.customRules && property.rules.customRules.length > 0) ||
        property.rules.requiresIdProof ||
        property.rules.requiresPoliceVerification
      )
    );
    if (hasConfiguredRules) score += 5;

    // Structure / Units scoring
    if (property.units && property.units.length > 0) {
      score += 20;
    } else if (property.rentalStructure === 'entire_property' && hasDetailedPricing) {
      score += 20;
    }

    return Math.min(100, score);
  }

  // --------------------------------------------------------------------------
  // Phase 5: Photo Management Operations
  // --------------------------------------------------------------------------

  /**
   * Upload and attach a photo to a property with validation & ownership security.
   */
  public uploadPhoto(
    ctx: BackendRequestContext,
    propertyId: string,
    payload: UploadPhotoPayload
  ): PropertyApiResponse<PropertyPhoto> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      // File format validation
      const supportedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/heic',
        'image/heif'
      ];
      const mime = (payload.mimeType || '').toLowerCase();
      const ext = (payload.fileName || '').split('.').pop()?.toLowerCase() || '';
      const supportedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];

      const isValidMime = supportedMimes.includes(mime);
      const isValidExt = supportedExts.includes(ext);

      if (!isValidMime && !isValidExt) {
        return {
          success: false,
          status: 400,
          code: 'INVALID_IMAGE_FORMAT',
          error: `Unsupported image format (${mime || ext || 'unknown'}). Supported formats: JPEG, PNG, WebP, GIF, and HEIC.`
        };
      }

      // File size validation (up to 10MB)
      if (typeof payload.fileSize === 'number') {
        if (payload.fileSize <= 0) {
          return {
            success: false,
            status: 400,
            code: 'CORRUPTED_IMAGE',
            error: 'Image file is empty or corrupted (0 bytes).'
          };
        }
        const maxBytes = 10 * 1024 * 1024; // 10MB
        if (payload.fileSize > maxBytes) {
          return {
            success: false,
            status: 400,
            code: 'IMAGE_TOO_LARGE',
            error: `Image exceeds maximum allowed size of 10MB (got ${(payload.fileSize / (1024 * 1024)).toFixed(1)}MB).`
          };
        }
      }

      const photoId = generateEntityId('photo');
      const now = new Date().toISOString();
      const existingPhotos = property.photos ? [...property.photos] : [];

      // Determine cover photo status:
      // If manually specified true, or if this is the first photo, set as cover.
      const isFirst = existingPhotos.length === 0;
      const isCover = payload.isCover !== undefined ? payload.isCover : isFirst;

      if (isCover) {
        existingPhotos.forEach((p) => {
          p.isCover = false;
        });
      }

      const photoUrl =
        payload.dataUrl ||
        (payload.file && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
          ? URL.createObjectURL(payload.file)
          : `/uploads/properties/${propertyId}/${photoId}.jpg`);

      const newPhoto: PropertyPhoto = {
        id: photoId,
        url: photoUrl,
        thumbnailUrl: photoUrl,
        category: payload.category,
        isCover,
        order: existingPhotos.length,
        fileName: payload.fileName ? sanitizeText(payload.fileName, 255) : undefined,
        fileSize: payload.fileSize,
        mimeType: payload.mimeType,
        uploadedAt: now
      };

      existingPhotos.push(newPhoto);
      property.photos = existingPhotos;
      property.completenessScore = this.computeCompletenessScore(property);
      property.updatedAt = now;
      this.persist();

      return {
        success: true,
        status: 201,
        data: newPhoto
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'UPLOAD_PHOTO_ERROR',
        error: err.message || 'Failed to upload photo.'
      };
    }
  }

  /**
   * Delete a photo with ownership check and automatic cover photo fallback.
   */
  public deletePhoto(
    ctx: BackendRequestContext,
    propertyId: string,
    photoId: string | number
  ): PropertyApiResponse<{ deletedPhotoId: string | number; remainingPhotos: PropertyPhoto[] }> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const photos = property.photos ? [...property.photos] : [];
      const index = photos.findIndex((p) => String(p.id) === String(photoId));
      if (index === -1) {
        return {
          success: false,
          status: 404,
          code: 'PHOTO_NOT_FOUND',
          error: `Photo with ID '${photoId}' not found on this property.`
        };
      }

      const [deleted] = photos.splice(index, 1);

      // Reorder remaining photos
      photos.forEach((p, idx) => {
        p.order = idx;
      });

      // If deleted photo was cover, assign cover to the first remaining photo
      if (deleted.isCover && photos.length > 0) {
        photos[0].isCover = true;
      }

      property.photos = photos;
      property.completenessScore = this.computeCompletenessScore(property);
      property.updatedAt = new Date().toISOString();
      this.persist();

      return {
        success: true,
        status: 200,
        data: {
          deletedPhotoId: photoId,
          remainingPhotos: photos
        }
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'DELETE_PHOTO_ERROR',
        error: err.message || 'Failed to delete photo.'
      };
    }
  }

  /**
   * Reorder property photos according to provided array of photo IDs.
   */
  public reorderPhotos(
    ctx: BackendRequestContext,
    propertyId: string,
    orderedPhotoIds: (string | number)[]
  ): PropertyApiResponse<PropertyPhoto[]> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const existingPhotos = property.photos ? [...property.photos] : [];
      const photoMap = new Map<string, PropertyPhoto>();
      existingPhotos.forEach((p) => photoMap.set(String(p.id), { ...p }));

      // Relational check: ensure all requested photo IDs belong to this property
      for (const id of orderedPhotoIds) {
        if (!photoMap.has(String(id))) {
          return {
            success: false,
            status: 404,
            code: 'RELATIONSHIP_MISMATCH',
            error: `Photo with ID '${id}' does not belong to property '${property.id}'.`
          };
        }
      }

      const reordered: PropertyPhoto[] = [];
      orderedPhotoIds.forEach((id, idx) => {
        const p = photoMap.get(String(id));
        if (p) {
          p.order = idx;
          reordered.push(p);
          photoMap.delete(String(id));
        }
      });

      // Append any unmentioned photos to the end
      photoMap.forEach((p) => {
        p.order = reordered.length;
        reordered.push(p);
      });

      // Ensure a cover photo is defined if photos exist
      const hasCover = reordered.some((p) => p.isCover);
      if (!hasCover && reordered.length > 0) {
        reordered[0].isCover = true;
      }

      property.photos = reordered;
      property.updatedAt = new Date().toISOString();
      this.persist();

      return {
        success: true,
        status: 200,
        data: reordered
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'REORDER_PHOTOS_ERROR',
        error: err.message || 'Failed to reorder photos.'
      };
    }
  }

  /**
   * Update individual photo details (category, isCover, or order).
   */
  public updatePhotoDetails(
    ctx: BackendRequestContext,
    propertyId: string,
    photoId: string | number,
    updates: UpdatePhotoPayload
  ): PropertyApiResponse<PropertyPhoto> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const photos = property.photos ? [...property.photos] : [];
      const photo = photos.find((p) => String(p.id) === String(photoId));
      if (!photo) {
        return {
          success: false,
          status: 404,
          code: 'PHOTO_NOT_FOUND',
          error: `Photo with ID '${photoId}' not found on this property.`
        };
      }

      if (updates.isCover === true) {
        photos.forEach((p) => {
          p.isCover = false;
        });
        photo.isCover = true;
      }

      if (updates.category !== undefined) {
        photo.category = updates.category;
      }

      if (typeof updates.order === 'number') {
        photo.order = updates.order;
        photos.sort((a, b) => a.order - b.order);
        photos.forEach((p, idx) => {
          p.order = idx;
        });
      }

      property.photos = photos;
      property.updatedAt = new Date().toISOString();
      this.persist();

      return {
        success: true,
        status: 200,
        data: photo
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'UPDATE_PHOTO_ERROR',
        error: err.message || 'Failed to update photo details.'
      };
    }
  }

  /**
   * Set specific photo as the primary cover photo.
   */
  public setCoverPhoto(
    ctx: BackendRequestContext,
    propertyId: string,
    photoId: string | number
  ): PropertyApiResponse<PropertyPhoto> {
    return this.updatePhotoDetails(ctx, propertyId, photoId, { isCover: true });
  }

  // --------------------------------------------------------------------------
  // Unit & Bed Relational Operations
  // --------------------------------------------------------------------------

  /**
   * Add a new unit to a property.
   */
  public addUnit(
    ctx: BackendRequestContext,
    propertyId: string,
    payload: CreateUnitPayload
  ): PropertyApiResponse<PropertyUnit> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const sanitizedName = sanitizeText(payload.nameOrNumber, 100);
      if (!sanitizedName) {
        return {
          success: false,
          status: 400,
          code: 'INVALID_UNIT_NAME',
          error: 'Unit name or number is required.'
        };
      }

      const now = new Date().toISOString();
      const unitId = generateEntityId('unit');

      // Auto-generate beds if requested (e.g. for PG double/triple sharing)
      const beds: PropertyBed[] = [];
      const bedsCount = payload.initialBedsCount || 0;
      for (let i = 0; i < bedsCount; i++) {
        const bedLabel = bedsCount <= 26 ? `Bed ${String.fromCharCode(65 + i)}` : `Bed ${i + 1}`;
        beds.push({
          id: generateEntityId('bed'),
          unitId,
          label: bedLabel,
          bedType: 'single',
          availability: 'available',
          pricing: {
            monthlyRent: payload.pricing.monthlyRent,
            securityDeposit: payload.pricing.securityDeposit
          },
          status: 'available',
          createdAt: now,
          updatedAt: now
        });
      }

      const unit: PropertyUnit = {
        id: unitId,
        propertyId,
        nameOrNumber: sanitizedName,
        unitType: payload.unitType,
        description: payload.description ? sanitizeText(payload.description, 500) : undefined,
        capacity: payload.capacity || (bedsCount > 0 ? bedsCount : 1),
        furnishing: payload.furnishing || 'semi_furnished',
        floor: payload.floor,
        carpetAreaSqft: payload.carpetAreaSqft,
        pricing: {
          monthlyRent: payload.pricing.monthlyRent,
          securityDeposit: payload.pricing.securityDeposit,
          maintenance: payload.pricing.maintenance
        },
        availability: payload.availability || 'available',
        status: payload.status || 'available',
        beds,
        createdAt: now,
        updatedAt: now
      };

      property.units.push(unit);
      property.updatedAt = now;
      this.persist();

      return {
        success: true,
        status: 201,
        data: unit
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'ADD_UNIT_ERROR',
        error: err.message || 'Failed to add unit to property.'
      };
    }
  }

  /**
   * Bulk generate multiple identical units (e.g., 20 double-sharing rooms).
   */
  public bulkCreateUnits(
    ctx: BackendRequestContext,
    propertyId: string,
    payload: BulkCreateUnitsPayload
  ): PropertyApiResponse<PropertyUnit[]> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      if (!payload.count || payload.count < 1 || payload.count > 100) {
        return {
          success: false,
          status: 400,
          code: 'INVALID_UNIT_COUNT',
          error: 'Bulk creation count must be between 1 and 100.'
        };
      }

      const now = new Date().toISOString();
      const prefix = payload.prefix ? sanitizeText(payload.prefix, 50) : 'Room';
      const startNum = payload.startingNumber || 101;
      const createdUnits: PropertyUnit[] = [];

      for (let i = 0; i < payload.count; i++) {
        const unitNumber = `${prefix} ${startNum + i}`;
        const unitId = generateEntityId('unit');

        // Beds inside each room
        const beds: PropertyBed[] = [];
        const bedsPerUnit = payload.bedsPerUnit || 0;
        for (let b = 0; b < bedsPerUnit; b++) {
          const bedLabel = bedsPerUnit <= 26 ? `Bed ${String.fromCharCode(65 + b)}` : `Bed ${b + 1}`;
          beds.push({
            id: generateEntityId('bed'),
            unitId,
            label: bedLabel,
            bedType: 'single',
            availability: 'available',
            pricing: {
              monthlyRent: payload.bedPriceMonthly || payload.pricing.monthlyRent,
              securityDeposit: payload.bedDeposit || payload.pricing.securityDeposit
            },
            status: 'available',
            createdAt: now,
            updatedAt: now
          });
        }

        const unit: PropertyUnit = {
          id: unitId,
          propertyId,
          nameOrNumber: unitNumber,
          unitType: payload.unitType,
          capacity: payload.capacityPerUnit || (bedsPerUnit > 0 ? bedsPerUnit : 1),
          furnishing: payload.furnishing || 'semi_furnished',
          pricing: {
            monthlyRent: payload.pricing.monthlyRent,
            securityDeposit: payload.pricing.securityDeposit,
            maintenance: payload.pricing.maintenance
          },
          availability: 'available',
          status: 'available',
          beds,
          createdAt: now,
          updatedAt: now
        };

        property.units.push(unit);
        createdUnits.push(unit);
      }

      property.updatedAt = now;
      this.persist();

      return {
        success: true,
        status: 201,
        data: createdUnits
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'BULK_CREATE_UNITS_ERROR',
        error: err.message || 'Failed to bulk create units.'
      };
    }
  }

  /**
   * Duplicate an existing unit with all its specs and beds.
   */
  public duplicateUnit(
    ctx: BackendRequestContext,
    propertyId: string,
    unitId: string,
    newNameOrNumber?: string
  ): PropertyApiResponse<PropertyUnit> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const sourceUnit = this.assertUnitBelongsToProperty(property, unitId);

      const now = new Date().toISOString();
      const newUnitId = generateEntityId('unit');
      const clonedBeds: PropertyBed[] = sourceUnit.beds.map((b) => ({
        ...b,
        id: generateEntityId('bed'),
        unitId: newUnitId,
        availability: 'available',
        status: 'available',
        createdAt: now,
        updatedAt: now
      }));

      const clonedUnit: PropertyUnit = {
        ...sourceUnit,
        id: newUnitId,
        nameOrNumber: newNameOrNumber ? sanitizeText(newNameOrNumber, 100) : `${sourceUnit.nameOrNumber} (Copy)`,
        availability: 'available',
        status: 'available',
        beds: clonedBeds,
        createdAt: now,
        updatedAt: now
      };

      property.units.push(clonedUnit);
      property.updatedAt = now;
      this.persist();

      return {
        success: true,
        status: 201,
        data: clonedUnit
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'DUPLICATE_UNIT_ERROR',
        error: err.message || 'Failed to duplicate unit.'
      };
    }
  }

  /**
   * Update an existing unit.
   */
  public updateUnit(
    ctx: BackendRequestContext,
    propertyId: string,
    unitId: string,
    updates: Partial<PropertyUnit>
  ): PropertyApiResponse<PropertyUnit> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const unit = this.assertUnitBelongsToProperty(property, unitId);

      const now = new Date().toISOString();
      if (updates.nameOrNumber !== undefined) unit.nameOrNumber = sanitizeText(updates.nameOrNumber, 100);
      if (updates.unitType !== undefined) unit.unitType = updates.unitType;
      if (updates.description !== undefined) unit.description = updates.description ? sanitizeText(updates.description, 500) : undefined;
      if (updates.capacity !== undefined) unit.capacity = updates.capacity;
      if (updates.furnishing !== undefined) unit.furnishing = updates.furnishing;
      if (updates.floor !== undefined) unit.floor = updates.floor;
      if (updates.carpetAreaSqft !== undefined) unit.carpetAreaSqft = updates.carpetAreaSqft;
      if (updates.pricing !== undefined) unit.pricing = { ...unit.pricing, ...updates.pricing };
      if (updates.availability !== undefined) unit.availability = updates.availability;
      if (updates.status !== undefined) unit.status = updates.status;

      unit.updatedAt = now;
      property.updatedAt = now;
      this.persist();

      return {
        success: true,
        status: 200,
        data: unit
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'UPDATE_UNIT_ERROR',
        error: err.message || 'Failed to update unit.'
      };
    }
  }

  /**
   * Delete a unit from a property (cascades nested beds).
   */
  public deleteUnit(
    ctx: BackendRequestContext,
    propertyId: string,
    unitId: string
  ): PropertyApiResponse<null> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      this.assertUnitBelongsToProperty(property, unitId);

      property.units = property.units.filter((u) => u.id !== unitId);

      const now = new Date().toISOString();
      property.updatedAt = now;
      this.persist();

      return {
        success: true,
        status: 200,
        data: null
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'DELETE_UNIT_ERROR',
        error: err.message || 'Failed to delete unit.'
      };
    }
  }

  /**
   * Add a bed to a unit.
   */
  public addBed(
    ctx: BackendRequestContext,
    propertyId: string,
    unitId: string,
    payload: CreateBedPayload
  ): PropertyApiResponse<PropertyBed> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const unit = this.assertUnitBelongsToProperty(property, unitId);

      const sanitizedLabel = sanitizeText(payload.label, 100);
      if (!sanitizedLabel) {
        return {
          success: false,
          status: 400,
          code: 'INVALID_BED_LABEL',
          error: 'Bed label is required.'
        };
      }

      const now = new Date().toISOString();
      const bedId = generateEntityId('bed');
      const bed: PropertyBed = {
        id: bedId,
        unitId,
        label: sanitizedLabel,
        bedType: payload.bedType || 'single',
        pricing: {
          monthlyRent: payload.pricing.monthlyRent,
          securityDeposit: payload.pricing.securityDeposit
        },
        availability: payload.availability || 'available',
        status: payload.status || 'available',
        createdAt: now,
        updatedAt: now
      };

      unit.beds.push(bed);
      unit.updatedAt = now;
      property.updatedAt = now;
      this.persist();

      return {
        success: true,
        status: 201,
        data: bed
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'ADD_BED_ERROR',
        error: err.message || 'Failed to add bed to unit.'
      };
    }
  }

  /**
   * Update an existing bed.
   */
  public updateBed(
    ctx: BackendRequestContext,
    propertyId: string,
    unitId: string,
    bedId: string,
    updates: Partial<PropertyBed>
  ): PropertyApiResponse<PropertyBed> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const unit = this.assertUnitBelongsToProperty(property, unitId);
      const bed = this.assertBedBelongsToUnit(unit, bedId);

      const now = new Date().toISOString();
      if (updates.label !== undefined) bed.label = sanitizeText(updates.label, 100);
      if (updates.bedType !== undefined) bed.bedType = updates.bedType;
      if (updates.pricing !== undefined) bed.pricing = { ...bed.pricing, ...updates.pricing };
      if (updates.availability !== undefined) bed.availability = updates.availability;
      if (updates.status !== undefined) bed.status = updates.status;

      bed.updatedAt = now;
      unit.updatedAt = now;
      property.updatedAt = now;
      this.persist();

      return {
        success: true,
        status: 200,
        data: bed
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'UPDATE_BED_ERROR',
        error: err.message || 'Failed to update bed.'
      };
    }
  }

  /**
   * Delete a bed from a unit.
   */
  public deleteBed(
    ctx: BackendRequestContext,
    propertyId: string,
    unitId: string,
    bedId: string
  ): PropertyApiResponse<null> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const unit = this.assertUnitBelongsToProperty(property, unitId);
      this.assertBedBelongsToUnit(unit, bedId);

      unit.beds = unit.beds.filter((b) => b.id !== bedId);

      const now = new Date().toISOString();
      unit.updatedAt = now;
      property.updatedAt = now;
      this.persist();

      return {
        success: true,
        status: 200,
        data: null
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'DELETE_BED_ERROR',
        error: err.message || 'Failed to delete bed.'
      };
    }
  }

  // --------------------------------------------------------------------------
  // Phase 8: Generic Rentable Entity Pricing & Availability Operations
  // --------------------------------------------------------------------------

  /**
   * Update property-level pricing and availability.
   */
  public updatePropertyPricing(
    ctx: BackendRequestContext,
    propertyId: string,
    pricing: PropertyPricing,
    availability?: PropertyAvailability
  ): PropertyApiResponse<Property> {
    try {
      this.assertAuthenticated(ctx);
      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const validation = validatePricingPayload(pricing, false);
      if (!validation.isValid) {
        const firstErrorKey = Object.keys(validation.errors)[0];
        return {
          success: false,
          status: 400,
          code: 'INVALID_PRICING',
          error: validation.errors[firstErrorKey] || 'Invalid pricing configuration.'
        };
      }

      const rent = Math.round(Number(pricing.monthlyRent || pricing.amount || 0));
      const deposit = calculateEffectiveDeposit(
        rent,
        pricing.securityDepositConfig,
        pricing.securityDeposit
      );

      const updatedPricing: PropertyPricing = {
        ...property.pricing,
        ...pricing,
        monthlyRent: rent,
        amount: rent,
        securityDeposit: deposit
      };

      property.pricing = updatedPricing;
      if (availability) {
        property.availability = availability;
      }

      const now = new Date().toISOString();
      property.updatedAt = now;
      property.completenessScore = this.computeCompletenessScore(property);
      this.persist();

      return {
        success: true,
        status: 200,
        data: property
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'UPDATE_PRICING_ERROR',
        error: err.message || 'Failed to update property pricing.'
      };
    }
  }

  /**
   * Update individual unit pricing and availability.
   */
  public updateUnitPricing(
    ctx: BackendRequestContext,
    propertyId: string,
    unitId: string,
    pricing: UnitPricing,
    availability?: string
  ): PropertyApiResponse<PropertyUnit> {
    try {
      this.assertAuthenticated(ctx);
      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const unit = this.assertUnitBelongsToProperty(property, unitId);

      const validation = validatePricingPayload(pricing, false);
      if (!validation.isValid) {
        const firstErrorKey = Object.keys(validation.errors)[0];
        return {
          success: false,
          status: 400,
          code: 'INVALID_PRICING',
          error: validation.errors[firstErrorKey] || 'Invalid pricing configuration.'
        };
      }

      const rent = Math.round(Number(pricing.monthlyRent || pricing.amount || 0));
      const deposit = calculateEffectiveDeposit(
        rent,
        pricing.securityDepositConfig,
        pricing.securityDeposit
      );

      unit.pricing = {
        ...unit.pricing,
        ...pricing,
        monthlyRent: rent,
        amount: rent,
        securityDeposit: deposit
      };

      if (availability) {
        unit.availability = availability as any;
        if (
          availability === 'available' ||
          availability === 'occupied' ||
          availability === 'unavailable' ||
          availability === 'fully_occupied' ||
          availability === 'partially_occupied'
        ) {
          unit.status = availability as any;
        }
      }

      const now = new Date().toISOString();
      unit.updatedAt = now;
      property.updatedAt = now;
      property.completenessScore = this.computeCompletenessScore(property);
      this.persist();

      return {
        success: true,
        status: 200,
        data: unit
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'UPDATE_UNIT_PRICING_ERROR',
        error: err.message || 'Failed to update unit pricing.'
      };
    }
  }

  /**
   * Update individual bed pricing and availability.
   */
  public updateBedPricing(
    ctx: BackendRequestContext,
    propertyId: string,
    unitId: string,
    bedId: string,
    pricing: BedPricing,
    availability?: string
  ): PropertyApiResponse<PropertyBed> {
    try {
      this.assertAuthenticated(ctx);
      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const unit = this.assertUnitBelongsToProperty(property, unitId);
      const bed = this.assertBedBelongsToUnit(unit, bedId);

      const validation = validatePricingPayload(pricing, false);
      if (!validation.isValid) {
        const firstErrorKey = Object.keys(validation.errors)[0];
        return {
          success: false,
          status: 400,
          code: 'INVALID_PRICING',
          error: validation.errors[firstErrorKey] || 'Invalid pricing configuration.'
        };
      }

      const rent = Math.round(Number(pricing.monthlyRent || pricing.amount || 0));
      const deposit = calculateEffectiveDeposit(
        rent,
        pricing.securityDepositConfig,
        pricing.securityDeposit
      );

      bed.pricing = {
        ...bed.pricing,
        ...pricing,
        monthlyRent: rent,
        amount: rent,
        securityDeposit: deposit
      };

      if (availability) {
        bed.availability = availability as any;
        if (
          availability === 'available' ||
          availability === 'occupied' ||
          availability === 'unavailable' ||
          availability === 'fully_occupied'
        ) {
          bed.status = availability as any;
        }
      }

      const now = new Date().toISOString();
      bed.updatedAt = now;
      unit.updatedAt = now;
      property.updatedAt = now;
      property.completenessScore = this.computeCompletenessScore(property);
      this.persist();

      return {
        success: true,
        status: 200,
        data: bed
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'UPDATE_BED_PRICING_ERROR',
        error: err.message || 'Failed to update bed pricing.'
      };
    }
  }

  /**
   * Atomically apply default pricing across all units/beds with optional granular overrides.
   */
  public updateBulkPricing(
    ctx: BackendRequestContext,
    propertyId: string,
    payload: BulkPricingPayload
  ): PropertyApiResponse<Property> {
    try {
      this.assertAuthenticated(ctx);
      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      // Relational checks for overrides
      if (payload.unitOverrides) {
        const unitIds = new Set((property.units || []).map((u) => u.id));
        for (const uId of Object.keys(payload.unitOverrides)) {
          if (!unitIds.has(uId)) {
            return {
              success: false,
              status: 404,
              code: 'RELATIONSHIP_MISMATCH',
              error: `Unit with ID '${uId}' does not belong to property '${property.id}'.`
            };
          }
        }
      }

      if (payload.bedOverrides) {
        const bedIds = new Set((property.units || []).flatMap((u) => (u.beds || []).map((b) => b.id)));
        for (const bId of Object.keys(payload.bedOverrides)) {
          if (!bedIds.has(bId)) {
            return {
              success: false,
              status: 404,
              code: 'RELATIONSHIP_MISMATCH',
              error: `Bed with ID '${bId}' does not belong to property '${property.id}'.`
            };
          }
        }
      }

      const defaultRent = Math.round(
        Number(payload.defaultPricing.monthlyRent || payload.defaultPricing.amount || 0)
      );
      const defaultDeposit = calculateEffectiveDeposit(
        defaultRent,
        payload.defaultPricing.securityDepositConfig,
        payload.defaultPricing.securityDeposit
      );

      const basePricing: GenericRentablePricing = {
        ...payload.defaultPricing,
        monthlyRent: defaultRent,
        amount: defaultRent,
        securityDeposit: defaultDeposit
      };

      // Set property-level summary pricing
      property.pricing = {
        ...property.pricing,
        ...basePricing
      };

      // Apply to all units and optional unit overrides
      if (property.units && property.units.length > 0) {
        property.units.forEach((unit) => {
          const override = payload.unitOverrides ? payload.unitOverrides[unit.id] : undefined;
          const unitRent =
            override?.monthlyRent !== undefined
              ? Math.round(Number(override.monthlyRent))
              : basePricing.monthlyRent;
          const unitDeposit =
            override?.securityDeposit !== undefined
              ? Math.round(Number(override.securityDeposit))
              : calculateEffectiveDeposit(
                  unitRent,
                  override?.securityDepositConfig || basePricing.securityDepositConfig,
                  basePricing.securityDeposit
                );

          unit.pricing = {
            ...unit.pricing,
            ...basePricing,
            ...(override || {}),
            monthlyRent: unitRent,
            amount: unitRent,
            securityDeposit: unitDeposit
          };

          if (override?.availability) {
            unit.availability = override.availability as any;
          } else if (payload.defaultAvailability) {
            unit.availability = payload.defaultAvailability as any;
          }

          // If individual bed rental, apply to all beds and optional bed overrides
          if (unit.beds && unit.beds.length > 0) {
            unit.beds.forEach((bed) => {
              const bedOverride = payload.bedOverrides ? payload.bedOverrides[bed.id] : undefined;
              const bedRent =
                bedOverride?.monthlyRent !== undefined
                  ? Math.round(Number(bedOverride.monthlyRent))
                  : unit.pricing.monthlyRent;
              const bedDeposit =
                bedOverride?.securityDeposit !== undefined
                  ? Math.round(Number(bedOverride.securityDeposit))
                  : calculateEffectiveDeposit(
                      bedRent,
                      bedOverride?.securityDepositConfig || unit.pricing.securityDepositConfig,
                      unit.pricing.securityDeposit
                    );

              bed.pricing = {
                ...bed.pricing,
                ...unit.pricing,
                ...(bedOverride || {}),
                monthlyRent: bedRent,
                amount: bedRent,
                securityDeposit: bedDeposit
              };

              if (bedOverride?.availability) {
                bed.availability = bedOverride.availability as any;
              } else if (payload.defaultAvailability) {
                bed.availability = payload.defaultAvailability as any;
              }
            });
          }
        });
      }

      if (payload.defaultAvailability && typeof payload.defaultAvailability === 'string') {
        const validPropAvails = [
          'immediate',
          'specific_date',
          'currently_unavailable',
          'temporarily_unavailable'
        ];
        if (validPropAvails.includes(payload.defaultAvailability)) {
          property.availability = {
            type: payload.defaultAvailability as any
          };
        }
      }

      const now = new Date().toISOString();
      property.updatedAt = now;
      property.completenessScore = this.computeCompletenessScore(property);
      this.persist();

      return {
        success: true,
        status: 200,
        data: property
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'UPDATE_BULK_PRICING_ERROR',
        error: err.message || 'Failed to update bulk pricing.'
      };
    }
  }

  // --------------------------------------------------------------------------
  // Lifecycle Management (Draft -> Published -> Unpublished -> Archived)
  // --------------------------------------------------------------------------

  /**
   * Publish a property.
   * Validates that mandatory requirements are met before publishing.
   */
  public publishProperty(
    ctx: BackendRequestContext,
    propertyId: string,
    options?: { strict?: boolean }
  ): PropertyApiResponse<Property> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.properties.get(propertyId);
      if (!property) {
        return {
          success: false,
          status: 404,
          code: 'PROPERTY_NOT_FOUND',
          error: `Property with ID '${propertyId}' not found.`
        };
      }

      this.assertOwnership(property, ctx);

      // Validate status transition
      if (property.status === 'archived') {
        return {
          success: false,
          status: 400,
          code: 'INVALID_STATUS_TRANSITION',
          error: 'Archived properties cannot be published directly. Please restore the listing first.'
        };
      }

      if (property.status === 'published') {
        return {
          success: false,
          status: 400,
          code: 'INVALID_STATUS_TRANSITION',
          error: 'Listing is already published.'
        };
      }

      // In strict mode (enforced in Phase 10 review), run full completeness evaluation
      if (options?.strict) {
        const evaluation = evaluateListingCompleteness(property);
        if (!evaluation.isPublishable) {
          const firstError = evaluation.missingRequired[0]?.message || 'Required listing information is missing.';
          return {
            success: false,
            status: 400,
            code: 'LISTING_INCOMPLETE',
            error: `Cannot publish listing: ${firstError}`,
            details: {
              missingRequired: evaluation.missingRequired
            }
          };
        }
      } else {
        // Baseline invariants check (preserves Phase 1 test compatibility)
        if (!property.title || property.title.length < 5) {
          return {
            success: false,
            status: 400,
            code: 'INVALID_TITLE',
            error: 'Property title must be at least 5 characters to publish.'
          };
        }

        const template = getPropertyTemplate(property.propertyType);
        if (template?.hasUnits && property.units.length === 0) {
          return {
            success: false,
            status: 400,
            code: 'MISSING_UNITS',
            error: `Properties of type '${template.label}' require at least one configured unit before publishing.`
          };
        }
      }

      const now = new Date().toISOString();
      property.status = 'published';
      property.publishedAt = now;
      property.completenessScore = evaluateListingCompleteness(property).score;
      property.updatedAt = now;
      this.persist();

      return {
        success: true,
        status: 200,
        data: property
      };

    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'PUBLISH_PROPERTY_ERROR',
        error: err.message || 'Failed to publish property.'
      };
    }
  }

  /**
   * Unpublish a property (takes it down from public view without deletion).
   */
  public unpublishProperty(ctx: BackendRequestContext, propertyId: string): PropertyApiResponse<Property> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.properties.get(propertyId);
      if (!property) {
        return {
          success: false,
          status: 404,
          code: 'PROPERTY_NOT_FOUND',
          error: `Property with ID '${propertyId}' not found.`
        };
      }

      this.assertOwnership(property, ctx);

      if (property.status !== 'published') {
        return {
          success: false,
          status: 400,
          code: 'INVALID_STATUS_TRANSITION',
          error: `Cannot unpublish listing with status '${property.status}'. Only active published listings can be unpublished.`
        };
      }

      const now = new Date().toISOString();
      property.status = 'unpublished';
      property.updatedAt = now;
      this.persist();

      return {
        success: true,
        status: 200,
        data: property
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'UNPUBLISH_PROPERTY_ERROR',
        error: err.message || 'Failed to unpublish property.'
      };
    }
  }

  /**
   * Soft-archive a property. Preserves history, units, beds, media, and configuration.
   */
  public archiveProperty(ctx: BackendRequestContext, propertyId: string): PropertyApiResponse<Property> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.properties.get(propertyId);
      if (!property) {
        return {
          success: false,
          status: 404,
          code: 'PROPERTY_NOT_FOUND',
          error: `Property with ID '${propertyId}' not found.`
        };
      }

      this.assertOwnership(property, ctx);

      if (property.status === 'archived') {
        return {
          success: false,
          status: 400,
          code: 'INVALID_STATUS_TRANSITION',
          error: 'Listing is already archived.'
        };
      }

      const now = new Date().toISOString();
      property.status = 'archived';
      property.updatedAt = now;
      this.persist();

      return {
        success: true,
        status: 200,
        data: property
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'ARCHIVE_PROPERTY_ERROR',
        error: err.message || 'Failed to archive property.'
      };
    }
  }

  /**
   * Restore an archived property back to active management (unpublished status).
   */
  public restoreProperty(ctx: BackendRequestContext, propertyId: string): PropertyApiResponse<Property> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.properties.get(propertyId);
      if (!property) {
        return {
          success: false,
          status: 404,
          code: 'PROPERTY_NOT_FOUND',
          error: `Property with ID '${propertyId}' not found.`
        };
      }

      this.assertOwnership(property, ctx);

      if (property.status !== 'archived') {
        return {
          success: false,
          status: 400,
          code: 'INVALID_STATUS_TRANSITION',
          error: `Cannot restore property with status '${property.status}'. Only archived properties can be restored.`
        };
      }

      const now = new Date().toISOString();
      property.status = 'unpublished';
      property.updatedAt = now;
      this.persist();

      return {
        success: true,
        status: 200,
        data: property
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'RESTORE_PROPERTY_ERROR',
        error: err.message || 'Failed to restore property.'
      };
    }
  }

  /**
   * Duplicate an existing property into a new draft listing.
   * Deep-clones property data with fresh IDs for property, units, and beds.
   */
  public duplicateProperty(
    ctx: BackendRequestContext,
    propertyId: string
  ): PropertyApiResponse<Property> {
    try {
      this.assertAuthenticated(ctx);

      const source = this.properties.get(propertyId);
      if (!source) {
        return {
          success: false,
          status: 404,
          code: 'PROPERTY_NOT_FOUND',
          error: `Property with ID '${propertyId}' not found.`
        };
      }

      this.assertOwnership(source, ctx);

      const now = new Date().toISOString();
      const newPropertyId = generateEntityId('prop');

      // Deep clone units and beds with brand new entity IDs
      const clonedUnits: PropertyUnit[] = (source.units || []).map((u) => {
        const newUnitId = generateEntityId('unit');
        const clonedBeds: PropertyBed[] = (u.beds || []).map((b) => ({
          ...b,
          id: generateEntityId('bed'),
          unitId: newUnitId
        }));

        return {
          ...u,
          id: newUnitId,
          propertyId: newPropertyId,
          beds: clonedBeds
        };
      });

      // Clone photos with new IDs if present
      const clonedPhotos: PropertyPhoto[] = (source.photos || []).map((p) => ({
        ...p,
        id: generateEntityId('photo')
      }));

      const clonedProperty: Property = {
        ...source,
        id: newPropertyId,
        ownerId: ctx.userId,
        title: source.title ? `Copy of ${source.title}` : `Copy of Property ${source.id}`,
        status: 'draft',
        publishedAt: undefined,
        units: clonedUnits,
        photos: clonedPhotos,
        createdAt: now,
        updatedAt: now
      };

      clonedProperty.completenessScore = this.computeCompletenessScore(clonedProperty);
      this.properties.set(newPropertyId, clonedProperty);
      this.persist();

      return {
        success: true,
        status: 201,
        data: clonedProperty,
        message: 'Property duplicated successfully as a new draft.'
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'DUPLICATE_PROPERTY_ERROR',
        error: err.message || 'Failed to duplicate property.'
      };
    }
  }


  // --------------------------------------------------------------------------
  // Phase 6: Amenity Management Operations
  // --------------------------------------------------------------------------

  /**
   * Update the property's selected amenities and custom amenities.
   */
  public updateAmenities(
    ctx: BackendRequestContext,
    propertyId: string,
    amenities: string[],
    customAmenities: string[] = []
  ): PropertyApiResponse<Property> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const now = new Date().toISOString();
      property.amenities = sanitizeStringArray(amenities, 100, 100);
      property.customAmenities = sanitizeStringArray(customAmenities, 50, 100);
      property.completenessScore = this.computeCompletenessScore(property);
      property.updatedAt = now;
      this.persist();

      return {
        success: true,
        status: 200,
        data: property
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'UPDATE_AMENITIES_ERROR',
        error: err.message || 'Failed to update amenities.'
      };
    }
  }

  /**
   * Add a single custom amenity to a property.
   */
  public addCustomAmenity(
    ctx: BackendRequestContext,
    propertyId: string,
    customName: string
  ): PropertyApiResponse<Property> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const sanitized = sanitizeText(customName, 100);
      if (!sanitized) {
        return {
          success: false,
          status: 400,
          code: 'INVALID_CUSTOM_AMENITY',
          error: 'Custom amenity name cannot be empty.'
        };
      }

      const existing = property.customAmenities ? [...property.customAmenities] : [];
      if (!existing.includes(sanitized)) {
        existing.push(sanitized);
        property.customAmenities = existing;
        property.completenessScore = this.computeCompletenessScore(property);
        property.updatedAt = new Date().toISOString();
        this.persist();
      }

      return {
        success: true,
        status: 200,
        data: property
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'ADD_CUSTOM_AMENITY_ERROR',
        error: err.message || 'Failed to add custom amenity.'
      };
    }
  }

  /**
   * Remove a single custom amenity from a property.
   */
  public removeCustomAmenity(
    ctx: BackendRequestContext,
    propertyId: string,
    customName: string
  ): PropertyApiResponse<Property> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const sanitized = sanitizeText(customName, 100);
      const existing = property.customAmenities ? [...property.customAmenities] : [];
      property.customAmenities = existing.filter((c) => c !== sanitized);
      property.completenessScore = this.computeCompletenessScore(property);
      property.updatedAt = new Date().toISOString();
      this.persist();

      return {
        success: true,
        status: 200,
        data: property
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'REMOVE_CUSTOM_AMENITY_ERROR',
        error: err.message || 'Failed to remove custom amenity.'
      };
    }
  }

  // --------------------------------------------------------------------------
  // Phase 9: Rules & Preferences Operations
  // --------------------------------------------------------------------------

  /**
   * Update rules and preferences for a property with validation & ownership security.
   */
  public updatePropertyRules(
    ctx: BackendRequestContext,
    propertyId: string,
    rules: Partial<PropertyRules>
  ): PropertyApiResponse<PropertyRules> {
    try {
      this.assertAuthenticated(ctx);

      const property = this.getOrEnsureProperty(propertyId, ctx);
      this.assertNotArchived(property);

      const validation = validatePropertyRules(rules);
      if (!validation.valid) {
        return {
          success: false,
          status: 400,
          code: 'INVALID_RULES_CONFIG',
          error: validation.errors.join(' ')
        };
      }

      const mergedRules: PropertyRules = {
        ...property.rules,
        ...rules
      };

      const sanitized = sanitizePropertyRules(mergedRules);
      property.rules = sanitized;
      property.completenessScore = this.computeCompletenessScore(property);
      property.updatedAt = new Date().toISOString();
      this.persist();

      return {
        success: true,
        status: 200,
        data: property.rules,
        message: 'Property rules updated successfully.'
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'UPDATE_RULES_ERROR',
        error: err.message || 'Failed to update property rules.'
      };
    }
  }

  // --------------------------------------------------------------------------
  // Public Catalog Operations (Unauthenticated / Public Tenant View)
  // --------------------------------------------------------------------------

  /**
   * Retrieve a single property for public viewing.
   * Only published listings are visible; drafts, unpublished, or archived listings
   * strictly return 404 NOT_FOUND.
   */
  public getPublicProperty(propertyId: string): PropertyApiResponse<Property> {
    try {
      const property = this.properties.get(propertyId);
      if (!property || property.status !== 'published') {
        return {
          success: false,
          status: 404,
          code: 'PROPERTY_NOT_FOUND',
          error: `Property with ID '${propertyId}' was not found or is not currently active.`
        };
      }

      // Clone and sanitize public view: redact exact address if owner chose hideExactAddress
      const publicCopy: Property = {
        ...property,
        location: property.location ? {
          ...property.location,
          addressLine1: property.location.hideExactAddress ? '' : property.location.addressLine1,
          addressLine2: property.location.hideExactAddress ? '' : property.location.addressLine2
        } : undefined
      };

      return {
        success: true,
        status: 200,
        data: publicCopy
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'GET_PUBLIC_PROPERTY_ERROR',
        error: err.message || 'Failed to retrieve public property.'
      };
    }
  }

  /**
   * Search and list published properties for tenant browsing.
   * Only published listings are returned.
   */
  public getPublicProperties(query?: {
    city?: string;
    propertyType?: string;
    limit?: number;
  }): PropertyApiResponse<PropertySummary[]> {
    try {
      const published = Array.from(this.properties.values()).filter((p) => p.status === 'published');

      let filtered = published;
      if (query?.city) {
        const queryCity = query.city.toLowerCase().trim();
        filtered = filtered.filter((p) => p.location?.city?.toLowerCase().includes(queryCity));
      }
      if (query?.propertyType) {
        filtered = filtered.filter((p) => p.propertyType === query.propertyType);
      }

      // Sort newest published first
      filtered.sort((a, b) => {
        const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return timeB - timeA;
      });

      if (query?.limit && query.limit > 0) {
        filtered = filtered.slice(0, query.limit);
      }

      const summaries = filtered.map(toPropertySummary);

      return {
        success: true,
        status: 200,
        data: summaries
      };
    } catch (err: any) {
      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'LIST_PUBLIC_PROPERTIES_ERROR',
        error: err.message || 'Failed to list public properties.'
      };
    }
  }
}

// Singleton export
export const propertyBackend = new PropertyBackendStore();
