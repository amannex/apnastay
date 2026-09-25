'use client';

import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
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
    <section aria-label="Why this property" className="bg-rose-50/50 rounded-3xl p-6 sm:p-7 border border-rose-100 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-rose-700">
        <Sparkles className="w-5 h-5 text-[#E1224D]" />
        <h2 className="text-lg font-bold text-[#1A1A1A]">
          Why this property?
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {highlights.map((highlight, idx) => (
          <div key={idx} className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-gray-800">{highlight}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
