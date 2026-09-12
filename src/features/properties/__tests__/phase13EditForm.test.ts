// ============================================================================
// APNASTAY PROPERTY ENGINE — PHASE 13 REUSABLE FORM & EDIT PROPERTY TEST SUITE
// Tests property hydration, multi-mode form configuration, step applicability,
// partial update preservation across all 10 property sections, and ID immutability.
// ============================================================================

import {
  createPropertyDraft,
  getProperty,
  updateProperty,
  updatePropertyAmenities,
  updatePropertyUnits,
  updatePropertyPricing,
  updatePropertyRules,
  publishProperty
} from '../api';
import {
  WIZARD_STEPS,
  getApplicableSteps,
  isStepApplicable
} from '../form/formConfig';
import type { PropertyUnit } from '../types';

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

async function runPhase13Tests() {
  console.log('\n====================================================================');
  console.log('APNASTAY PROPERTY ENGINE — PHASE 13 EDIT & REUSABLE FORM SUITE');
  console.log('====================================================================\n');

  // Test 1: Step Configuration & Applicability Matrix
  console.log('🧪 TEST 1: Step Configuration & Applicability Matrix');
  assert(WIZARD_STEPS.length === 10, 'WIZARD_STEPS contains exactly 10 wizard steps');
  assert(
    WIZARD_STEPS.every((step, idx) => step.stepNumber === idx + 1),
    'Wizard steps are ordered sequentially from 1 to 10'
  );

  // Entire apartment -> units not applicable
  assert(
    isStepApplicable(7, 'apartment', 'entire_property') === false,
    'Apartment with entire_property structure has units step disabled'
  );

  // PG with beds -> units applicable
  assert(
    isStepApplicable(7, 'pg', 'individual_bed') === true,
    'PG with individual_bed structure has units step enabled'
  );

  // Building with multiple units -> units applicable
  assert(
    isStepApplicable(7, 'building', 'multiple_units') === true,
    'Building with multiple_units structure has units step enabled'
  );

  // Applicable steps filter
  const aptSteps = getApplicableSteps('apartment', 'entire_property');
  assert(!aptSteps.some((s) => s.stepNumber === 7), 'Applicable steps for entire apartment excludes step 7');

  const pgSteps = getApplicableSteps('pg', 'individual_bed');
  assert(pgSteps.some((s) => s.stepNumber === 7), 'Applicable steps for PG includes step 7');

  // Test 2: Step Completion Evaluators
  console.log('\n🧪 TEST 2: Step Completion Evaluators');
  const step1 = WIZARD_STEPS.find((s) => s.stepNumber === 1)!;
  const step3 = WIZARD_STEPS.find((s) => s.stepNumber === 3)!;
  const step4 = WIZARD_STEPS.find((s) => s.stepNumber === 4)!;
  const step7 = WIZARD_STEPS.find((s) => s.stepNumber === 7)!;

  assert(step1.isCompleted({ propertyType: 'apartment' }) === true, 'Step 1 complete when propertyType is set');
  assert(step1.isCompleted({}) === false, 'Step 1 incomplete when propertyType is empty');

  assert(
    step3.isCompleted({
      title: 'Luxury 3BHK Indiranagar',
      description: 'Fully furnished apartment close to metro station with high end finishes.'
    }) === true,
    'Step 3 complete when title and description satisfy minimum lengths'
  );
  assert(step3.isCompleted({ title: 'Short' }) === false, 'Step 3 incomplete when description missing');

  assert(
    step4.isCompleted({
      location: {
        addressLine1: '42 Palm Avenue',
        city: 'Bengaluru',
        pincode: '560038'
      }
    }) === true,
    'Step 4 complete when address, city, and pincode are present'
  );

  assert(
    step7.isCompleted({ rentalStructure: 'entire_property' }) === true,
    'Step 7 automatically satisfied for entire_property listings'
  );
  assert(
    step7.isCompleted({ rentalStructure: 'multiple_units', units: [] }) === false,
    'Step 7 incomplete for multiple_units without units'
  );

  // Test 3: Hydration & Pre-fill
  console.log('\n🧪 TEST 3: Property Draft Creation & Hydration');
  const draftRes = await createPropertyDraft({
    propertyType: 'apartment',
    rentalStructure: 'individual_unit',
    title: 'Sunny Crest Flat 402'
  });
  assert(draftRes.success, 'Draft created successfully');
  const propId = draftRes.data!.id;

  const fetchRes = await getProperty(propId);
  assert(fetchRes.success, 'Property fetched successfully by ID for editing');
  assert(fetchRes.data?.propertyType === 'apartment', 'Property type correctly hydrated');
  assert(fetchRes.data?.rentalStructure === 'individual_unit', 'Rental structure correctly hydrated');
  assert(fetchRes.data?.title === 'Sunny Crest Flat 402', 'Title correctly hydrated');

  // Test 4: Partial Updates Preservation Across Sections
  console.log('\n🧪 TEST 4: Partial Updates Preservation');
  // Populate initial details & location
  await updateProperty(propId, {
    description: 'A well-lit corner apartment with cross ventilation.',
    location: {
      addressLine1: '88 Sarjapur Road',
      locality: 'Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103'
    }
  });

  // Add amenities
  await updatePropertyAmenities(propId, ['wifi', 'power_backup', 'lift'], ['Terrace Lounge']);

  // Add a unit
  const testUnit: PropertyUnit = {
    id: 'unit_402',
    propertyId: propId,
    nameOrNumber: 'Flat 402',
    unitType: '2bhk',
    floor: 4,
    capacity: 4,
    availability: 'available',
    status: 'available',
    pricing: {
      monthlyRent: 48000
    },
    beds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await updatePropertyUnits(propId, [testUnit]);

  // Add rules
  await updatePropertyRules(propId, {
    suitableFor: ['families', 'couples'],
    guestPolicy: 'with_restrictions',
    petPolicy: 'allowed',
    smokingPolicy: 'not_allowed',
    alcoholPolicy: 'allowed',
    foodPolicy: 'no_meals',
    kitchenAccess: 'shared',
    timingType: 'flexible'
  });

  // Now perform partial update on pricing only
  const pricingUpdate = await updatePropertyPricing(
    propId,
    {
      monthlyRent: 48000,
      securityDeposit: 96000,
      maintenance: 3000
    },
    {
      type: 'immediate'
    }
  );
  assert(pricingUpdate.success, 'Pricing updated successfully');

  // Verify all OTHER sections were preserved
  const verifyHydration = (await getProperty(propId)).data!;
  assert(verifyHydration.description === 'A well-lit corner apartment with cross ventilation.', 'Description preserved');
  assert(verifyHydration.location?.locality === 'Bellandur', 'Location locality preserved');
  assert(verifyHydration.amenities?.includes('wifi'), 'Amenities preserved');
  assert(verifyHydration.customAmenities?.includes('Terrace Lounge'), 'Custom amenities preserved');
  assert(verifyHydration.units?.length === 1 && verifyHydration.units[0].nameOrNumber === 'Flat 402', 'Units preserved');
  assert(verifyHydration.rules?.suitableFor?.includes('families'), 'Rules preserved');
  assert(verifyHydration.pricing?.monthlyRent === 48000, 'New rent applied');

  // Test 5: ID & Ownership Immutability
  console.log('\n🧪 TEST 5: ID & Ownership Immutability');
  const originalOwner = verifyHydration.ownerId;
  const tamperRes = await updateProperty(propId, {
    title: 'Attempted Hijack',
    id: 'hacked_id_123',
    ownerId: 999999
  } as any);

  assert(tamperRes.success, 'Update responded successfully');
  assert(tamperRes.data?.id === propId, 'Primary property ID was not modified');
  assert(tamperRes.data?.ownerId === originalOwner, 'Property ownerId was not mutated');

  // Test 6: Editing a Published Listing
  console.log('\n🧪 TEST 6: Editing a Published Listing');
  // Add required photos before publish
  await updateProperty(propId, {
    photos: [
      {
        id: 'photo_402_1',
        url: 'https://images.unsplash.com/photo-apt-402',
        isCover: true,
        order: 1,
        category: 'living_room'
      }
    ]
  });

  const publishRes = await publishProperty(propId, { strict: true });
  assert(publishRes.success, 'Property published successfully');
  assert(publishRes.data?.status === 'published', 'Property status is published');

  // Edit title and rent while published
  const liveEditRes = await updateProperty(propId, {
    title: 'Sunny Crest Flat 402 — Luxury High Floor',
    pricing: {
      monthlyRent: 50000,
      securityDeposit: 100000
    }
  });

  assert(liveEditRes.success, 'Live listing updated successfully');
  assert(liveEditRes.data?.title === 'Sunny Crest Flat 402 — Luxury High Floor', 'Live title updated');
  assert(liveEditRes.data?.pricing?.monthlyRent === 50000, 'Live rent updated');
  assert(liveEditRes.data?.status === 'published', 'Published status preserved through edits');

  console.log('\n====================================================================');
  console.log(`PHASE 13 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase13Tests().catch((err) => {
  console.error('Fatal error running Phase 13 tests:', err);
  process.exit(1);
});
