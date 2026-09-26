'use client';

import React, { useState } from 'react';
import { Heart, Share2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { NormalizedProperty } from '../../adapter';
import PropertyShareModal from './PropertyShareModal';

interface PropertyHeroSectionProps {
  property: NormalizedProperty;
}

export default function PropertyHeroSection({ property }: PropertyHeroSectionProps) {
  const { wishlistIds, onToggleWishlist, authenticated, onOpenAuthModal } = useApp();
  const isWishlisted = wishlistIds.includes(property.id);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);

  const { title } = property;

  const handleToggleWishlist = () => {
    onToggleWishlist(property.id);
    if (!isWishlisted) {
      if (authenticated) {
        setWishlistToast('Saved to your account!');
      } else {
        setWishlistToast('Saved to device! Sign in to sync across devices.');
      }
    } else {
      setWishlistToast('Removed from saved properties');
    }

    setTimeout(() => setWishlistToast(null), 3000);
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  return (
    <section aria-label="Property hero information" className="pb-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Main Property Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight leading-tight break-words min-w-0">
          {title}
        </h1>

        {/* Action Buttons: Save to Wishlist & Share - Clean Airbnb style */}
        <div className="flex items-center gap-1 sm:gap-2 relative self-start sm:self-auto">
          {/* Share Action */}
          <button
            type="button"
            onClick={handleShareClick}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-xs sm:text-sm font-semibold text-gray-900 underline underline-offset-4 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            aria-label="Share this property"
          >
            <Share2 className="w-4 h-4 text-gray-900" />
            <span>Share</span>
          </button>

          {/* Wishlist Action */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-xs sm:text-sm font-semibold text-gray-900 underline underline-offset-4 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                isWishlisted ? 'fill-[#E1224D] text-[#E1224D]' : 'text-gray-900'
              }`}
            />
            <span>{isWishlisted ? 'Saved' : 'Save'}</span>
          </button>

          {/* Transient Visual Feedback */}
          {wishlistToast && (
            <div className="absolute right-0 -bottom-10 bg-[#1A1A1A] text-white text-[11px] font-medium px-3.5 py-1.5 rounded-xl shadow-lg whitespace-nowrap z-20 animate-fade-in flex items-center gap-2">
              <span>{wishlistToast}</span>
              {!authenticated && !isWishlisted && (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="underline text-gray-300 hover:text-white font-bold cursor-pointer"
                >
                  Sign in
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal Dialog */}
      <PropertyShareModal
        property={property}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </section>
  );
}
