import React from 'react';
import type { Metadata } from 'next';
import TenantSubPagePlaceholder from '@/views/TenantSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'Digital E-Agreements & Legal Deeds | ApnaStay India',
  description: 'Access your Aadhaar & PAN e-signed legally stamped rental deeds.',
};

export default function AgreementsPage() {
  return (
    <TenantSubPagePlaceholder
      title="Digital E-Agreements"
      description="Review and download your legally enforceable Aadhaar/PAN e-signed rental deeds stamped under the Registration Act."
      activeTab="agreements"
      badgeText="Legal Deeds"
      iconType="agreements"
    />
  );
}
