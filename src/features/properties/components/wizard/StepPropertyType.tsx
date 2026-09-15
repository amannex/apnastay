'use client';

import React from 'react';
import {
  Home,
  Building2,
  Sparkles,
  Users,
  GraduationCap,
  Building,
  Layers,
  DoorOpen,
  Coffee,
  Briefcase,
  PlusCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import type { PropertyType } from '../../types';

interface PropertyTypeOption {
  id: PropertyType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PROPERTY_TYPES: PropertyTypeOption[] = [
  { id: 'house', title: 'House', icon: Home },
  { id: 'apartment', title: 'Flat / apartment', icon: Building2 },
  { id: 'villa', title: 'Villa', icon: Sparkles },
  { id: 'pg', title: 'PG / Paying guest', icon: Users },
  { id: 'hostel', title: 'Hostel', icon: GraduationCap },
  { id: 'coliving', title: 'Co-living', icon: Coffee },
  { id: 'independent_floor', title: 'Independent floor', icon: Layers },
  { id: 'room', title: 'Room / Studio', icon: DoorOpen },
  { id: 'building', title: 'Entire building', icon: Building },
  { id: 'commercial', title: 'Commercial', icon: Briefcase },
  { id: 'other', title: 'Other', icon: PlusCircle }
];

interface StepPropertyTypeProps {
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
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto animate-fade-in py-2">
      {/* SECTION HEADING (Centered, clean Airbnb typography) */}
      <h1 className="text-2xl sm:text-[32px] font-semibold text-[#222222] text-center tracking-tight mb-6 sm:mb-8">
        Which of these best describes your place?
      </h1>

      {/* PROPERTY TYPE CARDS GRID (3-columns matching Screenshot 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {PROPERTY_TYPES.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectType(option.id)}
              className={`text-left p-4 sm:p-5 rounded-xl border transition-all duration-150 flex flex-col justify-between min-h-[96px] sm:min-h-[108px] active:scale-[0.98] ${
                isSelected
                  ? 'border-2 border-[#222222] bg-[#F7F7F7]'
                  : 'border border-[#DDDDDD] hover:border-[#222222] bg-white'
              }`}
            >
              <div className="w-7 h-7 flex items-center justify-start text-[#222222]">
                <Icon className="w-6 h-6 stroke-[1.75]" />
              </div>

              <span className="text-sm sm:text-base font-semibold text-[#222222] tracking-tight mt-3">
                {option.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* CUSTOM "OTHER" SPECIFICATION INPUT */}
      {isOtherSelected && (
        <div className="mt-6 p-4 rounded-xl border border-[#DDDDDD] bg-[#F7F7F7] animate-fade-in space-y-1.5">
          <label
            htmlFor="customPropertyType"
            className="block text-xs font-semibold text-[#222222] uppercase tracking-wider"
          >
            Specify Property Format
          </label>
          <input
            id="customPropertyType"
            type="text"
            value={customPropertyType}
            onChange={(e) => onChangeCustomType(e.target.value)}
            placeholder="e.g. Student Housing, Farmstay, Penthouse"
            className="w-full px-4 py-2.5 rounded-lg border border-[#DDDDDD] text-sm text-[#222222] bg-white placeholder-[#717171] focus:outline-none focus:border-[#222222] transition-all"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
