import React from 'react';
import type { Metadata } from 'next';
import OwnerSubPagePlaceholder from '@/views/OwnerSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'Room Inventory & Pricing | OwnStay India',
  description: 'Manage rooms, occupancy status, and zero-brokerage rental pricing.',
};

export default function RoomsPage() {
  return (
    <OwnerSubPagePlaceholder
      title="Room Inventory & Pricing"
      description="Manage individual room units, BHK configurations, occupancy rates, and monthly rent schedules."
      activeTab="rooms"
      badgeText="Room Management"
      iconType="rooms"
    />
  );
}
