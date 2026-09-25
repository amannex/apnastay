'use client';

import React from 'react';
import { Compass, Train, ShoppingBag, Building2, GraduationCap } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface NearbyPlacesSectionProps {
  property: NormalizedProperty;
}

export default function NearbyPlacesSection({ property }: PropertyNearbyPlacesProps) {
  const nearbyPlaces = property.nearbyPlaces || [];

  if (nearbyPlaces.length === 0) {
    return null;
  }

  return (
    <section aria-label="Nearby transit & places" className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDEDED] shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
        <Compass className="w-5 h-5 text-[#E1224D]" />
        <span>Nearby Transit & Landmarks</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {nearbyPlaces.map((place, idx) => (
          <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAFAFA] border border-gray-100">
            <span className="text-xs sm:text-sm font-semibold text-gray-800">{place.name}</span>
            <span className="text-xs font-bold text-[#E1224D] bg-rose-50 px-2.5 py-1 rounded-full shrink-0 ml-2">
              {place.distance}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

type PropertyNearbyPlacesProps = NearbyPlacesSectionProps;
