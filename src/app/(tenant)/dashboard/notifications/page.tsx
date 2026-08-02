import React from 'react';
import type { Metadata } from 'next';
import TenantSubPagePlaceholder from '@/views/TenantSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'Notifications & Alerts | OwnStay India',
  description: 'Stay updated on tour reminders, rent due dates, and agreement milestones.',
};

export default function NotificationsPage() {
  return (
    <TenantSubPagePlaceholder
      title="Notifications & Alerts"
      description="Real-time alerts for upcoming NFC self-guided visits, rent autopay triggers, and owner responses."
      activeTab="notifications"
      badgeText="Alert Feed"
      iconType="notifications"
    />
  );
}
