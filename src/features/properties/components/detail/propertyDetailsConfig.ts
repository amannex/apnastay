import React from 'react';
import {
  Bed,
  Bath,
  Ruler,
  Maximize2,
  Building,
  Sofa,
  Calendar,
  Compass,
  Car,
  Receipt,
  Droplets,
  Zap,
  Users,
  UserCheck,
  Utensils,
  WashingMachine,
  Clock,
  ShieldCheck,
  Lock,
  Shield,
  Home,
  Info
} from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

export type AccommodationProfile = 'apartment' | 'pg' | 'hostel' | 'house' | 'default';

export interface PropertyFieldSpec {
  id: string;
  label: string;
  getValue: (property: NormalizedProperty) => unknown;
}

export interface ResolvedPropertyField {
  id: string;
  label: string;
  value: string;
}

export type FieldIconComponent = React.ComponentType<{ className?: string }>;

export const FIELD_ICON_MAP: Record<string, FieldIconComponent> = {
  bedrooms: Bed,
  bathrooms: Bath,
  carpetArea: Ruler,
  builtUpArea: Maximize2,
  floor: Building,
  totalFloors: Building,
  furnishing: Sofa,
  propertyAge: Calendar,
  facing: Compass,
  parking: Car,
  maintenance: Receipt,
  waterSupply: Droplets,
  powerBackup: Zap,
  roomType: Home,
  sharingType: Users,
  genderPreference: UserCheck,
  foodIncluded: Utensils,
  laundry: WashingMachine,
  curfew: Clock,
  deposit: ShieldCheck,
  minimumStay: Calendar,
  noticePeriod: Clock,
  bedType: Bed,
  sharing: Users,
  meals: Utensils,
  locker: Lock,
  commonAreas: Users,
  security: Shield,
  plotArea: Ruler,
  floors: Building,
  propertyType: Home
};

export function getFieldIcon(id: string): FieldIconComponent {
  return FIELD_ICON_MAP[id] || Info;
}

/**
 * Sanitizes any field value, ensuring invalid, falsy, or placeholder
 * strings like 'undefined', 'null', 'false', 'NaN' are never displayed.
 */
export function sanitizeFieldValue(value: unknown): string | null {
  if (value === undefined || value === null || value === false || value === 'false') {
    return null;
  }
  if (typeof value === 'number') {
    if (isNaN(value)) return null;
    return value.toLocaleString();
  }
  const str = String(value).trim();
  if (
    !str ||
    str.toLowerCase() === 'undefined' ||
    str.toLowerCase() === 'null' ||
    str.toLowerCase() === 'nan' ||
    str.toLowerCase() === 'false'
  ) {
    return null;
  }
  return str;
}

/**
 * Maps any raw property type string to an accommodation profile.
 */
export function getAccommodationProfile(propertyType?: string): AccommodationProfile {
  if (!propertyType) return 'default';
  const clean = propertyType.toLowerCase().replace(/[-_\s]+/g, ' ');

  if (
    clean.includes('pg') ||
    clean.includes('paying guest') ||
    clean.includes('coliving') ||
    clean.includes('co living')
  ) {
    return 'pg';
  }

  if (
    clean.includes('hostel') ||
    clean.includes('dorm') ||
    clean.includes('bed space') ||
    clean.includes('dormitory')
  ) {
    return 'hostel';
  }

  if (
    clean.includes('house') ||
    clean.includes('villa') ||
    clean.includes('bungalow') ||
    clean.includes('independent house')
  ) {
    return 'house';
  }

  if (
    clean.includes('apartment') ||
    clean.includes('flat') ||
    clean.includes('builder floor') ||
    clean.includes('independent floor') ||
    clean.includes('floor') ||
    clean.includes('studio') ||
    clean.includes('suite') ||
    clean.includes('penthouse')
  ) {
    return 'apartment';
  }

  return 'default';
}

/**
 * Apartment / Flat Field Profile
 * Possible fields:
 * Bedrooms, Bathrooms, Carpet Area, Built-up Area, Floor, Total Floors,
 * Furnishing, Property Age, Facing, Parking, Maintenance, Water Supply, Power Backup
 */
