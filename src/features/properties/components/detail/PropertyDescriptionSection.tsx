'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface PropertyDescriptionSectionProps {
  property: NormalizedProperty;
}

export default function PropertyDescriptionSection({ property }: PropertyDescriptionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const description = property.description || '';

  if (!description.trim()) {
    return null;
  }

  const isLong = description.length > 280;
  const displayText = isLong && !isExpanded ? `${description.slice(0, 280)}...` : description;

  return (
    <section aria-label="About this property" className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDEDED] shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-[#1A1A1A]">
        About this property
      </h2>

      <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
        {displayText}
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E1224D] hover:text-[#c91d43] transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Show less' : 'Read full description'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      )}
    </section>
  );
}
