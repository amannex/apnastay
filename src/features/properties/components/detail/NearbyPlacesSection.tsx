'use client';

import React from 'react';
import {
  Train,
  ShoppingBag,
  Building2,
  GraduationCap,
  MapPin,
  Trees
} from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface NearbyPlacesSectionProps {
  property: NormalizedProperty;
}

type NearbyIconComponent = React.ComponentType<{ className?: string }>;

function getNearbyPlaceIcon(name: string): NearbyIconComponent {
  const lower = name.toLowerCase();

  if (/metro|train|station|brts|railway|bus|transit/i.test(lower)) {
    return Train as NearbyIconComponent;
  }
  if (/market|mall|shopping|store|plaza|bazaar/i.test(lower)) {
    return ShoppingBag as NearbyIconComponent;
  }
  if (/hospital|clinic|health|medical|doctor/i.test(lower)) {
    return Building2 as NearbyIconComponent;
  }
  if (/college|university|school|campus|institute|academy/i.test(lower)) {
    return GraduationCap as NearbyIconComponent;
  }
  if (/park|garden|lake|promenade|river/i.test(lower)) {
    return Trees as NearbyIconComponent;
  }

  return MapPin as NearbyIconComponent;
}

export default function NearbyPlacesSection({ property }: NearbyPlacesSectionProps) {
  const nearbyPlaces = property.nearbyPlaces || [];

  // Never fabricate distances: hide the section if no verified nearby places exist
  if (nearbyPlaces.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Nearby places and transit"
      className="py-6 sm:py-8 space-y-6"
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
          Nearby Places
        </h2>
      </div>

      {/* NEARBY PLACES WITH DISTANCES IN SEPARATE COLUMN */}
      <div className="space-y-4 sm:space-y-5 pt-2">
        {nearbyPlaces.map((place, idx) => {
          const IconComponent = getNearbyPlaceIcon(place.name);
          return (
            <div
              key={`${place.name}-${idx}`}
              className="flex items-center justify-between sm:justify-start sm:gap-10 text-[#1A1A1A]"
            >
              <div className="flex items-center gap-4 min-w-0 sm:w-[320px] shrink-0">
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-black shrink-0 stroke-[1.6]" />
                <span className="text-sm sm:text-base font-normal text-[rgb(31,41,55)] truncate">
                  {place.name}
                </span>
              </div>
              {place.distance && (
                <span className="text-sm sm:text-base font-normal text-[rgb(107,114,128)] shrink-0">
                  {place.distance}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
