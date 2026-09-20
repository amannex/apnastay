'use client';

import React from 'react';
import {
  Home,
  Building2,
  Users,
  GraduationCap,
  Layers,
  DoorOpen,
  Coffee,
  BedDouble,
  PlusCircle,
  Check
} from 'lucide-react';
import type { PropertyType } from '../../types';

export interface PropertyTypeOption {
  id: PropertyType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const APNASTAY_PROPERTY_TYPES: PropertyTypeOption[] = [
  {
    id: 'apartment',
    title: 'Apartment / Flat',
    description: 'Flats in residential societies or standalone buildings',
    icon: Building2
  },
  {
    id: 'independent_house',
    title: 'Independent House',
    description: 'Standalone house, villa, or independent bungalow',
    icon: Home
  },
  {
    id: 'builder_floor',
    title: 'Builder Floor',
    description: 'Dedicated single floor in a low-rise residential building',
    icon: Layers
  },
  {
    id: 'pg',
    title: 'PG',
    description: 'Paying guest accommodation with food & managed amenities',
    icon: Users
  },
  {
    id: 'hostel',
    title: 'Hostel',
    description: 'Student or working professional managed community living',
    icon: GraduationCap
  },
  {
    id: 'co_living',
    title: 'Co-living',
    description: 'Community-driven furnished living with shared spaces',
    icon: Coffee
  },
  {
    id: 'room',
    title: 'Room',
    description: 'Private or shared individual room in a flat or house',
    icon: DoorOpen
  },
  {
    id: 'bed_space',
    title: 'Bed / Bed Space',
    description: 'Individual bed space in a shared room or dorm',
    icon: BedDouble
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Specialty, penthouse, farmstay, or custom format',
    icon: PlusCircle
  }
];

export interface StepPropertyTypeProps {
  selectedType: PropertyType | null;
  customPropertyType: string;
  onSelectType: (type: PropertyType) => void;
  onChangeCustomType: (val: string) => void;
  onContinue?: () => void;
}

export default function StepPropertyType({
  selectedType,
  customPropertyType,
  onSelectType,
  onChangeCustomType,
  onContinue
}: StepPropertyTypeProps) {
  const isOtherSelected = selectedType === 'other';

  return (
    <div className="w-full max-w-3xl sm:max-w-4xl mx-auto animate-fade-in py-2">
      {/* SECTION HEADING & SUPPORTING TEXT */}
      <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8 space-y-2">
        <h1 className="text-2xl sm:text-[32px] font-semibold text-[#1D1D1F] tracking-tight leading-tight">
          What type of property are you listing?
        </h1>
        <p className="text-sm sm:text-base text-[#717171] font-normal leading-relaxed">
          Choose the option that best describes your property.
        </p>
      </div>

      {/* SELECTABLE PROPERTY TYPE CARDS */}
      <div
        role="radiogroup"
        aria-label="Property type selection"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4"
      >
        {APNASTAY_PROPERTY_TYPES.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.id;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectType(option.id)}
              className={`group relative text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[112px] sm:min-h-[126px] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D1D1F] focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-2 border-[#1D1D1F] bg-[#FAFAFA] shadow-apple-xs ring-1 ring-[#1D1D1F]/5'
                  : 'border border-[#E5E5EA] hover:border-[#1D1D1F] bg-white hover:shadow-apple-xs'
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#1D1D1F] text-white'
                      : 'bg-[#F5F5F7] text-[#1D1D1F] group-hover:bg-[#EBEBEB]'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                )}
              </div>

              <div className="mt-3.5">
                <div className="text-sm sm:text-base font-semibold text-[#1D1D1F] tracking-tight">
                  {option.title}
                </div>
                {option.description && (
                  <p className="text-xs text-[#717171] leading-relaxed mt-0.5 line-clamp-2">
                    {option.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* CUSTOM "OTHER" SPECIFICATION INPUT */}
      {isOtherSelected && (
        <div className="mt-6 p-4 sm:p-5 rounded-2xl border border-[#E5E5EA] bg-[#FAFAFA] animate-fade-in space-y-2 max-w-lg mx-auto">
          <label
            htmlFor="customPropertyType"
            className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider"
          >
            Specify Property Format
          </label>
          <input
            id="customPropertyType"
            type="text"
            value={customPropertyType}
            onChange={(e) => onChangeCustomType(e.target.value)}
            placeholder="e.g. Student Housing, Farmstay, Penthouse"
            className="w-full px-4 py-2.5 rounded-xl border border-[#D1D1D6] text-sm text-[#1D1D1F] bg-white placeholder-[#8E8E93] focus:outline-none focus:border-[#1D1D1F] focus:ring-1 focus:ring-[#1D1D1F] transition-all"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
