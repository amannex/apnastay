// ============================================================================
// APNASTAY PROPERTY ENGINE — AUTOMATED VERIFICATION TEST SUITE
// Validates Property -> Unit -> Bed hierarchy, Ownership, and Templates
// ============================================================================

import {
  propertyBackend,
  getPropertyTemplate,
  getAllPropertyTemplates,
  validateStructureForTemplate,
  PROPERTY_TEMPLATES
} from '../index';
import type { BackendRequestContext, PropertyType } from '../types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runVerificationSuite() {
  console.log('===============================================================');
  console.log('APNASTAY PROPERTY ENGINE — PHASE 1 VERIFICATION TEST SUITE');
  console.log('===============================================================\n');

  // Reset store before test
  propertyBackend.reset();

  const OWNER_ALICE: BackendRequestContext = { userId: 101, isAdmin: false };
  const OWNER_BOB: BackendRequestContext = { userId: 202, isAdmin: false };
  const GUEST_ANONYMOUS: BackendRequestContext = { userId: 0, isAdmin: false };
  const ADMIN_SUPER: BackendRequestContext = { userId: 1, isAdmin: true };

  // --------------------------------------------------------------------------
  // TEST 1: Property Draft Creation & Initial Status
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: Owner can create a property draft');
  const createRes = propertyBackend.createDraft(OWNER_ALICE, {
    propertyType: 'pg',
    rentalStructure: 'individual_bed',
    title: 'Green Valley Premium PG',
    description: 'Luxury PG near Vijay Nagar IT Park',
    location: {
      addressLine1: 'Scheme 54, Vijay Nagar',
      city: 'Indore',
      pincode: '452010'
    }
  });

  assert(createRes.success === true, 'Draft creation returns success');
  assert(createRes.status === 201, 'Status code is 201 Created');
  assert(createRes.data?.status === 'draft', 'Initial property status is draft');
  assert(createRes.data?.ownerId === OWNER_ALICE.userId, 'Property owner ID matches Alice (101)');
  assert(createRes.data?.propertyType === 'pg', 'Property type is set to pg');
  assert(Array.isArray(createRes.data?.units) && createRes.data.units.length === 0, 'Initial units list is empty');

  const propertyId = createRes.data!.id;

  // --------------------------------------------------------------------------
  // TEST 2: Ownership Enforcement
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Ownership cannot be bypassed');
  
  // Alice can read her property
  const aliceReadRes = propertyBackend.getProperty(OWNER_ALICE, propertyId);
  assert(aliceReadRes.success === true, 'Alice can read her own property');

  // Bob tries to read Alice's property -> Blocked with 403
  const bobReadRes = propertyBackend.getProperty(OWNER_BOB, propertyId);
  assert(bobReadRes.success === false && bobReadRes.status === 403, 'Bob is blocked from reading Alice property with 403');
  assert(bobReadRes.code === 'NOT_PROPERTY_OWNER', 'Error code is NOT_PROPERTY_OWNER');

  // Bob tries to update Alice's property -> Blocked with 403
  const bobUpdateRes = propertyBackend.updateProperty(OWNER_BOB, propertyId, { title: 'Hacked Title' });
  assert(bobUpdateRes.success === false && bobUpdateRes.status === 403, 'Bob is blocked from updating Alice property with 403');

  // Anonymous user tries to read -> Blocked with 401
  const anonReadRes = propertyBackend.getProperty(GUEST_ANONYMOUS, propertyId);
  assert(anonReadRes.success === false && anonReadRes.status === 401, 'Anonymous user blocked with 401');

  // Admin can access Alice's property
  const adminReadRes = propertyBackend.getProperty(ADMIN_SUPER, propertyId);
  assert(adminReadRes.success === true, 'Admin can access property (ownership bypass)');

  // --------------------------------------------------------------------------
  // TEST 3: Relational Unit Creation (Property -> Unit)
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: Unit can belong to a property');
  
  // Bob tries to add a unit to Alice's property -> Blocked
  const bobAddUnitRes = propertyBackend.addUnit(OWNER_BOB, propertyId, {
    nameOrNumber: 'Room 101',
    capacity: 2,
    pricing: { monthlyRent: 7500, securityDeposit: 15000 }
  });
  assert(bobAddUnitRes.success === false && bobAddUnitRes.status === 403, 'Bob cannot add units to Alice property');

  // Alice adds a unit
  const aliceAddUnitRes = propertyBackend.addUnit(OWNER_ALICE, propertyId, {
    nameOrNumber: 'Room 101',
    unitType: 'Double Sharing',
    capacity: 2,
    furnishing: 'fully_furnished',
    pricing: { monthlyRent: 8000, securityDeposit: 16000, maintenance: 500 },
    initialBedsCount: 2
  });

  assert(aliceAddUnitRes.success === true, 'Alice successfully adds Unit to Property');
  assert(aliceAddUnitRes.data?.propertyId === propertyId, 'Unit propertyId references Alice property');
  assert(aliceAddUnitRes.data?.beds.length === 2, 'Unit has 2 initial auto-generated beds');

  const unitId = aliceAddUnitRes.data!.id;

  // --------------------------------------------------------------------------
  // TEST 4: Relational Bed Creation (Unit -> Bed)
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Bed can belong to a unit');

  // Bob tries to add a bed to Alice's unit -> Blocked
  const bobAddBedRes = propertyBackend.addBed(OWNER_BOB, propertyId, unitId, {
    label: 'Bed C',
    pricing: { monthlyRent: 8000, securityDeposit: 16000 }
  });
  assert(bobAddBedRes.success === false && bobAddBedRes.status === 403, 'Bob cannot add beds to Alice unit');

  // Alice adds a third bed
  const aliceAddBedRes = propertyBackend.addBed(OWNER_ALICE, propertyId, unitId, {
    label: 'Bed C',
    bedType: 'single',
    pricing: { monthlyRent: 7500, securityDeposit: 15000 }
  });
  assert(aliceAddBedRes.success === true, 'Alice adds third Bed to Unit');
  assert(aliceAddBedRes.data?.unitId === unitId, 'Bed references correct unit ID');

  // Check updated property structure
  const updatedProperty = propertyBackend.getProperty(OWNER_ALICE, propertyId).data!;
  assert(updatedProperty.units.length === 1, 'Property has 1 unit');
  assert(updatedProperty.units[0].beds.length === 3, 'Unit now has 3 beds (A, B, C)');

  // --------------------------------------------------------------------------
  // TEST 5: Bulk Creation and Duplication
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 5: Bulk Creation & Duplication');

  // Bulk create 3 identical rooms with 2 beds each
  const bulkRes = propertyBackend.bulkCreateUnits(OWNER_ALICE, propertyId, {
    count: 3,
    prefix: 'Room',
    startingNumber: 201,
    unitType: 'Double Sharing Standard',
    capacityPerUnit: 2,
    pricing: { monthlyRent: 7000, securityDeposit: 14000 },
    bedsPerUnit: 2,
    bedPriceMonthly: 7000,
    bedDeposit: 14000
  });

  assert(bulkRes.success === true, 'Bulk unit creation succeeded');
  assert(bulkRes.data?.length === 3, 'Created exactly 3 units');
  assert(bulkRes.data?.[0].beds.length === 2, 'Each bulk unit has 2 beds');

  // Duplicate a unit
  const dupRes = propertyBackend.duplicateUnit(OWNER_ALICE, propertyId, unitId, 'Room 101 (Duplicate)');
  assert(dupRes.success === true, 'Duplicate unit succeeded');
  assert(dupRes.data?.nameOrNumber === 'Room 101 (Duplicate)', 'Duplicated unit has new name');
  assert(dupRes.data?.beds.length === 3, 'Duplicated unit copies all 3 beds with new IDs');
  assert(dupRes.data?.id !== unitId, 'Duplicated unit has unique ID');

  // --------------------------------------------------------------------------
  // TEST 6: Lifecycle Management (Draft -> Published -> Unpublished -> Archived)
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 6: Property Lifecycle State Transitions');

  // Publish Alice's PG
  const pubRes = propertyBackend.publishProperty(OWNER_ALICE, propertyId);
  assert(pubRes.success === true, 'Property published successfully');
  assert(pubRes.data?.status === 'published', 'Property status is published');

  // Unpublish
  const unpubRes = propertyBackend.unpublishProperty(OWNER_ALICE, propertyId);
  assert(unpubRes.success === true, 'Property unpublished successfully');
  assert(unpubRes.data?.status === 'unpublished', 'Property status is unpublished');

  // Archive (soft delete)
  const archiveRes = propertyBackend.archiveProperty(OWNER_ALICE, propertyId);
  assert(archiveRes.success === true, 'Property archived successfully');
  assert(archiveRes.data?.status === 'archived', 'Property status is archived');

  // Verify archived property still exists and history is preserved
  const checkArchived = propertyBackend.getProperty(OWNER_ALICE, propertyId);
  assert(checkArchived.success === true, 'Archived property is preserved (not hard deleted)');

  // --------------------------------------------------------------------------
  // TEST 7: Configurable Property Templates Coverage
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 7: Property Templates Coverage (All 10 Types)');

  const requiredTypes: PropertyType[] = [
    'house',
    'apartment',
    'villa',
    'pg',
    'hostel',
    'coliving',
    'building',
    'independent_floor',
    'room',
    'other'
  ];

  for (const type of requiredTypes) {
    const template = getPropertyTemplate(type);
    assert(template !== undefined && template.id === type, `Template exists for '${type}'`);
  }

  // Verify template structure mappings
  assert(getPropertyTemplate('house').structure === 'single_unit', 'House -> single_unit');
  assert(getPropertyTemplate('apartment').structure === 'multi_unit', 'Apartment -> multi_unit');
  assert(getPropertyTemplate('villa').structure === 'single_unit', 'Villa -> single_unit');
  assert(getPropertyTemplate('pg').structure === 'rooms_beds', 'PG -> rooms_beds');
  assert(getPropertyTemplate('hostel').structure === 'rooms_beds', 'Hostel -> rooms_beds');
  assert(getPropertyTemplate('coliving').structure === 'rooms_beds', 'Co-Living -> rooms_beds');
  assert(getPropertyTemplate('building').structure === 'multi_unit', 'Building -> multi_unit');
  assert(getPropertyTemplate('independent_floor').structure === 'single_unit', 'Independent Floor -> single_unit');
  assert(getPropertyTemplate('room').structure === 'single_unit', 'Room -> single_unit');
  assert(getPropertyTemplate('other').structure === 'custom', 'Other -> custom');

  // Verify structure validation rejects invalid structures
  assert(validateStructureForTemplate('house', 'entire_property') === true, 'House allows entire_property');
  assert(validateStructureForTemplate('house', 'individual_bed') === false, 'House rejects individual_bed');
  assert(validateStructureForTemplate('pg', 'individual_bed') === true, 'PG allows individual_bed');

  // Attempt to create a house with individual_bed -> Rejection
  const invalidCreate = propertyBackend.createDraft(OWNER_ALICE, {
    propertyType: 'house',
    rentalStructure: 'individual_bed'
  });
  assert(invalidCreate.success === false, 'Creating house with individual_bed structure fails validation');
  assert(invalidCreate.code === 'INVALID_RENTAL_STRUCTURE', 'Error code is INVALID_RENTAL_STRUCTURE');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerificationSuite().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
