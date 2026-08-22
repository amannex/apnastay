import React from 'react';
import type { Metadata } from 'next';
import AdminPortalPage from '@/views/AdminPortalPage';

export const metadata: Metadata = {
  title: 'Platform Command Center | ApnaStay India',
  description: 'WordPress authoritative RBAC administrator command center for ApnaStay zero-brokerage rentals.'
};

export default function Page() {
  return <AdminPortalPage />;
}
