
import React from 'react';
import type { Metadata } from 'next';
import OwnerDashboardShell from '@/components/dashboard/OwnerDashboardShell';
import OwnerPropertiesView from '@/features/properties/components/dashboard/OwnerPropertiesView';
import PropertyErrorBoundary from '@/features/properties/components/PropertyErrorBoundary';

export const metadata: Metadata = {
  title: 'My Property Listings | ApnaStay India',
  description: 'Manage, view, and monitor your listed properties across Indian cities.',
};

export default function PropertiesPage() {
  return (
    <OwnerDashboardShell activeTab="properties">
      <div className="py-2 sm:py-4">
        <PropertyErrorBoundary fallbackTitle="Unable to load property portfolio">
          <OwnerPropertiesView />
        </PropertyErrorBoundary>
      </div>
    </OwnerDashboardShell>
  );
}
