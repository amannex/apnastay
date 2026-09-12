// ============================================================================
// APNASTAY PROPERTY ENGINE — PHASE 8 PRICING & AVAILABILITY TEST SUITE
// Tests generic entity pricing (Property, Unit, Bed), dynamic rental structures,
// bulk defaults with overrides, deposit and charge calculations, availability states,
// security isolation (401, 403), and completeness score computation.
// ============================================================================

import { propertyBackend } from '../backend';
import {
  formatCurrency,
  formatBillingPeriod,
  formatPricingDisplay,
  calculateEffectiveDeposit,
  getPropertyAvailabilityLabel,
  getUnitAvailabilityLabel,
  validatePricingPayload,
  createDefaultPricing,
  getRentableEntitiesSummary
} from '../pricing';
import type {
  GenericRentablePricing,
  PropertyPricing,
  UnitPricing,
  BedPricing
} from '../types';

let passed = 0;
let failed = 0;

function assert(condition: any, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runPhase8Tests() {
  console.log('\n===============================================================');
  console.log('APNASTAY PROPERTY ENGINE — PHASE 8 PRICING & AVAILABILITY SUITE');
  console.log('===============================================================\n');

  propertyBackend.reset();

  const ownerAlice = { userId: 901, isAdmin: false };
  const ownerBob = { userId: 902, isAdmin: false };
  const anonymous = { userId: 0, isAdmin: false };

  // --------------------------------------------------------------------------
  // TEST 1: Currency & Financial Formatting (Integer Safety)
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: Currency & Financial Formatting');
  assert(formatCurrency(15000) === '₹15,000', 'Formats ₹15,000 with Indian numbering');
  assert(formatCurrency(150000) === '₹1,50,000', 'Formats ₹1,50,000 (1.5 Lakhs) correctly');
  assert(formatCurrency(2500000) === '₹25,00,000', 'Formats ₹25,00,000 (25 Lakhs) correctly');
  assert(formatCurrency(0) === '₹0', 'Formats 0 as ₹0');
  assert(formatCurrency(null) === '₹0', 'Handles null safely as ₹0');
  assert(formatCurrency(undefined) === '₹0', 'Handles undefined safely as ₹0');
  assert(formatCurrency(18500.89) === '₹18,501', 'Safely rounds floating points to integer rupees');

  assert(formatBillingPeriod('monthly') === '/month', 'Monthly billing period suffix');
  assert(formatBillingPeriod('weekly') === '/week', 'Weekly billing period suffix');
  assert(formatBillingPeriod('daily') === '/day', 'Daily billing period suffix');
  assert(formatBillingPeriod('one_time') === ' (one-time)', 'One-time billing period suffix');

  // --------------------------------------------------------------------------
  // TEST 2: Security Deposit Calculation Engine
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Security Deposit Calculation Engine');
  const rent = 20000;

  // 2 Months Deposit
  const dep2Months = calculateEffectiveDeposit(rent, { type: 'months', monthsCount: 2 });
  assert(dep2Months === 40000, 'Calculates 2 months deposit (₹40,000)');

  // 3 Months Deposit
  const dep3Months = calculateEffectiveDeposit(rent, { type: 'months', monthsCount: 3 });
  assert(dep3Months === 60000, 'Calculates 3 months deposit (₹60,000)');

  // Fixed Amount
  const depFixed = calculateEffectiveDeposit(rent, { type: 'fixed', amount: 50000 });
  assert(depFixed === 50000, 'Calculates fixed deposit amount (₹50,000)');

  // No Deposit
  const depNone = calculateEffectiveDeposit(rent, { type: 'none' });
  assert(depNone === 0, 'No deposit option returns ₹0');

  // Custom Amount
  const depCustom = calculateEffectiveDeposit(rent, { type: 'custom', amount: 35000 });
  assert(depCustom === 35000, 'Calculates custom deposit amount (₹35,000)');

  // Fallback Deposit
  const depFallback = calculateEffectiveDeposit(rent, null, 25000);
  assert(depFallback === 25000, 'Returns fallback deposit when config is null');

  // --------------------------------------------------------------------------
  // TEST 3: Pricing Modes & Display Summaries
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: Pricing Modes & Display Summaries');
  const fixedPricing: GenericRentablePricing = {
    pricingMode: 'fixed',
    monthlyRent: 25000,
    amount: 25000,
    currency: 'INR',
    billingPeriod: 'monthly'
  };
  assert(formatPricingDisplay(fixedPricing) === '₹25,000 /month', 'Fixed price displays ₹25,000 /month');

  const startingPricing: GenericRentablePricing = {
    pricingMode: 'starting_from',
    monthlyRent: 8000,
    amount: 8000,
    currency: 'INR',
    billingPeriod: 'monthly'
  };
  assert(formatPricingDisplay(startingPricing) === 'Starts at ₹8,000 /month', 'Starting from displays Starts at ₹8,000 /month');

  const onRequestPricing: GenericRentablePricing = {
    pricingMode: 'on_request',
    monthlyRent: 0,
    amount: 0,
    currency: 'INR',
    billingPeriod: 'monthly'
  };
  assert(formatPricingDisplay(onRequestPricing) === 'Price on request', 'Price on request displays correctly');

  // --------------------------------------------------------------------------
  // TEST 4: Validation Engine
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Pricing Validation Engine');
  const validCheck = validatePricingPayload({
    pricingMode: 'fixed',
    monthlyRent: 15000,
    securityDepositConfig: { type: 'months', monthsCount: 2 },
    maintenanceChargesConfig: { type: 'fixed', amount: 1200 },
    electricityChargesConfig: { type: 'meter_based' }
  });
  assert(validCheck.isValid, 'Valid pricing payload passes validation');
  assert(Object.keys(validCheck.errors).length === 0, 'No validation errors on valid payload');

  const zeroRentCheck = validatePricingPayload({
    pricingMode: 'fixed',
    monthlyRent: 0
  });
  assert(!zeroRentCheck.isValid, 'Rejects zero rent for active fixed price');
  assert(Boolean(zeroRentCheck.errors.monthlyRent), 'Returns monthlyRent error message');

  const negativeRentCheck = validatePricingPayload({
    pricingMode: 'fixed',
    monthlyRent: -500
  });
  assert(!negativeRentCheck.isValid, 'Rejects negative rent amount');

  const invalidDepositMonthsCheck = validatePricingPayload({
    pricingMode: 'fixed',
    monthlyRent: 10000,
    securityDepositConfig: { type: 'months', monthsCount: 30 }
  });
  assert(!invalidDepositMonthsCheck.isValid, 'Rejects excessive deposit months (> 24)');

  // --------------------------------------------------------------------------
  // TEST 5: Entire Property Rental Pricing & Availability
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 5: Entire Property Rental Pricing & Availability');
  const houseDraft = propertyBackend.createDraft(ownerAlice, {
    propertyType: 'villa',
    rentalStructure: 'entire_property',
    title: 'Palm Grove Luxury Villa'
  });
  assert(houseDraft.success, 'Created villa draft for Alice');
  const villaId = houseDraft.data!.id;

  const villaPricing: PropertyPricing = {
    pricingMode: 'fixed',
    monthlyRent: 65000,
    amount: 65000,
    currency: 'INR',
    billingPeriod: 'monthly',
    securityDepositConfig: {
      type: 'months',
      monthsCount: 2
    },
    maintenanceChargesConfig: {
      type: 'fixed',
      amount: 3500
    },
    electricityChargesConfig: {
      type: 'meter_based'
    },
    otherCharges: [
      { id: 'chg_pool', name: 'Swimming Pool Maintenance', amount: 2000, period: 'monthly' }
    ]
  };

  const updateVillaRes = propertyBackend.updatePropertyPricing(
    ownerAlice,
    villaId,
    villaPricing,
    {
      type: 'specific_date',
      availableFrom: '2026-11-01'
    }
  );

  assert(updateVillaRes.success, 'Successfully updated villa pricing and availability');
  const updatedVilla = updateVillaRes.data!;
  assert(updatedVilla.pricing?.monthlyRent === 65000, 'Villa monthly rent is ₹65,000');
  assert(updatedVilla.pricing?.securityDeposit === 130000, 'Security deposit is automatically ₹1,30,000 (2 months)');
  assert(updatedVilla.pricing?.maintenanceChargesConfig?.type === 'fixed', 'Maintenance is fixed');
  assert(updatedVilla.pricing?.maintenanceChargesConfig?.amount === 3500, 'Maintenance amount is ₹3,500');
  assert(updatedVilla.pricing?.otherCharges?.length === 1, 'Other recurring charge persisted');
  assert(updatedVilla.availability?.type === 'specific_date', 'Availability is specific_date');
  assert(updatedVilla.availability?.availableFrom === '2026-11-01', 'Available from 2026-11-01');

  const villaSummary = getRentableEntitiesSummary(updatedVilla);
  assert(villaSummary.primaryLevel === 'property', 'Identified primary rentable level as property');
  assert(villaSummary.minRent === 65000, 'Summary rent is ₹65,000');

  // --------------------------------------------------------------------------
  // TEST 6: Individual Unit & Multiple Units Pricing with Overrides
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 6: Individual Unit Pricing with Granular Overrides');
  const aptDraft = propertyBackend.createDraft(ownerAlice, {
    propertyType: 'apartment',
    rentalStructure: 'multiple_units',
    title: 'Prestige Heights Towers'
  });
  const aptId = aptDraft.data!.id;

  // Add 3 units (Flats 101, 102, 201)
  const u1 = propertyBackend.addUnit(ownerAlice, aptId, {
    nameOrNumber: 'Flat 101',
    unitType: '2 BHK',
    capacity: 4,
    pricing: { monthlyRent: 0, securityDeposit: 0 }
  }).data!;

  const u2 = propertyBackend.addUnit(ownerAlice, aptId, {
    nameOrNumber: 'Flat 102',
    unitType: '2 BHK',
    capacity: 4,
    pricing: { monthlyRent: 0, securityDeposit: 0 }
  }).data!;

  const u3 = propertyBackend.addUnit(ownerAlice, aptId, {
    nameOrNumber: 'Flat 201 (Penthouse)',
    unitType: '3 BHK',
    capacity: 6,
    pricing: { monthlyRent: 0, securityDeposit: 0 }
  }).data!;

  // Bulk Apply default ₹20,000/mo to all units, with Penthouse override at ₹32,000/mo
  const bulkRes = propertyBackend.updateBulkPricing(ownerAlice, aptId, {
    defaultPricing: {
      pricingMode: 'fixed',
      monthlyRent: 20000,
      amount: 20000,
      currency: 'INR',
      billingPeriod: 'monthly',
      securityDepositConfig: {
        type: 'months',
        monthsCount: 2
      },
      maintenanceChargesConfig: {
        type: 'included'
      }
    },
    defaultAvailability: 'available',
    unitOverrides: {
      [u3.id]: {
        monthlyRent: 32000,
        amount: 32000,
        securityDeposit: 64000
      }
    }
  });

  assert(bulkRes.success, 'Bulk pricing update succeeded');
  const aptUnits = bulkRes.data!.units;
  assert(aptUnits[0].pricing.monthlyRent === 20000, 'Flat 101 received default ₹20,000');
  assert(aptUnits[0].pricing.securityDeposit === 40000, 'Flat 101 deposit is ₹40,000');
  assert(aptUnits[1].pricing.monthlyRent === 20000, 'Flat 102 received default ₹20,000');
  assert(aptUnits[2].pricing.monthlyRent === 32000, 'Flat 201 (Penthouse) received custom override ₹32,000');
  assert(aptUnits[2].pricing.securityDeposit === 64000, 'Flat 201 deposit is ₹64,000');

  // Update Flat 102 availability to occupied
  const unitUpdateRes = propertyBackend.updateUnitPricing(
    ownerAlice,
    aptId,
    u2.id,
    { monthlyRent: 21000, securityDeposit: 42000 },
    'occupied'
  );
  assert(unitUpdateRes.success, 'Updated Flat 102 pricing and availability');
  assert(unitUpdateRes.data!.pricing.monthlyRent === 21000, 'Flat 102 rent updated to ₹21,000');
  assert(unitUpdateRes.data!.availability === 'occupied', 'Flat 102 availability set to occupied');

  const aptSummary = getRentableEntitiesSummary(propertyBackend.getOrEnsureProperty(aptId, ownerAlice));
  assert(aptSummary.primaryLevel === 'unit', 'Identified primary rentable level as unit');
  assert(aptSummary.totalRentableEntities === 3, 'Total 3 rentable flats');
  assert(aptSummary.minRent === 20000, 'Min rent is ₹20,000');
  assert(aptSummary.maxRent === 32000, 'Max rent is ₹32,000');
  assert(aptSummary.availableCount === 2, '2 of 3 flats available (1 occupied)');

  // --------------------------------------------------------------------------
  // TEST 7: Individual Bed Rental Pricing with Bed Overrides
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 7: Individual Bed Rental Pricing & Overrides');
  const pgDraft = propertyBackend.createDraft(ownerAlice, {
    propertyType: 'pg',
    rentalStructure: 'individual_bed',
    title: 'Green View Executive PG'
  });
  const pgId = pgDraft.data!.id;

  // Add Room 101 with 2 beds (Bed A, Bed B)
  const room101 = propertyBackend.addUnit(ownerAlice, pgId, {
    nameOrNumber: 'Room 101',
    capacity: 2,
    pricing: { monthlyRent: 0, securityDeposit: 0 },
    initialBedsCount: 2
  }).data!;

  assert(room101.beds.length === 2, 'Room 101 has 2 beds');
  const bedA = room101.beds[0];
  const bedB = room101.beds[1];

  // Bulk set base bed price ₹6,000/mo, with Bed B (window side) override at ₹7,000/mo
  const pgBulkRes = propertyBackend.updateBulkPricing(ownerAlice, pgId, {
    defaultPricing: {
      pricingMode: 'fixed',
      monthlyRent: 6000,
      amount: 6000,
      currency: 'INR',
      billingPeriod: 'monthly',
      securityDepositConfig: {
        type: 'months',
        monthsCount: 1
      }
    },
    defaultAvailability: 'available',
    bedOverrides: {
      [bedB.id]: {
        monthlyRent: 7000,
        amount: 7000,
        securityDeposit: 7000
      }
    }
  });

  assert(pgBulkRes.success, 'PG bulk bed pricing succeeded');
  const pgBeds = pgBulkRes.data!.units[0].beds;
  assert(pgBeds[0].pricing.monthlyRent === 6000, 'Bed A has default price ₹6,000');
  assert(pgBeds[1].pricing.monthlyRent === 7000, 'Bed B has custom window-side price ₹7,000');

  // Update Bed A availability to occupied
  const bedUpdateRes = propertyBackend.updateBedPricing(
    ownerAlice,
    pgId,
    room101.id,
    bedA.id,
    { monthlyRent: 6000, securityDeposit: 6000 },
    'occupied'
  );
  assert(bedUpdateRes.success, 'Bed A updated to occupied');
  assert(bedUpdateRes.data!.availability === 'occupied', 'Bed A status is occupied');

  const pgSummary = getRentableEntitiesSummary(propertyBackend.getOrEnsureProperty(pgId, ownerAlice));
  assert(pgSummary.primaryLevel === 'bed', 'Identified primary rentable level as bed');
  assert(pgSummary.totalRentableEntities === 2, 'Total 2 rentable beds');
  assert(pgSummary.minRent === 6000, 'Min bed rent is ₹6,000');
  assert(pgSummary.maxRent === 7000, 'Max bed rent is ₹7,000');
  assert(pgSummary.availableCount === 1, '1 available bed remaining');

  // --------------------------------------------------------------------------
  // TEST 8: Cross-Owner Security Isolation & Ownership Verification
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 8: Cross-Owner Security Isolation & Ownership Verification');

  // Bob attempts to update Alice's property pricing -> 403
  const bobPropRes = propertyBackend.updatePropertyPricing(
    ownerBob,
    villaId,
    { monthlyRent: 10000, amount: 10000 }
  );
  assert(!bobPropRes.success, 'Bob blocked from modifying Alice villa pricing');
  assert(bobPropRes.status === 403, 'Returns 403 Forbidden for unauthorized owner');
  assert(bobPropRes.code === 'NOT_PROPERTY_OWNER', 'Code is NOT_PROPERTY_OWNER');

  // Bob attempts to update Alice's unit pricing -> 403
  const bobUnitRes = propertyBackend.updateUnitPricing(
    ownerBob,
    aptId,
    u1.id,
    { monthlyRent: 5000, amount: 5000 }
  );
  assert(!bobUnitRes.success, 'Bob blocked from modifying Alice unit pricing');
  assert(bobUnitRes.status === 403, 'Returns 403 Forbidden for unauthorized unit update');

  // Bob attempts to update Alice's bed pricing -> 403
  const bobBedRes = propertyBackend.updateBedPricing(
    ownerBob,
    pgId,
    room101.id,
    bedA.id,
    { monthlyRent: 2000, amount: 2000 }
  );
  assert(!bobBedRes.success, 'Bob blocked from modifying Alice bed pricing');
  assert(bobBedRes.status === 403, 'Returns 403 Forbidden for unauthorized bed update');

  // Bob attempts bulk pricing on Alice property -> 403
  const bobBulkRes = propertyBackend.updateBulkPricing(
    ownerBob,
    aptId,
    { defaultPricing: { monthlyRent: 1000, amount: 1000 } }
  );
  assert(!bobBulkRes.success, 'Bob blocked from bulk pricing on Alice property');
  assert(bobBulkRes.status === 403, 'Returns 403 Forbidden for bulk update');

  // Anonymous user -> 401
  const anonRes = propertyBackend.updatePropertyPricing(
    anonymous,
    villaId,
    { monthlyRent: 10000, amount: 10000 }
  );
  assert(!anonRes.success, 'Anonymous user blocked');
  assert(anonRes.status === 401, 'Returns 401 Unauthorized for anonymous request');

  // Verify Alice's pricing was untouched
  const aliceVilla = propertyBackend.getOrEnsureProperty(villaId, ownerAlice);
  assert(aliceVilla.pricing?.monthlyRent === 65000, 'Alice villa pricing remained intact at ₹65,000');

  // --------------------------------------------------------------------------
  // TEST 9: Completeness Score Elevation with Phase 8 Pricing & Availability
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 9: Completeness Score Elevation with Phase 8');

  // Create a fully-fledged property draft for Alice
  const fullDraft = propertyBackend.createDraft(ownerAlice, {
    propertyType: 'apartment',
    rentalStructure: 'entire_property',
    title: 'Sobha Dream Acres 2BHK',
    description: 'A magnificent and well-ventilated apartment with prime pool view.'
  });
  const fullId = fullDraft.data!.id;

  // Add location
  propertyBackend.updateProperty(ownerAlice, fullId, {
    location: {
      addressLine1: 'Panathur Main Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560087'
    }
  });

  // Add photos
  propertyBackend.uploadPhoto(ownerAlice, fullId, {
    fileName: 'living_room.jpg',
    fileSize: 1024 * 500,
    mimeType: 'image/jpeg',
    isCover: true
  });

  // Add amenities
  propertyBackend.updateAmenities(ownerAlice, fullId, ['wifi', 'lift', 'power_backup'], []);

  const beforePricingScore = propertyBackend.getOrEnsureProperty(fullId, ownerAlice).completenessScore;

  // Add Phase 8 Pricing & Availability
  const finalRes = propertyBackend.updatePropertyPricing(
    ownerAlice,
    fullId,
    {
      pricingMode: 'fixed',
      monthlyRent: 35000,
      amount: 35000,
      currency: 'INR',
      billingPeriod: 'monthly',
      securityDepositConfig: { type: 'months', monthsCount: 2 },
      maintenanceChargesConfig: { type: 'included' },
      electricityChargesConfig: { type: 'meter_based' }
    },
    {
      type: 'immediate'
    }
  );

  const afterPricingScore = finalRes.data!.completenessScore;
  assert(
    afterPricingScore > beforePricingScore,
    `Completeness score increased with pricing and availability (${beforePricingScore}% -> ${afterPricingScore}%)`
  );
  assert(afterPricingScore >= 80, `Completeness score reaches high readiness score (${afterPricingScore}%)`);

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`PHASE 8 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Tests().catch((err) => {
  console.error('Test runner encountered uncaught error:', err);
  process.exit(1);
});
