// ============================================================================
// APNASTAY PROPERTY ENGINE — PHASE 6 AMENITIES & FEATURES VERIFICATION SUITE
// Tests Extensible Registry, Categories, Property-Specific Suggestions,
// Custom Amenities Validation/Sanitization, Backend Persistence, Completeness Score (+10%)
// & Cross-Owner Authorization Isolation
// ============================================================================

import {
  AMENITY_CATEGORIES,
  AMENITY_REGISTRY,
  getAmenitiesByCategory,
  getSuggestedAmenitiesForProperty,
  validateCustomAmenity,
  sanitizeCustomAmenity
} from '../amenities';
import { propertyBackend } from '../backend';

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

async function runPhase6Tests() {
  console.log('\n===============================================================');
  console.log('APNASTAY PROPERTY ENGINE — PHASE 6 AMENITIES & FEATURES SUITE');
  console.log('===============================================================\n');

  propertyBackend.reset();

  const ownerAlice = { userId: 801, isAdmin: false };
  const ownerBob = { userId: 802, isAdmin: false };
  const anonymous = { userId: 0, isAdmin: false };

  // --------------------------------------------------------------------------
  // TEST 1: Extensible Registry & Categorization
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: Extensible Registry & Categorization');

  const catIds = AMENITY_CATEGORIES.map((c) => c.id);
  assert(catIds.includes('basic'), 'Registry contains "basic" utilities category');
  assert(catIds.includes('comfort'), 'Registry contains "comfort" appliances category');
  assert(catIds.includes('building'), 'Registry contains "building" facilities category');
  assert(catIds.includes('services'), 'Registry contains "services" & food category');

  const grouped = getAmenitiesByCategory();
  assert(grouped.basic.length >= 4, `Basic category has ${grouped.basic.length} amenities`);
  assert(grouped.comfort.length >= 4, `Comfort category has ${grouped.comfort.length} amenities`);
  assert(grouped.building.length >= 4, `Building category has ${grouped.building.length} amenities`);
  assert(grouped.services.length >= 3, `Services category has ${grouped.services.length} amenities`);

  const basicIds = grouped.basic.map((a) => a.id);
  assert(basicIds.includes('wifi'), 'WiFi is in basic category');
  assert(basicIds.includes('water_supply'), 'Water Supply is in basic category');
  assert(basicIds.includes('power_backup'), 'Power Backup is in basic category');
  assert(basicIds.includes('security'), 'Security is in basic category');

  const comfortIds = grouped.comfort.map((a) => a.id);
  assert(comfortIds.includes('ac'), 'AC is in comfort category');
  assert(comfortIds.includes('refrigerator'), 'Refrigerator is in comfort category');

  const buildingIds = grouped.building.map((a) => a.id);
  assert(buildingIds.includes('lift'), 'Lift is in building category');
  assert(buildingIds.includes('parking'), 'Dedicated Parking is in building category');
  assert(buildingIds.includes('balcony'), 'Balcony is in building category');

  const servicesIds = grouped.services.map((a) => a.id);
  assert(servicesIds.includes('food'), 'Daily Food is in services category');
  assert(servicesIds.includes('laundry'), 'Laundry is in services category');
  assert(servicesIds.includes('housekeeping'), 'Housekeeping is in services category');

  // --------------------------------------------------------------------------
  // TEST 2: Property-Specific Suggestions Engine
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Property-Specific Suggestions Engine');

  const pgSuggestions = getSuggestedAmenitiesForProperty('pg').map((a) => a.id);
  assert(pgSuggestions.includes('food'), 'PG suggests Food');
  assert(pgSuggestions.includes('laundry'), 'PG suggests Laundry');
  assert(pgSuggestions.includes('wifi'), 'PG suggests Wi-Fi');
  assert(pgSuggestions.includes('cctv'), 'PG suggests CCTV');
  assert(pgSuggestions.includes('housekeeping'), 'PG suggests Housekeeping');

  const aptSuggestions = getSuggestedAmenitiesForProperty('apartment').map((a) => a.id);
  assert(aptSuggestions.includes('lift'), 'Apartment suggests Lift');
  assert(aptSuggestions.includes('parking'), 'Apartment suggests Parking');
  assert(aptSuggestions.includes('balcony'), 'Apartment suggests Balcony');
  assert(aptSuggestions.includes('power_backup'), 'Apartment suggests Power Backup');

  const houseSuggestions = getSuggestedAmenitiesForProperty('house').map((a) => a.id);
  assert(houseSuggestions.includes('parking'), 'House suggests Parking');
  assert(houseSuggestions.includes('garden'), 'House suggests Garden');
  assert(houseSuggestions.includes('balcony'), 'House suggests Balcony');

  const fallbackSuggestions = getSuggestedAmenitiesForProperty(null);
  assert(fallbackSuggestions.length >= 3, 'Null property type provides default fallback suggestions');

  // --------------------------------------------------------------------------
  // TEST 3: Custom Amenity Sanitization & Validation
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: Custom Amenity Sanitization & Validation');

  assert(sanitizeCustomAmenity('  Rooftop   Cafe  ') === 'Rooftop Cafe', 'Sanitizes extra whitespaces');
  assert(sanitizeCustomAmenity('  EV   Charging   ') === 'EV Charging', 'Sanitizes EV Charging');

  const validCustom = validateCustomAmenity('EV Charging Station', ['wifi'], ['Table Tennis']);
  assert(validCustom.valid, 'Accepts novel valid custom amenity');
  assert(validCustom.sanitized === 'EV Charging Station', 'Returns sanitized string');

  const emptyCustom = validateCustomAmenity('   ', [], []);
  assert(!emptyCustom.valid, 'Rejects whitespace-only custom amenity');

  const shortCustom = validateCustomAmenity('A', [], []);
  assert(!shortCustom.valid, 'Rejects single character custom amenity (< 2 chars)');

  const longCustom = validateCustomAmenity('A'.repeat(51), [], []);
  assert(!longCustom.valid, 'Rejects over-length custom amenity (> 50 chars)');

  const dupCustom = validateCustomAmenity('ev charging station', [], ['EV Charging Station']);
  assert(!dupCustom.valid, 'Rejects case-insensitive duplicate custom amenity');

  const standardDup = validateCustomAmenity('WiFi', [], []);
  assert(!standardDup.valid, 'Rejects custom amenity that matches standard catalog item');
  assert(standardDup.error?.includes('standard amenities above'), 'Informs user item exists in standard catalog');

  // --------------------------------------------------------------------------
  // TEST 4: Backend Persistence & Completeness Score Boost (+10%)
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Backend Persistence & Completeness Score Boost');

  const draftRes = propertyBackend.createDraft(ownerAlice, {
    propertyType: 'apartment',
    rentalStructure: 'individual_unit',
    title: 'DLF Regal Gardens 3BHK'
  });
  assert(draftRes.success, 'Created apartment draft for Alice');
  const draftId = draftRes.data!.id;
  const initialScore = draftRes.data!.completenessScore;

  const updateRes = propertyBackend.updateAmenities(
    ownerAlice,
    draftId,
    ['wifi', 'power_backup', 'lift', 'parking', 'balcony'],
    ['EV Fast Charger', 'Billiards Room']
  );
  assert(updateRes.success, 'Updated amenities on property draft');
  assert(updateRes.data!.amenities?.length === 5, 'Persisted 5 standard amenities');
  assert(updateRes.data!.customAmenities?.length === 2, 'Persisted 2 custom amenities');
  assert(
    updateRes.data!.completenessScore === initialScore + 10,
    `Completeness score elevated by +10% with amenities (got ${updateRes.data!.completenessScore}%, initial was ${initialScore}%)`
  );

  // Read back draft
  const fetched = propertyBackend.getProperty(ownerAlice, draftId).data!;
  assert(fetched.amenities?.includes('wifi'), 'Draft read returns wifi');
  assert(fetched.amenities?.includes('lift'), 'Draft read returns lift');
  assert(fetched.customAmenities?.includes('EV Fast Charger'), 'Draft read returns EV Fast Charger');

  // --------------------------------------------------------------------------
  // TEST 5: Incremental Add / Remove Custom Amenity Operations
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 5: Incremental Custom Amenity Add/Remove Operations');

  const addRes1 = propertyBackend.addCustomAmenity(ownerAlice, draftId, 'Infinity Swimming Pool');
  assert(addRes1.success, 'Added custom amenity via addCustomAmenity');
  assert(addRes1.data!.customAmenities?.includes('Infinity Swimming Pool'), 'Contains Infinity Swimming Pool');
  assert(addRes1.data!.customAmenities?.length === 3, 'Total 3 custom amenities now');

  const removeRes = propertyBackend.removeCustomAmenity(ownerAlice, draftId, 'EV Fast Charger');
  assert(removeRes.success, 'Removed custom amenity via removeCustomAmenity');
  assert(!removeRes.data!.customAmenities?.includes('EV Fast Charger'), 'EV Fast Charger was removed');
  assert(removeRes.data!.customAmenities?.includes('Infinity Swimming Pool'), 'Infinity Pool remains');

  // --------------------------------------------------------------------------
  // TEST 6: Generic updateProperty Persistence
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 6: Generic updateProperty Persistence');

  const genericRes = propertyBackend.updateProperty(ownerAlice, draftId, {
    amenities: ['wifi', 'security', 'cctv'],
    customAmenities: ['Rooftop Cafe']
  });
  assert(genericRes.success, 'Generic updateProperty accepted amenities');
  assert(genericRes.data!.amenities?.length === 3, 'Standard amenities updated to 3');
  assert(genericRes.data!.customAmenities?.[0] === 'Rooftop Cafe', 'Custom amenities updated to Rooftop Cafe');

  // --------------------------------------------------------------------------
  // TEST 7: Cross-Owner Authorization & Security Isolation
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 7: Cross-Owner Authorization & Security Isolation');

  const bobUpdate = propertyBackend.updateAmenities(
    ownerBob,
    draftId,
    ['swimming_pool'],
    ['Unauthorized Perk']
  );
  assert(!bobUpdate.success, 'Bob blocked from editing Alice draft amenities');
  assert(bobUpdate.status === 403, 'Returns 403 Forbidden');
  assert(bobUpdate.error?.includes('Access denied'), 'Error message specifies access denied');

  const anonUpdate = propertyBackend.updateAmenities(
    anonymous,
    draftId,
    ['wifi'],
    []
  );
  assert(!anonUpdate.success, 'Anonymous user blocked from editing amenities');
  assert(anonUpdate.status === 401, 'Returns 401 Unauthorized');

  // Confirm Alice data untampered
  const intact = propertyBackend.getProperty(ownerAlice, draftId).data!;
  assert(!intact.amenities?.includes('swimming_pool'), 'Alice draft amenities remained uncompromised');

  console.log('\n===============================================================');
  console.log(`PHASE 6 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6Tests().catch((err) => {
  console.error('Fatal error running Phase 6 test suite:', err);
  process.exit(1);
});
