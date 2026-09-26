'use client';

import React from 'react';
import {
  Compass,
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
      className="py-6 sm:py-8 space-y-4"
    >
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Compass className="w-5 h-5 text-gray-900" />
            <span>Nearby Places</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Key transit hubs, markets, healthcare, and institutions within reach
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          {nearbyPlaces.length} Locations
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {nearbyPlaces.map((place, idx) => {
          const IconComponent = getNearbyPlaceIcon(place.name);
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAFAFA] border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-white text-gray-900 border border-gray-100 shadow-2xs shrink-0">
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate" title={place.name}>
                  {place.name}
                </span>
              </div>
              <span className="text-xs font-bold text-gray-800 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full shrink-0 ml-2">
                {place.distance}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
