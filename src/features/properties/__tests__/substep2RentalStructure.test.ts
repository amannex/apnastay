// ============================================================================
// APNASTAY PROPERTY ENGINE — SUBSTEP 2 RENTAL STRUCTURE TEST SUITE
// Validates all 5 rental structures, stable internal IDs, labels, and validation
// ============================================================================

import { validateTypeAndStructure } from '../index';
import { APNASTAY_RENTAL_STRUCTURES } from '../components/wizard/StepRentalStructure';
import type { RentalStructure, PropertyType } from '../types';

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

async function runSubstep2Suite() {
  console.log('===============================================================');
  console.log('APNASTAY PROPERTY ENGINE — SUBSTEP 2 VERIFICATION TEST SUITE');
  console.log('===============================================================\n');

  console.log('🧪 TEST 1: Exactly 5 selectable rental structures in Substep 2');
  assert(APNASTAY_RENTAL_STRUCTURES.length === 5, 'Exactly 5 rental structures defined');

  const expectedIds: RentalStructure[] = [
    'entire_property',
    'individual_room',
    'shared_room',
    'individual_bed',
    'multiple_units'
  ];

  expectedIds.forEach((id) => {
    const found = APNASTAY_RENTAL_STRUCTURES.find((opt) => opt.id === id);
    assert(Boolean(found), `Option '${id}' exists in APNASTAY_RENTAL_STRUCTURES`);
    assert(Boolean(found?.title), `Option '${id}' has a title: "${found?.title}"`);
    assert(Boolean(found?.subtitle), `Option '${id}' has a subtitle: "${found?.subtitle}"`);
    assert(Boolean(found?.icon), `Option '${id}' has an associated icon component`);
  });

  console.log('\n🧪 TEST 2: Validation accepts all 5 stable rental structures with property types');
  const testTypes: PropertyType[] = [
    'apartment',
    'pg',
    'hostel',
    'co_living',
    'room',
    'other'
  ];

  expectedIds.forEach((structureId) => {
    // Test that validation allows the structure for compatible accommodation types
    const compatibleType = structureId === 'individual_bed' || structureId === 'shared_room' ? 'pg' : 'apartment';
    const validation = validateTypeAndStructure(compatibleType, structureId);
    assert(validation.isValid, `Structure '${structureId}' validates successfully with '${compatibleType}'`);
  });

  console.log('\n🧪 TEST 3: Validation rejects invalid rental structure');
  assert(!validateTypeAndStructure('apartment', 'non_existent_structure').isValid, 'Rejects invalid structure');

  console.log('\n===============================================================');
  console.log(`SUBSTEP 2 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSubstep2Suite();
