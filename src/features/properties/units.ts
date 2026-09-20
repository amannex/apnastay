// ============================================================================
// APNASTAY PROPERTY ENGINE — UNITS, ROOMS & BEDS HELPER (PHASE 7)
// Dynamic terminology, availability resolution, and bulk generation logic
// ============================================================================

import type {
  PropertyType,
  RentalStructure,
  PropertyUnit,
  PropertyBed,
  UnitStatus,
  BedStatus
} from './types';
import { getPropertyTemplate } from './templates';

export interface UnitTerminology {
  singular: string;
  plural: string;
  placeholder: string;
  addLabel: string;
  bulkLabel: string;
  defaultUnitTypes: string[];
  hasBeds: boolean;
  isSkippable: boolean;
  skipMessage: string;
}

/**
 * Common unit types per property archetype
 */
const DEFAULT_TYPES_MAP: Record<string, string[]> = {
  apartment: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Studio', 'Penthouse', 'Serviced Flat'],
  building: ['1 BHK', '2 BHK', '3 BHK', 'Office Suite', 'Shop / Commercial Unit'],
  pg: ['Single Room', 'Double Sharing', 'Triple Sharing', 'Four Sharing', 'Dormitory'],
  hostel: ['Single Room', 'Double Sharing', 'Triple Sharing', '4-Bed Dorm', '6-Bed Dorm', '8-Bed Dorm'],
  coliving: ['Private Studio', 'Twin Suite (Double)', 'Shared Room', 'Executive Suite'],
  independent_floor: ['1st Floor', '2nd Floor', '3rd Floor', 'Ground Floor', 'Basement Floor'],
  room: ['Standard Room', 'Deluxe Room', 'Studio with Balcony'],
  commercial: ['Retail Shop', 'Private Office', 'Shared Desk Space', 'Entire Floor'],
  house: ['Entire Ground Floor', 'First Floor Suite', 'Guest Annex', 'Studio Room'],
  villa: ['Master Villa Suite', 'Guest Annex', 'Poolside Villa Unit'],
  other: ['Standard Space', 'Dedicated Unit', 'Studio Space']
};

/**
 * Retrieve dynamic terminology tailored to the property type and rental model.
 * Adheres strictly to the principle that owners never see the generic word "Unit"
 * unless appropriate for generic properties.
 */
export function getUnitTerminology(
  propertyType?: PropertyType | null,
  rentalStructure?: RentalStructure | null
): UnitTerminology {
  const type = propertyType || 'apartment';
  const template = getPropertyTemplate(type);

  // Check if property is rented as a whole (House, Villa, or entire apartment)
  const isEntireProperty =
    rentalStructure === 'entire_property' || template.structure === 'single_unit';

  let singular = template.unitTerminology.singular;
  let plural = template.unitTerminology.plural;
  let placeholder = template.unitTerminology.placeholder;

  // Custom adjustments for specific combinations
  if (type === 'apartment' || type === 'building') {
    singular = 'Flat';
    plural = 'Flats';
    placeholder = 'Flat 101';
  } else if (type === 'pg') {
    singular = 'Room';
    plural = 'Rooms';
    placeholder = 'Room 101';
  } else if (type === 'hostel') {
    singular = 'Room';
    plural = 'Rooms';
    placeholder = 'Room 201';
  } else if (type === 'coliving' || type === 'co_living') {
    singular = 'Studio / Room';
    plural = 'Studios / Rooms';
    placeholder = 'Studio 101';
  } else if (type === 'independent_floor' || type === 'builder_floor') {
    singular = 'Floor';
    plural = 'Floors';
    placeholder = '1st Floor (Unit A)';
  } else if (type === 'commercial') {
    singular = 'Space / Office';
    plural = 'Spaces / Offices';
    placeholder = 'Office 301';
  } else if (type === 'house' || type === 'villa' || type === 'independent_house') {
    singular = 'Unit / Space';
    plural = 'Units / Spaces';
    placeholder = 'Ground Floor Suite';
  } else if (type === 'bed_space') {
    singular = 'Bed Space';
    plural = 'Bed Spaces';
    placeholder = 'Bed A';
  }

  // Properties that support beds inside rooms
  const hasBeds =
    template.hasBeds ||
    type === 'pg' ||
    type === 'hostel' ||
    type === 'coliving' ||
    type === 'co_living' ||
    type === 'bed_space' ||
    rentalStructure === 'individual_bed';

  const defaultUnitTypes = DEFAULT_TYPES_MAP[type] || DEFAULT_TYPES_MAP.other;

  const skipMessage = isEntireProperty
    ? `This property is listed as an ${template.label} rented in its entirety. You can safely skip adding separate ${plural.toLowerCase()} unless you want to describe individual sections.`
    : `You can skip this step if your property does not contain individually rentable ${plural.toLowerCase()}.`;

  return {
    singular,
    plural,
    placeholder,
    addLabel: `+ Add ${singular}`,
    bulkLabel: `Add Multiple ${plural}`,
    defaultUnitTypes,
    hasBeds,
    isSkippable: isEntireProperty,
    skipMessage
  };
}

