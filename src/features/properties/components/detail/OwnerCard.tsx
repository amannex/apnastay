'use client';

import React, { useState } from 'react';
import { User, ShieldCheck, Clock, MessageSquare, PhoneCall } from 'lucide-react';
import type { NormalizedProperty } from '../../adapter';

interface OwnerCardProps {
  property: NormalizedProperty;
}

export default function OwnerCard({ property }: OwnerCardProps) {
  const { owner } = property;
  const [showContact, setShowContact] = useState(false);

  return (
    <section aria-label="Property owner" className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDEDED] shadow-sm space-y-5">
      <div className="flex items-center gap-4">
        {owner.avatar ? (
          <img
            src={owner.avatar}
            alt={owner.name}
            className="w-14 h-14 rounded-2xl object-cover border border-gray-200"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-[#E1224D]">
            <User className="w-7 h-7" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] truncate">
              {owner.name}
            </h3>
            {owner.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Verified Owner
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">{owner.role || 'Property Partner'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 text-xs">
        <div>
          <span className="text-[#6B7280] block">Response Time</span>
          <span className="font-semibold text-gray-900 flex items-center gap-1 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-[#E1224D]" />
            {owner.responseTime}
          </span>
        </div>
        <div>
          <span className="text-[#6B7280] block">Community Member</span>
          <span className="font-semibold text-gray-900 mt-0.5 block">
            Since {owner.memberSince || '2026'}
          </span>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowContact(!showContact)}
          className="w-full py-3 px-4 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>{showContact ? 'Direct Contact: +91 98XXX XXXXX' : 'Connect with Owner'}</span>
        </button>
      </div>
    </section>
  );
}
