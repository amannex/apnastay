'use client';

import React, { useState } from 'react';
import {
  Heart,
  PhoneCall,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { NormalizedProperty } from '../../adapter';
import ContactOwnerModal from './ContactOwnerModal';
import PropertyShareModal from './PropertyShareModal';

interface PropertyActionsSectionProps {
  property: NormalizedProperty;
}

export default function PropertyActionsSection({ property }: PropertyActionsSectionProps) {
  const { wishlistIds, onToggleWishlist, onBookVisit } = useApp();
  const isWishlisted = wishlistIds.includes(property.id);

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [visitScheduled, setVisitScheduled] = useState(false);

  const { pricing, availability } = property;

  const handleScheduleVisit = () => {
    if (onBookVisit) {
      onBookVisit(property as any);
    }
    setVisitScheduled(true);
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-apple space-y-6">
        {/* PRICE DISPLAY */}
        <div className="space-y-2 pb-5 border-b border-gray-100">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
                {pricing.rentDisplay}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#6B7280]">
                {' '}
                /{pricing.billingPeriod}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-gray-700" />
              {pricing.brokerageDisplay}
            </span>
          </div>

          {/* AVAILABILITY STATUS */}
          <div className="flex items-center gap-2 pt-0.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200/80 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-gray-700" />
              <span>
                {availability.isImmediate ? 'Available Now' : availability.displayStatus}
              </span>
            </div>
            {availability.availableFrom && !availability.isImmediate && (
              <span className="text-[11px] text-gray-500 font-medium">
                From {availability.availableFrom}
              </span>
            )}
          </div>
        </div>

        {/* DETAILED CHARGES BREAKDOWN (Only displaying available values, never invented) */}
        <div className="space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between text-[#6B7280]">
            <span>Monthly Rent</span>
            <span className="font-semibold text-gray-900">{pricing.rentDisplay}</span>
          </div>

          {pricing.depositDisplay && (
            <div className="flex justify-between text-[#6B7280]">
              <span>Security Deposit</span>
              <span className="font-semibold text-gray-900">{pricing.depositDisplay}</span>
            </div>
          )}

          {pricing.maintenanceDisplay && (
            <div className="flex justify-between text-[#6B7280]">
              <span>Society Maintenance</span>
              <span className="font-semibold text-gray-900">{pricing.maintenanceDisplay}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-700 font-medium">
            <span>Brokerage Commission</span>
            <span className="font-bold text-gray-900">₹0 (Zero Brokerage)</span>
          </div>

          {pricing.totalMoveInDisplay && (
            <div className="flex justify-between text-gray-900 pt-3 border-t border-gray-100 font-bold">
              <span>Estimated Move-in Total</span>
              <span className="text-gray-900 font-extrabold">{pricing.totalMoveInDisplay}</span>
            </div>
          )}
        </div>

        {/* PRIMARY & SECONDARY ACTIONS */}
        <div className="space-y-3 pt-1">
          {/* PRIMARY CTA: Contact Owner */}
          <button
            type="button"
            onClick={() => setContactModalOpen(true)}
            className="w-full py-4 px-4 rounded-2xl bg-[#E1224D] hover:bg-[#C71B42] text-white font-extrabold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <PhoneCall className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Contact Owner</span>
          </button>

          {/* SECONDARY CTA: Schedule Visit */}
          <button
            type="button"
            onClick={handleScheduleVisit}
            className="w-full py-3.5 px-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-xs sm:text-sm border border-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <Calendar className="w-4 h-4 text-gray-900" />
            <span>{visitScheduled ? '✓ Visit Scheduled' : 'Schedule Visit'}</span>
          </button>
        </div>

        {/* WISHLIST & SHARE ACTIONS */}
        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onToggleWishlist(property.id)}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${
              isWishlisted
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
            }`}
            aria-label={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? 'fill-white text-white' : 'text-gray-400'
              }`}
            />
            <span>{isWishlisted ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="py-2.5 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            aria-label="Share this property"
          >
            <Share2 className="w-4 h-4 text-gray-500" />
            <span>Share</span>
          </button>
        </div>

        {/* TRUST BANNER */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#6B7280] text-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-gray-900 shrink-0" />
          <span>100% Verified ownership • Direct owner lease</span>
        </div>
      </div>

      {/* CONTACT OWNER MODAL */}
      <ContactOwnerModal
        property={property}
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      {/* SHARE MODAL */}
      <PropertyShareModal
        property={property}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </>
  );
}
