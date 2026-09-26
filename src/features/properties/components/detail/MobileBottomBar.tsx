'use client';

import React, { useState } from 'react';
import { Heart, PhoneCall } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { NormalizedProperty } from '../../adapter';
import ContactOwnerModal from './ContactOwnerModal';

interface MobileBottomBarProps {
  property: NormalizedProperty;
}

export default function MobileBottomBar({ property }: MobileBottomBarProps) {
  const { wishlistIds, onToggleWishlist } = useApp();
  const isWishlisted = wishlistIds.includes(property.id);

  const [contactModalOpen, setContactModalOpen] = useState(false);

  const { pricing } = property;

  return (
    <>
      <nav
        aria-label="Mobile quick actions"
        className="block lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 px-3 sm:px-4 py-2.5 sm:py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      >
        <div className="max-w-lg mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* Price & Deposit Preview */}
          <div className="min-w-0 shrink">
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-extrabold text-[#1A1A1A] tracking-tight whitespace-nowrap">
                {pricing.rentDisplay}
              </span>
              <span className="text-xs text-[#6B7280] font-medium">/mo</span>
            </div>
            <p className="text-[10px] text-gray-600 font-semibold truncate hidden xs:block">
              {pricing.depositDisplay
                ? `Deposit ${pricing.depositDisplay} • ₹0 Brokerage`
                : '₹0 Brokerage • Verified'}
            </p>
          </div>

          {/* Action Buttons: Wishlist + Primary Contact Owner */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => onToggleWishlist(property.id)}
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${
                isWishlisted
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
              aria-label={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
              title={isWishlisted ? 'Saved' : 'Save'}
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  isWishlisted ? 'fill-white text-white' : ''
                }`}
              />
            </button>

            {/* Primary Action Button: Contact Owner */}
            <button
              type="button"
              onClick={() => setContactModalOpen(true)}
              className="py-2.5 sm:py-3 px-3.5 sm:px-5 rounded-xl sm:rounded-2xl bg-[#E1224D] hover:bg-[#C71B42] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Contact Owner</span>
            </button>
          </div>
        </div>
      </nav>

      {/* CONTACT OWNER MODAL (Shared with mobile) */}
      <ContactOwnerModal
        property={property}
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </>
  );
}
