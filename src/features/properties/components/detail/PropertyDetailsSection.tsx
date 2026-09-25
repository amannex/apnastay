'use client';

import React from 'react';
import type { NormalizedProperty } from '../../adapter';

interface PropertyDetailsSectionProps {
  property: NormalizedProperty;
}

export default function PropertyDetailsSection({ property }: PropertyDetailsSectionProps) {
  const { specs, pricing, propertyTypeLabel, rentalStructure } = property;

  const detailRows: Array<{ label: string; value: string }> = [];

  detailRows.push({ label: 'Property Type', value: propertyTypeLabel });

  if (rentalStructure) {
    const cleanRental = rentalStructure.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    detailRows.push({ label: 'Rental Structure', value: cleanRental });
  }

  if (specs.roomType) {
    detailRows.push({ label: 'Room Configuration', value: specs.roomType });
  }

  if (specs.bedrooms !== undefined && specs.bedrooms !== null) {
    detailRows.push({ label: 'Bedrooms', value: String(specs.bedrooms) });
  }

  if (specs.bathrooms !== undefined && specs.bathrooms !== null) {
    detailRows.push({ label: 'Bathrooms', value: String(specs.bathrooms) });
  }

  if (specs.sqft) {
    detailRows.push({ label: 'Carpet Area', value: `${specs.sqft.toLocaleString()} sq.ft.` });
  }

  if (specs.furnishing) {
    detailRows.push({ label: 'Furnishing Status', value: specs.furnishing });
  }

  if (specs.floor !== undefined && specs.floor !== null) {
    detailRows.push({ label: 'Floor Level', value: String(specs.floor) });
  }

  if (specs.parking) {
    detailRows.push({ label: 'Parking Space', value: specs.parking });
  }

  if (pricing.depositDisplay) {
    detailRows.push({ label: 'Security Deposit', value: pricing.depositDisplay });
  }

  if (pricing.maintenanceDisplay) {
    detailRows.push({ label: 'Monthly Maintenance', value: pricing.maintenanceDisplay });
  }

  detailRows.push({ label: 'Brokerage Fee', value: '₹0 (Direct Owner)' });

  return (
    <section aria-label="Property specifications" className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDEDED] shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-[#1A1A1A]">
        Property Specifications
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 pt-2">
        {detailRows.map((row, idx) => (
          <div key={idx} className="flex justify-between py-2 border-b border-gray-100 text-xs sm:text-sm">
            <span className="text-[#6B7280] font-medium">{row.label}</span>
            <span className="text-gray-900 font-semibold text-right">{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
