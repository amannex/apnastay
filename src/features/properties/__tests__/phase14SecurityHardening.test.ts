// ============================================================================
// APNASTAY PROPERTY ENGINE — PHASE 14 SECURITY & OWNERSHIP HARDENING TEST SUITE
// Automated verification for auth, authorization, relational integrity,
// input sanitization (XSS), status lifecycle transitions, and public visibility.
// ============================================================================

import {
  propertyBackend,
  BackendRequestContext,
  sanitizeText,
  validateAndSanitizePincode,
  isValidIsoDateString,
  validatePropertyTitle,
  validatePropertyDescription,
  validateTypeAndStructure,
  sanitizeStringArray
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

async function runPhase14SecurityTests() {
  console.log('\n====================================================================');
  console.log('APNASTAY PROPERTY ENGINE — PHASE 14 SECURITY & OWNERSHIP HARDENING');
  console.log('====================================================================\n');

  const ctxOwnerA: BackendRequestContext = { userId: 101, isAdmin: false };
  const ctxOwnerB: BackendRequestContext = { userId: 102, isAdmin: false };
  const ctxAdmin: BackendRequestContext = { userId: 999, isAdmin: true };
  const ctxUnauthenticated: BackendRequestContext = { userId: 0, isAdmin: false };

  propertyBackend.reset();

  // --------------------------------------------------------------------------
  // TEST 1: Unauthenticated Mutation Rejection
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: Unauthenticated Mutation Rejection (401)');
  const unauthCreate = propertyBackend.createDraft(ctxUnauthenticated, {
    propertyType: 'apartment',
    title: 'Unauthorized Apartment'
  });
  assert(unauthCreate.success === false, 'Unauthenticated draft creation fails');
  assert(unauthCreate.status === 401, 'Unauthenticated status is 401');
  assert(unauthCreate.code === 'UNAUTHENTICATED', 'Error code is UNAUTHENTICATED');

  // Create valid property with Owner A for mutation testing
  const propRes = propertyBackend.createDraft(ctxOwnerA, {
    propertyType: 'house',
    title: 'Valid House Draft'
  });
  assert(propRes.success === true, 'Owner A successfully created initial draft');
  const propId = propRes.data!.id;

  // Unauthenticated update
  const unauthUpdate = propertyBackend.updateProperty(ctxUnauthenticated, propId, {
    title: 'Hacked Title'
  });
  assert(unauthUpdate.status === 401, 'Unauthenticated updateProperty returns 401');

  // Unauthenticated lifecycle operations
  assert(propertyBackend.publishProperty(ctxUnauthenticated, propId).status === 401, 'Unauthenticated publishProperty returns 401');
  assert(propertyBackend.unpublishProperty(ctxUnauthenticated, propId).status === 401, 'Unauthenticated unpublishProperty returns 401');
  assert(propertyBackend.archiveProperty(ctxUnauthenticated, propId).status === 401, 'Unauthenticated archiveProperty returns 401');
  assert(propertyBackend.restoreProperty(ctxUnauthenticated, propId).status === 401, 'Unauthenticated restoreProperty returns 401');

  // Unauthenticated sub-resource operations
  assert(
    propertyBackend.addUnit(ctxUnauthenticated, propId, {
      nameOrNumber: '101',
      unitType: '1bhk',
      pricing: { monthlyRent: 10000 }
    }).status === 401,
    'Unauthenticated addUnit returns 401'
  );
  assert(
    propertyBackend.uploadPhoto(ctxUnauthenticated, propId, {
      fileName: 'test.jpg',
      mimeType: 'image/jpeg',
      fileSize: 1024
    }).status === 401,
    'Unauthenticated uploadPhoto returns 401'
  );
  assert(
    propertyBackend.updatePropertyPricing(ctxUnauthenticated, propId, { monthlyRent: 15000 }).status === 401,
    'Unauthenticated updatePropertyPricing returns 401'
  );
  assert(
    propertyBackend.updateAmenities(ctxUnauthenticated, propId, ['wifi']).status === 401,
    'Unauthenticated updateAmenities returns 401'
  );

  // --------------------------------------------------------------------------
  // TEST 2: Cross-Owner Mutation Rejection (IDOR Protection)
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Cross-Owner Mutation Rejection (IDOR Protection - 403)');
  const propARes = propertyBackend.createDraft(ctxOwnerA, {
    propertyType: 'apartment',
    title: 'Owner A Private Villa',
    rentalStructure: 'entire_property'
  });
  const propAId = propARes.data!.id;

  // Owner B reads Property A
  const readRes = propertyBackend.getProperty(ctxOwnerB, propAId);
  assert(readRes.success === false, 'Owner B cannot read Property A');
  assert(readRes.status === 403, 'Cross-owner getProperty returns 403');
  assert(readRes.code === 'NOT_PROPERTY_OWNER', 'Error code is NOT_PROPERTY_OWNER');

  // Owner B mutates Property A
  const hackUpdate = propertyBackend.updateProperty(ctxOwnerB, propAId, { title: 'Compromised Title' });
  assert(hackUpdate.status === 403, 'Owner B cannot update Property A');

  // Owner B adds unit to Property A
  const hackUnit = propertyBackend.addUnit(ctxOwnerB, propAId, {
    nameOrNumber: 'Rogue Unit',
    unitType: 'room',
    pricing: { monthlyRent: 5000 }
  });
  assert(hackUnit.status === 403, 'Owner B cannot add unit to Property A');

  // Owner B uploads photo to Property A
  const hackPhoto = propertyBackend.uploadPhoto(ctxOwnerB, propAId, {
    fileName: 'rogue.jpg',
    mimeType: 'image/jpeg',
    fileSize: 1024
  });
  assert(hackPhoto.status === 403, 'Owner B cannot upload photo to Property A');

  // Owner B updates pricing on Property A
  const hackPrice = propertyBackend.updatePropertyPricing(ctxOwnerB, propAId, { monthlyRent: 1 });
  assert(hackPrice.status === 403, 'Owner B cannot update pricing on Property A');

  // Admin bypass
  const adminRead = propertyBackend.getProperty(ctxAdmin, propAId);
  assert(adminRead.success === true, 'Admin can read any property');
  const adminUpdate = propertyBackend.updateProperty(ctxAdmin, propAId, { description: 'Admin validated' });
  assert(adminUpdate.success === true, 'Admin can update any property');
  assert(adminUpdate.data!.description === 'Admin validated', 'Admin update successfully persisted');

  // --------------------------------------------------------------------------
  // TEST 3: Relational Integrity & Entity Hijacking Protection
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: Relational Integrity & Entity Hijacking Protection');
  // Property A with Unit A1 & Bed A1
  const bldgARes = propertyBackend.createDraft(ctxOwnerA, {
    propertyType: 'apartment',
    title: 'Building Alpha',
    rentalStructure: 'multiple_units'
  });
  const bldgAId = bldgARes.data!.id;
  const unitA1Res = propertyBackend.addUnit(ctxOwnerA, bldgAId, {
    nameOrNumber: 'Unit A1',
    unitType: '1bhk',
    pricing: { monthlyRent: 12000 }
  });
  const unitA1Id = unitA1Res.data!.id;
  const bedA1Res = propertyBackend.addBed(ctxOwnerA, bldgAId, unitA1Id, {
    label: 'Bed A1-1',
    pricing: { monthlyRent: 6000 }
  });
  const bedA1Id = bedA1Res.data!.id;

  // Property B with Unit B1 & Bed B1
  const bldgBRes = propertyBackend.createDraft(ctxOwnerA, {
    propertyType: 'apartment',
    title: 'Building Beta',
    rentalStructure: 'multiple_units'
  });
  const bldgBId = bldgBRes.data!.id;
  const unitB1Res = propertyBackend.addUnit(ctxOwnerA, bldgBId, {
    nameOrNumber: 'Unit B1',
    unitType: '2bhk',
    pricing: { monthlyRent: 22000 }
  });
  const unitB1Id = unitB1Res.data!.id;
  const bedB1Res = propertyBackend.addBed(ctxOwnerA, bldgBId, unitB1Id, {
    label: 'Bed B1-1',
    pricing: { monthlyRent: 11000 }
  });
  const bedB1Id = bedB1Res.data!.id;

  // Cross-property unit mutation
  const crossUnitUpdate = propertyBackend.updateUnit(ctxOwnerA, bldgAId, unitB1Id, { nameOrNumber: 'Hacked' });
  assert(crossUnitUpdate.success === false, 'Cannot update Unit B1 through Building Alpha endpoint');
  assert(crossUnitUpdate.status === 404, 'Cross-property unit update returns 404');
  assert(crossUnitUpdate.code === 'RELATIONSHIP_MISMATCH', 'Code is RELATIONSHIP_MISMATCH');

  // Cross-property unit deletion
  const crossUnitDel = propertyBackend.deleteUnit(ctxOwnerA, bldgAId, unitB1Id);
  assert(crossUnitDel.status === 404, 'Cannot delete Unit B1 through Building Alpha endpoint');
  assert(crossUnitDel.code === 'RELATIONSHIP_MISMATCH', 'Code is RELATIONSHIP_MISMATCH');

  // Cross-property bed mutation
  const crossBedUpdate = propertyBackend.updateBed(ctxOwnerA, bldgAId, unitA1Id, bedB1Id, { label: 'Hijacked' });
  assert(crossBedUpdate.status === 404, 'Cannot update Bed B1 through Unit A1 endpoint');
  assert(crossBedUpdate.code === 'RELATIONSHIP_MISMATCH', 'Code is RELATIONSHIP_MISMATCH');

  // Bulk pricing foreign unit override
  const bulkPriceUnitMismatch = propertyBackend.updateBulkPricing(ctxOwnerA, bldgAId, {
    defaultPricing: { monthlyRent: 10000 },
    unitOverrides: {
      [unitB1Id]: { monthlyRent: 99999 } // Foreign unit!
    }
  });
  assert(bulkPriceUnitMismatch.status === 404, 'Bulk pricing rejects foreign unit override key');
  assert(bulkPriceUnitMismatch.code === 'RELATIONSHIP_MISMATCH', 'Code is RELATIONSHIP_MISMATCH');

  // Bulk pricing foreign bed override
  const bulkPriceBedMismatch = propertyBackend.updateBulkPricing(ctxOwnerA, bldgAId, {
    defaultPricing: { monthlyRent: 10000 },
    bedOverrides: {
      [bedB1Id]: { monthlyRent: 99999 } // Foreign bed!
    }
  });
  assert(bulkPriceBedMismatch.status === 404, 'Bulk pricing rejects foreign bed override key');
  assert(bulkPriceBedMismatch.code === 'RELATIONSHIP_MISMATCH', 'Code is RELATIONSHIP_MISMATCH');

  // Foreign photo reordering
  const pA = propertyBackend.uploadPhoto(ctxOwnerA, bldgAId, {
    fileName: 'alpha.jpg',
    mimeType: 'image/jpeg',
    fileSize: 1024
  });
  const photoAId = pA.data!.id;
  const photoReorderRes = propertyBackend.reorderPhotos(ctxOwnerA, bldgAId, [photoAId, 'photo_foreign_xyz']);
  assert(photoReorderRes.status === 404, 'Photo reorder rejects foreign photo ID');
  assert(photoReorderRes.code === 'RELATIONSHIP_MISMATCH', 'Code is RELATIONSHIP_MISMATCH');

  // --------------------------------------------------------------------------
  // TEST 4: Input Sanitization & Stored XSS Neutralization
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Input Sanitization & Stored XSS Neutralization');
  const dirtyTitle = '<script>alert("pwned")</script>Seaside Villa<img src=x onerror=alert(1)>';
  assert(sanitizeText(dirtyTitle, 100) === 'Seaside Villa', 'sanitizeText strips script and img error handlers');

  const xssProp = propertyBackend.createDraft(ctxOwnerA, {
    propertyType: 'villa',
    title: '<script>evil()</script>Serene Beachfront Villa',
    description: '<iframe src="evil.com"></iframe>Spacious 4BHK with pool.<script>bad()</script>',
    location: {
      addressLine1: '<b onmouseover=evil()>123 Palm Ave</b>',
      city: '<script>alert(1)</script>Goa',
      pincode: '403001'
    }
  });
  assert(xssProp.success === true, 'XSS input property created successfully after sanitization');
  assert(xssProp.data!.title === 'Serene Beachfront Villa', 'Title script tags completely stripped');
  assert(xssProp.data!.description === 'Spacious 4BHK with pool.', 'Description iframe and script tags stripped');
  assert(xssProp.data!.location!.addressLine1 === '123 Palm Ave', 'Address HTML stripped');
  assert(xssProp.data!.location!.city === 'Goa', 'City script tags stripped');

  // Pincode regex validation
  const invalidPincodeRes = propertyBackend.createDraft(ctxOwnerA, {
    propertyType: 'apartment',
    title: 'Bad Pincode Apartment',
    location: { pincode: '012345' } // Cannot start with 0
  });
  assert(invalidPincodeRes.success === false, 'Invalid pincode (leading 0) is rejected');
  assert(invalidPincodeRes.code === 'INVALID_PINCODE', 'Error code is INVALID_PINCODE');

  const letterPincodeRes = propertyBackend.createDraft(ctxOwnerA, {
    propertyType: 'apartment',
    title: 'Bad Pincode Apartment',
    location: { pincode: '11000A' }
  });
  assert(letterPincodeRes.status === 400, 'Non-digit pincode is rejected');

  // Date validation
  const invalidDateRes = propertyBackend.createDraft(ctxOwnerA, {
    propertyType: 'apartment',
    title: 'Bad Date Apartment',
    availability: { type: 'specific_date', availableFrom: 'tomorrow' }
  });
  assert(invalidDateRes.status === 400, 'Invalid availability date format is rejected');
  assert(invalidDateRes.code === 'INVALID_DATE_FORMAT', 'Error code is INVALID_DATE_FORMAT');

  // Amenities sanitization
  const sanitizedAmenitiesProp = propertyBackend.updateAmenities(
    ctxOwnerA,
    xssProp.data!.id,
    ['wifi', '<script>alert(1)</script>swimming_pool'],
    ['<b onclick="evil()">terrace_garden</b>']
  );
  assert(sanitizedAmenitiesProp.success === true, 'Amenities update with dirty HTML succeeds');
  assert((sanitizedAmenitiesProp.data?.amenities || []).includes('swimming_pool'), 'Clean tag swimming_pool preserved');
  assert(!(sanitizedAmenitiesProp.data?.amenities || []).some((a) => a.includes('<script>')), 'Script tags completely stripped from amenities');
  assert((sanitizedAmenitiesProp.data?.customAmenities || []).includes('terrace_garden'), 'Clean custom amenity preserved');

  // --------------------------------------------------------------------------
  // TEST 5: Listing Lifecycle & Status Transition Security
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 5: Listing Lifecycle & Status Transition Security');
  const lifecyclePropRes = propertyBackend.createDraft(ctxOwnerA, {
    propertyType: 'apartment',
    title: 'Lifecycle Verification Flat',
    rentalStructure: 'entire_property',
    pricing: { monthlyRent: 30000 },
    location: { city: 'Pune', addressLine1: 'Koregaon Park', pincode: '411001' }
  });
  const lifeId = lifecyclePropRes.data!.id;

  // Cannot unpublish draft
  const unpubDraft = propertyBackend.unpublishProperty(ctxOwnerA, lifeId);
  assert(unpubDraft.success === false, 'Cannot unpublish a draft listing');
  assert(unpubDraft.code === 'INVALID_STATUS_TRANSITION', 'Code is INVALID_STATUS_TRANSITION');

  // Archive property
  const arcRes = propertyBackend.archiveProperty(ctxOwnerA, lifeId);
  assert(arcRes.success === true, 'Property successfully archived');
  assert(arcRes.data!.status === 'archived', 'Status is archived');

  // Cannot modify archived property
  const modArchived = propertyBackend.updateProperty(ctxOwnerA, lifeId, { title: 'Editing Archived Property' });
  assert(modArchived.status === 400, 'Modifying archived property is rejected');
  assert(modArchived.code === 'INVALID_STATUS_TRANSITION', 'Code is INVALID_STATUS_TRANSITION');

  // Cannot add unit to archived property
  const unitArchived = propertyBackend.addUnit(ctxOwnerA, lifeId, {
    nameOrNumber: 'Unit Archived',
    unitType: '1bhk',
    pricing: { monthlyRent: 15000 }
  });
  assert(unitArchived.status === 400, 'Adding unit to archived property is rejected');

  // Cannot publish archived property directly
  const pubArchived = propertyBackend.publishProperty(ctxOwnerA, lifeId);
  assert(pubArchived.status === 400, 'Directly publishing archived property is rejected');

  // Restore archived property -> unpublished
  const restRes = propertyBackend.restoreProperty(ctxOwnerA, lifeId);
  assert(restRes.success === true, 'Archived property restored');
  assert(restRes.data!.status === 'unpublished', 'Restored listing status is unpublished');

  // Now modifying restored property succeeds
  const modRestored = propertyBackend.updateProperty(ctxOwnerA, lifeId, { title: 'Restored Active Property' });
  assert(modRestored.success === true, 'Modifying restored property succeeds');
  assert(modRestored.data!.title === 'Restored Active Property', 'New title saved');

  // --------------------------------------------------------------------------
  // TEST 6: Public vs. Private Visibility & Data Redaction
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 6: Public vs. Private Visibility & Data Redaction');
  // 1. Published property with hideExactAddress = true
  const pubProp = propertyBackend.createDraft(ctxOwnerA, {
    propertyType: 'house',
    title: 'Luxury Marine Drive House',
    rentalStructure: 'entire_property',
    pricing: { monthlyRent: 80000 },
    location: {
      city: 'Mumbai',
      addressLine1: 'Flat 1201, Ocean View Towers',
      addressLine2: 'Marine Drive',
      locality: 'Churchgate',
      pincode: '400020',
      hideExactAddress: true
    }
  });
  const publishedId = pubProp.data!.id;
  const pubRes = propertyBackend.publishProperty(ctxOwnerA, publishedId);
  assert(pubRes.success === true, 'Property published successfully');

  // 2. Draft property
  const draftProp = propertyBackend.createDraft(ctxOwnerA, {
    propertyType: 'room',
    title: 'Secret Draft Room'
  });
  const draftId = draftProp.data!.id;

  // 3. Archived property
  const arcProp = propertyBackend.createDraft(ctxOwnerA, {
    propertyType: 'villa',
    title: 'Old Archived Farmhouse'
  });
  const archivedId = arcProp.data!.id;
  propertyBackend.archiveProperty(ctxOwnerA, archivedId);

  // Public single property queries
  const publicPublished = propertyBackend.getPublicProperty(publishedId);
  assert(publicPublished.success === true, 'Public can view published property');
  assert(publicPublished.data!.title === 'Luxury Marine Drive House', 'Public view contains title');
  assert(publicPublished.data!.location?.addressLine1 === '', 'Exact addressLine1 redacted because hideExactAddress is true');
  assert(publicPublished.data!.location?.addressLine2 === '', 'Exact addressLine2 redacted because hideExactAddress is true');
  assert(publicPublished.data!.location?.locality === 'Churchgate', 'Locality remains visible to tenants');

  const publicDraft = propertyBackend.getPublicProperty(draftId);
  assert(publicDraft.success === false, 'Draft property is hidden from public view');
  assert(publicDraft.status === 404, 'Draft property returns 404 on public query');
  assert(publicDraft.code === 'PROPERTY_NOT_FOUND', 'Code is PROPERTY_NOT_FOUND');

  const publicArchived = propertyBackend.getPublicProperty(archivedId);
  assert(publicArchived.success === false, 'Archived property is hidden from public view');
  assert(publicArchived.status === 404, 'Archived property returns 404 on public query');

  // Public catalog directory search
  const catalogRes = propertyBackend.getPublicProperties();
  assert(catalogRes.success === true, 'getPublicProperties succeeds');
  const catalogList = catalogRes.data!;
  assert(catalogList.some((p) => p.id === publishedId), 'Published property appears in catalog');
  assert(!catalogList.some((p) => p.id === draftId), 'Draft property excluded from catalog');
  assert(!catalogList.some((p) => p.id === archivedId), 'Archived property excluded from catalog');

  // Filter catalog by city
  const mumbaiSearch = propertyBackend.getPublicProperties({ city: 'Mumbai' });
  assert(mumbaiSearch.data!.length >= 1, 'City filter returns Mumbai published listing');
  const delhiSearch = propertyBackend.getPublicProperties({ city: 'Delhi' });
  assert(delhiSearch.data!.length === 0, 'City filter excludes non-matching listings');

  // ==========================================================================
  // RESULTS SUMMARY
  // ==========================================================================
  console.log('\n====================================================================');
  console.log(`PHASE 14 TESTS COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase14SecurityTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
