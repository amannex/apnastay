'use client';

import React from 'react';
import { MapPin, Navigation, ShieldCheck } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface PropertyLocationSectionProps {
  property: NormalizedProperty;
}

export default function PropertyLocationSection({ property }: PropertyLocationSectionProps) {
  const { location } = property;

  return (
    <section aria-label="Location and neighborhood" className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDEDED] shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
          <span>Location & Neighborhood</span>
        </h2>
        <span className="text-xs font-semibold text-[#E1224D] bg-rose-50 px-2.5 py-1 rounded-full">
          {location.city}
        </span>
      </div>

      <div className="flex items-start gap-2.5 text-sm text-gray-700">
        <MapPin className="w-5 h-5 text-[#E1224D] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-gray-900">{location.displayLocation}</p>
          {location.landmark && (
            <p className="text-xs text-[#6B7280] mt-0.5">Landmark: {location.landmark}</p>
          )}
          {location.hideExactAddress && (
            <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Exact address protected for owner privacy until visit scheduling.
            </p>
          )}
        </div>
      </div>

      {/* Map Placeholder Foundation (Interactive Leaflet map in Phase 7) */}
      <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-center p-4">
        <div className="p-3 rounded-full bg-white text-[#E1224D] shadow-sm mb-2">
          <Navigation className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-gray-800">
          {location.displayLocation}
        </p>
        <p className="text-xs text-[#6B7280] mt-1 max-w-sm">
          Interactive locality map and transit routing are ready in this architectural container.
        </p>
      </div>
    </section>
  );
}
