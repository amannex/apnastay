// ============================================================================
// APNASTAY PROPERTY ENGINE — CORE TYPES & DATA SCHEMAS
// Unified data models for Property -> Unit -> Bed hierarchy and templates
// ============================================================================

export type PropertyType =
  | 'house'
  | 'apartment'
  | 'villa'
  | 'pg'
  | 'hostel'
  | 'coliving'
  | 'building'
  | 'independent_floor'
  | 'room'
  | 'commercial'
  | 'other';

export type RentalStructure =
  | 'entire_property'
  | 'individual_unit'
  | 'individual_room'
  | 'individual_bed'
  | 'multiple_units';

export type PropertyStatus =
  | 'draft'
  | 'published'
  | 'unpublished'
  | 'archived';

export type UnitStatus =
  | 'draft'
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'under_maintenance';

export type BedStatus =
  | 'available'
  | 'occupied'
  | 'reserved';

export type TemplateStructure =
  | 'single_unit'
  | 'multi_unit'
  | 'rooms_beds'
  | 'custom';

export interface PropertyLocation {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
}

export interface PropertyPricing {
  monthlyRent: number;
  securityDeposit: number;
  maintenance?: number;
  lockInMonths?: number;
  noticePeriodDays?: number;
  foodIncluded?: boolean;
  foodChargesMonthly?: number;
}

export interface UnitPricing {
  monthlyRent: number;
  securityDeposit: number;
  maintenance?: number;
}

export interface BedPricing {
  monthlyRent: number;
  securityDeposit: number;
}

export interface PropertyPhoto {
  id: string | number;
  url: string;
  thumbnailUrl?: string;
  category?:
    | 'exterior'
    | 'bedroom'
    | 'bathroom'
    | 'kitchen'
    | 'living_room'
    | 'room'
    | 'common_area'
    | 'parking'
    | 'other';
  isCover: boolean;
  order: number;
}

export interface PropertyRules {
  tenantPreference?:
    | 'all'
    | 'bachelors_male'
    | 'bachelors_female'
    | 'family'
    | 'students'
    | 'working_professionals';
  smokingAllowed?: boolean;
  alcoholAllowed?: boolean;
  petsAllowed?: boolean;
  visitorsAllowed?: boolean;
  gateClosingTime?: string;
  customRules?: string[];
}

export interface PropertyBed {
  id: string;
  unitId: string;
  label: string; // e.g., "Bed A", "Bed 1", "Upper Bunk"
  bedType?: 'single' | 'bunk_lower' | 'bunk_upper' | 'queen';
  availability: 'available' | 'occupied' | 'reserved';
  pricing: BedPricing;
  status: BedStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyUnit {
  id: string;
  propertyId: string;
  unitType?: string; // e.g., "1BHK", "2BHK", "Single Room", "Double Sharing"
  nameOrNumber: string; // e.g., "Flat 101", "Room 204", "Ground Floor"
  description?: string;
  capacity: number; // e.g., 2 persons
  furnishing?: 'fully_furnished' | 'semi_furnished' | 'unfurnished';
  floor?: string | number;
  carpetAreaSqft?: number;
  pricing: UnitPricing;
  availability: 'available' | 'occupied' | 'reserved' | 'under_maintenance';
  availableFrom?: string;
  status: UnitStatus;
  beds: PropertyBed[];
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  ownerId: number; // WordPress user ID
  propertyType: PropertyType;
  customPropertyType?: string; // If propertyType === 'other'
  rentalStructure: RentalStructure;
  title: string;
  description: string;
  status: PropertyStatus;
  location?: PropertyLocation;
  pricing?: PropertyPricing;
  amenities?: string[];
  rules?: PropertyRules;
  photos?: PropertyPhoto[];
  completenessScore: number; // 0 - 100
  units: PropertyUnit[];
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Property Template Definition
// ----------------------------------------------------------------------------
export interface PropertyTemplate {
  id: PropertyType;
  label: string;
  description: string;
  structure: TemplateStructure;
  defaultRentalStructure: RentalStructure;
  allowedRentalStructures: RentalStructure[];
  unitTerminology: {
    singular: string;
    plural: string;
    placeholder: string;
  };
  hasUnits: boolean;
  hasBeds: boolean;
  suggestedAmenities: string[];
}

// ----------------------------------------------------------------------------
// API Payload & Response Types
// ----------------------------------------------------------------------------
export interface CreatePropertyDraftPayload {
  propertyType: PropertyType;
  customPropertyType?: string;
  rentalStructure: RentalStructure;
  title?: string;
  description?: string;
  location?: Partial<PropertyLocation>;
  pricing?: Partial<PropertyPricing>;
}

export interface UpdatePropertyPayload {
  title?: string;
  description?: string;
  propertyType?: PropertyType;
  customPropertyType?: string;
  rentalStructure?: RentalStructure;
  location?: Partial<PropertyLocation>;
  pricing?: Partial<PropertyPricing>;
  amenities?: string[];
  rules?: Partial<PropertyRules>;
  photos?: PropertyPhoto[];
  status?: PropertyStatus;
}

export interface CreateUnitPayload {
  nameOrNumber: string;
  unitType?: string;
  description?: string;
  capacity?: number;
  furnishing?: 'fully_furnished' | 'semi_furnished' | 'unfurnished';
  floor?: string | number;
  carpetAreaSqft?: number;
  pricing: UnitPricing;
  availability?: 'available' | 'occupied' | 'reserved' | 'under_maintenance';
  status?: UnitStatus;
  initialBedsCount?: number;
}

export interface CreateBedPayload {
  label: string;
  bedType?: 'single' | 'bunk_lower' | 'bunk_upper' | 'queen';
  pricing: BedPricing;
  availability?: 'available' | 'occupied' | 'reserved';
  status?: BedStatus;
}

export interface BulkCreateUnitsPayload {
  count: number;
  prefix?: string; // e.g. "Room" -> "Room 101", "Room 102"
  startingNumber?: number; // e.g. 101
  unitType?: string;
  capacityPerUnit: number;
  furnishing?: 'fully_furnished' | 'semi_furnished' | 'unfurnished';
  pricing: UnitPricing;
  bedsPerUnit?: number;
  bedPriceMonthly?: number;
  bedDeposit?: number;
}

export interface PropertyApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  status?: number;
}