/**
 * Calculate dynamic unit availability status based on bed occupancy or manual status.
 */
export function calculateUnitAvailability(
  unit: PropertyUnit
): 'available' | 'partially_occupied' | 'occupied' | 'under_maintenance' {
  if (unit.status === 'under_maintenance' || unit.availability === 'under_maintenance') {
    return 'under_maintenance';
  }

  // If unit has beds, availability is determined by bed occupancy
  if (unit.beds && unit.beds.length > 0) {
    const totalBeds = unit.beds.length;
    const occupiedCount = unit.beds.filter(
      (b) => b.availability === 'occupied' || b.status === 'occupied'
    ).length;

    if (occupiedCount === 0) {
      return 'available';
    }
    if (occupiedCount === totalBeds) {
      return 'occupied';
    }
    return 'partially_occupied';
  }

  return (unit.availability as any) || 'available';
}

/**
 * Intelligently generate the next sequential unit number/name
 * (e.g., "Room 101" -> "Room 102", "Flat 4" -> "Flat 5").
 */
export function getNextUnitNumber(
  existingUnits: PropertyUnit[],
  prefix: string = 'Unit'
): string {
  if (!existingUnits || existingUnits.length === 0) {
    return `${prefix} 101`;
  }

  // Find max numeric suffix in existing names
  let maxNum = 100;
  let foundNumeric = false;

  for (const u of existingUnits) {
    const match = u.nameOrNumber.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
        foundNumeric = true;
      }
    }
  }

  if (foundNumeric) {
    return `${prefix} ${maxNum + 1}`;
  }

  return `${prefix} ${existingUnits.length + 1}`;
}

/**
 * Generate lightweight auto-generated beds for a room
 * (e.g. 2 beds -> Bed A, Bed B).
 */
export function generateInitialBeds(
  count: number,
  unitId: string,
  monthlyRent: number = 0,
  securityDeposit: number = 0
): PropertyBed[] {
  const now = new Date().toISOString();
  const beds: PropertyBed[] = [];

  for (let i = 0; i < count; i++) {
    const label = count <= 26 ? `Bed ${String.fromCharCode(65 + i)}` : `Bed ${i + 1}`;
    const bedId = `bed_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}_${i}`;

    beds.push({
      id: bedId,
      unitId,
      label,
      bedType: 'single',
      availability: 'available',
      status: 'available',
      pricing: {
        monthlyRent,
        securityDeposit
      },
      createdAt: now,
      updatedAt: now
    });
  }

  return beds;
}

// ----------------------------------------------------------------------------
// Substep 5: Accommodation Structure Helpers
// ----------------------------------------------------------------------------

