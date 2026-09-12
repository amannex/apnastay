// ============================================================================
// APNASTAY PROPERTY ENGINE — PRICING & AVAILABILITY HELPER (PHASE 8)
// Generic rentable entity pricing resolution, deposit calculation, formatting & validation
// ============================================================================

import type {
  Property,
  PropertyUnit,
  PropertyBed,
  PropertyType,
  RentalStructure,
  GenericRentablePricing,
  PropertyPricing,
  UnitPricing,
  BedPricing,
  SecurityDepositConfig,
  MaintenanceChargesConfig,
  ElectricityChargesConfig,
  PropertyAvailability,
  BillingPeriod,
  PricingMode,
  UnitAvailabilityStatus
} from './types';

/**
 * Format monetary amount with Indian Rupee numbering (e.g. ₹15,000 or ₹1,50,000).
 * Strictly handles integer numbers, preventing floating-point discrepancies.
 */
export function formatCurrency(
  amount: number | undefined | null,
  currency: string = 'INR'
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }

  const safeInt = Math.round(Number(amount));
  if (currency === 'INR') {
    return `₹${safeInt.toLocaleString('en-IN')}`;
  }
  return `${currency} ${safeInt.toLocaleString()}`;
}

/**
 * Human-readable billing period suffix.
 */
export function formatBillingPeriod(period?: BillingPeriod): string {
  switch (period) {
    case 'daily':
      return '/day';
    case 'weekly':
      return '/week';
    case 'one_time':
      return ' (one-time)';
    case 'custom':
      return '';
    case 'monthly':
    default:
      return '/month';
  }
}

/**
 * Format complete pricing summary display for a rentable entity.
 * Examples:
 * - "₹18,000 / month"
 * - "Starting from ₹8,000 / month"
 * - "Price on request"
 */
export function formatPricingDisplay(
  pricing?: GenericRentablePricing | null,
  fallbackRent: number = 0
): string {
  if (!pricing) {
    return fallbackRent > 0 ? `${formatCurrency(fallbackRent)} / month` : 'Price on request';
  }

  if (pricing.pricingMode === 'on_request') {
    return 'Price on request';
  }

  const rent = pricing.monthlyRent || pricing.amount || fallbackRent;
  const suffix = formatBillingPeriod(pricing.billingPeriod);
  const formatted = formatCurrency(rent, pricing.currency || 'INR');

  if (pricing.pricingMode === 'starting_from') {
    return `Starts at ${formatted} ${suffix}`.trim();
  }

  return `${formatted} ${suffix}`.trim();
}

/**
 * Calculate effective security deposit safely as a positive integer.
 * Supports:
 * - 'none': 0
 * - 'fixed': explicit fixed amount
 * - 'months': (rent * monthsCount) rounded to integer
 * - 'custom': custom fixed amount
 */
export function calculateEffectiveDeposit(
  rent: number,
  config?: SecurityDepositConfig | null,
  fallbackDeposit?: number
): number {
  if (!config) {
    return Math.max(0, Math.round(fallbackDeposit || 0));
  }

  switch (config.type) {
    case 'none':
      return 0;
    case 'months': {
      const months = Math.max(1, Math.min(24, Math.round(config.monthsCount || 1)));
      return Math.max(0, Math.round(rent * months));
    }
    case 'fixed':
    case 'custom':
      return Math.max(0, Math.round(config.amount || 0));
    default:
      return Math.max(0, Math.round(fallbackDeposit || 0));
  }
}

/**
 * Human readable label for property-level availability.
 */
export function getPropertyAvailabilityLabel(
  availability?: PropertyAvailability | null
): string {
  if (!availability) return 'Available Now';

  switch (availability.type) {
    case 'specific_date':
      if (availability.availableFrom) {
        try {
          const date = new Date(availability.availableFrom);
          return `Available from ${date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}`;
        } catch {
          return `Available from ${availability.availableFrom}`;
        }
      }
      return 'Available from date';
    case 'currently_unavailable':
      return 'Currently Unavailable';
    case 'temporarily_unavailable':
      return 'Temporarily Unavailable';
    case 'immediate':
    default:
      return 'Available Now';
  }
}

