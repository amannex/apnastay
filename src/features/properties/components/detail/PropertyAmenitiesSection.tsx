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
  Sparkles,
  Utensils,
  ArrowUpDown,
  Refrigerator,
  Soup,
  Brush,
  CheckCircle2,
  Info
} from 'lucide-react';
import type { NormalizedProperty, NormalizedAmenity } from '../../adapter';

interface PropertyAmenitiesSectionProps {
  property: NormalizedProperty;
}

type AmenityIconComponent = React.ComponentType<{ className?: string }>;

const AMENITY_ICON_MAP: Record<string, AmenityIconComponent> = {
  // Direct icon names (PascalCase converted to lowercase)
  shieldcheck: ShieldCheck as AmenityIconComponent,
  utensils: Utensils as AmenityIconComponent,
  arrowupdown: ArrowUpDown as AmenityIconComponent,
  car: Car as AmenityIconComponent,
  sparkles: Sparkles as AmenityIconComponent,
  dumbbell: Dumbbell as AmenityIconComponent,
  sun: Sun as AmenityIconComponent,
  wind: Wind as AmenityIconComponent,
  zap: Zap as AmenityIconComponent,
  wifi: Wifi as AmenityIconComponent,
  key: Key as AmenityIconComponent,
  flame: Flame as AmenityIconComponent,
  droplets: Droplets as AmenityIconComponent,
  refrigerator: Refrigerator as AmenityIconComponent,
  tv: Tv as AmenityIconComponent,
  soup: Soup as AmenityIconComponent,
  brush: Brush as AmenityIconComponent,

  // Semantic keyword mappings
  internet: Wifi as AmenityIconComponent,
  fiber: Wifi as AmenityIconComponent,
  broadband: Wifi as AmenityIconComponent,
  air_conditioning: Wind as AmenityIconComponent,
  ac: Wind as AmenityIconComponent,
  power_backup: Zap as AmenityIconComponent,
  inverter: Zap as AmenityIconComponent,
  water_supply: Droplets as AmenityIconComponent,
  security: ShieldCheck as AmenityIconComponent,
  cctv: ShieldCheck as AmenityIconComponent,
  guard: ShieldCheck as AmenityIconComponent,
  parking: Car as AmenityIconComponent,
  smart_lock: Key as AmenityIconComponent,
  keyless: Key as AmenityIconComponent,
  gym: Dumbbell as AmenityIconComponent,
  fitness: Dumbbell as AmenityIconComponent,
  balcony: Sun as AmenityIconComponent,
  geyser: Flame as AmenityIconComponent,
  washing_machine: Sparkles as AmenityIconComponent,
  laundry: Sparkles as AmenityIconComponent,
  kitchen: Utensils as AmenityIconComponent,
  lift: ArrowUpDown as AmenityIconComponent,
  elevator: ArrowUpDown as AmenityIconComponent,
  fridge: Refrigerator as AmenityIconComponent,
  food: Soup as AmenityIconComponent,
  meal: Soup as AmenityIconComponent,
  housekeeping: Brush as AmenityIconComponent,
  soundproof: ShieldCheck as AmenityIconComponent,
  acoustic: ShieldCheck as AmenityIconComponent
};

function getAmenityIcon(name: string, iconHint?: string): AmenityIconComponent {
  const cleanHint = (iconHint || '').toLowerCase().replace(/[\s-_]+/g, '');
  if (cleanHint && AMENITY_ICON_MAP[cleanHint]) {
    return AMENITY_ICON_MAP[cleanHint];
  }

  const cleanName = name.toLowerCase().replace(/[\s-_]+/g, '_');
  for (const key of Object.keys(AMENITY_ICON_MAP)) {
    if (cleanName.includes(key)) {
      return AMENITY_ICON_MAP[key];
    }
  }
  return CheckCircle2 as AmenityIconComponent;
}

interface CategoryConfig {
  id: string;
  title: string;
}

const CATEGORY_DEFINITIONS: CategoryConfig[] = [
  { id: 'basic', title: 'Connectivity & Utilities' },
  { id: 'comfort', title: 'Comfort & Appliances' },
  { id: 'building', title: 'Building & Facilities' },
  { id: 'safety', title: 'Safety & Security' },
  { id: 'services', title: 'Services & Support' },
  { id: 'other', title: 'Additional Amenities' }
];

function classifyAmenityCategory(amenity: NormalizedAmenity): string {
  if (amenity.category && CATEGORY_DEFINITIONS.some((c) => c.id === amenity.category)) {
    return amenity.category;
  }

  const text = (amenity.name + ' ' + (amenity.icon || '')).toLowerCase();

  // 1. Safety & Security (evaluated first to avoid 'cctv' matching 'tv')
  if (/security|guard|cctv|lock|smart-lock|keyless|camera|intercom|fire/i.test(text)) {
    return 'safety';
  }

  // 2. Connectivity & Utilities
  if (/wifi|fiber|internet|broadband|power|backup|inverter|water|electricity/i.test(text)) {
    return 'basic';
  }

  // 3. Comfort & Appliances
  if (/\bac\b|air condition|geyser|heater|\btv\b|television|fridge|refrigerator|washing|soundproof|acoustic|\bfan\b|oven/i.test(text)) {
    return 'comfort';
  }

  // 4. Building & Facilities
  if (/lift|elevator|parking|car|bike|kitchen|balcony|terrace|gym|fitness|pool|garden|lounge/i.test(text)) {
    return 'building';
  }

  // 5. Services & Support
  if (/food|meal|laundry|housekeeping|clean|cook|maid/i.test(text)) {
    return 'services';
  }

  return 'other';
}

export default function PropertyAmenitiesSection({ property }: PropertyAmenitiesSectionProps) {
  const amenities = property.amenities || [];

  // Empty state handling
  if (amenities.length === 0) {
    return (
      <section
        aria-label="Amenities and facilities"
        className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDEDED] shadow-sm space-y-3"
      >
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          Amenities & Facilities
        </h2>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-500 text-xs sm:text-sm">
          <Info className="w-4 h-4 text-gray-400 shrink-0" />
          <span>Amenities not provided by the owner for this accommodation.</span>
        </div>
      </section>
    );
  }

  // Group amenities by category
  const groupedMap = new Map<string, NormalizedAmenity[]>();
  for (const def of CATEGORY_DEFINITIONS) {
    groupedMap.set(def.id, []);
  }

  for (const amenity of amenities) {
    const catId = classifyAmenityCategory(amenity);
    const list = groupedMap.get(catId) || [];
    list.push(amenity);
    groupedMap.set(catId, list);
  }

  // Filter only categories with at least 1 amenity
  const activeCategories = CATEGORY_DEFINITIONS.filter(
    (cat) => (groupedMap.get(cat.id)?.length || 0) > 0
  );

  return (
    <section
      aria-label="Amenities & facilities"
      className="bg-white rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#EDEDED] shadow-sm space-y-6"
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            Amenities & Facilities
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified features and inclusions available for this stay
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
          {amenities.length} {amenities.length === 1 ? 'Feature' : 'Features'}
        </span>
      </div>

      <div className="space-y-6">
        {activeCategories.map((category) => {
          const categoryAmenities = groupedMap.get(category.id) || [];
          return (
            <div key={category.id} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {category.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryAmenities.map((amenity, idx) => {
                  const IconComponent = getAmenityIcon(amenity.name, amenity.icon);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAFAFA] border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white text-[#E1224D] shadow-2xs shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className="text-xs sm:text-sm font-semibold text-gray-800 block truncate"
                          title={amenity.name}
                        >
                          {amenity.name}
                        </span>
                        {amenity.verified && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-0.5">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
