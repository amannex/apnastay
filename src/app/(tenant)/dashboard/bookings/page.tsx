import React from 'react';
import type { Metadata } from 'next';
import TenantSubPagePlaceholder from '@/views/TenantSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'Rental Bookings & Applications | OwnStay India',
  description: 'Track your ongoing rental booking applications and move-in status.',
};

export default function BookingsPage() {
  return (
    <TenantSubPagePlaceholder
      title="Bookings & Move-In Status"
      description="Review your active zero-brokerage rental applications, owner approvals, and move-in schedules."
      activeTab="bookings"
      badgeText="Active Applications"
      iconType="bookings"
    />
  );
}
