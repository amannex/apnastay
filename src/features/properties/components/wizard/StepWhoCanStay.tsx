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
  Check,
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

  const [minAge, setMinAge] = useState<number | ''>(() => {
    if (initialRules?.minAge && initialRules.minAge > 0) {
      return initialRules.minAge;
    }
    return 18;
  });

  const [maxAge, setMaxAge] = useState<number | ''>(() => {
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

    if (ageRequirementType === 'min_age') {
      if (typeof minAge !== 'number' || minAge < 0 || minAge > 120) {
        setErrorMsg('Please enter a valid minimum age.');
        return;
      }
    }

    if (ageRequirementType === 'max_age') {
      if (typeof maxAge !== 'number' || maxAge < 0 || maxAge > 120) {
        setErrorMsg('Please enter a valid maximum age.');
        return;
      }
    }

    const payload: PropertyRules = sanitizePropertyRules({
      ...(initialRules || {}),
      suitableFor,
      genderPreference,
      maxOccupants,
      ageRequirementType,
      minAge: ageRequirementType === 'min_age' && typeof minAge === 'number' ? minAge : undefined,
      maxAge: ageRequirementType === 'max_age' && typeof maxAge === 'number' ? maxAge : undefined,
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
        <p className="font-inter text-sm sm:text-base text-[#717171]">
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
      {/* 1. WHO IS WELCOME (TENANT SUITABILITY - NO DESCRIPTIONS)              */}
      {/* ==================================================================== */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
            Who is welcome
          </h2>

          <button
            type="button"
            onClick={handleSelectAllSuitability}
            className="text-xs sm:text-sm font-semibold text-[#222222] underline underline-offset-4 hover:text-black shrink-0"
          >
            {isAllSelected ? 'Reset' : 'Select all'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SUITABILITY_OPTIONS.map((option) => {
            const isSelected = suitableFor.includes(option.id);
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleToggleSuitability(option.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-150 flex flex-col items-start justify-between min-h-[96px] group cursor-pointer ${
                  isSelected
                    ? 'border-[#222222] bg-[#F7F7F7] shadow-sm ring-1 ring-[#222222]'
                    : 'border-[#E5E5EA] bg-white hover:border-[#222222]'
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#222222] text-white'
                        : 'bg-[#F7F7F7] text-[#222222] group-hover:bg-[#EBEBEB]'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[1.75]" />
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-[#222222] stroke-[2.5]" />
                  )}
                </div>

                <span className="font-inter text-sm sm:text-base font-semibold text-[#222222] mt-3">
                  {option.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. GENDER PREFERENCE (NO DESCRIPTIONS)                               */}
      {/* ==================================================================== */}
      <div className="space-y-3.5">
        <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
          Gender preference
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'any', label: 'Any gender' },
            { id: 'female_only', label: 'Female only' },
            { id: 'male_only', label: 'Male only' }
          ].map((item) => {
            const isSelected = genderPreference === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setGenderPreference(item.id as 'any' | 'male_only' | 'female_only')}
                className={`py-3.5 px-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#222222] bg-[#F7F7F7] shadow-sm ring-1 ring-[#222222]'
                    : 'border-[#E5E5EA] bg-white hover:border-[#222222]'
                }`}
              >
                <span className="font-inter text-sm sm:text-base font-semibold text-[#222222]">
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
      <div className="flex items-center justify-between">
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
      {/* 4. AGE REQUIREMENTS (UNBOXED AIRBNB LIST FORMAT)                     */}
      {/* ==================================================================== */}
      <div className="space-y-3">
        <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
          Age requirements
        </h2>

        <div className="space-y-2.5 pt-1">
          {/* OPTION 1: NO SPECIFIC REQUIREMENT */}
          <div
            onClick={() => {
              setAgeRequirementType('none');
              setErrorMsg(null);
            }}
            className="flex items-center gap-3 cursor-pointer py-1.5 select-none group"
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

            <span className="font-inter text-sm sm:text-base font-medium text-[#222222]">
              No specific requirement
            </span>
          </div>

          {/* OPTION 2: MINIMUM AGE */}
          <div
            onClick={() => {
              setAgeRequirementType('min_age');
              setErrorMsg(null);
            }}
            className="flex items-center gap-3 cursor-pointer py-1.5 select-none group"
          >
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

            <span className="font-inter text-sm sm:text-base font-medium text-[#222222]">
              Minimum age:
            </span>

            <input
              type="number"
              min={0}
              max={120}
              value={minAge}
              onChange={(e) => {
                setAgeRequirementType('min_age');
                setErrorMsg(null);
                const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                setMinAge(isNaN(val as number) ? '' : val);
              }}
              onFocus={() => {
                setAgeRequirementType('min_age');
                setErrorMsg(null);
              }}
              placeholder="18"
              className="w-16 px-1.5 py-0.5 border-b-2 border-t-0 border-x-0 border-[#222222] bg-transparent text-sm sm:text-base font-semibold text-[#222222] text-center focus:border-black outline-none"
            />
          </div>

          {/* OPTION 3: MAXIMUM AGE */}
          <div
            onClick={() => {
              setAgeRequirementType('max_age');
              setErrorMsg(null);
            }}
            className="flex items-center gap-3 cursor-pointer py-1.5 select-none group"
          >
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

            <span className="font-inter text-sm sm:text-base font-medium text-[#222222]">
              Maximum age:
            </span>

            <input
              type="number"
              min={0}
              max={120}
              value={maxAge}
              onChange={(e) => {
                setAgeRequirementType('max_age');
                setErrorMsg(null);
                const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                setMaxAge(isNaN(val as number) ? '' : val);
              }}
              onFocus={() => {
                setAgeRequirementType('max_age');
                setErrorMsg(null);
              }}
              placeholder="35"
              className="w-16 px-1.5 py-0.5 border-b-2 border-t-0 border-x-0 border-[#222222] bg-transparent text-sm sm:text-base font-semibold text-[#222222] text-center focus:border-black outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
