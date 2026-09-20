// ============================================================================
// APNASTAY PROPERTY ENGINE — SUBSTEP 5 ACCOMMODATION STRUCTURE TEST SUITE
// Validates single unit, multiple units, identical batch generation,
// PG accommodation types, validation rules, and backend persistence.
// ============================================================================

import {
  getAccommodationTypeOptions,
  generateIdenticalUnits,
  validatePropertyStructureUnits,
  propertyBackend,
  BackendRequestContext,
  PropertyUnit
} from '../index';

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

async function runSubstep5Suite() {
  console.log('===============================================================');
  console.log('APNASTAY PROPERTY ENGINE — SUBSTEP 5 VERIFICATION TEST SUITE');
  console.log('===============================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: PG Specific Accommodation Types
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: PG specific accommodation types');
  const pgOptions = getAccommodationTypeOptions('pg', 'multiple_units');
  const pgOptionValues = pgOptions.map((o) => o.value);

  assert(pgOptionValues.includes('Private room'), "PG options include 'Private room'");
  assert(pgOptionValues.includes('2 sharing'), "PG options include '2 sharing'");
  assert(pgOptionValues.includes('3 sharing'), "PG options include '3 sharing'");
  assert(pgOptionValues.includes('4 sharing'), "PG options include '4 sharing'");
  assert(pgOptionValues.includes('5+ sharing'), "PG options include '5+ sharing'");

  const twoSharing = pgOptions.find((o) => o.value === '2 sharing');
  assert(twoSharing?.defaultCapacity === 2, "'2 sharing' defaults to capacity 2");
  assert(twoSharing?.occupancyModel === 'shared', "'2 sharing' has occupancyModel 'shared'");

  const privateRoom = pgOptions.find((o) => o.value === 'Private room');
  assert(privateRoom?.defaultCapacity === 1, "'Private room' defaults to capacity 1");
  assert(privateRoom?.occupancyModel === 'private', "'Private room' has occupancyModel 'private'");

  // --------------------------------------------------------------------------
  // TEST 2: Other Property Types Accommodation Options
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Accommodation options for Hostel, Apartment, and Co-living');
  const hostelOptions = getAccommodationTypeOptions('hostel', 'multiple_units');
  const hostelValues = hostelOptions.map((o) => o.value);
  assert(hostelValues.includes('4-bed dorm'), "Hostel options include '4-bed dorm'");
  assert(hostelValues.includes('6-bed dorm'), "Hostel options include '6-bed dorm'");

  const aptOptions = getAccommodationTypeOptions('apartment', 'entire_property');
  const aptValues = aptOptions.map((o) => o.value);
  assert(aptValues.includes('1 BHK'), "Apartment options include '1 BHK'");
  assert(aptValues.includes('2 BHK'), "Apartment options include '2 BHK'");
  assert(aptValues.includes('Studio'), "Apartment options include 'Studio'");

  const colivingOptions = getAccommodationTypeOptions('co_living', 'multiple_units');
  const colivingValues = colivingOptions.map((o) => o.value);
  assert(colivingValues.includes('Twin sharing'), "Co-living options include 'Twin sharing'");

  // --------------------------------------------------------------------------
  // TEST 3: Identical Units Generator
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: Batch identical units generator (e.g. 4 x 2-sharing rooms)');
  const generated = generateIdenticalUnits(4, 'Room', '2 sharing', 2, 'prop_test_123', 'shared');

  assert(generated.length === 4, 'Generated exactly 4 units');
  assert(generated[0].nameOrNumber === 'Room 101', "Unit 1 is named 'Room 101'");
  assert(generated[1].nameOrNumber === 'Room 102', "Unit 2 is named 'Room 102'");
  assert(generated[2].nameOrNumber === 'Room 103', "Unit 3 is named 'Room 103'");
  assert(generated[3].nameOrNumber === 'Room 104', "Unit 4 is named 'Room 104'");
  assert(generated.every((u) => u.unitType === '2 sharing'), 'All units have unitType 2 sharing');
  assert(generated.every((u) => u.capacity === 2), 'All units have capacity 2');
  assert(generated.every((u) => u.propertyId === 'prop_test_123'), 'All units have correct propertyId');

  // --------------------------------------------------------------------------
  // TEST 4: Validation Rules for Accommodation Structure Units
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Substep 5 validation rules');
  
  // Empty units
  const emptyRes = validatePropertyStructureUnits([]);
  assert(emptyRes.isValid === false, 'Rejects empty units array');
  assert(emptyRes.field === 'units', "Flags 'units' field when empty");

  // Missing name
  const missingNameRes = validatePropertyStructureUnits([
    { nameOrNumber: '', unitType: '2 sharing', capacity: 2 }
  ]);
  assert(missingNameRes.isValid === false, 'Rejects unit with empty name');
  assert(missingNameRes.field === 'nameOrNumber', "Flags 'nameOrNumber' field");

  // Missing unit type
  const missingTypeRes = validatePropertyStructureUnits([
    { nameOrNumber: 'Room 101', unitType: '', capacity: 2 }
  ]);
  assert(missingTypeRes.isValid === false, 'Rejects unit with empty unitType');
  assert(missingTypeRes.field === 'unitType', "Flags 'unitType' field");

  // Invalid capacity
  const invalidCapRes = validatePropertyStructureUnits([
    { nameOrNumber: 'Room 101', unitType: '2 sharing', capacity: 0 }
  ]);
  assert(invalidCapRes.isValid === false, 'Rejects unit with capacity < 1');
  assert(invalidCapRes.field === 'capacity', "Flags 'capacity' field");

  // Valid multiple units
  const validRes = validatePropertyStructureUnits(generated);
  assert(validRes.isValid === true, 'Accepts valid generated units');
  assert(validRes.sanitizedUnits?.length === 4, 'Returns sanitized units array with 4 units');

  // --------------------------------------------------------------------------
  // TEST 5: Backend Integration and Persistence
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 5: Backend draft creation and structure persistence');
  const ctx: BackendRequestContext = { userId: 24 };

  // 1. Create a draft PG listing
  const createRes = propertyBackend.createDraft(ctx, {
    propertyType: 'pg',
    rentalStructure: 'multiple_units',
    propertyStructure: 'multiple_units',
    title: 'ApnaStay PG in Sector 62',
    description: 'A premium PG accommodation in Noida.'
  });

  assert(createRes.success === true, 'Created draft PG property');
  const propId = createRes.data!.id;
  assert(createRes.data!.propertyStructure === 'multiple_units', "Draft has propertyStructure 'multiple_units'");

  // 2. Save Substep 5 accommodation units to backend
  const updateRes = propertyBackend.updateProperty(ctx, propId, {
    propertyStructure: 'multiple_units',
    units: validRes.sanitizedUnits
  });

  assert(updateRes.success === true, 'Updated property with accommodation units');
  assert(updateRes.data!.units.length === 4, 'Property in backend now has 4 units');
  assert(updateRes.data!.units[0].nameOrNumber === 'Room 101', 'First unit is Room 101');
  assert(updateRes.data!.units[0].capacity === 2, 'First unit capacity is 2');

  // 3. Verify round-trip retrieval
  const getRes = propertyBackend.getProperty(ctx, propId);
  assert(getRes.success === true, 'Retrieved property from backend');
  assert(getRes.data!.units.length === 4, 'Retrieved property preserves 4 units');
  assert(getRes.data!.propertyStructure === 'multiple_units', 'Retrieved property preserves propertyStructure');

  // 4. Test Single Unit mode update
  const singleUnit: PropertyUnit = {
    id: 'unit_single_1',
    propertyId: propId,
    nameOrNumber: 'Entire Studio',
    unitType: 'Studio',
    capacity: 2,
    occupancyModel: 'entire',
    pricing: { monthlyRent: 15000 },
    availability: 'available',
    status: 'available',
    beds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updateSingleRes = propertyBackend.updateProperty(ctx, propId, {
    propertyStructure: 'single_unit',
    units: [singleUnit]
  });

  assert(updateSingleRes.success === true, 'Updated property with single_unit');
  assert(updateSingleRes.data!.propertyStructure === 'single_unit', "Property structure updated to 'single_unit'");
  assert(updateSingleRes.data!.units.length === 1, 'Property now contains exactly 1 unit');
  assert(updateSingleRes.data!.units[0].nameOrNumber === 'Entire Studio', 'Unit name is Entire Studio');

  console.log('\n===============================================================');
  console.log(`SUBSTEP 5 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSubstep5Suite().catch((err) => {
  console.error('Unhandled error in Substep 5 suite:', err);
  process.exit(1);
});
