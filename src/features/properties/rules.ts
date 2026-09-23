import {
  PropertyRules,
  PropertyType,
  RentalStructure,
  PolicyStatus,
  ResidentSuitability,
  FoodIncludedPolicy,
  KitchenAccessPolicy,
  CookingAllowedPolicy,
  TimingRestrictionType,
} from './types';

// ============================================================================
// Sanitization and Validation
// ============================================================================

/**
 * Strips script/style contents, HTML tags, and collapses redundant whitespaces.
 */
export function sanitizeRuleText(text?: string, maxLength: number = 500): string {
  if (!text) return '';
  const noScript = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  const stripped = noScript.replace(/<[^>]*>?/gm, '');
  return stripped.trim().slice(0, maxLength);
}

/**
 * Validates custom rule strings.
 */
export function validateCustomRule(ruleText: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeRuleText(ruleText, 200);
  if (!sanitized) {
    return { valid: false, error: 'Rule text cannot be empty.' };
  }
  if (sanitized.length < 3) {
    return { valid: false, error: 'Rule text must be at least 3 characters long.' };
  }
  return { valid: true };
}

/**
 * Validates a complete or partial PropertyRules object.
 */
export function validatePropertyRules(rules: Partial<PropertyRules>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (rules.maxOccupants !== undefined && rules.maxOccupants !== null) {
    if (!Number.isInteger(rules.maxOccupants) || rules.maxOccupants < 1) {
      errors.push('Maximum occupants must be a positive integer.');
    }
  }

  if (rules.minAge !== undefined && rules.minAge !== null) {
    if (rules.minAge < 0 || rules.minAge > 120) {
      errors.push('Minimum age must be between 0 and 120.');
    }
  }

  if (rules.maxAge !== undefined && rules.maxAge !== null) {
    if (rules.maxAge < 0 || rules.maxAge > 120) {
      errors.push('Maximum age must be between 0 and 120.');
    }
  }

  if (rules.customRules && Array.isArray(rules.customRules)) {
    if (rules.customRules.length > 30) {
      errors.push('Maximum of 30 custom rules allowed.');
    }
    rules.customRules.forEach((rule, idx) => {
      const { valid, error } = validateCustomRule(rule);
      if (!valid) {
        errors.push(`Rule #${idx + 1}: ${error}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes and synchronizes PropertyRules, keeping legacy boolean flags in sync.
 */
export function sanitizePropertyRules(rules: Partial<PropertyRules>): PropertyRules {
  const clean: PropertyRules = { ...rules };

  // Sanitize text notes
  if (clean.guestRestrictions) clean.guestRestrictions = sanitizeRuleText(clean.guestRestrictions, 300);
  if (clean.petRestrictions) clean.petRestrictions = sanitizeRuleText(clean.petRestrictions, 300);
  if (clean.smokingRestrictions) clean.smokingRestrictions = sanitizeRuleText(clean.smokingRestrictions, 300);
  if (clean.alcoholRestrictions) clean.alcoholRestrictions = sanitizeRuleText(clean.alcoholRestrictions, 300);
  if (clean.timingNotes) clean.timingNotes = sanitizeRuleText(clean.timingNotes, 300);
  if (clean.foodNotes) clean.foodNotes = sanitizeRuleText(clean.foodNotes, 300);
  if (clean.verificationNotes) clean.verificationNotes = sanitizeRuleText(clean.verificationNotes, 300);
  if (clean.additionalNotes) clean.additionalNotes = sanitizeRuleText(clean.additionalNotes, 1000);

  // Sanitize custom rules
  if (clean.customRules && Array.isArray(clean.customRules)) {
    const uniqueRules = new Set<string>();
    clean.customRules.forEach((rule) => {
      const sanitized = sanitizeRuleText(rule, 200);
      if (sanitized) uniqueRules.add(sanitized);
    });
    clean.customRules = Array.from(uniqueRules).slice(0, 30);
  }

  // Deduplicate resident suitability
  if (clean.suitableFor && Array.isArray(clean.suitableFor)) {
    clean.suitableFor = Array.from(new Set(clean.suitableFor));
  }

  // Synchronize Specific Rules
  if (clean.smokingRule) {
    clean.smokingPolicy = clean.smokingRule === 'allowed' ? 'allowed' : clean.smokingRule === 'designated_area' ? 'with_restrictions' : 'not_allowed';
    clean.smokingAllowed = clean.smokingRule === 'allowed' || clean.smokingRule === 'designated_area';
  } else if (clean.smokingPolicy) {
    clean.smokingAllowed = clean.smokingPolicy === 'allowed';
  } else if (clean.smokingAllowed !== undefined) {
    clean.smokingPolicy = clean.smokingAllowed ? 'allowed' : 'not_allowed';
  }

  // Synchronize Alcohol Policy <-> Legacy Boolean
  if (clean.alcoholRule) {
    clean.alcoholPolicy = clean.alcoholRule === 'allowed' ? 'allowed' : clean.alcoholRule === 'designated_area' ? 'with_restrictions' : 'not_allowed';
    clean.alcoholAllowed = clean.alcoholRule === 'allowed' || clean.alcoholRule === 'designated_area';
  } else if (clean.alcoholPolicy) {
    clean.alcoholAllowed = clean.alcoholPolicy === 'allowed';
  } else if (clean.alcoholAllowed !== undefined) {
    clean.alcoholPolicy = clean.alcoholAllowed ? 'allowed' : 'not_allowed';
  }

  // Synchronize Pet Policy <-> Legacy Boolean
  if (clean.petsRule) {
    clean.petPolicy = clean.petsRule === 'allowed' ? 'allowed' : clean.petsRule === 'with_approval' ? 'with_restrictions' : 'not_allowed';
    clean.petsAllowed = clean.petsRule !== 'not_allowed';
  } else if (clean.petPolicy) {
    clean.petsAllowed = clean.petPolicy === 'allowed';
  } else if (clean.petsAllowed !== undefined) {
    clean.petPolicy = clean.petsAllowed ? 'allowed' : 'not_allowed';
  }

  // Synchronize Guest Policy <-> Legacy Visitors Boolean
  if (clean.visitorsRule) {
    clean.guestPolicy = clean.visitorsRule === 'allowed' ? 'allowed' : clean.visitorsRule === 'restricted' ? 'with_restrictions' : 'not_allowed';
    clean.visitorsAllowed = clean.visitorsRule !== 'not_allowed';
  } else if (clean.guestPolicy) {
    clean.visitorsAllowed = clean.guestPolicy === 'allowed' || clean.guestPolicy === 'with_restrictions';
  } else if (clean.visitorsAllowed !== undefined) {
    clean.guestPolicy = clean.visitorsAllowed ? 'allowed' : 'not_allowed';
  }

  return clean;
}

// ============================================================================
// Adaptive Configurations & Suggested Rules
// ============================================================================

export type RuleSectionKey =
  | 'occupancy'
  | 'guests'
  | 'food'
  | 'pets'
  | 'substances'
  | 'timing'
  | 'verification'
  | 'custom';

export interface RulesConfig {
  archetype: 'pg_hostel' | 'apartment_house' | 'coliving' | 'commercial' | 'general';
  prioritySections: RuleSectionKey[];
  suggestedRules: string[];
  defaultGateTime?: string;
  defaultSuitability?: ResidentSuitability[];
}

/**
 * Returns adaptive rule recommendations and order of prominence based on property archetype.
 */
export function getRulesConfigForProperty(
  propertyType?: PropertyType,
  rentalStructure?: RentalStructure
): RulesConfig {
  const isPgOrHostel =
    propertyType === 'pg' ||
    propertyType === 'hostel' ||
    rentalStructure === 'individual_bed';

  const isCoLiving = propertyType === 'coliving';

  const isApartmentOrHouse =
    propertyType === 'apartment' ||
    propertyType === 'house' ||
    propertyType === 'villa' ||
    propertyType === 'independent_floor' ||
    rentalStructure === 'entire_property';

  const isCommercial = propertyType === 'commercial';

  if (isPgOrHostel) {
    return {
      archetype: 'pg_hostel',
      prioritySections: ['food', 'timing', 'guests', 'occupancy', 'verification', 'substances', 'pets', 'custom'],
      defaultGateTime: '22:30',
      defaultSuitability: ['students', 'working_professionals', 'bachelors'],
      suggestedRules: [
        'Main entry gate closes at 10:30 PM.',
        'Visitors allowed in common lounge/reception area only.',
        'Quiet hours observed after 10:00 PM.',
        'Outside food permitted only in designated dining areas.',
        'Valid college or employer ID mandatory during check-in.',
        'Smoking and alcohol strictly prohibited on premises.',
      ],
    };
  }

  if (isCoLiving) {
    return {
      archetype: 'coliving',
      prioritySections: ['occupancy', 'food', 'guests', 'substances', 'timing', 'pets', 'verification', 'custom'],
      defaultSuitability: ['working_professionals', 'individuals'],
      suggestedRules: [
        'Clean up community kitchen counter after cooking.',
        'Respect quiet hours (11:00 PM – 7:00 AM) in dorm and pod rooms.',
        'Day guests permitted in common coworking & entertainment areas.',
        'Mark and label personal food items in common refrigerators.',
        'Smoking permitted in designated outdoor balconies only.',
      ],
    };
  }

  if (isCommercial) {
    return {
      archetype: 'commercial',
      prioritySections: ['timing', 'occupancy', 'verification', 'substances', 'custom'],
      suggestedRules: [
        'Building security access cards mandatory for all employees.',
        'Operation hours: 8:00 AM to 9:00 PM on weekdays.',
        'Prior permission required for heavy equipment or interior modifications.',
        'Designated smoking zone in ground floor courtyard only.',
      ],
    };
  }

  // Apartment, House, Villa or General
  return {
    archetype: isApartmentOrHouse ? 'apartment_house' : 'general',
    prioritySections: ['occupancy', 'pets', 'substances', 'guests', 'verification', 'timing', 'food', 'custom'],
    defaultSuitability: ['families', 'couples', 'working_professionals'],
    suggestedRules: [
      'Society quiet hours observed between 10:00 PM and 7:00 AM.',
      'Resident vehicle parking permit must be displayed.',
      'Garbage segregation (dry and wet waste) is mandatory.',
      'No structural alterations or wall drilling without prior owner permission.',
      'Subletting or Airbnb hosting strictly prohibited.',
    ],
  };
}

/**
 * Creates default starting rules for a new property draft.
 */
export function createDefaultRules(
  propertyType?: PropertyType,
  rentalStructure?: RentalStructure
): PropertyRules {
  const config = getRulesConfigForProperty(propertyType, rentalStructure);

  if (config.archetype === 'pg_hostel') {
    return {
      suitableFor: config.defaultSuitability,
      guestPolicy: 'with_restrictions',
      guestRestrictions: 'Visitors permitted in common lobby area between 9 AM and 8 PM.',
      timingType: 'gate_closing',
      gateClosingTime: config.defaultGateTime,
      foodPolicy: 'all_meals',
      kitchenAccess: 'not_available',
      cookingPolicy: 'not_allowed',
      petPolicy: 'not_allowed',
      smokingPolicy: 'not_allowed',
      smokingAllowed: false,
      alcoholPolicy: 'not_allowed',
      alcoholAllowed: false,
      requiresIdProof: true,
      requiresPoliceVerification: true,
      requiresEmploymentOrCollegeProof: true,
      customRules: config.suggestedRules.slice(0, 3),
    };
  }

  if (config.archetype === 'coliving') {
    return {
      suitableFor: config.defaultSuitability,
      guestPolicy: 'with_restrictions',
      guestRestrictions: 'Day guests allowed until 9 PM. Overnight guests require prior notice.',
      timingType: 'open_24_7',
      foodPolicy: 'on_demand',
      kitchenAccess: 'shared',
      cookingPolicy: 'veg_and_nonveg',
      petPolicy: 'not_allowed',
      smokingPolicy: 'with_restrictions',
      smokingRestrictions: 'Permitted only in designated outdoor smoking area.',
      smokingAllowed: false,
      alcoholPolicy: 'allowed',
      alcoholAllowed: true,
      requiresIdProof: true,
      customRules: config.suggestedRules.slice(0, 3),
    };
  }

  // Default Apartment / House / Villa
  return {
    suitableFor: config.defaultSuitability,
    guestPolicy: 'allowed',
    petPolicy: 'with_restrictions',
    petRestrictions: 'Small pets allowed with prior owner consent.',
    petsAllowed: true,
    smokingPolicy: 'not_allowed',
    smokingAllowed: false,
    alcoholPolicy: 'allowed',
    alcoholAllowed: true,
    timingType: 'open_24_7',
    kitchenAccess: 'private',
    cookingPolicy: 'veg_and_nonveg',
    requiresIdProof: true,
    requiresPoliceVerification: true,
    customRules: config.suggestedRules.slice(0, 3),
  };
}

// ============================================================================
// Formatting & Presentation Helpers
// ============================================================================

export function getPolicyBadgeInfo(status?: PolicyStatus): { label: string; colorClass: string } {
  switch (status) {
    case 'allowed':
      return { label: 'Allowed', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'not_allowed':
      return { label: 'Not Allowed', colorClass: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'with_restrictions':
      return { label: 'With Restrictions', colorClass: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'not_specified':
    default:
      return { label: 'Not Specified', colorClass: 'bg-gray-50 text-gray-600 border-gray-200' };
  }
}

export function formatResidentSuitability(suitability: ResidentSuitability): string {
  const map: Record<ResidentSuitability, string> = {
    individuals: 'Individuals',
    couples: 'Couples',
    families: 'Families',
    students: 'Students',
    working_professionals: 'Working Professionals',
    bachelors: 'Bachelors',
  };
  return map[suitability] || suitability;
}

export function formatFoodPolicy(policy?: FoodIncludedPolicy): string {
  switch (policy) {
    case 'all_meals':
      return 'All Meals Included';
    case 'breakfast_only':
      return 'Breakfast Only';
    case 'breakfast_dinner':
      return 'Breakfast & Dinner';
    case 'no_meals':
      return 'No Meals Included';
    case 'on_demand':
      return 'Available On Demand';
    default:
      return 'Not Specified';
  }
}

export function formatKitchenPolicy(kitchen?: KitchenAccessPolicy, cooking?: CookingAllowedPolicy): string {
  if (!kitchen || kitchen === 'not_specified') return 'Not Specified';
  if (kitchen === 'not_available') return 'No Kitchen Access';
  const accessStr = kitchen === 'private' ? 'Private Kitchen' : 'Shared Kitchen';
  if (cooking === 'veg_only') return `${accessStr} (Veg Only)`;
  if (cooking === 'veg_and_nonveg') return `${accessStr} (Veg & Non-Veg)`;
  if (cooking === 'not_allowed') return `${accessStr} (No Cooking)`;
  return accessStr;
}

export function formatTimingPolicy(timingType?: TimingRestrictionType, gateClosingTime?: string): string {
  switch (timingType) {
    case 'open_24_7':
      return '24/7 Open Access';
    case 'gate_closing':
    case 'curfew':
      return gateClosingTime ? `Gate Closes at ${gateClosingTime}` : 'Curfew / Gate Closing Time';
    case 'flexible':
      return 'Flexible Timings';
    default:
      return 'Not Specified';
  }
}
