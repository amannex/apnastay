// ============================================================================
// APNASTAY PROPERTY ENGINE — PHASE 9 RULES & PREFERENCES TEST SUITE
// Tests configurable rules (Occupancy, Guests, Food/Kitchen, Pets, Substances,
// Timing/Curfew, Move-in Verification, Custom Rules), adaptive suggestions,
// sanitization, tri-state to legacy boolean synchronization, and backend security.
// ============================================================================

import { propertyBackend, BackendRequestContext } from '../backend';
import {
  getRulesConfigForProperty,
  createDefaultRules,
  sanitizeRuleText,
  validateCustomRule,
  validatePropertyRules,
  sanitizePropertyRules,
  getPolicyBadgeInfo,
  formatResidentSuitability,
  formatFoodPolicy,
  formatKitchenPolicy,
  formatTimingPolicy
} from '../rules';
import type { PropertyRules } from '../types';

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

async function runPhase9Tests() {
  console.log('\n===============================================================');
  console.log('APNASTAY PROPERTY ENGINE — PHASE 9 RULES & PREFERENCES SUITE');
  console.log('===============================================================\n');

  const ownerAlice: BackendRequestContext = { userId: 101, isAdmin: false };
  const ownerBob: BackendRequestContext = { userId: 202, isAdmin: false };
  const anonymousUser: BackendRequestContext = { userId: 0, isAdmin: false };

  // Reset store
  (propertyBackend as any).properties.clear();

  // --------------------------------------------------------------------------
  // TEST 1: Adaptive Rules Suggestions & Configurations
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: Adaptive Rules Configurations Across Property Types');
  {
    const pgConfig = getRulesConfigForProperty('pg', 'individual_bed');
    assert(pgConfig.archetype === 'pg_hostel', 'PG identifies archetype as pg_hostel');
    assert(pgConfig.prioritySections.includes('food'), 'PG prioritizes food policy');
    assert(pgConfig.prioritySections.includes('timing'), 'PG prioritizes timing/curfew');
    assert(pgConfig.prioritySections.includes('guests'), 'PG prioritizes guest policy');
    assert(pgConfig.defaultGateTime === '22:30', 'PG defaults gate closing time to 22:30');
    assert(pgConfig.suggestedRules.length >= 4, 'PG provides multiple suggested rules');

    const hostelConfig = getRulesConfigForProperty('hostel', 'individual_bed');
    assert(hostelConfig.archetype === 'pg_hostel', 'Hostel identifies archetype as pg_hostel');

    const colivingConfig = getRulesConfigForProperty('coliving', 'individual_room');
    assert(colivingConfig.archetype === 'coliving', 'Co-Living identifies archetype as coliving');
    assert(
      colivingConfig.suggestedRules.some((r) => r.toLowerCase().includes('kitchen')),
      'Co-Living suggests community kitchen rules'
    );

    const aptConfig = getRulesConfigForProperty('apartment', 'entire_property');
    assert(aptConfig.archetype === 'apartment_house', 'Apartment identifies archetype as apartment_house');
    assert(
      aptConfig.suggestedRules.some((r) => r.toLowerCase().includes('society') || r.toLowerCase().includes('parking')),
      'Apartment suggests society quiet hours and parking rules'
    );

    const defaultPg = createDefaultRules('pg', 'individual_bed');
    assert(defaultPg.guestPolicy === 'with_restrictions', 'PG default guest policy is with_restrictions');
    assert(defaultPg.timingType === 'gate_closing', 'PG default timing type is gate_closing');
    assert(defaultPg.foodPolicy === 'all_meals', 'PG default food policy is all_meals');
    assert(defaultPg.requiresIdProof === true, 'PG default requires ID proof');

    const defaultApt = createDefaultRules('apartment', 'entire_property');
    assert(defaultApt.guestPolicy === 'allowed', 'Apartment default guest policy is allowed');
    assert(defaultApt.petPolicy === 'with_restrictions', 'Apartment default pet policy is with_restrictions');
    assert(defaultApt.timingType === 'open_24_7', 'Apartment default timing type is open_24_7');
    assert(defaultApt.kitchenAccess === 'private', 'Apartment default kitchen is private');
  }

  // --------------------------------------------------------------------------
  // TEST 2: Sanitization, Validation & XSS Prevention
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Sanitization & XSS Prevention');
  {
    const malicious = '<script>alert("hack")</script>No loud music after <b>10 PM</b>';
    const clean = sanitizeRuleText(malicious);
    assert(clean === 'No loud music after 10 PM', 'Strips script tag and HTML tags completely');
    assert(!clean.includes('<script>'), 'Clean text does not contain <script>');
    assert(!clean.includes('<b>'), 'Clean text does not contain <b>');

    const longText = 'a'.repeat(600);
    const clamped = sanitizeRuleText(`   ${longText}   `, 500);
    assert(clamped.length === 500, 'Clamps text at maximum character limit');

    assert(validateCustomRule('No loud parties').valid, 'Valid rule string passes validation');
    assert(!validateCustomRule('').valid, 'Empty rule fails validation');
    assert(!validateCustomRule('  ').valid, 'Whitespace-only rule fails validation');
    assert(!validateCustomRule('ab').valid, 'Rule shorter than 3 characters fails validation');

    const invalidRules: Partial<PropertyRules> = {
      maxOccupants: -2
    };
    const val = validatePropertyRules(invalidRules);
    assert(!val.valid, 'Negative maxOccupants is flagged as invalid');
    assert(val.errors.some((e) => e.includes('occupants')), 'Error message mentions max occupants');

    const rulesArray = Array.from({ length: 35 }, (_, i) => `House rule ${i + 1}`);
    const valTooMany = validatePropertyRules({ customRules: rulesArray });
    assert(!valTooMany.valid, 'Excessive custom rules (>30) flagged as invalid');
  }

  // --------------------------------------------------------------------------
  // TEST 3: Tri-State Policy & Legacy Boolean Synchronization
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: Tri-State Policy & Legacy Boolean Synchronization');
  {
    const synced1 = sanitizePropertyRules({ smokingPolicy: 'allowed' });
    assert(synced1.smokingAllowed === true, 'smokingPolicy allowed -> smokingAllowed true');

    const synced2 = sanitizePropertyRules({ smokingPolicy: 'not_allowed' });
    assert(synced2.smokingAllowed === false, 'smokingPolicy not_allowed -> smokingAllowed false');

    const synced3 = sanitizePropertyRules({ smokingAllowed: true });
    assert(synced3.smokingPolicy === 'allowed', 'legacy smokingAllowed true -> smokingPolicy allowed');

    const synced4 = sanitizePropertyRules({ smokingAllowed: false });
    assert(synced4.smokingPolicy === 'not_allowed', 'legacy smokingAllowed false -> smokingPolicy not_allowed');

    const synced5 = sanitizePropertyRules({ petPolicy: 'allowed' });
    assert(synced5.petsAllowed === true, 'petPolicy allowed -> petsAllowed true');

    const synced6 = sanitizePropertyRules({ petsAllowed: false });
    assert(synced6.petPolicy === 'not_allowed', 'legacy petsAllowed false -> petPolicy not_allowed');

    const synced7 = sanitizePropertyRules({ guestPolicy: 'with_restrictions' });
    assert(synced7.visitorsAllowed === true, 'guestPolicy with_restrictions -> visitorsAllowed true');

    const synced8 = sanitizePropertyRules({ guestPolicy: 'not_allowed' });
    assert(synced8.visitorsAllowed === false, 'guestPolicy not_allowed -> visitorsAllowed false');

    const clean = sanitizePropertyRules({
      suitableFor: ['students', 'students', 'working_professionals'],
      customRules: ['No smoking', 'No smoking', 'Gate closes at 10']
    });
    assert(clean.suitableFor?.length === 2, 'Deduplicates resident suitability options');
    assert(clean.customRules?.length === 2, 'Deduplicates custom rules');
  }

  // --------------------------------------------------------------------------
  // TEST 4: Backend Security & Ownership Verification
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Backend Security & Ownership Verification');
  {
    // Create draft under Alice
    const createRes = propertyBackend.createDraft(ownerAlice, {
      propertyType: 'apartment',
      rentalStructure: 'entire_property',
      title: 'Green Valley Residency'
    });
    assert(createRes.success, 'Successfully created draft for Alice');
    const propertyId = createRes.data!.id;

    // Anonymous blocked
    const unauthRes = propertyBackend.updatePropertyRules(anonymousUser, propertyId, {
      guestPolicy: 'allowed'
    });
    assert(!unauthRes.success, 'Anonymous user blocked from updating rules');
    assert(unauthRes.status === 401, 'Returns status 401');
    assert(unauthRes.code === 'UNAUTHENTICATED', 'Code is UNAUTHENTICATED');

    // Bob blocked from modifying Alice property
    const bobRes = propertyBackend.updatePropertyRules(ownerBob, propertyId, {
      guestPolicy: 'not_allowed'
    });
    assert(!bobRes.success, 'Bob blocked from modifying Alice rules');
    assert(bobRes.status === 403, 'Returns status 403');
    assert(bobRes.code === 'NOT_PROPERTY_OWNER', 'Code is NOT_PROPERTY_OWNER');
  }

  // --------------------------------------------------------------------------
  // TEST 5: Legitimate Rules Update & Completeness Score Boost
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 5: Legitimate Rules Update & Completeness Score Elevation');
  {
    const createRes = propertyBackend.createDraft(ownerAlice, {
      propertyType: 'apartment',
      rentalStructure: 'entire_property',
      title: 'Sunshine Villa'
    });
    const propertyId = createRes.data!.id;
    const initialScore = createRes.data!.completenessScore;

    const rulesPayload: Partial<PropertyRules> = {
      maxOccupants: 6,
      suitableFor: ['families', 'couples'],
      genderPreference: 'any',
      guestPolicy: 'allowed',
      petPolicy: 'with_restrictions',
      petRestrictions: 'Small pets allowed with vaccination card.',
      smokingPolicy: 'not_allowed',
      alcoholPolicy: 'allowed',
      timingType: 'open_24_7',
      kitchenAccess: 'private',
      cookingPolicy: 'veg_and_nonveg',
      requiresIdProof: true,
      requiresPoliceVerification: true,
      customRules: [
        'Garbage segregation mandatory',
        'Quiet hours between 10 PM and 7 AM'
      ],
      additionalNotes: 'Welcome to Sunshine Villa!'
    };

    const updateRes = propertyBackend.updatePropertyRules(ownerAlice, propertyId, rulesPayload);
    assert(updateRes.success, 'Successfully updated property rules');
    assert(updateRes.status === 200, 'Returns status 200');
    assert(updateRes.data?.maxOccupants === 6, 'Persisted maxOccupants as 6');
    assert(updateRes.data?.guestPolicy === 'allowed', 'Persisted guestPolicy as allowed');
    assert(updateRes.data?.smokingAllowed === false, 'Synced smokingAllowed boolean to false');
    assert(updateRes.data?.visitorsAllowed === true, 'Synced visitorsAllowed boolean to true');
    assert(updateRes.data?.customRules?.length === 2, 'Persisted 2 custom rules');

    // Fetch and check score
    const fetchRes = propertyBackend.getProperty(ownerAlice, propertyId);
    assert(fetchRes.success, 'Successfully fetched updated property');
    assert(fetchRes.data?.completenessScore! >= initialScore + 5, 'Completeness score elevated with rules (+5)');
    assert(fetchRes.data?.rules?.maxOccupants === 6, 'Draft retains rules in store');

    // Test input sanitization
    const sanitizeRes = propertyBackend.updatePropertyRules(ownerAlice, propertyId, {
      customRules: ['<script>evil()</script>Curfew at 10 PM   ']
    });
    assert(sanitizeRes.success, 'Updated rules with sanitized string');
    assert(sanitizeRes.data?.customRules?.[0] === 'Curfew at 10 PM', 'Stripped HTML tags from custom rule');

    // Test invalid payload rejection
    const invalidRes = propertyBackend.updatePropertyRules(ownerAlice, propertyId, {
      maxOccupants: 0
    });
    assert(!invalidRes.success, 'Rejected invalid payload (maxOccupants = 0)');
    assert(invalidRes.status === 400, 'Returns status 400');
    assert(invalidRes.code === 'INVALID_RULES_CONFIG', 'Code is INVALID_RULES_CONFIG');
  }

  // --------------------------------------------------------------------------
  // TEST 6: Formatting & Display Helpers
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 6: Presentation and Formatting Helpers');
  {
    assert(getPolicyBadgeInfo('allowed').label === 'Allowed', 'Formats allowed badge label');
    assert(getPolicyBadgeInfo('not_allowed').label === 'Not Allowed', 'Formats not_allowed badge label');
    assert(getPolicyBadgeInfo('with_restrictions').label === 'With Restrictions', 'Formats with_restrictions badge label');
    assert(getPolicyBadgeInfo('not_specified').label === 'Not Specified', 'Formats not_specified badge label');

    assert(formatResidentSuitability('working_professionals') === 'Working Professionals', 'Formats working_professionals');
    assert(formatResidentSuitability('students') === 'Students', 'Formats students');
    assert(formatResidentSuitability('families') === 'Families', 'Formats families');

    assert(formatFoodPolicy('all_meals') === 'All Meals Included', 'Formats all_meals');
    assert(formatFoodPolicy('breakfast_only') === 'Breakfast Only', 'Formats breakfast_only');
    assert(formatFoodPolicy('no_meals') === 'No Meals Included', 'Formats no_meals');

    assert(formatKitchenPolicy('private', 'veg_only') === 'Private Kitchen (Veg Only)', 'Formats private veg kitchen');
    assert(formatKitchenPolicy('shared', 'veg_and_nonveg') === 'Shared Kitchen (Veg & Non-Veg)', 'Formats shared veg/nonveg kitchen');
    assert(formatKitchenPolicy('not_available') === 'No Kitchen Access', 'Formats no kitchen');

    assert(formatTimingPolicy('open_24_7') === '24/7 Open Access', 'Formats 24/7 access');
    assert(formatTimingPolicy('gate_closing', '22:30') === 'Gate Closes at 22:30', 'Formats gate closing with time');
    assert(formatTimingPolicy('flexible') === 'Flexible Timings', 'Formats flexible timing');
  }

  console.log('\n===============================================================');
  console.log(`PHASE 9 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase9Tests();
