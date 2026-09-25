'use client';

import React from 'react';
import {
  Wifi,
  Wind,
  ShieldCheck,
  Zap,
  Droplets,
  Tv,
  Car,
  Key,
  Dumbbell,
  Sun,
  Flame,
  Shirt,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface PropertyAmenitiesSectionProps {
  property: NormalizedProperty;
}

const AMENITY_ICON_MAP: Record<string, React.ElementType> = {
  wifi: Wifi,
  internet: Wifi,
  ac: Wind,
  air_conditioning: Wind,
  power_backup: Zap,
  inverter: Zap,
  water_supply: Droplets,
  security: ShieldCheck,
  parking: Car,
  smart_lock: Key,
  keyless_entry: Key,
  gym: Dumbbell,
  balcony: Sun,
  geyser: Flame,
  laundry: Shirt,
  washing_machine: Shirt
};

function getAmenityIcon(name: string, iconHint?: string): React.ComponentType<{ className?: string }> {
  const normalized = (iconHint || name).toLowerCase().replace(/[\s-]+/g, '_');
  for (const key of Object.keys(AMENITY_ICON_MAP)) {
    if (normalized.includes(key)) {
      return AMENITY_ICON_MAP[key] as React.ComponentType<{ className?: string }>;
    }
  }
  return CheckCircle2 as React.ComponentType<{ className?: string }>;
}

export default function PropertyAmenitiesSection({ property }: PropertyAmenitiesSectionProps) {
  const amenities = property.amenities || [];

  if (amenities.length === 0) {
    return (
      <section aria-label="Amenities" className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDEDED] shadow-sm">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-3">Amenities & Facilities</h2>
        <p className="text-xs sm:text-sm text-[#6B7280]">No specific amenities listed by the owner for this accommodation.</p>
      </section>
    );
  }

  return (
    <section aria-label="Amenities & facilities" className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDEDED] shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
          <span>Amenities & Facilities</span>
        </h2>
        <span className="text-xs font-semibold text-[#6B7280]">
          {amenities.length} {amenities.length === 1 ? 'Feature' : 'Features'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {amenities.map((amenity, idx) => {
          const IconComponent = getAmenityIcon(amenity.name, amenity.icon);
          return (
            <div
              key={idx}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAFAFA] border border-gray-100"
            >
              <div className="p-2 rounded-xl bg-white text-[#E1224D] shadow-2xs shrink-0">
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-medium text-gray-800 truncate block">
                  {amenity.name}
                </span>
                {amenity.verified && (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
