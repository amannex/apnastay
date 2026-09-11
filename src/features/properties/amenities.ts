// ============================================================================
// APNASTAY PROPERTY ENGINE — EXTENSIBLE AMENITIES REGISTRY (PHASE 6)
// Modular registry and property-specific recommendation engine
// ============================================================================

import type { PropertyType, AmenityCategory, AmenityDefinition } from './types';

export interface AmenityCategoryConfig {
  id: AmenityCategory;
  label: string;
  description: string;
}

export const AMENITY_CATEGORIES: AmenityCategoryConfig[] = [
  {
    id: 'basic',
    label: 'Basic Utilities',
    description: 'Essential infrastructure and utilities every tenant expects.'
  },
  {
    id: 'comfort',
    label: 'Comfort & Appliances',
    description: 'Appliances and climate control features for convenient living.'
  },
  {
    id: 'building',
    label: 'Building & Facilities',
    description: 'Physical building features, access, and designated parking spaces.'
  },
  {
    id: 'services',
    label: 'Services & Food',
    description: 'Daily operational support, maintenance, and dining provisions.'
  }
];

export const AMENITY_REGISTRY: Record<string, AmenityDefinition> = {
  // --- BASIC UTILITIES ---
  wifi: {
    id: 'wifi',
    name: 'Internet / High-Speed Wi-Fi',
    category: 'basic',
    iconName: 'Wifi',
    description: 'High-speed broadband internet access',
    defaultSuggestedFor: ['pg', 'hostel', 'coliving', 'apartment', 'room']
  },
  water_supply: {
    id: 'water_supply',
    name: '24/7 Water Supply',
    category: 'basic',
    iconName: 'Droplets',
    description: 'Continuous fresh municipal or borewell water supply',
    defaultSuggestedFor: ['house', 'apartment', 'villa', 'independent_floor']
  },
  power_backup: {
    id: 'power_backup',
    name: '100% Power Backup',
    category: 'basic',
    iconName: 'Zap',
    description: 'Inverter or generator power backup for uninterrupted living',
    defaultSuggestedFor: ['apartment', 'house', 'villa', 'pg', 'commercial']
  },
  security: {
    id: 'security',
    name: '24/7 Security Guard',
    category: 'basic',
    iconName: 'ShieldCheck',
    description: 'Gated physical security personnel on duty',
    defaultSuggestedFor: ['apartment', 'villa', 'hostel', 'coliving']
  },
  cctv: {
    id: 'cctv',
    name: 'CCTV Surveillance',
    category: 'basic',
    iconName: 'Video',
    description: 'Security cameras covering building entrances and common corridors',
    defaultSuggestedFor: ['pg', 'hostel', 'coliving', 'apartment', 'commercial']
  },

  // --- COMFORT & APPLIANCES ---
  ac: {
    id: 'ac',
    name: 'Air Conditioning (AC)',
    category: 'comfort',
    iconName: 'Wind',
    description: 'Split or window air conditioning installed',
    defaultSuggestedFor: ['apartment', 'villa', 'coliving', 'pg']
  },
  fan: {
    id: 'fan',
    name: 'Ceiling Fans',
    category: 'comfort',
    iconName: 'Fan',
    description: 'Fitted energy-efficient ceiling fans in all rooms',
    defaultSuggestedFor: ['house', 'room', 'apartment']
  },
  tv: {
    id: 'tv',
    name: 'Television (TV)',
    category: 'comfort',
    iconName: 'Tv',
    description: 'LED / Smart TV available with cable or streaming setup',
    defaultSuggestedFor: ['apartment', 'villa', 'coliving']
  },
  refrigerator: {
    id: 'refrigerator',
    name: 'Refrigerator',
    category: 'comfort',
    iconName: 'Refrigerator',
    description: 'Dedicated or common refrigerator unit for food storage',
    defaultSuggestedFor: ['pg', 'coliving', 'apartment', 'house']
  },
  geyser: {
    id: 'geyser',
    name: 'Geyser / Water Heater',
    category: 'comfort',
    iconName: 'Flame',
    description: 'Hot water facility in all bathrooms',
    defaultSuggestedFor: ['apartment', 'villa', 'pg', 'hostel', 'house']
  },

  // --- BUILDING & FACILITIES ---
  lift: {
    id: 'lift',
    name: 'Lift / Elevator',
    category: 'building',
    iconName: 'ArrowUpDown',
    description: 'Automated elevator access to all floors',
    defaultSuggestedFor: ['apartment', 'building', 'commercial']
  },
  parking: {
    id: 'parking',
    name: 'Dedicated Car Parking',
    category: 'building',
    iconName: 'Car',
    description: 'Covered or reserved four-wheeler parking bay',
    defaultSuggestedFor: ['apartment', 'house', 'villa', 'commercial']
  },
  bike_parking: {
    id: 'bike_parking',
    name: 'Two-Wheeler Parking',
    category: 'building',
    iconName: 'Bike',
    description: 'Designated parking zone for motorcycles and scooters',
    defaultSuggestedFor: ['pg', 'hostel', 'coliving', 'apartment']
  },
  balcony: {
    id: 'balcony',
    name: 'Private Balcony',
    category: 'building',
    iconName: 'Maximize',
    description: 'Attached open-air balcony with pleasant views and ventilation',
    defaultSuggestedFor: ['apartment', 'house', 'villa']
  },
  terrace: {
    id: 'terrace',
    name: 'Rooftop / Terrace Access',
    category: 'building',
    iconName: 'Sun',
    description: 'Accessible open terrace for morning walks or leisure',
    defaultSuggestedFor: ['house', 'villa', 'independent_floor']
  },
  kitchen: {
    id: 'kitchen',
    name: 'Equipped Kitchen',
    category: 'building',
    iconName: 'Utensils',
    description: 'Cooking space with countertop, sink, and gas pipeline/cylinder option',
    defaultSuggestedFor: ['apartment', 'house', 'villa', 'independent_floor']
  },
  common_area: {
    id: 'common_area',
    name: 'Common Lounge / Living Area',
    category: 'building',
    iconName: 'Users',
    description: 'Shared hall or lounge space for social interactions',
    defaultSuggestedFor: ['coliving', 'pg', 'hostel']
  },
  gym: {
    id: 'gym',
    name: 'Gym / Fitness Center',
    category: 'building',
    iconName: 'Dumbbell',
    description: 'Indoor fitness workout equipment on premises',
    defaultSuggestedFor: ['apartment', 'villa', 'coliving']
  },
  garden: {
    id: 'garden',
    name: 'Lawn / Private Garden',
    category: 'building',
    iconName: 'Trees',
    description: 'Landscaped open garden area for fresh air and greenery',
    defaultSuggestedFor: ['house', 'villa']
  },
  swimming_pool: {
    id: 'swimming_pool',
    name: 'Swimming Pool',
    category: 'building',
    iconName: 'Waves',
    description: 'Clean swimming pool facility with maintenance',
    defaultSuggestedFor: ['villa', 'apartment']
  },

  // --- SERVICES & FOOD ---
  food: {
    id: 'food',
    name: 'Daily Food / Meal Service',
    category: 'services',
    iconName: 'Soup',
    description: 'Hygienic daily meals (breakfast, lunch, and dinner)',
    defaultSuggestedFor: ['pg', 'hostel', 'coliving']
  },
  laundry: {
    id: 'laundry',
    name: 'Laundry Service',
    category: 'services',
    iconName: 'Shirt',
    description: 'Professional wash, dry, and ironing service for garments',
    defaultSuggestedFor: ['pg', 'hostel', 'coliving']
  },
  washing_machine: {
    id: 'washing_machine',
    name: 'Washing Machine',
    category: 'services',
    iconName: 'Sparkles',
    description: 'Automated washing machine provided for resident self-use',
    defaultSuggestedFor: ['coliving', 'pg', 'apartment', 'house']
  },
  housekeeping: {
    id: 'housekeeping',
    name: 'Regular Housekeeping',
    category: 'services',
    iconName: 'Brush',
    description: 'Scheduled room cleaning and waste disposal services',
    defaultSuggestedFor: ['pg', 'hostel', 'coliving']
  }
};

