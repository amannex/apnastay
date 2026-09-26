'use client';

import React, { useEffect } from 'react';
import {
  X,
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
  Fan
} from 'lucide-react';
import type { NormalizedAmenity } from '../../adapter';

interface PropertyAmenitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  amenities: NormalizedAmenity[];
}

type AmenityIconComponent = React.ComponentType<{ className?: string }>;

const AMENITY_ICON_MAP: Record<string, AmenityIconComponent> = {
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
  fan: Fan as AmenityIconComponent,

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

export function getAmenityIcon(name: string, iconHint?: string): AmenityIconComponent {
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

interface AmenityCategoryDef {
  id: string;
  title: string;
  match: RegExp;
}

/**
 * ApnaStay-tailored amenity categories for long-term Indian rentals,
 * student housing, flats, and co-living residences.
 */
const APNASTAY_CATEGORIES: AmenityCategoryDef[] = [
  {
    id: 'utilities',
    title: 'Power, Internet & Utilities',
    match: /wifi|internet|fiber|broadband|power|backup|inverter|electricity|water\s*supply|purifier|ro/i
  },
  {
    id: 'climate',
    title: 'Climate & Cooling',
    match: /\bac\b|air\s*condition|cooling|\bfan\b|heater|geyser/i
  },
  {
    id: 'furnishing',
    title: 'Bedroom, Furnishing & Laundry',
    match: /bed|mattress|wardrobe|cupboard|closet|sofa|linen|curtain|cushion|washing\s*machine|laundry|iron|study|desk|workspace/i
  },
  {
    id: 'kitchen',
    title: 'Kitchen & Dining',
    match: /kitchen|refrigerator|fridge|microwave|stove|oven|gas|pipeline|cooking|utensil|dining/i
  },
  {
    id: 'bathroom',
    title: 'Bathroom & Hygiene',
    match: /bath|bathroom|shower|geyser|toilet|sanitary|exhaust/i
  },
  {
    id: 'safety',
    title: 'Safety & Security',
    match: /security|guard|cctv|camera|lock|smart|keyless|intercom|fire|gated/i
  },
  {
    id: 'facilities',
    title: 'Building & Facilities',
    match: /lift|elevator|parking|car|bike|two\s*wheeler|gym|fitness|swimming|pool|balcony|terrace|garden|clubhouse/i
  },
  {
    id: 'services',
    title: 'Services & Housekeeping',
    match: /housekeeping|clean|maid|cook|food|meal|tiffin|waste|garbage|maintenance/i
  }
];

export default function PropertyAmenitiesModal({
  isOpen,
  onClose,
  amenities
}: PropertyAmenitiesModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter only valid, available amenities
  const availableAmenities = amenities.filter(
    (a) => Boolean(a && a.name && a.name.trim())
  );

  // Group available amenities into ApnaStay categories
  const grouped = new Map<string, NormalizedAmenity[]>();
  for (const cat of APNASTAY_CATEGORIES) {
    grouped.set(cat.id, []);
  }
  const otherItems: NormalizedAmenity[] = [];

  for (const amenity of availableAmenities) {
    let matched = false;
    for (const cat of APNASTAY_CATEGORIES) {
      if (cat.match.test(amenity.name)) {
        grouped.get(cat.id)?.push(amenity);
        matched = true;
        break;
      }
    }
    if (!matched) {
      otherItems.push(amenity);
    }
  }

  // Active categories containing at least 1 amenity
  const activeCategories = APNASTAY_CATEGORIES.filter(
    (cat) => (grouped.get(cat.id)?.length || 0) > 0
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="All amenities and facilities"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
    >
      {/* Backdrop overlay dismiss */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-apple-lg z-10 overflow-hidden border border-gray-100">
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 bg-white z-20 px-6 sm:px-8 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700 hover:text-black transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold text-gray-500">
            {availableAmenities.length} Amenities
          </span>
        </div>

        {/* Scrollable Categorized Amenities Content */}
        <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
          <div className="pb-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">
              Amenities and facilities
            </h2>
          </div>

          {/* Categorized amenity blocks */}
          <div className="space-y-8">
            {activeCategories.map((category) => {
              const items = grouped.get(category.id) || [];
              return (
                <div key={category.id} className="space-y-3">
                  <h3 className="text-base sm:text-lg font-semibold text-[#1A1A1A]">
                    {category.title}
                  </h3>
                  <div className="divide-y divide-gray-200 border-b border-gray-200">
                    {items.map((amenity, idx) => {
                      const IconComponent = getAmenityIcon(amenity.name, amenity.icon);
                      return (
                        <div
                          key={`${amenity.name}-${idx}`}
                          className="flex items-center gap-4 py-4.5 sm:py-5 first:pt-1.5"
                        >
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-black shrink-0 stroke-[1.6]" />
                          <span className="text-sm sm:text-base font-normal text-[rgb(31,41,55)]">
                            {amenity.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Additional / Other amenities if any */}
            {otherItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold text-[#1A1A1A]">
                  Additional Amenities & Inclusions
                </h3>
                <div className="divide-y divide-gray-200 border-b border-gray-200">
                  {otherItems.map((amenity, idx) => {
                    const IconComponent = getAmenityIcon(amenity.name, amenity.icon);
                    return (
                      <div
                        key={`${amenity.name}-${idx}`}
                        className="flex items-center gap-4 py-4.5 sm:py-5 first:pt-1.5"
                      >
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-black shrink-0 stroke-[1.6]" />
                        <span className="text-sm sm:text-base font-normal text-[rgb(31,41,55)]">
                          {amenity.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
