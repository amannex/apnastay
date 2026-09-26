'use client';

import React from 'react';
import type { NormalizedProperty } from '../../adapter';
import PropertyInteractiveMap from './PropertyInteractiveMap';

interface PropertyLocationSectionProps {
  property: NormalizedProperty;
}

export default function PropertyLocationSection({ property }: PropertyLocationSectionProps) {
  const { location } = property;

  const locationParts = [
    location.locality,
    location.city,
    location.state,
    'India'
  ].filter(Boolean) as string[];

  // Deduplicate parts (in case locality already contains city or state)
  const dedupedParts: string[] = [];
  for (const part of locationParts) {
    if (!dedupedParts.some(p => p.toLowerCase().includes(part.toLowerCase()) || part.toLowerCase().includes(p.toLowerCase()))) {
      dedupedParts.push(part);
    }
  }
  const fullLocationText = dedupedParts.length > 0 ? dedupedParts.join(', ') : (location.displayLocation || 'India');

  return (
    <section
      aria-label="Location and neighborhood"
      className="py-6 sm:py-8 space-y-6"
    >
      <div className="space-y-2.5 sm:space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
          You will be stay here
        </h2>
        <p className="text-base text-gray-700 font-normal">
          {fullLocationText}
        </p>
      </div>

      {/* Interactive Map */}
      <div>
        <PropertyInteractiveMap
          latitude={location.latitude}
          longitude={location.longitude}
          displayLocation={fullLocationText}
          isApproximate={location.hideExactAddress}
        />
      </div>
    </section>
  );
}


