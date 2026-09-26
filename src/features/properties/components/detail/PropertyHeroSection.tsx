'use client';

import React, { useState } from 'react';
import { MapPin, ShieldCheck, Calendar, Heart, Share2, Check } from 'lucide-react';
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

  const { title, propertyTypeLabel, location, verification, availability } = property;

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
    // If mobile navigator.share is supported, we can either invoke it or open modal
    setIsShareModalOpen(true);
  };

  return (
    <section aria-label="Property hero information" className="space-y-4">
      {/* Top Meta Badges & Quick Save/Share Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Property Type Badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-50 text-[#ED3258] text-xs font-bold uppercase tracking-wider">
            {propertyTypeLabel}
          </span>

          {/* Verification Badge - Data-driven, never decorative */}
          {verification.isVerified && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ApnaStay Verified
            </span>
          )}

          {/* Availability Status */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            {availability.displayStatus}
          </span>
        </div>

        {/* Action Buttons: Save to Wishlist & Share */}
        <div className="flex items-center gap-2 relative">
          {/* Share Action */}
          <button
            type="button"
            onClick={handleShareClick}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[11px] sm:text-xs font-semibold text-gray-700 transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258]"
            aria-label="Share this property"
            title="Share property via WhatsApp, Copy Link, etc."
          >
            <Share2 className="w-3.5 h-3.5 text-gray-500" />
            <span>Share</span>
          </button>

          {/* Wishlist Action */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258] ${
              isWishlisted
                ? 'border-rose-200 bg-rose-50 text-[#ED3258]'
                : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            title={isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform ${
                isWishlisted ? 'fill-[#ED3258] text-[#ED3258] scale-110' : 'text-gray-500'
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
                  className="underline text-rose-300 hover:text-white font-bold cursor-pointer"
                >
                  Sign in
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Property Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight break-words">
        {title}
      </h1>

      {/* Location Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#6B7280]">
        <div className="inline-flex items-center gap-1.5 font-medium text-gray-800 break-words">
          <MapPin className="w-4 h-4 text-[#ED3258] shrink-0" />
          <span>{location.displayLocation}</span>
        </div>

        {location.state && (
          <span className="text-gray-400 hidden sm:inline">• {location.state}</span>
        )}

        {location.pincode && (
          <span className="text-gray-400 hidden md:inline">• PIN: {location.pincode}</span>
        )}
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
