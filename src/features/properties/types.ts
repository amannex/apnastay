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
  | 'partially_occupied'
  | 'occupied'
  | 'reserved'
  | 'under_maintenance'
  | 'fully_occupied'
  | 'unavailable';

export type BedStatus =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'fully_occupied'
  | 'unavailable';

export type TemplateStructure =
  | 'single_unit'
  | 'multi_unit'
  | 'rooms_beds'
  | 'custom';

export interface PropertyLocation {
  addressLine1: string;
  locality?: string;
  addressLine2?: string;
  city: string;
  state?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  hideExactAddress?: boolean;
}

export type PropertyAvailabilityType =
  | 'immediate'
  | 'specific_date'
  | 'currently_unavailable'
  | 'temporarily_unavailable';

export interface PropertyAvailability {
  type: PropertyAvailabilityType;
  availableFrom?: string; // YYYY-MM-DD ISO date string
  reason?: string;
}

export type UnitAvailabilityStatus =
  | 'available'
  | 'partially_occupied'
  | 'fully_occupied'
  | 'unavailable';

// ----------------------------------------------------------------------------
// Phase 8: Generic Rentable Entity Pricing Definitions
// ----------------------------------------------------------------------------
export type PricingMode = 'fixed' | 'starting_from' | 'on_request';

export type BillingPeriod = 'monthly' | 'weekly' | 'daily' | 'one_time' | 'custom';

export type SecurityDepositType = 'none' | 'fixed' | 'months' | 'custom';

export type MaintenanceChargesType =
  | 'included'
  | 'excluded'
  | 'fixed'
  | 'variable'
  | 'not_applicable';

export type ElectricityChargesType =
  | 'included'
  | 'excluded'
  | 'meter_based'
  | 'fixed'
  | 'not_applicable';

export interface OtherRecurringCharge {
  id: string;
  name: string;
  amount: number;
  period?: BillingPeriod;
}

export interface SecurityDepositConfig {
  type: SecurityDepositType;
  amount?: number;
  monthsCount?: number;
  customDetails?: string;
}

export interface MaintenanceChargesConfig {
  type: MaintenanceChargesType;
  amount?: number;
}

export interface ElectricityChargesConfig {
  type: ElectricityChargesType;
  amount?: number;
}

export interface GenericRentablePricing {
  pricingMode?: PricingMode;
  amount?: number;
  currency?: string; // e.g. 'INR'
  billingPeriod?: BillingPeriod;
  monthlyRent: number;
  securityDeposit?: number;
  securityDepositConfig?: SecurityDepositConfig;
  maintenanceChargesConfig?: MaintenanceChargesConfig;
  maintenance?: number;
  electricityChargesConfig?: ElectricityChargesConfig;
  otherCharges?: OtherRecurringCharge[];
}

export interface PropertyPricing extends GenericRentablePricing {
  lockInMonths?: number;
  noticePeriodDays?: number;
  foodIncluded?: boolean;
  foodChargesMonthly?: number;
}

export interface UnitPricing extends GenericRentablePricing {}

export interface BedPricing extends GenericRentablePricing {}

export type PhotoCategory =
  | 'exterior'
  | 'bedroom'
  | 'bathroom'
  | 'kitchen'
  | 'living_room'
  | 'room'
  | 'common_area'
  | 'parking'
  | 'other';

export interface PropertyPhoto {
  id: string | number;
  url: string;
  thumbnailUrl?: string;
  category?: PhotoCategory;
  isCover: boolean;
  order: number;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt?: string;
}

export interface UploadPhotoPayload {
  file?: File;
  dataUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category?: PhotoCategory;
  isCover?: boolean;
}

export interface UpdatePhotoPayload {
  category?: PhotoCategory;
  isCover?: boolean;
  order?: number;
}

// ----------------------------------------------------------------------------
// Phase 6: Amenity Definitions
// ----------------------------------------------------------------------------
export type AmenityCategory =
  | 'basic'
  | 'comfort'
  | 'building'
  | 'services'
  | 'safety'
  | 'outdoor'
  | 'custom';

export interface AmenityDefinition {
  id: string;
  name: string;
  category: AmenityCategory;
  iconName: string;
  description?: string;
  defaultSuggestedFor?: PropertyType[];
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
  availability: 'available' | 'occupied' | 'reserved' | 'fully_occupied' | 'unavailable';
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
  availability: 'available' | 'partially_occupied' | 'occupied' | 'reserved' | 'under_maintenance' | 'fully_occupied' | 'unavailable';
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
  availability?: PropertyAvailability;
  pricing?: PropertyPricing;
  amenities?: string[];
  customAmenities?: string[];
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
  availability?: PropertyAvailability;
  location?: Partial<PropertyLocation>;
  pricing?: Partial<PropertyPricing>;
}

export interface UpdatePropertyPayload {
  title?: string;
  description?: string;
  propertyType?: PropertyType;
  customPropertyType?: string;
  rentalStructure?: RentalStructure;
  availability?: PropertyAvailability;
  location?: Partial<PropertyLocation>;
  pricing?: Partial<PropertyPricing>;
  amenities?: string[];
  customAmenities?: string[];
  units?: PropertyUnit[];
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

export interface UpdatePropertyPricingPayload {
  pricing: PropertyPricing;
  availability?: PropertyAvailability;
}

export interface BulkPricingPayload {
  defaultPricing: GenericRentablePricing;
  defaultAvailability?: PropertyAvailabilityType | UnitAvailabilityStatus;
  unitOverrides?: Record<string, Partial<UnitPricing> & { availability?: string }>;
  bedOverrides?: Record<string, Partial<BedPricing> & { availability?: string }>;
}

export interface PropertyApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  status?: number;
}

export interface BackendRequestContext {
  userId: number; // The authenticated user making the request
  isAdmin?: boolean;
}
