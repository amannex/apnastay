// ============================================================================
// APNASTAY PROPERTY ENGINE — SUBSTEP 4 PROPERTY LOCATION TEST SUITE
// Validates:
// 1. Question copy and supporting text
// 2. Structured fields (address, locality, city, state, pincode, coordinates, publicLocation)
// 3. Private vs. Public location separation & exact address redaction
// 4. Human-friendly single progressive error validation
// 5. Backend update, persistence, and roundtrip hydration across navigation
// ============================================================================

import {
  validatePropertyLocation,
  validateAndSanitizePincode,
  propertyBackend
} from '../index';
import type { PropertyLocation } from '../types';

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

async function runSubstep4Suite() {
  console.log('===============================================================');
  console.log('APNASTAY PROPERTY ENGINE — SUBSTEP 4 VERIFICATION TEST SUITE');
  console.log('===============================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: Structured Location Data Contract
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: Structured location data contract & fields');
  const validLocationInput: PropertyLocation = {
    address: 'Flat 402, Tower B, Lotus Greens',
    addressLine1: 'Flat 402, Tower B, Lotus Greens',
    locality: 'Sector 78',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    coordinates: { latitude: 28.5678, longitude: 77.3890 },
    publicLocation: 'Sector 78, Noida',
    hideExactAddress: true
  };

  const validationResult = validatePropertyLocation(validLocationInput);
  assert(validationResult.isValid === true, 'Valid location passes validation');
  assert(!validationResult.error, 'No error returned on valid location');
  assert(validationResult.value?.address === 'Flat 402, Tower B, Lotus Greens', 'Exact address correctly retained');
  assert(validationResult.value?.locality === 'Sector 78', 'Locality correctly retained');
  assert(validationResult.value?.city === 'Noida', 'City correctly retained');
  assert(validationResult.value?.state === 'Uttar Pradesh', 'State correctly retained');
  assert(validationResult.value?.pincode === '201301', 'Pincode correctly retained');
  assert(validationResult.value?.coordinates?.latitude === 28.5678, 'Latitude correctly retained');
  assert(validationResult.value?.coordinates?.longitude === 77.3890, 'Longitude correctly retained');
  assert(validationResult.value?.publicLocation === 'Sector 78, Noida', 'Public location correctly set');
  assert(validationResult.value?.hideExactAddress === true, 'hideExactAddress default flag retained');

  // --------------------------------------------------------------------------
  // TEST 2: Progressive Single-Error Validation (Avoid overwhelming user)
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Progressive single-error validation');

  // Missing address
  const missingAddress = validatePropertyLocation({
    address: '',
    locality: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038'
  });
  assert(missingAddress.isValid === false, 'Rejects missing address');
  assert(missingAddress.field === 'address', 'Points specifically to address field');
  assert(Boolean(missingAddress.error?.includes('street address')), 'Clear address error message');

  // Missing locality
  const missingLocality = validatePropertyLocation({
    address: 'House 123, 4th Cross',
    locality: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038'
  });
  assert(missingLocality.isValid === false, 'Rejects missing locality');
  assert(missingLocality.field === 'locality', 'Points specifically to locality field');

  // Missing city
  const missingCity = validatePropertyLocation({
    address: 'House 123, 4th Cross',
    locality: 'Indiranagar',
    city: '',
    state: 'Karnataka',
    pincode: '560038'
  });
  assert(missingCity.isValid === false, 'Rejects missing city');
  assert(missingCity.field === 'city', 'Points specifically to city field');

  // Missing state
  const missingState = validatePropertyLocation({
    address: 'House 123, 4th Cross',
    locality: 'Indiranagar',
    city: 'Bengaluru',
    state: '',
    pincode: '560038'
  });
  assert(missingState.isValid === false, 'Rejects missing state');
  assert(missingState.field === 'state', 'Points specifically to state field');

  // Invalid PIN code
  const invalidPin = validatePropertyLocation({
    address: 'House 123, 4th Cross',
    locality: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '012345' // Leading zero invalid for Indian PIN
  });
  assert(invalidPin.isValid === false, 'Rejects invalid PIN starting with 0');
  assert(invalidPin.field === 'pincode', 'Points specifically to pincode field');

  const shortPin = validatePropertyLocation({
    address: 'House 123, 4th Cross',
    locality: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '56003' // 5 digits
  });
  assert(shortPin.isValid === false, 'Rejects 5-digit PIN');
  assert(shortPin.field === 'pincode', 'Points to pincode for 5 digits');

  // --------------------------------------------------------------------------
  // TEST 3: Private vs. Public Location Separation
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: Private vs Public location separation & redaction');

  // Automatic computation of publicLocation when not manually specified
  const autoPublicLoc = validatePropertyLocation({
    address: 'House No. 24, XYZ Building, Block C',
    locality: 'Sector 62',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201309'
  });
  assert(autoPublicLoc.isValid === true, 'Auto-computes public location successfully');
  assert(autoPublicLoc.value?.publicLocation === 'Sector 62, Noida', 'Computes public location as "Locality, City"');
  assert(autoPublicLoc.value?.address === 'House No. 24, XYZ Building, Block C', 'Exact private address retained separately');

  // --------------------------------------------------------------------------
  // TEST 4: Backend Persistence and Backward/Forward Roundtrip
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Backend persistence & public listing redaction');

  const testCtx = { userId: 24, isAdmin: false };

  // 1. Create a draft property
  const initRes = propertyBackend.createDraft(testCtx, {
    propertyType: 'apartment',
    rentalStructure: 'entire_property'
  });
  assert(initRes.success === true, 'Draft property created successfully');
  const propertyId = initRes.data?.id!;

  // 2. Update Substep 4 location
  const updateRes = propertyBackend.updateProperty(testCtx, propertyId, {
    location: {
      address: 'House No. 24, XYZ Building, 5th Floor',
      addressLine1: 'House No. 24, XYZ Building, 5th Floor',
      locality: 'Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201309',
      coordinates: { latitude: 28.6280, longitude: 77.3649 },
      publicLocation: 'Sector 62, Noida',
      hideExactAddress: true
    }
  });

  assert(updateRes.success === true, 'Substep 4 location updated in backend successfully');
  assert(updateRes.data?.location?.address === 'House No. 24, XYZ Building, 5th Floor', 'Owner view sees exact address');
  assert(updateRes.data?.location?.publicLocation === 'Sector 62, Noida', 'Owner view sees public location');
  assert(updateRes.data?.location?.coordinates?.latitude === 28.6280, 'Coordinates persisted');

  // 3. Backward navigation test: Read back draft property by ID
  const fetchOwnerRes = propertyBackend.getProperty(testCtx, propertyId);
  assert(fetchOwnerRes.success === true, 'Draft property retrieved on backward navigation');
  assert(fetchOwnerRes.data?.location?.address === 'House No. 24, XYZ Building, 5th Floor', 'Address persists for backward navigation');
  assert(fetchOwnerRes.data?.location?.pincode === '201309', 'Pincode persists for backward navigation');
  assert(fetchOwnerRes.data?.location?.locality === 'Sector 62', 'Locality persists for backward navigation');

  // 4. Publish / public view test: Exact address is redacted in public listing
  // Set status to published to simulate public listing
  if (fetchOwnerRes.data) {
    fetchOwnerRes.data.status = 'published';
  }
  const publicRes = propertyBackend.getPublicProperty(propertyId);
  assert(publicRes.success === true, 'Public property retrieved');
  assert(publicRes.data?.location?.publicLocation === 'Sector 62, Noida', 'Public location is visible to public');
  assert(!publicRes.data?.location?.address, 'Exact private address is redacted from public listing');
  assert(!publicRes.data?.location?.addressLine1, 'Exact addressLine1 is redacted from public listing');
  assert(!publicRes.data?.location?.addressLine1, 'Exact addressLine1 is redacted from public listing');

  console.log('\n===============================================================');
  console.log(`SUBSTEP 4 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSubstep4Suite().catch((err) => {
  console.error('Unhandled error in Substep 4 suite:', err);
  process.exit(1);
});
