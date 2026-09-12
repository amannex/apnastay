// ============================================================================
// APNASTAY PROPERTY ENGINE — PHASE 5 PHOTO MANAGEMENT VERIFICATION SUITE
// Tests Multi-Photo Upload, Default & Manual Cover Photo, Reordering,
// Optional Categories, Format/Size Validation, Ownership Isolation & Draft Persistence
// ============================================================================

import { propertyBackend } from '../backend';
import type { UploadPhotoPayload, PropertyPhoto } from '../types';

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

async function runPhase5Tests() {
  console.log('\n===============================================================');
  console.log('APNASTAY PROPERTY ENGINE — PHASE 5 PHOTO MANAGEMENT SUITE');
  console.log('===============================================================\n');

  propertyBackend.reset();

  const ownerAlice = { userId: 601, isAdmin: false };
  const ownerBob = { userId: 602, isAdmin: false };
  const anonymous = { userId: 0, isAdmin: false };

  // --------------------------------------------------------------------------
  // TEST 1: Uploading Multiple Photos & Automatic Cover Assignment
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: Uploading Multiple Photos & Default Cover Photo');

  const draftRes = propertyBackend.createDraft(ownerAlice, {
    propertyType: 'apartment',
    rentalStructure: 'entire_property',
    title: 'Sunny 2BHK Apartment in Indirapuram'
  });
  assert(draftRes.success && Boolean(draftRes.data), 'Created initial apartment draft for Alice');
  const draftId = draftRes.data!.id;

  // Add basic details & location
  propertyBackend.updateProperty(ownerAlice, draftId, {
    title: 'Sunny 2BHK Apartment in Indirapuram',
    description: 'Spacious apartment with wooden flooring and park view.',
    availability: { type: 'immediate' },
    pricing: { monthlyRent: 25000 },
    location: {
      addressLine1: 'Flat 402, Shipra Sun City',
      city: 'Ghaziabad',
      pincode: '201014'
    }
  });

  const propBeforePhotos = propertyBackend.getProperty(ownerAlice, draftId).data!;
  const scoreBeforePhotos = propBeforePhotos.completenessScore;
  assert(scoreBeforePhotos === 50, `Score before photos is 50% (got ${scoreBeforePhotos}%)`);

  // Upload 1st photo
  const photo1Payload: UploadPhotoPayload = {
    fileName: 'living_room.jpg',
    fileSize: 2.4 * 1024 * 1024,
    mimeType: 'image/jpeg',
    category: 'living_room',
    dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBD...'
  };
  const photo1Res = propertyBackend.uploadPhoto(ownerAlice, draftId, photo1Payload);
  assert(photo1Res.success && Boolean(photo1Res.data), 'Uploaded 1st photo (living_room.jpg)');
  const photo1 = photo1Res.data!;
  assert(photo1.isCover === true, '1st photo is automatically set as Cover Photo by default');
  assert(photo1.order === 0, '1st photo has order 0');
  assert(photo1.category === 'living_room', 'Category living_room stored');

  // Verify completeness score elevated by 20%
  const propAfterPhoto1 = propertyBackend.getProperty(ownerAlice, draftId).data!;
  assert(
    propAfterPhoto1.completenessScore === scoreBeforePhotos + 20,
    `Completeness score elevated to 70% with photos (got ${propAfterPhoto1.completenessScore}%)`
  );

  // Upload 2nd photo
  const photo2Payload: UploadPhotoPayload = {
    fileName: 'master_bedroom.png',
    fileSize: 3.8 * 1024 * 1024,
    mimeType: 'image/png',
    category: 'bedroom'
  };
  const photo2Res = propertyBackend.uploadPhoto(ownerAlice, draftId, photo2Payload);
  assert(photo2Res.success && Boolean(photo2Res.data), 'Uploaded 2nd photo (master_bedroom.png)');
  const photo2 = photo2Res.data!;
  assert(photo2.isCover === false, '2nd photo is NOT cover photo by default');
  assert(photo2.order === 1, '2nd photo has order 1');

  // Upload 3rd photo
  const photo3Payload: UploadPhotoPayload = {
    fileName: 'building_exterior.webp',
    fileSize: 1.5 * 1024 * 1024,
    mimeType: 'image/webp',
    category: 'exterior'
  };
  const photo3Res = propertyBackend.uploadPhoto(ownerAlice, draftId, photo3Payload);
  assert(photo3Res.success && Boolean(photo3Res.data), 'Uploaded 3rd photo (building_exterior.webp)');
  const photo3 = photo3Res.data!;
  assert(photo3.order === 2, '3rd photo has order 2');

  // --------------------------------------------------------------------------
  // TEST 2: Explicitly Selecting a Cover Photo
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Explicitly Setting Cover Photo');

  const setCoverRes = propertyBackend.setCoverPhoto(ownerAlice, draftId, photo3.id);
  assert(setCoverRes.success, 'setCoverPhoto call succeeded');
  assert(setCoverRes.data?.isCover === true, 'Photo 3 is now set as Cover Photo');

  const propAfterCover = propertyBackend.getProperty(ownerAlice, draftId).data!;
  const coverCount = propAfterCover.photos!.filter((p) => p.isCover).length;
  assert(coverCount === 1, 'Exactly one photo has isCover === true');
  assert(
    propAfterCover.photos!.find((p) => String(p.id) === String(photo3.id))?.isCover === true,
    'Photo 3 verified as active cover'
  );
  assert(
    propAfterCover.photos!.find((p) => String(p.id) === String(photo1.id))?.isCover === false,
    'Photo 1 is no longer cover photo'
  );

  // --------------------------------------------------------------------------
  // TEST 3: Deleting a Non-Cover Photo & Sequence Re-indexing
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: Deleting a Non-Cover Photo');

  const deletePhoto2Res = propertyBackend.deletePhoto(ownerAlice, draftId, photo2.id);
  assert(deletePhoto2Res.success, 'Successfully deleted photo 2 (bedroom)');
  assert(deletePhoto2Res.data?.remainingPhotos.length === 2, '2 photos remain in property');

  const remainingPhotosAfterDelete = propertyBackend.getProperty(ownerAlice, draftId).data!.photos!;
  assert(
    !remainingPhotosAfterDelete.some((p) => String(p.id) === String(photo2.id)),
    'Photo 2 completely removed from photos list'
  );
  assert(remainingPhotosAfterDelete[0].order === 0, 'First remaining photo has order 0');
  assert(remainingPhotosAfterDelete[1].order === 1, 'Second remaining photo has order 1');
  assert(
    remainingPhotosAfterDelete.find((p) => String(p.id) === String(photo3.id))?.isCover === true,
    'Cover photo (photo 3) remains intact'
  );

  // --------------------------------------------------------------------------
  // TEST 4: Deleting the Cover Photo & Automatic Fallback
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Deleting Cover Photo & Automatic Fallback to First Remaining');

  const deleteCoverRes = propertyBackend.deletePhoto(ownerAlice, draftId, photo3.id);
  assert(deleteCoverRes.success, 'Successfully deleted cover photo (photo 3)');
  const propAfterCoverDelete = propertyBackend.getProperty(ownerAlice, draftId).data!;
  assert(propAfterCoverDelete.photos!.length === 1, '1 photo remains');
  assert(
    propAfterCoverDelete.photos![0].isCover === true,
    'First remaining photo automatically assumed cover role'
  );

  // --------------------------------------------------------------------------
  // TEST 5: Photo Reordering & Persisted Order Sequence
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 5: Photo Reordering');

  // Add 2 more photos
  const kitchenPhoto = propertyBackend.uploadPhoto(ownerAlice, draftId, {
    fileName: 'kitchen.jpg',
    fileSize: 1.2 * 1024 * 1024,
    mimeType: 'image/jpeg',
    category: 'kitchen'
  }).data!;

  const balconyPhoto = propertyBackend.uploadPhoto(ownerAlice, draftId, {
    fileName: 'balcony.jpg',
    fileSize: 1.8 * 1024 * 1024,
    mimeType: 'image/jpeg',
    category: 'common_area'
  }).data!;

  // Current order: [photo1, kitchenPhoto, balconyPhoto]
  // Reorder to: [balconyPhoto, photo1, kitchenPhoto]
  const newOrderIds = [balconyPhoto.id, photo1.id, kitchenPhoto.id];
  const reorderRes = propertyBackend.reorderPhotos(ownerAlice, draftId, newOrderIds);
  assert(reorderRes.success, 'reorderPhotos succeeded');

  const reorderedPhotos = propertyBackend.getProperty(ownerAlice, draftId).data!.photos!;
  assert(String(reorderedPhotos[0].id) === String(balconyPhoto.id), '1st photo is now balconyPhoto');
  assert(reorderedPhotos[0].order === 0, '1st photo has order 0');
  assert(String(reorderedPhotos[1].id) === String(photo1.id), '2nd photo is now photo1');
  assert(reorderedPhotos[1].order === 1, '2nd photo has order 1');
  assert(String(reorderedPhotos[2].id) === String(kitchenPhoto.id), '3rd photo is now kitchenPhoto');
  assert(reorderedPhotos[2].order === 2, '3rd photo has order 2');

  // --------------------------------------------------------------------------
  // TEST 6: Optional Categories Modification
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 6: Optional Categories & Non-Enforced Categorization');

  // Update category
  const updateCatRes = propertyBackend.updatePhotoDetails(ownerAlice, draftId, balconyPhoto.id, {
    category: 'parking'
  });
  assert(updateCatRes.success, 'updatePhotoDetails category succeeded');
  assert(updateCatRes.data?.category === 'parking', 'Category updated to parking');

  // Uncategorized photo
  const uncategorizedPhoto = propertyBackend.uploadPhoto(ownerAlice, draftId, {
    fileName: 'unlabeled.jpg',
    fileSize: 800 * 1024,
    mimeType: 'image/jpeg'
  }).data!;
  assert(uncategorizedPhoto.category === undefined, 'Photo without category is valid and allowed');

  // --------------------------------------------------------------------------
  // TEST 7: File Validation (MIME Types, Oversized, Corrupted)
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 7: File Format & Size Validation');

  // Unsupported MIME type
  const pdfRes = propertyBackend.uploadPhoto(ownerAlice, draftId, {
    fileName: 'lease_agreement.pdf',
    fileSize: 500 * 1024,
    mimeType: 'application/pdf'
  });
  assert(!pdfRes.success, 'Rejected PDF upload');
  assert(pdfRes.code === 'INVALID_IMAGE_FORMAT', 'Error code is INVALID_IMAGE_FORMAT');

  // Oversized file (>10MB)
  const oversizedRes = propertyBackend.uploadPhoto(ownerAlice, draftId, {
    fileName: 'raw_dslr_photo.jpg',
    fileSize: 15 * 1024 * 1024, // 15MB
    mimeType: 'image/jpeg'
  });
  assert(!oversizedRes.success, 'Rejected oversized 15MB file');
  assert(oversizedRes.code === 'IMAGE_TOO_LARGE', 'Error code is IMAGE_TOO_LARGE');

  // Corrupted / 0-byte file
  const zeroByteRes = propertyBackend.uploadPhoto(ownerAlice, draftId, {
    fileName: 'corrupted.png',
    fileSize: 0,
    mimeType: 'image/png'
  });
  assert(!zeroByteRes.success, 'Rejected 0-byte corrupted file');
  assert(zeroByteRes.code === 'CORRUPTED_IMAGE', 'Error code is CORRUPTED_IMAGE');

  // --------------------------------------------------------------------------
  // TEST 8: Cross-Owner and Anonymous Security Authorization
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 8: Cross-Owner Security Authorization (Owner A vs Owner B)');

  // Bob tries to upload photo to Alice's property
  const bobUploadRes = propertyBackend.uploadPhoto(ownerBob, draftId, {
    fileName: 'bob_image.jpg',
    fileSize: 1024 * 1024,
    mimeType: 'image/jpeg'
  });
  assert(!bobUploadRes.success, 'Bob cannot upload photo to Alice property');
  assert(bobUploadRes.status === 403, 'Bob upload returns 403 FORBIDDEN');
  assert(bobUploadRes.code === 'NOT_PROPERTY_OWNER', 'Code is NOT_PROPERTY_OWNER');

  // Bob tries to delete photo from Alice's property
  const bobDeleteRes = propertyBackend.deletePhoto(ownerBob, draftId, balconyPhoto.id);
  assert(!bobDeleteRes.success, 'Bob cannot delete photo from Alice property');
  assert(bobDeleteRes.status === 403, 'Bob delete returns 403 FORBIDDEN');

  // Bob tries to reorder Alice's photos
  const bobReorderRes = propertyBackend.reorderPhotos(ownerBob, draftId, [kitchenPhoto.id]);
  assert(!bobReorderRes.success, 'Bob cannot reorder Alice photos');
  assert(bobReorderRes.status === 403, 'Bob reorder returns 403 FORBIDDEN');

  // Anonymous user tries to upload photo
  const anonUploadRes = propertyBackend.uploadPhoto(anonymous, draftId, {
    fileName: 'anon.jpg',
    fileSize: 1024,
    mimeType: 'image/jpeg'
  });
  assert(!anonUploadRes.success, 'Anonymous user cannot upload photo');
  assert(anonUploadRes.status === 401, 'Anonymous returns 401 UNAUTHENTICATED');

  // --------------------------------------------------------------------------
  // TEST 9: Draft Persistence (Leave and Return Without Losing Photos)
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 9: Draft Persistence Across Sessions');

  const fetchedDraft = propertyBackend.getProperty(ownerAlice, draftId);
  assert(fetchedDraft.success, 'Retrieved property draft from store');
  const persistedPhotos = fetchedDraft.data!.photos!;
  assert(persistedPhotos.length > 0, `Draft retained ${persistedPhotos.length} photos`);
  assert(
    persistedPhotos.some((p) => p.isCover),
    'Cover photo is persisted and present'
  );
  assert(
    persistedPhotos.every((p, idx) => typeof p.order === 'number'),
    'All photo orders persisted'
  );

  // --------------------------------------------------------------------------
  // TEST 10: Batch Update via updateProperty
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 10: Batch Photos Array via updateProperty');

  const batchPhotos: PropertyPhoto[] = [
    {
      id: 'p_custom_1',
      url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
      isCover: true,
      order: 0,
      category: 'living_room'
    },
    {
      id: 'p_custom_2',
      url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
      isCover: false,
      order: 1,
      category: 'bedroom'
    }
  ];

  const batchRes = propertyBackend.updateProperty(ownerAlice, draftId, {
    photos: batchPhotos
  });
  assert(batchRes.success, 'Batch photos update via updateProperty succeeded');
  assert(batchRes.data?.photos?.length === 2, 'Property has 2 photos');
  assert(batchRes.data?.photos?.[0].id === 'p_custom_1', 'First photo is p_custom_1');
  assert(batchRes.data?.photos?.[0].isCover === true, 'First photo isCover is true');

  console.log('\n===============================================================');
  console.log(`PHASE 5 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5Tests().catch((err) => {
  console.error('Fatal error running Phase 5 test suite:', err);
  process.exit(1);
});
