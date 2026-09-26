'use client';

import React from 'react';
import { MapPin, ShieldCheck } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';
import PropertyInteractiveMap from './PropertyInteractiveMap';

interface PropertyLocationSectionProps {
  property: NormalizedProperty;
}

export default function PropertyLocationSection({ property }: PropertyLocationSectionProps) {
  const { location } = property;

  const localityLine = location.locality || location.displayLocation || 'Location upon request';
  const cityStateLine = location.city ? `${location.city}${location.state ? `, ${location.state}` : ''}` : '';

  return (
    <section
      aria-label="Location and neighborhood"
      className="py-6 sm:py-8 space-y-5"
    >
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
            Location
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Geographic area and neighbourhood connectivity
          </p>
        </div>
        {location.city && (
          <span className="text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
            {location.city}
          </span>
        )}
      </div>

      {/* Two-line Location format specified by design prompt */}
      <div className="flex items-start gap-3 text-sm text-gray-700">
        <div className="p-2 rounded-xl bg-gray-100 text-gray-900 border border-gray-200 shrink-0 mt-0.5">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
            {localityLine}
          </p>
          {cityStateLine && (
            <p className="text-sm font-medium text-gray-600">
              {cityStateLine}
            </p>
          )}
          {location.landmark && (
            <p className="text-xs text-gray-500 pt-1">
              Landmark: <span className="text-gray-700 font-semibold">{location.landmark}</span>
            </p>
          )}
        </div>
      </div>

      {/* Privacy Notice for Approximate Locality */}
      {location.hideExactAddress && (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
          <ShieldCheck className="w-4 h-4 text-gray-700 shrink-0" />
          <span>Approximate locality shown for privacy. Complete address is provided upon confirmed visit scheduling.</span>
        </div>
      )}

      {/* Interactive Map (Supports Latitude, Longitude, and Approximate Circle) */}
      <div className="pt-1">
        <PropertyInteractiveMap
          latitude={location.latitude}
          longitude={location.longitude}
          displayLocation={location.displayLocation}
          isApproximate={location.hideExactAddress}
        />
      </div>
    </section>
  );
}
