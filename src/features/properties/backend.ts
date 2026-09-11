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
  BackendRequestContext,
  PropertyApiResponse
} from './types';
import { getPropertyTemplate, validateStructureForTemplate } from './templates';

export type { BackendRequestContext };

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

  // --------------------------------------------------------------------------
  // Authorization Guards
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

      const template = getPropertyTemplate(payload.propertyType);
      const rentalStructure = payload.rentalStructure || template.defaultRentalStructure;

      // Validate rental structure against template configuration
      if (!validateStructureForTemplate(payload.propertyType, rentalStructure)) {
        return {
          success: false,
          status: 400,
          code: 'INVALID_RENTAL_STRUCTURE',
          error: `Rental structure '${rentalStructure}' is not supported for property type '${payload.propertyType}'.`
        };
      }

      const now = new Date().toISOString();
      const id = generateEntityId('prop');

      const property: Property = {
        id,
        ownerId: ctx.userId,
        propertyType: payload.propertyType,
        customPropertyType: payload.propertyType === 'other' ? payload.customPropertyType : undefined,
        rentalStructure,
        title: payload.title?.trim() || `New ${template.label} Draft`,
        description: payload.description?.trim() || '',
        status: 'draft',
        location: payload.location ? {
          addressLine1: payload.location.addressLine1 || '',
          locality: payload.location.locality,
          addressLine2: payload.location.addressLine2,
          city: payload.location.city || '',
          state: payload.location.state,
          pincode: payload.location.pincode || '',
          latitude: payload.location.latitude,
          longitude: payload.location.longitude,
          landmark: payload.location.landmark,
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
        completenessScore: 15, // Starting draft completeness
        units: [],
        createdAt: now,
        updatedAt: now
      };

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
   */
  public getOwnerProperties(
    ctx: BackendRequestContext,
    filterStatus?: PropertyStatus
  ): PropertyApiResponse<Property[]> {
    try {
      this.assertAuthenticated(ctx);

      const list = Array.from(this.properties.values()).filter((p) => {
        const belongsToOwner = Number(p.ownerId) === Number(ctx.userId);
        if (!belongsToOwner) return false;
        if (filterStatus && p.status !== filterStatus) return false;
        return true;
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

      // Validate structure compatibility if propertyType or rentalStructure is updated
      const newType = payload.propertyType || property.propertyType;
      const newStructure = payload.rentalStructure || property.rentalStructure;
      if (!validateStructureForTemplate(newType, newStructure)) {
        return {
          success: false,
          status: 400,
          code: 'INVALID_RENTAL_STRUCTURE',
          error: `Rental structure '${newStructure}' is not supported for property type '${newType}'.`
        };
      }

      const now = new Date().toISOString();

      if (payload.title !== undefined) property.title = payload.title.trim();
      if (payload.description !== undefined) property.description = payload.description.trim();
      if (payload.propertyType !== undefined) property.propertyType = payload.propertyType;
      if (payload.customPropertyType !== undefined) property.customPropertyType = payload.customPropertyType;
      if (payload.rentalStructure !== undefined) property.rentalStructure = payload.rentalStructure;

      if (payload.location !== undefined) {
        property.location = {
          addressLine1: payload.location.addressLine1 ?? property.location?.addressLine1 ?? '',
          locality: payload.location.locality ?? property.location?.locality,
          addressLine2: payload.location.addressLine2 ?? property.location?.addressLine2,
          city: payload.location.city ?? property.location?.city ?? '',
          state: payload.location.state ?? property.location?.state,
          pincode: payload.location.pincode ?? property.location?.pincode ?? '',
          latitude: payload.location.latitude ?? property.location?.latitude,
          longitude: payload.location.longitude ?? property.location?.longitude,
          landmark: payload.location.landmark ?? property.location?.landmark,
          hideExactAddress: payload.location.hideExactAddress ?? property.location?.hideExactAddress
        };
      }

      if (payload.availability !== undefined) {
        property.availability = {
          type: payload.availability.type,
          availableFrom: payload.availability.type === 'specific_date' ? payload.availability.availableFrom : undefined
        };
      }

      if (payload.pricing !== undefined) {
        property.pricing = {
          monthlyRent: payload.pricing.monthlyRent ?? property.pricing?.monthlyRent ?? 0,
          securityDeposit: payload.pricing.securityDeposit ?? property.pricing?.securityDeposit,
          maintenance: payload.pricing.maintenance ?? property.pricing?.maintenance,
          lockInMonths: payload.pricing.lockInMonths ?? property.pricing?.lockInMonths,
          noticePeriodDays: payload.pricing.noticePeriodDays ?? property.pricing?.noticePeriodDays,
          foodIncluded: payload.pricing.foodIncluded ?? property.pricing?.foodIncluded,
          foodChargesMonthly: payload.pricing.foodChargesMonthly ?? property.pricing?.foodChargesMonthly
        };
      }

      if (payload.amenities !== undefined) {
        property.amenities = payload.amenities;
      }

      if (payload.rules !== undefined) {
        property.rules = {
          ...property.rules,
          ...payload.rules
        };
      }

      if (payload.photos !== undefined) {
        const normalized = payload.photos.map((p, idx) => ({
          ...p,
          order: typeof p.order === 'number' ? p.order : idx
        }));
        const hasCover = normalized.some((p) => p.isCover);
        if (!hasCover && normalized.length > 0) {
          normalized[0].isCover = true;
        }
        property.photos = normalized;
      }

      if (payload.status !== undefined) {
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
    } else if (property.title && property.title.length >= 3) {
      score += 2;
    }
    if (property.description && property.description.length >= 10) score += 5;
    if (property.pricing && property.pricing.monthlyRent > 0) score += 5;
    if (property.availability) score += 5;
    if (property.location?.city && property.location?.addressLine1 && property.location?.pincode) {
      score += 15;
    } else if (property.location?.city) {
      score += 8;
    }
    if (property.photos && property.photos.length > 0) score += 20;
    if (property.amenities && property.amenities.length > 0) score += 10;
    if (property.units && property.units.length > 0) score += 23;
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
        fileName: payload.fileName,
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

      const existingPhotos = property.photos ? [...property.photos] : [];
      const photoMap = new Map<string, PropertyPhoto>();
      existingPhotos.forEach((p) => photoMap.set(String(p.id), { ...p }));

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
        nameOrNumber: payload.nameOrNumber.trim(),
        unitType: payload.unitType,
        description: payload.description?.trim(),
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

      if (!payload.count || payload.count < 1 || payload.count > 100) {
        return {
          success: false,
          status: 400,
          code: 'INVALID_UNIT_COUNT',
          error: 'Bulk creation count must be between 1 and 100.'
        };
      }

      const now = new Date().toISOString();
      const prefix = payload.prefix || 'Room';
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

      const sourceUnit = property.units.find((u) => u.id === unitId);
      if (!sourceUnit) {
        return {
          success: false,
          status: 404,
          code: 'UNIT_NOT_FOUND',
          error: `Unit with ID '${unitId}' not found in property.`
        };
      }

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
        nameOrNumber: newNameOrNumber || `${sourceUnit.nameOrNumber} (Copy)`,
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

      const unit = property.units.find((u) => u.id === unitId);
      if (!unit) {
        return {
          success: false,
          status: 404,
          code: 'UNIT_NOT_FOUND',
          error: `Unit with ID '${unitId}' not found in property.`
        };
      }

      const now = new Date().toISOString();
      if (updates.nameOrNumber !== undefined) unit.nameOrNumber = updates.nameOrNumber.trim();
      if (updates.unitType !== undefined) unit.unitType = updates.unitType;
      if (updates.description !== undefined) unit.description = updates.description?.trim();
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

      const initialLength = property.units.length;
      property.units = property.units.filter((u) => u.id !== unitId);

      if (property.units.length === initialLength) {
        return {
          success: false,
          status: 404,
          code: 'UNIT_NOT_FOUND',
          error: `Unit with ID '${unitId}' not found in property.`
        };
      }

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

      const unit = property.units.find((u) => u.id === unitId);
      if (!unit) {
        return {
          success: false,
          status: 404,
          code: 'UNIT_NOT_FOUND',
          error: `Unit with ID '${unitId}' not found in property.`
        };
      }

      const now = new Date().toISOString();
      const bedId = generateEntityId('bed');
      const bed: PropertyBed = {
        id: bedId,
        unitId,
        label: payload.label.trim(),
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

      const unit = property.units.find((u) => u.id === unitId);
      if (!unit) {
        return {
          success: false,
          status: 404,
          code: 'UNIT_NOT_FOUND',
          error: `Unit with ID '${unitId}' not found in property.`
        };
      }

      const bed = unit.beds.find((b) => b.id === bedId);
      if (!bed) {
        return {
          success: false,
          status: 404,
          code: 'BED_NOT_FOUND',
          error: `Bed with ID '${bedId}' not found in unit.`
        };
      }

      const now = new Date().toISOString();
      if (updates.label !== undefined) bed.label = updates.label.trim();
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

      const unit = property.units.find((u) => u.id === unitId);
      if (!unit) {
        return {
          success: false,
          status: 404,
          code: 'UNIT_NOT_FOUND',
          error: `Unit with ID '${unitId}' not found in property.`
        };
      }

      const initialLength = unit.beds.length;
      unit.beds = unit.beds.filter((b) => b.id !== bedId);

      if (unit.beds.length === initialLength) {
        return {
          success: false,
          status: 404,
          code: 'BED_NOT_FOUND',
          error: `Bed with ID '${bedId}' not found in unit.`
        };
      }

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
  // Lifecycle Management (Draft -> Published -> Unpublished -> Archived)
  // --------------------------------------------------------------------------

  /**
   * Publish a property.
   * Validates that mandatory requirements are met before publishing.
   */
  public publishProperty(ctx: BackendRequestContext, propertyId: string): PropertyApiResponse<Property> {
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

      // Invariants check
      if (!property.title || property.title.length < 5) {
        return {
          success: false,
          status: 400,
          code: 'INVALID_TITLE',
          error: 'Property title must be at least 5 characters to publish.'
        };
      }

      const template = getPropertyTemplate(property.propertyType);
      if (template.hasUnits && property.units.length === 0) {
        return {
          success: false,
          status: 400,
          code: 'MISSING_UNITS',
          error: `Properties of type '${template.label}' require at least one configured unit before publishing.`
        };
      }

      const now = new Date().toISOString();
      property.status = 'published';
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
   * Soft-archive a property. Preserves history, units, and visits.
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
}

// Singleton export
export const propertyBackend = new PropertyBackendStore();
