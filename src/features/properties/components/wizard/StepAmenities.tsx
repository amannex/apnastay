'use client';

import React, { useState, useMemo } from 'react';
import {
  Wifi,
  Droplets,
  Zap,
  ShieldCheck,
  Video,
  Wind,
  Fan,
  Tv,
  Refrigerator,
  Flame,
  ArrowUpDown,
  Car,
  Bike,
  Maximize,
  Sun,
  Utensils,
  Users,
  Dumbbell,
  Trees,
  Waves,
  Soup,
  Shirt,
  Sparkles,
  Brush,
  Plus,
  X
} from 'lucide-react';
import type { PropertyType, AmenityDefinition } from '../../types';
import {
  AMENITY_REGISTRY,
  sanitizeCustomAmenity
} from '../../amenities';

// Mapping icon strings to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi,
  Droplets,
  Zap,
  ShieldCheck,
  Video,
  Wind,
  Fan,
  Tv,
  Refrigerator,
  Flame,
  ArrowUpDown,
  Car,
  Bike,
  Maximize,
  Sun,
  Utensils,
  Users,
  Dumbbell,
  Trees,
  Waves,
  Soup,
  Shirt,
  Sparkles,
  Brush
};

function renderAmenityIcon(iconName?: string, className: string = 'w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5]') {
  if (iconName && ICON_MAP[iconName]) {
    const IconComponent = ICON_MAP[iconName];
    return <IconComponent className={className} />;
  }
  return <Sparkles className={className} />;
}

// Curated Airbnb-like category groupings
interface AmenityGroup {
  id: string;
  title: string;
  amenityIds: string[];
}

const AMENITY_GROUPS: AmenityGroup[] = [
  {
    id: 'guest_favourites',
    title: 'What about these guest favourites?',
    amenityIds: [
      'wifi',
      'tv',
      'kitchen',
      'washing_machine',
      'parking',
      'ac',
      'fan',
      'refrigerator',
      'geyser'
    ]
  },
  {
    id: 'standout_amenities',
    title: 'Do you have any standout amenities?',
    amenityIds: [
      'swimming_pool',
      'gym',
      'balcony',
      'terrace',
      'common_area',
      'garden',
      'power_backup'
    ]
  },
  {
    id: 'safety_services',
    title: 'Do you have any of these building, services & safety items?',
    amenityIds: [
      'lift',
      'bike_parking',
      'water_supply',
      'security',
      'cctv',
      'food',
      'housekeeping',
      'laundry'
    ]
  }
];

export interface StepAmenitiesProps {
  propertyType?: PropertyType | null;
  customPropertyType?: string;
  initialAmenities?: string[];
  initialCustomAmenities?: string[];
  onBack: (amenities: string[], customAmenities: string[]) => void;
  onSave: (amenities: string[], customAmenities: string[]) => Promise<void> | void;
  isSaving?: boolean;
}

