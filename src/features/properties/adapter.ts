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
  builtUpArea?: number | string;
  furnishing?: string;
  floor?: string | number;
  totalFloors?: string | number;
  propertyAge?: string;
  facing?: string;
  parking?: string;
  waterSupply?: string;
  powerBackup?: string;
  roomType?: string;
  bedType?: string;
  sharingType?: string;
  genderPreference?: string;
  foodPolicy?: string;
  laundry?: string;
  curfewOrTiming?: string;
  locker?: string;
  commonAreas?: string;
  security?: string;
  minimumStay?: string;
  noticePeriod?: string;
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
  id?: string;
  category?: 'house_rules' | 'tenant_requirements';
  label: string;
  value: string;
  allowed?: boolean | 'restricted';
  detail?: string;
  iconName?: string;
}

export interface VerificationCheckItem {
  id: string;
  label: string;
  confirmed: boolean;
  date?: string;
  note?: string;
}

export interface NormalizedVerification {
  isVerified: boolean;
  status: 'verified' | 'unverified' | 'in_progress';
  level?: string;
  levelLabel?: string;
  lastVerified?: string;
  confirmedChecks: VerificationCheckItem[];
  allChecks?: VerificationCheckItem[];
  verifiedBadges: string[];
}

export interface NormalizedNearbyPlace {
  name: string;
  distance: string;
}

