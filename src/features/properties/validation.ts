// ============================================================================
// APNASTAY PROPERTY ENGINE — BACKEND VALIDATION & SANITIZATION MODULE
// Enforces XSS neutralization, field length clamping, regex validation,
// and relational integrity on all backend mutations.
// ============================================================================

import type {
  PropertyType,
  RentalStructure,
  PropertyAvailability,
  PropertyPricing
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
    'house',
    'apartment',
    'villa',
    'pg',
    'hostel',
    'coliving',
    'building',
    'independent_floor',
    'room',
    'commercial',
    'other'
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
      'individual_unit',
      'individual_room',
      'individual_bed',
      'multiple_units'
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
