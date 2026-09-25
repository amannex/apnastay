'use client';

import React from 'react';
import type { NormalizedProperty } from '../../adapter';
import { resolvePropertyDetails } from './propertyDetailsConfig';

interface PropertyDetailsSectionProps {
  property: NormalizedProperty;
}

export default function PropertyDetailsSection({ property }: PropertyDetailsSectionProps) {
  const fields = resolvePropertyDetails(property);

  if (fields.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Property specifications"
      className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDEDED] shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            Property Specifications
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified configuration for this {property.propertyTypeLabel.toLowerCase()}
          </p>
        </div>
        <span className="text-xs font-semibold text-[#E1224D] bg-rose-50 border border-rose-100/80 px-3 py-1 rounded-full">
          {property.propertyTypeLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 pt-1">
        {fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center justify-between py-2.5 border-b border-gray-100/80 text-xs sm:text-sm"
          >
            <span className="text-gray-500 font-medium">{field.label}</span>
            <span
              className="text-gray-900 font-semibold text-right max-w-[65%] truncate"
              title={field.value}
            >
              {field.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
