'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  UserCheck,
  PawPrint,
  Cigarette,
  Wine,
  Clock,
  Utensils,
  FileCheck2,
  ListPlus,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2
} from 'lucide-react';
import type {
  Property,
  PropertyRules,
  PolicyStatus,
  ResidentSuitability,
  FoodIncludedPolicy,
  KitchenAccessPolicy,
  CookingAllowedPolicy,
  TimingRestrictionType
} from '../../types';
import {
  getRulesConfigForProperty,
  formatResidentSuitability,
  validateCustomRule,
  validatePropertyRules,
  sanitizeRuleText
} from '../../rules';

interface StepRulesProps {
  property: Property;
  onBack: () => void;
  onSave: (rules: PropertyRules) => Promise<void> | void;
  isSaving?: boolean;
}

const SUITABILITY_OPTIONS: { id: ResidentSuitability; label: string; iconLabel: string }[] = [
  { id: 'working_professionals', label: 'Working Professionals', iconLabel: '💼' },
  { id: 'students', label: 'Students', iconLabel: '🎓' },
  { id: 'families', label: 'Families', iconLabel: '👨‍👩‍👧‍👦' },
  { id: 'couples', label: 'Couples', iconLabel: '👫' },
  { id: 'individuals', label: 'Individuals', iconLabel: '👤' },
  { id: 'bachelors', label: 'Bachelors', iconLabel: '👥' },
];