const APARTMENT_FIELDS: PropertyFieldSpec[] = [
  {
    id: 'bedrooms',
    label: 'Bedrooms',
    getValue: (p) =>
      p.specs.bedrooms !== undefined
        ? `${p.specs.bedrooms} ${p.specs.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}`
        : null
  },
  {
    id: 'bathrooms',
    label: 'Bathrooms',
    getValue: (p) =>
      p.specs.bathrooms !== undefined
        ? `${p.specs.bathrooms} ${p.specs.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}`
        : null
  },
  {
    id: 'carpetArea',
    label: 'Carpet Area',
    getValue: (p) => (p.specs.sqft ? `${p.specs.sqft.toLocaleString()} sq.ft.` : null)
  },
  {
    id: 'builtUpArea',
    label: 'Built-up Area',
    getValue: (p) => {
      if (!p.specs.builtUpArea) return null;
      return typeof p.specs.builtUpArea === 'number'
        ? `${p.specs.builtUpArea.toLocaleString()} sq.ft.`
        : String(p.specs.builtUpArea).includes('sq')
        ? String(p.specs.builtUpArea)
        : `${p.specs.builtUpArea} sq.ft.`;
    }
  },
  {
    id: 'floor',
    label: 'Floor',
    getValue: (p) => (p.specs.floor !== undefined ? String(p.specs.floor) : null)
  },
  {
    id: 'totalFloors',
    label: 'Total Floors',
    getValue: (p) => {
      if (p.specs.totalFloors === undefined) return null;
      const str = String(p.specs.totalFloors);
      return str.toLowerCase().includes('floor') ? str : `${str} Floors`;
    }
  },
  {
    id: 'furnishing',
    label: 'Furnishing',
    getValue: (p) => p.specs.furnishing || null
  },
  {
    id: 'propertyAge',
    label: 'Property Age',
    getValue: (p) => p.specs.propertyAge || null
  },
  {
    id: 'facing',
    label: 'Facing',
    getValue: (p) => p.specs.facing || null
  },
  {
    id: 'parking',
    label: 'Parking',
    getValue: (p) => p.specs.parking || null
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    getValue: (p) => p.pricing.maintenanceDisplay || null
  },
  {
    id: 'waterSupply',
    label: 'Water Supply',
    getValue: (p) => p.specs.waterSupply || null
  },
  {
    id: 'powerBackup',
    label: 'Power Backup',
    getValue: (p) => p.specs.powerBackup || null
  }
];

/**
 * PG (Paying Guest) Field Profile
 * Possible fields:
 * Room Type, Sharing Type, Gender Preference, Food Included, Laundry,
 * Curfew, Deposit, Minimum Stay, Notice Period
 */
const PG_FIELDS: PropertyFieldSpec[] = [
  {
    id: 'roomType',
    label: 'Room Type',
    getValue: (p) => p.specs.roomType || null
  },
  {
    id: 'sharingType',
    label: 'Sharing Type',
    getValue: (p) =>
      p.specs.sharingType || (p.specs.occupancyCapacity ? `${p.specs.occupancyCapacity} Sharing` : null)
  },
  {
    id: 'genderPreference',
    label: 'Gender Preference',
    getValue: (p) => p.specs.genderPreference || null
  },
  {
    id: 'foodIncluded',
    label: 'Food Included',
    getValue: (p) => p.specs.foodPolicy || null
  },
  {
    id: 'laundry',
    label: 'Laundry',
    getValue: (p) => p.specs.laundry || null
  },
  {
    id: 'curfew',
    label: 'Curfew',
    getValue: (p) => p.specs.curfewOrTiming || null
  },
  {
    id: 'deposit',
    label: 'Deposit',
    getValue: (p) => p.pricing.depositDisplay || null
  },
  {
    id: 'minimumStay',
    label: 'Minimum Stay',
    getValue: (p) => p.specs.minimumStay || null
  },
  {
    id: 'noticePeriod',
    label: 'Notice Period',
    getValue: (p) => p.specs.noticePeriod || null
  }
];

/**
 * Hostel Field Profile
 * Possible fields:
 * Bed Type, Sharing, Meals, Locker, Laundry, Common Areas, Curfew, Security
 */
const HOSTEL_FIELDS: PropertyFieldSpec[] = [
  {
    id: 'bedType',
    label: 'Bed Type',
    getValue: (p) => p.specs.bedType || null
  },
  {
    id: 'sharing',
    label: 'Sharing',
    getValue: (p) =>
      p.specs.sharingType || (p.specs.occupancyCapacity ? `${p.specs.occupancyCapacity} Sharing` : null)
  },
  {
    id: 'meals',
    label: 'Meals',
    getValue: (p) => p.specs.foodPolicy || null
  },
  {
    id: 'locker',
    label: 'Locker',
    getValue: (p) => p.specs.locker || null
  },
  {
    id: 'laundry',
    label: 'Laundry',
    getValue: (p) => p.specs.laundry || null
  },
  {
    id: 'commonAreas',
    label: 'Common Areas',
    getValue: (p) => p.specs.commonAreas || null
  },
  {
    id: 'curfew',
    label: 'Curfew',
    getValue: (p) => p.specs.curfewOrTiming || null
  },
  {
    id: 'security',
    label: 'Security',
    getValue: (p) => p.specs.security || null
  }
];