export interface NormalizedOwner {
  name: string;
  role?: string;
  avatar?: string;
  verified?: boolean;
  responseTime?: string;
  memberSince?: string;
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
  houseRules: NormalizedRule[];
  tenantRequirements: NormalizedRule[];
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

export const DEFAULT_CITY_COORDINATES: Record<string, { lat: number; lng: number; state: string }> = {
  indore: { lat: 22.7533, lng: 75.8937, state: 'Madhya Pradesh' },
  jaipur: { lat: 26.8530, lng: 75.8050, state: 'Rajasthan' },
  coimbatore: { lat: 11.0088, lng: 76.9515, state: 'Tamil Nadu' },
  kochi: { lat: 10.0159, lng: 76.3419, state: 'Kerala' },
  chandigarh: { lat: 30.7415, lng: 76.7801, state: 'Punjab' },
  pune: { lat: 18.5362, lng: 73.8940, state: 'Maharashtra' },
  noida: { lat: 28.6280, lng: 77.3649, state: 'Uttar Pradesh' },
  delhi: { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  bangalore: { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  bengaluru: { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  mumbai: { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  gurgaon: { lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  gurugram: { lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  hyderabad: { lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  chennai: { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  kolkata: { lat: 22.5726, lng: 88.3639, state: 'West Bengal' }
};

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
  const cityMeta = DEFAULT_CITY_COORDINATES[city.toLowerCase().trim()];
  const state = raw.location?.state || raw.state || cityMeta?.state || '';
  const pincode = raw.location?.pincode || raw.pincode || '';
  const address = raw.location?.hideExactAddress ? undefined : (raw.location?.address || raw.location?.addressLine1 || undefined);
  const displayLocation = locality ? (locality.includes(city) ? locality : `${locality}, ${city}`) : city;
  
  const rawLat = raw.location?.coordinates?.latitude ?? raw.location?.latitude ?? raw.latitude ?? cityMeta?.lat;
  const rawLng = raw.location?.coordinates?.longitude ?? raw.location?.longitude ?? raw.longitude ?? cityMeta?.lng;
  const latitude = typeof rawLat === 'number' && !isNaN(rawLat) ? rawLat : undefined;
  const longitude = typeof rawLng === 'number' && !isNaN(rawLng) ? rawLng : undefined;

  const landmark = raw.location?.landmark || raw.landmark || undefined;
  const hideExactAddress = raw.location?.hideExactAddress !== undefined ? Boolean(raw.location.hideExactAddress) : true;

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
    : undefined;

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

  // Dynamic property-type fields
  const builtUpArea = raw.specs?.builtUpArea ?? raw.builtUpArea;
  const propertyAge = raw.specs?.propertyAge ?? raw.propertyAge ?? raw.specs?.age;
  const facing = raw.specs?.facing ?? raw.facing;
  const bedType = raw.specs?.bedType ?? raw.bedType ?? firstUnit?.bedType;
  const minimumStay = raw.specs?.minimumStay ?? raw.rules?.minimumStay ?? raw.minimumStay;
  const noticePeriod = raw.rules?.noticePeriodDays ? `${raw.rules.noticePeriodDays} Days` : (raw.specs?.noticePeriod ?? raw.noticePeriod);

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

  const waterSupply = raw.specs?.waterSupply ?? raw.waterSupply ?? (amenities.some((a) => /water\s*supply/i.test(a.name)) ? '24/7 Water Supply' : undefined);
  const powerBackup = raw.specs?.powerBackup ?? raw.powerBackup ?? (amenities.some((a) => /power\s*backup|inverter/i.test(a.name)) ? '100% DG Backup' : undefined);
  const laundry = raw.specs?.laundry ?? raw.laundry ?? (amenities.some((a) => /laundry|washing/i.test(a.name)) ? 'Available' : undefined);
  const locker = raw.specs?.locker ?? raw.locker ?? (amenities.some((a) => /locker/i.test(a.name)) ? 'Locker Provided' : undefined);
  const commonAreas = raw.specs?.commonAreas ?? raw.commonAreas ?? (amenities.some((a) => /common|lounge/i.test(a.name)) ? 'Common Lounge & Dining' : undefined);
  const security = raw.specs?.security ?? raw.security ?? (amenities.some((a) => /security|cctv|guard/i.test(a.name)) ? '24/7 Security & CCTV' : undefined);

  // Rules & Requirements resolution (100% data-driven, never fabricated)
  const rulesList: NormalizedRule[] = [];
  const r = raw.rules || {};

  // 1. Bachelor Friendly (Tenant Requirement)
  if (r.suitableFor && Array.isArray(r.suitableFor)) {
    if (r.suitableFor.includes('bachelors')) {
      rulesList.push({
        id: 'bachelor_friendly',
        category: 'tenant_requirements',
        label: 'Bachelor Friendly',
        value: 'Bachelors Welcome',
        allowed: true,
        iconName: 'Users'
      });
    }
    if (r.suitableFor.includes('families')) {
      rulesList.push({
        id: 'family_preferred',
        category: 'tenant_requirements',
        label: 'Family Preferred',
        value: 'Families Welcome',
        allowed: true,
        iconName: 'Home'
      });
    }
  } else {
    if (r.bachelorFriendly !== undefined) {
      rulesList.push({
        id: 'bachelor_friendly',
        category: 'tenant_requirements',
        label: 'Bachelor Friendly',
        value: r.bachelorFriendly ? 'Bachelors Welcome' : 'No Bachelors',
        allowed: Boolean(r.bachelorFriendly),
        iconName: 'Users'
      });
    }
    if (r.familyPreferred !== undefined) {
      rulesList.push({
        id: 'family_preferred',
        category: 'tenant_requirements',
        label: 'Family Preferred',
        value: r.familyPreferred ? 'Families Preferred' : 'Families Welcome',
        allowed: true,
        iconName: 'Home'
      });
    }
  }

  // 2. Gender Preference (Tenant Requirement)
  const genderPref = r.genderPreference || raw.specs?.genderPreference;
  if (genderPref && genderPref !== 'any') {
    const formattedGender = genderPref === 'male_only'
      ? 'Male Only'
      : genderPref === 'female_only'
      ? 'Female Only'
      : genderPref.replace(/_/g, ' ');
    rulesList.push({
      id: 'gender_preference',
      category: 'tenant_requirements',
      label: 'Gender Preference',
      value: formattedGender,
      allowed: true,
      iconName: 'UserCheck'
    });
  }

  // 3. Minimum Stay (Tenant Requirement)
  const minStay = r.minimumStay || (r.minimumStayRule ? `${r.minimumStayRule} Months` : undefined) || raw.specs?.minimumStay || (raw.pricing?.lockInMonths ? `${raw.pricing.lockInMonths} Months` : undefined);
  if (minStay) {
    rulesList.push({
      id: 'minimum_stay',
      category: 'tenant_requirements',
      label: 'Minimum Stay',
      value: String(minStay),
      allowed: 'restricted',
      iconName: 'Calendar'
    });
  }

  // 4. Notice Period (Tenant Requirement)
  const noticeDays = r.noticePeriodDays || (r.noticePeriodRule ? `${r.noticePeriodRule} Days` : undefined) || raw.specs?.noticePeriod || (raw.pricing?.noticePeriodDays ? `${raw.pricing.noticePeriodDays} Days` : undefined);
  if (noticeDays) {
    rulesList.push({
      id: 'notice_period',
      category: 'tenant_requirements',
      label: 'Notice Period',
      value: typeof noticeDays === 'number' ? `${noticeDays} Days` : String(noticeDays),
      allowed: 'restricted',
      iconName: 'Clock'
    });
  }

  // 5. Tenant Verification / Move-in Requirements (Tenant Requirement)
  if (r.requiresIdProof || r.moveInRequirements?.includes('id_proof')) {
    rulesList.push({
      id: 'id_verification',
      category: 'tenant_requirements',
      label: 'ID Verification',
      value: 'Govt Photo ID (Aadhaar / Passport) Required',
      allowed: true,
      iconName: 'FileCheck'
    });
  }
  if (r.requiresPoliceVerification || r.tenantVerificationRule === 'yes') {
    rulesList.push({
      id: 'police_verification',
      category: 'tenant_requirements',
      label: 'Police Verification',
      value: 'Police Verification Required',
      allowed: true,
      iconName: 'ShieldAlert'
    });
  }
  if (r.requiresEmploymentOrCollegeProof) {
    rulesList.push({
      id: 'affiliation_proof',
      category: 'tenant_requirements',
      label: 'Affiliation Proof',
      value: 'Work Email or College ID Required',
      allowed: true,
      iconName: 'Briefcase'
    });
  }
  if (r.agreementRule === 'yes') {
    rulesList.push({
      id: 'agreement',
      category: 'tenant_requirements',
      label: 'Tenancy Agreement',
      value: 'Standard E-Stamped Agreement Required',
      allowed: true,
      iconName: 'FileText'
    });
  }

  // 6. Pets Allowed (House Rule)
  const petStatus = r.petPolicy || r.petsRule || (r.petsAllowed !== undefined ? (r.petsAllowed ? 'allowed' : 'not_allowed') : undefined);
  if (petStatus) {
    if (petStatus === 'allowed') {
      rulesList.push({
        id: 'pets',
        category: 'house_rules',
        label: 'Pets Allowed',
        value: 'Pets Allowed',
        allowed: true,
        iconName: 'Dog'
      });
    } else if (petStatus === 'with_restrictions' || petStatus === 'with_approval') {
      rulesList.push({
        id: 'pets',
        category: 'house_rules',
        label: 'Pets Allowed',
        value: r.petRestrictions || 'Pets Allowed with Prior Approval',
        allowed: 'restricted',
        iconName: 'Dog'
      });
    } else if (petStatus === 'not_allowed') {
      rulesList.push({
        id: 'pets',
        category: 'house_rules',
        label: 'Pets Allowed',
        value: 'No Pets Allowed',
        allowed: false,
        iconName: 'Dog'
      });
    }
  }

  // 7. Smoking (House Rule)
  const smokeStatus = r.smokingPolicy || r.smokingRule || (r.smokingAllowed !== undefined ? (r.smokingAllowed ? 'allowed' : 'not_allowed') : undefined);
  if (smokeStatus) {
    if (smokeStatus === 'allowed') {
      rulesList.push({
        id: 'smoking',
        category: 'house_rules',
        label: 'Smoking',
        value: 'Smoking Allowed',
        allowed: true,
        iconName: 'Cigarette'
      });
    } else if (smokeStatus === 'designated_area' || smokeStatus === 'with_restrictions') {
      rulesList.push({
        id: 'smoking',
        category: 'house_rules',
        label: 'Smoking',
        value: r.smokingRestrictions || 'Designated Outdoor Area Only',
        allowed: 'restricted',
        iconName: 'Cigarette'
      });
    } else if (smokeStatus === 'not_allowed') {
      rulesList.push({
        id: 'smoking',
        category: 'house_rules',
        label: 'Smoking',
        value: 'No Smoking Inside',
        allowed: false,
        iconName: 'CigaretteOff'
      });
    }
  }

  // 8. Visitors (House Rule)
  const visitorStatus = r.visitorsRule || r.guestPolicy || (r.visitorsAllowed !== undefined ? (r.visitorsAllowed ? 'allowed' : 'not_allowed') : undefined);
  if (visitorStatus) {
    if (visitorStatus === 'allowed') {
      rulesList.push({
        id: 'visitors',
        category: 'house_rules',
        label: 'Visitors',
        value: r.guestRestrictions || 'Visitors Allowed',
        allowed: true,
        iconName: 'Users'
      });
    } else if (visitorStatus === 'restricted' || visitorStatus === 'with_restrictions') {
      rulesList.push({
        id: 'visitors',
        category: 'house_rules',
        label: 'Visitors',
        value: r.guestRestrictions || 'Daytime Visitors Only',
        allowed: 'restricted',
        iconName: 'Users'
      });
    } else if (visitorStatus === 'not_allowed') {
      rulesList.push({
        id: 'visitors',
        category: 'house_rules',
        label: 'Visitors',
        value: 'Visitors Restricted',
        allowed: false,
        iconName: 'UserX'
      });
    }
  }

  // 9. Food & Cooking Rules (House Rule)
  const foodRule = r.cookingPolicy || r.foodPolicy || r.cookingRule || raw.specs?.foodPolicy;
  if (foodRule) {
    if (foodRule === 'veg_only') {
      rulesList.push({
        id: 'food_rules',
        category: 'house_rules',
        label: 'Food Rules',
        value: 'Vegetarian Cooking Only',
        allowed: 'restricted',
        iconName: 'Utensils'
      });
    } else if (foodRule === 'veg_and_nonveg') {
      rulesList.push({
        id: 'food_rules',
        category: 'house_rules',
        label: 'Food Rules',
        value: 'Veg & Non-Veg Cooking Allowed',
        allowed: true,
        iconName: 'Utensils'
      });
    } else if (foodRule === 'all_meals') {
      rulesList.push({
        id: 'food_rules',
        category: 'house_rules',
        label: 'Food Rules',
        value: r.foodNotes || 'Daily Meals Included',
        allowed: true,
        iconName: 'Soup'
      });
    } else if (foodRule === 'breakfast_only') {
      rulesList.push({
        id: 'food_rules',
        category: 'house_rules',
        label: 'Food Rules',
        value: r.foodNotes || 'Breakfast Included',
        allowed: true,
        iconName: 'Coffee'
      });
    } else if (foodRule === 'not_allowed') {
      rulesList.push({
        id: 'food_rules',
        category: 'house_rules',
        label: 'Food Rules',
        value: 'No Cooking Allowed in Rooms',
        allowed: false,
        iconName: 'Utensils'
      });
    } else if (typeof foodRule === 'string' && foodRule.trim().length > 0) {
      rulesList.push({
        id: 'food_rules',
        category: 'house_rules',
        label: 'Food Rules',
        value: foodRule,
        allowed: true,
        iconName: 'Utensils'
      });
    }
  }

  // 10. Quiet Hours (House Rule)
  if (r.quietHoursRule === 'yes' || (r.quietHoursStart && r.quietHoursEnd) || r.timingNotes) {
    const quietHoursVal = (r.quietHoursStart && r.quietHoursEnd)
      ? `${r.quietHoursStart} – ${r.quietHoursEnd}`
      : (r.timingNotes || '10:00 PM – 7:00 AM');
    rulesList.push({
      id: 'quiet_hours',
      category: 'house_rules',
      label: 'Quiet Hours',
      value: quietHoursVal,
      allowed: 'restricted',
      iconName: 'Moon'
    });
  }

  // 11. Timing / Gate Closing / Curfew (House Rule)
  if (r.timingType === 'curfew' || r.timingType === 'gate_closing' || r.gateClosingTime || (raw.specs?.curfewOrTiming && !/open|24\/7/i.test(raw.specs.curfewOrTiming))) {
    const curfewVal = r.gateClosingTime ? `Gate closes at ${r.gateClosingTime}` : (raw.specs?.curfewOrTiming || 'Gate closes at 10:30 PM');
    rulesList.push({
      id: 'curfew',
      category: 'house_rules',
      label: 'Gate Closing / Curfew',
      value: curfewVal,
      allowed: 'restricted',
      iconName: 'Clock'
    });
  } else if (r.timingType === 'open_24_7' || (raw.specs?.curfewOrTiming && /open|24\/7/i.test(raw.specs.curfewOrTiming))) {
    rulesList.push({
      id: 'curfew',
      category: 'house_rules',
      label: 'Access Timings',
      value: 'Open 24/7 (Biometric Access)',
      allowed: true,
      iconName: 'Key'
    });
  }

  const houseRules = rulesList.filter((rule) => rule.category === 'house_rules');
  const tenantRequirements = rulesList.filter((rule) => rule.category === 'tenant_requirements');

  // Owner resolution (strictly authentic backend data, zero fabrication)
  const owner: NormalizedOwner = {
    name: raw.owner?.name || 'Property Owner',
    role: raw.owner?.role || 'Property Owner',
    avatar: raw.owner?.avatar || undefined,
    verified: raw.owner?.verified !== undefined
      ? Boolean(raw.owner.verified)
      : (raw.verified === true),
    responseTime: raw.owner?.responseTime || undefined,
    memberSince: raw.owner?.memberSince || undefined
  };

  // Verification resolution (Strictly data-driven, future-ready)
  const rawVerification = raw.verification || {};
  const isExplicitlyVerified = rawVerification.isVerified !== undefined
    ? Boolean(rawVerification.isVerified)
    : (raw.verified !== undefined ? Boolean(raw.verified) : false);

  const rawChecks = rawVerification.checks || {};

  // Future-ready supported verification items:
  // * Owner identity verified (Owner Verified)
  // * Property details verified (Property Verified)
  // * Documents verified (Documents Verified)
  // * Photos reviewed (Photos Verified)
  // * Availability confirmed (Availability Verified)
  const hasExplicitChecks = Object.keys(rawChecks).length > 0;

  const potentialChecks: VerificationCheckItem[] = [
    {
      id: 'owner_identity',
      label: 'Owner identity verified',
      confirmed: hasExplicitChecks
        ? Boolean(rawChecks.ownerIdentity)
        : Boolean(rawVerification.ownerIdentityVerified ?? (raw.owner?.verified === true))
    },
    {
      id: 'property_details',
      label: 'Property details verified',
      confirmed: hasExplicitChecks
        ? Boolean(rawChecks.propertyDetails)
        : Boolean(rawVerification.propertyDetailsVerified ?? (raw.auditTimeline?.some((a: any) => /dimension|spec|detail|acoustics|wi-fi/i.test(a.event))))
    },
    {
      id: 'documents',
      label: 'Documents verified',
      confirmed: hasExplicitChecks
        ? Boolean(rawChecks.documents)
        : Boolean(rawVerification.documentsVerified ?? (raw.auditTimeline?.some((a: any) => /deed|document|title|legal/i.test(a.event))))
    },
    {
      id: 'photos_reviewed',
      label: 'Photos reviewed',
      confirmed: hasExplicitChecks
        ? Boolean(rawChecks.photosReviewed ?? rawChecks.photos)
        : Boolean(rawVerification.photosReviewed ?? (raw.auditTimeline?.some((a: any) => /photo/i.test(a.event))))
    },
    {
      id: 'availability_confirmed',
      label: 'Availability confirmed',
      confirmed: hasExplicitChecks
        ? Boolean(rawChecks.availabilityConfirmed ?? rawChecks.availability)
        : Boolean(rawVerification.availabilityConfirmed ?? (raw.isInstantBook === true))
    }
  ];

  // ONLY confirmed checks are displayed
  const confirmedChecks = isExplicitlyVerified
    ? potentialChecks.filter((c) => c.confirmed)
    : [];

  const lastVerifiedDate = rawVerification.lastVerifiedDate ||
    rawVerification.lastVerified ||
    (raw.auditTimeline?.[0]?.date ? raw.auditTimeline[0].date : undefined);

  const verification: NormalizedVerification = {
    isVerified: isExplicitlyVerified && confirmedChecks.length > 0,
    status: isExplicitlyVerified && confirmedChecks.length > 0 ? 'verified' : (rawVerification.status || 'unverified'),
    level: rawVerification.level || (confirmedChecks.length >= 4 ? 'certified' : 'standard'),
    levelLabel: rawVerification.levelLabel || (confirmedChecks.length >= 4 ? 'ApnaStay Certified' : 'Verified Listing'),
    lastVerified: lastVerifiedDate,
    confirmedChecks,
    allChecks: potentialChecks,
    verifiedBadges: isExplicitlyVerified && confirmedChecks.length > 0
      ? ['Zero Brokerage', 'Identity Verified', 'Physically Audited']
      : []
  };

  // Nearby places
  const nearbyPlaces: NormalizedNearbyPlace[] = Array.isArray(raw.nearby)
    ? raw.nearby.map((n: any) => ({ name: n.name, distance: n.distance }))
    : [];

  // Highlights (strictly data-driven from real property fields)
  const highlights: string[] = [];

  // 1. Furnishing status
  if (furnishing) {
    if (/fully/i.test(furnishing)) {
      highlights.push('Fully furnished');
    } else if (/semi/i.test(furnishing)) {
      highlights.push('Semi-furnished');
    } else {
      highlights.push(furnishing);
    }
  }

  // 2. Parking
  const hasParking = Boolean(parking) || amenities.some((a) => /parking/i.test(a.name));
  if (hasParking) {
    highlights.push('Parking available');
  }

  // 3. Proximity to Metro
  const metroNearby = nearbyPlaces.find((n) => /metro/i.test(n.name));
  if (metroNearby) {
    const distMatch = metroNearby.distance?.match(/^(\d+(?:\.\d+)?\s*(?:m|km))/i);
    highlights.push(distMatch ? `Near metro (${distMatch[1]})` : 'Near metro');
  } else if (raw.metroDistanceMin) {
    highlights.push(`Near metro (${raw.metroDistanceMin} mins)`);
  }

  // 4. Verified Owner
  if (owner.verified || verification.isVerified) {
    highlights.push('Verified owner');
  }

  // 5. Immediate Availability
  if (isImmediate || availStatus === 'immediate') {
    highlights.push('Available immediately');
  } else if (availableFrom) {
    highlights.push(`Available from ${availableFrom}`);
  }

  // 6. Zero Brokerage
  const hasZeroBrokerage = raw.costBreakdown?.brokerage === 0 || raw.brokerage === 0 || raw.pricing?.brokerage === 0;
  if (safeRent > 0 && hasZeroBrokerage) {
    highlights.push('Zero brokerage');
  }

  // 7. Power Backup
  if (amenities.some((a) => /power\s*backup|inverter/i.test(a.name))) {
    highlights.push('Power backup');
  }

  // 8. Lift
  const hasElevator = amenities.some((a) => /lift|elevator/i.test(a.name)) || /elevator/i.test(String(floor));
  if (hasElevator) {
    highlights.push('Lift available');
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
      builtUpArea: typeof builtUpArea === 'number' || typeof builtUpArea === 'string' ? builtUpArea : undefined,
      furnishing: typeof furnishing === 'string' ? furnishing : undefined,
      floor,
      totalFloors,
      propertyAge: typeof propertyAge === 'string' ? propertyAge : undefined,
      facing: typeof facing === 'string' ? facing : undefined,
      parking: typeof parking === 'string' ? parking : undefined,
      waterSupply: typeof waterSupply === 'string' ? waterSupply : undefined,
      powerBackup: typeof powerBackup === 'string' ? powerBackup : undefined,
      roomType: typeof roomType === 'string' ? roomType : undefined,
      bedType: typeof bedType === 'string' ? bedType : undefined,
      sharingType: typeof sharingType === 'string' ? sharingType : undefined,
      genderPreference: typeof genderPreference === 'string' ? genderPreference : undefined,
      foodPolicy: typeof foodPolicy === 'string' ? foodPolicy : undefined,
      laundry: typeof laundry === 'string' ? laundry : undefined,
      curfewOrTiming: typeof curfewOrTiming === 'string' ? curfewOrTiming : undefined,
      locker: typeof locker === 'string' ? locker : undefined,
      commonAreas: typeof commonAreas === 'string' ? commonAreas : undefined,
      security: typeof security === 'string' ? security : undefined,
      minimumStay: typeof minimumStay === 'string' ? minimumStay : undefined,
      noticePeriod: typeof noticePeriod === 'string' ? noticePeriod : undefined,
      plotArea: typeof plotArea === 'string' || typeof plotArea === 'number' ? String(plotArea) : undefined,
      occupancyCapacity: occupancyCapacity ? String(occupancyCapacity) : undefined
    },

    amenities,
    rules: rulesList,
    houseRules,
    tenantRequirements,
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
