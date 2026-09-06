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

  commercial: {
    id: 'commercial',
    label: 'Commercial Property / Office',
    description: 'Offices, retail shops, co-working studios, or commercial floors.',
    structure: 'multi_unit',
    defaultRentalStructure: 'individual_unit',
    allowedRentalStructures: ['individual_unit', 'multiple_units', 'entire_property'],
    unitTerminology: {
      singular: 'Office / Unit',
      plural: 'Offices / Units',
      placeholder: 'Unit 201'
    },
    hasUnits: true,
    hasBeds: false,
    suggestedAmenities: [
      'High-Speed Commercial Fiber',
      'Central Air Conditioning',
      '24/7 Power Backup',
      'Conference Rooms',
      'Security & Access Control',
      'Basement Parking'
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

// ----------------------------------------------------------------------------
// Basic Details Dynamic Fields Configuration
// ----------------------------------------------------------------------------
export interface PropertyBasicFieldsConfig {
  titleLabel: string;
  titlePlaceholder: string;
  titleHelp?: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  descriptionHelp: string;
  priceLabel: string;
  pricePlaceholder: string;
  priceHelp: string;
  availabilityLabel: string;
  availabilityHelp: string;
}

/**
 * Returns dynamic field labels, placeholders, and guidance for Phase 3 Basic Property Details.
 * Driven entirely by template registry and rental structure.
 */
export function getBasicFieldsConfig(
  type: PropertyType,
  structure: RentalStructure,
  customType?: string
): PropertyBasicFieldsConfig {
  switch (type) {
    case 'pg':
      return {
        titleLabel: 'PG Name / Property Title',
        titlePlaceholder: 'e.g., Green Valley PG, Stanza Living Delhi',
        titleHelp: 'A clear, recognizable name that students and working professionals will search for.',
        descriptionLabel: 'Property Description',
        descriptionPlaceholder: 'Tell tenants about food/meals provided, Wi-Fi speed, housekeeping, nearby colleges or tech parks, and general house culture.',
        descriptionHelp: 'A warm, honest description helps you attract reliable, long-term tenants.',
        priceLabel: structure === 'individual_bed' ? 'Starting Rent per Bed (Monthly)' : 'Starting Rent per Room (Monthly)',
        pricePlaceholder: 'e.g., 7500',
        priceHelp: 'Starting monthly rent. You will be able to set specific pricing for single, double, or triple sharing rooms in later steps.',
        availabilityLabel: 'When is this PG available for move-in?',
        availabilityHelp: 'Let potential residents know whether they can move in immediately or from an upcoming date.'
      };

    case 'hostel':
      return {
        titleLabel: 'Hostel Name',
        titlePlaceholder: 'e.g., Sunshine Boys & Girls Hostel, Oxford Student Living',
        titleHelp: 'Hostel name recognizable to students, parents, and working professionals.',
        descriptionLabel: 'Hostel Description',
        descriptionPlaceholder: 'Describe hostel facilities, mess timings, study areas, biometric security, and commute to nearby colleges.',
        descriptionHelp: 'Clear details help parents and students feel confident about booking.',
        priceLabel: 'Starting Rent per Bed / Room (Monthly)',
        pricePlaceholder: 'e.g., 6500',
        priceHelp: 'Base starting rent per month. Room-wise and sharing-wise pricing will be configured later.',
        availabilityLabel: 'When is this hostel accepting new admissions/residents?',
        availabilityHelp: 'Specify immediate availability or start date for the upcoming academic session.'
      };

    case 'coliving':
      return {
        titleLabel: 'Co-Living Property Name',
        titlePlaceholder: 'e.g., UrbanNest Co-Living, Sector 62',
        titleHelp: 'Brand name or community title for your modern shared living property.',
        descriptionLabel: 'Community & Property Description',
        descriptionPlaceholder: 'Highlight modern amenities, community events, quiet work corners, high-speed Wi-Fi, and neighborhood vibe.',
        descriptionHelp: 'Emphasize community, convenience, and lifestyle benefits.',
        priceLabel: 'Starting Monthly Rent',
        pricePlaceholder: 'e.g., 12000',
        priceHelp: 'Base starting monthly package. Detailed inclusions will be refined in upcoming steps.',
        availabilityLabel: 'When can new members move in?',
        availabilityHelp: 'Indicate whether spaces are ready right now or scheduled for a specific date.'
      };

    case 'apartment':
      return {
        titleLabel: 'Apartment / Flat Name',
        titlePlaceholder: 'e.g., 2 BHK Flat in Greater Noida, Gaur City 2',
        titleHelp: 'Mention key highlights such as BHK configuration, society name, or tower.',
        descriptionLabel: 'Flat & Society Description',
        descriptionPlaceholder: 'Describe flat interiors, balcony view, society security, clubhouse access, and walking distance to metro/markets.',
        descriptionHelp: 'Tenants appreciate honest details about light, ventilation, and family-friendly society perks.',
        priceLabel: structure === 'multiple_units' ? 'Starting Rent per Unit (Monthly)' : 'Monthly Rent',
        pricePlaceholder: 'e.g., 18000',
        priceHelp: structure === 'multiple_units' ? 'Starting rent across the available flats in this project.' : 'Total monthly rent for this flat.',
        availabilityLabel: 'When is this flat available for rent?',
        availabilityHelp: 'Specify if the flat is vacant and ready today or when the current lease concludes.'
      };

    case 'house':
      return {
        titleLabel: 'Property Name / House Title',
        titlePlaceholder: 'e.g., Independent House near Pari Chowk',
        titleHelp: 'Give your house an attractive, clear title including location or landmark.',
        descriptionLabel: 'Property Description',
        descriptionPlaceholder: 'Describe the house layout, private parking, neighborhood peacefulness, nearby markets, and accessibility.',
        descriptionHelp: 'Families and executives look for privacy, safety, and neighborhood convenience.',
        priceLabel: 'Monthly Rent',
        pricePlaceholder: 'e.g., 25000',
        priceHelp: 'Total monthly rental amount for the entire house.',
        availabilityLabel: 'When is this house available for move-in?',
        availabilityHelp: 'Specify when new tenants can take possession.'
      };

    case 'villa':
      return {
        titleLabel: 'Villa Name / Estate Title',
        titlePlaceholder: 'e.g., Royal Palms Luxury Villa, Jaypee Greens',
        titleHelp: 'Prestigious name highlighting luxury, privacy, and upscale living.',
        descriptionLabel: 'Villa & Grounds Description',
        descriptionPlaceholder: 'Describe the private lawn, luxury fixtures, servant quarters, swimming pool access, and premium gated security.',
        descriptionHelp: 'Showcase architectural highlights, privacy, and luxury lifestyle features.',
        priceLabel: 'Monthly Rent',
        pricePlaceholder: 'e.g., 65000',
        priceHelp: 'Monthly rental lease amount.',
        availabilityLabel: 'When is this villa ready for occupancy?',
        availabilityHelp: 'Specify immediate availability or private handover date.'
      };

    case 'building':
      return {
        titleLabel: 'Building / Complex Name',
        titlePlaceholder: 'e.g., Sunrise Residency, Multi-Unit Complex',
        titleHelp: 'Name of the building or residential complex.',
        descriptionLabel: 'Building Overview & Description',
        descriptionPlaceholder: 'Describe total floors, elevator facility, parking capacity, 100% power backup, and commercial/residential suitability.',
        descriptionHelp: 'Detail total capacity, security features, and central facilities.',
        priceLabel: structure === 'entire_property' ? 'Monthly Lease / Rent' : 'Starting Rent per Unit (Monthly)',
        pricePlaceholder: 'e.g., 45000',
        priceHelp: 'Starting monthly rental expectation.',
        availabilityLabel: 'When is this building ready for lease?',
        availabilityHelp: 'Specify immediate handover or phased availability.'
      };

    case 'independent_floor':
      return {
        titleLabel: 'Independent Floor Title',
        titlePlaceholder: 'e.g., 1st Floor Builder Apartment with Terrace Access',
        titleHelp: 'Specify the floor level and key exclusive benefits (terrace, elevator, stilt parking).',
        descriptionLabel: 'Floor Description',
        descriptionPlaceholder: 'Describe floor layout, private balcony, dedicated parking, safety grills, and proximity to neighborhood parks.',
        descriptionHelp: 'Highlight private access and low-density living benefits.',
        priceLabel: 'Monthly Rent',
        pricePlaceholder: 'e.g., 22000',
        priceHelp: 'Monthly rental amount for this independent floor.',
        availabilityLabel: 'When is this floor available for move-in?',
        availabilityHelp: 'Indicate whether it is vacant now or ready from a future date.'
      };

    case 'room':
      return {
        titleLabel: 'Room / Studio Title',
        titlePlaceholder: 'e.g., Furnished Studio Room near Cyber City',
        titleHelp: 'Clear title describing the room and key location.',
        descriptionLabel: 'Room Description',
        descriptionPlaceholder: 'Describe attached bathroom, furnishings, private balcony, shared kitchen access, and included utilities.',
        descriptionHelp: 'Single professionals look for convenience, quiet study/work space, and clean fixtures.',
        priceLabel: 'Monthly Rent',
        pricePlaceholder: 'e.g., 10000',
        priceHelp: 'Monthly rent for the room.',
        availabilityLabel: 'When is this room available?',
        availabilityHelp: 'Specify move-in readiness.'
      };

    case 'commercial':
      return {
        titleLabel: 'Commercial Property / Office Name',
        titlePlaceholder: 'e.g., Prime Office Space in Sector 18, Commercial Floor',
        titleHelp: 'Title stating the commercial nature, frontage, or office park.',
        descriptionLabel: 'Commercial Space Description',
        descriptionPlaceholder: 'Describe super area, carpet area, road frontage, power backup, passenger and goods elevator, and parking bays.',
        descriptionHelp: 'Businesses and corporate tenants need exact technical and accessibility highlights.',
        priceLabel: 'Monthly Rent / Lease',
        pricePlaceholder: 'e.g., 35000',
        priceHelp: 'Base monthly rent or lease for the commercial space.',
        availabilityLabel: 'When is this space available for commercial lease?',
        availabilityHelp: 'Specify fit-out readiness or immediate possession date.'
      };

    case 'other':
    default: {
      const displayType = customType ? customType.trim() : 'Property';
      return {
        titleLabel: `${displayType} Name / Title`,
        titlePlaceholder: `e.g., Prime ${displayType} near Central Market`,
        titleHelp: 'A descriptive title that informs tenants about what this unique rental offers.',
        descriptionLabel: 'Property Description',
        descriptionPlaceholder: 'Describe the key highlights, facilities, accessibility, and ideal guests or tenants for this property.',
        descriptionHelp: 'Clear details help set proper expectations for interested renters.',
        priceLabel: 'Starting Monthly Rent',
        pricePlaceholder: 'e.g., 15000',
        priceHelp: 'Base monthly rent required to list your property.',
        availabilityLabel: 'When is this property available for rent?',
        availabilityHelp: 'Specify when tenants or guests can begin their stay.'
      };
    }
  }
}
