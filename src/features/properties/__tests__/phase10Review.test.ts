// ============================================================================
// APNASTAY PROPERTY ENGINE — PHASE 10 REVIEW & COMPLETENESS TEST SUITE
// Tests 10-section listing completeness auditing, required vs recommended checks,
// completeness score calculation, strict publication gating, draft preservation,
// section navigation step mapping, and owner authorization.
// ============================================================================

import { propertyBackend, BackendRequestContext } from '../backend';
import {
  evaluateListingCompleteness,
  getSectionStepNumber,
  getSectionTitle,
  CompletenessSectionKey
} from '../completeness';
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

async function runPhase10Tests() {
  console.log('\n===============================================================');
  console.log('APNASTAY PROPERTY ENGINE — PHASE 10 REVIEW & COMPLETENESS SUITE');
  console.log('===============================================================\n');

  const ownerAlice: BackendRequestContext = { userId: 101, isAdmin: false };
  const ownerBob: BackendRequestContext = { userId: 202, isAdmin: false };
  const anonymousUser: BackendRequestContext = { userId: 0, isAdmin: false };

  // Reset store
  (propertyBackend as any).properties.clear();

  // --------------------------------------------------------------------------
  // TEST 1: Section Metadata and Step Navigation Mapping
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: Section Metadata & Step Navigation Mapping');
  {
    const sections: CompletenessSectionKey[] = [
      'property_type',
      'rental_structure',
      'basic_details',
      'location',
      'photos',
      'amenities',
      'units',
      'pricing',
      'availability',
      'rules'
    ];

    assert(sections.length === 10, 'Exactly 10 review sections configured');
    assert(getSectionStepNumber('property_type') === 1, 'property_type navigates to Step 1');
    assert(getSectionStepNumber('rental_structure') === 2, 'rental_structure navigates to Step 2');
    assert(getSectionStepNumber('basic_details') === 3, 'basic_details navigates to Step 3');
    assert(getSectionStepNumber('location') === 4, 'location navigates to Step 4');
    assert(getSectionStepNumber('photos') === 5, 'photos navigates to Step 5');
    assert(getSectionStepNumber('amenities') === 6, 'amenities navigates to Step 6');
    assert(getSectionStepNumber('units') === 7, 'units navigates to Step 7');
    assert(getSectionStepNumber('pricing') === 8, 'pricing navigates to Step 8');
    assert(getSectionStepNumber('availability') === 8, 'availability navigates to Step 8');
    assert(getSectionStepNumber('rules') === 9, 'rules navigates to Step 9');

    sections.forEach((sec) => {
      const title = getSectionTitle(sec);
      assert(title && title.length > 3, `Section ${sec} has title: "${title}"`);
    });
  }

  // --------------------------------------------------------------------------
  // TEST 2: Completeness Evaluation for a Bare Minimal Draft
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Bare Minimal Draft Audit');
  {
    const bareDraft: Property = {
      id: 'prop-bare-1',
      ownerId: 101,
      propertyType: 'apartment',
      rentalStructure: 'entire_property',
      title: 'New', // Too short (min 5 chars)
      description: '',
      status: 'draft',
      pricing: { monthlyRent: 0 },
      completenessScore: 15,
      units: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const audit = evaluateListingCompleteness(bareDraft);

    assert(!audit.isPublishable, 'Bare draft is not publishable');
    assert(audit.score < 40, `Bare draft score is low (${audit.score}%)`);
    assert(audit.missingRequired.length > 0, `Missing required items found (${audit.missingRequired.length})`);

    // Verify individual section statuses
    assert(audit.sections.photos.hasErrors, 'Photos section has errors (missing required)');
    assert(audit.sections.photos.missingRequiredCount > 0, 'Photos has missing required count');
    assert(audit.sections.location.hasErrors, 'Location section has errors');
    assert(audit.sections.pricing.hasErrors, 'Pricing section has errors');
    assert(audit.sections.property_type.isComplete, 'Property type is valid and complete');
  }

  // --------------------------------------------------------------------------
  // TEST 3: Units Requirement Invariant Across Rental Structures
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: Units Requirement Across Rental Structures');
  {
    // A whole apartment does NOT require child units
    const wholeApartment: Property = {
      id: 'prop-whole-apt',
      ownerId: 101,
      propertyType: 'apartment',
      rentalStructure: 'entire_property',
      title: 'Sunny 2BHK Apartment',
      description: 'Cozy flat',
      status: 'draft',
      completenessScore: 25,
      units: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const auditWhole = evaluateListingCompleteness(wholeApartment);
    const wholeUnitCheck = auditWhole.sections.units.items.find((c) => c.id === 'units_configured');
    assert(wholeUnitCheck?.severity === 'optional', 'Whole apartment treats units as optional');
    assert(auditWhole.sections.units.missingRequiredCount === 0, 'Whole apartment has 0 missing required units');

    // A multiple_units property DOES require units
    const multiUnitProp: Property = {
      id: 'prop-multi-apt',
      ownerId: 101,
      propertyType: 'apartment',
      rentalStructure: 'multiple_units',
      title: 'Green Valley Apartments',
      description: 'Multiple flats for rent',
      status: 'draft',
      completenessScore: 25,
      units: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const auditMulti = evaluateListingCompleteness(multiUnitProp);
    const multiUnitCheck = auditMulti.sections.units.items.find((c) => c.id === 'units_configured');
    assert(multiUnitCheck?.severity === 'required', 'multiple_units property treats units as required');
    assert(!multiUnitCheck?.isSatisfied, 'Missing units fails required check');
    assert(auditMulti.sections.units.missingRequiredCount > 0, 'multiple_units has missing required count');
  }

  // --------------------------------------------------------------------------
  // TEST 4: Progression from Required to Recommended Completeness
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Score Progression (Required vs Recommended)');
  {
    // Property with ONLY required fields satisfied
    const minimallySatisfiedProp: Property = {
      id: 'prop-min-satisfied',
      ownerId: 101,
      propertyType: 'house',
      rentalStructure: 'entire_property',
      title: 'Spacious Independent Villa',
      description: 'A nice house for rent.',
      location: {
        addressLine1: '123 Palm Avenue',
        city: 'Bengaluru',
        pincode: '560001'
      },
      photos: [
        { id: 'p1', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', isCover: false, order: 0 }
      ],
      pricing: { monthlyRent: 35000 },
      availability: { type: 'immediate' },
      status: 'draft',
      completenessScore: 50,
      units: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const auditMin = evaluateListingCompleteness(minimallySatisfiedProp);
    assert(auditMin.isPublishable, 'Listing with all required fields is publishable');
    assert(auditMin.missingRequired.length === 0, 'Zero missing required items');
    assert(auditMin.score >= 50 && auditMin.score < 90, `Score is moderate with only minimal required items (${auditMin.score}%)`);
    assert(auditMin.recommendedImprovements.length > 0, 'Has recommended improvements remaining');

    // Now enrich with recommended fields: 3+ photos, cover photo, 3+ amenities, 50+ char description, rules, deposit & maintenance, locality, landmark
    const fullyEnrichedProp: Property = {
      ...minimallySatisfiedProp,
      description: 'A beautiful luxury 3BHK independent villa in Indiranagar with modern modular kitchen, private terrace, and 24/7 water supply.',
      location: {
        addressLine1: '123 Palm Avenue',
        locality: 'Indiranagar',
        city: 'Bengaluru',
        landmark: 'Near Metro Station',
        pincode: '560001'
      },
      photos: [
        { id: 'p1', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', isCover: true, order: 0 },
        { id: 'p2', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', isCover: false, order: 1 },
        { id: 'p3', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9', isCover: false, order: 2 }
      ],
      amenities: ['wifi', 'power_backup', 'parking'],
      pricing: {
        monthlyRent: 35000,
        securityDepositConfig: { type: 'months', monthsCount: 2 },
        maintenanceChargesConfig: { type: 'included' },
        electricityChargesConfig: { type: 'fixed', amount: 1500 }
      },
      rules: {
        suitableFor: ['families', 'working_professionals'],
        guestPolicy: 'allowed',
        petPolicy: 'allowed',
        smokingPolicy: 'not_allowed',
        alcoholPolicy: 'allowed',
        timingType: 'open_24_7',
        requiresIdProof: true,
        requiresPoliceVerification: false,
        customRules: ['Keep common areas clean']
      }
    };

    const auditFull = evaluateListingCompleteness(fullyEnrichedProp);
    assert(auditFull.isPublishable, 'Fully enriched listing is publishable');
    assert(auditFull.score === 100, `Fully enriched listing scores 100% (${auditFull.score}%)`);
    assert(auditFull.recommendedImprovements.length === 0, 'Zero recommended improvements remaining');
  }

  // --------------------------------------------------------------------------
  // TEST 5: Backend Strict Publication Gating
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 5: Backend Strict Publication Gating');
  {
    // 1. Create incomplete draft
    const createRes = await propertyBackend.createDraft(ownerAlice, {
      propertyType: 'apartment',
      rentalStructure: 'entire_property',
      title: 'Incomplete Flat Draft'
    });
    assert(createRes.status === 201, 'Created incomplete draft in backend');
    const draftId = createRes.data!.id;

    // 2. Try publishing with strict: true -> MUST FAIL with 400 LISTING_INCOMPLETE
    const pubFailRes = await propertyBackend.publishProperty(ownerAlice, draftId, { strict: true });
    assert(!pubFailRes.success, 'Strict publish of incomplete draft was rejected');
    assert(pubFailRes.status === 400, 'Strict publish failed with HTTP 400');
    assert(pubFailRes.code === 'LISTING_INCOMPLETE', 'Strict publish returned code LISTING_INCOMPLETE');
    assert(Array.isArray((pubFailRes as any).details?.missingRequired), 'Error contains missingRequired array');
    assert((pubFailRes as any).details?.missingRequired.length > 0, 'Lists missing required fields');

    // 3. Draft should still be in draft status (untouched)
    const getRes = await propertyBackend.getProperty(ownerAlice, draftId);
    assert(getRes.data!.status === 'draft', 'Draft status remains draft after rejected publish');

    // 4. Update draft with all required fields
    await propertyBackend.updateProperty(ownerAlice, draftId, {
      title: 'Sunlit Executive 2BHK Apartment',
      description: 'Fully furnished apartment in prime location with all modern conveniences.',
      location: {
        addressLine1: 'Plot 42, Koramangala 4th Block',
        locality: 'Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560034'
      },
      photos: [
        { id: 'ph-1', url: 'https://images.unsplash.com/photo-1', isCover: true, order: 0 }
      ],
      availability: { type: 'immediate' }
    });

    await propertyBackend.updatePropertyPricing(ownerAlice, draftId, {
      monthlyRent: 28000
    });

    // 5. Strict publish should now SUCCEED
    const pubRes = await propertyBackend.publishProperty(ownerAlice, draftId, { strict: true });
    if (!pubRes.success) {
      console.error('pubRes failed with:', pubRes.error, (pubRes as any).details);
    }
    assert(pubRes.status === 200, 'Strict publish succeeded with HTTP 200');
    assert(pubRes.data!.status === 'published', 'Property status changed to published');
    assert(!!pubRes.data!.publishedAt, 'Property has publishedAt timestamp');
    assert(pubRes.data!.completenessScore > 50, `Published property has completenessScore (${pubRes.data!.completenessScore}%)`);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Non-Owner and Unauthenticated Security Checks
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 6: Non-Owner & Unauthenticated Security on Review/Publish');
  {
    // Create draft owned by Alice
    const res = await propertyBackend.createDraft(ownerAlice, {
      propertyType: 'villa',
      rentalStructure: 'entire_property',
      title: 'Alice Private Villa'
    });
    const propId = res.data!.id;

    // Unauthenticated user
    const anonRes = await propertyBackend.publishProperty(anonymousUser, propId, { strict: true });
    assert(!anonRes.success, 'Anonymous user rejected from publishing');
    assert(anonRes.status === 401, 'Anonymous user rejected with 401 UNAUTHENTICATED');

    // Bob trying to publish Alice's property
    const bobRes = await propertyBackend.publishProperty(ownerBob, propId, { strict: true });
    assert(!bobRes.success, 'Bob rejected from publishing Alice property');
    assert(bobRes.status === 403, 'Bob rejected with 403 NOT_PROPERTY_OWNER');
  }

  // --------------------------------------------------------------------------
  // TEST 7: Backward Compatibility of Baseline Publish
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 7: Backward Compatibility of Baseline Publish');
  {
    // When called without strict: true, baseline requirements (min title length) are enforced
    const draftRes = await propertyBackend.createDraft(ownerAlice, {
      propertyType: 'house',
      rentalStructure: 'entire_property',
      title: 'Valid House Title'
    });

    const baselinePubRes = await propertyBackend.publishProperty(ownerAlice, draftRes.data!.id);
    assert(baselinePubRes.status === 200, 'Baseline publish without strict succeeds for backwards compatibility');
    assert(baselinePubRes.data?.status === 'published', 'Baseline published status is published');
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`PHASE 10 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase10Tests().catch((err) => {
  console.error('Fatal error during Phase 10 tests:', err);
  process.exit(1);
});
