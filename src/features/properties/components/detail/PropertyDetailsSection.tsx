'use client';

import React from 'react';
import {
  Bed,
  Bath,
  Ruler,
  Maximize2,
  Building,
  Sofa,
  Calendar,
  Compass,
  Car,
  Receipt,
  Droplets,
  Zap,
  Users,
  UserCheck,
  Utensils,
  WashingMachine,
  Clock,
  ShieldCheck,
  Lock,
  Shield,
  Home,
  Info
} from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';
import { resolvePropertyDetails } from './propertyDetailsConfig';

interface PropertyDetailsSectionProps {
  property: NormalizedProperty;
}

type FieldIconComponent = React.ComponentType<{ className?: string }>;

const FIELD_ICON_MAP: Record<string, FieldIconComponent> = {
  bedrooms: Bed,
  bathrooms: Bath,
  carpetArea: Ruler,
  builtUpArea: Maximize2,
  floor: Building,
  totalFloors: Building,
  furnishing: Sofa,
  propertyAge: Calendar,
  facing: Compass,
  parking: Car,
  maintenance: Receipt,
  waterSupply: Droplets,
  powerBackup: Zap,
  roomType: Home,
  sharingType: Users,
  genderPreference: UserCheck,
  foodIncluded: Utensils,
  laundry: WashingMachine,
  curfew: Clock,
  deposit: ShieldCheck,
  minimumStay: Calendar,
  noticePeriod: Clock,
  bedType: Bed,
  sharing: Users,
  meals: Utensils,
  locker: Lock,
  commonAreas: Users,
  security: Shield,
  plotArea: Ruler,
  floors: Building,
  propertyType: Home
};

function getFieldIcon(id: string): FieldIconComponent {
  return FIELD_ICON_MAP[id] || Info;
}

export default function PropertyDetailsSection({ property }: PropertyDetailsSectionProps) {
  const fields = resolvePropertyDetails(property);

  if (fields.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Additional info about property"
      className="py-6 sm:py-8 space-y-6"
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
          Additional Info about Property
        </h2>
      </div>

      {/* 2-COLUMN AIRBNB-STYLE SPECIFICATIONS LIST (NO BORDERS, AMENITIES STYLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-5 gap-x-8 sm:gap-x-16 pt-2">
        {fields.map((field) => {
          const IconComponent = getFieldIcon(field.id);
          return (
            <div
              key={field.id}
              className="flex items-center gap-4 text-[#1A1A1A]"
            >
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-black shrink-0 stroke-[1.6]" />
              <span className="text-sm sm:text-base font-normal text-[rgb(31,41,55)]">
                <span className="text-gray-500">{field.label}: </span>
                {field.value}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
