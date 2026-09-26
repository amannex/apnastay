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
      aria-label="Additional info about property"
      className="py-6 sm:py-8 space-y-4"
    >
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
            Additional Info about Property
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified configuration for this {property.propertyTypeLabel.toLowerCase()}
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
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
