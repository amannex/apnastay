// ============================================================================
// APNASTAY PROPERTY ENGINE — BACKEND VALIDATION & SANITIZATION MODULE
// Enforces XSS neutralization, field length clamping, regex validation,
// and relational integrity on all backend mutations.
// ============================================================================

import type {
  PropertyType,
  RentalStructure,
  PropertyAvailability,
  PropertyPricing,
  PropertyUnit
} from './types';
import { getPropertyTemplate, validateStructureForTemplate } from './templates';

/**
 * Neutralize dangerous HTML and script tags to prevent stored XSS attacks.
 * Strips script tags, iframe tags, event handlers, javascript: URIs, and raw HTML.
 */
export function sanitizeText(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') {
    return '';
  }

  // 1. Remove script, style, iframe, and object tags along with their contents
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');

  // 2. Strip all remaining HTML tags
  sanitized = sanitized.replace(/<[^>]+>/g, '');

  // 3. Neutralize dangerous pseudo-protocols
  sanitized = sanitized.replace(/javascript:/gi, '').replace(/vbscript:/gi, '').replace(/data:/gi, '');

  // 4. Decode common dangerous entities and normalize whitespace
  sanitized = sanitized.trim();

  // 5. Clamp to maxLength
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }

  return sanitized;
}

/**
 * Validate and sanitize an Indian postal code (6 digits, non-zero first digit).
 */
export function validateAndSanitizePincode(pincode: unknown): { isValid: boolean; value: string } {
  if (typeof pincode !== 'string' && typeof pincode !== 'number') {
    return { isValid: false, value: '' };
  }

  const cleaned = String(pincode).trim().replace(/\D/g, '');
  const isValid = /^[1-9][0-9]{5}$/.test(cleaned);

  return {
    isValid,
    value: cleaned
  };
}

/**
 * Validate availability date string format (YYYY-MM-DD).
 */
