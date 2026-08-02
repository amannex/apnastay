import React from 'react';
import type { Metadata } from 'next';
import TenantSubPagePlaceholder from '@/views/TenantSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'Tenant Profile & KYC | OwnStay India',
  description: 'Manage your profile details, verified Aadhaar/PAN status, and security preferences.',
};

export default function ProfilePage() {
  return (
    <TenantSubPagePlaceholder
      title="Tenant Profile & KYC"
      description="Update your contact information, verify identity documents, and manage your account security settings."
      activeTab="profile"
      badgeText="Verified Account"
      iconType="profile"
    />
  );
}
