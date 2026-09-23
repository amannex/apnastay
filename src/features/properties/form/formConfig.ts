// ============================================================================
// APNASTAY PROPERTY FORM — REUSABLE WIZARD & STEP CONFIGURATION
// Multi-mode architecture (create, edit, resume_draft, review) with
// property-type & rental-structure conditional step applicability.
// ============================================================================

import type { Property, PropertyType, RentalStructure, PropertyStatus } from '../types';
import { getPropertyTemplate } from '../templates';

export type PropertyFormMode = 'create' | 'edit' | 'resume_draft' | 'review';

export interface PropertyWizardStepDefinition {
  stepNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  key: string;
  title: string;
  shortLabel: string;
  description: string;
  /**
   * Determine whether this step is applicable given the current property type and rental structure.
   */
  isApplicable: (propertyType: PropertyType | null, rentalStructure: RentalStructure | null) => boolean;
  /**
   * Quick check whether this step's required information is completed.
   */
  isCompleted: (property: Partial<Property>) => boolean;
}

export const WIZARD_STEPS: PropertyWizardStepDefinition[] = [
  {
    stepNumber: 1,
    key: 'property_type',
    title: 'Property Format & Type',
    shortLabel: 'Format',
    description: 'Select whether this is an apartment, house, PG, hostel, villa, or commercial property.',
    isApplicable: () => true,
    isCompleted: (p) => Boolean(p.propertyType)
  },
  {
    stepNumber: 2,
    key: 'rental_structure',
    title: 'Rental Model & Structure',
    shortLabel: 'Model',
    description: 'Choose whether you rent the entire property, individual flats, private rooms, or shared beds.',
    isApplicable: (type) => Boolean(type),
    isCompleted: (p) => Boolean(p.rentalStructure)
  },
  {
    stepNumber: 3,
    key: 'location',
    title: 'Location & Address',
    shortLabel: 'Location',
    description: 'Specify the street address, locality, city, postal code, and optional map coordinates.',
    isApplicable: () => true,
    isCompleted: (p) => Boolean(p.location?.city && (p.location?.addressLine1 || p.location?.address) && p.location?.pincode)
  },
  {
    stepNumber: 4,
    key: 'basic_details',
    title: 'Basic Details & Floor Plan',
    shortLabel: 'Basics',
    description: 'Share guest capacity, rooms, beds, bathrooms, and title description.',
    isApplicable: () => true,
    isCompleted: (p) => Boolean(p.title && p.title.trim().length >= 5 && p.description && p.description.trim().length >= 10)
  },
  {
    stepNumber: 5,
    key: 'amenities',
    title: 'Amenities & Features',
    shortLabel: 'Amenities',
    description: 'Select curated amenities (Wi-Fi, parking, power backup) or add custom perks.',
    isApplicable: () => true,
    isCompleted: (p) => Boolean((p.amenities && p.amenities.length > 0) || (p.customAmenities && p.customAmenities.length > 0))
  },
  {
    stepNumber: 6,
    key: 'photos',
    title: 'Photos & Optional Video',
    shortLabel: 'Photos',
    description: 'Upload high quality photos and an optional video tour of your space.',
    isApplicable: () => true,
    isCompleted: (p) => Boolean(p.photos && p.photos.length >= 5)
  },
  {
    stepNumber: 7,
    key: 'who_can_stay',
    title: 'Who Can Stay Here',
    shortLabel: 'Residents',
    description: 'Set who is welcome to stay and specify your key resident preferences and age requirements.',
    isApplicable: () => true,
    isCompleted: (p) => Boolean(p.rules?.suitableFor && p.rules.suitableFor.length > 0)
  },
  {
    stepNumber: 8,
    key: 'rules_stay_terms',
    title: 'Rules & Stay Terms',
    shortLabel: 'Rules',
    description: 'Set house rules on smoking, alcohol, visitors, pets, quiet hours, parties, and cooking.',
    isApplicable: () => true,
    isCompleted: (p) => Boolean(p.rules?.smokingRule || p.rules?.alcoholRule || p.rules?.visitorsRule)
  },
  {
    stepNumber: 9,
    key: 'pricing',
    title: 'Pricing & Move-in Availability',
    shortLabel: 'Pricing',
    description: 'Define monthly rent, security deposit, maintenance terms, and move-in availability.',
    isApplicable: () => true,
    isCompleted: (p) => {
      const hasRent = Boolean((p.pricing?.monthlyRent && p.pricing.monthlyRent > 0) || p.pricing?.pricingMode === 'on_request');
      const hasAvail = Boolean(p.availability?.type);
      return hasRent && hasAvail;
    }
  },
  {
    stepNumber: 10,
    key: 'review',
    title: 'Review & Publishing',
    shortLabel: 'Review',
    description: 'Review your complete listing audit, verify completeness, and publish live.',
    isApplicable: () => true,
    isCompleted: (p) => p.status === 'published'
  }
];

/**
 * Get all steps applicable to a specific property configuration.
 */
export function getApplicableSteps(
  propertyType: PropertyType | null,
  rentalStructure: RentalStructure | null
): PropertyWizardStepDefinition[] {
  return WIZARD_STEPS.filter((step) => step.isApplicable(propertyType, rentalStructure));
}

/**
 * Check if a specific step number is applicable for the given type/structure.
 */
export function isStepApplicable(
  stepNumber: number,
  propertyType: PropertyType | null,
  rentalStructure: RentalStructure | null
): boolean {
  const def = WIZARD_STEPS.find((s) => s.stepNumber === stepNumber);
  if (!def) return false;
  return def.isApplicable(propertyType, rentalStructure);
}