/**
 * Independent House / Villa Field Profile
 * Possible fields:
 * Bedrooms, Bathrooms, Plot Area, Built-up Area, Floors, Parking, Furnishing, Water Supply
 */
const HOUSE_FIELDS: PropertyFieldSpec[] = [
  {
    id: 'bedrooms',
    label: 'Bedrooms',
    getValue: (p) =>
      p.specs.bedrooms !== undefined
        ? `${p.specs.bedrooms} ${p.specs.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}`
        : null
  },
  {
    id: 'bathrooms',
    label: 'Bathrooms',
    getValue: (p) =>
      p.specs.bathrooms !== undefined
        ? `${p.specs.bathrooms} ${p.specs.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}`
        : null
  },
  {
    id: 'plotArea',
    label: 'Plot Area',
    getValue: (p) => {
      if (!p.specs.plotArea) return null;
      return p.specs.plotArea.includes('sq') ? p.specs.plotArea : `${p.specs.plotArea} sq.ft.`;
    }
  },
  {
    id: 'builtUpArea',
    label: 'Built-up Area',
    getValue: (p) => {
      const area = p.specs.builtUpArea ?? p.specs.sqft;
      if (!area) return null;
      return typeof area === 'number'
        ? `${area.toLocaleString()} sq.ft.`
        : String(area).includes('sq')
        ? String(area)
        : `${area} sq.ft.`;
    }
  },
  {
    id: 'floors',
    label: 'Floors',
    getValue: (p) => {
      const floors = p.specs.totalFloors ?? p.specs.floor;
      if (floors === undefined) return null;
      const str = String(floors);
      return str.toLowerCase().includes('floor') ? str : `${str} Floors`;
    }
  },
  {
    id: 'parking',
    label: 'Parking',
    getValue: (p) => p.specs.parking || null
  },
  {
    id: 'furnishing',
    label: 'Furnishing',
    getValue: (p) => p.specs.furnishing || null
  },
  {
    id: 'waterSupply',
    label: 'Water Supply',
    getValue: (p) => p.specs.waterSupply || null
  }
];

/**
 * Fallback Default Field Profile
 */
const DEFAULT_FIELDS: PropertyFieldSpec[] = [
  {
    id: 'propertyType',
    label: 'Property Type',
    getValue: (p) => p.propertyTypeLabel
  },
  {
    id: 'bedrooms',
    label: 'Bedrooms',
    getValue: (p) => (p.specs.bedrooms !== undefined ? `${p.specs.bedrooms} BHK` : null)
  },
  {
    id: 'bathrooms',
    label: 'Bathrooms',
    getValue: (p) => (p.specs.bathrooms !== undefined ? `${p.specs.bathrooms} Bathrooms` : null)
  },
  {
    id: 'carpetArea',
    label: 'Carpet Area',
    getValue: (p) => (p.specs.sqft ? `${p.specs.sqft.toLocaleString()} sq.ft.` : null)
  },
  {
    id: 'furnishing',
    label: 'Furnishing',
    getValue: (p) => p.specs.furnishing || null
  },
  {
    id: 'floor',
    label: 'Floor',
    getValue: (p) => (p.specs.floor !== undefined ? String(p.specs.floor) : null)
  },
  {
    id: 'parking',
    label: 'Parking',
    getValue: (p) => p.specs.parking || null
  },
  {
    id: 'deposit',
    label: 'Security Deposit',
    getValue: (p) => p.pricing.depositDisplay || null
  }
];

export const PROFILE_FIELDS: Record<AccommodationProfile, PropertyFieldSpec[]> = {
  apartment: APARTMENT_FIELDS,
  pg: PG_FIELDS,
  hostel: HOSTEL_FIELDS,
  house: HOUSE_FIELDS,
  default: DEFAULT_FIELDS
};

/**
 * Resolves all relevant, non-empty, sanitized fields for a given property.
 */
export function resolvePropertyDetails(property: NormalizedProperty): ResolvedPropertyField[] {
  const profile = getAccommodationProfile(property.propertyType);
  const fieldSpecs = PROFILE_FIELDS[profile] || PROFILE_FIELDS.default;

  const results: ResolvedPropertyField[] = [];

  for (const spec of fieldSpecs) {
    const rawVal = spec.getValue(property);
    const sanitized = sanitizeFieldValue(rawVal);
    if (sanitized !== null) {
      results.push({
        id: spec.id,
        label: spec.label,
        value: sanitized
      });
    }
  }

  return results;
}
