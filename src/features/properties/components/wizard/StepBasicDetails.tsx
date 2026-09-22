'use client';

import React, { useState, useEffect } from 'react';
import type {
  PropertyType,
  RentalStructure,
  PropertyAvailability,
  PropertyAvailabilityType
} from '../../types';
import { getBasicFieldsConfig, getPropertyTemplate } from '../../templates';

export interface BasicDetailsFormData {
  title?: string;
  description?: string;
  availability?: PropertyAvailability;
  monthlyRent?: number;
  guests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  hasLock?: boolean;
}

interface StepBasicDetailsProps {
  propertyType: PropertyType;
  customPropertyType?: string;
  rentalStructure: RentalStructure;
  initialValues?: Partial<BasicDetailsFormData>;
  subStep?: 'basics' | 'title_description';
  onSubStepChange?: (subStep: 'basics' | 'title_description') => void;
  onBack: (currentValues: BasicDetailsFormData) => void;
  onSave: (data: BasicDetailsFormData) => Promise<void> | void;
  isSaving?: boolean;
}

export default function StepBasicDetails({
  propertyType,
  customPropertyType,
  rentalStructure,
  initialValues,
  onBack,
  onSave,
  isSaving = false
}: StepBasicDetailsProps) {
  // Capacity state
  const [guests, setGuests] = useState<number>(initialValues?.guests ?? 2);
  const [bedrooms, setBedrooms] = useState<number>(initialValues?.bedrooms ?? 1);
  const [beds, setBeds] = useState<number>(initialValues?.beds ?? 1);
  const [bathrooms, setBathrooms] = useState<number>(initialValues?.bathrooms ?? 1);
  const [hasLock, setHasLock] = useState<boolean>(initialValues?.hasLock ?? true);

  const initializedRef = React.useRef(false);

  // Sync state if initialValues change upon asynchronous draft load
  useEffect(() => {
    if (!initializedRef.current && initialValues) {
      if (initialValues.guests) setGuests(initialValues.guests);
      if (initialValues.bedrooms) setBedrooms(initialValues.bedrooms);
      if (initialValues.beds) setBeds(initialValues.beds);
      if (initialValues.bathrooms) setBathrooms(initialValues.bathrooms);
      if (typeof initialValues.hasLock === 'boolean') setHasLock(initialValues.hasLock);

      if (initialValues.bedrooms || initialValues.beds || initialValues.bathrooms) {
        initializedRef.current = true;
      }
    }
  }, [initialValues]);

  const getCurrentFormData = (): BasicDetailsFormData => {
    return {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      availability: initialValues?.availability || { type: 'immediate' },
      monthlyRent: initialValues?.monthlyRent || 15000,
      guests,
      bedrooms,
      beds,
      bathrooms,
      hasLock
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(getCurrentFormData());
  };

  return (
    <form id="basic-details-form" onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto animate-fade-in py-2 space-y-8" noValidate>
      {/* SECTION HEADING (Matching Airbnb basics step) */}
      <div>
        <h1 className="font-outfit text-2xl sm:text-[30px] font-semibold text-[#222222] tracking-tight">
          Tell us about your space
        </h1>
      </div>

      {/* CAPACITY & ROOMS COUNTERS */}
      <div>
        <h2 className="font-inter text-base sm:text-lg font-medium text-[#222222] mb-2">
          How many people can stay here?
        </h2>

        <div className="space-y-0 font-inter">
          {/* Bedrooms */}
          <div className="flex items-center justify-between py-4 border-b border-[#EBEBEB]">
            <span className="text-base text-[#222222] font-normal">Bedrooms</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBedrooms((b) => Math.max(1, b - 1))}
                disabled={bedrooms <= 1}
                className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg text-[#717171] hover:border-[#222222] hover:text-[#222222] disabled:opacity-30 disabled:hover:border-[#B0B0B0] transition-colors select-none"
              >
                –
              </button>
              <span className="text-base font-normal text-[#222222] w-6 text-center">{bedrooms}</span>
              <button
                type="button"
                onClick={() => setBedrooms((b) => b + 1)}
                className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg text-[#717171] hover:border-[#222222] hover:text-[#222222] transition-colors select-none"
              >
                +
              </button>
            </div>
          </div>

          {/* Beds */}
          <div className="flex items-center justify-between py-4 border-b border-[#EBEBEB]">
            <span className="text-base text-[#222222] font-normal">Beds</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBeds((b) => Math.max(1, b - 1))}
                disabled={beds <= 1}
                className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg text-[#717171] hover:border-[#222222] hover:text-[#222222] disabled:opacity-30 disabled:hover:border-[#B0B0B0] transition-colors select-none"
              >
                –
              </button>
              <span className="text-base font-normal text-[#222222] w-6 text-center">{beds}</span>
              <button
                type="button"
                onClick={() => setBeds((b) => b + 1)}
                className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg text-[#717171] hover:border-[#222222] hover:text-[#222222] transition-colors select-none"
              >
                +
              </button>
            </div>
          </div>

          {/* Bathrooms */}
          <div className="flex items-center justify-between py-4 border-b border-[#EBEBEB]">
            <span className="text-base text-[#222222] font-normal">Bathrooms</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBathrooms((b) => Math.max(1, b - 1))}
                disabled={bathrooms <= 1}
                className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg text-[#717171] hover:border-[#222222] hover:text-[#222222] disabled:opacity-30 disabled:hover:border-[#B0B0B0] transition-colors select-none"
              >
                –
              </button>
              <span className="text-base font-normal text-[#222222] w-6 text-center">{bathrooms}</span>
              <button
                type="button"
                onClick={() => setBathrooms((b) => b + 1)}
                className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg text-[#717171] hover:border-[#222222] hover:text-[#222222] transition-colors select-none"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Does every bedroom have a lock? */}
        <div className="mt-8 space-y-3 font-inter">
          <h3 className="text-base sm:text-lg font-semibold text-[#222222]">
            Does every bedroom have a lock?
          </h3>
          <div className="space-y-2.5">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="radio"
                name="hasLock"
                checked={hasLock === true}
                onChange={() => setHasLock(true)}
                className="w-5 h-5 accent-[#222222] cursor-pointer"
              />
              <span className="text-base text-[#222222]">Yes</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="radio"
                name="hasLock"
                checked={hasLock === false}
                onChange={() => setHasLock(false)}
                className="w-5 h-5 accent-[#222222] cursor-pointer"
              />
              <span className="text-base text-[#222222]">No</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
