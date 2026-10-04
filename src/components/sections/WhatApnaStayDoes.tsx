'use client';

import React, { useState } from 'react';
import {
  Compass,
  SlidersHorizontal,
  ShieldCheck,
  Building2,
  Target,
  BadgeCheck,
  Check,
  type LucideIcon,
} from 'lucide-react';

export type AudienceType = 'tenants' | 'owners';

export interface StepCardData {
  id: string;
  number: string;
  label: string;
  title: string;
  description: string;
  benefit: string;
  icon: LucideIcon;
}

export const TENANT_CARDS: StepCardData[] = [
  {
    id: 'tenant-01',
    number: '01',
    label: 'DISCOVER',
    title: 'Find a place that fits',
    description:
      'Explore rooms, flats, PGs and other accommodation based on your location, budget and requirements.',
    benefit: 'Search around the places that matter to you',
    icon: Compass,
  },
  {
    id: 'tenant-02',
    number: '02',
    label: 'COMPARE',
    title: 'Know what you’re choosing',
    description:
      'See important property details, photos, rent, amenities and rules in one place before you reach out.',
    benefit: 'Less guessing. Better decisions.',
    icon: SlidersHorizontal,
  },
  {
    id: 'tenant-03',
    number: '03',
    label: 'TRUST',
    title: 'Rely on accurate listings',
    description:
      'We focus on keeping property information clear and accurate so you can contact owners with more confidence.',
    benefit: 'Built around reliable information',
    icon: ShieldCheck,
  },
];

export const OWNER_CARDS: StepCardData[] = [
  {
    id: 'owner-01',
    number: '01',
    label: 'LIST',
    title: 'List your property',
    description:
      'Add your property details, photos, rent and preferences so potential tenants can discover your space.',
    benefit: 'Simple property listing',
    icon: Building2,
  },
  {
    id: 'owner-02',
    number: '02',
    label: 'REACH',
    title: 'Reach the right tenants',
    description:
      'Put your property in front of people actively looking for accommodation in your locality.',
    benefit: 'Reach people with real intent',
    icon: Target,
  },
  {
    id: 'owner-03',
    number: '03',
    label: 'ACCURATE',
    title: 'Keep your listing trustworthy',
    description:
      'Provide clear and accurate property information so tenants know what to expect before contacting you.',
    benefit: 'Better information builds trust',
    icon: BadgeCheck,
  },
];

interface SectionHeaderProps {
  heading?: string;
  subheading?: string;
}

function SectionHeader({
  heading = 'What ApnaStay actually does',
  subheading = 'Connecting people looking for a place with owners who have one — with better, more accurate listings.',
}: SectionHeaderProps) {
  return (
    <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight mb-4 sm:mb-5">
        {heading}
      </h2>
      <p className="text-base sm:text-lg md:text-xl text-[#4B5563] leading-relaxed max-w-2xl mx-auto font-normal">
        {subheading}
      </p>
    </div>
  );
}

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
    <div className="flex justify-center mb-12 sm:mb-16">
      <div
        role="tablist"
        aria-label="Audience view selector"
        onKeyDown={handleKeyDown}
        className="relative inline-flex items-center p-1.5 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
      >
        {/* Animated sliding background pill */}
        <div
          aria-hidden="true"
          className={`absolute top-1.5 bottom-1.5 rounded-full bg-[#ED3258] transition-transform duration-300 ease-out shadow-sm pointer-events-none left-1.5 w-[calc(50%-6px)] ${
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
          className={`relative z-10 min-w-[130px] sm:min-w-[155px] py-2.5 sm:py-3 px-5 sm:px-7 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-colors duration-200 select-none text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258] focus-visible:ring-offset-2 ${
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
          className={`relative z-10 min-w-[130px] sm:min-w-[155px] py-2.5 sm:py-3 px-5 sm:px-7 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-colors duration-200 select-none text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258] focus-visible:ring-offset-2 ${
            activeAudience === 'owners'
              ? 'text-white'
              : 'text-[#4B5563] hover:text-[#111827]'
          }`}
        >
          For Owners
        </button>
      </div>
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
      className="group relative bg-white rounded-[22px] border border-[#ECEEF2] p-7 sm:p-8 flex flex-col justify-between overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_-6px_rgba(237,50,88,0.12),0_4px_16px_-2px_rgba(0,0,0,0.04)] hover:border-[#ED3258]/35 hover:-translate-y-1 transition-all duration-300 ease-out"
    >
      {/* Soft decorative ambient glow in top-right corner */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gradient-to-br from-[#ED3258]/10 via-[#ED3258]/3 to-transparent blur-2xl group-hover:from-[#ED3258]/18 transition-all duration-500"
      />

      <div>
        {/* Top Header: Large Number & Category Label on Left, Minimalist Line Icon on Right */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl font-black text-[#ED3258] font-sans tracking-tight leading-none select-none">
              {card.number}
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#FFF0F3] text-[#ED3258] border border-[#FFE0E6] select-none">
              {card.label}
            </span>
          </div>

          <div className="w-11 h-11 rounded-2xl bg-[#FFF1F4] border border-[#FFE0E6] flex items-center justify-center text-[#ED3258] group-hover:bg-[#ED3258] group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
            <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>

        {/* Strong Card Heading */}
        <h3 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight mb-3 group-hover:text-[#ED3258] transition-colors duration-200">
          {card.title}
        </h3>

        {/* 2–3 Line Description */}
        <p className="text-[#64748B] text-sm sm:text-[15px] leading-relaxed">
          {card.description}
        </p>
      </div>

      {/* Divider near the bottom */}
      <div className="mt-8 pt-5 border-t border-[#F1F3F5]">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-[#FFF0F3] text-[#ED3258] flex items-center justify-center shrink-0 border border-[#FFE0E6]">
            <Check className="w-3 h-3 stroke-[2.5]" />
          </div>
          <span className="text-xs sm:text-[13px] font-semibold text-[#374151]">
            {card.benefit}
          </span>
        </div>
      </div>
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
      className="py-20 sm:py-24 lg:py-28 bg-white border-b border-[#EDEDED] relative overflow-hidden"
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
        {/* 1. Section Header */}
        <SectionHeader />

        {/* 2. Tenant / Owner Toggle */}
        <AudienceToggle
          activeAudience={activeAudience}
          onChange={setActiveAudience}
        />

        {/* 3. Three Cards Grid */}
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
