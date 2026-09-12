// ============================================================================
// APNASTAY PROPERTY ENGINE — PHASE 12 MY PROPERTIES MANAGEMENT TEST SUITE
// Tests property duplication engine, deep cloning of units/beds/photos,
// ownership isolation, status reset to draft, multi-criteria filtering & search.
// ============================================================================

import { propertyBackend, BackendRequestContext } from '../backend';
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

async function runPhase12Tests() {
  console.log('\n====================================================================');
  console.log('APNASTAY PROPERTY ENGINE — PHASE 12 MANAGEMENT & DUPLICATION SUITE');
  console.log('====================================================================\n');

  const ownerAlice: BackendRequestContext = { userId: 101, isAdmin: false };
  const ownerBob: BackendRequestContext = { userId: 202, isAdmin: false };
  const anonymousUser: BackendRequestContext = { userId: 0, isAdmin: false };

  // Reset store
  (propertyBackend as any).properties.clear();

  // --------------------------------------------------------------------------
  // TEST 1: Property Duplication Engine (Single-Unit Property)
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: Property Duplication Engine (Single-Unit Property)');
  {
    // Alice creates a single-unit villa
    const draftRes = await propertyBackend.createDraft(ownerAlice, {
      propertyType: 'villa',
      rentalStructure: 'entire_property',
      title: 'Pine Valley Villa'
    });
    assert(draftRes.success && !!draftRes.data, 'Created source villa draft');
    const sourceId = draftRes.data!.id;

    await propertyBackend.updateProperty(ownerAlice, sourceId, {
      description: 'Luxury villa with scenic forest views.',
      location: {
        addressLine1: '45 Pine Valley Lane',
        locality: 'Upper Mussoorie',
        city: 'Mussoorie',
        state: 'Uttarakhand',
        pincode: '248179'
      },
      photos: [
        { id: 'photo-1', url: 'https://images.unsplash.com/villa-front', isCover: true, order: 0 },
        { id: 'photo-2', url: 'https://images.unsplash.com/villa-living', isCover: false, order: 1 }
      ],
      amenities: ['wifi', 'power_backup', 'parking'],
      pricing: {
        monthlyRent: 45000,
        securityDepositConfig: { type: 'months', monthsCount: 2 }
      },
      rules: {
        suitableFor: ['families'],
        petPolicy: 'allowed',
        smokingPolicy: 'not_allowed'
      }
    });

    // Duplicate property with default copy title
    const dupRes = await propertyBackend.duplicateProperty(ownerAlice, sourceId);
    assert(dupRes.success && dupRes.status === 201, 'Duplication returned 201 Created');
    assert(!!dupRes.data, 'Duplication returned cloned property data');

    const clone = dupRes.data!;
    assert(clone.id !== sourceId, 'Cloned property has unique entity ID');
    assert(clone.id.startsWith('prop_'), 'Cloned property ID has prop prefix');
    assert(clone.title === 'Pine Valley Villa (Copy)', 'Cloned property title is formatted with (Copy)');
    assert(clone.status === 'draft', 'Cloned property status is always set to "draft"');
    assert(clone.publishedAt === undefined, 'Cloned property has no publishedAt timestamp');
    assert(clone.ownerId === 101, 'Cloned property belongs to Alice');

    // Verify photos deep cloned with new IDs
    assert(clone.photos.length === 2, 'Cloned property preserves all photos');
    assert(clone.photos[0].id !== 'photo-1', 'First photo received fresh entity ID');
    assert(clone.photos[0].url === 'https://images.unsplash.com/villa-front', 'Photo URL preserved');
    assert(clone.photos[0].isCover === true, 'Cover photo designation preserved');

    // Verify pricing and rules preserved
    assert(clone.pricing?.monthlyRent === 45000, 'Monthly rent preserved in clone');
    assert(clone.rules?.petPolicy === 'allowed', 'Pet policy preserved in clone');
    assert(clone.location?.city === 'Mussoorie', 'City preserved in clone');
  }

  // --------------------------------------------------------------------------
  // TEST 2: Multi-Unit & Bed Relational Deep Duplication
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Multi-Unit & Bed Relational Deep Duplication');
  {
    const buildingRes = await propertyBackend.createDraft(ownerAlice, {
      propertyType: 'building',
      rentalStructure: 'multiple_units',
      title: 'Heritage Residency'
    });
    const buildingId = buildingRes.data!.id;

    await propertyBackend.updateProperty(ownerAlice, buildingId, {
      location: { addressLine1: '88 MG Road', city: 'Bengaluru', pincode: '560001' },
      units: [
        {
          id: 'u-1',
          propertyId: buildingId,
          nameOrNumber: 'Flat 101',
          unitType: 'double_sharing',
          capacity: 2,
          status: 'available',
          pricing: { monthlyRent: 12000 },
          availability: 'available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          beds: [
            {
              id: 'b-1',
              unitId: 'u-1',
              label: 'Bed A',
              pricing: { monthlyRent: 12000 },
              availability: 'available',
              status: 'available',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 'b-2',
              unitId: 'u-1',
              label: 'Bed B',
              pricing: { monthlyRent: 12000 },
              availability: 'available',
              status: 'available',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      ]
    });

    // Duplicate multi-unit building with custom title
    const dupRes = await propertyBackend.duplicateProperty(
      ownerAlice,
      buildingId,
      'Heritage Residency - Block B'
    );
    assert(dupRes.success, 'Multi-unit building duplicated successfully');

    const clone = dupRes.data!;
    assert(clone.title === 'Heritage Residency - Block B', 'Custom title respected on duplicate');
    assert(clone.units.length === 1, 'Cloned property has 1 unit');

    const clonedUnit = clone.units[0];
    assert(clonedUnit.id !== 'u-1', 'Cloned unit received fresh entity ID');
    assert(clonedUnit.propertyId === clone.id, 'Cloned unit references new cloned property ID');
    assert(clonedUnit.nameOrNumber === 'Flat 101', 'Unit name preserved');
    assert(clonedUnit.beds.length === 2, 'Cloned unit contains both beds');

    const clonedBed1 = clonedUnit.beds[0];
    assert(clonedBed1.id !== 'b-1', 'First bed received fresh entity ID');
    assert(clonedBed1.unitId === clonedUnit.id, 'First bed references new cloned unit ID');
    assert(clonedBed1.label === 'Bed A', 'Bed label preserved');
  }

  // --------------------------------------------------------------------------
  // TEST 3: Duplicating Published and Archived Properties
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: Duplicating Published & Archived Properties');
  {
    // 1. Published property duplication
    const pubDraftRes = await propertyBackend.createDraft(ownerAlice, {
      propertyType: 'apartment',
      rentalStructure: 'entire_property',
      title: 'Sunny Studio Flat'
    });
    const pubId = pubDraftRes.data!.id;

    await propertyBackend.updateProperty(ownerAlice, pubId, {
      description: 'Cozy fully furnished studio flat near tech park.',
      location: { addressLine1: '12 IT Highway', city: 'Chennai', pincode: '600001' },
      photos: [{ id: 'p-studio', url: 'https://images.unsplash.com/studio', isCover: true, order: 0 }],
      pricing: { monthlyRent: 18000 },
      availability: { type: 'immediate' }
    });

    await propertyBackend.publishProperty(ownerAlice, pubId);
    const publishedSource = (await propertyBackend.getProperty(ownerAlice, pubId)).data!;
    assert(publishedSource.status === 'published', 'Source property is published');

    const dupFromPubRes = await propertyBackend.duplicateProperty(ownerAlice, pubId);
    assert(dupFromPubRes.success, 'Duplicated published property');
    assert(dupFromPubRes.data?.status === 'draft', 'Duplicate of published property starts as "draft"');
    assert(!dupFromPubRes.data?.publishedAt, 'Duplicate of published property has no publishedAt');

    // 2. Archived property duplication
    await propertyBackend.archiveProperty(ownerAlice, pubId);
    const archivedSource = (await propertyBackend.getProperty(ownerAlice, pubId)).data!;
    assert(archivedSource.status === 'archived', 'Source property is now archived');

    const dupFromArchRes = await propertyBackend.duplicateProperty(ownerAlice, pubId);
    assert(dupFromArchRes.success, 'Duplicated archived property');
    assert(dupFromArchRes.data?.status === 'draft', 'Duplicate of archived property is created in active "draft" status');
  }

  // --------------------------------------------------------------------------
  // TEST 4: Ownership Isolation & Access Control
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Ownership Isolation & Access Control');
  {
    const alicePropRes = await propertyBackend.createDraft(ownerAlice, {
      propertyType: 'house',
      rentalStructure: 'entire_property',
      title: 'Alice Cottage'
    });
    const alicePropId = alicePropRes.data!.id;

    // 1. Anonymous user cannot duplicate
    const anonDup = await propertyBackend.duplicateProperty(anonymousUser, alicePropId);
    assert(anonDup.status === 401 && anonDup.code === 'UNAUTHENTICATED', 'Anonymous user rejected from duplicating with 401');

    // 2. Bob cannot duplicate Alice's property
    const bobDup = await propertyBackend.duplicateProperty(ownerBob, alicePropId);
    assert(bobDup.status === 403 && bobDup.code === 'NOT_PROPERTY_OWNER', 'Bob rejected from duplicating Alice property with 403');

    // 3. Bob creates his own property
    const bobPropRes = await propertyBackend.createDraft(ownerBob, {
      propertyType: 'apartment',
      rentalStructure: 'entire_property',
      title: 'Bob Penthouse'
    });
    const bobPropId = bobPropRes.data!.id;

    // 4. Portfolio isolation check
    const aliceList = await propertyBackend.getOwnerProperties(ownerAlice, 'all');
    const bobList = await propertyBackend.getOwnerProperties(ownerBob, 'all');

    assert(!aliceList.data?.some((p) => p.id === bobPropId), 'Alice portfolio contains NO properties of Bob');
    assert(!bobList.data?.some((p) => p.id === alicePropId), 'Bob portfolio contains NO properties of Alice');
    assert(bobList.data?.every((p) => p.ownerId === 202), 'All properties in Bob portfolio belong strictly to Bob');
    assert(aliceList.data?.every((p) => p.ownerId === 101), 'All properties in Alice portfolio belong strictly to Alice');
  }

  // --------------------------------------------------------------------------
  // TEST 5: Multi-Criteria Filtering & Search Logic Verification
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 5: Multi-Criteria Filtering & Search Simulation');
  {
    // Reset store for controlled dataset
    (propertyBackend as any).properties.clear();

    // Alice creates 4 properties in different states & locations
    const p1 = await propertyBackend.createDraft(ownerAlice, {
      propertyType: 'villa',
      rentalStructure: 'entire_property',
      title: 'Serene Mountain Villa'
    });
    await propertyBackend.updateProperty(ownerAlice, p1.data!.id, {
      location: { addressLine1: '1 Mall Rd', city: 'Shimla', locality: 'Jakhu', pincode: '171001' }
    });

    const p2 = await propertyBackend.createDraft(ownerAlice, {
      propertyType: 'apartment',
      rentalStructure: 'entire_property',
      title: 'Urban Heights 3BHK'
    });
    await propertyBackend.updateProperty(ownerAlice, p2.data!.id, {
      location: { addressLine1: '40 Koramangala Main Rd', city: 'Bengaluru', locality: 'Koramangala', pincode: '560034' },
      photos: [{ id: 'p2-photo', url: 'https://images.unsplash.com/apt', isCover: true, order: 0 }],
      pricing: { monthlyRent: 38000 },
      availability: { type: 'immediate' }
    });
    await propertyBackend.publishProperty(ownerAlice, p2.data!.id);

    const p3 = await propertyBackend.createDraft(ownerAlice, {
      propertyType: 'apartment',
      rentalStructure: 'entire_property',
      title: 'Lakeside Studio Apartment'
    });
    await propertyBackend.updateProperty(ownerAlice, p3.data!.id, {
      location: { addressLine1: '8 Lake View', city: 'Udaipur', locality: 'Fateh Sagar', pincode: '313001' },
      photos: [{ id: 'p3-photo', url: 'https://images.unsplash.com/apt2', isCover: true, order: 0 }],
      pricing: { monthlyRent: 15000 },
      availability: { type: 'immediate' }
    });
    await propertyBackend.publishProperty(ownerAlice, p3.data!.id);
    await propertyBackend.unpublishProperty(ownerAlice, p3.data!.id);

    const p4 = await propertyBackend.createDraft(ownerAlice, {
      propertyType: 'hostel',
      rentalStructure: 'individual_bed',
      title: 'Scholars Hostel & PG'
    });
    await propertyBackend.archiveProperty(ownerAlice, p4.data!.id);

    // Fetch all for Alice
    const allAlice = (await propertyBackend.getOwnerProperties(ownerAlice, 'all')).data!;
    assert(allAlice.length === 4, 'Total portfolio has 4 properties');

    // 1. Status Filter: active (excludes archived)
    const activeProps = allAlice.filter((p) => p.status !== 'archived');
    assert(activeProps.length === 3, 'Active filter returns 3 properties');

    // 2. Status Filter: published
    const publishedProps = allAlice.filter((p) => p.status === 'published');
    assert(publishedProps.length === 1 && publishedProps[0].id === p2.data!.id, 'Published filter returns only p2');

    // 3. Status Filter: unpublished
    const unpublishedProps = allAlice.filter((p) => p.status === 'unpublished');
    assert(unpublishedProps.length === 1 && unpublishedProps[0].id === p3.data!.id, 'Unpublished filter returns only p3');

    // 4. Status Filter: archived
    const archivedProps = allAlice.filter((p) => p.status === 'archived');
    assert(archivedProps.length === 1 && archivedProps[0].id === p4.data!.id, 'Archived filter returns only p4');

    // 5. Property Type Filter: 'apartment' across active
    const apartmentProps = activeProps.filter((p) => p.propertyType === 'apartment');
    assert(apartmentProps.length === 2, 'Apartment type filter returns 2 active apartments');

    // 6. Text Search: "Bengaluru" (city search)
    const bengaluruSearch = activeProps.filter((p) =>
      (p.location?.city || '').toLowerCase().includes('bengaluru')
    );
    assert(bengaluruSearch.length === 1 && bengaluruSearch[0].title === 'Urban Heights 3BHK', 'City search "Bengaluru" matched correct property');

    // 7. Text Search: "Villa" (title search)
    const villaSearch = activeProps.filter((p) =>
      p.title.toLowerCase().includes('villa')
    );
    assert(villaSearch.length === 1 && villaSearch[0].title === 'Serene Mountain Villa', 'Title search "Villa" matched correct property');

    // 8. Text Search with no matches
    const noMatch = activeProps.filter((p) =>
      p.title.toLowerCase().includes('nonexistent query')
    );
    assert(noMatch.length === 0, 'Non-existent search returns 0 properties');
  }

  // Summary
  console.log('\n====================================================================');
  console.log(`PHASE 12 TESTS COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase12Tests().catch((err) => {
  console.error('Fatal error running Phase 12 tests:', err);
  process.exit(1);
});
