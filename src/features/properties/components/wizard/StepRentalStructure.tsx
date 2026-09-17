'use client';

import React from 'react';
import {
  Key,
  Building2,
  DoorOpen,
  BedDouble,
  Layers
} from 'lucide-react';
import type { PropertyType, RentalStructure } from '../../types';
import { getPropertyTemplate } from '../../templates';

interface RentalStructureOption {
  id: RentalStructure;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const RENTAL_STRUCTURES: RentalStructureOption[] = [
  {
    id: 'entire_property',
    title: 'Entire property',
    subtitle: 'Tenants book the whole property as a single private stay.',
    icon: Key
  },
  {
    id: 'individual_unit',
    title: 'Individual unit',
    subtitle: 'Rent out a self-contained flat or apartment in a building.',
    icon: Building2
  },
  {
    id: 'individual_room',
    title: 'Individual room',
    subtitle: 'Rent out private or independent rooms with shared/attached facilities.',
    icon: DoorOpen
  },
  {
    id: 'individual_bed',
    title: 'Individual bed',
    subtitle: 'Rent out individual bed slots in shared rooms (ideal for PGs & Hostels).',
    icon: BedDouble
  },
  {
    id: 'multiple_units',
    title: 'Multiple units',
    subtitle: 'Manage and list multiple different flats or spaces under one property.',
    icon: Layers
  }
];

interface StepRentalStructureProps {
  selectedType: PropertyType;
  selectedStructure: RentalStructure | null;
  onSelectStructure: (structure: RentalStructure) => void;
  onBack: () => void;
  onContinue: () => void;
  isSubmitting?: boolean;
}

export default function StepRentalStructure({
  selectedType,
  selectedStructure,
  onSelectStructure,
  onBack,
  onContinue,
  isSubmitting = false
}: StepRentalStructureProps) {
  const template = getPropertyTemplate(selectedType);
  const recommendedStructure = template.defaultRentalStructure;

  return (
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto animate-fade-in py-2">
      {/* SECTION HEADING (Centered, clean Airbnb typography) */}
      <h1 className="text-2xl sm:text-[32px] font-semibold text-[#222222] text-center tracking-tight mb-6 sm:mb-8">
        What type of place will guests have?
      </h1>

      {/* RENTAL STRUCTURE CARDS (Single column of rows matching Airbnb) */}
      <div className="flex flex-col gap-3.5 sm:gap-4 max-w-xl mx-auto">
        {RENTAL_STRUCTURES.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedStructure === option.id;
          const isRecommended = option.id === recommendedStructure;
          const isAllowed = template.allowedRentalStructures.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectStructure(option.id)}
              className={`w-full text-left p-5 sm:p-6 rounded-xl border transition-all duration-150 flex items-center justify-between gap-4 active:scale-[0.99] ${
                isSelected
                  ? 'border-2 border-[#222222] bg-[#F7F7F7]'
                  : 'border border-[#DDDDDD] hover:border-[#222222] bg-white'
              } ${!isAllowed ? 'opacity-70' : ''}`}
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base sm:text-lg font-semibold text-[#222222] tracking-tight">
                    {option.title}
                  </h3>
                  {isRecommended && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#222222] text-white text-[10px] font-medium tracking-wide shrink-0">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#717171] mt-1 leading-snug">
                  {option.subtitle}
                </p>
              </div>

              <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0 text-[#222222]">
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.5]" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
