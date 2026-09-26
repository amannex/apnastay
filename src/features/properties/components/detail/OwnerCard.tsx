'use client';

import React, { useState } from 'react';
import { User, ShieldCheck, Clock, Calendar, MessageSquare } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';
import ContactOwnerModal from './ContactOwnerModal';

interface OwnerCardProps {
  property: NormalizedProperty;
}

export default function OwnerCard({ property }: OwnerCardProps) {
  const { owner } = property;
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Format response time string cleanly if present
  const formattedResponseTime = owner.responseTime
    ? (owner.responseTime.toLowerCase().startsWith('within') || owner.responseTime.toLowerCase().startsWith('under')
        ? `Usually responds ${owner.responseTime.toLowerCase()}`
        : `Usually responds within ${owner.responseTime}`)
    : 'Usually responds within 2 hours';

  const memberSinceYear = owner.memberSince || '2026';

  return (
    <>
      <section
        aria-label="Property owner details"
        className="py-6 sm:py-8 space-y-5"
      >
        {/* Header: Avatar, Name, Role, Verified Pill */}
        <div className="flex items-start gap-4">
          {/* Owner Avatar */}
          {owner.avatar ? (
            <img
              src={owner.avatar}
              alt={owner.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shrink-0 border border-gray-100 shadow-2xs"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 shrink-0">
              <User className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
          )}

          {/* Name & Role & Verified Badge */}
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] leading-tight truncate">
              {owner.name}
            </h3>
            <p className="text-sm text-gray-500 font-normal">
              {owner.role || 'Property Owner'}
            </p>

            {/* Identity Verified Badge */}
            {(owner.verified ?? true) && (
              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100/90 text-gray-800 border border-gray-200/80 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-800 shrink-0" />
                  <span>Identity Verified</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details: Member Since & Response Time */}
        <div className="space-y-2.5 text-sm text-gray-600 font-normal pt-1">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span>Member since {memberSinceYear}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{formattedResponseTime}</span>
          </div>
        </div>

        {/* Primary Contact CTA Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsContactModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#1A1A1A] hover:bg-black text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Owner</span>
          </button>
        </div>
      </section>

      {/* Standard Contact Flow Modal */}
      <ContactOwnerModal
        property={property}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}
