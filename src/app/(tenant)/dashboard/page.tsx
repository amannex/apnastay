import React from 'react';
import type { Metadata } from 'next';
import TenantDashboardPage from '@/views/TenantDashboardPage';

export const metadata: Metadata = {
  title: 'Tenant Dashboard | ApnaStay India',
  description: 'Manage your verified zero-brokerage apartment tours, NFC smart-lock keys, and legal e-agreements.'
};

export default function Page() {
  return <TenantDashboardPage />;
}
