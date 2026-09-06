import React from 'react';
import type { Metadata } from 'next';
import OwnerDashboardShell from '@/components/dashboard/OwnerDashboardShell';
import AddPropertyWizard from '@/features/properties/components/wizard/AddPropertyWizard';

export const metadata: Metadata = {
  title: 'Add New Property | ApnaStay Owner Portal',
  description: 'List your house, apartment, PG, hostel, or commercial rental property on ApnaStay.'
};

export default function NewPropertyPage() {
  return (
    <OwnerDashboardShell activeTab="properties">
      <div className="py-2 sm:py-4">
        <AddPropertyWizard />
      </div>
    </OwnerDashboardShell>
  );
}
