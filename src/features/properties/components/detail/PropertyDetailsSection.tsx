'use client';

import React, { useState } from 'react';
import type { NormalizedProperty } from '../../adapter';
import { resolvePropertyDetails, getFieldIcon } from './propertyDetailsConfig';
import PropertyDetailsModal from './PropertyDetailsModal';

interface PropertyDetailsSectionProps {
  property: NormalizedProperty;
}

export default function PropertyDetailsSection({ property }: PropertyDetailsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const fields = resolvePropertyDetails(property);

  if (fields.length === 0) {
    return null;
  }

  // Show only 8 items on the page
  const displayedFields = fields.slice(0, 8);

  return (
    <>
      <section
        aria-label="Additional info about property"
        className="py-6 sm:py-8 space-y-6"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
            Additional Info about Property
          </h2>
        </div>

        {/* 2-COLUMN AIRBNB-STYLE SPECIFICATIONS LIST (FIRST 8 ITEMS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-5 gap-x-8 sm:gap-x-16 pt-2">
          {displayedFields.map((field) => {
            const IconComponent = getFieldIcon(field.id);
            return (
              <div
                key={field.id}
                className="flex items-center gap-4 text-[#1A1A1A]"
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

        {/* SHOW ALL BUTTON (OPENS MODAL POPUP) */}
        {fields.length > 8 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-sm sm:text-base font-medium text-gray-900 transition-colors cursor-pointer"
            >
              Show all {fields.length} additional info
            </button>
          </div>
        )}
      </section>

      {/* ADDITIONAL INFO MODAL */}
      <PropertyDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        fields={fields}
      />
    </>
  );
}
