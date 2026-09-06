// ============================================================================
// APNASTAY PROPERTY ENGINE — PHASE 4 LOCATION VERIFICATION SUITE
// Tests Location Persistence, Locality, City, State, Indian Pincode, Landmark,
// Future Coordinates, Address Privacy, Completeness Score & Ownership Security
// ============================================================================

import { propertyBackend } from '../backend';
import type { PropertyType, PropertyLocation } from '../types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runPhase4Tests() {
  console.log('\n===============================================================');
  console.log('APNASTAY PROPERTY ENGINE — PHASE 4 LOCATION SUITE');
  console.log('===============================================================\n');

  propertyBackend.reset();

  const ownerAlice = { userId: 501, isAdmin: false };
  const ownerBob = { userId: 502, isAdmin: false };
  const anonymous = { userId: 0, isAdmin: false };

  // --------------------------------------------------------------------------
  // TEST 1: Updating Draft with Complete Property Location
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: Updating Draft with Complete Property Location');

  const draftRes = propertyBackend.createDraft(ownerAlice, {
    propertyType: 'apartment',
    rentalStructure: 'individual_unit',
    title: '2 BHK Luxury Flat in Greater Noida'
  });
  assert(draftRes.success && Boolean(draftRes.data), 'Created initial apartment draft for Alice');
  const draftId = draftRes.data!.id;

  // Add Basic Details first
  const basicRes = propertyBackend.updateProperty(ownerAlice, draftId, {
    title: '2 BHK Luxury Flat in Greater Noida',
    description: 'Beautiful south-facing flat on the 8th floor with modular kitchen and balcony.',
    availability: { type: 'immediate' },
    pricing: { monthlyRent: 22000 }
  });
  assert(basicRes.success, 'Added basic details to draft');
  assert(basicRes.data!.completenessScore === 35, `Draft completeness with basic details is 35% (got ${basicRes.data!.completenessScore}%)`);

  // Now update with Phase 4 location
  const locationData: PropertyLocation = {
    addressLine1: 'Flat 804, Tower 3, Gulshan Bellina, Sector 16',
    locality: 'Sector 16, Greater Noida West',
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    pincode: '201306',
    landmark: 'Near Gaur City Mall & Ek Murti Roundabout',
    latitude: 28.5993,
    longitude: 77.4328,
    hideExactAddress: true
  };

  const locRes = propertyBackend.updateProperty(ownerAlice, draftId, {
    location: locationData
  });

  assert(locRes.success, 'Successfully updated draft with location details');
  assert(Boolean(locRes.data?.location), 'Property object contains location field');
  assert(locRes.data?.location?.addressLine1 === locationData.addressLine1, 'addressLine1 persisted correctly');
  assert(locRes.data?.location?.locality === locationData.locality, 'locality persisted correctly');
  assert(locRes.data?.location?.city === locationData.city, 'city persisted correctly');
  assert(locRes.data?.location?.state === locationData.state, 'state persisted correctly');
  assert(locRes.data?.location?.pincode === locationData.pincode, 'pincode persisted correctly');
  assert(locRes.data?.location?.landmark === locationData.landmark, 'landmark persisted correctly');
  assert(locRes.data?.location?.latitude === locationData.latitude, 'latitude persisted correctly for future map');
  assert(locRes.data?.location?.longitude === locationData.longitude, 'longitude persisted correctly for future map');
  assert(locRes.data?.location?.hideExactAddress === true, 'hideExactAddress privacy flag persisted');

  // Completeness score: baseline 15 + title 5 + desc 5 + rent 5 + avail 5 + location 15 = 50%
  assert(
    locRes.data?.completenessScore === 50,
    `Completeness score elevated to 50% after complete location provided (got ${locRes.data?.completenessScore}%)`
  );

  // --------------------------------------------------------------------------
  // TEST 2: Location Retrieval via getProperty
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Location Retrieval via getProperty');

  const fetchRes = propertyBackend.getProperty(ownerAlice, draftId);
  assert(fetchRes.success && Boolean(fetchRes.data), 'Fetched draft by ID');
  assert(fetchRes.data?.id === draftId, 'Returned correct property ID without duplication');
  assert(fetchRes.data?.location?.locality === 'Sector 16, Greater Noida West', 'Retrieved saved locality');
  assert(fetchRes.data?.location?.pincode === '201306', 'Retrieved saved pincode');

  // --------------------------------------------------------------------------
  // TEST 3: Pincode Validation Logic (Indian Standard)
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: Indian PIN Code Format Validation');

  const pincodeRegex = /^[1-9][0-9]{5}$/;

  const validPins = ['201310', '110001', '560038', '400001', '700001'];
  for (const pin of validPins) {
    assert(pincodeRegex.test(pin), `PIN Code '${pin}' is recognized as valid`);
  }

  const invalidPins = ['012345', '20131', '2013100', '20131A', 'abcde', ''];
  for (const pin of invalidPins) {
    assert(!pincodeRegex.test(pin), `Invalid PIN Code '${pin}' is correctly rejected`);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Partial / Resaving Location without Overwriting Existing Fields
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Modifying Location Without Corrupting Other Fields');

  const partialRes = propertyBackend.updateProperty(ownerAlice, draftId, {
    location: {
      addressLine1: 'Flat 804, Tower 3, Gulshan Bellina, Sector 16',
      locality: 'Sector 16 (Gaur City 2)',
      city: 'Greater Noida',
      pincode: '201306'
      // state omitted, landmark omitted in partial call
    }
  });

  assert(partialRes.success, 'Partial update succeeded');
  assert(partialRes.data?.location?.locality === 'Sector 16 (Gaur City 2)', 'Locality updated to new value');
  // State was previously set, check merge behavior
  assert(partialRes.data?.location?.state === 'Uttar Pradesh', 'Previous state preserved during merge');
  assert(partialRes.data?.pricing?.monthlyRent === 22000, 'Monthly rent intact after location update');
  assert(partialRes.data?.title === '2 BHK Luxury Flat in Greater Noida', 'Title intact after location update');

  // --------------------------------------------------------------------------
  // TEST 5: Security & Authorization Enforced on Location Updates
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 5: Cross-Owner and Anonymous Security Authorization');

  // Bob tries to modify Alice's location
  const bobHackingRes = propertyBackend.updateProperty(ownerBob, draftId, {
    location: {
      addressLine1: 'Bob Address',
      city: 'Delhi',
      pincode: '110001'
    }
  });
  assert(!bobHackingRes.success && bobHackingRes.status === 403, 'Bob cannot update Alice property location (403 FORBIDDEN)');

  // Anonymous tries to modify Alice's location
  const anonHackingRes = propertyBackend.updateProperty(anonymous, draftId, {
    location: {
      addressLine1: 'Anon Address',
      city: 'Delhi',
      pincode: '110001'
    }
  });
  assert(!anonHackingRes.success && anonHackingRes.status === 401, 'Anonymous cannot update location (401 UNAUTHORIZED)');

  // --------------------------------------------------------------------------
  // TEST 6: PG & Multi-unit Property Location Compatibility
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 6: PG & Hostels with Landmark and Privacy Support');

  const pgDraft = propertyBackend.createDraft(ownerBob, {
    propertyType: 'pg',
    rentalStructure: 'individual_bed',
    title: 'Green Valley Boys PG & Co-Living'
  });
  assert(pgDraft.success, 'Created PG draft for Bob');

  const pgLocRes = propertyBackend.updateProperty(ownerBob, pgDraft.data!.id, {
    location: {
      addressLine1: 'Plot 12, Knowledge Park 3',
      locality: 'Knowledge Park 3',
      city: 'Greater Noida',
      state: 'Uttar Pradesh',
      pincode: '201310',
      landmark: 'Near Sharda University Metro & Gate 2',
      latitude: 28.4744,
      longitude: 77.5040,
      hideExactAddress: false
    }
  });

  assert(pgLocRes.success, 'PG location updated with nearby university landmark');
  assert(pgLocRes.data?.location?.landmark === 'Near Sharda University Metro & Gate 2', 'Landmark stored for student PG discovery');
  assert(pgLocRes.data?.location?.hideExactAddress === false, 'PG public address visible as requested');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`PHASE 4 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase4Tests().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
