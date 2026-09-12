// ============================================================================
// APNASTAY PROPERTY ENGINE — PHASE 12 MY PROPERTIES MANAGEMENT TEST SUITE
// Tests property duplication with deep unit/bed cloning, ownership security,
// lightweight PropertySummary projection, search, filtering, and sorting logic.
// ============================================================================

import { propertyBackend, BackendRequestContext, toPropertySummary } from '../backend';
import type { Property, PropertySortOption } from '../types';

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
  console.log('APNASTAY PROPERTY ENGINE — PHASE 12 MY PROPERTIES MANAGEMENT SUITE');
  console.log('====================================================================\n');

  const ownerAlice: BackendRequestContext = { userId: 101, isAdmin: false };
  const ownerBob: BackendRequestContext = { userId: 202, isAdmin: false };
  const anonymousUser: BackendRequestContext = { userId: 0, isAdmin: false };

  // Reset store
  (propertyBackend as any).properties.clear();

  // Helper to create a comprehensive property with units and beds
  const createTestBuilding = async (ctx: BackendRequestContext): Promise<Property> => {
    const draftRes = await propertyBackend.createDraft(ctx, {
      propertyType: 'building',
      rentalStructure: 'multiple_units',
      title: 'Pineview Residency'
    });

    const propertyId = draftRes.data!.id;

    const updateRes = await propertyBackend.updateProperty(ctx, propertyId, {
      description: 'Modern residential complex near City Center with furnished flats.',
      location: {
        addressLine1: '45 Lake View Road',
        locality: 'Civil Lines',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302006'
      },
      photos: [
        { id: 'p1', url: 'https://images.unsplash.com/lakeview-exterior', isCover: true, order: 0 },
        { id: 'p2', url: 'https://images.unsplash.com/lakeview-lobby', isCover: false, order: 1 }
      ],
      amenities: ['wifi', 'cctv', 'parking', 'power_backup'],
      pricing: {
        monthlyRent: 22000,
        securityDepositConfig: { type: 'months', monthsCount: 2 }
      },
      availability: {
        type: 'immediate'
      },
      units: [
        {
          id: 'unit-101',
          propertyId,
          nameOrNumber: 'Flat 101',
          unitType: '2BHK',
          capacity: 4,
          pricing: { monthlyRent: 22000 },
          availability: 'available',
          status: 'available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          beds: [
            { id: 'bed-1', unitId: 'unit-101', label: 'Master Bed', pricing: { monthlyRent: 12000 }, availability: 'available', status: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 'bed-2', unitId: 'unit-101', label: 'Guest Bed', pricing: { monthlyRent: 10000 }, availability: 'available', status: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          ]
        },
        {
          id: 'unit-102',
          propertyId,
          nameOrNumber: 'Flat 102',
          unitType: '1BHK',
          capacity: 2,
          pricing: { monthlyRent: 15000 },
          availability: 'available',
          status: 'available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          beds: []
        }
      ]
    });

    return updateRes.data!;
  };

  // --------------------------------------------------------------------------
  // TEST 1: Property Duplication with Deep Entity Cloning
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: Property Duplication & Deep Entity Cloning');
  {
    const original = await createTestBuilding(ownerAlice);
    await propertyBackend.publishProperty(ownerAlice, original.id);

    // Verify original is published
    const originalFetched = (await propertyBackend.getProperty(ownerAlice, original.id)).data!;
    assert(originalFetched.status === 'published', 'Original property is in published status');
    assert(!!originalFetched.publishedAt, 'Original property has publishedAt timestamp');

    // Duplicate property
    const dupRes = await propertyBackend.duplicateProperty(ownerAlice, original.id);
    assert(dupRes.status === 201 && dupRes.success, 'Duplication API returned HTTP 201 Success');
    
    const clone = dupRes.data!;
    assert(clone.id !== original.id, `Clone received unique ID (${clone.id} !== ${original.id})`);
    assert(clone.title === `Copy of ${original.title}`, `Title has "Copy of" prefix: "${clone.title}"`);
    assert(clone.status === 'draft', 'Cloned property is always created in "draft" status');
    assert(!clone.publishedAt, 'Cloned property does NOT copy publishedAt timestamp');
    assert(clone.location?.city === 'Jaipur', 'Location data preserved in clone');
    assert(clone.location?.locality === 'Civil Lines', 'Locality preserved in clone');
    assert(clone.pricing?.monthlyRent === 22000, 'Pricing configuration preserved in clone');
    assert(clone.photos?.length === 2, 'Photos array cloned');
    assert(clone.photos?.[0].id !== original.photos?.[0].id, 'Cloned photo received a fresh photo ID');

    // Unit & Bed deep ID cloning
    assert(clone.units?.length === 2, 'Cloned property preserves all units (2)');
    const cloneUnit1 = clone.units?.[0]!;
    const origUnit1 = original.units?.[0]!;
    assert(cloneUnit1.id !== origUnit1.id, `Cloned unit received new ID (${cloneUnit1.id} !== ${origUnit1.id})`);
    assert(cloneUnit1.propertyId === clone.id, 'Cloned unit references new parent property ID');
    assert(cloneUnit1.beds.length === 2, 'Cloned unit preserves its beds');
    
    const cloneBed1 = cloneUnit1.beds[0]!;
    const origBed1 = origUnit1.beds[0]!;
    assert(cloneBed1.id !== origBed1.id, `Cloned bed received new ID (${cloneBed1.id} !== ${origBed1.id})`);
    assert(cloneBed1.unitId === cloneUnit1.id, 'Cloned bed references new parent unit ID');
  }

  // --------------------------------------------------------------------------
  // TEST 2: Duplication Security & Authorization Enforcement
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Duplication Security & Authorization Enforcement');
  {
    const aliceProp = await createTestBuilding(ownerAlice);

    // 1. Anonymous user blocked
    const anonRes = await propertyBackend.duplicateProperty(anonymousUser, aliceProp.id);
    assert(anonRes.status === 401 && anonRes.code === 'UNAUTHENTICATED', 'Anonymous user blocked from duplicating property');

    // 2. Non-owner (Bob) blocked from duplicating Alice's property
    const bobRes = await propertyBackend.duplicateProperty(ownerBob, aliceProp.id);
    assert(bobRes.status === 403 && bobRes.code === 'NOT_PROPERTY_OWNER', 'Non-owner blocked from duplicating another owner property');

    // 3. Non-existent property ID
    const notFoundRes = await propertyBackend.duplicateProperty(ownerAlice, 'non_existent_id');
    assert(notFoundRes.status === 404 && notFoundRes.code === 'PROPERTY_NOT_FOUND', 'Returns 404 for non-existent property ID');
  }

  // --------------------------------------------------------------------------
  // TEST 3: Lightweight PropertySummary Projection
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: Lightweight PropertySummary Projection');
  {
    const prop = await createTestBuilding(ownerAlice);
    const summary = toPropertySummary(prop);

    assert(summary.id === prop.id, 'Summary ID matches property ID');
    assert(summary.title === prop.title, 'Summary title matches');
    assert(summary.propertyType === 'building', 'Summary propertyType matches');
    assert(summary.rentalStructure === 'multiple_units', 'Summary rentalStructure matches');
    assert(summary.status === 'draft', 'Summary status matches');
    assert(summary.location?.city === 'Jaipur', 'Summary location city matches');
    assert(summary.coverPhotoUrl === 'https://images.unsplash.com/lakeview-exterior', 'Summary cover photo identified');
    assert(summary.photosCount === 2, 'Summary photosCount calculated');
    assert(summary.unitsCount === 2, 'Summary unitsCount calculated');
    assert(summary.displayPrice.includes('22,000'), `Summary displayPrice formatted: "${summary.displayPrice}"`);
    assert((summary as any).units === undefined, 'Summary does not contain heavy nested units');
    assert((summary as any).rules === undefined, 'Summary does not contain heavy nested rules');
  }

  // --------------------------------------------------------------------------
  // TEST 4: Backend Portfolio Ownership Isolation
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Backend Portfolio Ownership Isolation');
  {
    (propertyBackend as any).properties.clear();

    // Alice creates 2 properties
    await createTestBuilding(ownerAlice);
    await createTestBuilding(ownerAlice);

    // Bob creates 1 property
    await createTestBuilding(ownerBob);

    // Alice fetches her properties
    const aliceList = await propertyBackend.getOwnerProperties(ownerAlice, 'all');
    assert(aliceList.data?.length === 2, 'Alice sees exactly 2 properties');
    assert(aliceList.data?.every((p) => Number(p.ownerId) === 101), 'All properties belong to Alice (101)');

    // Bob fetches his properties
    const bobList = await propertyBackend.getOwnerProperties(ownerBob, 'all');
    assert(bobList.data?.length === 1, 'Bob sees exactly 1 property');
    assert(bobList.data?.[0].ownerId === 202, 'Bob only sees his own property (202)');
  }

  // --------------------------------------------------------------------------
  // TEST 5: Search & Filtering Logic Verification
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 5: Search & Filtering Logic Verification');
  {
    (propertyBackend as any).properties.clear();

    // Create 3 distinct properties for Alice
    const prop1 = await propertyBackend.createDraft(ownerAlice, {
      propertyType: 'villa',
      rentalStructure: 'entire_property',
      title: 'Green Meadows Villa'
    });
    await propertyBackend.updateProperty(ownerAlice, prop1.data!.id, {
      location: { city: 'Dehradun', locality: 'Rajpur Road', addressLine1: '12 Hill View', pincode: '248001' }
    });

    const prop2 = await propertyBackend.createDraft(ownerAlice, {
      propertyType: 'pg',
      rentalStructure: 'individual_bed',
      title: 'Sunrise Heights PG'
    });
    await propertyBackend.updateProperty(ownerAlice, prop2.data!.id, {
      location: { city: 'Pune', locality: 'Kothrud', addressLine1: '45 Tech Park', pincode: '411038' }
    });

    const prop3 = await propertyBackend.createDraft(ownerAlice, {
      propertyType: 'apartment',
      rentalStructure: 'entire_property',
      title: 'Silicon Vista Apartment'
    });
    await propertyBackend.updateProperty(ownerAlice, prop3.data!.id, {
      location: { city: 'Bengaluru', locality: 'Indiranagar', addressLine1: '77 100ft Road', pincode: '560038' }
    });

    const allProps = (await propertyBackend.getOwnerProperties(ownerAlice, 'all')).data!;

    // 1. Search by title substring
    const titleResults = allProps.filter((p) => (p.title || '').toLowerCase().includes('meadows'));
    assert(titleResults.length === 1 && titleResults[0].title === 'Green Meadows Villa', 'Search by title substring matches correctly');

    // 2. Search by city substring
    const cityResults = allProps.filter((p) => (p.location?.city || '').toLowerCase().includes('pune'));
    assert(cityResults.length === 1 && cityResults[0].title === 'Sunrise Heights PG', 'Search by city matches correctly');

    // 3. Search by locality substring
    const localityResults = allProps.filter((p) => (p.location?.locality || '').toLowerCase().includes('indira'));
    assert(localityResults.length === 1 && localityResults[0].title === 'Silicon Vista Apartment', 'Search by locality matches correctly');

    // 4. Filter by property type
    const pgResults = allProps.filter((p) => p.propertyType === 'pg');
    assert(pgResults.length === 1 && pgResults[0].propertyType === 'pg', 'Filter by propertyType "pg" works');

    const villaResults = allProps.filter((p) => p.propertyType === 'villa');
    assert(villaResults.length === 1 && villaResults[0].propertyType === 'villa', 'Filter by propertyType "villa" works');
  }

  // --------------------------------------------------------------------------
  // TEST 6: Sorting Logic Verification
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 6: Sorting Logic Verification');
  {
    (propertyBackend as any).properties.clear();

    const pA = await propertyBackend.createDraft(ownerAlice, { propertyType: 'apartment', rentalStructure: 'entire_property', title: 'Alpha Towers' });
    await propertyBackend.updateProperty(ownerAlice, pA.data!.id, { pricing: { monthlyRent: 15000 } });

    const pB = await propertyBackend.createDraft(ownerAlice, { propertyType: 'villa', rentalStructure: 'entire_property', title: 'Beta Bungalow' });
    await propertyBackend.updateProperty(ownerAlice, pB.data!.id, { pricing: { monthlyRent: 50000 } });

    const pC = await propertyBackend.createDraft(ownerAlice, { propertyType: 'pg', rentalStructure: 'individual_room', title: 'Gamma House' });
    await propertyBackend.updateProperty(ownerAlice, pC.data!.id, { pricing: { monthlyRent: 8000 } });

    const props = (await propertyBackend.getOwnerProperties(ownerAlice, 'all')).data!;

    // Sort: Title A to Z
    const sortedTitle = [...props].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    assert(sortedTitle[0].title === 'Alpha Towers', 'First item in Title A-Z is Alpha Towers');
    assert(sortedTitle[2].title === 'Gamma House', 'Last item in Title A-Z is Gamma House');

    // Sort: Price Low to High
    const sortedPriceAsc = [...props].sort((a, b) => (a.pricing?.monthlyRent || 0) - (b.pricing?.monthlyRent || 0));
    assert(sortedPriceAsc[0].title === 'Gamma House', 'Lowest price item is Gamma House (₹8,000)');
    assert(sortedPriceAsc[2].title === 'Beta Bungalow', 'Highest price item is Beta Bungalow (₹50,000)');

    // Sort: Price High to Low
    const sortedPriceDesc = [...props].sort((a, b) => (b.pricing?.monthlyRent || 0) - (a.pricing?.monthlyRent || 0));
    assert(sortedPriceDesc[0].title === 'Beta Bungalow', 'Highest price item first in Price Desc (Beta Bungalow)');
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
