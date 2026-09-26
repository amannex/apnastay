'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface PropertyDescriptionSectionProps {
  property: NormalizedProperty;
}

/**
 * Safely parses basic bold markdown (**text**) into React nodes
 * without using raw innerHTML.
 */
function renderFormattedText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Renders an individual paragraph, detecting bullet lists if lines start with -, *, or •
 */
function renderParagraph(paragraphText: string, pIndex: number): React.ReactNode {
  const lines = paragraphText.split('\n').map((l) => l.trim()).filter(Boolean);
  const isBulletList = lines.length > 0 && lines.every((line) => /^[-*•]\s+/.test(line));

  if (isBulletList) {
    return (
      <ul key={pIndex} className="space-y-1.5 pl-1 my-2 list-none">
        {lines.map((line, lIndex) => {
          const cleanItem = line.replace(/^[-*•]\s+/, '');
          return (
            <li key={lIndex} className="flex items-start gap-2 text-sm sm:text-base text-gray-700 leading-relaxed">
              <span className="text-gray-900 font-bold select-none leading-relaxed">•</span>
              <span className="min-w-0 flex-1">{renderFormattedText(cleanItem)}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <p key={pIndex} className="text-sm sm:text-base text-gray-700 leading-relaxed">
      {lines.map((line, lIndex) => (
        <React.Fragment key={lIndex}>
          {renderFormattedText(line)}
          {lIndex < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </p>
  );
}

export default function PropertyDescriptionSection({ property }: PropertyDescriptionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const description = property.description?.trim() || '';

  // Do not show an empty section if no description exists
  if (!description) {
    return null;
  }

  const paragraphs = description.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const isLong = description.length > 320 || paragraphs.length > 2;

  return (
    <section
      aria-label="About this property"
      className="py-6 sm:py-8 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
          About this property
        </h2>
      </div>

      <div className="relative">
        <div
          id="property-description-body"
          className={`space-y-3.5 transition-all duration-300 ease-in-out ${
            isLong && !isExpanded ? 'max-h-52 overflow-hidden' : 'max-h-none'
          }`}
        >
          {paragraphs.map((p, idx) => renderParagraph(p, idx))}
        </div>

        {/* Gradient fade overlay when collapsed */}
        {isLong && !isExpanded && (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"
          />
        )}
      </div>

      {isLong && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="property-description-body"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-black underline underline-offset-4 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20 rounded-lg py-1 px-1 cursor-pointer"
          >
            <span>{isExpanded ? 'Show less' : 'Read full description'}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 transition-transform duration-200" />
            ) : (
              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            )}
          </button>
        </div>
      )}
    </section>
  );
}
