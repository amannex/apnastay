// ============================================================================
// APNASTAY PROPERTY ENGINE — PHASE 11 LIFECYCLE & DRAFT MANAGEMENT TEST SUITE
// Tests 4-state lifecycle (draft, published, unpublished, archived), valid & invalid
// transitions, soft-archive preservation, active vs archived filtering, authorization,
// and intelligent draft resumption (determineNextIncompleteStep).
// ============================================================================

import { propertyBackend, BackendRequestContext } from '../backend';
import { determineNextIncompleteStep } from '../completeness';
import type { Property } from '../types';

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

async function runPhase11Tests() {
  console.log('\n====================================================================');
  console.log('APNASTAY PROPERTY ENGINE — PHASE 11 LIFECYCLE & DRAFTS SUITE');
  console.log('====================================================================\n');

  const ownerAlice: BackendRequestContext = { userId: 101, isAdmin: false };
  const ownerBob: BackendRequestContext = { userId: 202, isAdmin: false };
  const anonymousUser: BackendRequestContext = { userId: 0, isAdmin: false };

  // Reset store
  (propertyBackend as any).properties.clear();

  // Helper to create a fully publishable property draft
  const createPublishableDraft = async (ctx: BackendRequestContext): Promise<Property> => {
    const res = await propertyBackend.createDraft(ctx, {
      propertyType: 'villa',
      rentalStructure: 'entire_property',
      title: 'Green Meadows Villa'
    });
    const id = res.data!.id;

    const updateRes = await propertyBackend.updateProperty(ctx, id, {
      description: 'A luxurious villa with private swimming pool and scenic mountain view in Dehradun.',
      location: {
        addressLine1: '124 Hillside Road',
        locality: 'Rajpur Road',
        city: 'Dehradun',
        state: 'Uttarakhand',
        pincode: '248001'
      },
      photos: [
        {
          id: 'photo-1',
          url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
          isCover: true,
          order: 0
        },
        {
          id: 'photo-2',
          url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
          isCover: false,
          order: 1
        },
        {
          id: 'photo-3',
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
          isCover: false,
          order: 2
        }
      ],
      amenities: ['wifi', 'power_backup', 'parking', 'kitchen'],
      pricing: {
        monthlyRent: 35000,
        securityDepositConfig: { type: 'months', monthsCount: 2 },
        maintenanceChargesConfig: { type: 'included' }
      },
      availability: {
        type: 'immediate'
      },
      rules: {
        suitableFor: ['families', 'working_professionals'],
        petPolicy: 'allowed',
        smokingPolicy: 'not_allowed',
        alcoholPolicy: 'allowed',
        guestPolicy: 'allowed'
      }
    });

    return updateRes.data!;
  };

  // --------------------------------------------------------------------------
  // TEST 1: Full Lifecycle State Machine (Draft -> Published -> Unpublished -> Archived -> Restored)
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: Full Lifecycle State Machine Transitions');
  {
    const draft = await createPublishableDraft(ownerAlice);
    assert(draft.status === 'draft', 'Initial property created in "draft" status');
    assert(!draft.publishedAt, 'Draft has no publishedAt timestamp');

    // 1. Draft -> Published
    const pubRes = await propertyBackend.publishProperty(ownerAlice, draft.id);
    assert(pubRes.status === 200 && pubRes.data?.status === 'published', 'Published successfully from draft');
    assert(!!pubRes.data?.publishedAt, 'Published listing has valid publishedAt timestamp');
    assert((pubRes.data?.completenessScore || 0) >= 80, `Published listing has high completeness score (${pubRes.data?.completenessScore}%)`);

    // 2. Published -> Unpublished
    const unpubRes = await propertyBackend.unpublishProperty(ownerAlice, draft.id);
    assert(unpubRes.status === 200 && unpubRes.data?.status === 'unpublished', 'Unpublished successfully from published');
    assert(unpubRes.data?.pricing?.monthlyRent === 35000, 'Pricing preserved when unpublished');

    // 3. Unpublished -> Published (Re-publish)
    const repubRes = await propertyBackend.publishProperty(ownerAlice, draft.id);
    assert(repubRes.status === 200 && repubRes.data?.status === 'published', 'Re-published successfully from unpublished');

    // 4. Published -> Archived
    const archRes = await propertyBackend.archiveProperty(ownerAlice, draft.id);
    assert(archRes.status === 200 && archRes.data?.status === 'archived', 'Archived successfully from published');

    // 5. Archived -> Restored (transitions to unpublished)
    const restoreRes = await propertyBackend.restoreProperty(ownerAlice, draft.id);
    assert(restoreRes.status === 200 && restoreRes.data?.status === 'unpublished', 'Restored successfully from archived to unpublished');
    assert(restoreRes.data?.location?.city === 'Dehradun', 'Location details intact after restoration');
  }

  // --------------------------------------------------------------------------
  // TEST 2: Invalid Status Transitions & Guards
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Invalid Status Transitions & Guard Enforcement');
  {
    const draft = await createPublishableDraft(ownerAlice);

    // 1. Cannot unpublish a draft
    const unpubDraftRes = await propertyBackend.unpublishProperty(ownerAlice, draft.id);
    assert(unpubDraftRes.status === 400 && unpubDraftRes.code === 'INVALID_STATUS_TRANSITION', 'Cannot unpublish a property that is in draft status');

    // 2. Archive the draft directly
    const archDraftRes = await propertyBackend.archiveProperty(ownerAlice, draft.id);
    assert(archDraftRes.status === 200 && archDraftRes.data?.status === 'archived', 'Draft can be archived directly');

    // 3. Cannot publish an archived property directly
    const pubArchRes = await propertyBackend.publishProperty(ownerAlice, draft.id);
    assert(pubArchRes.status === 400 && pubArchRes.code === 'INVALID_STATUS_TRANSITION', 'Cannot publish an archived property directly (must restore first)');

    // 4. Cannot archive an already archived property
    const reArchRes = await propertyBackend.archiveProperty(ownerAlice, draft.id);
    assert(reArchRes.status === 400 && reArchRes.code === 'INVALID_STATUS_TRANSITION', 'Cannot archive an already archived property');

    // 5. Cannot restore a property that is not archived
    const draft2 = await createPublishableDraft(ownerAlice);
    const restoreDraftRes = await propertyBackend.restoreProperty(ownerAlice, draft2.id);
    assert(restoreDraftRes.status === 400 && restoreDraftRes.code === 'INVALID_STATUS_TRANSITION', 'Cannot restore a property that is not archived');

    // 6. Direct status tampering in updateProperty is blocked for invalid transitions
    const tamperRes = await propertyBackend.updateProperty(ownerAlice, draft.id, {
      status: 'published' as any
    });
    assert(tamperRes.status === 400 && tamperRes.code === 'INVALID_STATUS_TRANSITION', 'Direct status tampering on archived property via updateProperty is blocked');
  }

  // --------------------------------------------------------------------------
  // TEST 3: Soft-Archive Data Integrity Preservation
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: Soft-Archive Data Integrity Preservation');
  {
    // Create multi-unit property with units and beds
    const draftRes = await propertyBackend.createDraft(ownerAlice, {
      propertyType: 'building',
      rentalStructure: 'multiple_units',
      title: 'Sunrise Heights Building'
    });

    assert(draftRes.success && !!draftRes.data, 'Created multi-unit building draft successfully');
    const propertyId = draftRes.data!.id;

    await propertyBackend.updateProperty(ownerAlice, propertyId, {
      description: 'Premium student residential complex with private and shared flats.',
      location: {
        addressLine1: '77 University Circle',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411007'
      },
      photos: [
        { id: 'p1', url: 'https://images.unsplash.com/building-cover', isCover: true, order: 0 }
      ],
      amenities: ['wifi', 'cctv'],
      pricing: {
        monthlyRent: 8500
      },
      availability: {
        type: 'immediate'
      }
    });

    // Attach units with beds
    await propertyBackend.updateProperty(ownerAlice, propertyId, {
      units: [
        {
          id: 'unit-1',
          propertyId,
          nameOrNumber: 'Flat 101',
          unitType: 'double_sharing',
          capacity: 2,
          pricing: { monthlyRent: 8500 },
          availability: 'available',
          status: 'available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          beds: [
            { id: 'bed-1', unitId: 'unit-1', label: 'Bed A', pricing: { monthlyRent: 8500 }, availability: 'available', status: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 'bed-2', unitId: 'unit-1', label: 'Bed B', pricing: { monthlyRent: 8500 }, availability: 'available', status: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          ]
        }
      ]
    });

    // Archive property
    const archRes = await propertyBackend.archiveProperty(ownerAlice, propertyId);
    assert(archRes.status === 200, 'Property archived');

    // Verify all units, beds, media, pricing preserved while archived
    const fetchedArchived = await propertyBackend.getProperty(ownerAlice, propertyId);
    assert(fetchedArchived.data?.units?.length === 1, 'Units preserved after archiving');
    assert(fetchedArchived.data?.units?.[0]?.beds?.length === 2, 'Beds preserved after archiving');
    assert(fetchedArchived.data?.photos?.length === 1, 'Photos preserved after archiving');
    assert(fetchedArchived.data?.pricing?.monthlyRent === 8500, 'Pricing preserved after archiving');

    // Restore property
    const restoredRes = await propertyBackend.restoreProperty(ownerAlice, propertyId);
    assert(restoredRes.status === 200, 'Property restored');
    assert(restoredRes.data?.units?.length === 1, 'Units preserved after restoration');
    assert(restoredRes.data?.units?.[0]?.beds?.[0]?.label === 'Bed A', 'Bed details preserved after restoration');
  }

  // --------------------------------------------------------------------------
  // TEST 4: Listing Filtering in getOwnerProperties
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Listing Filtering in getOwnerProperties');
  {
    // Clear properties for clean count assertion
    (propertyBackend as any).properties.clear();

    // Alice creates 1 draft, 1 published, 1 unpublished, 1 archived
    const propDraft = await createPublishableDraft(ownerAlice);
    
    const propPub = await createPublishableDraft(ownerAlice);
    await propertyBackend.publishProperty(ownerAlice, propPub.id);

    const propUnpub = await createPublishableDraft(ownerAlice);
    await propertyBackend.publishProperty(ownerAlice, propUnpub.id);
    await propertyBackend.unpublishProperty(ownerAlice, propUnpub.id);

    const propArch = await createPublishableDraft(ownerAlice);
    await propertyBackend.archiveProperty(ownerAlice, propArch.id);

    // 1. Default (no filter) or 'active' excludes archived properties
    const activeList = await propertyBackend.getOwnerProperties(ownerAlice);
    assert(activeList.data?.length === 3, 'Default getOwnerProperties returns 3 active properties (draft, pub, unpub)');
    assert(!activeList.data?.some(p => p.status === 'archived'), 'Default view excludes archived properties');

    const explicitActiveList = await propertyBackend.getOwnerProperties(ownerAlice, 'active');
    assert(explicitActiveList.data?.length === 3, 'Filter "active" returns only non-archived properties');

    // 2. Filter 'draft'
    const draftList = await propertyBackend.getOwnerProperties(ownerAlice, 'draft');
    assert(draftList.data?.length === 1 && draftList.data[0].id === propDraft.id, 'Filter "draft" returns only draft properties');

    // 3. Filter 'published'
    const pubList = await propertyBackend.getOwnerProperties(ownerAlice, 'published');
    assert(pubList.data?.length === 1 && pubList.data[0].id === propPub.id, 'Filter "published" returns only published properties');

    // 4. Filter 'unpublished'
    const unpubList = await propertyBackend.getOwnerProperties(ownerAlice, 'unpublished');
    assert(unpubList.data?.length === 1 && unpubList.data[0].id === propUnpub.id, 'Filter "unpublished" returns only unpublished properties');

    // 4b. Filter 'unlisted' (merges draft + unpublished)
    const unlistedList = await propertyBackend.getOwnerProperties(ownerAlice, 'unlisted');
    assert(unlistedList.data?.length === 2, 'Filter "unlisted" returns both draft and unpublished properties (2)');
    assert(
      unlistedList.data?.some((p) => p.id === propDraft.id) && unlistedList.data?.some((p) => p.id === propUnpub.id),
      'Filter "unlisted" contains both draft and unpublished items'
    );

    // 5. Filter 'archived'
    const archList = await propertyBackend.getOwnerProperties(ownerAlice, 'archived');
    assert(archList.data?.length === 1 && archList.data[0].id === propArch.id, 'Filter "archived" returns only archived properties');

    // 6. Filter 'all'
    const allList = await propertyBackend.getOwnerProperties(ownerAlice, 'all');
    assert(allList.data?.length === 4, 'Filter "all" returns all 4 properties including archived');
  }

  // --------------------------------------------------------------------------
  // TEST 5: Owner Authorization & Access Control
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 5: Owner Authorization & Access Control');
  {
    const aliceProp = await createPublishableDraft(ownerAlice);
    await propertyBackend.publishProperty(ownerAlice, aliceProp.id);

    // 1. Anonymous user checks
    const anonUnpub = await propertyBackend.unpublishProperty(anonymousUser, aliceProp.id);
    assert(anonUnpub.status === 401 && anonUnpub.code === 'UNAUTHENTICATED', 'Anonymous user cannot unpublish');

    const anonArch = await propertyBackend.archiveProperty(anonymousUser, aliceProp.id);
    assert(anonArch.status === 401 && anonArch.code === 'UNAUTHENTICATED', 'Anonymous user cannot archive');

    const anonRestore = await propertyBackend.restoreProperty(anonymousUser, aliceProp.id);
    assert(anonRestore.status === 401 && anonRestore.code === 'UNAUTHENTICATED', 'Anonymous user cannot restore');

    // 2. Non-owner (Bob) attempts to mutate Alice's listing
    const bobUnpub = await propertyBackend.unpublishProperty(ownerBob, aliceProp.id);
    assert(bobUnpub.status === 403 && bobUnpub.code === 'NOT_PROPERTY_OWNER', 'Non-owner cannot unpublish another owner listing');

    const bobArch = await propertyBackend.archiveProperty(ownerBob, aliceProp.id);
    assert(bobArch.status === 403 && bobArch.code === 'NOT_PROPERTY_OWNER', 'Non-owner cannot archive another owner listing');

    // Alice archives her property
    await propertyBackend.archiveProperty(ownerAlice, aliceProp.id);

    const bobRestore = await propertyBackend.restoreProperty(ownerBob, aliceProp.id);
    assert(bobRestore.status === 403 && bobRestore.code === 'NOT_PROPERTY_OWNER', 'Non-owner cannot restore another owner archived listing');
  }

  // --------------------------------------------------------------------------
  // TEST 6: Intelligent Draft Resumption Step Resolution
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 6: Intelligent Draft Resumption Step Resolution');
  {
    // Step 1: Blank property type
    const blankProp: Property = {
      id: 'p-1',
      ownerId: 101,
      title: '',
      description: '',
      propertyType: '' as any,
      rentalStructure: '' as any,
      status: 'draft',
      photos: [],
      amenities: [],
      completenessScore: 15,
      units: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    assert(determineNextIncompleteStep(blankProp) === 1, 'Blank draft opens at Step 1 (Property Type)');

    // Step 2: Has Property Type, no Rental Structure
    const typeOnlyProp: Property = { ...blankProp, propertyType: 'apartment' };
    assert(determineNextIncompleteStep(typeOnlyProp) === 2, 'Property with type opens at Step 2 (Rental Structure)');

    // Step 3: Has Rental Structure, no Title
    const structProp: Property = { ...typeOnlyProp, rentalStructure: 'entire_property' };
    assert(determineNextIncompleteStep(structProp) === 3, 'Property with type and structure but no title opens at Step 3 (Basic Details)');

    // Step 4: Has Title & Description, but no Location
    const titledProp: Property = {
      ...structProp,
      title: 'Seaside Flat',
      description: 'A bright 2BHK flat near the beach.'
    };
    assert(determineNextIncompleteStep(titledProp) === 4, 'Property missing location opens at Step 4 (Location)');

    // Step 5: Has Location, but no Photos
    const locationProp: Property = {
      ...titledProp,
      location: { addressLine1: '12 Beach Rd', city: 'Goa', pincode: '403001' }
    };
    assert(determineNextIncompleteStep(locationProp) === 5, 'Property missing photos opens at Step 5 (Photos)');

    // Step 7: Multi-unit property with photos, but no Units created
    const multiUnitProp: Property = {
      ...locationProp,
      propertyType: 'building',
      rentalStructure: 'multiple_units',
      photos: [{ id: 'p1', url: 'https://test.com/photo.jpg', isCover: true, order: 0 }],
      units: []
    };
    assert(determineNextIncompleteStep(multiUnitProp) === 7, 'Multi-unit property with no units opens at Step 7 (Units)');

    // Step 8: Single unit property with photos, but no Pricing
    const singleUnitProp: Property = {
      ...locationProp,
      photos: [{ id: 'p1', url: 'https://test.com/photo.jpg', isCover: true, order: 0 }]
    };
    assert(determineNextIncompleteStep(singleUnitProp) === 8, 'Single-unit property missing pricing opens at Step 8 (Pricing)');

    // Step 10: Complete property opens at Step 10 (Review)
    const completeProp = await createPublishableDraft(ownerAlice);
    assert(determineNextIncompleteStep(completeProp) === 10, 'Complete property draft opens at Step 10 (Review)');
  }

  // Summary
  console.log('\n====================================================================');
  console.log(`PHASE 11 TESTS COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase11Tests().catch((err) => {
  console.error('Fatal error running Phase 11 tests:', err);
  process.exit(1);
});