/**
 * Retrieve a specific amenity definition by its ID.
 */
export function getAmenityById(id: string): AmenityDefinition | undefined {
  return AMENITY_REGISTRY[id];
}

/**
 * Retrieve all registered amenities grouped by category.
 */
export function getAmenitiesByCategory(): Record<AmenityCategory, AmenityDefinition[]> {
  const grouped: Record<AmenityCategory, AmenityDefinition[]> = {
    basic: [],
    comfort: [],
    building: [],
    services: [],
    safety: [],
    outdoor: [],
    custom: []
  };

  Object.values(AMENITY_REGISTRY).forEach((amenity) => {
    if (grouped[amenity.category]) {
      grouped[amenity.category].push(amenity);
    }
  });

  return grouped;
}

/**
 * Retrieve recommended/suggested amenities prioritized for a given property type.
 * Examples:
 * - PG: Food, Laundry, Wi-Fi, CCTV, Washing Machine, Housekeeping
 * - Apartment: Lift, Dedicated Car Parking, Balcony, Power Backup, Security Guard
 * - House: Dedicated Car Parking, Lawn / Private Garden, Balcony, Power Backup
 */
export function getSuggestedAmenitiesForProperty(propertyType?: PropertyType | null): AmenityDefinition[] {
  if (!propertyType) {
    return [
      AMENITY_REGISTRY.wifi,
      AMENITY_REGISTRY.water_supply,
      AMENITY_REGISTRY.power_backup,
      AMENITY_REGISTRY.parking
    ].filter(Boolean);
  }

  // Explicit prioritized mapping per phase requirement
  const typeOverrides: Record<PropertyType, string[]> = {
    pg: ['food', 'laundry', 'wifi', 'cctv', 'washing_machine', 'housekeeping'],
    apartment: ['lift', 'parking', 'balcony', 'power_backup', 'security', 'cctv'],
    house: ['parking', 'garden', 'balcony', 'power_backup', 'water_supply', 'terrace'],
    villa: ['swimming_pool', 'garden', 'parking', 'ac', 'security', 'terrace'],
    hostel: ['food', 'wifi', 'cctv', 'laundry', 'security', 'housekeeping'],
    coliving: ['wifi', 'food', 'washing_machine', 'housekeeping', 'common_area', 'ac'],
    independent_floor: ['parking', 'balcony', 'water_supply', 'power_backup', 'terrace'],
    room: ['wifi', 'ac', 'fan', 'water_supply', 'geyser'],
    building: ['lift', 'parking', 'power_backup', 'security', 'cctv'],
    commercial: ['parking', 'power_backup', 'lift', 'cctv', 'security', 'ac'],
    other: ['wifi', 'parking', 'water_supply', 'power_backup', 'security']
  };

  const prioritizedIds = typeOverrides[propertyType] || typeOverrides.other;
  return prioritizedIds
    .map((id) => AMENITY_REGISTRY[id])
    .filter((a): a is AmenityDefinition => Boolean(a));
}