export default function StepAmenities({
  initialAmenities = [],
  initialCustomAmenities = [],
  onSave,
  isSaving = false
}: StepAmenitiesProps) {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialAmenities);
  const [customAmenities, setCustomAmenities] = useState<string[]>(initialCustomAmenities);

  // Custom amenity input state
  const [newCustomName, setNewCustomName] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInputError, setCustomInputError] = useState<string | null>(null);

  const handleToggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCustomAmenity = () => {
    const trimmed = sanitizeCustomAmenity(newCustomName);
    if (!trimmed) {
      setCustomInputError('Please enter an amenity name.');
      return;
    }
    if (trimmed.length < 2) {
      setCustomInputError('Must be at least 2 characters.');
      return;
    }
    if (
      customAmenities.some((c) => c.toLowerCase() === trimmed.toLowerCase()) ||
      selectedAmenities.some((s) => s.toLowerCase() === trimmed.toLowerCase())
    ) {
      setCustomInputError('This amenity has already been added.');
      return;
    }

    setCustomAmenities((prev) => [...prev, trimmed]);
    setNewCustomName('');
    setIsAddingCustom(false);
    setCustomInputError(null);
  };

  const handleRemoveCustomAmenity = (indexToRemove: number) => {
    setCustomAmenities((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedAmenities, customAmenities);
  };

  return (
    <form
      id="amenities-form"
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto py-2 space-y-10 animate-fade-in"
      noValidate
    >
      {/* SECTION HEADING (Airbnb Style) */}
      <div className="space-y-1">
        <h1 className="font-outfit text-2xl sm:text-[30px] font-semibold text-[#222222] tracking-tight">
          Tell guests what your place has to offer
        </h1>
        <p className="font-inter text-sm sm:text-base text-[#717171] leading-normal">
          You can add more amenities after you publish your listing.
        </p>
      </div>

      {/* AMENITY CATEGORIES (Airbnb unboxed layout) */}
      <div className="space-y-9">
        {AMENITY_GROUPS.map((group) => {
          const groupAmenities = group.amenityIds
            .map((id) => AMENITY_REGISTRY[id])
            .filter((a): a is AmenityDefinition => Boolean(a));

          if (groupAmenities.length === 0) return null;

          return (
            <div key={group.id} className="space-y-3.5">
              <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
                {group.title}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {groupAmenities.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity.id);
                  return (
                    <button
                      type="button"
                      key={amenity.id}
                      onClick={() => handleToggleAmenity(amenity.id)}
                      className={`p-4 sm:p-5 rounded-2xl border text-left flex flex-col justify-between items-start min-h-[96px] sm:min-h-[108px] transition-all duration-150 select-none ${
                        isSelected
                          ? 'border-2 border-[#222222] bg-[#F7F7F7] shadow-sm'
                          : 'border border-[#DDDDDD] bg-white hover:border-[#222222]'
                      }`}
                    >
                      <div className="text-[#222222]">
                        {renderAmenityIcon(amenity.iconName, 'w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5]')}
                      </div>
                      <span className="font-inter text-sm sm:text-base font-medium text-[#222222] leading-snug mt-3 sm:mt-4">
                        {amenity.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* CUSTOM AMENITIES (Airbnb unboxed style) */}
      <div className="space-y-3 pt-2 border-t border-[#EBEBEB]">
        <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
          Do you have any standout features?
        </h2>
        <p className="font-inter text-xs sm:text-sm text-[#717171]">
          Add any unique perks like a rooftop cafe, home theatre, or library.
        </p>

        {/* Existing Custom Tags */}
        {customAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {customAmenities.map((customName, idx) => (
              <span
                key={`custom-${idx}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#222222] bg-[#F7F7F7] text-xs sm:text-sm font-medium text-[#222222]"
              >
                <span>{customName}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomAmenity(idx)}
                  className="p-0.5 rounded-full hover:bg-[#EBEBEB] text-[#717171] hover:text-[#222222] transition-colors"
                  title="Remove amenity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add Custom Input Form or Add Button */}
        {isAddingCustom ? (
          <div className="pt-2 space-y-2 max-w-md">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCustomName}
                onChange={(e) => {
                  setNewCustomName(e.target.value);
                  if (customInputError) setCustomInputError(null);
                }}
                placeholder="e.g., Rooftop Cafe, Pool Table..."
                maxLength={60}
                autoFocus
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#222222] text-sm text-[#222222] placeholder:text-[#86868B] focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomAmenity();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomAmenity}
                className="px-4 py-2.5 rounded-xl bg-[#222222] hover:bg-black text-white text-sm font-semibold transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCustom(false);
                  setNewCustomName('');
                  setCustomInputError(null);
                }}
                className="px-3 py-2.5 rounded-xl border border-[#DDDDDD] hover:border-[#222222] text-sm font-medium text-[#717171] hover:text-[#222222] transition-colors"
              >
                Cancel
              </button>
            </div>
            {customInputError && (
              <p className="text-xs text-primary font-medium">{customInputError}</p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingCustom(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#DDDDDD] hover:border-[#222222] text-xs sm:text-sm font-medium text-[#222222] bg-white transition-colors"
          >
            <Plus className="w-4 h-4 text-[#222222]" />
            <span>Add another amenity</span>
          </button>
        )}
      </div>
    </form>
  );
}
