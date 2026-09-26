'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { ResolvedPropertyField } from './propertyDetailsConfig';
import { getFieldIcon } from './propertyDetailsConfig';

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: ResolvedPropertyField[];
}

const LAYOUT_FIELD_IDS = new Set([
  'bedrooms',
  'bathrooms',
  'carpetArea',
  'builtUpArea',
  'floor',
  'totalFloors',
  'plotArea',
  'floors',
  'roomType',
  'sharingType',
  'bedType',
  'sharing',
  'propertyType'
]);

export default function PropertyDetailsModal({
  isOpen,
  onClose,
  fields
}: PropertyDetailsModalProps) {
  // Lock body scroll and register escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const layoutFields = fields.filter((f) => LAYOUT_FIELD_IDS.has(f.id));
  const facilityFields = fields.filter((f) => !LAYOUT_FIELD_IDS.has(f.id));

  const categories = [
    { id: 'layout', title: 'Property Layout & Space', items: layoutFields },
    { id: 'facilities', title: 'Facilities & Inclusions', items: facilityFields }
  ].filter((cat) => cat.items.length > 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="All additional info and property specifications"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
    >
      {/* Backdrop overlay dismiss */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-apple-lg z-10 overflow-hidden border border-gray-100">
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 bg-white z-20 px-6 sm:px-8 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700 hover:text-black transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold text-gray-500">
            {fields.length} Specifications
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
          <div className="pb-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">
              Additional Info about Property
            </h2>
          </div>

          {/* Categorized blocks */}
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category.id} className="space-y-3">
                <h3 className="text-base sm:text-lg font-medium text-[#1A1A1A]">
                  {category.title}
                </h3>
                <div className="divide-y divide-gray-200 border-b border-gray-200">
                  {category.items.map((field) => {
                    const IconComponent = getFieldIcon(field.id);
                    return (
                      <div
                        key={field.id}
                        className="flex items-center gap-4 py-4.5 sm:py-5 first:pt-1.5"
                      >
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-black shrink-0 stroke-[1.6]" />
                        <span className="text-sm sm:text-base font-normal">
                          <span className="text-[rgb(31,41,55)]">{field.label}: </span>
                          <span className="text-[rgb(107,114,128)]">{field.value}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
