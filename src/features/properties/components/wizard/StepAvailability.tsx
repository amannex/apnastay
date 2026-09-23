'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Building2,
  AlertCircle
} from 'lucide-react';
import type {
  Property,
  PropertyAvailability,
  PropertyAvailabilityType,
  PropertyUnit,
  UnitAvailabilityStatus
} from '../../types';
import { getPropertyAvailabilityLabel } from '../../pricing';
import { getUnitTerminology } from '../../units';

export interface StepAvailabilityProps {
  property: Property;
  onBack: () => void;
  onSave: (data: {
    availability: PropertyAvailability;
    units?: PropertyUnit[];
  }) => Promise<void> | void;
  isSaving?: boolean;
}

export default function StepAvailability({
  property,
  onSave
}: StepAvailabilityProps) {
  const propertyType = property.propertyType;
  const rentalStructure = property.rentalStructure || 'entire_property';
  const term = getUnitTerminology(propertyType, rentalStructure);
  const isMultiUnitOrRoom = rentalStructure !== 'entire_property';

  const todayStr = new Date().toISOString().split('T')[0];

  const [availType, setAvailType] = useState<PropertyAvailabilityType>(() => {
    return property.availability?.type || 'immediate';
  });

  const [availableFrom, setAvailableFrom] = useState<string>(() => {
    return property.availability?.availableFrom || todayStr;
  });

  const [unitsState, setUnitsState] = useState<PropertyUnit[]>(() => {
    return (property.units || []).map((u) => ({
      ...u,
      availability: u.availability || 'available'
    }));
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdateUnitAvailability = (unitId: string, status: UnitAvailabilityStatus) => {
    setUnitsState((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, availability: status, status } : u))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (availType === 'specific_date') {
      if (!availableFrom) {
        setErrorMsg('Please select an availability date.');
        return;
      }
      if (availableFrom < todayStr) {
        setErrorMsg('Availability date cannot be in the past.');
        return;
      }
    }

    setErrorMsg(null);

    const compiledAvailability: PropertyAvailability = {
      type: availType,
      availableFrom: availType === 'specific_date' ? availableFrom : undefined
    };

    onSave({
      availability: compiledAvailability,
      units: isMultiUnitOrRoom && unitsState.length > 0 ? unitsState : undefined
    });
  };

  return (
    <form
      id="availability-form"
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto py-2 space-y-9 animate-fade-in"
      noValidate
    >
      {/* SECTION HEADING (Airbnb Style) */}
      <div className="space-y-1">
        <h1 className="font-outfit text-2xl sm:text-[30px] font-semibold text-[#222222] tracking-tight">
          Availability
        </h1>
        <p className="font-inter text-sm sm:text-base text-[#717171] leading-normal">
          Set when guests or tenants can move into your property.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-primary flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-primary" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* MOVE-IN TIMELINE SECTION */}
      <div className="space-y-4">
        <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
          Move-in status
        </h2>

        <div className="pt-2 pb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:pt-1">
            <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] flex items-center justify-center text-[#222222] shrink-0">
              <Calendar className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <span className="font-inter text-sm sm:text-base font-medium text-[#222222] block">
                Move-in timeline
              </span>
              <span className="font-inter text-xs text-[#717171]">
                {getPropertyAvailabilityLabel({
                  type: availType,
                  availableFrom: availType === 'specific_date' ? availableFrom : undefined
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-start sm:justify-end">
              {[
                { id: 'immediate', label: 'Available now' },
                { id: 'specific_date', label: 'From specific date' },
                { id: 'currently_unavailable', label: 'Currently unavailable' }
              ].map((opt) => {
                const isSelected = availType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setAvailType(opt.id as PropertyAvailabilityType);
                      setErrorMsg(null);
                    }}
                    className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                      isSelected
                        ? 'border border-[#717171] bg-[#F7F7F7] font-semibold text-[#222222]'
                        : 'border border-[#E0E0E0] bg-white font-medium text-[#222222] hover:border-[#717171]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {availType === 'specific_date' && (
              <div className="relative w-full sm:w-56 mt-1">
                <input
                  type="date"
                  min={todayStr}
                  value={availableFrom}
                  onChange={(e) => {
                    setAvailableFrom(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full px-3.5 py-1.5 sm:py-2 rounded-xl border border-[#E0E0E0] focus:border-[#717171] focus:outline-none text-xs sm:text-sm text-[#222222] font-semibold transition-colors"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UNIT / ROOM OCCUPANCY SECTION (When applicable) */}
      {isMultiUnitOrRoom && unitsState.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
              {term.plural} occupancy status
            </h2>
            <span className="font-inter text-xs text-[#717171]">
              {unitsState.length} {unitsState.length === 1 ? term.singular : term.plural}
            </span>
          </div>

          <div className="space-y-3 divide-y divide-[#F2F2F2]">
            {unitsState.map((unit) => (
              <div
                key={unit.id}
                className="pt-3 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] flex items-center justify-center text-[#222222] shrink-0">
                    <Building2 className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <span className="font-inter text-sm sm:text-base font-medium text-[#222222] block">
                      {unit.nameOrNumber}
                    </span>
                    <span className="font-inter text-xs text-[#717171]">
                      Capacity: {unit.capacity || 1} • {unit.furnishing?.replace('_', ' ') || 'unfurnished'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-start sm:justify-end">
                  {[
                    { id: 'available', label: 'Available' },
                    { id: 'partially_occupied', label: 'Partially occupied' },
                    { id: 'occupied', label: 'Occupied' },
                    { id: 'unavailable', label: 'Unavailable' }
                  ].map((statusOpt) => {
                    const isSelected = (unit.availability || 'available') === statusOpt.id;
                    return (
                      <button
                        key={statusOpt.id}
                        type="button"
                        onClick={() =>
                          handleUpdateUnitAvailability(
                            unit.id,
                            statusOpt.id as UnitAvailabilityStatus
                          )
                        }
                        className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${
                          isSelected
                            ? 'border border-[#717171] bg-[#F7F7F7] font-semibold text-[#222222]'
                            : 'border border-[#E0E0E0] bg-white font-medium text-[#222222] hover:border-[#717171]'
                        }`}
                      >
                        {statusOpt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