/**
 * Clean and sanitize a custom amenity name entered by a user.
 */
export function sanitizeCustomAmenity(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Validate a proposed custom amenity.
 * Rejects empty, too short (< 2 chars), too long (> 50 chars), or duplicate values.
 */
export function validateCustomAmenity(
  name: string,
  existingStandardIds: string[],
  existingCustom: string[]
): { valid: boolean; error?: string; sanitized: string } {
  const sanitized = sanitizeCustomAmenity(name);

  if (!sanitized) {
    return { valid: false, error: 'Please enter an amenity name.', sanitized: '' };
  }

  if (sanitized.length < 2) {
    return { valid: false, error: 'Amenity name must be at least 2 characters.', sanitized };
  }

  if (sanitized.length > 50) {
    return { valid: false, error: 'Amenity name cannot exceed 50 characters.', sanitized };
  }

  // Check if standard amenity with this name exists
  const lowerName = sanitized.toLowerCase();
  const matchedStandard = Object.values(AMENITY_REGISTRY).find(
    (a) => a.name.toLowerCase() === lowerName || a.id.toLowerCase() === lowerName
  );

  if (matchedStandard) {
    if (existingStandardIds.includes(matchedStandard.id)) {
      return {
        valid: false,
        error: `"${matchedStandard.name}" is already selected in the standard amenities.`,
        sanitized
      };
    }
    return {
      valid: false,
      error: `"${matchedStandard.name}" is available in standard amenities above. Please select it from the list.`,
      sanitized
    };
  }

  // Check if duplicate custom amenity
  const isDuplicateCustom = existingCustom.some((c) => c.toLowerCase() === lowerName);
  if (isDuplicateCustom) {
    return { valid: false, error: `"${sanitized}" has already been added as a custom amenity.`, sanitized };
  }

  return { valid: true, sanitized };
}
