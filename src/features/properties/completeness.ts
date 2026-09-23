// ============================================================================
// APNASTAY PROPERTY ENGINE — LISTING COMPLETENESS & PUBLISH READINESS ENGINE
// Evaluates required invariants vs recommended improvements, generates step-by-step
// audit summaries, and calculates overall listing readiness score (0 - 100%).
// ============================================================================

import type { Property, PropertyType, RentalStructure } from './types';
import { getPropertyTemplate, validateStructureForTemplate } from './templates';

export type CompletenessSectionKey =
  | 'property_type'
  | 'rental_structure'
  | 'basic_details'
  | 'location'
  | 'photos'
  | 'amenities'
  | 'units'
  | 'pricing'
  | 'availability'
  | 'rules';

export type CompletenessItemSeverity = 'required' | 'recommended' | 'optional';

export interface CompletenessCheckItem {
  id: string;
  section: CompletenessSectionKey;
  stepNumber: number; // 1 to 9
  label: string;
  severity: CompletenessItemSeverity;
  isSatisfied: boolean;
  message?: string; // Guidance shown if missing
  suggestion?: string; // Tenant-attraction explanation
}

export interface SectionCompletenessStatus {
  sectionKey: CompletenessSectionKey;
  title: string;
  stepNumber: number;
  isComplete: boolean;
  hasErrors: boolean;
  satisfiedCount: number;
  totalRequired: number;
  missingRequiredCount: number;
  missingRecommendedCount: number;
  items: CompletenessCheckItem[];
}

export interface ListingCompletenessResult {
  score: number; // 0 - 100
  isPublishable: boolean;
  missingRequired: CompletenessCheckItem[];
  recommendedImprovements: CompletenessCheckItem[];
  optionalItems: CompletenessCheckItem[];
  sections: Record<CompletenessSectionKey, SectionCompletenessStatus>;
}

export function getSectionStepNumber(section: CompletenessSectionKey): number {
  switch (section) {
    case 'property_type':
      return 1;
    case 'rental_structure':
      return 2;
    case 'location':
      return 3;
    case 'basic_details':
      return 4;
    case 'amenities':
      return 5;
    case 'photos':
      return 6;
    case 'units':
      return 7;
    case 'rules':
      return 8;
    case 'pricing':
      return 9;
    case 'availability':
      return 9;
    default:
      return 1;
  }
}

export function getSectionTitle(section: CompletenessSectionKey): string {
  switch (section) {
    case 'property_type':
      return 'Property Format & Type';
    case 'rental_structure':
      return 'Rental Model & Structure';
    case 'basic_details':
      return 'Basic Details & Description';
    case 'location':
      return 'Location & Address';
    case 'photos':
      return 'Property Photos & Media';
    case 'amenities':
      return 'Amenities & Features';
    case 'units':
      return 'Units, Rooms & Beds';
    case 'pricing':
      return 'Rent & Financial Terms';
    case 'availability':
      return 'Move-In Availability';
    case 'rules':
      return 'House Rules & Preferences';
    default:
      return 'Property Details';
  }
}

/**
 * Thoroughly evaluates a property draft against publishing invariants and quality recommendations.
 */
