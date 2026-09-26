'use client';

import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface PropertyHighlightsSectionProps {
  property: NormalizedProperty;
}

export default function PropertyHighlightsSection({ property }: PropertyHighlightsSectionProps) {
  const highlights = property.highlights || [];

  if (highlights.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Why this property"
      className="py-6 sm:py-8 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[#E1224D]" />
        <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
          Why this property
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
        {highlights.map((highlight, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100 hover:bg-gray-100/60 transition-colors"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-800">
              {highlight}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
