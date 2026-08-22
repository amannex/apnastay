import React from 'react';
import type { Metadata } from 'next';
import OwnerSubPagePlaceholder from '@/views/OwnerSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'Tenant Messages & Chat | ApnaStay India',
  description: 'Communicate directly with verified prospective tenants.',
};

export default function MessagesPage() {
  return (
    <OwnerSubPagePlaceholder
      title="Tenant Messages & Chat"
      description="Chat directly with prospective tenants to answer queries and coordinate move-in schedules without middlemen."
      activeTab="messages"
      badgeText="Direct Landlord Chat"
      iconType="messages"
    />
  );
}
