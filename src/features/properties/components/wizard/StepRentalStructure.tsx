'use client';

import React from 'react';
import {
  Key,
  Building2,
  DoorOpen,
  BedDouble,
  Layers,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2
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

  const getFlowExplanation = (structure: RentalStructure | null) => {
    if (!structure) return null;
    switch (structure) {
      case 'entire_property':
        return 'Single-lease flow: You’ll set a single rent for the whole property without needing to create individual rooms or beds.';
      case 'individual_bed':
        return 'Room & bed flow: You’ll be able to create rooms and define individual bed spaces with their own rental prices.';
      case 'individual_room':
        return 'Room-level flow: You’ll be able to configure distinct rooms with specific room types and individual pricing.';
      case 'individual_unit':
        return 'Unit-level flow: You’ll configure this specific flat or unit with its own layout and rent.';
      case 'multiple_units':
        return 'Multi-unit flow: You’ll be able to add and manage multiple flats or commercial units with bulk creation tools.';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* SECTION HEADING */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
          How will tenants rent?
        </h2>
        <p className="text-xs sm:text-sm text-[#86868B] mt-1.5">
          Choose the booking model for your{' '}
          <span className="font-bold text-[#1D1D1F]">{template.label}</span>.
        </p>
      </div>

      {/* RENTAL STRUCTURE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 max-w-4xl mx-auto">
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
              className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between ${
                isSelected
                  ? 'border-primary bg-primary/[0.03] shadow-sm ring-1 ring-primary'
                  : 'border-[#EDEDED] bg-white hover:border-[#D1D1D6] hover:shadow-sm'
              } ${!isAllowed ? 'opacity-70' : ''}`}
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

                <div className="flex items-center gap-1.5">
                  {isRecommended && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider">
                      Recommended
                    </span>
                  )}
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-primary animate-fade-in" />
                  )}
                </div>
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

      {/* DYNAMIC FLOW EXPLANATION BOX */}
      {selectedStructure && (
        <div className="max-w-2xl mx-auto bg-[#FAFAFA] border border-[#EDEDED] rounded-2xl p-4 text-center sm:text-left">
          <p className="text-xs text-[#1D1D1F] font-medium leading-relaxed">
            {getFlowExplanation(selectedStructure)}
          </p>
        </div>
      )}

      {/* NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between pt-4 border-t border-[#EDEDED]">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-5 py-3.5 rounded-2xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={selectedStructure === null || isSubmitting}
          className="px-7 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Draft...</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
