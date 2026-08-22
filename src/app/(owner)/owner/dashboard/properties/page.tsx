import React from 'react';
import type { Metadata } from 'next';
import OwnerSubPagePlaceholder from '@/views/OwnerSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'My Property Listings | ApnaStay India',
  description: 'Manage your verified residential properties across Tier-2 Indian hubs.',
};

export default function PropertiesPage() {
  return (
    <OwnerSubPagePlaceholder
      title="My Property Listings"
      description="List new properties, configure NFC smart-lock tours, and publish verified zero-brokerage rentals."
      activeTab="properties"
      badgeText="Property Portfolio"
      iconType="properties"
    />
  );
}
