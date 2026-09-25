'use client';

import React from 'react';
import { Bed, Bath, Maximize2, Sofa, Building, Car, Calendar, Compass } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface PropertySnapshotSectionProps {
  property: NormalizedProperty;
}

export default function PropertySnapshotSection({ property }: PropertySnapshotSectionProps) {
  const { specs, availability, propertyTypeLabel } = property;

  const snapshotItems: Array<{ label: string; value: string; icon: React.ComponentType<{ className?: string }> }> = [];

  if (specs.bedrooms !== undefined && specs.bedrooms !== null) {
    snapshotItems.push({
      label: 'Bedrooms',
      value: `${specs.bedrooms} ${specs.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}`,
      icon: Bed
    });
  }

  if (specs.bathrooms !== undefined && specs.bathrooms !== null) {
    snapshotItems.push({
      label: 'Bathrooms',
      value: `${specs.bathrooms} ${specs.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}`,
      icon: Bath
    });
  }

  if (specs.sqft !== undefined && specs.sqft !== null && specs.sqft > 0) {
    snapshotItems.push({
      label: 'Super / Built Area',
      value: `${specs.sqft.toLocaleString()} sq.ft.`,
      icon: Maximize2
    });
  }

  if (specs.furnishing) {
    snapshotItems.push({
      label: 'Furnishing',
      value: specs.furnishing,
      icon: Sofa
    });
  }

  if (specs.floor !== undefined && specs.floor !== null) {
    snapshotItems.push({
      label: 'Floor',
      value: String(specs.floor),
      icon: Building
    });
  }

  if (specs.parking) {
    snapshotItems.push({
      label: 'Parking',
      value: specs.parking,
      icon: Car
    });
  }

  snapshotItems.push({
    label: 'Property Type',
    value: propertyTypeLabel,
    icon: Compass
  });

  snapshotItems.push({
    label: 'Availability',
    value: availability.displayStatus,
    icon: Calendar
  });

  if (snapshotItems.length === 0) {
    return null;
  }

  return (
    <section aria-label="Property snapshot overview" className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDEDED] shadow-sm">
      <h2 className="text-lg font-bold text-[#1A1A1A] mb-5">
        Property Snapshot
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {snapshotItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-gray-100 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white text-[#E1224D] shadow-2xs shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[#6B7280] truncate">{item.label}</p>
                <p className="text-xs sm:text-sm font-bold text-[#1A1A1A] truncate mt-0.5">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
