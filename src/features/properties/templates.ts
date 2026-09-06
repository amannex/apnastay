// ============================================================================
// APNASTAY PROPERTY ENGINE — PROPERTY TEMPLATES REGISTRY
// Declarative configuration for all property types without separate silos
// ============================================================================

import type { PropertyType, PropertyTemplate, RentalStructure } from './types';

export const PROPERTY_TEMPLATES: Record<PropertyType, PropertyTemplate> = {
  house: {
    id: 'house',
    label: 'Independent House',
    description: 'Standalone residential bungalow or house for family or private living.',
    structure: 'single_unit',
    defaultRentalStructure: 'entire_property',
    allowedRentalStructures: ['entire_property'],
    unitTerminology: {
      singular: 'Property',
      plural: 'Properties',
      placeholder: 'Entire House'
    },
    hasUnits: false,
    hasBeds: false,
    suggestedAmenities: [
      'Private Garden',
      'Dedicated Car Parking',
      '100% Power Backup',
      'Water Storage Tank',
      'Pet Friendly',
      'Solar Water Heater'
    ]
  },

  apartment: {
    id: 'apartment',
    label: 'Apartment / Flat',
    description: 'Residential flat or multi-flat gated society offering modern amenities.',
    structure: 'multi_unit',
    defaultRentalStructure: 'individual_unit',
    allowedRentalStructures: ['individual_unit', 'entire_property', 'multiple_units'],
    unitTerminology: {
      singular: 'Flat',
      plural: 'Flats',
      placeholder: 'Flat 302, Tower B'
    },
    hasUnits: true,
    hasBeds: false,
    suggestedAmenities: [
      'High-Speed Elevator',
      'Gated Society Security (24/7)',
      'Clubhouse & Gym',
      'Intercom Facility',
      'Swimming Pool',
      'Covered Parking'
    ]
  },

  villa: {
    id: 'villa',
    label: 'Luxury Villa',
    description: 'High-end detached luxury residence with private amenities and grounds.',
    structure: 'single_unit',
    defaultRentalStructure: 'entire_property',
    allowedRentalStructures: ['entire_property'],
    unitTerminology: {
      singular: 'Villa',
      plural: 'Villas',
      placeholder: 'Villa No. 12'
    },
    hasUnits: false,
    hasBeds: false,
    suggestedAmenities: [
      'Private Swimming Pool',
      'Landscaped Lawn',
      'Servant Quarters',
      'Smart Home Automation',
      'Multiple Car Port',
      'Private Terrace'
    ]
  },

  pg: {
    id: 'pg',
    label: 'Paying Guest (PG)',
    description: 'Managed accommodation with shared or private rooms, meals, and utilities.',
    structure: 'rooms_beds',
    defaultRentalStructure: 'individual_bed',
    allowedRentalStructures: ['individual_bed', 'individual_room'],
    unitTerminology: {
      singular: 'Room',
      plural: 'Rooms',
      placeholder: 'Room 101'
    },
    hasUnits: true,
    hasBeds: true,
    suggestedAmenities: [
      'Daily Hygienic Meals (Breakfast/Dinner)',
      'High-Speed Wi-Fi (300+ Mbps)',
      'Bi-Weekly Housekeeping',
      'RO Drinking Water',
      'Washing Machine & Laundry Area',
      'CCTV Surveillance (Common Areas)',
      'Geyser in Bathrooms'
    ]
  },

  hostel: {
    id: 'hostel',
    label: 'Student / Professional Hostel',
    description: 'Community living with high-capacity dorms, study halls, and dining facilities.',
    structure: 'rooms_beds',
    defaultRentalStructure: 'individual_bed',
    allowedRentalStructures: ['individual_bed', 'individual_room'],
    unitTerminology: {
      singular: 'Dorm / Room',
      plural: 'Dorms / Rooms',
      placeholder: 'Room 204'
    },
    hasUnits: true,
    hasBeds: true,
    suggestedAmenities: [
      'Mess & Dining Hall',
      'Quiet Study Room / Library',
      'High-Speed Wi-Fi',
      'Locker & Wardrobe',
      'Biometric / Smart-Card Entry',
      'Warden & Security',
      'Recreation Room'
    ]
  },

  coliving: {
    id: 'coliving',
    label: 'Modern Co-Living',
    description: 'Designer community living with private suites, shared lounges, and social events.',
    structure: 'rooms_beds',
    defaultRentalStructure: 'individual_room',
    allowedRentalStructures: ['individual_room', 'individual_bed'],
    unitTerminology: {
      singular: 'Studio / Room',
      plural: 'Studios / Rooms',
      placeholder: 'Suite 4A'
    },
    hasUnits: true,
    hasBeds: true,
    suggestedAmenities: [
      'Ergonomic WFH Desk & Chair',
      'Coworking Lounge & High-Speed Fiber',
      'Community Events & Game Zone',
      'Fully Equipped Shared Kitchen',
      'Housekeeping & Linen Change',
      'NFC Smart-Lock Keyless Entry'
    ]
  },

  building: {
    id: 'building',
    label: 'Entire Building / Commercial Complex',
    description: 'Standalone building comprising multiple commercial or residential units.',
    structure: 'multi_unit',
    defaultRentalStructure: 'multiple_units',
    allowedRentalStructures: ['multiple_units', 'individual_unit'],
    unitTerminology: {
      singular: 'Unit / Floor',
      plural: 'Units / Floors',
      placeholder: 'Unit 101'
    },
    hasUnits: true,
    hasBeds: false,
    suggestedAmenities: [
      'High Capacity Elevator',
      'Fire Safety Compliance',
      'Dedicated Transformer / Power Backup',
      'Basement Parking',
      'Security Cabin'
    ]
  },

  independent_floor: {
    id: 'independent_floor',
    label: 'Independent Floor / Builder Floor',
    description: 'Dedicated single floor in a low-rise residential building with private entrance.',
    structure: 'single_unit',
    defaultRentalStructure: 'entire_property',
    allowedRentalStructures: ['entire_property'],
    unitTerminology: {
      singular: 'Floor',
      plural: 'Floors',
      placeholder: '2nd Floor'
    },
    hasUnits: false,
    hasBeds: false,
    suggestedAmenities: [
      'Private Lift Access',
      'Dedicated Car Stilt Parking',
      'Separate Water Meter',
      'Power Inverter Backup',
      'Modular Kitchen'
    ]
  },

  room: {
    id: 'room',
    label: 'Single Room / Studio',
    description: 'Independent single room or 1RK studio unit with private or shared bath.',
    structure: 'single_unit',
    defaultRentalStructure: 'individual_room',
    allowedRentalStructures: ['individual_room', 'entire_property'],
    unitTerminology: {
      singular: 'Room',
      plural: 'Rooms',
      placeholder: 'Studio 1'
    },
    hasUnits: false,
    hasBeds: false,
    suggestedAmenities: [
      'Attached Bathroom',
      'Wi-Fi Included',
      'Geyser',
      'Wardrobe',
      'Balcony Access'
    ]
  },

  other: {
    id: 'other',
    label: 'Other / Custom Property',
    description: 'Worker accommodations, homestays, service apartments, or custom formats.',
    structure: 'custom',
    defaultRentalStructure: 'entire_property',
    allowedRentalStructures: [
      'entire_property',
      'individual_unit',
      'individual_room',
      'individual_bed',
      'multiple_units'
    ],
    unitTerminology: {
      singular: 'Unit',
      plural: 'Units',
      placeholder: 'Unit 1'
    },
    hasUnits: true,
    hasBeds: true,
    suggestedAmenities: [
      '24/7 Water Supply',
      'Power Backup',
      'Wi-Fi',
      'Security'
    ]
  }
};

/**
 * Retrieve the configuration template for a property type.
 * Falls back to 'other' template if type is unrecognized.
 */
export function getPropertyTemplate(type: PropertyType): PropertyTemplate {
  return PROPERTY_TEMPLATES[type] || PROPERTY_TEMPLATES.other;
}

/**
 * Return all registered property templates in presentation order.
 */
export function getAllPropertyTemplates(): PropertyTemplate[] {
  return Object.values(PROPERTY_TEMPLATES);
}

/**
 * Verify if the rental structure is compatible with the selected property type.
 */
export function validateStructureForTemplate(type: PropertyType, structure: RentalStructure): boolean {
  const template = getPropertyTemplate(type);
  return template.allowedRentalStructures.includes(structure);
}
