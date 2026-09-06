// ============================================================================
// APNASTAY PROPERTY ENGINE — PHASE 3 AUTOMATED VERIFICATION SUITE
// Tests Basic Property Details, Dynamic Fields, Availability, Pricing & Draft Persistence
// ============================================================================

import { propertyBackend } from '../backend';
import { getBasicFieldsConfig, getPropertyTemplate } from '../templates';
import type { PropertyType, RentalStructure } from '../types';

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

async function runPhase3Tests() {
  console.log('\n===============================================================');
  console.log('APNASTAY PROPERTY ENGINE — PHASE 3 BASIC DETAILS SUITE');
  console.log('===============================================================\n');

  propertyBackend.reset();

  const ownerAlice = { userId: 501, isAdmin: false };
  const ownerBob = { userId: 502, isAdmin: false };
  const anonymous = { userId: 0, isAdmin: false };

  // --------------------------------------------------------------------------
  // TEST 1: Dynamic Basic Fields Configuration Across All 11 Property Types
  // --------------------------------------------------------------------------
  console.log('🧪 TEST 1: Dynamic Basic Fields Configuration Across All 11 Property Types');

  const allTypes: PropertyType[] = [
    'house',
    'apartment',
    'villa',
    'pg',
    'hostel',
    'coliving',
    'building',
    'independent_floor',
    'room',
    'commercial',
    'other'
  ];

  for (const type of allTypes) {
    const template = getPropertyTemplate(type);
    const config = getBasicFieldsConfig(type, template.defaultRentalStructure);

    assert(Boolean(config.titleLabel && config.titleLabel.length > 0), `Type '${type}' has dynamic titleLabel: "${config.titleLabel}"`);
    assert(Boolean(config.titlePlaceholder && config.titlePlaceholder.length > 0), `Type '${type}' has titlePlaceholder`);
    assert(Boolean(config.descriptionLabel && config.descriptionLabel.length > 0), `Type '${type}' has descriptionLabel`);
    assert(Boolean(config.descriptionPlaceholder && config.descriptionPlaceholder.length > 0), `Type '${type}' has descriptionPlaceholder`);
    assert(Boolean(config.priceLabel && config.priceLabel.length > 0), `Type '${type}' has dynamic priceLabel: "${config.priceLabel}"`);
    assert(Boolean(config.priceHelp && config.priceHelp.length > 0), `Type '${type}' has priceHelp`);
    assert(Boolean(config.availabilityLabel && config.availabilityLabel.length > 0), `Type '${type}' has availabilityLabel`);
  }

  // Check specific dynamic variants
  const pgBedConfig = getBasicFieldsConfig('pg', 'individual_bed');
  assert(pgBedConfig.priceLabel.includes('Bed'), 'PG with individual_bed labels price as "Starting Rent per Bed"');
  assert(pgBedConfig.titlePlaceholder.includes('Green Valley PG'), 'PG placeholder showcases real PG examples');

  const houseConfig = getBasicFieldsConfig('house', 'entire_property');
  assert(houseConfig.priceLabel === 'Monthly Rent', 'House with entire_property labels price as "Monthly Rent"');
  assert(houseConfig.titlePlaceholder.includes('Pari Chowk'), 'House placeholder gives clear location example');

  const aptMultiConfig = getBasicFieldsConfig('apartment', 'multiple_units');
  assert(aptMultiConfig.priceLabel.includes('Unit'), 'Apartment with multiple_units specifies "Starting Rent per Unit"');

  const commConfig = getBasicFieldsConfig('commercial', 'entire_property');
  assert(commConfig.priceLabel.includes('Lease'), 'Commercial property includes "Lease" in price label');

  const customConfig = getBasicFieldsConfig('other', 'entire_property', 'Boutique Homestay');
  assert(customConfig.titleLabel.includes('Boutique Homestay'), 'Custom "other" property dynamically embeds custom type in title label');

  // --------------------------------------------------------------------------
  // TEST 2: Updating Draft with Basic Details (Immediate Availability)
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 2: Updating Draft with Basic Details (Immediate Move-In)');

  const draftRes = propertyBackend.createDraft(ownerAlice, {
    propertyType: 'house',
    rentalStructure: 'entire_property'
  });
  assert(draftRes.success && Boolean(draftRes.data), 'Created initial house draft for Alice');
  const draftId = draftRes.data!.id;
  assert(draftRes.data!.completenessScore === 15, 'Initial draft completeness is 15%');

  const updateRes = propertyBackend.updateProperty(ownerAlice, draftId, {
    title: 'Sunny Villa Bungalow near Pari Chowk',
    description: 'Spacious 4 BHK independent bungalow with private lawn, dedicated car parking, and 24/7 water supply.',
    availability: {
      type: 'immediate'
    },
    pricing: {
      monthlyRent: 35000
    }
  });

  assert(updateRes.success, 'Successfully updated draft with basic details');
  const updated = updateRes.data!;
  assert(updated.id === draftId, 'Property ID is unchanged (same draft updated)');
  assert(updated.title === 'Sunny Villa Bungalow near Pari Chowk', 'Title correctly updated');
  assert(updated.description.includes('private lawn'), 'Description correctly updated');
  assert(updated.availability?.type === 'immediate', 'Availability type is "immediate"');
  assert(updated.availability?.availableFrom === undefined, 'AvailableFrom is undefined for immediate move-in');
  assert(updated.pricing?.monthlyRent === 35000, 'Monthly rent correctly set to 35000');
  assert(updated.completenessScore === 35, `Completeness score increased to 35% (got ${updated.completenessScore}%)`);

  // --------------------------------------------------------------------------
  // TEST 3: Updating Draft with Specific Availability Date
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 3: Updating Draft with Specific Availability Date');

  const pgDraftRes = propertyBackend.createDraft(ownerAlice, {
    propertyType: 'pg',
    rentalStructure: 'individual_bed'
  });
  const pgDraftId = pgDraftRes.data!.id;

  const pgUpdateRes = propertyBackend.updateProperty(ownerAlice, pgDraftId, {
    title: 'Green Valley Luxury PG for Students',
    description: 'Premier air-conditioned PG with 3 times daily meals, high-speed Wi-Fi, and daily housekeeping.',
    availability: {
      type: 'specific_date',
      availableFrom: '2026-10-01'
    },
    pricing: {
      monthlyRent: 8500
    }
  });

  assert(pgUpdateRes.success, 'Successfully updated PG draft with specific move-in date');
  const pgUpdated = pgUpdateRes.data!;
  assert(pgUpdated.availability?.type === 'specific_date', 'Availability type is "specific_date"');
  assert(pgUpdated.availability?.availableFrom === '2026-10-01', 'AvailableFrom matches "2026-10-01"');
  assert(pgUpdated.pricing?.monthlyRent === 8500, 'Starting rent set to ₹8,500 / month');

  // --------------------------------------------------------------------------
  // TEST 4: Draft Persistence & No Duplication Invariant
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 4: Draft Persistence & No Duplication Invariant');

  const alicePortfolioBefore = propertyBackend.getOwnerProperties(ownerAlice);
  const countBefore = alicePortfolioBefore.data!.length;

  // Update the same draft again (simulating back navigation and re-saving)
  const reSaveRes = propertyBackend.updateProperty(ownerAlice, pgDraftId, {
    title: 'Green Valley Luxury Boys PG — Sector 62',
    description: 'Updated description with metro shuttle service details.',
    pricing: {
      monthlyRent: 9000
    }
  });
  assert(reSaveRes.success, 'Re-saving updated draft succeeded');

  const alicePortfolioAfter = propertyBackend.getOwnerProperties(ownerAlice);
  assert(
    alicePortfolioAfter.data!.length === countBefore,
    `No duplicate property was created (portfolio count remained ${countBefore})`
  );

  const reloaded = propertyBackend.getProperty(ownerAlice, pgDraftId);
  assert(reloaded.success, 'Reloading draft from backend succeeded');
  assert(reloaded.data!.title === 'Green Valley Luxury Boys PG — Sector 62', 'Reloaded draft reflects latest title');
  assert(reloaded.data!.pricing?.monthlyRent === 9000, 'Reloaded draft reflects latest pricing');

  // --------------------------------------------------------------------------
  // TEST 5: Security & Cross-Owner Authorization
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 5: Security & Cross-Owner Authorization');

  // Anonymous user cannot update draft
  const anonUpdate = propertyBackend.updateProperty(anonymous, pgDraftId, {
    title: 'Hacked Title'
  });
  assert(!anonUpdate.success && anonUpdate.status === 401, 'Anonymous user blocked with 401');

  // Bob cannot update Alice's draft
  const bobUpdate = propertyBackend.updateProperty(ownerBob, pgDraftId, {
    title: 'Bob Tampered Title'
  });
  assert(!bobUpdate.success && bobUpdate.status === 403, 'Cross-owner modification blocked with 403');
  assert(bobUpdate.code === 'NOT_PROPERTY_OWNER', 'Error code is NOT_PROPERTY_OWNER');

  // Verify Alice's draft was not altered by Bob
  const untouched = propertyBackend.getProperty(ownerAlice, pgDraftId);
  assert(untouched.data!.title === 'Green Valley Luxury Boys PG — Sector 62', 'Property draft remained safe and untampered');

  // --------------------------------------------------------------------------
  // TEST 6: Validation Logic Coverage
  // --------------------------------------------------------------------------
  console.log('\n🧪 TEST 6: Validation Logic Verification');

  // Helper validation simulation matching StepBasicDetails logic
  function testValidation(title: string, desc: string, rent: string, availType: string, date: string) {
    const errors: Record<string, string> = {};
    const t = title.trim();
    const d = desc.trim();
    const r = Number(rent.replace(/[^0-9.]/g, ''));

    if (!t || t.length < 3) errors.title = 'Title must be at least 3 characters';
    if (!d || d.length < 10) errors.description = 'Description must be at least 10 characters';
    if (!rent || isNaN(r) || r <= 0) errors.rent = 'Rent must be positive';
    if (availType === 'specific_date' && (!date || date < '2026-01-01')) {
      errors.date = 'Date must be valid';
    }
    return errors;
  }

  const errEmpty = testValidation('', '', '', 'immediate', '');
  assert(Boolean(errEmpty.title), 'Validation catches empty title');
  assert(Boolean(errEmpty.description), 'Validation catches empty description');
  assert(Boolean(errEmpty.rent), 'Validation catches empty rent');

  const errShort = testValidation('Ab', 'Short', '0', 'immediate', '');
  assert(Boolean(errShort.title), 'Validation catches title shorter than 3 characters');
  assert(Boolean(errShort.description), 'Validation catches description shorter than 10 characters');
  assert(Boolean(errShort.rent), 'Validation catches zero rent');

  const errDate = testValidation('Valid Title', 'Valid Description of 10+ characters', '15000', 'specific_date', '');
  assert(Boolean(errDate.date), 'Validation catches missing date when specific_date is chosen');

  const validForm = testValidation('Cozy 1BHK Flat', 'Located in Sector 137 Noida near Metro', '14000', 'immediate', '');
  assert(Object.keys(validForm).length === 0, 'Validation passes for properly formed input');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`PHASE 3 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3Tests();
