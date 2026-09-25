'use client';

import React, { useState } from 'react';
import { MapPin, ShieldCheck, Calendar, Heart, Share2, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { NormalizedProperty } from '../../adapter';

interface PropertyHeroSectionProps {
  property: NormalizedProperty;
}

export default function PropertyHeroSection({ property }: PropertyHeroSectionProps) {
  const { wishlistIds, onToggleWishlist, authenticated, onOpenAuthModal } = useApp();
  const isWishlisted = wishlistIds.includes(property.id);

  const [copied, setCopied] = useState(false);
  const [wishlistToast, setWishlistToast] = useState(false);

  const { title, propertyTypeLabel, location, verification, availability } = property;

  const handleToggleWishlist = () => {
    onToggleWishlist(property.id);
    setWishlistToast(true);
    setTimeout(() => setWishlistToast(false), 2000);
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out ${property.title} on ApnaStay — India's Zero-Brokerage Platform!`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
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

          {/* Verification Badge */}
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
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
            aria-label="Share this property"
            title="Share property link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-gray-500" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Wishlist Action */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer ${
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
            <div className="absolute right-0 -bottom-9 bg-[#1A1A1A] text-white text-[11px] font-medium px-3 py-1 rounded-lg shadow-md whitespace-nowrap z-20 animate-fade-in">
              {isWishlisted ? 'Saved to wishlist!' : 'Removed from wishlist'}
            </div>
          )}
        </div>
      </div>

      {/* Main Property Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
        {title}
      </h1>

      {/* Location Bar */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-[#6B7280]">
        <div className="inline-flex items-center gap-1.5 font-medium text-gray-800">
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
    </section>
  );
}
