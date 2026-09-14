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
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PROPERTY_TYPES: PropertyTypeOption[] = [
  {
    id: 'house',
    title: 'House',
    subtitle: 'Independent standalone bungalow or house',
    icon: Home
  },
  {
    id: 'apartment',
    title: 'Apartment / Flat',
    subtitle: 'Flat within a society, building, or complex',
    icon: Building2
  },
  {
    id: 'villa',
    title: 'Villa',
    subtitle: 'Detached luxury home with private grounds',
    icon: Sparkles
  },
  {
    id: 'pg',
    title: 'PG (Paying Guest)',
    subtitle: 'Managed rooms or beds with utilities and meals',
    icon: Users
  },
  {
    id: 'hostel',
    title: 'Hostel',
    subtitle: 'Student or working professional dormitory',
    icon: GraduationCap
  },
  {
    id: 'coliving',
    title: 'Co-Living',
    subtitle: 'Designer private/shared suites with social spaces',
    icon: Coffee
  },
  {
    id: 'building',
    title: 'Building',
    subtitle: 'Entire residential or mixed-use building',
    icon: Building
  },
  {
    id: 'independent_floor',
    title: 'Independent Floor',
    subtitle: 'Entire dedicated builder floor in a low-rise',
    icon: Layers
  },
  {
    id: 'room',
    title: 'Single Room',
    subtitle: 'Private room, studio, or 1RK with bath',
    icon: DoorOpen
  },
  {
    id: 'commercial',
    title: 'Commercial Property',
    subtitle: 'Office space, commercial floor, or retail shop',
    icon: Briefcase
  },
  {
    id: 'other',
    title: 'Other',
    subtitle: 'Student housing, service apartments, or custom stay',
    icon: PlusCircle
  }
];

interface StepPropertyTypeProps {
  selectedType: PropertyType | null;
  customPropertyType: string;
  onSelectType: (type: PropertyType) => void;
  onChangeCustomType: (val: string) => void;
  onContinue: () => void;
}

export default function StepPropertyType({
  selectedType,
  customPropertyType,
  onSelectType,
  onChangeCustomType,
  onContinue
}: StepPropertyTypeProps) {
  const isOtherSelected = selectedType === 'other';
  const canProceed =
    selectedType !== null &&
    (!isOtherSelected || (isOtherSelected && customPropertyType.trim().length > 0));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* SECTION HEADING */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
          What are you listing?
        </h2>
        <p className="text-xs sm:text-sm text-[#86868B] mt-1.5">
          Select the format that best describes your property.
        </p>
      </div>

      {/* PROPERTY TYPE CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {PROPERTY_TYPES.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectType(option.id)}
              className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between ${
                isSelected
                  ? 'border-primary bg-primary/[0.03] shadow-sm ring-1 ring-primary'
                  : 'border-[#EDEDED] bg-white hover:border-[#D1D1D6] hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between w-full mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-[#F5F5F7] text-[#1D1D1F] group-hover:bg-[#E5E5EA]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-primary animate-fade-in" />
                )}
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F] tracking-tight">
                  {option.title}
                </h3>
                <p className="text-xs text-[#86868B] mt-1 leading-snug">
                  {option.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* CUSTOM "OTHER" SPECIFICATION INPUT */}
      {isOtherSelected && (
        <div className="max-w-xl mx-auto bg-white border border-[#EDEDED] rounded-2xl p-5 shadow-apple-sm animate-fade-in space-y-2">
          <label
            htmlFor="customPropertyType"
            className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wider"
          >
            Specify Property Format
          </label>
          <input
            id="customPropertyType"
            type="text"
            value={customPropertyType}
            onChange={(e) => onChangeCustomType(e.target.value)}
            placeholder="e.g. Student Housing, Service Apartment"
            className="w-full px-4 py-3 rounded-xl border border-[#EDEDED] text-xs sm:text-sm text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            autoFocus
          />
        </div>
      )}

      {/* CONTINUATION ACTION */}
      <div className="flex justify-end pt-4 border-t border-[#EDEDED]">
        <button
          type="button"
          onClick={onContinue}
          disabled={!canProceed}
          className="px-7 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
