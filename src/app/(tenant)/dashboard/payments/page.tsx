import React from 'react';
import type { Metadata } from 'next';
import TenantSubPagePlaceholder from '@/views/TenantSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'Rent Payments & Autopay | OwnStay India',
  description: 'Manage your monthly zero-brokerage rent transfers, security deposits, and UPI Autopay.',
};

export default function PaymentsPage() {
  return (
    <TenantSubPagePlaceholder
      title="Rent Payments & Autopay"
      description="View your automated rent payment schedule, security deposit receipts, and UPI transaction history."
      activeTab="payments"
      badgeText="Zero-Fee Payments"
      iconType="payments"
    />
  );
}
