import React from 'react';
import type { Metadata } from 'next';
import OwnerSubPagePlaceholder from '@/views/OwnerSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'Landlord Profile & KYC Status | OwnStay India',
  description: 'Manage your owner verification status, PAN/Aadhaar KYC documents, and payout bank accounts.',
};

export default function ProfilePage() {
  return (
    <OwnerSubPagePlaceholder
      title="Landlord Profile & KYC Status"
      description="Update your owner account details, verify KYC documents, and manage payout bank credentials."
      activeTab="profile"
      badgeText="KYC & Identity"
      iconType="profile"
    />
  );
}
