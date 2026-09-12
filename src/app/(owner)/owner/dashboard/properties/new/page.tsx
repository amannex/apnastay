import React from 'react';
import type { Metadata } from 'next';
import OwnerDashboardShell from '@/components/dashboard/OwnerDashboardShell';
import AddPropertyWizard from '@/features/properties/components/wizard/AddPropertyWizard';
import PropertyErrorBoundary from '@/features/properties/components/PropertyErrorBoundary';

export const metadata: Metadata = {
  title: 'Add New Property | ApnaStay Owner Portal',
  description: 'List your property, rooms, PG, or co-living space on ApnaStay.',
};

export default function NewPropertyPage() {
  return (
    <OwnerDashboardShell activeTab="properties">
      <div className="py-2 sm:py-4">
        <PropertyErrorBoundary fallbackTitle="Unable to load property creation wizard">
          <AddPropertyWizard />
        </PropertyErrorBoundary>
      </div>
    </OwnerDashboardShell>
  );
}
