'use client';

import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  GraduationCap,
  Heart,
  User,
  Sparkles,
  PawPrint,
  Cigarette,
  Wine,
  UserCheck,
  Plus,
  Minus,
  Check,
  AlertCircle
} from 'lucide-react';
import type { PropertyRules, ResidentSuitability, PolicyStatus } from '../../types';
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
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SUITABILITY_OPTIONS: SuitabilityOption[] = [
  {
    id: 'families',
    title: 'Families',
    description: 'Parents with children or elderly members',
    icon: Users
  },
  {
    id: 'working_professionals',
    title: 'Working Professionals',
    description: 'Corporate, salaried, or remote employees',
    icon: Briefcase
  },
  {
    id: 'bachelors',
    title: 'Bachelors',
    description: 'Single individuals or friends sharing space',
    icon: User
  },
  {
    id: 'students',
    title: 'Students',
    description: 'College, university, or coaching students',
    icon: GraduationCap
  },
  {
    id: 'couples',
    title: 'Couples',
    description: 'Married or working partners',
    icon: Heart
  },
  {
    id: 'individuals',
    title: 'Individuals',
    description: 'Solo renters seeking private accommodation',
    icon: UserCheck
  }
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

  const [petsAllowed, setPetsAllowed] = useState<boolean>(
    initialRules?.petsAllowed ?? initialRules?.petPolicy === 'allowed' ? true : false
  );

  const [smokingAllowed, setSmokingAllowed] = useState<boolean>(
    initialRules?.smokingAllowed ?? initialRules?.smokingPolicy === 'allowed' ? true : false
  );

  const [alcoholAllowed, setAlcoholAllowed] = useState<boolean>(
    initialRules?.alcoholAllowed ?? initialRules?.alcoholPolicy === 'allowed' ? true : false
  );

  const [guestPolicy, setGuestPolicy] = useState<PolicyStatus>(() => {
    if (initialRules?.guestPolicy) return initialRules.guestPolicy;
    if (initialRules?.visitorsAllowed !== undefined) {
      return initialRules.visitorsAllowed ? 'allowed' : 'not_allowed';
    }
    return 'allowed';
  });

  const [maxOccupants, setMaxOccupants] = useState<number>(() => {
    if (initialRules?.maxOccupants && initialRules.maxOccupants > 0) {
      return initialRules.maxOccupants;
    }
    return 4;
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAllSelected = suitableFor.length === SUITABILITY_OPTIONS.length;

  const handleToggleSuitability = (id: ResidentSuitability) => {
    setErrorMsg(null);
    setSuitableFor((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          setErrorMsg('Please select at least one tenant type.');
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
      setErrorMsg('Please choose who can stay at your property.');
      return;
    }

    const payload: PropertyRules = sanitizePropertyRules({
      ...(initialRules || {}),
      suitableFor,
      genderPreference,
      maxOccupants,
      petsAllowed,
      petPolicy: petsAllowed ? 'allowed' : 'not_allowed',
      smokingAllowed,
      smokingPolicy: smokingAllowed ? 'allowed' : 'not_allowed',
      alcoholAllowed,
      alcoholPolicy: alcoholAllowed ? 'allowed' : 'not_allowed',
      visitorsAllowed: guestPolicy === 'allowed' || guestPolicy === 'with_restrictions',
      guestPolicy,
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
      className="w-full max-w-2xl mx-auto py-2 space-y-10 animate-fade-in"
      noValidate
    >
      {/* SECTION HEADING (Airbnb Style) */}
      <div className="space-y-1.5">
        <h1 className="font-outfit text-2xl sm:text-[32px] font-semibold text-[#222222] tracking-tight">
          Who can stay here?
        </h1>
        <p className="font-inter text-sm sm:text-base text-[#717171]">
          Set tenant preferences and basic house guidelines so guests know if your place is right for them.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-primary flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-primary" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. WHO IS WELCOME (TENANT SUITABILITY)                                */}
      {/* ==================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
              Who is welcome?
            </h2>
            <p className="font-inter text-xs sm:text-sm text-[#717171] mt-0.5">
              Select all tenant categories you are open to hosting.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSelectAllSuitability}
            className="text-xs sm:text-sm font-semibold text-[#222222] underline underline-offset-4 hover:text-black shrink-0 ml-2"
          >
            {isAllSelected ? 'Reset' : 'Select all'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUITABILITY_OPTIONS.map((option) => {
            const isSelected = suitableFor.includes(option.id);
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleToggleSuitability(option.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all duration-150 flex items-start gap-3.5 group cursor-pointer ${
                  isSelected
                    ? 'border-[#222222] bg-[#F7F7F7] shadow-sm ring-1 ring-[#222222]'
                    : 'border-[#E5E5EA] bg-white hover:border-[#B0B0B0]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#222222] text-white'
                      : 'bg-[#F7F7F7] text-[#222222] group-hover:bg-[#EBEBEB]'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between">
                    <span className="font-inter text-sm sm:text-base font-semibold text-[#222222]">
                      {option.title}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#222222] stroke-[2.5]" />
                    )}
                  </div>
                  <p className="font-inter text-xs text-[#717171] mt-0.5 leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. GENDER PREFERENCE                                                 */}
      {/* ==================================================================== */}
      <div className="pt-6 border-t border-[#EBEBEB] space-y-4">
        <div>
          <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
            Gender preference
          </h2>
          <p className="font-inter text-xs sm:text-sm text-[#717171] mt-0.5">
            Specify if this property is reserved for a specific gender.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'any', label: 'Any gender', sub: 'No restriction' },
            { id: 'female_only', label: 'Female only', sub: 'Women only' },
            { id: 'male_only', label: 'Male only', sub: 'Men only' }
          ].map((item) => {
            const isSelected = genderPreference === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setGenderPreference(item.id as 'any' | 'male_only' | 'female_only')}
                className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#222222] bg-[#F7F7F7] shadow-sm ring-1 ring-[#222222]'
                    : 'border-[#E5E5EA] bg-white hover:border-[#B0B0B0]'
                }`}
              >
                <div className="font-inter text-sm font-semibold text-[#222222]">
                  {item.label}
                </div>
                <div className="font-inter text-[11px] sm:text-xs text-[#717171] mt-0.5">
                  {item.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. MAXIMUM OCCUPANTS (AIRBNB STEPPER)                                */}
      {/* ==================================================================== */}
      <div className="pt-6 border-t border-[#EBEBEB] flex items-center justify-between">
        <div>
          <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
            Maximum occupants
          </h2>
          <p className="font-inter text-xs sm:text-sm text-[#717171] mt-0.5">
            Total number of people allowed to stay at the same time.
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
                : 'border-[#B0B0B0] hover:border-[#222222] text-[#222222] active:scale-95'
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
                : 'border-[#B0B0B0] hover:border-[#222222] text-[#222222] active:scale-95'
            }`}
            aria-label="Increase maximum occupants"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. HOUSE RULES (AIRBNB CLEAN ROWS)                                   */}
      {/* ==================================================================== */}
      <div className="pt-6 border-t border-[#EBEBEB] space-y-5">
        <div>
          <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
            House guidelines
          </h2>
          <p className="font-inter text-xs sm:text-sm text-[#717171] mt-0.5">
            Key policies guests must follow while staying.
          </p>
        </div>

        <div className="divide-y divide-[#EBEBEB]">
          {/* PETS */}
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] flex items-center justify-center text-[#222222]">
                <PawPrint className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <div className="font-inter text-sm font-semibold text-[#222222]">
                  Pets allowed
                </div>
                <div className="font-inter text-xs text-[#717171]">
                  Are pets permitted inside the property?
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#F7F7F7] rounded-full border border-[#EBEBEB]">
              <button
                type="button"
                onClick={() => setPetsAllowed(false)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  !petsAllowed
                    ? 'bg-white text-[#222222] shadow-sm font-bold'
                    : 'text-[#717171] hover:text-[#222222]'
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => setPetsAllowed(true)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  petsAllowed
                    ? 'bg-[#222222] text-white shadow-sm font-bold'
                    : 'text-[#717171] hover:text-[#222222]'
                }`}
              >
                Yes
              </button>
            </div>
          </div>

          {/* SMOKING */}
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] flex items-center justify-center text-[#222222]">
                <Cigarette className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <div className="font-inter text-sm font-semibold text-[#222222]">
                  Smoking allowed
                </div>
                <div className="font-inter text-xs text-[#717171]">
                  Is smoking permitted on the premises?
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#F7F7F7] rounded-full border border-[#EBEBEB]">
              <button
                type="button"
                onClick={() => setSmokingAllowed(false)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  !smokingAllowed
                    ? 'bg-white text-[#222222] shadow-sm font-bold'
                    : 'text-[#717171] hover:text-[#222222]'
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => setSmokingAllowed(true)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  smokingAllowed
                    ? 'bg-[#222222] text-white shadow-sm font-bold'
                    : 'text-[#717171] hover:text-[#222222]'
                }`}
              >
                Yes
              </button>
            </div>
          </div>

          {/* ALCOHOL */}
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] flex items-center justify-center text-[#222222]">
                <Wine className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <div className="font-inter text-sm font-semibold text-[#222222]">
                  Alcohol allowed
                </div>
                <div className="font-inter text-xs text-[#717171]">
                  Is alcohol permitted on the premises?
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#F7F7F7] rounded-full border border-[#EBEBEB]">
              <button
                type="button"
                onClick={() => setAlcoholAllowed(false)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  !alcoholAllowed
                    ? 'bg-white text-[#222222] shadow-sm font-bold'
                    : 'text-[#717171] hover:text-[#222222]'
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => setAlcoholAllowed(true)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  alcoholAllowed
                    ? 'bg-[#222222] text-white shadow-sm font-bold'
                    : 'text-[#717171] hover:text-[#222222]'
                }`}
              >
                Yes
              </button>
            </div>
          </div>

          {/* VISITORS / GUESTS */}
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] flex items-center justify-center text-[#222222]">
                <Sparkles className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <div className="font-inter text-sm font-semibold text-[#222222]">
                  Outside visitors
                </div>
                <div className="font-inter text-xs text-[#717171]">
                  Can guests host visitors or overnight guests?
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#F7F7F7] rounded-full border border-[#EBEBEB]">
              <button
                type="button"
                onClick={() => setGuestPolicy('not_allowed')}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  guestPolicy === 'not_allowed'
                    ? 'bg-white text-[#222222] shadow-sm font-bold'
                    : 'text-[#717171] hover:text-[#222222]'
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => setGuestPolicy('with_restrictions')}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  guestPolicy === 'with_restrictions'
                    ? 'bg-white text-[#222222] shadow-sm font-bold'
                    : 'text-[#717171] hover:text-[#222222]'
                }`}
              >
                Day only
              </button>
              <button
                type="button"
                onClick={() => setGuestPolicy('allowed')}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  guestPolicy === 'allowed'
                    ? 'bg-[#222222] text-white shadow-sm font-bold'
                    : 'text-[#717171] hover:text-[#222222]'
                }`}
              >
                Allowed
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
