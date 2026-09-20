// ============================================================================
// APNASTAY PROPERTY ENGINE — SUBSTEP 1 PROPERTY TYPE TEST SUITE
// Validates all 9 property types, stable internal IDs, labels, and templates
// ============================================================================

import { getPropertyTemplate, validateTypeAndStructure } from '../index';
import { APNASTAY_PROPERTY_TYPES } from '../components/wizard/StepPropertyType';
import type { PropertyType } from '../types';

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

async function runSubstep1Suite() {
  console.log('===============================================================');
  console.log('APNASTAY PROPERTY ENGINE — SUBSTEP 1 VERIFICATION TEST SUITE');
  console.log('===============================================================\n');

  console.log('🧪 TEST 1: Exactly 9 selectable property types in Substep 1');
  assert(APNASTAY_PROPERTY_TYPES.length === 9, 'Exactly 9 property types defined');

  const expectedIds: PropertyType[] = [
    'apartment',
    'independent_house',
    'builder_floor',
    'pg',
    'hostel',
    'co_living',
    'room',
    'bed_space',
    'other'
  ];

  expectedIds.forEach((id) => {
    const found = APNASTAY_PROPERTY_TYPES.find((opt) => opt.id === id);
    assert(Boolean(found), `Option '${id}' exists in APNASTAY_PROPERTY_TYPES`);
    assert(Boolean(found?.title), `Option '${id}' has a title: "${found?.title}"`);
    assert(Boolean(found?.description), `Option '${id}' has a description`);
    assert(Boolean(found?.icon), `Option '${id}' has an associated icon component`);
  });

  console.log('\n🧪 TEST 2: Template existence & validity for all 9 types');
  expectedIds.forEach((id) => {
    const template = getPropertyTemplate(id);
    assert(Boolean(template), `Template exists for '${id}'`);
    assert(Boolean(template.label), `Template '${id}' has label: "${template.label}"`);
    assert(template.allowedRentalStructures.length > 0, `Template '${id}' specifies allowed structures`);
  });

  console.log('\n🧪 TEST 3: Validation accepts all 9 stable property types');
  expectedIds.forEach((id) => {
    const validation = validateTypeAndStructure(id, undefined);
    assert(validation.isValid, `Validation succeeds for type '${id}'`);
  });

  console.log('\n🧪 TEST 4: Validation rejects empty / invalid types');
  assert(!validateTypeAndStructure('', undefined).isValid, 'Rejects empty string');
  assert(!validateTypeAndStructure(null, undefined).isValid, 'Rejects null');
  assert(!validateTypeAndStructure('non_existent_type', undefined).isValid, 'Rejects invalid type');

  console.log('\n===============================================================');
  console.log(`SUBSTEP 1 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSubstep1Suite();