/**
 * Human readable label for unit / bed availability status.
 */
export function getUnitAvailabilityLabel(
  status?: UnitAvailabilityStatus | string
): string {
  switch (status) {
    case 'partially_occupied':
      return 'Partially Occupied';
    case 'occupied':
    case 'fully_occupied':
      return 'Occupied';
    case 'unavailable':
    case 'under_maintenance':
      return 'Unavailable';
    case 'reserved':
      return 'Reserved';
    case 'available':
    default:
      return 'Available';
  }
}

/**
 * Determine the actual rentable entity and aggregate pricing range for the property.
 */
export interface RentableSummary {
  primaryLevel: 'property' | 'unit' | 'bed';
  levelLabel: string;
  totalRentableEntities: number;
  minRent: number;
  maxRent: number;
  displayPriceRange: string;
  depositRange: string;
  availableCount: number;
}

export function getRentableEntitiesSummary(property: Property): RentableSummary {
  const structure = property.rentalStructure || 'entire_property';

  // 1. Entire Property
  if (structure === 'entire_property') {
    const rent = property.pricing?.monthlyRent || property.pricing?.amount || 0;
    const deposit = calculateEffectiveDeposit(
      rent,
      property.pricing?.securityDepositConfig,
      property.pricing?.securityDeposit
    );
    const isAvail =
      !property.availability ||
      property.availability.type === 'immediate' ||
      property.availability.type === 'specific_date';

    return {
      primaryLevel: 'property',
      levelLabel: 'Entire Property',
      totalRentableEntities: 1,
      minRent: rent,
      maxRent: rent,
      displayPriceRange: formatPricingDisplay(property.pricing, rent),
      depositRange: formatCurrency(deposit),
      availableCount: isAvail ? 1 : 0
    };
  }

  // 2. Individual Bed
  if (structure === 'individual_bed') {
    const allBeds: PropertyBed[] = [];
    (property.units || []).forEach((u) => {
      if (u.beds && u.beds.length > 0) {
        allBeds.push(...u.beds);
      }
    });

    if (allBeds.length === 0) {
      const fallbackRent = property.pricing?.monthlyRent || 0;
      return {
        primaryLevel: 'bed',
        levelLabel: 'Individual Beds',
        totalRentableEntities: 0,
        minRent: fallbackRent,
        maxRent: fallbackRent,
        displayPriceRange: formatPricingDisplay(property.pricing, fallbackRent),
        depositRange: '—',
        availableCount: 0
      };
    }

    const rents = allBeds.map((b) => b.pricing?.monthlyRent || b.pricing?.amount || 0);
    const minRent = Math.min(...rents);
    const maxRent = Math.max(...rents);
    const availableCount = allBeds.filter((b) => b.availability === 'available' || b.status === 'available').length;

    const priceText =
      minRent === maxRent
        ? `${formatCurrency(minRent)} / bed / month`
        : `${formatCurrency(minRent)} – ${formatCurrency(maxRent)} / bed / month`;

    return {
      primaryLevel: 'bed',
      levelLabel: 'Individual Beds',
      totalRentableEntities: allBeds.length,
      minRent,
      maxRent,
      displayPriceRange: priceText,
      depositRange: 'Varies by bed',
      availableCount
    };
  }

  // 3. Units, Rooms, or Multiple Units
  const units = property.units || [];
  if (units.length === 0) {
    const fallbackRent = property.pricing?.monthlyRent || 0;
    return {
      primaryLevel: 'unit',
      levelLabel: structure === 'individual_room' ? 'Rooms' : 'Units',
      totalRentableEntities: 0,
      minRent: fallbackRent,
      maxRent: fallbackRent,
      displayPriceRange: formatPricingDisplay(property.pricing, fallbackRent),
      depositRange: '—',
      availableCount: 0
    };
  }

  const rents = units.map((u) => u.pricing?.monthlyRent || u.pricing?.amount || 0);
  const minRent = Math.min(...rents);
  const maxRent = Math.max(...rents);
  const availableCount = units.filter((u) => u.availability === 'available' || u.status === 'available').length;

  const unitWord = structure === 'individual_room' ? 'room' : 'unit';
  const priceText =
    minRent === maxRent
      ? `${formatCurrency(minRent)} / ${unitWord} / month`
      : `${formatCurrency(minRent)} – ${formatCurrency(maxRent)} / ${unitWord} / month`;

  return {
    primaryLevel: 'unit',
    levelLabel: structure === 'individual_room' ? 'Individual Rooms' : 'Units / Flats',
    totalRentableEntities: units.length,
    minRent,
    maxRent,
    displayPriceRange: priceText,
    depositRange: 'Varies by unit',
    availableCount
  };
}

