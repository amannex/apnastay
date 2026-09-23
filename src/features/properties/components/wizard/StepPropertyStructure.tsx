'use client';

import React, { useState, useMemo } from 'react';
import {
  Home,
  Plus,
  Minus,
  Trash2,
  Edit2,
  Check,
  Info
} from 'lucide-react';
import type { PropertyType, RentalStructure, PropertyUnit } from '../../types';
import { getPropertyTemplate } from '../../templates';
import {
  getUnitTerminology,
  getAccommodationTypeOptions,
  generateIdenticalUnits
} from '../../units';
import { validatePropertyStructureUnits } from '../../validation';

export interface StepPropertyStructureProps {
  propertyId: string;
  propertyType: PropertyType;
  customPropertyType?: string;
  rentalStructure: RentalStructure;
  initialPropertyStructure?: 'single_unit' | 'multiple_units';
  initialUnits?: PropertyUnit[];
  locationSummary?: string;
  onSave: (units: PropertyUnit[], propertyStructure: 'single_unit' | 'multiple_units') => Promise<boolean | void> | void;
  onBack: () => void;
  onContinueToStep2?: () => void;
  isSaving?: boolean;
}

export default function StepPropertyStructure({
  propertyId,
  propertyType,
  customPropertyType,
  rentalStructure,
  initialPropertyStructure,
  initialUnits = [],
  locationSummary,
  onSave,
  onBack,
  onContinueToStep2,
  isSaving = false
}: StepPropertyStructureProps) {
  // Determine structure: if rentalStructure === 'multiple_units', default to multiple_units
  const isMultipleUnitsModel =
    rentalStructure === 'multiple_units' || initialPropertyStructure === 'multiple_units';
  const propertyStructure: 'single_unit' | 'multiple_units' = isMultipleUnitsModel
    ? 'multiple_units'
    : 'single_unit';

  const template = useMemo(() => getPropertyTemplate(propertyType), [propertyType]);
  const terminology = useMemo(
    () => getUnitTerminology(propertyType, rentalStructure),
    [propertyType, rentalStructure]
  );
  const typeOptions = useMemo(
    () => getAccommodationTypeOptions(propertyType, rentalStructure),
    [propertyType, rentalStructure]
  );

  const defaultOption = typeOptions[0] || {
    value: 'Standard unit',
    label: 'Standard unit',
    defaultCapacity: 1
  };

  // --------------------------------------------------------------------------
  // State: Single Unit Mode
  // --------------------------------------------------------------------------
  const [singleUnitType, setSingleUnitType] = useState<string>(() => {
    if (initialUnits.length > 0 && initialUnits[0].unitType) {
      return initialUnits[0].unitType;
    }
    return defaultOption.value;
  });

  const [singleCapacity, setSingleCapacity] = useState<number>(() => {
    if (initialUnits.length > 0 && initialUnits[0].capacity) {
      return initialUnits[0].capacity;
    }
    return defaultOption.defaultCapacity;
  });

  const [singleUnitName, setSingleUnitName] = useState<string>(() => {
    if (initialUnits.length > 0 && initialUnits[0].nameOrNumber) {
      return initialUnits[0].nameOrNumber;
    }
    if (rentalStructure === 'entire_property') return 'Entire Property';
    if (rentalStructure === 'individual_bed') return 'Bed Space 1';
    return `${terminology.singular} 1`;
  });

  // --------------------------------------------------------------------------
  // State: Multiple Units Mode
  // --------------------------------------------------------------------------
  const [isIdenticalConfig, setIsIdenticalConfig] = useState<boolean>(() => {
    // If existing units differ in type or capacity, default to non-identical
    if (initialUnits.length > 1) {
      const firstType = initialUnits[0].unitType;
      const firstCap = initialUnits[0].capacity;
      const allSame = initialUnits.every(
        (u) => u.unitType === firstType && u.capacity === firstCap
      );
      return allSame;
    }
    return true;
  });

  const [identicalCount, setIdenticalCount] = useState<number>(() => {
    if (initialUnits.length > 1) return initialUnits.length;
    return 4;
  });

  const [identicalType, setIdenticalType] = useState<string>(() => {
    if (initialUnits.length > 0 && initialUnits[0].unitType) {
      return initialUnits[0].unitType;
    }
    return typeOptions[1]?.value || defaultOption.value;
  });

  const [identicalCapacity, setIdenticalCapacity] = useState<number>(() => {
    if (initialUnits.length > 0 && initialUnits[0].capacity) {
      return initialUnits[0].capacity;
    }
    return typeOptions[1]?.defaultCapacity || defaultOption.defaultCapacity;
  });

  const [identicalPrefix, setIdenticalPrefix] = useState<string>(() => {
    if (propertyType === 'pg' || propertyType === 'hostel') return 'Room';
    if (propertyType === 'apartment') return 'Flat';
    return terminology.singular || 'Unit';
  });

  // Non-identical custom units list
  const [customUnits, setCustomUnits] = useState<PropertyUnit[]>(() => {
    if (initialUnits.length > 0) return initialUnits;
    return generateIdenticalUnits(
      4,
      propertyType === 'pg' || propertyType === 'hostel' ? 'Room' : terminology.singular || 'Unit',
      typeOptions[1]?.value || defaultOption.value,
      typeOptions[1]?.defaultCapacity || defaultOption.defaultCapacity,
      propertyId
    );
  });

  // Modal / Inline Add/Edit Unit form state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formType, setFormType] = useState<string>(defaultOption.value);
  const [formCapacity, setFormCapacity] = useState<number>(defaultOption.defaultCapacity);

  const [activeTab, setActiveTab] = useState<'details' | 'rules'>('details');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync capacity when user switches accommodation type
  const handleSelectSingleType = (val: string) => {
    setSingleUnitType(val);
    const matched = typeOptions.find((o) => o.value === val);
    if (matched) {
      setSingleCapacity(matched.defaultCapacity);
    }
  };

  const handleSelectIdenticalType = (val: string) => {
    setIdenticalType(val);
    const matched = typeOptions.find((o) => o.value === val);
    if (matched) {
      setIdenticalCapacity(matched.defaultCapacity);
    }
  };

  // Preview units for identical configuration
  const identicalPreviewUnits = useMemo(() => {
    return generateIdenticalUnits(
      identicalCount,
      identicalPrefix,
      identicalType,
      identicalCapacity,
      propertyId
    );
  }, [identicalCount, identicalPrefix, identicalType, identicalCapacity, propertyId]);

  // Handle Edit unit in custom list
  const handleOpenEdit = (unit: PropertyUnit) => {
    setEditingUnitId(unit.id);
    setFormName(unit.nameOrNumber);
    setFormType(unit.unitType || defaultOption.value);
    setFormCapacity(unit.capacity);
    setIsFormModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingUnitId(null);
    const nextNum = customUnits.length + 1;
    const prefix = propertyType === 'pg' || propertyType === 'hostel' ? 'Room' : terminology.singular;
    setFormName(`${prefix} ${100 + nextNum}`);
    setFormType(defaultOption.value);
    setFormCapacity(defaultOption.defaultCapacity);
    setIsFormModalOpen(true);
  };

  const handleSaveFormUnit = () => {
    if (!formName.trim()) {
      return;
    }

    if (editingUnitId) {
      setCustomUnits((prev) =>
        prev.map((u) =>
          u.id === editingUnitId
            ? {
                ...u,
                nameOrNumber: formName.trim(),
                unitType: formType,
                capacity: formCapacity,
                occupancyModel: formCapacity === 1 ? 'private' : 'shared',
                updatedAt: new Date().toISOString()
              }
            : u
        )
      );
    } else {
      const newUnit: PropertyUnit = {
        id: `unit_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        propertyId,
        nameOrNumber: formName.trim(),
        unitType: formType,
        capacity: formCapacity,
        occupancyModel: formCapacity === 1 ? 'private' : 'shared',
        pricing: { monthlyRent: 0 },
        availability: 'available',
        status: 'available',
        beds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCustomUnits((prev) => [...prev, newUnit]);
    }

    setIsFormModalOpen(false);
  };

  const handleDeleteCustomUnit = (id: string) => {
    if (customUnits.length <= 1) {
      setValidationError('You must have at least one room or unit.');
      return;
    }
    setCustomUnits((prev) => prev.filter((u) => u.id !== id));
    setValidationError(null);
  };

  // Compile final units to save
  const resolveUnitsToSave = (): PropertyUnit[] => {
    if (!isMultipleUnitsModel) {
      return [
        {
          id: initialUnits[0]?.id || `unit_${Date.now().toString(36)}`,
          propertyId,
          nameOrNumber: singleUnitName.trim() || 'Main Unit',
          unitType: singleUnitType,
          capacity: singleCapacity,
          occupancyModel: singleCapacity === 1 ? 'private' : 'entire',
          pricing: initialUnits[0]?.pricing || { monthlyRent: 0 },
          availability: 'available',
          status: 'available',
          beds: [],
          createdAt: initialUnits[0]?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }

    if (isIdenticalConfig) {
      return identicalPreviewUnits;
    }

    return customUnits;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);

    const unitsToSave = resolveUnitsToSave();
    const validation = validatePropertyStructureUnits(unitsToSave);

    if (!validation.isValid) {
      setValidationError(validation.error || 'Please review your accommodation units.');
      return;
    }

    try {
      await onSave(validation.sanitizedUnits || unitsToSave, propertyStructure);
      if (onContinueToStep2) {
        onContinueToStep2();
      }
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save accommodation structure.');
    }
  };

  // --------------------------------------------------------------------------
  // MAIN SUBSTEP 5 FORM VIEW
  // --------------------------------------------------------------------------
  return (
    <div className="w-full max-w-3xl mx-auto py-2 sm:py-6 px-4 animate-fade-in">
      {/* SECTION HEADER */}
      <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-2">
        <h1 className="text-2xl sm:text-[32px] font-semibold text-[#1D1D1F] tracking-tight leading-tight">
          Tell us about the rooms or units
        </h1>
        <p className="text-sm sm:text-base text-[#717171] font-normal leading-relaxed">
          Add the basic accommodation structure so we can understand what tenants can rent.
        </p>
      </div>

      {/* ERROR ALERT */}
      {validationError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200/80 text-red-800 text-sm flex items-start gap-3">
          <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="font-medium">{validationError}</div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* A. SINGLE UNIT CONFIGURATION                                         */}
      {/* ==================================================================== */}
      {!isMultipleUnitsModel && (
        <div className="bg-white rounded-3xl border border-[#E5E5EA] p-6 sm:p-8 shadow-apple-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#F2F2F7] pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F]">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#1D1D1F]">
                Single Accommodation Configuration
              </h2>
              <p className="text-xs text-[#717171]">
                This property is offered as a single rentable space ({rentalStructure.replace(/_/g, ' ')}).
              </p>
            </div>
          </div>

          {/* Unit Identifier */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider">
              Unit / Space Name (Optional)
            </label>
            <input
              type="text"
              value={singleUnitName}
              onChange={(e) => setSingleUnitName(e.target.value)}
              placeholder="e.g. Main Unit, Flat 101, Master Suite"
              className="w-full px-4 py-3 rounded-xl border border-[#E5E5EA] focus:border-black focus:ring-1 focus:ring-black outline-none text-sm text-[#1D1D1F] transition-colors"
            />
          </div>

          {/* Accommodation Type */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider">
              Accommodation Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {typeOptions.map((opt) => {
                const isSelected = singleUnitType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectSingleType(opt.value)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-black bg-[#F8F8FA] ring-1 ring-black'
                        : 'border-[#E5E5EA] hover:border-[#D1D1D6] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[#1D1D1F]">{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-black" />}
                    </div>
                    {opt.description && (
                      <p className="text-xs text-[#717171] mt-1">{opt.description}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capacity Stepper */}
          <div className="pt-2 border-t border-[#F2F2F7] flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm sm:text-base text-[#1D1D1F]">
                Guest / Tenant Capacity
              </div>
              <p className="text-xs text-[#717171]">
                Maximum number of people who can stay in this unit
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSingleCapacity((prev) => Math.max(1, prev - 1))}
                disabled={singleCapacity <= 1}
                className="w-9 h-9 rounded-full border border-[#D1D1D6] flex items-center justify-center text-[#1D1D1F] hover:border-black disabled:opacity-30 disabled:hover:border-[#D1D1D6] transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold text-base text-[#1D1D1F]">
                {singleCapacity}
              </span>
              <button
                type="button"
                onClick={() => setSingleCapacity((prev) => Math.min(30, prev + 1))}
                className="w-9 h-9 rounded-full border border-[#D1D1D6] flex items-center justify-center text-[#1D1D1F] hover:border-black transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* B. MULTIPLE UNITS CONFIGURATION                                      */}
      {/* ==================================================================== */}
      {isMultipleUnitsModel && (
        <div className="space-y-6">
          {/* Identical Configuration Question Card */}
          <div className="bg-white rounded-3xl border border-[#E5E5EA] p-5 sm:p-6 shadow-apple-sm">
            <div className="text-sm font-semibold text-[#1D1D1F] mb-1">
              Do these units have the same configuration?
            </div>
            <p className="text-xs text-[#717171] mb-4">
              If your rooms or units share the same sharing type and capacity, you can generate them together.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsIdenticalConfig(true)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isIdenticalConfig
                    ? 'border-black bg-[#F8F8FA] ring-1 ring-black'
                    : 'border-[#E5E5EA] hover:border-[#D1D1D6] bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-[#1D1D1F]">
                    Yes, same configuration
                  </span>
                  {isIdenticalConfig && <Check className="w-4 h-4 text-black" />}
                </div>
                <p className="text-xs text-[#717171]">
                  e.g., 4 rooms that are all 2-sharing
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsIdenticalConfig(false)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  !isIdenticalConfig
                    ? 'border-black bg-[#F8F8FA] ring-1 ring-black'
                    : 'border-[#E5E5EA] hover:border-[#D1D1D6] bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-[#1D1D1F]">
                    No, different configurations
                  </span>
                  {!isIdenticalConfig && <Check className="w-4 h-4 text-black" />}
                </div>
                <p className="text-xs text-[#717171]">
                  Customize room numbers, private vs shared, and different capacities
                </p>
              </button>
            </div>
          </div>

          {/* 1. OPTION: IDENTICAL UNITS BATCH GENERATOR */}
          {isIdenticalConfig && (
            <div className="bg-white rounded-3xl border border-[#E5E5EA] p-6 sm:p-8 shadow-apple-sm space-y-6">
              {/* Count Stepper */}
              <div className="flex items-center justify-between border-b border-[#F2F2F7] pb-5">
                <div>
                  <div className="font-semibold text-sm sm:text-base text-[#1D1D1F]">
                    How many identical {terminology.plural.toLowerCase()} do you have?
                  </div>
                  <p className="text-xs text-[#717171]">
                    We will pre-number them sequentially for you
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIdenticalCount((prev) => Math.max(1, prev - 1))}
                    disabled={identicalCount <= 1}
                    className="w-9 h-9 rounded-full border border-[#D1D1D6] flex items-center justify-center text-[#1D1D1F] hover:border-black disabled:opacity-30 disabled:hover:border-[#D1D1D6] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold text-base text-[#1D1D1F]">
                    {identicalCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIdenticalCount((prev) => Math.min(50, prev + 1))}
                    className="w-9 h-9 rounded-full border border-[#D1D1D6] flex items-center justify-center text-[#1D1D1F] hover:border-black transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Naming Prefix */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider">
                  Naming Prefix
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={identicalPrefix}
                    onChange={(e) => setIdenticalPrefix(e.target.value)}
                    placeholder="e.g. Room, Flat, Unit, Studio"
                    className="w-full sm:w-60 px-4 py-2.5 rounded-xl border border-[#E5E5EA] focus:border-black focus:ring-1 focus:ring-black outline-none text-sm text-[#1D1D1F]"
                  />
                  <span className="text-xs text-[#717171]">
                    &rarr; {identicalPrefix || 'Room'} 101, {identicalPrefix || 'Room'} 102...
                  </span>
                </div>
              </div>

              {/* Accommodation Type */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider">
                  Select Accommodation Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {typeOptions.map((opt) => {
                    const isSelected = identicalType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectIdenticalType(opt.value)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-black bg-[#F8F8FA] ring-1 ring-black'
                            : 'border-[#E5E5EA] hover:border-[#D1D1D6] bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-[#1D1D1F]">{opt.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-black" />}
                        </div>
                        {opt.description && (
                          <p className="text-xs text-[#717171] mt-1">{opt.description}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Capacity Stepper */}
              <div className="pt-2 border-t border-[#F2F2F7] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm sm:text-base text-[#1D1D1F]">
                    Capacity per {terminology.singular.toLowerCase()}
                  </div>
                  <p className="text-xs text-[#717171]">Number of tenants per room</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIdenticalCapacity((prev) => Math.max(1, prev - 1))}
                    disabled={identicalCapacity <= 1}
                    className="w-9 h-9 rounded-full border border-[#D1D1D6] flex items-center justify-center text-[#1D1D1F] hover:border-black disabled:opacity-30 disabled:hover:border-[#D1D1D6] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold text-base text-[#1D1D1F]">
                    {identicalCapacity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIdenticalCapacity((prev) => Math.min(20, prev + 1))}
                    className="w-9 h-9 rounded-full border border-[#D1D1D6] flex items-center justify-center text-[#1D1D1F] hover:border-black transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Preview of Generated Units */}
              <div className="pt-4 border-t border-[#F2F2F7]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider">
                    Generated Structure Preview ({identicalPreviewUnits.length} {terminology.plural.toLowerCase()})
                  </span>
                  <span className="text-xs text-[#717171]">
                    Total capacity: {identicalCount * identicalCapacity} tenants
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {identicalPreviewUnits.map((u) => (
                    <div
                      key={u.nameOrNumber}
                      className="p-3 rounded-xl bg-[#F9F9FB] border border-[#EDEDED] text-left"
                    >
                      <div className="font-semibold text-xs sm:text-sm text-[#1D1D1F]">
                        {u.nameOrNumber}
                      </div>
                      <div className="text-[11px] text-[#717171] truncate">{u.unitType}</div>
                      <div className="text-[11px] font-medium text-emerald-700 mt-1">
                        {u.capacity} {u.capacity === 1 ? 'person' : 'people'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. OPTION: CUSTOM / DIFFERENT UNITS CONFIGURATION */}
          {!isIdenticalConfig && (
            <div className="bg-white rounded-3xl border border-[#E5E5EA] p-6 sm:p-8 shadow-apple-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#F2F2F7] pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-[#1D1D1F]">
                    Configured {terminology.plural} ({customUnits.length})
                  </h2>
                  <p className="text-xs text-[#717171]">
                    Add, rename, or adjust the capacity of each distinct unit
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-black text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-all shadow-apple-xs active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add {terminology.singular}</span>
                </button>
              </div>

              {/* Units List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {customUnits.map((u, idx) => (
                  <div
                    key={u.id || idx}
                    className="p-4 rounded-2xl border border-[#E5E5EA] hover:border-[#D1D1D6] bg-white flex items-center justify-between group transition-all"
                  >
                    <div>
                      <div className="font-semibold text-sm text-[#1D1D1F]">
                        {u.nameOrNumber}
                      </div>
                      <div className="text-xs text-[#717171]">{u.unitType}</div>
                      <div className="text-xs font-medium text-emerald-700 mt-0.5">
                        Capacity: {u.capacity} {u.capacity === 1 ? 'person' : 'people'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        title="Edit unit"
                        className="p-2 rounded-lg hover:bg-[#F2F2F7] text-[#717171] hover:text-black transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomUnit(u.id)}
                        title="Delete unit"
                        disabled={customUnits.length <= 1}
                        className="p-2 rounded-lg hover:bg-red-50 text-[#717171] hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL FOR ADDING / EDITING A UNIT */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-apple-lg border border-[#E5E5EA] space-y-5 animate-scale-up">
            <h3 className="text-lg font-semibold text-[#1D1D1F]">
              {editingUnitId ? `Edit ${terminology.singular}` : `Add New ${terminology.singular}`}
            </h3>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider">
                Name or Number
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Room 201, Flat 3B"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5EA] focus:border-black outline-none text-sm text-[#1D1D1F]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider">
                Accommodation Type
              </label>
              <select
                value={formType}
                onChange={(e) => {
                  setFormType(e.target.value);
                  const matched = typeOptions.find((o) => o.value === e.target.value);
                  if (matched) setFormCapacity(matched.defaultCapacity);
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5EA] focus:border-black outline-none text-sm text-[#1D1D1F] bg-white"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between border-t border-[#F2F2F7] pt-4">
              <div>
                <div className="text-sm font-semibold text-[#1D1D1F]">Capacity</div>
                <div className="text-xs text-[#717171]">Number of tenants</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormCapacity((prev) => Math.max(1, prev - 1))}
                  disabled={formCapacity <= 1}
                  className="w-8 h-8 rounded-full border border-[#D1D1D6] flex items-center justify-center text-[#1D1D1F] disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-semibold text-sm text-[#1D1D1F]">
                  {formCapacity}
                </span>
                <button
                  type="button"
                  onClick={() => setFormCapacity((prev) => Math.min(20, prev + 1))}
                  className="w-8 h-8 rounded-full border border-[#D1D1D6] flex items-center justify-center text-[#1D1D1F]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5E5EA] text-xs font-semibold text-[#717171] hover:text-[#1D1D1F]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFormUnit}
                disabled={!formName.trim()}
                className="px-5 py-2 rounded-xl bg-[#222222] hover:bg-black text-white text-xs font-semibold disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER FORM HOOK */}
      {/* Hidden button so the Wizard's outer Next button can trigger submit */}
      <form id="property-structure-form" onSubmit={handleSubmit} className="hidden" />
    </div>
  );
}
