'use client';

import React, { useState } from 'react';
import {
  MapPinned,
  ClipboardList,
  PhoneCall,
  Building2,
  Users,
  Handshake,
  type LucideIcon,
} from 'lucide-react';

export type AudienceType = 'tenants' | 'owners';

export interface StepCardData {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const TENANT_CARDS: StepCardData[] = [
  {
    id: 'tenant-01',
    number: '01',
    title: 'Find a place that fits',
    description:
      'Explore rooms, flats, PGs and other accommodation based on your location, budget and requirements.',
    icon: MapPinned,
  },
  {
    id: 'tenant-02',
    number: '02',
    title: 'Know what you’re choosing',
    description:
      'See important property details, photos, rent, amenities and rules in one place before you reach out.',
    icon: ClipboardList,
  },
  {
    id: 'tenant-03',
    number: '03',
    title: 'Rely on accurate listings',
    description:
      'We focus on keeping property information clear and accurate so you can contact owners with more confidence.',
    icon: PhoneCall,
  },
];

export const OWNER_CARDS: StepCardData[] = [
  {
    id: 'owner-01',
    number: '01',
    title: 'List your property',
    description:
      'Add your property details, photos, rent and preferences so potential tenants can discover your space.',
    icon: Building2,
  },
  {
    id: 'owner-02',
    number: '02',
    title: 'Reach the right tenants',
    description:
      'Put your property in front of people actively looking for accommodation in your locality.',
    icon: Users,
  },
  {
    id: 'owner-03',
    number: '03',
    title: 'Keep your listing trustworthy',
    description:
      'Provide clear and accurate property information so tenants know what to expect before contacting you.',
    icon: Handshake,
  },
];

interface AudienceToggleProps {
  activeAudience: AudienceType;
  onChange: (audience: AudienceType) => void;
}

function AudienceToggle({ activeAudience, onChange }: AudienceToggleProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(activeAudience === 'tenants' ? 'owners' : 'tenants');
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Audience view selector"
      onKeyDown={handleKeyDown}
      className="relative inline-flex items-center p-1 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
    >
      {/* Animated sliding background pill */}
      <div
        aria-hidden="true"
        className={`absolute top-1 bottom-1 rounded-full bg-[#ED3258] transition-transform duration-300 ease-out shadow-xs pointer-events-none left-1 w-[calc(50%-4px)] ${
          activeAudience === 'tenants' ? 'translate-x-0' : 'translate-x-full'
        }`}
      />

      <button
        type="button"
        role="tab"
        id="tab-tenants"
        aria-controls="panel-tenants"
        aria-selected={activeAudience === 'tenants'}
        tabIndex={activeAudience === 'tenants' ? 0 : -1}
        onClick={() => onChange('tenants')}
        className={`relative z-10 px-3.5 sm:px-4 py-1.5 min-w-[94px] sm:min-w-[104px] rounded-full text-xs sm:text-[13px] font-semibold tracking-normal transition-colors duration-200 select-none text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258] focus-visible:ring-offset-1 ${
          activeAudience === 'tenants'
            ? 'text-white'
            : 'text-[#4B5563] hover:text-[#111827]'
        }`}
      >
        For Tenants
      </button>

      <button
        type="button"
        role="tab"
        id="tab-owners"
        aria-controls="panel-owners"
        aria-selected={activeAudience === 'owners'}
        tabIndex={activeAudience === 'owners' ? 0 : -1}
        onClick={() => onChange('owners')}
        className={`relative z-10 px-3.5 sm:px-4 py-1.5 min-w-[94px] sm:min-w-[104px] rounded-full text-xs sm:text-[13px] font-semibold tracking-normal transition-colors duration-200 select-none text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258] focus-visible:ring-offset-1 ${
          activeAudience === 'owners'
            ? 'text-white'
            : 'text-[#4B5563] hover:text-[#111827]'
        }`}
      >
        For Owners
      </button>
    </div>
  );
}

interface InfoCardProps {
  card: StepCardData;
  index: number;
}

function InfoCard({ card, index }: InfoCardProps) {
  const Icon = card.icon;

  return (
    <div
      style={{
        animation: `whatApnaStayFadeSlide 0.28s cubic-bezier(0.16, 1, 0.3, 1) ${index * 40}ms both`,
      }}
      className="group relative bg-white rounded-[22px] border border-[#ECEEF2] p-7 sm:p-8 flex flex-col justify-start overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_-6px_rgba(237,50,88,0.12),0_4px_16px_-2px_rgba(0,0,0,0.04)] hover:border-[#ED3258]/35 hover:-translate-y-1 transition-all duration-300 ease-out"
    >
      {/* Soft decorative ambient glow in top-right corner */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gradient-to-br from-[#ED3258]/10 via-[#ED3258]/3 to-transparent blur-2xl group-hover:from-[#ED3258]/18 transition-all duration-500"
      />

      {/* Top Header: Number on Left, Meaningful Icon on Right (no tag next to number) */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-3xl sm:text-4xl font-black text-[#ED3258] font-sans tracking-tight leading-none select-none">
          {card.number}
        </span>

        <div className="w-11 h-11 rounded-2xl bg-[#FFF1F4] border border-[#FFE0E6] flex items-center justify-center text-[#ED3258] group-hover:bg-[#ED3258] group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
          <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        </div>
      </div>

      {/* Strong Card Heading */}
      <h3 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight mb-2.5 group-hover:text-[#ED3258] transition-colors duration-200">
        {card.title}
      </h3>

      {/* 2–3 Line Description */}
      <p className="text-[#64748B] text-sm sm:text-[15px] leading-relaxed">
        {card.description}
      </p>
    </div>
  );
}

export default function WhatApnaStayDoes() {
  const [activeAudience, setActiveAudience] = useState<AudienceType>('tenants');

  const currentCards = activeAudience === 'tenants' ? TENANT_CARDS : OWNER_CARDS;

  return (
    <section
      id="what-apnastay-does"
      aria-label="What ApnaStay actually does"
      className="py-16 sm:py-20 lg:py-24 bg-white border-b border-[#EDEDED] relative overflow-hidden"
    >
      {/* Inline styles for subtle fade/slide animation */}
      <style jsx>{`
        @keyframes whatApnaStayFadeSlide {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. LEFT-ALIGNED SECTION HEADER + COMPACT AUDIENCE TOGGLE */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8 sm:mb-10">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[rgb(17,24,39)]">
              What ApnaStay actually does
            </h2>
            <p className="mt-2 text-[17px] text-[rgb(107,114,128)] leading-relaxed max-w-2xl">
              Connecting people looking for a place with owners who have one — with better, more accurate listings.
            </p>
          </div>

          <div className="shrink-0 self-start sm:self-auto">
            <AudienceToggle
              activeAudience={activeAudience}
              onChange={setActiveAudience}
            />
          </div>
        </div>

        {/* 2. Three Cards Grid */}
        <div
          role="tabpanel"
          id={activeAudience === 'tenants' ? 'panel-tenants' : 'panel-owners'}
          aria-labelledby={activeAudience === 'tenants' ? 'tab-tenants' : 'tab-owners'}
          key={activeAudience}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {currentCards.map((card, idx) => (
            <InfoCard key={card.id} card={card} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
