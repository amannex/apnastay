// ============================================================================
// APNASTAY PROPERTY ENGINE — PROPERTY DELETE OPTION TEST SUITE
// Tests permanent property deletion across all statuses (draft, published,
// unpublished, archived), authorization & ownership enforcement, store consistency,
// and cascading removal.
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

async function runPropertyDeleteTests() {
  console.log('\n====================================================================');
  console.log('APNASTAY PROPERTY ENGINE — PROPERTY DELETE OPTION SUITE');
  console.log('====================================================================\n');

  const ownerAlice: BackendRequestContext = { userId: 101, isAdmin: false };
  const ownerBob: BackendRequestContext = { userId: 202, isAdmin: false };
  const anonymousUser: BackendRequestContext = { userId: 0, isAdmin: false };

  // Clear backend memory store
  (propertyBackend as any).properties.clear();

  // Helper to create a complete property draft
  const createProperty = async (ctx: BackendRequestContext, title: string): Promise<Property> => {
    const res = await propertyBackend.createDraft(ctx, {
      propertyType: 'villa',
      rentalStructure: 'entire_property',
      title
    });
    const id = res.data!.id;

    const updateRes = await propertyBackend.updateProperty(ctx, id, {
      description: 'Well-appointed villa with modern amenities in prime location.',
      location: {
        addressLine1: '45 Lake View Residency',
        locality: 'Rajpur Road',
        city: 'Dehradun',
        state: 'Uttarakhand',
        pincode: '248001'
      },
      photos: [
        {
          id: 'photo-1',
          url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
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
        monthlyRent: 28000,
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
  // TEST 1: Delete Draft Property
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: Permanent Deletion of Draft Property');
  {
    const prop = await createProperty(ownerAlice, 'Alice Draft Apartment');
    assert(prop.status === 'draft', 'Property is initially in draft state');

    // Delete property
    const deleteRes = await propertyBackend.deleteProperty(ownerAlice, prop.id);
    assert(deleteRes.success === true, 'Draft property delete returned success: true');
    assert(deleteRes.status === 200, 'Delete response status is 200');
    assert(deleteRes.data?.id === prop.id, 'Delete response contains matching property ID');
    assert(deleteRes.data?.deleted === true, 'Delete response confirmed deleted: true');

    // Verify property is gone
    const fetchRes = await propertyBackend.getProperty(ownerAlice, prop.id);
    assert(fetchRes.success === false, 'Fetching deleted draft fails');
    assert(fetchRes.status === 404, 'Deleted draft returns 404 Not Found');

    // Verify absent from owner property list
    const listRes = await propertyBackend.getOwnerProperties(ownerAlice, 'all');
    const exists = listRes.data?.some((p) => p.id === prop.id);
    assert(!exists, 'Deleted draft is completely absent from owner property list');
  }

  // --------------------------------------------------------------------------
  // TEST 2: Delete Published Property
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Permanent Deletion of Published Property');
  {
    const prop = await createProperty(ownerAlice, 'Alice Published Villa');
    const pubRes = await propertyBackend.publishProperty(ownerAlice, prop.id);
    assert(pubRes.success === true && pubRes.data?.status === 'published', 'Property published successfully');

    // Delete property
    const deleteRes = await propertyBackend.deleteProperty(ownerAlice, prop.id);
    assert(deleteRes.success === true, 'Published property delete returned success: true');

    const fetchRes = await propertyBackend.getProperty(ownerAlice, prop.id);
    assert(fetchRes.status === 404, 'Deleted published property returns 404');
  }

  // --------------------------------------------------------------------------
  // TEST 3: Delete Unpublished Property
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: Permanent Deletion of Unpublished Property');
  {
    const prop = await createProperty(ownerAlice, 'Alice Unpublished Studio');
    await propertyBackend.publishProperty(ownerAlice, prop.id);
    const unpubRes = await propertyBackend.unpublishProperty(ownerAlice, prop.id);
    assert(unpubRes.success === true && unpubRes.data?.status === 'unpublished', 'Property unpublished successfully');

    const deleteRes = await propertyBackend.deleteProperty(ownerAlice, prop.id);
    assert(deleteRes.success === true, 'Unpublished property delete returned success: true');

    const fetchRes = await propertyBackend.getProperty(ownerAlice, prop.id);
    assert(fetchRes.status === 404, 'Deleted unpublished property returns 404');
  }

  // --------------------------------------------------------------------------
  // TEST 4: Delete Archived Property
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Permanent Deletion of Archived Property');
  {
    const prop = await createProperty(ownerAlice, 'Alice Archived House');
    const archiveRes = await propertyBackend.archiveProperty(ownerAlice, prop.id);
    assert(archiveRes.success === true && archiveRes.data?.status === 'archived', 'Property archived successfully');

    const deleteRes = await propertyBackend.deleteProperty(ownerAlice, prop.id);
    assert(deleteRes.success === true, 'Archived property permanently deleted returned success: true');

    const fetchRes = await propertyBackend.getProperty(ownerAlice, prop.id);
    assert(fetchRes.status === 404, 'Archived property cannot be fetched after permanent deletion');

    // Verify archived tab doesn't show it
    const archivedList = await propertyBackend.getOwnerProperties(ownerAlice, 'archived');
    const exists = archivedList.data?.some((p) => p.id === prop.id);
    assert(!exists, 'Archived list does not contain permanently deleted property');
  }

  // --------------------------------------------------------------------------
  // TEST 5: Security & Authorization Enforcements
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 5: Security & Ownership Enforcement for Delete');
  {
    const prop = await createProperty(ownerAlice, 'Alice Protected Property');

    // Anonymous user cannot delete
    const anonRes = await propertyBackend.deleteProperty(anonymousUser, prop.id);
    assert(anonRes.success === false, 'Anonymous delete request rejected');
    assert(anonRes.status === 401, 'Anonymous delete returns 401 Unauthorized');

    // Bob cannot delete Alice's property
    const bobRes = await propertyBackend.deleteProperty(ownerBob, prop.id);
    assert(bobRes.success === false, 'Non-owner Bob cannot delete Alice property');
    assert(bobRes.status === 403, 'Non-owner delete returns 403 Forbidden');

    // Alice can delete her own property
    const aliceRes = await propertyBackend.deleteProperty(ownerAlice, prop.id);
    assert(aliceRes.success === true, 'Owner Alice can delete her property');

    // Cannot delete again (idempotent / 404)
    const repeatRes = await propertyBackend.deleteProperty(ownerAlice, prop.id);
    assert(repeatRes.success === false, 'Deleting already-deleted property fails');
    assert(repeatRes.status === 404, 'Non-existent property delete returns 404');
  }

  // --------------------------------------------------------------------------
  // TEST 6: Non-existent Property ID Deletion
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 6: Delete Non-existent Property ID');
  {
    const invalidRes = await propertyBackend.deleteProperty(ownerAlice, 'non-existent-prop-999');
    assert(invalidRes.success === false, 'Delete fails for non-existent property');
    assert(invalidRes.status === 404, 'Delete returns 404 Not Found');
    assert(invalidRes.code === 'PROPERTY_NOT_FOUND', 'Delete returns code PROPERTY_NOT_FOUND');
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n====================================================================');
  console.log(`PROPERTY DELETE TESTS COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPropertyDeleteTests();
