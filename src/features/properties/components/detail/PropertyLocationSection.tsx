import React from 'react';
import type { NormalizedProperty } from '../../adapter';
import PropertyInteractiveMap from './PropertyInteractiveMap';

interface PropertyLocationSectionProps {
  property: NormalizedProperty;
}

export default function PropertyLocationSection({ property }: PropertyLocationSectionProps) {
  const { location } = property;

  const localityLine = location.displayLocation || location.locality || (location.city ? `${location.city}${location.state ? `, ${location.state}` : ''}` : 'Location upon request');

  return (
    <section
      aria-label="Location and neighborhood"
      className="py-6 sm:py-8 space-y-4"
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
          Location
        </h2>
      </div>

      {/* Interactive Map */}
      <div>
        <PropertyInteractiveMap
          latitude={location.latitude}
          longitude={location.longitude}
          displayLocation={localityLine}
          isApproximate={location.hideExactAddress}
        />
      </div>
    </section>
  );
}

