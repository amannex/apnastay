import React from 'react';
import type { Metadata } from 'next';
import OwnerDashboardShell from '@/components/dashboard/OwnerDashboardShell';
import AddPropertyWizard from '@/features/properties/components/wizard/AddPropertyWizard';

export const metadata: Metadata = {
  title: 'Edit Property | ApnaStay Owner Portal',
  description: 'Update property details, photos, units, pricing, amenities, and house rules on ApnaStay.'
};

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ step?: string; mode?: string }>;
}

export default async function EditPropertyPage({ params, searchParams }: EditPropertyPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialStep = resolvedSearchParams?.step ? Number(resolvedSearchParams.step) : undefined;
  const mode = resolvedSearchParams?.mode === 'review' ? 'review' : 'edit';

  return (
    <OwnerDashboardShell activeTab="properties">
      <div className="py-2 sm:py-4">
        <AddPropertyWizard
          mode={mode}
          propertyId={resolvedParams.id}
          initialStep={initialStep}
        />
      </div>
    </OwnerDashboardShell>
  );
}
