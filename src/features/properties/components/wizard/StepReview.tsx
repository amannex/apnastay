'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  Camera,
  Eye,
  ListChecks
} from 'lucide-react';
import type { Property } from '../../types';
import {
  evaluateListingCompleteness,
  ListingCompletenessResult
} from '../../completeness';
import PropertyTenantPreview from '../preview/PropertyTenantPreview';
import { formatCurrency, getPropertyAvailabilityLabel, formatPricingDisplay } from '../../pricing';

export interface StepReviewProps {
  property: Property;
  onBack: () => void;
  onEditSection: (stepNumber: number) => void;
  onSaveDraft?: () => Promise<void> | void;
  onPublish?: () => Promise<void> | void;
  isSaving?: boolean;
  isPublishing?: boolean;
}

export default function StepReview({
  property,
  onEditSection
}: StepReviewProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'preview'>('overview');

  const evaluation: ListingCompletenessResult = useMemo(
    () => evaluateListingCompleteness(property),
    [property]
  );

  // Cover photo resolution
  const photos = property.photos || [];
  const coverPhoto = photos.find((p) => p.isCover) || photos[0];

  // Helper summaries for the 11 steps
  const getSectionData = () => {
    // 1. Property Type
    const formatValue = property.customPropertyType || property.propertyType
      ? (property.customPropertyType || property.propertyType.replace(/_/g, ' '))
      : 'Not selected';

    // 2. Rental Structure
    const structureValue = property.rentalStructure
      ? property.rentalStructure.replace(/_/g, ' ')
      : 'Not selected';

    // 3. Location
    const loc = property.location;
    const addressParts = [
      loc?.addressLine1 || loc?.address,
      loc?.locality,
      loc?.city,
      loc?.pincode
    ].filter(Boolean);
    const locationValue = addressParts.length > 0 ? addressParts.join(', ') : 'Address not specified';

    // 4. Floor plan & capacity
    const guests = property.guests ?? 1;
    const bedrooms = property.bedrooms ?? 1;
    const beds = property.beds ?? 1;
    const bathrooms = property.bathrooms ?? 1;
    const capacityValue = `${guests} guest${guests !== 1 ? 's' : ''} • ${bedrooms} bedroom${bedrooms !== 1 ? 's' : ''} • ${beds} bed${beds !== 1 ? 's' : ''} • ${bathrooms} bath${bathrooms !== 1 ? 's' : ''}`;

    // 5. Amenities
    const amenitiesTotal = (property.amenities?.length || 0) + (property.customAmenities?.length || 0);
    const amenitiesValue = amenitiesTotal > 0
      ? `${amenitiesTotal} amenit${amenitiesTotal !== 1 ? 'ies' : 'y'} selected`
      : 'No amenities selected';

    // 6. Photos
    const photosCount = photos.length;
    const photosValue = photosCount > 0
      ? `${photosCount} photo${photosCount !== 1 ? 's' : ''} uploaded`
      : 'No photos uploaded';

    // 7. Who can stay
    const suitableFor = property.rules?.suitableFor || [];
    const whoCanStayValue = suitableFor.length > 0
      ? suitableFor.map((s) => s.replace(/_/g, ' ')).join(', ')
      : 'All welcome (standard)';

    // 8. Rules & terms
    const rulesList: string[] = [];
    if (property.rules?.smokingRule) rulesList.push(`Smoking: ${property.rules.smokingRule.replace(/_/g, ' ')}`);
    if (property.rules?.alcoholRule) rulesList.push(`Alcohol: ${property.rules.alcoholRule.replace(/_/g, ' ')}`);
    if (property.rules?.visitorsRule) rulesList.push(`Visitors: ${property.rules.visitorsRule.replace(/_/g, ' ')}`);
    const rulesValue = rulesList.length > 0 ? rulesList.join(' • ') : 'Standard house terms';

    // 9. Rent & charges
    let pricingValue = 'Rent not set';
    if (property.pricing?.pricingMode === 'on_request') {
      pricingValue = 'Price on request';
    } else if (property.pricing?.monthlyRent) {
      pricingValue = `${formatCurrency(property.pricing.monthlyRent)} / month`;
    }

    // 10. Availability
    const availabilityValue = getPropertyAvailabilityLabel(property.availability);

    // 11. Title & description
    const titleValue = property.title || 'Untitled listing';
    const descriptionValue = property.description || 'No description added yet';

    return [
      {
        step: 1,
        title: 'Property format & type',
        value: formatValue,
        isMissing: !property.propertyType
      },
      {
        step: 2,
        title: 'Rental model & structure',
        value: structureValue,
        isMissing: !property.rentalStructure
      },
      {
        step: 3,
        title: 'Location & address',
        value: locationValue,
        isMissing: !loc?.city || !(loc?.addressLine1 || loc?.address)
      },
      {
        step: 4,
        title: 'Floor plan & capacity',
        value: capacityValue,
        isMissing: false
      },
      {
        step: 5,
        title: 'Amenities & features',
        value: amenitiesValue,
        isMissing: amenitiesTotal === 0
      },
      {
        step: 6,
        title: 'Photos & media',
        value: photosValue,
        isMissing: photosCount === 0
      },
      {
        step: 7,
        title: 'Who can stay',
        value: whoCanStayValue,
        isMissing: false
      },
      {
        step: 8,
        title: 'Rules & stay terms',
        value: rulesValue,
        isMissing: false
      },
      {
        step: 9,
        title: 'Rent & charges',
        value: pricingValue,
        isMissing: !property.pricing?.monthlyRent && property.pricing?.pricingMode !== 'on_request'
      },
      {
        step: 10,
        title: 'Move-in availability',
        value: availabilityValue,
        isMissing: !property.availability?.type
      },
      {
        step: 11,
        title: 'Title & description',
        value: titleValue,
        secondaryValue: descriptionValue,
        isMissing: !property.title || property.title.trim().length < 3 || !property.description || property.description.trim().length < 10
      }
    ];
  };

  const sections = getSectionData();

  return (
    <div className="w-full max-w-2xl mx-auto py-2 space-y-8 animate-fade-in font-inter text-[#222222]">
      {/* HEADER WITH SEGMENTED TOGGLE (Minimalist Airbnb style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <h1 className="font-outfit text-2xl sm:text-[30px] font-semibold text-[#222222] tracking-tight">
            Review your listing
          </h1>
          <p className="text-sm sm:text-base text-[#717171] leading-normal">
            Here&apos;s what we&apos;ll show to guests and tenants. Make sure everything looks right before publishing.
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center p-1 rounded-full bg-[#F7F7F7] border border-[#EBEBEB] self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('overview')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
              viewMode === 'overview'
                ? 'bg-white text-[#222222] font-semibold shadow-apple-sm'
                : 'text-[#717171] hover:text-[#222222]'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
              viewMode === 'preview'
                ? 'bg-white text-[#222222] font-semibold shadow-apple-sm'
                : 'text-[#717171] hover:text-[#222222]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Tenant preview</span>
          </button>
        </div>
      </div>

      {/* 1. TENANT PREVIEW MODE */}
      {viewMode === 'preview' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] flex items-center justify-between text-xs text-[#717171]">
            <span>This is an accurate simulation of your public listing page.</span>
            <button
              type="button"
              onClick={() => setViewMode('overview')}
              className="text-[#222222] font-semibold underline hover:text-black"
            >
              Return to checklist
            </button>
          </div>
          <PropertyTenantPreview property={property} />
        </div>
      )}

      {/* 2. OVERVIEW CHECKLIST MODE (UNBOXED AIRBNB LAYOUT) */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* HERO SUMMARY (UNBOXED FLOW) */}
          <div className="pb-6 border-b border-[#EBEBEB] flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            {/* Cover photo thumbnail */}
            <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-[#F7F7F7] border border-[#EBEBEB] shrink-0 flex items-center justify-center">
              {coverPhoto?.url ? (
                <img
                  src={coverPhoto.url}
                  alt={property.title || 'Property cover'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#717171] gap-1 text-xs">
                  <Camera className="w-4 h-4 stroke-[1.5]" />
                  <span>No photo</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap text-xs text-[#717171]">
                <span className="uppercase tracking-wider font-semibold">
                  {property.customPropertyType || property.propertyType?.replace(/_/g, ' ') || 'Property'} • {property.rentalStructure?.replace(/_/g, ' ') || 'Entire space'}
                </span>
                <span>•</span>
                <span>
                  {getPropertyAvailabilityLabel(property.availability)}
                </span>
              </div>

              <h2 className="font-outfit text-base sm:text-lg font-semibold text-[#222222] truncate">
                {property.title || 'Untitled Property'}
              </h2>

              <p className="text-xs sm:text-sm text-[#717171] truncate">
                {[property.location?.locality, property.location?.city].filter(Boolean).join(', ') || 'No location set'}
              </p>

              <div>
                <span className="font-semibold text-sm text-[#222222]">
                  {formatPricingDisplay(property.pricing, property.pricing?.monthlyRent || 0)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onEditSection(11)}
              className="text-xs sm:text-sm font-semibold text-[#222222] underline underline-offset-4 hover:text-black self-end sm:self-center shrink-0 cursor-pointer"
            >
              Edit title
            </button>
          </div>

          {/* ACTION REQUIRED NOTICE (UNBOXED, MINIMALIST) */}
          {!evaluation.isPublishable && evaluation.missingRequired.length > 0 && (
            <div className="py-2 text-xs sm:text-sm text-[#222222] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[#222222]">
                <AlertCircle className="w-4 h-4 text-[#717171] shrink-0" />
                <span>Complete the following items before publishing:</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {evaluation.missingRequired.map((req) => (
                  <button
                    key={req.id}
                    type="button"
                    onClick={() => onEditSection(req.stepNumber)}
                    className="px-3 py-1 rounded-full bg-[#F7F7F7] border border-[#EBEBEB] text-xs text-[#222222] font-medium hover:border-[#717171] transition-colors cursor-pointer"
                  >
                    {req.label} &rarr;
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DIVIDED SECTIONS (COMPLETELY UNBOXED, OPEN LIST WITH DIVIDERS) */}
          <div className="divide-y divide-[#EBEBEB]">
            {sections.map((sec) => (
              <div
                key={sec.step}
                className="py-4 sm:py-4.5 flex items-start justify-between gap-4 transition-colors"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#717171] font-mono">
                      {String(sec.step).padStart(2, '0')}
                    </span>
                    <h3 className="font-outfit text-sm sm:text-base font-semibold text-[#222222]">
                      {sec.title}
                    </h3>
                    {sec.isMissing && (
                      <span className="text-[11px] font-medium text-[#717171] bg-[#F7F7F7] px-2 py-0.5 rounded-full border border-[#EBEBEB]">
                        Required
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#717171] truncate max-w-xl">
                    {sec.value}
                  </p>

                  {sec.secondaryValue && (
                    <p className="text-xs text-[#717171]/80 truncate max-w-xl line-clamp-1">
                      {sec.secondaryValue}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onEditSection(sec.step)}
                  className="text-xs sm:text-sm font-semibold text-[#222222] underline underline-offset-4 hover:text-black shrink-0 pt-0.5 cursor-pointer"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
