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
    <div className="w-full max-w-2xl sm:max-w-3xl mx-auto animate-fade-in py-2">
      {/* SECTION HEADING (Centered, clean Airbnb typography) */}
      <h1 className="text-2xl sm:text-[32px] font-semibold text-[#222222] text-center tracking-tight mb-6 sm:mb-8">
        What type of place will guests have?
      </h1>

      {/* RENTAL STRUCTURE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 max-w-2xl mx-auto">
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
              className={`text-left p-5 rounded-xl border transition-all duration-150 flex items-start gap-4 active:scale-[0.98] ${
                isSelected
                  ? 'border-2 border-[#222222] bg-[#F7F7F7]'
                  : 'border border-[#DDDDDD] hover:border-[#222222] bg-white'
              } ${!isAllowed ? 'opacity-70' : ''}`}
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0 text-[#222222] mt-0.5">
                <Icon className="w-6 h-6 stroke-[1.75]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-semibold text-[#222222] tracking-tight">
                    {option.title}
                  </h3>
                  {isRecommended && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#222222] text-white text-[10px] font-medium tracking-wide shrink-0">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#717171] mt-1 leading-snug">
                  {option.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* DYNAMIC FLOW EXPLANATION BOX */}
      {selectedStructure && (
        <div className="max-w-2xl mx-auto mt-6 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-4 text-center sm:text-left">
          <p className="text-xs text-[#222222] font-medium leading-relaxed">
            {getFlowExplanation(selectedStructure)}
          </p>
        </div>
      )}
    </div>
  );
}
