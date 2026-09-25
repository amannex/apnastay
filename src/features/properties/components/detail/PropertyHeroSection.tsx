'use client';

import React from 'react';
import { MapPin, ShieldCheck, CheckCircle2, Calendar } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface PropertyHeroSectionProps {
  property: NormalizedProperty;
}

export default function PropertyHeroSection({ property }: PropertyHeroSectionProps) {
  const { title, propertyTypeLabel, location, verification, availability } = property;

  return (
    <section aria-label="Property header information" className="space-y-3">
      {/* Category & Verification Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider">
          {propertyTypeLabel}
        </span>

        {verification.isVerified && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ApnaStay Verified
          </span>
        )}

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          {availability.displayStatus}
        </span>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
        {title}
      </h1>

      {/* Location line */}
      <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
        <MapPin className="w-4 h-4 text-[#E1224D] shrink-0" />
        <span className="font-medium text-gray-800">{location.displayLocation}</span>
        {location.state && <span className="text-gray-400">• {location.state}</span>}
      </div>
    </section>
  );
}