export default function StepRules({
  property,
  onBack,
  onSave,
  isSaving = false
}: StepRulesProps) {
  const initialRules = property.rules || {};
  const config = useMemo(
    () => getRulesConfigForProperty(property.propertyType, property.rentalStructure),
    [property.propertyType, property.rentalStructure]
  );

  // 1. Occupancy & Residents State
  const [maxOccupants, setMaxOccupants] = useState<number | ''>(
    initialRules.maxOccupants !== undefined ? initialRules.maxOccupants : ''
  );
  const [suitableFor, setSuitableFor] = useState<ResidentSuitability[]>(
    initialRules.suitableFor && initialRules.suitableFor.length > 0
      ? initialRules.suitableFor
      : config.defaultSuitability || ['individuals', 'working_professionals']
  );
  const [genderPreference, setGenderPreference] = useState<'any' | 'male_only' | 'female_only'>(
    initialRules.genderPreference || 'any'
  );

  // 2. Guest Policy State
  const [guestPolicy, setGuestPolicy] = useState<PolicyStatus>(
    initialRules.guestPolicy ||
      (initialRules.visitorsAllowed !== undefined
        ? initialRules.visitorsAllowed
          ? 'allowed'
          : 'not_allowed'
        : config.archetype === 'pg_hostel'
        ? 'with_restrictions'
        : 'allowed')
  );
  const [guestRestrictions, setGuestRestrictions] = useState<string>(
    initialRules.guestRestrictions || ''
  );

  // 3. Pet Policy State
  const [petPolicy, setPetPolicy] = useState<PolicyStatus>(
    initialRules.petPolicy ||
      (initialRules.petsAllowed !== undefined
        ? initialRules.petsAllowed
          ? 'allowed'
          : 'not_allowed'
        : 'with_restrictions')
  );
  const [petRestrictions, setPetRestrictions] = useState<string>(
    initialRules.petRestrictions || ''
  );

  // 4. Smoking & Alcohol State
  const [smokingPolicy, setSmokingPolicy] = useState<PolicyStatus>(
    initialRules.smokingPolicy ||
      (initialRules.smokingAllowed !== undefined
        ? initialRules.smokingAllowed
          ? 'allowed'
          : 'not_allowed'
        : 'not_allowed')
  );
  const [smokingRestrictions, setSmokingRestrictions] = useState<string>(
    initialRules.smokingRestrictions || ''
  );
  const [alcoholPolicy, setAlcoholPolicy] = useState<PolicyStatus>(
    initialRules.alcoholPolicy ||
      (initialRules.alcoholAllowed !== undefined
        ? initialRules.alcoholAllowed
          ? 'allowed'
          : 'not_allowed'
        : 'with_restrictions')
  );
  const [alcoholRestrictions, setAlcoholRestrictions] = useState<string>(
    initialRules.alcoholRestrictions || ''
  );

  // 5. Timing & Access State
  const [timingType, setTimingType] = useState<TimingRestrictionType>(
    initialRules.timingType || (config.archetype === 'pg_hostel' ? 'gate_closing' : 'open_24_7')
  );
  const [gateClosingTime, setGateClosingTime] = useState<string>(
    initialRules.gateClosingTime || config.defaultGateTime || '22:30'
  );
  const [quietHoursStart, setQuietHoursStart] = useState<string>(
    initialRules.quietHoursStart || '22:00'
  );
  const [quietHoursEnd, setQuietHoursEnd] = useState<string>(
    initialRules.quietHoursEnd || '07:00'
  );
  const [timingNotes, setTimingNotes] = useState<string>(initialRules.timingNotes || '');

  // 6. Food & Kitchen State
  const [foodPolicy, setFoodPolicy] = useState<FoodIncludedPolicy>(
    initialRules.foodPolicy || (config.archetype === 'pg_hostel' ? 'all_meals' : 'not_specified')
  );
  const [kitchenAccess, setKitchenAccess] = useState<KitchenAccessPolicy>(
    initialRules.kitchenAccess ||
      (config.archetype === 'apartment_house' ? 'private' : config.archetype === 'coliving' ? 'shared' : 'not_specified')
  );
  const [cookingPolicy, setCookingPolicy] = useState<CookingAllowedPolicy>(
    initialRules.cookingPolicy || 'veg_and_nonveg'
  );
  const [foodNotes, setFoodNotes] = useState<string>(initialRules.foodNotes || '');

  // 7. Move-in & Verification State
  const [requiresIdProof, setRequiresIdProof] = useState<boolean>(
    initialRules.requiresIdProof !== undefined ? initialRules.requiresIdProof : true
  );
  const [requiresPoliceVerification, setRequiresPoliceVerification] = useState<boolean>(
    initialRules.requiresPoliceVerification !== undefined
      ? initialRules.requiresPoliceVerification
      : config.archetype === 'apartment_house' || config.archetype === 'pg_hostel'
  );
  const [requiresEmploymentOrCollegeProof, setRequiresEmploymentOrCollegeProof] = useState<boolean>(
    initialRules.requiresEmploymentOrCollegeProof !== undefined
      ? initialRules.requiresEmploymentOrCollegeProof
      : config.archetype === 'pg_hostel'
  );
  const [verificationNotes, setVerificationNotes] = useState<string>(
    initialRules.verificationNotes || ''
  );

  // 8. Custom Rules & Additional Notes State
  const [customRules, setCustomRules] = useState<string[]>(
    initialRules.customRules && initialRules.customRules.length > 0
      ? initialRules.customRules
      : config.suggestedRules.slice(0, 2)
  );
  const [newRuleInput, setNewRuleInput] = useState<string>('');
  const [newRuleError, setNewRuleError] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState<string>(
    initialRules.additionalNotes || ''
  );

  // UI accordion toggles
  const [showAllSections, setShowAllSections] = useState<boolean>(true);
  const [errors, setErrors] = useState<string[]>([]);

  // Toggle suitability badge
  const handleToggleSuitability = (id: ResidentSuitability) => {
    setSuitableFor((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Add custom rule
  const handleAddCustomRule = () => {
    const trimmed = sanitizeRuleText(newRuleInput, 200);
    const val = validateCustomRule(trimmed);
    if (!val.valid) {
      setNewRuleError(val.error || 'Invalid rule');
      return;
    }
    if (customRules.includes(trimmed)) {
      setNewRuleError('This rule is already added.');
      return;
    }
    setCustomRules((prev) => [...prev, trimmed]);
    setNewRuleInput('');
    setNewRuleError(null);
  };

  const handleRemoveCustomRule = (idx: number) => {
    setCustomRules((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddSuggestedRule = (ruleText: string) => {
    if (!customRules.includes(ruleText)) {
      setCustomRules((prev) => [...prev, ruleText]);
    }
  };

  // Submit & Save
  const handleSaveAndContinue = async () => {
    setErrors([]);

    const payload: PropertyRules = {
      maxOccupants: typeof maxOccupants === 'number' && maxOccupants > 0 ? maxOccupants : undefined,
      suitableFor,
      genderPreference,

      guestPolicy,
      guestRestrictions: guestRestrictions.trim() || undefined,

      petPolicy,
      petRestrictions: petRestrictions.trim() || undefined,

      smokingPolicy,
      smokingRestrictions: smokingRestrictions.trim() || undefined,

      alcoholPolicy,
      alcoholRestrictions: alcoholRestrictions.trim() || undefined,

      timingType,
      gateClosingTime: timingType === 'gate_closing' || timingType === 'curfew' ? gateClosingTime : undefined,
      quietHoursStart: quietHoursStart.trim() || undefined,
      quietHoursEnd: quietHoursEnd.trim() || undefined,
      timingNotes: timingNotes.trim() || undefined,

      foodPolicy,
      kitchenAccess,
      cookingPolicy,
      foodNotes: foodNotes.trim() || undefined,

      requiresIdProof,
      requiresPoliceVerification,
      requiresEmploymentOrCollegeProof,
      verificationNotes: verificationNotes.trim() || undefined,

      customRules: customRules.filter(Boolean),
      additionalNotes: additionalNotes.trim() || undefined,

      // Synchronize legacy flags
      smokingAllowed: smokingPolicy === 'allowed',
      alcoholAllowed: alcoholPolicy === 'allowed',
      petsAllowed: petPolicy === 'allowed',
      visitorsAllowed: guestPolicy === 'allowed' || guestPolicy === 'with_restrictions'
    };

    const validation = validatePropertyRules(payload);
    if (!validation.valid) {
      setErrors(validation.errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    await onSave(payload);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER SECTION */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1D1D1F] tracking-tight">
              House Rules & Tenant Suitability
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#86868B] mt-1.5 leading-relaxed max-w-2xl">
          Set clear, transparent guidelines to ensure guests and tenants know what to expect and whether this property matches their lifestyle.
        </p>
      </div>

      {/* ERROR SUMMARY BANNER */}
      {errors.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold space-y-1">
          <div className="flex items-center gap-2 text-rose-900 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Please review the following rules errors:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-rose-700 pl-2">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. OCCUPANCY & RESIDENT SUITABILITY */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#EDEDED]">
          <Users className="w-5 h-5 text-[#1D1D1F]" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
              Occupancy & Resident Suitability
            </h3>
            <p className="text-xs text-[#86868B]">
              Define maximum residents and preferred tenant profiles.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Maximum Occupants */}
          <div>
            <label className="block text-xs font-bold text-[#1D1D1F] mb-1.5">
              Maximum Total Occupants (Optional)
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={maxOccupants}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value, 10) : '';
                setMaxOccupants(val);
              }}
              placeholder="e.g. 4"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-bold text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
            />
            <span className="text-[11px] text-[#86868B] mt-1 block">
              Leave blank if determined automatically by individual units or rooms.
            </span>
          </div>

          {/* Gender Preference */}
          <div>
            <label className="block text-xs font-bold text-[#1D1D1F] mb-1.5">
              Gender Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'any', label: 'All Welcome' },
                { id: 'male_only', label: 'Male Only' },
                { id: 'female_only', label: 'Female Only' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGenderPreference(opt.id as any)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    genderPreference === opt.id
                      ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-sm'
                      : 'bg-white text-[#1D1D1F] border-[#EDEDED] hover:bg-[#F5F5F7]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Suitable For Pills */}
        <div>
          <label className="block text-xs font-bold text-[#1D1D1F] mb-2">
            Suitable For (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {SUITABILITY_OPTIONS.map((opt) => {
              const isSelected = suitableFor.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleToggleSuitability(opt.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-primary/[0.04] border-primary text-primary shadow-sm'
                      : 'bg-white border-[#EDEDED] text-[#1D1D1F] hover:bg-[#F5F5F7]'
                  }`}
                >
                  <span>{opt.iconLabel}</span>
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. GUEST & VISITOR POLICY */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#EDEDED]">
          <UserCheck className="w-5 h-5 text-[#1D1D1F]" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
              Guest & Visitor Policy
            </h3>
            <p className="text-xs text-[#86868B]">
              Specify whether tenants may host day visitors or overnight guests.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'allowed', label: 'Guests Allowed', desc: 'No major visitor restrictions' },
            { id: 'with_restrictions', label: 'With Restrictions', desc: 'Permitted under guidelines' },
            { id: 'not_allowed', label: 'No Guests Allowed', desc: 'Strictly zero visitor entry' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setGuestPolicy(item.id as PolicyStatus)}
              className={`p-3 rounded-xl border text-left transition-all ${
                guestPolicy === item.id
                  ? 'bg-white border-[#1D1D1F] ring-1 ring-[#1D1D1F] shadow-sm'
                  : 'bg-white border-[#EDEDED] hover:bg-gray-50'
              }`}
            >
              <span className="block text-xs font-bold text-[#1D1D1F]">{item.label}</span>
              <span className="block text-[11px] text-[#86868B] mt-0.5">{item.desc}</span>
            </button>
          ))}
        </div>

        {guestPolicy === 'with_restrictions' && (
          <div>
            <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
              Guest Restrictions / Guidelines
            </label>
            <input
              type="text"
              value={guestRestrictions}
              onChange={(e) => setGuestRestrictions(e.target.value)}
              placeholder="e.g. Day visitors permitted until 9:00 PM; no overnight guests without notice."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-medium text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
            />
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 3. FOOD & KITCHEN POLICY */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#EDEDED]">
          <Utensils className="w-5 h-5 text-[#1D1D1F]" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
              Food, Meals & Kitchen
            </h3>
            <p className="text-xs text-[#86868B]">
              Specify meal provisions, kitchen access, and vegetarian/non-vegetarian preferences.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Meal Inclusions */}
          <div>
            <label className="block text-xs font-bold text-[#1D1D1F] mb-1.5">
              Meal Service
            </label>
            <select
              value={foodPolicy}
              onChange={(e) => setFoodPolicy(e.target.value as FoodIncludedPolicy)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-bold text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
            >
              <option value="not_specified">Not Specified / Self-Arranged</option>
              <option value="all_meals">All Meals Included (Breakfast, Lunch, Dinner)</option>
              <option value="breakfast_dinner">Breakfast & Dinner Included</option>
              <option value="breakfast_only">Breakfast Only Included</option>
              <option value="on_demand">Available on Demand / Paid Extra</option>
              <option value="no_meals">No Meals Provided</option>
            </select>
          </div>

          {/* Kitchen Access */}
          <div>
            <label className="block text-xs font-bold text-[#1D1D1F] mb-1.5">
              Kitchen Access
            </label>
            <select
              value={kitchenAccess}
              onChange={(e) => setKitchenAccess(e.target.value as KitchenAccessPolicy)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-bold text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
            >
              <option value="not_specified">Not Specified</option>
              <option value="private">Private Kitchen in Unit</option>
              <option value="shared">Shared Community Kitchen</option>
              <option value="not_available">No Kitchen Access</option>
            </select>
          </div>

          {/* Cooking Preferences */}
          <div>
            <label className="block text-xs font-bold text-[#1D1D1F] mb-1.5">
              Cooking Allowed
            </label>
            <select
              value={cookingPolicy}
              onChange={(e) => setCookingPolicy(e.target.value as CookingAllowedPolicy)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-bold text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
            >
              <option value="veg_and_nonveg">Veg & Non-Veg Cooking Allowed</option>
              <option value="veg_only">Strictly Vegetarian Only</option>
              <option value="not_allowed">No Cooking Allowed</option>
              <option value="not_specified">No Restrictions Specified</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
            Food Notes & Dietary Rules (Optional)
          </label>
          <input
            type="text"
            value={foodNotes}
            onChange={(e) => setFoodNotes(e.target.value)}
            placeholder="e.g. Pure veg kitchen utensils provided; outside non-veg food not allowed in common dining."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-medium text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
          />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. PETS, SMOKING & ALCOHOL POLICIES */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#EDEDED]">
          <PawPrint className="w-5 h-5 text-[#1D1D1F]" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
              Pets, Smoking & Alcohol Policies
            </h3>
            <p className="text-xs text-[#86868B]">
              Clear expectations on pets and substance rules.
            </p>
          </div>
        </div>

        {/* Pet Policy */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#1D1D1F]">
            Pet Policy
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'allowed', label: 'Pets Allowed', desc: 'Pet-friendly property' },
              { id: 'with_restrictions', label: 'With Restrictions', desc: 'Subject to approval/size' },
              { id: 'not_allowed', label: 'Pets Not Allowed', desc: 'No pets permitted' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPetPolicy(item.id as PolicyStatus)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  petPolicy === item.id
                    ? 'bg-white border-[#1D1D1F] ring-1 ring-[#1D1D1F] shadow-sm'
                    : 'bg-white border-[#EDEDED] hover:bg-gray-50'
                }`}
              >
                <span className="block text-xs font-bold text-[#1D1D1F]">{item.label}</span>
                <span className="block text-[11px] text-[#86868B]">{item.desc}</span>
              </button>
            ))}
          </div>
          {petPolicy === 'with_restrictions' && (
            <input
              type="text"
              value={petRestrictions}
              onChange={(e) => setPetRestrictions(e.target.value)}
              placeholder="e.g. Small indoor cats and dogs allowed with vaccination records."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-medium text-[#1D1D1F] outline-none focus:border-[#1D1D1F] mt-1"
            />
          )}
        </div>

        {/* Smoking Policy */}
        <div className="space-y-2 pt-2 border-t border-[#EDEDED]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D1D1F]">
            <Cigarette className="w-4 h-4 text-[#86868B]" />
            <span>Smoking Policy</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'not_allowed', label: 'No Smoking', desc: 'Strictly non-smoking zone' },
              { id: 'with_restrictions', label: 'Designated Zones', desc: 'Balcony or outdoor only' },
              { id: 'allowed', label: 'Smoking Allowed', desc: 'Permitted in premises' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSmokingPolicy(item.id as PolicyStatus)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  smokingPolicy === item.id
                    ? 'bg-white border-[#1D1D1F] ring-1 ring-[#1D1D1F] shadow-sm'
                    : 'bg-white border-[#EDEDED] hover:bg-gray-50'
                }`}
              >
                <span className="block text-xs font-bold text-[#1D1D1F]">{item.label}</span>
                <span className="block text-[11px] text-[#86868B]">{item.desc}</span>
              </button>
            ))}
          </div>
          {smokingPolicy === 'with_restrictions' && (
            <input
              type="text"
              value={smokingRestrictions}
              onChange={(e) => setSmokingRestrictions(e.target.value)}
              placeholder="e.g. Permitted only in open private balcony or designated building terrace."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-medium text-[#1D1D1F] outline-none focus:border-[#1D1D1F] mt-1"
            />
          )}
        </div>

        {/* Alcohol Policy */}
        <div className="space-y-2 pt-2 border-t border-[#EDEDED]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D1D1F]">
            <Wine className="w-4 h-4 text-[#86868B]" />
            <span>Alcohol Policy</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'allowed', label: 'Alcohol Allowed', desc: 'Responsible consumption permitted' },
              { id: 'with_restrictions', label: 'With Restrictions', desc: 'Within private rooms only' },
              { id: 'not_allowed', label: 'No Alcohol', desc: 'Strictly alcohol-free property' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAlcoholPolicy(item.id as PolicyStatus)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  alcoholPolicy === item.id
                    ? 'bg-white border-[#1D1D1F] ring-1 ring-[#1D1D1F] shadow-sm'
                    : 'bg-white border-[#EDEDED] hover:bg-gray-50'
                }`}
              >
                <span className="block text-xs font-bold text-[#1D1D1F]">{item.label}</span>
                <span className="block text-[11px] text-[#86868B]">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. TIMING, ACCESS & QUIET HOURS */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#EDEDED]">
          <Clock className="w-5 h-5 text-[#1D1D1F]" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
              Timing, Curfew & Quiet Hours
            </h3>
            <p className="text-xs text-[#86868B]">
              Configure building access schedules and neighborhood quiet hours.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1D1D1F] mb-1.5">
              Property Access Schedule
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'open_24_7', label: '24/7 Open Access' },
                { id: 'gate_closing', label: 'Gate Closing Time' },
                { id: 'curfew', label: 'Night Curfew' },
                { id: 'flexible', label: 'Flexible / Key Access' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTimingType(t.id as TimingRestrictionType)}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    timingType === t.id
                      ? 'bg-[#1D1D1F] text-white border-[#1D1D1F]'
                      : 'bg-white text-[#1D1D1F] border-[#EDEDED] hover:bg-[#F5F5F7]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {(timingType === 'gate_closing' || timingType === 'curfew') && (
            <div>
              <label className="block text-xs font-bold text-[#1D1D1F] mb-1.5">
                Gate Closing / Curfew Time
              </label>
              <input
                type="time"
                value={gateClosingTime}
                onChange={(e) => setGateClosingTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-bold text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
              />
              <span className="text-[11px] text-[#86868B] mt-1 block">
                Main entry doors or society gates locked after this time.
              </span>
            </div>
          )}
        </div>

        {/* Quiet Hours */}
        <div className="pt-2 border-t border-[#EDEDED]">
          <label className="block text-xs font-bold text-[#1D1D1F] mb-1.5">
            Quiet Hours (Optional)
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <span className="text-[11px] font-semibold text-[#86868B] block mb-1">Start Time</span>
              <input
                type="time"
                value={quietHoursStart}
                onChange={(e) => setQuietHoursStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EDEDED] bg-white text-xs font-bold text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
              />
            </div>
            <span className="text-xs text-[#86868B] pt-4">to</span>
            <div className="flex-1">
              <span className="text-[11px] font-semibold text-[#86868B] block mb-1">End Time</span>
              <input
                type="time"
                value={quietHoursEnd}
                onChange={(e) => setQuietHoursEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EDEDED] bg-white text-xs font-bold text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 6. VERIFICATION & MOVE-IN DOCUMENTS */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#EDEDED]">
          <FileCheck2 className="w-5 h-5 text-[#1D1D1F]" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
              Move-In Verification & Required Documents
            </h3>
            <p className="text-xs text-[#86868B]">
              Specify tenant documents required prior to key handover.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              checked: requiresIdProof,
              toggle: () => setRequiresIdProof(!requiresIdProof),
              title: 'Government ID Proof',
              desc: 'Aadhaar, Passport, or Voter ID mandatory'
            },
            {
              checked: requiresPoliceVerification,
              toggle: () => setRequiresPoliceVerification(!requiresPoliceVerification),
              title: 'Police Verification',
              desc: 'Required by local authority / society'
            },
            {
              checked: requiresEmploymentOrCollegeProof,
              toggle: () => setRequiresEmploymentOrCollegeProof(!requiresEmploymentOrCollegeProof),
              title: 'Employment / Student ID',
              desc: 'Company offer letter or college ID card'
            },
          ].map((doc, idx) => (
            <div
              key={idx}
              onClick={doc.toggle}
              className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                doc.checked
                  ? 'bg-primary/[0.04] border-primary text-primary shadow-sm'
                  : 'bg-white border-[#EDEDED] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={doc.checked}
                  onChange={() => {}}
                  className="w-4 h-4 rounded text-primary accent-primary pointer-events-none"
                />
                <span className="text-xs font-bold text-[#1D1D1F]">{doc.title}</span>
              </div>
              <span className="text-[11px] text-[#86868B] block pl-6">{doc.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 7. CUSTOM RULES & ADDITIONAL GUIDELINES */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F5F5F7] border border-[#EDEDED] space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#EDEDED]">
          <ListPlus className="w-5 h-5 text-[#1D1D1F]" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F]">
              House Rules & Custom Guidelines
            </h3>
            <p className="text-xs text-[#86868B]">
              Add specific house rules, society bylaws, or custom community guidelines.
            </p>
          </div>
        </div>

        {/* Suggested Quick Add Rules */}
        {config.suggestedRules && config.suggestedRules.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#1D1D1F]" />
              <span>Suggested rules for {config.archetype.replace('_', ' ')}</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {config.suggestedRules.map((ruleText, idx) => {
                const isAdded = customRules.includes(ruleText);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSuggestedRule(ruleText)}
                    disabled={isAdded}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isAdded
                        ? 'bg-[#F5F5F7] border-[#EDEDED] text-[#86868B] opacity-70 cursor-default'
                        : 'bg-white border-[#EDEDED] text-[#1D1D1F] hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {isAdded ? (
                      <Check className="w-3 h-3 text-[#1D1D1F]" />
                    ) : (
                      <Plus className="w-3 h-3 text-primary" />
                    )}
                    <span>{ruleText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Custom Rules List */}
        <div className="space-y-2 pt-2">
          {customRules.map((rule, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-white border border-[#EDEDED] text-xs font-medium text-[#1D1D1F]"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#F5F5F7] text-[#86868B] text-[11px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span>{rule}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCustomRule(idx)}
                className="text-gray-400 hover:text-rose-600 p-1 transition-colors"
                title="Remove rule"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* New Rule Input */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newRuleInput}
              onChange={(e) => {
                setNewRuleInput(e.target.value);
                if (newRuleError) setNewRuleError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomRule();
                }
              }}
              placeholder="e.g. No shoes allowed inside carpeted bedrooms"
              maxLength={200}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-medium text-[#1D1D1F] outline-none focus:border-[#1D1D1F]"
            />
            <button
              type="button"
              onClick={handleAddCustomRule}
              className="px-4 py-2.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          </div>
          {newRuleError && (
            <p className="text-[11px] font-semibold text-rose-600">{newRuleError}</p>
          )}
        </div>

        {/* General Additional Notes */}
        <div className="pt-2 border-t border-[#EDEDED]">
          <label className="block text-xs font-bold text-[#1D1D1F] mb-1">
            General Note / Message to Prospective Tenants (Optional)
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Share any special instructions, neighborhood highlights, or property expectations..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDEDED] bg-white text-xs font-medium text-[#1D1D1F] outline-none focus:border-[#1D1D1F] resize-none"
          />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* NAVIGATION CONTROLS */}
      {/* ==================================================================== */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#EDEDED]">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 transition-all shadow-apple-sm disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving Rules...</span>
            </>
          ) : (
            <>
              <span>Save & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
