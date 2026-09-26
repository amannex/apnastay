'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface PropertyBreadcrumbProps {
  property: NormalizedProperty;
}

export default function PropertyBreadcrumb({ property }: PropertyBreadcrumbProps) {
  const city = property.location.city || 'Indore';
  const locality = property.location.locality;
  const title = property.title || 'Residence';

  return (
    <div className="flex items-center justify-between gap-3 pb-3">
      {/* Breadcrumb Trail */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-[#6B7280] overflow-x-auto scrollbar-none py-1">
        <Link
          href="/properties"
          className="hover:text-black transition-colors font-semibold text-gray-700 whitespace-nowrap"
        >
          Find ApnaStay
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />

        <Link
          href={`/properties?city=${encodeURIComponent(city.toLowerCase())}`}
          className="hover:text-black transition-colors font-medium capitalize whitespace-nowrap"
        >
          {city}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />

        {locality ? (
          <>
            <span className="truncate max-w-[140px] text-gray-700 font-medium">
              {locality}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 hidden sm:inline" />
            <span className="text-[#1A1A1A] font-semibold truncate max-w-[180px] lg:max-w-xs hidden sm:inline">
              {title}
            </span>
          </>
        ) : (
          <span className="text-[#1A1A1A] font-semibold truncate max-w-[180px] lg:max-w-xs">
            {title}
          </span>
        )}
      </nav>
    </div>
  );
}
