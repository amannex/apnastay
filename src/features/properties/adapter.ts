// ============================================================================
// APNASTAY PROPERTY ENGINE — PROPERTY DATA NORMALIZATION ADAPTER (PHASE 1)
// Decouples UI components from raw WordPress / Mock API responses and ensures safe,
// strongly typed view models without undefined/NaN leaks.
// ============================================================================

import { STATIC_PROPERTIES } from '@/data/staticProperties';
import { getPublicProperty, getPublicProperties } from './api';
import { formatCurrency } from './pricing';
import type { Property as RawProperty } from './types';

export interface NormalizedLocation {
  address?: string;
  locality?: string;
  city: string;
  state?: string;
  pincode?: string;
  displayLocation: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  hideExactAddress?: boolean;
}

export interface NormalizedPricing {
  monthlyRent: number;
  rentDisplay: string;
  securityDeposit?: number;
  depositDisplay?: string;
  maintenance?: number;
  maintenanceDisplay?: string;
  brokerage: number;
  brokerageDisplay: string;
  currency: string;
  billingPeriod: string;
  totalMoveIn?: number;
  totalMoveInDisplay?: string;
}

export interface NormalizedAvailability {
  status: string;
  availableFrom?: string;
  displayStatus: string;
  isImmediate: boolean;
}

export interface NormalizedSpecs {
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  furnishing?: string;
  floor?: string | number;
  totalFloors?: string | number;
  parking?: string;
  roomType?: string;
  sharingType?: string;
  genderPreference?: string;
  foodPolicy?: string;
  curfewOrTiming?: string;
  plotArea?: string;
  occupancyCapacity?: number | string;
}

export interface NormalizedAmenity {
  name: string;
  icon?: string;
  category?: string;
  verified?: boolean;
}

export interface NormalizedRule {
  label: string;
  value: string;
  allowed?: boolean;
}

export interface NormalizedOwner {
  name: string;
  role?: string;
  avatar?: string;
  verified?: boolean;
  responseTime?: string;
  memberSince?: string;
}

export interface NormalizedVerification {
  isVerified: boolean;
  verifiedBadges: string[];
  lastVerified?: string;
}

export interface NormalizedNearbyPlace {
  name: string;
  distance: string;
}

export interface NormalizedProperty {
  id: string;
  slug: string;
  title: string;
  propertyType: string;
  propertyTypeLabel: string;
  rentalStructure?: string;
  status: string;
  isAvailable: boolean;

  location: NormalizedLocation;
  pricing: NormalizedPricing;
  availability: NormalizedAvailability;
  images: string[];
  coverImage: string;
  description: string;
  specs: NormalizedSpecs;
  amenities: NormalizedAmenity[];
  rules: NormalizedRule[];
  owner: NormalizedOwner;
  verification: NormalizedVerification;
  nearbyPlaces: NormalizedNearbyPlace[];
  highlights: string[];
}

/**
 * Converts any string into a clean, URL-safe slug.
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/-{2,}/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Human-readable label for property types.
 */
