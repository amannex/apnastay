'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface PropertyBreadcrumbProps {
  property: NormalizedProperty;
}

export default function PropertyBreadcrumb({ property }: PropertyBreadcrumbProps) {
  const city = property.location.city || 'Indore';
  const locality = property.location.locality;
  const title = property.title || 'Residence';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
      {/* Breadcrumb Trail */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-[#6B7280]">
        <Link
          href="/"
          className="hover:text-[#E1224D] transition-colors inline-flex items-center gap-1 font-medium"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />

        <Link
          href={`/properties?city=${encodeURIComponent(city.toLowerCase())}`}
          className="hover:text-[#E1224D] transition-colors font-medium capitalize"
        >
          {city}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />

        {locality && (
          <>
            <span className="truncate max-w-[120px] text-gray-600 hidden md:inline">
              {locality}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 hidden md:inline" />
          </>
        )}

        <span className="text-[#1A1A1A] font-semibold truncate max-w-[160px] sm:max-w-xs">
          {title}
        </span>
      </nav>

      {/* Back button */}
      <div>
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#E1224D] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to properties</span>
        </Link>
      </div>
    </div>
  );
}
