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
    : null;

  return (
    <>
      <section
        aria-label="Property owner details"
        className="bg-white rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#EDEDED] shadow-sm space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Owner Avatar */}
          {owner.avatar ? (
            <img
              src={owner.avatar}
              alt={owner.name}
              className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-2xs shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E1224D] shadow-2xs shrink-0">
              <User className="w-8 h-8" />
            </div>
          )}

          {/* Name & Role */}
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-lg font-bold text-[#1A1A1A] truncate">
              {owner.name}
            </h3>
            <p className="text-xs text-[#6B7280]">
              {owner.role || 'Property Owner'}
            </p>

            {/* Identity Verified Badge - Strictly data-driven */}
            {owner.verified && (
              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Identity Verified</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Real Attributes (Member Since & Response Time) - Zero fabrication */}
        {(owner.memberSince || formattedResponseTime) && (
          <div className="space-y-2 py-3 border-y border-gray-100 text-xs">
            {owner.memberSince && (
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Member since {owner.memberSince}</span>
              </div>
            )}

            {formattedResponseTime && (
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formattedResponseTime}</span>
              </div>
            )}
          </div>
        )}

        {/* Primary Contact CTA (Protects Owner Privacy - Opens standard contact flow) */}
        <div>
          <button
            type="button"
            onClick={() => setIsContactModalOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#1A1A1A] hover:bg-black text-white font-bold text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
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
