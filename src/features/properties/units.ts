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
  } else if (type === 'coliving') {
    singular = 'Studio / Room';
    plural = 'Studios / Rooms';
    placeholder = 'Studio 101';
  } else if (type === 'independent_floor') {
    singular = 'Floor';
    plural = 'Floors';
    placeholder = '1st Floor (Unit A)';
  } else if (type === 'commercial') {
    singular = 'Space / Office';
    plural = 'Spaces / Offices';
    placeholder = 'Office 301';
  } else if (type === 'house' || type === 'villa') {
    singular = 'Unit / Space';
    plural = 'Units / Spaces';
    placeholder = 'Ground Floor Suite';
  }

  // Properties that support beds inside rooms
  const hasBeds =
    template.hasBeds ||
    type === 'pg' ||
    type === 'hostel' ||
    type === 'coliving' ||
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
