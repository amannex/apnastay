import React from 'react';
import type { Metadata } from 'next';
import OwnerSubPagePlaceholder from '@/views/OwnerSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'Owner Notifications & Alerts | OwnStay India',
  description: 'Real-time alerts for KYC verification updates, NFC self-tour entries, and rent credits.',
};

export default function NotificationsPage() {
  return (
    <OwnerSubPagePlaceholder
      title="Owner Notifications & Alerts"
      description="Stay informed about KYC verification status changes, NFC smart-lock entry triggers, and automated rent deposits."
      activeTab="notifications"
      badgeText="Real-Time Alerts"
      iconType="notifications"
    />
  );
}