export function evaluateListingCompleteness(property: Property): ListingCompletenessResult {
  const items: CompletenessCheckItem[] = [];
  const template = getPropertyTemplate(property.propertyType);

  // --------------------------------------------------------------------------
  // 1. Property Type (Step 1)
  // --------------------------------------------------------------------------
  const hasValidType = Boolean(property.propertyType && template);
  items.push({
    id: 'prop_type_selected',
    section: 'property_type',
    stepNumber: 1,
    label: 'Property type selected',
    severity: 'required',
    isSatisfied: hasValidType,
    message: 'Please choose a property type (e.g. Apartment, House, PG).'
  });

  if (property.propertyType === 'other') {
    const hasCustomType = Boolean(property.customPropertyType && property.customPropertyType.trim().length >= 2);
    items.push({
      id: 'custom_type_named',
      section: 'property_type',
      stepNumber: 1,
      label: 'Custom property format named',
      severity: 'required',
      isSatisfied: hasCustomType,
      message: 'Specify a custom property format name.'
    });
  }

  // --------------------------------------------------------------------------
  // 2. Rental Model (Step 2)
  // --------------------------------------------------------------------------
  const hasValidStructure = Boolean(
    property.rentalStructure && validateStructureForTemplate(property.propertyType, property.rentalStructure)
  );
  items.push({
    id: 'rental_structure_valid',
    section: 'rental_structure',
    stepNumber: 2,
    label: 'Compatible rental model chosen',
    severity: 'required',
    isSatisfied: hasValidStructure,
    message: 'Select a valid rental structure compatible with this property type.'
  });

  // --------------------------------------------------------------------------
  // 3. Basic Details (Step 3)
  // --------------------------------------------------------------------------
  const title = property.title ? property.title.trim() : '';
  const isDefaultDraftTitle = title.startsWith('New ') && title.endsWith('Draft');
  const hasValidTitle = title.length >= 5 && !isDefaultDraftTitle;

  items.push({
    id: 'title_present',
    section: 'basic_details',
    stepNumber: 3,
    label: 'Property title specified (min 5 characters)',
    severity: 'required',
    isSatisfied: hasValidTitle,
    message: 'Provide a distinctive listing title of at least 5 characters.'
  });

  const desc = property.description ? property.description.trim() : '';
  const hasBasicDesc = desc.length >= 10;
  const hasRichDesc = desc.length >= 50;

  items.push({
    id: 'desc_min_length',
    section: 'basic_details',
    stepNumber: 3,
    label: 'Basic description (min 10 characters)',
    severity: 'required',
    isSatisfied: hasBasicDesc,
    message: 'Write a brief description of at least 10 characters for prospective tenants.'
  });

  items.push({
    id: 'desc_detailed',
    section: 'basic_details',
    stepNumber: 3,
    label: 'Detailed description (50+ characters)',
    severity: 'recommended',
    isSatisfied: hasRichDesc,
    suggestion: 'Detailed descriptions build trust and improve tenant inquiry rates.'
  });

  // --------------------------------------------------------------------------
  // 4. Location & Address (Step 4)
  // --------------------------------------------------------------------------
  const loc = property.location;
  const hasCity = Boolean(loc?.city && loc.city.trim().length >= 2);
  const hasAddressLine = Boolean(loc?.addressLine1 && loc.addressLine1.trim().length >= 3);
  const hasPincode = Boolean(loc?.pincode && loc.pincode.trim().length >= 4);

  items.push({
    id: 'loc_city',
    section: 'location',
    stepNumber: 4,
    label: 'City specified',
    severity: 'required',
    isSatisfied: hasCity,
    message: 'Enter the city where your property is situated.'
  });

  items.push({
    id: 'loc_address',
    section: 'location',
    stepNumber: 4,
    label: 'Street address specified',
    severity: 'required',
    isSatisfied: hasAddressLine,
    message: 'Provide a primary street or building address.'
  });

  items.push({
    id: 'loc_pincode',
    section: 'location',
    stepNumber: 4,
    label: 'Valid postal code (PIN Code)',
    severity: 'required',
    isSatisfied: hasPincode,
    message: 'Enter the 6-digit postal PIN code.'
  });

  const hasLocality = Boolean(loc?.locality && loc.locality.trim().length >= 2);
  items.push({
    id: 'loc_locality',
    section: 'location',
    stepNumber: 4,
    label: 'Neighborhood / Locality specified',
    severity: 'recommended',
    isSatisfied: hasLocality,
    suggestion: 'Mentioning your neighborhood helps tenants search by area.'
  });

  const hasLandmark = Boolean(loc?.landmark && loc.landmark.trim().length >= 2);
  items.push({
    id: 'loc_landmark',
    section: 'location',
    stepNumber: 4,
    label: 'Nearby landmark added',
    severity: 'recommended',
    isSatisfied: hasLandmark,
    suggestion: 'Landmarks (metro station, IT park, college) make the property easy to locate.'
  });

  // --------------------------------------------------------------------------
  // 5. Photos & Media (Step 5)
  // --------------------------------------------------------------------------
  const photosCount = property.photos ? property.photos.length : 0;
  const hasCoverPhoto = Boolean(property.photos?.some((p) => p.isCover));

  items.push({
    id: 'photos_min_one',
    section: 'photos',
    stepNumber: 6,
    label: 'At least 1 photo uploaded',
    severity: 'required',
    isSatisfied: photosCount >= 1,
    message: 'Upload at least one clear photograph of your property.'
  });

  items.push({
    id: 'photos_recommended_three',
    section: 'photos',
    stepNumber: 6,
    label: 'At least 3 photos uploaded',
    severity: 'recommended',
    isSatisfied: photosCount >= 3,
    suggestion: 'Listings with 3+ photos receive 4x more tenant views.'
  });

  items.push({
    id: 'photos_cover_designated',
    section: 'photos',
    stepNumber: 6,
    label: 'Cover photo designated',
    severity: 'recommended',
    isSatisfied: hasCoverPhoto,
    suggestion: 'Choose your most appealing photograph as the main cover image.'
  });

  // --------------------------------------------------------------------------
  // 6. Amenities & Features (Step 5)
  // --------------------------------------------------------------------------
  const totalAmenities = (property.amenities?.length || 0) + (property.customAmenities?.length || 0);

  items.push({
    id: 'amenities_selected',
    section: 'amenities',
    stepNumber: 5,
    label: 'Key amenities selected (3+ features)',
    severity: 'recommended',
    isSatisfied: totalAmenities >= 3,
    suggestion: 'Highlighting amenities like Wi-Fi, AC, and security attracts suitable tenants.'
  });

  // --------------------------------------------------------------------------
  // 7. Units, Rooms & Beds (Step 7)
  // --------------------------------------------------------------------------
  const requiresUnits =
    property.rentalStructure === 'multiple_units' ||
    property.rentalStructure === 'individual_room' ||
    property.rentalStructure === 'individual_bed' ||
    (Boolean(template?.hasUnits) && property.rentalStructure !== 'entire_property' && property.rentalStructure !== 'individual_unit');

  const unitsCount = property.units ? property.units.length : 0;
  const hasRequiredUnits = !requiresUnits || unitsCount > 0;

  items.push({
    id: 'units_configured',
    section: 'units',
    stepNumber: 7,
    label: requiresUnits ? 'At least one unit/room configured' : 'Units configured (optional for entire property)',
    severity: requiresUnits ? 'required' : 'optional',
    isSatisfied: hasRequiredUnits,
    message: requiresUnits ? 'Configure at least one unit, room, or bed before publishing.' : undefined
  });


  if (requiresUnits && unitsCount > 0) {
    const hasFurnishing = property.units.some((u) => u.furnishing);
    items.push({
      id: 'units_furnishing',
      section: 'units',
      stepNumber: 7,
      label: 'Unit furnishing specified',
      severity: 'recommended',
      isSatisfied: hasFurnishing,
      suggestion: 'Specifying furnished vs unfurnished clarifies tenant expectations.'
    });
  }

  // --------------------------------------------------------------------------
  // 8. Pricing & Rent (Step 9)
  // --------------------------------------------------------------------------
  const pricing = property.pricing;
  const hasValidRent = Boolean(
    pricing &&
    (pricing.pricingMode === 'on_request' || (pricing.monthlyRent !== undefined && pricing.monthlyRent > 0))
  );

  items.push({
    id: 'pricing_rent_set',
    section: 'pricing',
    stepNumber: 9,
    label: 'Monthly rent or price-on-request configured',
    severity: 'required',
    isSatisfied: hasValidRent,
    message: 'Set the expected monthly rental amount or select "Price on Request".'
  });

  const hasDepositConfig = Boolean(
    pricing?.securityDepositConfig || (pricing?.securityDeposit !== undefined && pricing.securityDeposit >= 0)
  );
  items.push({
    id: 'pricing_deposit',
    section: 'pricing',
    stepNumber: 9,
    label: 'Security deposit terms configured',
    severity: 'recommended',
    isSatisfied: hasDepositConfig,
    suggestion: 'Clear security deposit terms avoid misunderstandings before move-in.'
  });

  const hasChargesConfig = Boolean(pricing?.maintenanceChargesConfig || pricing?.electricityChargesConfig);
  items.push({
    id: 'pricing_utilities',
    section: 'pricing',
    stepNumber: 9,
    label: 'Maintenance / electricity terms specified',
    severity: 'recommended',
    isSatisfied: hasChargesConfig,
    suggestion: 'Clarify whether maintenance and electricity are included or extra.'
  });

  // --------------------------------------------------------------------------
  // 9. Move-In Availability (Step 9)
  // --------------------------------------------------------------------------
  const avail = property.availability;
  const hasAvailabilityType = Boolean(avail && avail.type);
  const hasValidDateIfSpecific = avail?.type !== 'specific_date' || Boolean(avail?.availableFrom);

  items.push({
    id: 'avail_type_set',
    section: 'availability',
    stepNumber: 9,
    label: 'Move-in availability status specified',
    severity: 'required',
    isSatisfied: hasAvailabilityType && hasValidDateIfSpecific,
    message: 'Specify when the property is available (Immediate or specific move-in date).'
  });

  // --------------------------------------------------------------------------
  // 10. Rules & Preferences (Step 8)
  // --------------------------------------------------------------------------
  const rules = property.rules;
  const hasSuitability = Boolean(rules?.suitableFor && rules.suitableFor.length > 0);
  const hasGuestPolicy = Boolean(rules?.guestPolicy && rules.guestPolicy !== 'not_specified');
  const hasSubstancePolicy = Boolean(
    (rules?.smokingPolicy && rules.smokingPolicy !== 'not_specified') ||
    (rules?.alcoholPolicy && rules.alcoholPolicy !== 'not_specified')
  );
  const hasDocRequirements = Boolean(
    rules?.requiresIdProof !== undefined || rules?.requiresPoliceVerification !== undefined
  );

  items.push({
    id: 'rules_suitability',
    section: 'rules',
    stepNumber: 8,
    label: 'Preferred resident profiles specified',
    severity: 'recommended',
    isSatisfied: hasSuitability,
    suggestion: 'Specifying suitable tenant profiles (families, professionals, students) filters inquiries.'
  });

  items.push({
    id: 'rules_guest_policy',
    section: 'rules',
    stepNumber: 8,
    label: 'Visitor & guest policy defined',
    severity: 'recommended',
    isSatisfied: hasGuestPolicy,
    suggestion: 'Clearly state whether guests and visitors are allowed.'
  });

  items.push({
    id: 'rules_substance_policy',
    section: 'rules',
    stepNumber: 8,
    label: 'Smoking / substance guidelines set',
    severity: 'recommended',
    isSatisfied: hasSubstancePolicy,
    suggestion: 'Prevents lifestyle clashes among residents.'
  });

  items.push({
    id: 'rules_documents',
    section: 'rules',
    stepNumber: 8,
    label: 'Move-in documentation checklist specified',
    severity: 'recommended',
    isSatisfied: hasDocRequirements,
    suggestion: 'Clarifying ID/verification requirements ensures smooth tenant onboarding.'
  });

  // --------------------------------------------------------------------------
  // Categorize Checks and Compute Section Summaries
  // --------------------------------------------------------------------------
  const missingRequired = items.filter((i) => i.severity === 'required' && !i.isSatisfied);
  const recommendedImprovements = items.filter((i) => i.severity === 'recommended' && !i.isSatisfied);
  const optionalItems = items.filter((i) => i.severity === 'optional');

  const isPublishable = missingRequired.length === 0;

  // Group items by section
  const sectionKeys: CompletenessSectionKey[] = [
    'property_type',
    'rental_structure',
    'location',
    'basic_details',
    'photos',
    'amenities',
    'units',
    'pricing',
    'availability',
    'rules'
  ];

  const sections: Record<CompletenessSectionKey, SectionCompletenessStatus> = {} as any;

  sectionKeys.forEach((key) => {
    const secItems = items.filter((i) => i.section === key);
    const requiredItems = secItems.filter((i) => i.severity === 'required');
    const satisfiedRequired = requiredItems.filter((i) => i.isSatisfied);
    const missingReq = requiredItems.filter((i) => !i.isSatisfied);
    const missingRec = secItems.filter((i) => i.severity === 'recommended' && !i.isSatisfied);

    sections[key] = {
      sectionKey: key,
      title: getSectionTitle(key),
      stepNumber: getSectionStepNumber(key),
      isComplete: missingReq.length === 0,
      hasErrors: missingReq.length > 0,
      satisfiedCount: satisfiedRequired.length,
      totalRequired: requiredItems.length,
      missingRequiredCount: missingReq.length,
      missingRecommendedCount: missingRec.length,
      items: secItems
    };
  });

  // --------------------------------------------------------------------------
  // Weighted Completeness Score Calculation (0 - 100)
  // --------------------------------------------------------------------------
  // Baseline draft created: 15%
  // Required items satisfied proportion: 50%
  // Recommended items satisfied proportion: 35%
  const totalRequired = items.filter((i) => i.severity === 'required').length;
  const satisfiedRequiredCount = items.filter((i) => i.severity === 'required' && i.isSatisfied).length;

  const totalRecommended = items.filter((i) => i.severity === 'recommended').length;
  const satisfiedRecommendedCount = items.filter((i) => i.severity === 'recommended' && i.isSatisfied).length;

  let calculatedScore = 15;
  if (totalRequired > 0) {
    calculatedScore += Math.round((satisfiedRequiredCount / totalRequired) * 55);
  }
  if (totalRecommended > 0) {
    calculatedScore += Math.round((satisfiedRecommendedCount / totalRecommended) * 30);
  }

  // Cap at 100
  const score = Math.min(100, Math.max(15, calculatedScore));

  return {
    score,
    isPublishable,
    missingRequired,
    recommendedImprovements,
    optionalItems,
    sections
  };
}