export function getPropertyTypeLabel(type?: string): string {
  if (!type) return 'Residence';
  const clean = type.toLowerCase().replace(/[-_]/g, ' ');
  switch (clean) {
    case 'apartment':
      return 'Apartment';
    case 'independent house':
    case 'house':
      return 'Independent House';
    case 'builder floor':
    case 'independent floor':
      return 'Builder Floor';
    case 'pg':
      return 'PG / Co-Living';
    case 'hostel':
      return 'Hostel';
    case 'co living':
    case 'coliving':
      return 'Co-Living Suite';
    case 'room':
      return 'Private Room';
    case 'bed space':
      return 'Shared Bedspace';
    case 'villa':
      return 'Villa';
    default:
      return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
}

const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

/**
 * Normalizes any raw property format (WordPress REST API, static seed, or in-memory backend)
 * into a single unified, safe NormalizedProperty view model.
 */
export function normalizeProperty(raw: any): NormalizedProperty {
  if (!raw) {
    throw new Error('Cannot normalize null or undefined property data.');
  }

  const id = String(raw.id || raw.numericId || 'unknown');
  const title = (raw.title && typeof raw.title === 'string')
    ? raw.title.trim()
    : 'ApnaStay Verified Residence';

  const rawSlug = raw.slug || slugify(title) || id;
  const slug = rawSlug.toLowerCase();

  // Location resolution
  const city = raw.location?.city || raw.city || 'Indore';
  const locality = raw.location?.locality || raw.location?.addressLine1 || raw.neighborhood || '';
  const state = raw.location?.state || raw.state || '';
  const pincode = raw.location?.pincode || raw.pincode || '';
  const address = raw.location?.hideExactAddress ? undefined : (raw.location?.address || raw.location?.addressLine1 || undefined);
  const displayLocation = locality ? (locality.includes(city) ? locality : `${locality}, ${city}`) : city;
  const latitude = raw.location?.coordinates?.latitude || raw.location?.latitude || raw.latitude || undefined;
  const longitude = raw.location?.coordinates?.longitude || raw.location?.longitude || raw.longitude || undefined;
  const landmark = raw.location?.landmark || raw.landmark || undefined;
  const hideExactAddress = Boolean(raw.location?.hideExactAddress);

  // Pricing resolution
  const rentVal = Number(
    raw.pricing?.monthlyRent ?? raw.costBreakdown?.monthlyRent ?? raw.price ?? raw.rent ?? 0
  );
  const safeRent = isNaN(rentVal) ? 0 : Math.max(0, rentVal);

  const depositVal = raw.pricing?.securityDeposit ?? raw.costBreakdown?.securityDeposit;
  const safeDeposit = depositVal !== undefined && !isNaN(Number(depositVal)) ? Number(depositVal) : (safeRent > 0 ? safeRent * 2 : undefined);

  const maintenanceVal = raw.pricing?.maintenance ?? raw.costBreakdown?.maintenance;
  const safeMaintenance = maintenanceVal !== undefined && !isNaN(Number(maintenanceVal)) ? Number(maintenanceVal) : undefined;

  const totalMoveInVal = raw.costBreakdown?.totalMoveIn;
  const safeTotalMoveIn = totalMoveInVal !== undefined && !isNaN(Number(totalMoveInVal))
    ? Number(totalMoveInVal)
    : (safeDeposit !== undefined ? safeRent + safeDeposit : undefined);

  // Availability resolution
  const availStatus = raw.availability?.type || (raw.isAvailable === false ? 'occupied' : 'immediate');
  const availableFrom = raw.availability?.availableFrom || raw.availableFrom;
  const isImmediate = availStatus === 'immediate';
  let displayStatus = 'Available Immediately';
  if (!isImmediate && availableFrom) {
    displayStatus = `Available from ${availableFrom}`;
  } else if (availStatus === 'occupied' || availStatus === 'unavailable') {
    displayStatus = 'Currently Occupied';
  }

  // Photos & Images resolution
  let images: string[] = [];
  if (Array.isArray(raw.photos) && raw.photos.length > 0) {
    images = raw.photos
      .map((p: any) => (typeof p === 'string' ? p : p.url))
      .filter((url: any): url is string => typeof url === 'string' && url.length > 0);
  } else if (Array.isArray(raw.images) && raw.images.length > 0) {
    images = raw.images.filter((url: any): url is string => typeof url === 'string' && url.length > 0);
  } else if (typeof raw.image === 'string' && raw.image.length > 0) {
    images = [raw.image];
  } else if (typeof raw.coverPhotoUrl === 'string' && raw.coverPhotoUrl.length > 0) {
    images = [raw.coverPhotoUrl];
  }

  if (images.length === 0) {
    images = [DEFAULT_COVER_IMAGE];
  }
  const coverImage = images[0];

  // Description
  const description = (typeof raw.description === 'string' && raw.description.trim())
    ? raw.description.trim()
    : 'Fully verified zero-brokerage residence carefully audited by ApnaStay field engineers.';

  // Specs resolution
  const rawType = (raw.propertyType || raw.type || '').toLowerCase();
  const isPgOrHostel =
    rawType === 'pg' ||
    rawType === 'hostel' ||
    rawType === 'co_living' ||
    rawType === 'coliving' ||
    rawType === 'bed_space';

  const firstUnit = Array.isArray(raw.units) && raw.units.length > 0 ? raw.units[0] : null;
  const bedrooms = raw.specs?.bedrooms ?? (firstUnit?.unitType?.match(/(\d+)\s*BHK/i) ? parseInt(firstUnit.unitType) : raw.bedrooms);
  const bathrooms = raw.specs?.bathrooms ?? raw.bathrooms;
  const sqft = raw.specs?.sqft ?? raw.sqft ?? firstUnit?.carpetAreaSqft;
  const furnishing = raw.specs?.furnishing ?? firstUnit?.furnishing?.replace(/_/g, ' ') ?? raw.furnishing;
  const floor = raw.specs?.floor ?? firstUnit?.floor ?? raw.floor;
  const totalFloors = raw.specs?.totalFloors ?? raw.totalFloors;
  const parking = raw.specs?.parking ?? raw.parking;
  const roomType = raw.roomType ?? raw.type ?? (firstUnit?.unitType || 'Apartment');

  const sharingType =
    raw.specs?.sharingType ||
    (firstUnit?.occupancyModel ? firstUnit.occupancyModel.replace(/_/g, ' ') : undefined) ||
    (firstUnit?.capacity ? `${firstUnit.capacity} Sharing` : undefined);

  const genderPreference = raw.rules?.genderPreference
    ? raw.rules.genderPreference === 'male_only'
      ? 'Male Only'
      : raw.rules.genderPreference === 'female_only'
      ? 'Female Only'
      : 'Co-Ed / Any'
    : raw.specs?.genderPreference;

  const foodPolicy = raw.rules?.foodPolicy
    ? raw.rules.foodPolicy.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : raw.pricing?.foodIncluded
    ? 'Meals Included'
    : raw.specs?.foodPolicy;

  const curfewOrTiming = raw.rules?.timingType
    ? raw.rules.timingType === 'open_24_7'
      ? 'Open 24/7'
      : raw.rules.timingType === 'gate_closing'
      ? `Gate closes at ${raw.rules.gateClosingTime || '10:30 PM'}`
      : raw.rules.timingType === 'curfew'
      ? 'Curfew Applicable'
      : 'Flexible Timings'
    : raw.specs?.curfewOrTiming;

  const plotArea = raw.specs?.plotArea || raw.plotArea;
  const occupancyCapacity = firstUnit?.capacity || raw.specs?.occupancyCapacity || raw.specs?.capacity;

  // Amenities resolution
  const rawAmenities = raw.amenities || [];
  const amenities: NormalizedAmenity[] = rawAmenities.map((a: any) => {
    if (typeof a === 'string') {
      return {
        name: a.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        icon: 'ShieldCheck',
        verified: true
      };
    }
    return {
      name: a.name || 'Verified Amenity',
      icon: a.icon || a.iconName || 'ShieldCheck',
      category: a.category,
      verified: a.verified !== false
    };
  });

  // Rules resolution
  const rulesList: NormalizedRule[] = [];
  if (raw.rules) {
    const r = raw.rules;
    if (r.suitableFor && Array.isArray(r.suitableFor) && r.suitableFor.length > 0) {
      rulesList.push({
        label: 'Suitable For',
        value: r.suitableFor.map((s: string) => s.replace(/_/g, ' ')).join(', '),
        allowed: true
      });
    }
    if (r.genderPreference && r.genderPreference !== 'any') {
      rulesList.push({
        label: 'Gender Preference',
        value: r.genderPreference.replace(/_/g, ' ').toUpperCase(),
        allowed: true
      });
    }
    if (r.petPolicy) {
      rulesList.push({
        label: 'Pet Policy',
        value: r.petPolicy === 'allowed' ? 'Pets Allowed' : r.petPolicy === 'with_restrictions' ? 'Pets with Restrictions' : 'No Pets',
        allowed: r.petPolicy === 'allowed'
      });
    }
    if (r.smokingPolicy) {
      rulesList.push({
        label: 'Smoking',
        value: r.smokingPolicy === 'allowed' ? 'Smoking Allowed' : 'Non-Smoking',
        allowed: r.smokingPolicy === 'allowed'
      });
    }
    if (r.visitorsRule || r.visitorsAllowed !== undefined) {
      const allowed = r.visitorsRule === 'allowed' || r.visitorsAllowed === true;
      rulesList.push({
        label: 'Visitors',
        value: allowed ? 'Visitors Allowed' : 'Visitors Restricted',
        allowed
      });
    }
    if (r.noticePeriodDays || r.noticePeriodRule) {
      const days = r.noticePeriodDays || r.noticePeriodRule;
      rulesList.push({
        label: 'Notice Period',
        value: `${days} Days`,
        allowed: true
      });
    }
  }

  // Owner resolution
  const owner: NormalizedOwner = {
    name: raw.owner?.name || 'Verified Property Partner',
    role: raw.owner?.role || 'Property Owner',
    avatar: raw.owner?.avatar || undefined,
    verified: raw.owner?.verified !== false,
    responseTime: raw.owner?.responseTime || 'Within 2 hours',
    memberSince: raw.owner?.memberSince || '2026'
  };

  // Verification
  const verification: NormalizedVerification = {
    isVerified: Boolean(raw.verified ?? true),
    verifiedBadges: ['Zero Brokerage', 'Identity Verified', 'Physically Audited'],
    lastVerified: raw.auditTimeline?.[0]?.date || 'September 2026'
  };

  // Nearby places
  const nearbyPlaces: NormalizedNearbyPlace[] = Array.isArray(raw.nearby)
    ? raw.nearby.map((n: any) => ({ name: n.name, distance: n.distance }))
    : [];

  // Highlights
  const highlights: string[] = [];
  if (safeRent > 0) highlights.push('Zero Brokerage direct lease');
  if (furnishing) highlights.push(`Furnishing: ${furnishing}`);
  if (amenities.some((a) => a.name.toLowerCase().includes('wi-fi') || a.name.toLowerCase().includes('wifi'))) {
    highlights.push('High-speed Wi-Fi connectivity');
  }
  if (displayStatus.includes('Immediately')) {
    highlights.push('Ready to move in immediately');
  }
  if (verification.isVerified) {
    highlights.push('100% verified ownership & documentation');
  }

  return {
    id,
    slug,
    title,
    propertyType: raw.propertyType || raw.type || 'apartment',
    propertyTypeLabel: getPropertyTypeLabel(raw.propertyType || raw.type),
    rentalStructure: raw.rentalStructure,
    status: raw.status || 'published',
    isAvailable: availStatus !== 'occupied' && availStatus !== 'unavailable',

    location: {
      address,
      locality,
      city,
      state,
      pincode,
      displayLocation,
      latitude,
      longitude,
      landmark,
      hideExactAddress
    },

    pricing: {
      monthlyRent: safeRent,
      rentDisplay: formatCurrency(safeRent),
      securityDeposit: safeDeposit,
      depositDisplay: safeDeposit !== undefined ? formatCurrency(safeDeposit) : undefined,
      maintenance: safeMaintenance,
      maintenanceDisplay: safeMaintenance !== undefined ? formatCurrency(safeMaintenance) : undefined,
      brokerage: 0,
      brokerageDisplay: '₹0 Brokerage',
      currency: '₹',
      billingPeriod: 'month',
      totalMoveIn: safeTotalMoveIn,
      totalMoveInDisplay: safeTotalMoveIn !== undefined ? formatCurrency(safeTotalMoveIn) : undefined
    },

    availability: {
      status: availStatus,
      availableFrom,
      displayStatus,
      isImmediate
    },

    images,
    coverImage,
    description,

    specs: {
      bedrooms: isPgOrHostel ? undefined : (bedrooms ? Number(bedrooms) : undefined),
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      sqft: sqft ? Number(sqft) : undefined,
      furnishing: typeof furnishing === 'string' ? furnishing : undefined,
      floor,
      totalFloors,
      parking: typeof parking === 'string' ? parking : undefined,
      roomType: typeof roomType === 'string' ? roomType : undefined,
      sharingType: typeof sharingType === 'string' ? sharingType : undefined,
      genderPreference: typeof genderPreference === 'string' ? genderPreference : undefined,
      foodPolicy: typeof foodPolicy === 'string' ? foodPolicy : undefined,
      curfewOrTiming: typeof curfewOrTiming === 'string' ? curfewOrTiming : undefined,
      plotArea: typeof plotArea === 'string' || typeof plotArea === 'number' ? String(plotArea) : undefined,
      occupancyCapacity: occupancyCapacity ? String(occupancyCapacity) : undefined
    },

    amenities,
    rules: rulesList,
    owner,
    verification,
    nearbyPlaces,
    highlights
  };
}

/**
 * Resolves a property from static records or API by either ID or slug.
 */
export async function resolveProperty(slugOrId: string, city?: string): Promise<NormalizedProperty | null> {
  if (!slugOrId) return null;

  const target = slugOrId.toLowerCase().trim();
  const targetCity = city?.toLowerCase().trim();

  // 1. Check STATIC_PROPERTIES by ID or generated slug
  const staticFound = STATIC_PROPERTIES.find((p) => {
    const idMatch = p.id.toLowerCase() === target;
    const slugMatch = slugify(p.title || '').toLowerCase() === target;
    const directSlug = (p as any).slug?.toLowerCase() === target;

    const matchesIdOrSlug = idMatch || slugMatch || directSlug;
    if (!matchesIdOrSlug) return false;

    if (targetCity && p.city) {
      return p.city.toLowerCase() === targetCity;
    }
    return true;
  });

  if (staticFound) {
    return normalizeProperty(staticFound);
  }

  // 2. Query Public Property API (WordPress or in-memory backend simulation)
  try {
    const rawId = target.replace(/^prop-/, '');
    const res = await getPublicProperty(target);
    const data = res.success && res.data ? res.data : (await getPublicProperty(rawId)).data;

    if (data) {
      const normalized = normalizeProperty(data);
      if (targetCity && normalized.location.city.toLowerCase() !== targetCity) {
        // Not matching city filter
        return null;
      }
      return normalized;
    }
  } catch (err) {
    console.warn(`[resolveProperty] Failed to resolve property for '${slugOrId}':`, err);
  }

  // 3. Fallback: Search in list of public properties
  try {
    const listRes = await getPublicProperties({ city: targetCity });
    if (listRes.success && Array.isArray(listRes.data)) {
      const matchedSummary = listRes.data.find((p) => {
        const idMatch = String(p.id).toLowerCase() === target || `prop-${p.id}`.toLowerCase() === target;
        const slugMatch = slugify(p.title).toLowerCase() === target;
        return idMatch || slugMatch;
      });

      if (matchedSummary) {
        const fullRes = await getPublicProperty(String(matchedSummary.id));
        if (fullRes.success && fullRes.data) {
          return normalizeProperty(fullRes.data);
        }
      }
    }
  } catch (err) {
    // Ignore fallback search error
  }

  return null;
}

/**
 * Returns static slugs for Static Site Generation (SSG) in Next.js.
 */
export async function getAllPropertyStaticParams(): Promise<Array<{ city: string; slug: string; id: string }>> {
  return STATIC_PROPERTIES.map((p) => {
    const city = slugify(p.city || 'indore');
    const slug = slugify(p.title || p.id);
    return {
      city,
      slug,
      id: p.id
    };
  });
}
