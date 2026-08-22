import React from 'react';
import type { Metadata } from 'next';
import OwnerDashboardPage from '@/views/OwnerDashboardPage';

export const metadata: Metadata = {
  title: 'Owner Portal Dashboard | ApnaStay India',
  description: 'Manage your verified residential properties in Tier-2 Indian hubs with zero brokerage and NFC smart-lock tours.'
};

export default function Page() {
  return <OwnerDashboardPage />;
}
