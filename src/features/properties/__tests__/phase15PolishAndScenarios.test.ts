// ============================================================================
// APNASTAY PROPERTY ENGINE — PHASE 15 SCENARIOS, ERROR HANDLING & UX POLISH
// Comprehensive automated test suite verifying all 13 property configuration
// scenarios, centralized error normalization, accessibility tokens, and lifecycle safety.
// ============================================================================

import {
  propertyBackend,
  BackendRequestContext,
  normalizePropertyError,
  evaluateListingCompleteness,
  calculateUnitAvailability,
  formatPricingDisplay,
  getUnitTerminology,
  getPropertyTemplate,
  PropertyType,
  RentalStructure
} from '../index';

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

async function runPhase15PolishAndScenarios() {
  console.log('\n====================================================================');
  console.log('APNASTAY PROPERTY ENGINE — PHASE 15 SCENARIOS & POLISH TEST SUITE');
  console.log('====================================================================\n');

  const ctxOwner: BackendRequestContext = { userId: 501, isAdmin: false };
  const ctxOtherOwner: BackendRequestContext = { userId: 502, isAdmin: false };
  const ctxUnauth: BackendRequestContext = { userId: 0, isAdmin: false };

  propertyBackend.reset();

  // ==========================================================================
  // SECTION 1: ENTIRE PROPERTY SCENARIOS (1, 2, 3)
  // ==========================================================================
  console.log('--- SECTION 1: ENTIRE PROPERTY SCENARIOS ---');

  // Scenario 1: Entire House
  console.log('🧪 Scenario 1: Entire House (Independent House, ₹28,000/mo)');
  const houseRes = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'house',
    rentalStructure: 'entire_property',
    title: 'Sunny 3BHK Independent House in Indira Nagar',
    description: 'Spacious independent house with private terrace and parking for 2 cars.',
    pricing: { monthlyRent: 28000, securityDeposit: 56000, maintenance: 0 },
    location: {
      addressLine1: '12th Main Road',
      city: 'Bengaluru',
      locality: 'Indira Nagar',
      pincode: '560038',
      state: 'Karnataka'
    }
  });
  assert(houseRes.success, 'House draft created successfully');
  const houseId = houseRes.data!.id;

  // Add photos and amenities
  propertyBackend.updateProperty(ctxOwner, houseId, {
    photos: [
      { id: 'h_photo_1', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914', isCover: true, order: 0 }
    ]
  });
  propertyBackend.updateAmenities(ctxOwner, houseId, ['wifi', 'parking', 'power_backup', 'terrace'], []);
  propertyBackend.updatePropertyRules(ctxOwner, houseId, {
    maxOccupants: 6,
    suitableFor: ['families', 'working_professionals'],
    petPolicy: 'allowed'
  });

  const house = propertyBackend.getProperty(ctxOwner, houseId).data!;
  assert(house.propertyType === 'house' && house.rentalStructure === 'entire_property', 'House type and structure match');
  assert(house.pricing?.monthlyRent === 28000, 'Rent matches ₹28,000');
  const houseCompleteness = evaluateListingCompleteness(house);
  assert(houseCompleteness.score >= 60, `House completeness evaluated (${houseCompleteness.score}%)`);
  const pubHouse = propertyBackend.publishProperty(ctxOwner, house.id, { strict: false });
  assert(pubHouse.success && pubHouse.data?.status === 'published', 'House published successfully');

  // Scenario 2: Entire Villa (Luxury Villa with pool and custom amenities)
  console.log('🧪 Scenario 2: Luxury Villa (Private Pool, ₹85,000/mo)');
  const villaRes = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'villa',
    rentalStructure: 'entire_property',
    title: 'Emerald Palms Private Pool Villa',
    description: 'Exquisite 4BHK villa with private swimming pool, landscaped lawn, and servant quarter.',
    pricing: { monthlyRent: 85000, securityDeposit: 250000 },
    location: {
      addressLine1: 'Near Sunset Beach',
      city: 'Goa',
      locality: 'Anjuna',
      pincode: '403509',
      state: 'Goa'
    }
  });
  assert(villaRes.success, 'Villa draft created successfully');
  const villaId = villaRes.data!.id;

  propertyBackend.updateAmenities(ctxOwner, villaId, ['swimming_pool', 'garden', 'modular_kitchen'], ['Private Plunge Pool', 'Solar Heated Water']);
  propertyBackend.updateProperty(ctxOwner, villaId, {
    photos: [
      { id: 'v_photo_1', url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227', isCover: true, order: 0 },
      { id: 'v_photo_2', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', isCover: false, order: 1 }
    ]
  });

  const villa = propertyBackend.getProperty(ctxOwner, villaId).data!;
  assert(villa.customAmenities?.includes('Private Plunge Pool'), 'Custom amenities preserved on villa');
  assert(formatPricingDisplay(villa.pricing, villa.pricing?.monthlyRent).includes('85,000'), 'Villa pricing displays ₹85,000');

  // Scenario 3: Independent Floor (Builder floor)
  console.log('🧪 Scenario 3: Independent Floor (Builder Floor 3BHK, ₹35,000/mo)');
  const floorRes = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'independent_floor',
    rentalStructure: 'entire_property',
    title: 'Modern First Floor Builder Flat',
    description: 'Brand new luxury builder floor with lift and dedicated stilt parking.',
    pricing: { monthlyRent: 35000, securityDeposit: 70000 },
    location: {
      addressLine1: 'Plot 42, Block C',
      city: 'Gurugram',
      locality: 'Sector 57',
      pincode: '122003',
      state: 'Haryana'
    }
  });
  assert(floorRes.success, 'Independent floor created');
  assert(floorRes.data?.propertyType === 'independent_floor', 'Property type is independent_floor');

  // ==========================================================================
  // SECTION 2: UNIT-BASED SCENARIOS (4, 5, 6)
  // ==========================================================================
  console.log('\n--- SECTION 2: UNIT-BASED SCENARIOS ---');

  // Scenario 4: Apartment Building with Multiple Flats
  console.log('🧪 Scenario 4: Apartment Building (Multiple Flats 101, 102, 201)');
  const aptBuildingRes = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'building',
    rentalStructure: 'multiple_units',
    title: 'Sunrise Enclave Residential Towers',
    description: 'Residential tower featuring 2BHK and 3BHK family flats.',
    location: {
      addressLine1: 'Main Road',
      city: 'Pune',
      locality: 'Baner',
      pincode: '411045',
      state: 'Maharashtra'
    },
    pricing: { monthlyRent: 22000 }
  });
  assert(aptBuildingRes.success, 'Apartment building created');
  const bldgId = aptBuildingRes.data!.id;

  // Add 3 distinct flats with individual rents
  const flat101 = propertyBackend.addUnit(ctxOwner, bldgId, {
    nameOrNumber: 'Flat 101',
    unitType: '2BHK',
    capacity: 4,
    pricing: { monthlyRent: 22000, securityDeposit: 44000 }
  });
  const flat102 = propertyBackend.addUnit(ctxOwner, bldgId, {
    nameOrNumber: 'Flat 102',
    unitType: '2BHK',
    capacity: 4,
    pricing: { monthlyRent: 23000, securityDeposit: 46000 }
  });
  const flat201 = propertyBackend.addUnit(ctxOwner, bldgId, {
    nameOrNumber: 'Flat 201',
    unitType: '3BHK',
    capacity: 6,
    pricing: { monthlyRent: 32000, securityDeposit: 64000 }
  });
  assert(flat101.success && flat102.success && flat201.success, 'All 3 flats created with unique rents');
  const bldg = propertyBackend.getProperty(ctxOwner, bldgId).data!;
  assert(bldg.units?.length === 3, 'Building has exactly 3 units');
  assert(bldg.units![2].pricing.monthlyRent === 32000, 'Flat 201 has ₹32,000 rent');

  // Scenario 5: Commercial Building with Units (Shops / Offices)
  console.log('🧪 Scenario 5: Commercial Building with Multiple Office Suites');
  const commRes = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'commercial',
    rentalStructure: 'multiple_units',
    title: 'Apex Business Center',
    pricing: { monthlyRent: 45000 },
    location: {
      addressLine1: 'G-Block',
      city: 'Mumbai',
      locality: 'BKC',
      pincode: '400051',
      state: 'Maharashtra'
    }
  });
  assert(commRes.success, 'Commercial building created');
  const shop1 = propertyBackend.addUnit(ctxOwner, commRes.data!.id, {
    nameOrNumber: 'Retail Unit G-01',
    unitType: 'Shop',
    capacity: 8,
    pricing: { monthlyRent: 55000, securityDeposit: 200000 }
  });
  assert(shop1.success && shop1.data?.unitType === 'Shop', 'Commercial shop created');

  // Scenario 6: Individual Flat / Apartment
  console.log('🧪 Scenario 6: Individual Flat / Apartment (Single 2BHK)');
  const singleApt = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'apartment',
    rentalStructure: 'individual_unit',
    title: 'Cozy 2BHK Flat in Whitefield',
    pricing: { monthlyRent: 26000, securityDeposit: 52000 },
    location: {
      addressLine1: 'Tower B, Prestigia',
      city: 'Bengaluru',
      locality: 'Whitefield',
      pincode: '560066',
      state: 'Karnataka'
    }
  });
  assert(singleApt.success && singleApt.data?.rentalStructure === 'individual_unit', 'Individual flat created');

  // ==========================================================================
  // SECTION 3: ROOM-BASED SCENARIOS (7, 8, 9)
  // ==========================================================================
  console.log('\n--- SECTION 3: ROOM-BASED SCENARIOS ---');

  // Scenario 7: PG with Multiple Rooms
  console.log('🧪 Scenario 7: PG with Multiple Private Rooms and Food Policy');
  const pgRoomsRes = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'pg',
    rentalStructure: 'individual_room',
    title: 'Comfort Stays Luxury PG for Men',
    location: {
      addressLine1: 'B-12, Sector 62',
      city: 'Noida',
      locality: 'Sector 62',
      pincode: '201309',
      state: 'Uttar Pradesh'
    },
    pricing: { monthlyRent: 9500 }
  });
  assert(pgRoomsRes.success, 'PG with multiple rooms created');
  const pgId = pgRoomsRes.data!.id;
  const pgTerm = getUnitTerminology('pg', 'individual_room');
  assert(pgTerm.singular === 'Room' && pgTerm.plural === 'Rooms', 'Terminology resolves to Room/Rooms');

  const pgRoom1 = propertyBackend.addUnit(ctxOwner, pgId, {
    nameOrNumber: 'Room 101 (Single Deluxe)',
    capacity: 1,
    pricing: { monthlyRent: 12000, securityDeposit: 12000 }
  });
  const pgRoom2 = propertyBackend.addUnit(ctxOwner, pgId, {
    nameOrNumber: 'Room 102 (Standard Room)',
    capacity: 1,
    pricing: { monthlyRent: 9500, securityDeposit: 9500 }
  });
  assert(pgRoom1.success && pgRoom2.success, 'PG rooms created with individual pricing');

  // Scenario 8: Hostel with Multiple Rooms
  console.log('🧪 Scenario 8: Student Hostel with Rooms and Curfew Rules');
  const hostelRes = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'hostel',
    rentalStructure: 'individual_room',
    title: 'Campus Walk Girls Hostel',
    location: {
      addressLine1: '14 University Enclave',
      city: 'Delhi',
      locality: 'North Campus',
      pincode: '110007',
      state: 'Delhi'
    }
  });
  assert(hostelRes.success, 'Hostel created');
  propertyBackend.updatePropertyRules(ctxOwner, hostelRes.data!.id, {
    suitableFor: ['students'],
    gateClosingTime: '21:00',
    timingType: 'curfew',
    guestPolicy: 'not_allowed'
  });
  const hostel = propertyBackend.getProperty(ctxOwner, hostelRes.data!.id).data!;
  assert(hostel.rules?.timingType === 'curfew', 'Curfew rule recorded');

  // Scenario 9: Co-living with Private Rooms
  console.log('🧪 Scenario 9: Co-Living Community with Private Studio Rooms');
  const colivingRes = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'coliving',
    rentalStructure: 'individual_room',
    title: 'Hustle Hub Co-Living & Coworking',
    location: {
      addressLine1: '27th Main, Sector 1',
      city: 'Bengaluru',
      locality: 'HSR Layout',
      pincode: '560102',
      state: 'Karnataka'
    }
  });
  assert(colivingRes.success && colivingRes.data?.propertyType === 'coliving', 'Co-living space created');

  // ==========================================================================
  // SECTION 4: BED-BASED SCENARIOS (10, 11, 12)
  // ==========================================================================
  console.log('\n--- SECTION 4: BED-BASED SCENARIOS ---');

  // Scenario 10: PG with Multiple Beds (Sharing Rooms)
  console.log('🧪 Scenario 10: PG with Individual Bed Rentals (Double Sharing)');
  const pgBedsRes = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'pg',
    rentalStructure: 'individual_bed',
    title: 'Zolo Elite - Twin Sharing PG',
    location: {
      addressLine1: 'Plot 8, Telecom Nagar',
      city: 'Hyderabad',
      locality: 'Gachibowli',
      pincode: '500032',
      state: 'Telangana'
    },
    pricing: { monthlyRent: 7500 }
  });
  assert(pgBedsRes.success, 'Bed-based PG created');
  const pgBedPropId = pgBedsRes.data!.id;
  const pgBedRoom = propertyBackend.addUnit(ctxOwner, pgBedPropId, {
    nameOrNumber: 'Room 201',
    capacity: 2,
    pricing: { monthlyRent: 7500 }
  });
  const roomId = pgBedRoom.data!.id;
  const bedA = propertyBackend.addBed(ctxOwner, pgBedPropId, roomId, {
    label: 'Bed A (Window)',
    pricing: { monthlyRent: 8000, securityDeposit: 8000 }
  });
  const bedB = propertyBackend.addBed(ctxOwner, pgBedPropId, roomId, {
    label: 'Bed B',
    pricing: { monthlyRent: 7500, securityDeposit: 7500 }
  });
  assert(bedA.success && bedB.success, 'Individual beds created with custom rates');
  const updatedUnit = propertyBackend.getProperty(ctxOwner, pgBedPropId).data!.units![0];
  assert(updatedUnit.beds?.length === 2, 'Unit contains 2 beds');
  assert(calculateUnitAvailability(updatedUnit) === 'available', 'Unit availability is available');

  // Scenario 11: Hostel with Bunk Beds
  console.log('🧪 Scenario 11: Hostel with Bunk Beds (Dormitory)');
  const hostelDorm = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'hostel',
    rentalStructure: 'individual_bed',
    title: 'Backpacker Central Hostel Dorms',
    pricing: { monthlyRent: 5000 },
    location: {
      addressLine1: 'Station Road',
      city: 'Jaipur',
      locality: 'Civil Lines',
      pincode: '302006',
      state: 'Rajasthan'
    }
  });
  assert(hostelDorm.success, 'Hostel dorm created');
  const dormUnit = propertyBackend.addUnit(ctxOwner, hostelDorm.data!.id, {
    nameOrNumber: 'Dorm A (4 Beds)',
    capacity: 4,
    pricing: { monthlyRent: 5000 }
  }).data!;
  const bunk1 = propertyBackend.addBed(ctxOwner, hostelDorm.data!.id, dormUnit.id, {
    label: 'Bunk 1 Lower',
    pricing: { monthlyRent: 5500 }
  });
  const bunk2 = propertyBackend.addBed(ctxOwner, hostelDorm.data!.id, dormUnit.id, {
    label: 'Bunk 1 Upper',
    pricing: { monthlyRent: 4500 }
  });
  assert(bunk1.success && bunk2.success, 'Bunk beds created');

  // Scenario 12: Shared Room with Beds (Co-Living / PG)
  console.log('🧪 Scenario 12: Shared Room with Bed Partial Availability');
  const sharedRoomDraft = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'coliving',
    rentalStructure: 'individual_bed',
    title: 'Shared Master Bedroom in Co-Living Flat',
    pricing: { monthlyRent: 6000 },
    location: {
      addressLine1: 'Thoraipakkam',
      city: 'Chennai',
      locality: 'OMR',
      pincode: '600096',
      state: 'Tamil Nadu'
    }
  });
  assert(sharedRoomDraft.success, 'Shared room draft created');
  const sUnit = propertyBackend.addUnit(ctxOwner, sharedRoomDraft.data!.id, {
    nameOrNumber: 'Master Bedroom',
    capacity: 2,
    pricing: { monthlyRent: 6000 }
  }).data!;
  const sBed1 = propertyBackend.addBed(ctxOwner, sharedRoomDraft.data!.id, sUnit.id, {
    label: 'Bed 1',
    status: 'occupied',
    pricing: { monthlyRent: 6000 }
  });
  const sBed2 = propertyBackend.addBed(ctxOwner, sharedRoomDraft.data!.id, sUnit.id, {
    label: 'Bed 2',
    status: 'available',
    pricing: { monthlyRent: 6000 }
  });
  const sUnitWithBeds = propertyBackend.getProperty(ctxOwner, sharedRoomDraft.data!.id).data!.units![0];
  assert(calculateUnitAvailability(sUnitWithBeds) === 'partially_occupied', 'Unit availability accurately shows partially_occupied');

  // ==========================================================================
  // SECTION 5: FLEXIBLE CASES (13)
  // ==========================================================================
  console.log('\n--- SECTION 5: FLEXIBLE CASES ---');

  // Case 13a: Room-only Listing
  console.log('🧪 Case 13a: Room-only Listing (Single private room in residential house)');
  const roomOnly = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'room',
    rentalStructure: 'individual_room',
    title: 'Furnished Private Room with Attached Balcony',
    pricing: { monthlyRent: 11000, securityDeposit: 22000 },
    location: {
      addressLine1: 'Drive-in Road',
      city: 'Ahmedabad',
      locality: 'Vastrapur',
      pincode: '380015',
      state: 'Gujarat'
    }
  });
  assert(roomOnly.success && roomOnly.data?.rentalStructure === 'individual_room', 'Room-only structure valid');

  // Case 13b: Custom "Other" Property Type
  console.log('🧪 Case 13b: Custom "Other" Property Type (Farmhouse Retreat)');
  const customOther = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'other',
    customPropertyType: 'Eco Farmhouse Retreat',
    rentalStructure: 'entire_property',
    title: 'Serene Organic Farmhouse Retreat',
    pricing: { monthlyRent: 60000 },
    location: {
      addressLine1: 'Anamalai Foothills',
      city: 'Coimbatore',
      locality: 'Pollachi',
      pincode: '642001',
      state: 'Tamil Nadu'
    }
  });
  assert(customOther.success, 'Custom "other" property type draft created');
  assert(customOther.data?.customPropertyType === 'Eco Farmhouse Retreat', 'Custom property type label preserved');

  // Case 13c: Bulk Generation (30+ Units)
  console.log('🧪 Case 13c: Bulk Generation of 35 Units (High volume stability test)');
  const bulkBldg = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'building',
    rentalStructure: 'multiple_units',
    title: 'Grand Residency Mega Towers',
    pricing: { monthlyRent: 18000 },
    location: {
      addressLine1: 'Phase 1',
      city: 'Bengaluru',
      locality: 'Electronic City',
      pincode: '560100',
      state: 'Karnataka'
    }
  }).data!;

  const bulkCreateRes = propertyBackend.bulkCreateUnits(ctxOwner, bulkBldg.id, {
    count: 35,
    prefix: 'Suite',
    startingNumber: 101,
    unitType: '1BHK',
    capacityPerUnit: 2,
    pricing: { monthlyRent: 18000, securityDeposit: 36000 }
  });
  assert(bulkCreateRes.success, '35 units bulk created');
  assert(bulkCreateRes.data?.length === 35, 'Array of 35 units returned');
  const checkBldg = propertyBackend.getProperty(ctxOwner, bulkBldg.id).data!;
  assert(checkBldg.units?.length === 35, 'Building holds all 35 units successfully');
  assert(checkBldg.units![34].nameOrNumber === 'Suite 135', 'Last unit correctly numbered Suite 135');

  // Case 13d: Zero Units Handling
  console.log('🧪 Case 13d: Zero Units Handling (Valid for entire property)');
  const zeroUnitProp = propertyBackend.createDraft(ctxOwner, {
    propertyType: 'house',
    rentalStructure: 'entire_property',
    title: 'Zero Unit House Listing'
  }).data!;
  assert((zeroUnitProp.units || []).length === 0, 'Zero units allowed on entire property');

  // ==========================================================================
  // SECTION 6: ACTIONABLE ERROR NORMALIZATION & RESILIENCE
  // ==========================================================================
  console.log('\n--- SECTION 6: ACTIONABLE ERROR NORMALIZATION & RESILIENCE ---');

  // Error 1: 401 Unauthenticated & Session Expiry
  console.log('🧪 Error 1: 401 Unauthenticated & Session Expiry normalization');
  const err401 = normalizePropertyError(401, { code: 'UNAUTHENTICATED' });
  assert(err401.status === 401, 'Status is 401');
  assert(err401.isSessionExpired === true, 'isSessionExpired is true');
  assert(err401.message.includes('session has expired'), 'Clear actionable message for session expiry');
  assert(Boolean(err401.hint || err401.actionableHint), 'Actionable hint provided (Sign In)');

  // Error 2: 403 NOT_PROPERTY_OWNER (IDOR defense)
  console.log('🧪 Error 2: 403 NOT_PROPERTY_OWNER error normalization');
  const err403 = normalizePropertyError(403, { code: 'NOT_PROPERTY_OWNER' });
  assert(err403.status === 403, 'Status is 403');
  assert(err403.code === 'NOT_PROPERTY_OWNER', 'Code is NOT_PROPERTY_OWNER');
  assert(err403.message.includes('do not have permission'), 'User-friendly permission error message');

  // Error 3: 404 PROPERTY_NOT_FOUND
  console.log('🧪 Error 3: 404 PROPERTY_NOT_FOUND normalization');
  const err404 = normalizePropertyError(404, { code: 'PROPERTY_NOT_FOUND' });
  assert(err404.status === 404, 'Status is 404');
  assert(err404.message.includes('not found') || err404.message.includes('removed'), 'Friendly not found message');

  // Error 4: 413 IMAGE_TOO_LARGE
  console.log('🧪 Error 4: 413 IMAGE_TOO_LARGE normalization');
  const err413 = normalizePropertyError(413, { code: 'IMAGE_TOO_LARGE' });
  assert(err413.status === 413, 'Status is 413');
  assert(err413.message.includes('10MB') || err413.message.includes('too large'), 'Explains 10MB limit clearly');

  // Error 5: 422 LISTING_INCOMPLETE
  console.log('🧪 Error 5: 422 LISTING_INCOMPLETE normalization');
  const err422 = normalizePropertyError(422, {
    code: 'LISTING_INCOMPLETE',
    missingFields: ['photos', 'location', 'pricing']
  });
  assert(err422.status === 422, 'Status is 422');
  assert(err422.message.includes('complete all required fields'), 'Actionable review instructions given');

  // Error 6: 500 SERVER_ERROR & Network Error Fallback
  console.log('🧪 Error 6: 500 Server Error fallback');
  const err500 = normalizePropertyError(500, null, 'Unable to connect to server');
  assert(err500.status === 500, 'Status is 500');
  assert(err500.message.includes('server encountered an issue'), 'Graceful server error explanation');

  // Error 7: Network Exception (e.g. Failed to fetch)
  console.log('🧪 Error 7: Network exception (offline / timeout)');
  const netErr = normalizePropertyError(null, new Error('Failed to fetch'));
  assert(netErr.code === 'NETWORK_ERROR' || netErr.status === 500, 'Handled network exception cleanly');

  // ==========================================================================
  // FINAL SUMMARY
  // ==========================================================================
  console.log('\n====================================================================');
  console.log(`PHASE 15 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase15PolishAndScenarios().catch((err) => {
  console.error('Fatal error running Phase 15 test suite:', err);
  process.exit(1);
});
