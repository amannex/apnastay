'use client';

import React from 'react';
import {
  Bed,
  Bath,
  Maximize2,
  Sofa,
  Building,
  Car,
  Calendar,
  Compass,
  Users,
  UserCheck,
  Utensils,
  Clock
} from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface PropertySnapshotSectionProps {
  property: NormalizedProperty;
}

interface SnapshotItem {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function PropertySnapshotSection({ property }: PropertySnapshotSectionProps) {
  const { specs, availability, propertyType, propertyTypeLabel } = property;

  const rawType = (propertyType || '').toLowerCase();
  const isPgOrHostel =
    rawType === 'pg' ||
    rawType === 'hostel' ||
    rawType === 'co_living' ||
    rawType === 'coliving' ||
    rawType === 'bed_space';
  const isHouse =
    rawType === 'independent_house' ||
    rawType === 'house' ||
    rawType === 'villa';

  const snapshotItems: SnapshotItem[] = [];

  // --------------------------------------------------------------------------
  // PROPERTY TYPE SPECIFIC ATTRIBUTE MAPPING
  // --------------------------------------------------------------------------
  if (isPgOrHostel) {
    // 1. PG / Hostel / Co-living: Focus on Sharing, Meals, Gender, Access
    if (specs.sharingType || specs.roomType) {
      snapshotItems.push({
        id: 'sharing',
        label: 'Room / Sharing',
        value: specs.sharingType || specs.roomType || 'Shared Room',
        icon: Users
      });
    }

    if (specs.genderPreference) {
      snapshotItems.push({
        id: 'gender',
        label: 'Gender Preference',
        value: specs.genderPreference,
        icon: UserCheck
      });
    }

    if (specs.foodPolicy) {
      snapshotItems.push({
        id: 'meals',
        label: 'Food & Meals',
        value: specs.foodPolicy,
        icon: Utensils
      });
    }

    if (specs.bathrooms !== undefined && specs.bathrooms !== null) {
      snapshotItems.push({
        id: 'bathrooms',
        label: 'Bathroom',
        value: specs.bathrooms === 1 ? '1 Attached Bath' : `${specs.bathrooms} Bathrooms`,
        icon: Bath
      });
    }

    if (specs.furnishing) {
      snapshotItems.push({
        id: 'furnishing',
        label: 'Furnishing',
        value: specs.furnishing,
        icon: Sofa
      });
    }

    if (specs.curfewOrTiming) {
      snapshotItems.push({
        id: 'timing',
        label: 'Gate / Curfew',
        value: specs.curfewOrTiming,
        icon: Clock
      });
    }
  } else if (isHouse) {
    // 2. Independent House / Villa: Focus on Bedrooms, Plot/Built Area, Floors, Parking
    if (specs.bedrooms !== undefined && specs.bedrooms !== null) {
      snapshotItems.push({
        id: 'bedrooms',
        label: 'Bedrooms',
        value: `${specs.bedrooms} ${specs.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}`,
        icon: Bed
      });
    }

    if (specs.bathrooms !== undefined && specs.bathrooms !== null) {
      snapshotItems.push({
        id: 'bathrooms',
        label: 'Bathrooms',
        value: `${specs.bathrooms} ${specs.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}`,
        icon: Bath
      });
    }

    if (specs.sqft !== undefined && specs.sqft !== null && specs.sqft > 0) {
      snapshotItems.push({
        id: 'area',
        label: 'Built-up Area',
        value: `${specs.sqft.toLocaleString()} sq.ft.`,
        icon: Maximize2
      });
    } else if (specs.plotArea) {
      snapshotItems.push({
        id: 'plotArea',
        label: 'Plot Area',
        value: specs.plotArea,
        icon: Maximize2
      });
    }

    if (specs.furnishing) {
      snapshotItems.push({
        id: 'furnishing',
        label: 'Furnishing',
        value: specs.furnishing,
        icon: Sofa
      });
    }

    if (specs.totalFloors || specs.floor !== undefined) {
      snapshotItems.push({
        id: 'floors',
        label: 'Floors',
        value: String(specs.totalFloors || specs.floor),
        icon: Building
      });
    }

    if (specs.parking) {
      snapshotItems.push({
        id: 'parking',
        label: 'Parking',
        value: specs.parking,
        icon: Car
      });
    }
  } else {
    // 3. Apartment / Builder Floor / Flat / Studio
    if (specs.bedrooms !== undefined && specs.bedrooms !== null) {
      snapshotItems.push({
        id: 'bedrooms',
        label: 'Bedrooms',
        value: `${specs.bedrooms} ${specs.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}`,
        icon: Bed
      });
    }

    if (specs.bathrooms !== undefined && specs.bathrooms !== null) {
      snapshotItems.push({
        id: 'bathrooms',
        label: 'Bathrooms',
        value: `${specs.bathrooms} ${specs.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}`,
        icon: Bath
      });
    }

    if (specs.sqft !== undefined && specs.sqft !== null && specs.sqft > 0) {
      snapshotItems.push({
        id: 'area',
        label: 'Super Area',
        value: `${specs.sqft.toLocaleString()} sq.ft.`,
        icon: Maximize2
      });
    }

    if (specs.furnishing) {
      snapshotItems.push({
        id: 'furnishing',
        label: 'Furnishing',
        value: specs.furnishing,
        icon: Sofa
      });
    }

    if (specs.floor !== undefined && specs.floor !== null) {
      const floorStr = String(specs.floor);
      snapshotItems.push({
        id: 'floor',
        label: 'Floor',
        value: floorStr.toLowerCase().includes('floor') ? floorStr : `${floorStr} Floor`,
        icon: Building
      });
    }

    if (specs.parking) {
      snapshotItems.push({
        id: 'parking',
        label: 'Parking',
        value: specs.parking,
        icon: Car
      });
    }
  }

  // Common relevant fields if not already included
  if (snapshotItems.length < 6) {
    snapshotItems.push({
      id: 'propertyType',
      label: 'Property Type',
      value: propertyTypeLabel,
      icon: Compass
    });
  }

  snapshotItems.push({
    id: 'availability',
    label: 'Availability',
    value: availability.isImmediate ? 'Available now' : availability.displayStatus,
    icon: Calendar
  });

  if (snapshotItems.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Property snapshot specifications"
      className="py-6 sm:py-8 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
          Property Snapshot
        </h2>
        <span className="text-xs font-semibold text-[#6B7280]">
          {propertyTypeLabel}
        </span>
      </div>

      {/* RESPONSIVE SNAPSHOT GRID */}
      {/* Desktop: 3 column balanced tile grid with generous padding */}
      {/* Mobile: 2 column scannable card layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-4 pt-1">
        {snapshotItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-3 sm:p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between hover:bg-gray-100/60 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <span className="text-[11px] sm:text-xs font-medium text-[#6B7280] truncate mr-1">
                  {item.label}
                </span>
                <div className="p-1 sm:p-1.5 rounded-lg bg-white text-gray-900 shadow-2xs shrink-0 border border-gray-100">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="text-xs sm:text-sm md:text-base font-extrabold text-[#1A1A1A] tracking-tight truncate">
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
