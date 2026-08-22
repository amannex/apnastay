import React from 'react';
import type { Metadata } from 'next';
import TenantSubPagePlaceholder from '@/views/TenantSubPagePlaceholder';

export const metadata: Metadata = {
  title: 'Saved Properties & Wishlist | ApnaStay India',
  description: 'View your saved zero-brokerage residential properties across Tier-2 Indian hubs.',
};

export default function WishlistPage() {
  return (
    <TenantSubPagePlaceholder
      title="Saved Properties & Wishlist"
      description="Keep track of your favorite apartments, compare amenities, and schedule NFC smart-lock tours."
      activeTab="wishlist"
      badgeText="Saved Listings"
      iconType="wishlist"
    />
  );
}