/**
 * Intelligently determines the best step to resume an in-progress draft.
 * Inspects section completeness from Step 1 to 9; returns the first step
 * with missing required or unconfigured fields, or defaults to Step 10 (Review)
 * if all required sections are satisfied.
 */
export function determineNextIncompleteStep(property: Property): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 {
  const result = evaluateListingCompleteness(property);

  // If there are missing required items, navigate directly to the earliest one
  if (result.missingRequired.length > 0) {
    const earliestStep = Math.min(...result.missingRequired.map((i) => i.stepNumber));
    if (earliestStep >= 1 && earliestStep <= 10) {
      return earliestStep as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    }
  }

  // If all required items are satisfied, check if any recommended section has 0 data configured:
  // Check amenities
  if (!property.amenities || (property.amenities.length === 0 && (!property.customAmenities || property.customAmenities.length === 0))) {
    return 6;
  }

  // Check house rules
  if (!property.rules || (
    (!property.rules.suitableFor || property.rules.suitableFor.length === 0) &&
    (!property.rules.guestPolicy || property.rules.guestPolicy === 'not_specified') &&
    (!property.rules.customRules || property.rules.customRules.length === 0)
  )) {
    return 9;
  }

  // If everything is populated or publishable, resume to Step 10 (Review & Publishing)
  return 10;
}

