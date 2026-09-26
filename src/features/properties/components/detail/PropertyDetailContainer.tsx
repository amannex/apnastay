'use client';

import React from 'react';
import type { NormalizedProperty } from '../../adapter';

import PropertyBreadcrumb from './PropertyBreadcrumb';
import PropertyGallerySection from './PropertyGallerySection';
import PropertyHeroSection from './PropertyHeroSection';
import PropertyActionsSection from './PropertyActionsSection';
import MobileBottomBar from './MobileBottomBar';
import PropertySnapshotSection from './PropertySnapshotSection';
import PropertyDescriptionSection from './PropertyDescriptionSection';
import PropertyHighlightsSection from './PropertyHighlightsSection';
import PropertyAmenitiesSection from './PropertyAmenitiesSection';
import PropertyDetailsSection from './PropertyDetailsSection';
import PropertyLocationSection from './PropertyLocationSection';
import NearbyPlacesSection from './NearbyPlacesSection';
import HouseRulesSection from './HouseRulesSection';
import VerificationCard from './VerificationCard';
import OwnerCard from './OwnerCard';
import SimilarPropertiesSection from './SimilarPropertiesSection';

interface PropertyDetailContainerProps {
  property: NormalizedProperty;
}

export default function PropertyDetailContainer({ property }: PropertyDetailContainerProps) {
  return (
    <article className="min-h-screen bg-white pt-20 sm:pt-24 lg:pt-28 pb-32 sm:pb-36 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* BREADCRUMB & BACK NAVIGATION */}
        <PropertyBreadcrumb property={property} />

        {/* HERO & GALLERY: RESPONSIVE ORDERING */}
        {/* Desktop: Hero Information -> Gallery */}
        {/* Mobile: Gallery (first) -> Hero Information (second) */}
        <div className="flex flex-col">
          <div className="order-2 lg:order-1 pb-4">
            <PropertyHeroSection property={property} />
          </div>
          <div className="order-1 lg:order-2 pb-6">
            <PropertyGallerySection property={property} />
          </div>
        </div>

        {/* MAIN RESPONSIVE CONTENT LAYOUT */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-24 xl:gap-36 2xl:gap-44 pt-2">
          {/* LEFT: CORE PROPERTY DETAILS & CONTENT */}
          <div className="flex-1 min-w-0 max-w-full">
            {/* MOBILE ONLY ACTIONS SECTION (On mobile, actions sit directly below Hero for prompt scannability) */}
            <div className="block lg:hidden pb-6 border-b border-gray-100">
              <PropertyActionsSection property={property} />
            </div>

            {/* SCROLLABLE CONTENT SECTIONS DIVIDED BY CLEAN SEPARATORS (No top border on first item) */}
            <div className="divide-y divide-gray-100">
              {/* PROPERTY SNAPSHOT */}
              <PropertySnapshotSection property={property} />

              {/* ABOUT THIS PROPERTY */}
              <PropertyDescriptionSection property={property} />

              {/* WHY THIS PROPERTY (DATA-DRIVEN HIGHLIGHTS) */}
              <PropertyHighlightsSection property={property} />

              {/* AMENITIES & FACILITIES */}
              <PropertyAmenitiesSection property={property} />

              {/* PROPERTY DETAILS & SPECIFICATIONS */}
              <PropertyDetailsSection property={property} />

              {/* LOCATION & NEIGHBORHOOD */}
              <PropertyLocationSection property={property} />

              {/* NEARBY PLACES */}
              <NearbyPlacesSection property={property} />

              {/* HOUSE RULES / REQUIREMENTS */}
              <HouseRulesSection property={property} />

              {/* VERIFICATION & TRUST INFORMATION */}
              <VerificationCard property={property} />

              {/* OWNER INFORMATION */}
              <OwnerCard property={property} />
            </div>
          </div>

          {/* RIGHT: DESKTOP STICKY ACTION CARD */}
          <aside aria-label="Booking and pricing actions" className="hidden lg:block w-[350px] xl:w-[370px] shrink-0 sticky top-28">
            <PropertyActionsSection property={property} />
          </aside>
        </div>

        {/* SIMILAR PROPERTIES (FULL WIDTH BOTTOM SECTION) */}
        <div className="pt-10 sm:pt-14 border-t border-gray-100 mt-8 sm:mt-12">
          <SimilarPropertiesSection property={property} />
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <MobileBottomBar property={property} />
    </article>
  );
}