export interface AccommodationTypeOption {
  value: string;
  label: string;
  defaultCapacity: number;
  occupancyModel?: 'private' | 'shared' | 'entire';
  description?: string;
}

export function getAccommodationTypeOptions(
  propertyType?: PropertyType | null,
  rentalStructure?: RentalStructure | null
): AccommodationTypeOption[] {
  const type = propertyType || 'apartment';

  if (type === 'pg') {
    return [
      { value: 'Private room', label: 'Private room', defaultCapacity: 1, occupancyModel: 'private', description: 'Single occupancy private room' },
      { value: '2 sharing', label: '2 sharing', defaultCapacity: 2, occupancyModel: 'shared', description: 'Twin sharing room for 2 people' },
      { value: '3 sharing', label: '3 sharing', defaultCapacity: 3, occupancyModel: 'shared', description: 'Triple sharing room for 3 people' },
      { value: '4 sharing', label: '4 sharing', defaultCapacity: 4, occupancyModel: 'shared', description: 'Four sharing room for 4 people' },
      { value: '5+ sharing', label: '5+ sharing', defaultCapacity: 5, occupancyModel: 'shared', description: 'Spacious shared room or dorm' }
    ];
  }

  if (type === 'hostel') {
    return [
      { value: 'Private room', label: 'Private room', defaultCapacity: 1, occupancyModel: 'private', description: 'Single occupancy room' },
      { value: '2 sharing', label: '2 sharing', defaultCapacity: 2, occupancyModel: 'shared', description: 'Twin sharing room' },
      { value: '3 sharing', label: '3 sharing', defaultCapacity: 3, occupancyModel: 'shared', description: 'Triple sharing room' },
      { value: '4-bed dorm', label: '4-bed dorm', defaultCapacity: 4, occupancyModel: 'shared', description: '4 beds in dormitory' },
      { value: '6-bed dorm', label: '6-bed dorm', defaultCapacity: 6, occupancyModel: 'shared', description: '6 beds in dormitory' },
      { value: '8-bed dorm', label: '8-bed dorm', defaultCapacity: 8, occupancyModel: 'shared', description: '8 beds in dormitory' }
    ];
  }

  if (type === 'co_living' || type === 'coliving') {
    return [
      { value: 'Private studio', label: 'Private studio', defaultCapacity: 1, occupancyModel: 'private', description: 'Self-contained private studio' },
      { value: 'Twin sharing', label: 'Twin sharing', defaultCapacity: 2, occupancyModel: 'shared', description: 'Room shared with one roommate' },
      { value: 'Triple sharing', label: 'Triple sharing', defaultCapacity: 3, occupancyModel: 'shared', description: 'Room shared with two roommates' },
      { value: 'Executive suite', label: 'Executive suite', defaultCapacity: 2, occupancyModel: 'private', description: 'Premium private suite' }
    ];
  }

  if (type === 'apartment' || type === 'builder_floor' || type === 'independent_floor' || type === 'independent_house' || type === 'house' || type === 'villa') {
    if (rentalStructure === 'entire_property') {
      return [
        { value: '1 BHK', label: '1 BHK', defaultCapacity: 2, occupancyModel: 'entire', description: '1 Bedroom, Hall & Kitchen' },
        { value: '2 BHK', label: '2 BHK', defaultCapacity: 4, occupancyModel: 'entire', description: '2 Bedrooms, Hall & Kitchen' },
        { value: '3 BHK', label: '3 BHK', defaultCapacity: 6, occupancyModel: 'entire', description: '3 Bedrooms, Hall & Kitchen' },
        { value: '4 BHK', label: '4 BHK', defaultCapacity: 8, occupancyModel: 'entire', description: '4+ Bedrooms, Hall & Kitchen' },
        { value: 'Studio', label: 'Studio Apartment', defaultCapacity: 1, occupancyModel: 'entire', description: 'Open plan studio flat' },
        { value: 'Penthouse', label: 'Penthouse', defaultCapacity: 6, occupancyModel: 'entire', description: 'Top floor penthouse suite' }
      ];
    }
    return [
      { value: '1 BHK', label: '1 BHK', defaultCapacity: 2, occupancyModel: 'entire', description: '1 Bedroom, Hall & Kitchen unit' },
      { value: '2 BHK', label: '2 BHK', defaultCapacity: 4, occupancyModel: 'entire', description: '2 Bedrooms, Hall & Kitchen unit' },
      { value: '3 BHK', label: '3 BHK', defaultCapacity: 6, occupancyModel: 'entire', description: '3 Bedrooms, Hall & Kitchen unit' },
      { value: 'Private room', label: 'Private room', defaultCapacity: 1, occupancyModel: 'private', description: 'Private bedroom inside flat' },
      { value: 'Shared room', label: 'Shared room', defaultCapacity: 2, occupancyModel: 'shared', description: 'Shared bedroom inside flat' },
      { value: 'Studio', label: 'Studio Unit', defaultCapacity: 1, occupancyModel: 'entire', description: 'Self-contained studio flat' }
    ];
  }

  if (type === 'room') {
    return [
      { value: 'Standard room', label: 'Standard room', defaultCapacity: 1, occupancyModel: 'private', description: 'Standard private room' },
      { value: 'Deluxe room', label: 'Deluxe room', defaultCapacity: 2, occupancyModel: 'private', description: 'Deluxe private room' },
      { value: 'Single room', label: 'Single room', defaultCapacity: 1, occupancyModel: 'private', description: 'Single occupancy room' },
      { value: 'Room with balcony', label: 'Room with balcony', defaultCapacity: 2, occupancyModel: 'private', description: 'Room with private balcony' },
      { value: 'Shared room', label: 'Shared room', defaultCapacity: 2, occupancyModel: 'shared', description: 'Shared room for multiple tenants' }
    ];
  }

  if (type === 'bed_space') {
    return [
      { value: 'Single bed', label: 'Single bed', defaultCapacity: 1, occupancyModel: 'shared', description: 'Single bed in shared space' },
      { value: 'Lower bunk', label: 'Lower bunk', defaultCapacity: 1, occupancyModel: 'shared', description: 'Lower tier bunk bed' },
      { value: 'Upper bunk', label: 'Upper bunk', defaultCapacity: 1, occupancyModel: 'shared', description: 'Upper tier bunk bed' },
      { value: 'Bed in shared room', label: 'Bed in shared room', defaultCapacity: 1, occupancyModel: 'shared', description: 'Designated bed space' }
    ];
  }

  return [
    { value: 'Standard unit', label: 'Standard unit', defaultCapacity: 1, occupancyModel: 'private', description: 'Standard rentable space' },
    { value: 'Shared space', label: 'Shared space', defaultCapacity: 2, occupancyModel: 'shared', description: 'Space for multiple occupants' },
    { value: 'Full floor/suite', label: 'Full floor / suite', defaultCapacity: 4, occupancyModel: 'entire', description: 'Complete independent unit' }
  ];
}

export function generateIdenticalUnits(
  count: number,
  prefix: string,
  unitType: string,
  capacity: number,
  propertyId: string,
  occupancyModel?: 'private' | 'shared' | 'entire'
): PropertyUnit[] {
  const units: PropertyUnit[] = [];
  const now = new Date().toISOString();
  const safePrefix = (prefix || 'Room').trim();

  for (let i = 1; i <= count; i++) {
    const unitId = `unit_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}_${i}`;
    const unitNumber = i < 10 ? `10${i}` : `${100 + i}`;
    const nameOrNumber = `${safePrefix} ${unitNumber}`;

    units.push({
      id: unitId,
      propertyId,
      unitType,
      nameOrNumber,
      capacity,
      occupancyModel,
      pricing: { monthlyRent: 0 },
      availability: 'available',
      status: 'available',
      beds: [],
      createdAt: now,
      updatedAt: now
    });
  }

  return units;
}

