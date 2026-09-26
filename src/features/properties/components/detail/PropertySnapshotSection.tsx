'use client';

import React from 'react';
import {
  Bed,
  Bath,
  Ruler,
  Sofa,
  Building,
  Calendar,
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
  const { specs, availability, propertyType } = property;

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
        value: `${specs.sqft.toLocaleString()} sq ft`,
        icon: Ruler
      });
    } else if (specs.plotArea) {
      snapshotItems.push({
        id: 'plotArea',
        label: 'Plot Area',
        value: specs.plotArea,
        icon: Ruler
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
        value: `${specs.sqft.toLocaleString()} sq ft`,
        icon: Ruler
      });
    }

    if (specs.furnishing) {
      const cleanFurnishing = specs.furnishing.replace(/\s*\(.*?\)/g, '').trim() || specs.furnishing;
      snapshotItems.push({
        id: 'furnishing',
        label: 'Furnishing',
        value: cleanFurnishing,
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
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
          Property Snapshot
        </h2>
      </div>

      {/* CLEAN UNBOXED SNAPSHOT SPECIFICATIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 sm:gap-x-8 pt-1">
        {snapshotItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center gap-2.5"
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-black shrink-0" />
              <span className="text-sm sm:text-base font-medium text-gray-600">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
