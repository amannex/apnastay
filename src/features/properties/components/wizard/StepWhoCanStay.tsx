'use client';

import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  User,
  GraduationCap,
  Heart,
  UserCheck,
  Plus,
  Minus,
  AlertCircle
} from 'lucide-react';
import type { PropertyRules, ResidentSuitability } from '../../types';
import { sanitizePropertyRules } from '../../rules';

export interface StepWhoCanStayProps {
  propertyId: string;
  initialRules?: PropertyRules | null;
  onBack: () => void;
  onSave: (rules: PropertyRules) => Promise<void> | void;
  isSaving?: boolean;
}

interface SuitabilityOption {
  id: ResidentSuitability;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SUITABILITY_OPTIONS: SuitabilityOption[] = [
  { id: 'families', title: 'Families', icon: Users },
  { id: 'working_professionals', title: 'Working Professionals', icon: Briefcase },
  { id: 'bachelors', title: 'Bachelors', icon: User },
  { id: 'students', title: 'Students', icon: GraduationCap },
  { id: 'couples', title: 'Couples', icon: Heart },
  { id: 'individuals', title: 'Individuals', icon: UserCheck }
];

export default function StepWhoCanStay({
  initialRules,
  onSave,
}: StepWhoCanStayProps) {
  const [suitableFor, setSuitableFor] = useState<ResidentSuitability[]>(() => {
    if (initialRules?.suitableFor && initialRules.suitableFor.length > 0) {
      return initialRules.suitableFor;
    }
    return ['families', 'working_professionals', 'couples', 'individuals'];
  });

  const [genderPreference, setGenderPreference] = useState<'any' | 'male_only' | 'female_only'>(
    initialRules?.genderPreference || 'any'
  );

  const [maxOccupants, setMaxOccupants] = useState<number>(() => {
    if (initialRules?.maxOccupants && initialRules.maxOccupants > 0) {
      return initialRules.maxOccupants;
    }
    return 4;
  });

  // Age requirements state
  const [ageRequirementType, setAgeRequirementType] = useState<'none' | 'min_age' | 'max_age'>(() => {
    if (initialRules?.ageRequirementType) {
      if (initialRules.ageRequirementType === 'range') return 'min_age';
      return initialRules.ageRequirementType;
    }
    if (initialRules?.minAge && initialRules.minAge > 0) return 'min_age';
    if (initialRules?.maxAge && initialRules.maxAge > 0) return 'max_age';
    return 'none';
  });

  const [minAge, setMinAge] = useState<number>(() => {
    if (initialRules?.minAge && initialRules.minAge > 0) {
      return initialRules.minAge;
    }
    return 18;
  });

  const [maxAge, setMaxAge] = useState<number>(() => {
    if (initialRules?.maxAge && initialRules.maxAge > 0) {
      return initialRules.maxAge;
    }
    return 35;
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAllSelected = suitableFor.length === SUITABILITY_OPTIONS.length;

  const handleToggleSuitability = (id: ResidentSuitability) => {
    setErrorMsg(null);
    setSuitableFor((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          setErrorMsg('Please select at least one tenant category.');
          return prev;
        }
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllSuitability = () => {
    setErrorMsg(null);
    if (isAllSelected) {
      setSuitableFor(['working_professionals', 'families']);
    } else {
      setSuitableFor(SUITABILITY_OPTIONS.map((opt) => opt.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suitableFor.length === 0) {
      setErrorMsg('Please select who can stay at your property.');
      return;
    }

    const payload: PropertyRules = sanitizePropertyRules({
      ...(initialRules || {}),
      suitableFor,
      genderPreference,
      maxOccupants,
      ageRequirementType,
      minAge: ageRequirementType === 'min_age' ? minAge : undefined,
      maxAge: ageRequirementType === 'max_age' ? maxAge : undefined,
      tenantPreference: isAllSelected
        ? 'all'
        : genderPreference === 'female_only'
        ? 'bachelors_female'
        : genderPreference === 'male_only'
        ? 'bachelors_male'
        : suitableFor.includes('families')
        ? 'family'
        : suitableFor.includes('students')
        ? 'students'
        : 'working_professionals'
    });

    onSave(payload);
  };

  return (
    <form
      id="who-can-stay-form"
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto py-2 space-y-9 animate-fade-in"
      noValidate
    >
      {/* SECTION HEADING (Airbnb Style) */}
      <div className="space-y-1">
        <h1 className="font-outfit text-2xl sm:text-[30px] font-semibold text-[#222222] tracking-tight">
          Who can stay here?
        </h1>
        <p className="font-inter text-sm sm:text-base text-[#717171] leading-normal">
          Set resident preferences and age requirements for your property.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-primary flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-primary" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. WHO IS WELCOME (TENANT SUITABILITY - AIRBNB CARD GRID)             */}
      {/* ==================================================================== */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
            Who is welcome
          </h2>

          <button
            type="button"
            onClick={handleSelectAllSuitability}
            className="text-xs sm:text-sm font-semibold text-[#222222] underline underline-offset-4 hover:text-black shrink-0 cursor-pointer"
          >
            {isAllSelected ? 'Reset' : 'Select all'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {SUITABILITY_OPTIONS.map((option) => {
            const isSelected = suitableFor.includes(option.id);
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleToggleSuitability(option.id)}
                className={`p-4 sm:p-5 rounded-2xl border text-left flex flex-col justify-between items-start min-h-[96px] sm:min-h-[108px] transition-all duration-150 select-none cursor-pointer ${
                  isSelected
                    ? 'border-2 border-[#222222] bg-white shadow-sm'
                    : 'border border-[#DDDDDD] bg-white hover:border-[#222222]'
                }`}
              >
                <div className="text-[#222222]">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5]" />
                </div>

                <span className="font-inter text-sm sm:text-base font-medium text-[#222222] leading-snug mt-3 sm:mt-4">
                  {option.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. GENDER PREFERENCE (AIRBNB CARD GRID)                              */}
      {/* ==================================================================== */}
      <div className="space-y-3.5">
        <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
          Gender preference
        </h2>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { id: 'any', label: 'Any gender', icon: Users },
            { id: 'female_only', label: 'Female only', icon: UserCheck },
            { id: 'male_only', label: 'Male only', icon: User }
          ].map((item) => {
            const isSelected = genderPreference === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setGenderPreference(item.id as 'any' | 'male_only' | 'female_only')}
                className={`p-4 sm:p-5 rounded-2xl border text-left flex flex-col justify-between items-start min-h-[96px] sm:min-h-[108px] transition-all duration-150 select-none cursor-pointer ${
                  isSelected
                    ? 'border-2 border-[#222222] bg-white shadow-sm'
                    : 'border border-[#DDDDDD] bg-white hover:border-[#222222]'
                }`}
              >
                <div className="text-[#222222]">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5]" />
                </div>
                <span className="font-inter text-sm sm:text-base font-medium text-[#222222] leading-snug mt-3 sm:mt-4">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. MAXIMUM OCCUPANTS (AIRBNB STEPPER)                                */}
      {/* ==================================================================== */}
      <div className="flex items-center justify-between py-1">
        <div>
          <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
            Maximum occupants
          </h2>
          <p className="font-inter text-xs sm:text-sm text-[#717171] mt-0.5">
            Total people allowed to stay simultaneously
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMaxOccupants((prev) => Math.max(1, prev - 1))}
            disabled={maxOccupants <= 1}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
              maxOccupants <= 1
                ? 'border-[#E5E5EA] text-[#D1D1D6] cursor-not-allowed'
                : 'border-[#B0B0B0] hover:border-[#222222] text-[#222222] active:scale-95 cursor-pointer'
            }`}
            aria-label="Decrease maximum occupants"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="font-inter text-base font-semibold text-[#222222] min-w-[24px] text-center">
            {maxOccupants}
          </span>

          <button
            type="button"
            onClick={() => setMaxOccupants((prev) => Math.min(30, prev + 1))}
            disabled={maxOccupants >= 30}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
              maxOccupants >= 30
                ? 'border-[#E5E5EA] text-[#D1D1D6] cursor-not-allowed'
                : 'border-[#B0B0B0] hover:border-[#222222] text-[#222222] active:scale-95 cursor-pointer'
            }`}
            aria-label="Increase maximum occupants"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. AGE REQUIREMENTS (CLEAN AIRBNB SELECTION)                         */}
      {/* ==================================================================== */}
      <div className="space-y-4">
        <div>
          <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
            Age requirements
          </h2>
          <p className="font-inter text-xs sm:text-sm text-[#717171] mt-0.5">
            Set age criteria for tenants residing at your property
          </p>
        </div>

        <div className="space-y-3 pt-0.5">
          {/* OPTION 1: NO SPECIFIC REQUIREMENT */}
          <div
            onClick={() => {
              setAgeRequirementType('none');
              setErrorMsg(null);
            }}
            className="flex items-center gap-3.5 cursor-pointer py-1.5 select-none group"
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                ageRequirementType === 'none'
                  ? 'border-[#222222]'
                  : 'border-[#B0B0B0] group-hover:border-[#222222]'
              }`}
            >
              {ageRequirementType === 'none' && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#222222]" />
              )}
            </div>

            <span className="font-inter text-sm sm:text-base font-normal text-[#222222]">
              No specific requirement
            </span>
          </div>

          {/* OPTION 2: MINIMUM AGE */}
          <div
            onClick={() => {
              setAgeRequirementType('min_age');
              setErrorMsg(null);
            }}
            className="flex items-center justify-between py-1.5 cursor-pointer select-none group"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  ageRequirementType === 'min_age'
                    ? 'border-[#222222]'
                    : 'border-[#B0B0B0] group-hover:border-[#222222]'
                }`}
              >
                {ageRequirementType === 'min_age' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#222222]" />
                )}
              </div>

              <span className="font-inter text-sm sm:text-base font-normal text-[#222222]">
                Minimum age:
              </span>
            </div>

            <div
              className="flex items-center gap-3 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setAgeRequirementType('min_age');
                  setErrorMsg(null);
                  setMinAge((prev) => Math.max(0, prev - 1));
                }}
                disabled={ageRequirementType !== 'min_age' || minAge <= 0}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  ageRequirementType !== 'min_age' || minAge <= 0
                    ? 'border-[#E5E5EA] text-[#D1D1D6] cursor-not-allowed'
                    : 'border-[#B0B0B0] hover:border-[#222222] text-[#222222] active:scale-95 cursor-pointer'
                }`}
                aria-label="Decrease minimum age"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span
                className={`font-inter text-sm sm:text-base font-semibold min-w-[55px] text-center ${
                  ageRequirementType === 'min_age' ? 'text-[#222222]' : 'text-[#A0A0A0]'
                }`}
              >
                {minAge} years
              </span>

              <button
                type="button"
                onClick={() => {
                  setAgeRequirementType('min_age');
                  setErrorMsg(null);
                  setMinAge((prev) => Math.min(100, prev + 1));
                }}
                disabled={ageRequirementType !== 'min_age' || minAge >= 100}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  ageRequirementType !== 'min_age' || minAge >= 100
                    ? 'border-[#E5E5EA] text-[#D1D1D6] cursor-not-allowed'
                    : 'border-[#B0B0B0] hover:border-[#222222] text-[#222222] active:scale-95 cursor-pointer'
                }`}
                aria-label="Increase minimum age"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* OPTION 3: MAXIMUM AGE */}
          <div
            onClick={() => {
              setAgeRequirementType('max_age');
              setErrorMsg(null);
            }}
            className="flex items-center justify-between py-1.5 cursor-pointer select-none group"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  ageRequirementType === 'max_age'
                    ? 'border-[#222222]'
                    : 'border-[#B0B0B0] group-hover:border-[#222222]'
                }`}
              >
                {ageRequirementType === 'max_age' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#222222]" />
                )}
              </div>

              <span className="font-inter text-sm sm:text-base font-normal text-[#222222]">
                Maximum age:
              </span>
            </div>

            <div
              className="flex items-center gap-3 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setAgeRequirementType('max_age');
                  setErrorMsg(null);
                  setMaxAge((prev) => Math.max(1, prev - 1));
                }}
                disabled={ageRequirementType !== 'max_age' || maxAge <= 1}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  ageRequirementType !== 'max_age' || maxAge <= 1
                    ? 'border-[#E5E5EA] text-[#D1D1D6] cursor-not-allowed'
                    : 'border-[#B0B0B0] hover:border-[#222222] text-[#222222] active:scale-95 cursor-pointer'
                }`}
                aria-label="Decrease maximum age"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span
                className={`font-inter text-sm sm:text-base font-semibold min-w-[55px] text-center ${
                  ageRequirementType === 'max_age' ? 'text-[#222222]' : 'text-[#A0A0A0]'
                }`}
              >
                {maxAge} years
              </span>

              <button
                type="button"
                onClick={() => {
                  setAgeRequirementType('max_age');
                  setErrorMsg(null);
                  setMaxAge((prev) => Math.min(100, prev + 1));
                }}
                disabled={ageRequirementType !== 'max_age' || maxAge >= 100}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  ageRequirementType !== 'max_age' || maxAge >= 100
                    ? 'border-[#E5E5EA] text-[#D1D1D6] cursor-not-allowed'
                    : 'border-[#B0B0B0] hover:border-[#222222] text-[#222222] active:scale-95 cursor-pointer'
                }`}
                aria-label="Increase maximum age"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
