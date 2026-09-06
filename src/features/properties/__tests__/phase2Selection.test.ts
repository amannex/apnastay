// ============================================================================
// APNASTAY PROPERTY ENGINE — PHASE 2 AUTOMATED TEST SUITE
// Tests Entry Point & Dynamic Property Type / Rental Structure Selection
// ============================================================================

import {
  propertyBackend,
  getPropertyTemplate,
  getAllPropertyTemplates,
  validateStructureForTemplate,
  PROPERTY_TEMPLATES
} from '../index';
import type { BackendRequestContext, PropertyType, RentalStructure } from '../types';

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

async function runPhase2TestSuite() {
  console.log('===============================================================');
  console.log('APNASTAY PROPERTY ENGINE — PHASE 2 VERIFICATION SUITE');
  console.log('===============================================================\n');

  propertyBackend.reset();

  const OWNER_CAROL: BackendRequestContext = { userId: 303, isAdmin: false };
  const GUEST_ANONYMOUS: BackendRequestContext = { userId: 0, isAdmin: false };
  const OWNER_DAVE: BackendRequestContext = { userId: 404, isAdmin: false };

  // --------------------------------------------------------------------------
  // TEST 1: Verification of All 11 Required Property Types
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: All 11 Supported Property Types Coverage');

  const requiredTypes: PropertyType[] = [
    'house',
    'apartment',
    'villa',
    'pg',
    'hostel',
    'building',
    'independent_floor',
    'room',
    'coliving',
    'commercial',
    'other'
  ];

  for (const type of requiredTypes) {
    const template = getPropertyTemplate(type);
    assert(template !== undefined, `Template exists for '${type}'`);
    assert(template.label.length > 0, `Template '${type}' has human-readable label: "${template.label}"`);
    assert(template.allowedRentalStructures.length > 0, `Template '${type}' defines allowed rental structures`);
    assert(template.defaultRentalStructure !== undefined, `Template '${type}' defines default recommendation`);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Creation of Draft for Every Supported Property Type
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Creating Drafts for Every Supported Property Type');

  for (const type of requiredTypes) {
    const template = getPropertyTemplate(type);
    const res = propertyBackend.createDraft(OWNER_CAROL, {
      propertyType: type,
      rentalStructure: template.defaultRentalStructure,
      title: `Test ${template.label}`
    });

    assert(res.success === true, `Successfully created draft for '${type}'`);
    assert(res.data?.propertyType === type, `Draft propertyType is '${type}'`);
    assert(res.data?.status === 'draft', `Draft status is 'draft'`);
    assert(res.data?.ownerId === OWNER_CAROL.userId, `Draft belongs to Carol (303)`);
  }

  // --------------------------------------------------------------------------
  // TEST 3: "Other" Property Type with Custom Format Specification
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: "Other" Property Type with Custom Name Persistence');

  const customDraftRes = propertyBackend.createDraft(OWNER_CAROL, {
    propertyType: 'other',
    customPropertyType: 'Student Accommodation Hub',
    rentalStructure: 'individual_bed',
    title: 'Sunrise Student Housing'
  });

  assert(customDraftRes.success === true, 'Successfully created draft for custom "other" property');
  assert(customDraftRes.data?.propertyType === 'other', 'Property type is "other"');
  assert(customDraftRes.data?.customPropertyType === 'Student Accommodation Hub', 'Custom property format is persisted');
  assert(customDraftRes.data?.rentalStructure === 'individual_bed', 'Rental structure is individual_bed');

  const customPropId = customDraftRes.data!.id;
  const retrievedCustom = propertyBackend.getProperty(OWNER_CAROL, customPropId);
  assert(retrievedCustom.data?.customPropertyType === 'Student Accommodation Hub', 'Retrieved draft preserves custom type');

  // --------------------------------------------------------------------------
  // TEST 4: Every Rental Structure Support & Template Validation
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Every Rental Structure Coverage');

  const rentalStructures: RentalStructure[] = [
    'entire_property',
    'individual_unit',
    'individual_room',
    'individual_bed',
    'multiple_units'
  ];

  for (const structure of rentalStructures) {
    // 'other' allows all 5 rental structures
    const res = propertyBackend.createDraft(OWNER_CAROL, {
      propertyType: 'other',
      rentalStructure: structure,
      title: `Test Structure ${structure}`
    });
    assert(res.success === true, `Successfully created draft with structure '${structure}'`);
    assert(res.data?.rentalStructure === structure, `Stored rental structure is '${structure}'`);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Dynamic Combinations and Mappings
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 5: Dynamic Behavior Combinations');

  // House + Entire Property -> valid single-unit flow
  assert(validateStructureForTemplate('house', 'entire_property') === true, 'House + Entire Property is valid');
  assert(getPropertyTemplate('house').structure === 'single_unit', 'House maps to single_unit');

  // Apartment + Multiple Units -> valid multi-unit flow
  assert(validateStructureForTemplate('apartment', 'multiple_units') === true, 'Apartment + Multiple Units is valid');
  assert(getPropertyTemplate('apartment').structure === 'multi_unit', 'Apartment maps to multi_unit');

  // PG + Individual Room -> valid room flow
  assert(validateStructureForTemplate('pg', 'individual_room') === true, 'PG + Individual Room is valid');
  assert(getPropertyTemplate('pg').structure === 'rooms_beds', 'PG maps to rooms_beds');

  // PG + Individual Bed -> valid room + bed flow
  assert(validateStructureForTemplate('pg', 'individual_bed') === true, 'PG + Individual Bed is valid');

  // Incompatible combination: House + Individual Bed -> invalid
  assert(validateStructureForTemplate('house', 'individual_bed') === false, 'House + Individual Bed is rejected');

  // --------------------------------------------------------------------------
  // TEST 6: Unauthorized Access & Security Verification
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 6: Unauthorized Access Protection');

  // Unauthenticated user attempting to create draft
  const anonRes = propertyBackend.createDraft(GUEST_ANONYMOUS, {
    propertyType: 'apartment',
    rentalStructure: 'individual_unit'
  });
  assert(anonRes.success === false && anonRes.status === 401, 'Anonymous user blocked with 401');

  // Dave attempting to read Carol's custom draft
  const daveReadRes = propertyBackend.getProperty(OWNER_DAVE, customPropId);
  assert(daveReadRes.success === false && daveReadRes.status === 403, 'Dave blocked from reading Carol draft with 403');
  assert(daveReadRes.code === 'NOT_PROPERTY_OWNER', 'Error code is NOT_PROPERTY_OWNER');

  // --------------------------------------------------------------------------
  // TEST 7: Portfolio Retrieval & Draft Persistence
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 7: Portfolio Listing & Draft Persistence');

  const carolProps = propertyBackend.getOwnerProperties(OWNER_CAROL);
  assert(carolProps.success === true, 'Carol can retrieve her property portfolio');
  assert(carolProps.data!.length > 0, `Carol has ${carolProps.data!.length} drafts in portfolio`);
  
  const foundDraft = carolProps.data!.find((p) => p.id === customPropId);
  assert(foundDraft !== undefined, 'Newly created custom draft appears in owner portfolio');
  assert(foundDraft?.status === 'draft', 'Draft has status "draft" in portfolio');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`PHASE 2 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2TestSuite().catch((err) => {
  console.error('Unhandled Phase 2 test suite error:', err);
  process.exit(1);
});
