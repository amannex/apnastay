import React from 'react';
import type { Metadata } from 'next';
import OwnerSubPagePlaceholder from '@/views/OwnerSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'Tenant Applications & Bookings | OwnStay India',
  description: 'Review prospective tenant rental applications and approve zero-brokerage bookings.',
};

export default function BookingsPage() {
  return (
    <OwnerSubPagePlaceholder
      title="Tenant Applications & Bookings"
      description="Review tenant KYC profiles, approve rental applications, and initiate Aadhaar/PAN e-signed agreements."
      activeTab="bookings"
      badgeText="Booking Approvals"
      iconType="bookings"
    />
  );
}
