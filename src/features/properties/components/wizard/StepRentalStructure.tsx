'use client';

import React from 'react';
import {
  Home,
  DoorOpen,
  Users,
  BedDouble,
  Layers,
  Check
} from 'lucide-react';
import type { PropertyType, RentalStructure } from '../../types';

export interface RentalStructureOption {
  id: RentalStructure;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const APNASTAY_RENTAL_STRUCTURES: RentalStructureOption[] = [
  {
    id: 'entire_property',
    title: 'Entire property',
    subtitle: 'Tenants rent the whole place to themselves',
    icon: Home
  },
  {
    id: 'individual_room',
    title: 'Individual room',
    subtitle: 'Tenants have a private room and share common areas',
    icon: DoorOpen
  },
  {
    id: 'shared_room',
    title: 'Shared room',
    subtitle: 'Tenants share a room with roommates or co-tenants',
    icon: Users
  },
  {
    id: 'individual_bed',
    title: 'Individual bed / bed space',
    subtitle: 'Tenants rent an individual bed or bunk space in a shared room',
    icon: BedDouble
  },
  {
    id: 'multiple_units',
    title: 'Multiple rooms / units',
    subtitle: 'Manage and list multiple distinct rooms, flats, or rental units',
    icon: Layers
  }
];

export interface StepRentalStructureProps {
  selectedType: PropertyType;
  selectedStructure: RentalStructure | null;
  onSelectStructure: (structure: RentalStructure) => void;
  onBack?: () => void;
  onContinue?: () => void;
  isSubmitting?: boolean;
}

export default function StepRentalStructure({
  selectedStructure,
  onSelectStructure
}: StepRentalStructureProps) {
  return (
    <div className="w-full max-w-3xl sm:max-w-4xl mx-auto animate-fade-in py-2">
      {/* SECTION HEADING & SUPPORTING TEXT */}
      <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8 space-y-2">
        <h1 className="text-2xl sm:text-[32px] font-semibold text-[#1D1D1F] tracking-tight leading-tight">
          What can tenants rent?
        </h1>
        <p className="text-sm sm:text-base text-[#717171] font-normal leading-relaxed">
          Tell us what part of the property you want to offer on ApnaStay.
        </p>
      </div>

      {/* SELECTABLE RENTAL STRUCTURE CARDS */}
      <div
        role="radiogroup"
        aria-label="What can tenants rent"
        className="flex flex-col gap-3 sm:gap-3.5 max-w-xl mx-auto"
      >
        {APNASTAY_RENTAL_STRUCTURES.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedStructure === option.id;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectStructure(option.id)}
              className={`group relative text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D1D1F] focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-2 border-[#1D1D1F] bg-[#FAFAFA] shadow-apple-xs ring-1 ring-[#1D1D1F]/5'
                  : 'border border-[#E5E5EA] hover:border-[#1D1D1F] bg-white hover:shadow-apple-xs'
              }`}
            >
              <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#1D1D1F] text-white'
                      : 'bg-[#F5F5F7] text-[#1D1D1F] group-hover:bg-[#EBEBEB]'
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[1.8]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base font-semibold text-[#1D1D1F] tracking-tight">
                    {option.title}
                  </div>
                  <p className="text-xs sm:text-sm text-[#717171] leading-relaxed mt-0.5">
                    {option.subtitle}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-center">
                {isSelected ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-[#D1D1D6] group-hover:border-[#8E8E93] transition-colors" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