export function isValidIsoDateString(dateStr: unknown): boolean {
  if (typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && dateStr === date.toISOString().split('T')[0];
}

/**
 * Validate property title: must be between 5 and 150 characters once sanitized.
 */
export function validatePropertyTitle(title: unknown): { isValid: boolean; value: string; error?: string } {
  const sanitized = sanitizeText(title, 150);

  if (!sanitized || sanitized.length < 5) {
    return {
      isValid: false,
      value: sanitized,
      error: 'Property title must be at least 5 characters long.'
    };
  }

  return {
    isValid: true,
    value: sanitized
  };
}

/**
 * Validate property description: must be between 10 and 5000 characters if provided.
 */
export function validatePropertyDescription(description: unknown): { isValid: boolean; value: string; error?: string } {
  if (!description) {
    return { isValid: true, value: '' };
  }

  const sanitized = sanitizeText(description, 5000);

  if (sanitized.length > 0 && sanitized.length < 10) {
    return {
      isValid: false,
      value: sanitized,
      error: 'Property description must be at least 10 characters long if provided.'
    };
  }

  return {
    isValid: true,
    value: sanitized
  };
}

/**
 * Validate property type and rental structure against allowed matrix.
 */
export function validateTypeAndStructure(
  propertyType: unknown,
  rentalStructure: unknown
): { isValid: boolean; error?: string } {
  const validTypes: PropertyType[] = [
    'apartment',
    'independent_house',
    'builder_floor',
    'pg',
    'hostel',
    'co_living',
    'room',
    'bed_space',
    'other',
    'house',
    'villa',
    'coliving',
    'building',
    'independent_floor',
    'commercial'
  ];

  if (typeof propertyType !== 'string' || !validTypes.includes(propertyType as PropertyType)) {
    return {
      isValid: false,
      error: `Invalid property type '${propertyType}'. Must be a supported ApnaStay property type.`
    };
  }

  if (rentalStructure) {
    const validStructures: RentalStructure[] = [
      'entire_property',
      'individual_room',
      'shared_room',
      'individual_bed',
      'multiple_units',
      'individual_unit'
    ];

    if (!validStructures.includes(rentalStructure as RentalStructure)) {
      return {
        isValid: false,
        error: `Invalid rental structure '${rentalStructure}'.`
      };
    }

    if (!validateStructureForTemplate(propertyType as PropertyType, rentalStructure as RentalStructure)) {
      return {
        isValid: false,
        error: `Rental structure '${rentalStructure}' is not supported for property type '${propertyType}'.`
      };
    }
  }

  return { isValid: true };
}

/**
 * Sanitize an array of strings (e.g. amenities, custom rules) by stripping HTML and capping count.
 */
export function sanitizeStringArray(arr: unknown, maxCount: number = 50, itemMaxLength: number = 150): string[] {
  if (!Array.isArray(arr)) return [];

  const unique = new Set<string>();

  for (const item of arr) {
    if (unique.size >= maxCount) break;
    const clean = sanitizeText(item, itemMaxLength);
    if (clean.length > 0) {
      unique.add(clean);
    }
  }

  return Array.from(unique);
}

/**
 * Sanitize an image URL to ensure safe HTTP/HTTPS URL protocols only.
 */
export function sanitizeMediaUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Allow safe HTTP, HTTPS, or relative asset paths
  if (/^(https?:\/\/|\/)/i.test(trimmed)) {
    // Strip any quotes or script characters
    return trimmed.replace(/[<>"'`;]/g, '');
  }

  return '';
}

/**
 * Validate property location fields for Substep 4.
 * Returns human-friendly progressive error and structured sanitized values.
 */
export function validatePropertyLocation(location: unknown): {
  isValid: boolean;
  error?: string;
  field?: 'address' | 'locality' | 'city' | 'state' | 'pincode';
  value?: {
    address: string;
    addressLine1: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: { latitude: number; longitude: number };
    publicLocation: string;
    hideExactAddress: boolean;
  };
} {
  if (!location || typeof location !== 'object') {
    return {
      isValid: false,
      error: 'Please enter your property address details.',
      field: 'address'
    };
  }

  const loc = location as Record<string, any>;
  const addressRaw = loc.address || loc.addressLine1 || '';
  const addressClean = sanitizeText(addressRaw, 250);

  if (!addressClean || addressClean.length < 5) {
    return {
      isValid: false,
      error: 'Please enter a complete street address (House/Flat No, Street or Building name).',
      field: 'address'
    };
  }

  const localityClean = sanitizeText(loc.locality || '', 150);
  if (!localityClean || localityClean.length < 2) {
    return {
      isValid: false,
      error: 'Please enter your area, locality, or sector (e.g. Sector 62, Indiranagar).',
      field: 'locality'
    };
  }

  const cityClean = sanitizeText(loc.city || '', 100);
  if (!cityClean || cityClean.length < 2) {
    return {
      isValid: false,
      error: 'Please enter your city (e.g. Noida, Bengaluru, Delhi).',
      field: 'city'
    };
  }

  const stateClean = sanitizeText(loc.state || '', 100);
  if (!stateClean || stateClean.length < 2) {
    return {
      isValid: false,
      error: 'Please enter or select your state / union territory.',
      field: 'state'
    };
  }

  const pincodeResult = validateAndSanitizePincode(loc.pincode);
  if (!pincodeResult.isValid) {
    return {
      isValid: false,
      error: 'Please enter a valid 6-digit postal PIN code.',
      field: 'pincode'
    };
  }

  const lat = typeof loc.latitude === 'number' && !isNaN(loc.latitude) ? loc.latitude : loc.coordinates?.latitude;
  const lng = typeof loc.longitude === 'number' && !isNaN(loc.longitude) ? loc.longitude : loc.coordinates?.longitude;
  const coordinates = (typeof lat === 'number' && typeof lng === 'number') ? { latitude: lat, longitude: lng } : undefined;

  const publicLocation = loc.publicLocation 
    ? sanitizeText(loc.publicLocation, 150)
    : `${localityClean}, ${cityClean}`;

  return {
    isValid: true,
    value: {
      address: addressClean,
      addressLine1: addressClean,
      locality: localityClean,
      city: cityClean,
      state: stateClean,
      pincode: pincodeResult.value,
      coordinates,
      publicLocation,
      hideExactAddress: loc.hideExactAddress !== undefined ? Boolean(loc.hideExactAddress) : true
    }
  };
}

/**
 * Validate accommodation structure units for Substep 5.
 * Checks that at least 1 unit exists, each has a non-empty nameOrNumber, unitType, and valid capacity >= 1.
 */
export function validatePropertyStructureUnits(units: unknown): {
  isValid: boolean;
  error?: string;
  field?: 'units' | 'capacity' | 'nameOrNumber' | 'unitType';
  sanitizedUnits?: PropertyUnit[];
} {
  if (!Array.isArray(units) || units.length === 0) {
    return {
      isValid: false,
      error: 'Please add at least one room or unit to describe your accommodation structure.',
      field: 'units'
    };
  }

  const sanitized: PropertyUnit[] = [];

  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (!u || typeof u !== 'object') {
      return {
        isValid: false,
        error: `Unit #${i + 1} is invalid.`,
        field: 'units'
      };
    }

    const nameOrNumber = sanitizeText(u.nameOrNumber || '', 80);
    if (!nameOrNumber) {
      return {
        isValid: false,
        error: `Please specify a name or room number for unit #${i + 1}.`,
        field: 'nameOrNumber'
      };
    }

    const unitType = sanitizeText(u.unitType || '', 60);
    if (!unitType) {
      return {
        isValid: false,
        error: `Please select or enter an accommodation type for '${nameOrNumber}'.`,
        field: 'unitType'
      };
    }

    const capacity = Number(u.capacity);
    if (isNaN(capacity) || capacity < 1) {
      return {
        isValid: false,
        error: `Capacity for '${nameOrNumber}' must be at least 1 person.`,
        field: 'capacity'
      };
    }

    sanitized.push({
      ...u,
      id: u.id || `unit_${Date.now().toString(36)}_${i}`,
      propertyId: u.propertyId || '',
      nameOrNumber,
      unitType,
      capacity: Math.min(Math.floor(capacity), 50),
      occupancyModel: u.occupancyModel || (capacity === 1 ? 'private' : 'shared'),
      pricing: u.pricing || { monthlyRent: 0 },
      availability: u.availability || 'available',
      status: u.status || 'available',
      beds: Array.isArray(u.beds) ? u.beds : [],
      createdAt: u.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return {
    isValid: true,
    sanitizedUnits: sanitized
  };
}

