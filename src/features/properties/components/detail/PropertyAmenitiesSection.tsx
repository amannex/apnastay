'use client';

import React, { useState } from 'react';
import {
  Wifi,
  Snowflake,
  ShieldCheck,
  Zap,
  Droplets,
  Tv,
  Car,
  Key,
  Dumbbell,
  Sun,
  Flame,
  UtensilsCrossed,
  ArrowUpDown,
  Refrigerator,
  Soup,
  Brush,
  WashingMachine,
  Bath,
  ShowerHead,
  Cctv,
  CheckCircle2,
  Info
} from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';
import PropertyAmenitiesModal from './PropertyAmenitiesModal';

interface PropertyAmenitiesSectionProps {
  property: NormalizedProperty;
}

type AmenityIconComponent = React.ComponentType<{ className?: string }>;

const AMENITY_ICON_MAP: Record<string, AmenityIconComponent> = {
  // Direct icon names
  shieldcheck: ShieldCheck as AmenityIconComponent,
  utensils: UtensilsCrossed as AmenityIconComponent,
  utensilscrossed: UtensilsCrossed as AmenityIconComponent,
  arrowupdown: ArrowUpDown as AmenityIconComponent,
  car: Car as AmenityIconComponent,
  dumbbell: Dumbbell as AmenityIconComponent,
  sun: Sun as AmenityIconComponent,
  wind: Snowflake as AmenityIconComponent,
  zap: Zap as AmenityIconComponent,
  wifi: Wifi as AmenityIconComponent,
  key: Key as AmenityIconComponent,
  flame: Flame as AmenityIconComponent,
  droplets: Droplets as AmenityIconComponent,
  refrigerator: Refrigerator as AmenityIconComponent,
  tv: Tv as AmenityIconComponent,
  soup: Soup as AmenityIconComponent,
  brush: Brush as AmenityIconComponent,
  bath: Bath as AmenityIconComponent,
  snowflake: Snowflake as AmenityIconComponent,
  washingmachine: WashingMachine as AmenityIconComponent,
  cctv: Cctv as AmenityIconComponent,
  shower: ShowerHead as AmenityIconComponent,

  // Semantic keyword mappings
  internet: Wifi as AmenityIconComponent,
  fiber: Wifi as AmenityIconComponent,
  broadband: Wifi as AmenityIconComponent,
  air_conditioning: Snowflake as AmenityIconComponent,
  air_conditioner: Snowflake as AmenityIconComponent,
  ac: Snowflake as AmenityIconComponent,
  cooling: Snowflake as AmenityIconComponent,
  power_backup: Zap as AmenityIconComponent,
  inverter: Zap as AmenityIconComponent,
  water_supply: Droplets as AmenityIconComponent,
  water: Droplets as AmenityIconComponent,
  security: ShieldCheck as AmenityIconComponent,
  guard: ShieldCheck as AmenityIconComponent,
  parking: Car as AmenityIconComponent,
  smart_lock: Key as AmenityIconComponent,
  keyless: Key as AmenityIconComponent,
  gym: Dumbbell as AmenityIconComponent,
  fitness: Dumbbell as AmenityIconComponent,
  balcony: Sun as AmenityIconComponent,
  geyser: Flame as AmenityIconComponent,
  heater: Flame as AmenityIconComponent,
  washing_machine: WashingMachine as AmenityIconComponent,
  washing: WashingMachine as AmenityIconComponent,
  laundry: WashingMachine as AmenityIconComponent,
  kitchen: UtensilsCrossed as AmenityIconComponent,
  cooking: UtensilsCrossed as AmenityIconComponent,
  lift: ArrowUpDown as AmenityIconComponent,
  elevator: ArrowUpDown as AmenityIconComponent,
  fridge: Refrigerator as AmenityIconComponent,
  food: Soup as AmenityIconComponent,
  meal: Soup as AmenityIconComponent,
  meals: Soup as AmenityIconComponent,
  housekeeping: Brush as AmenityIconComponent,
  cleaning: Brush as AmenityIconComponent,
  bathroom: Bath as AmenityIconComponent
};

function getAmenityIcon(name: string, iconHint?: string): AmenityIconComponent {
  const cleanHint = (iconHint || '').toLowerCase().replace(/[\s-_]+/g, '');
  if (cleanHint && AMENITY_ICON_MAP[cleanHint]) {
    return AMENITY_ICON_MAP[cleanHint];
  }

  const cleanName = name.toLowerCase().replace(/[\s-_]+/g, '_');
  // Sort keys by descending length so specific terms (e.g. 'washing_machine') match before short substrings (e.g. 'ac')
  const sortedKeys = Object.keys(AMENITY_ICON_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (key === 'ac') {
      if (/\bac\b|_ac_|^ac_|_ac$/.test(cleanName) || cleanName === 'ac') {
        return AMENITY_ICON_MAP[key];
      }
    } else if (cleanName.includes(key)) {
      return AMENITY_ICON_MAP[key];
    }
  }
  return CheckCircle2 as AmenityIconComponent;
}

export default function PropertyAmenitiesSection({ property }: PropertyAmenitiesSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Only display amenities that are actually present with valid names
  const availableAmenities = (property.amenities || []).filter(
    (amenity) => Boolean(amenity && amenity.name && amenity.name.trim())
  );

  // Empty state handling
  if (availableAmenities.length === 0) {
    return (
      <section
        aria-label="Amenities & facilities"
        className="py-6 sm:py-8 space-y-4"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
          Amenities & Facilities
        </h2>
        <div className="flex items-center gap-3 py-3 text-gray-500 text-sm">
          <Info className="w-4 h-4 text-gray-400 shrink-0" />
          <span>Amenities not specified for this accommodation.</span>
        </div>
      </section>
    );
  }

  // Show first 10 items on page (5 per column)
  const displayedAmenities = availableAmenities.slice(0, 10);

  return (
    <>
      <section
        aria-label="Amenities & facilities"
        className="py-6 sm:py-8 space-y-6"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
            Amenities & Facilities
          </h2>
        </div>

        {/* 2-COLUMN AIRBNB-STYLE AMENITIES LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-5 gap-x-8 sm:gap-x-16 pt-2">
          {displayedAmenities.map((amenity, idx) => {
            const IconComponent = getAmenityIcon(amenity.name, amenity.icon);
            return (
              <div
                key={`${amenity.name}-${idx}`}
                className="flex items-center gap-4 text-[#1A1A1A]"
              >
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-black shrink-0 stroke-[1.6]" />
                <span className="text-sm sm:text-base font-normal text-[rgb(31,41,55)]">
                  {amenity.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* SHOW ALL AMENITIES BUTTON (OPENS CATEGORIZED MODAL) */}
        {availableAmenities.length > 10 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-sm sm:text-base font-semibold text-gray-900 transition-colors cursor-pointer"
            >
              Show all {availableAmenities.length} amenities
            </button>
          </div>
        )}
      </section>

      {/* CATEGORIZED AMENITIES MODAL */}
      <PropertyAmenitiesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        amenities={availableAmenities}
      />
    </>
  );
}
