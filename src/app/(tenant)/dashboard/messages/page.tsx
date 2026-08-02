import React from 'react';
import type { Metadata } from 'next';
import TenantSubPagePlaceholder from '@/views/TenantSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'Owner & Support Messages | OwnStay India',
  description: 'Communicate securely with verified property owners and OwnStay support.',
};

export default function MessagesPage() {
  return (
    <TenantSubPagePlaceholder
      title="Messages & Inbox"
      description="Chat directly with verified property owners to coordinate visits, clarify amenities, and finalize move-in details."
      activeTab="messages"
      badgeText="Direct Messaging"
      iconType="messages"
    />
  );
}