/**
 * Validation engine for pricing and financial inputs.
 */
export interface PricingValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validatePricingPayload(
  pricing: GenericRentablePricing,
  requireActiveAmount: boolean = true
): PricingValidationResult {
  const errors: Record<string, string> = {};

  if (pricing.pricingMode === 'on_request') {
    return { isValid: true, errors: {} };
  }

  const rent = Number(pricing.monthlyRent || pricing.amount || 0);

  if (isNaN(rent) || rent < 0) {
    errors.monthlyRent = 'Please enter a valid positive rent amount.';
  } else if (requireActiveAmount && rent === 0) {
    errors.monthlyRent = 'Rent amount must be greater than 0.';
  }

  // Security Deposit validation
  if (pricing.securityDepositConfig) {
    const dep = pricing.securityDepositConfig;
    if (dep.type === 'months') {
      const months = Number(dep.monthsCount || 0);
      if (isNaN(months) || months <= 0 || months > 24) {
        errors.securityDeposit = 'Security deposit months must be between 1 and 24.';
      }
    } else if (dep.type === 'fixed' || dep.type === 'custom') {
      const amt = Number(dep.amount || 0);
      if (isNaN(amt) || amt < 0) {
        errors.securityDeposit = 'Please enter a valid deposit amount.';
      }
    }
  }

  // Maintenance validation
  if (pricing.maintenanceChargesConfig) {
    const m = pricing.maintenanceChargesConfig;
    if (m.type === 'fixed') {
      const amt = Number(m.amount || 0);
      if (isNaN(amt) || amt < 0) {
        errors.maintenance = 'Maintenance amount must be a positive number.';
      }
    }
  }

  // Electricity validation
  if (pricing.electricityChargesConfig) {
    const el = pricing.electricityChargesConfig;
    if (el.type === 'fixed') {
      const amt = Number(el.amount || 0);
      if (isNaN(amt) || amt < 0) {
        errors.electricity = 'Electricity amount must be a positive number.';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Generate sensible initial pricing defaults tailored to property archetype & rental structure.
 */
export function createDefaultPricing(
  propertyType?: PropertyType | null,
  rentalStructure?: RentalStructure | null
): GenericRentablePricing {
  const type = propertyType || 'apartment';
  const structure = rentalStructure || 'entire_property';

  let initialRent = 15000;
  if (structure === 'individual_bed') {
    initialRent = 6000;
  } else if (structure === 'individual_room') {
    initialRent = 8000;
  } else if (type === 'villa' || type === 'house') {
    initialRent = 35000;
  } else if (type === 'commercial') {
    initialRent = 25000;
  }

  return {
    pricingMode: 'fixed',
    amount: initialRent,
    currency: 'INR',
    billingPeriod: 'monthly',
    monthlyRent: initialRent,
    securityDeposit: initialRent * 2,
    securityDepositConfig: {
      type: 'months',
      monthsCount: 2,
      amount: initialRent * 2
    },
    maintenanceChargesConfig: {
      type: 'included'
    },
    maintenance: 0,
    electricityChargesConfig: {
      type: 'meter_based'
    },
    otherCharges: []
  };
}
