import React from 'react';
import type { Metadata } from 'next';
import OwnerSubPagePlaceholder from '@/views/OwnerSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'Rental Earnings & Payments | OwnStay India',
  description: 'Monitor your 100% zero-brokerage rental income, security deposits, and UPI Autopay receipts.',
};

export default function PaymentsPage() {
  return (
    <OwnerSubPagePlaceholder
      title="Rental Earnings & Payments"
      description="Track monthly rent disbursements, security deposit records, and 100% zero-brokerage earnings."
      activeTab="payments"
      badgeText="0% Fee Revenue"
      iconType="payments"
    />
  );
}
