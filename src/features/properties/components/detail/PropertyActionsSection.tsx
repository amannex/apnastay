'use client';

import React, { useState } from 'react';
import { Heart, Share2, PhoneCall, Calendar, ShieldCheck, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { NormalizedProperty } from '../../adapter';

interface PropertyActionsSectionProps {
  property: NormalizedProperty;
}

export default function PropertyActionsSection({ property }: PropertyActionsSectionProps) {
  const { wishlistIds, onToggleWishlist, onBookVisit } = useApp();
  const isWishlisted = wishlistIds.includes(property.id);
  const [copied, setCopied] = useState(false);
  const [contacted, setContacted] = useState(false);

  const { pricing, availability } = property;

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out ${property.title} on ApnaStay — India's Zero-Brokerage Platform!`,
          url: window.location.href
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }

    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleContactOwner = () => {
    setContacted(true);
  };

  const handleScheduleVisit = () => {
    if (onBookVisit) {
      onBookVisit(property as any);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDEDED] shadow-sm space-y-6">
      {/* Price Header */}
      <div className="flex items-baseline justify-between pb-5 border-b border-gray-100">
        <div>
          <span className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            {pricing.rentDisplay}
          </span>
          <span className="text-sm font-medium text-[#6B7280]"> /{pricing.billingPeriod}</span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          {pricing.brokerageDisplay}
        </span>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-2.5 text-xs sm:text-sm">
        <div className="flex justify-between text-[#6B7280]">
          <span>Monthly Rent</span>
          <span className="font-semibold text-gray-900">{pricing.rentDisplay}</span>
        </div>

        {pricing.depositDisplay && (
          <div className="flex justify-between text-[#6B7280]">
            <span>Security Deposit (Refundable)</span>
            <span className="font-semibold text-gray-900">{pricing.depositDisplay}</span>
          </div>
        )}

        {pricing.maintenanceDisplay && (
          <div className="flex justify-between text-[#6B7280]">
            <span>Maintenance</span>
            <span className="font-semibold text-gray-900">{pricing.maintenanceDisplay}</span>
          </div>
        )}

        <div className="flex justify-between text-emerald-600 font-medium">
          <span>Brokerage</span>
          <span className="font-bold">₹0 (Zero Brokerage)</span>
        </div>

        {pricing.totalMoveInDisplay && (
          <div className="flex justify-between text-gray-900 pt-3 border-t border-gray-100 font-bold">
            <span>Estimated Move-in Total</span>
            <span className="text-[#E1224D]">{pricing.totalMoveInDisplay}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleContactOwner}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#E1224D] hover:bg-[#c91d43] text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <PhoneCall className="w-4 h-4" />
          <span>{contacted ? 'Owner Contact: +91 98XXX XXXXX' : 'Contact Owner'}</span>
        </button>

        <button
          type="button"
          onClick={handleScheduleVisit}
          className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold text-sm border border-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-[#E1224D]" />
          <span>Schedule Visit</span>
        </button>
      </div>

      {/* Quick utility actions: Wishlist + Share */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-[#6B7280]">
        <button
          type="button"
          onClick={() => onToggleWishlist(property.id)}
          className={`inline-flex items-center gap-2 py-2 px-3 rounded-xl border transition-colors cursor-pointer ${
            isWishlisted
              ? 'border-rose-200 bg-rose-50 text-rose-600'
              : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : 'text-gray-500'}`} />
          <span>{isWishlisted ? 'Saved' : 'Save to Wishlist'}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 py-2 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-gray-500" />}
          <span>{copied ? 'Link Copied!' : 'Share'}</span>
        </button>
      </div>
    </div>
  );
}
