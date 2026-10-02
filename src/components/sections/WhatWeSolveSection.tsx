'use client';

import React from 'react';
import { Home, ShieldCheck, UserCheck, Banknote } from 'lucide-react';

export default function WhatWeSolveSection() {
  const pillars = [
    {
      icon: Home,
      title: 'Designed for months, not days',
      description:
        'Short-term platforms are made for vacationers and weekend trips. ApnaStay is designed specifically for people who are relocating for work, education, or setting up a real long-term life in a new city.'
    },
    {
      icon: Banknote,
      title: 'Direct owners, zero brokerage',
      description:
        'In most Indian cities, traditional brokers demand an entire month’s rent just for unlocking a door. On ApnaStay, you communicate directly with verified property owners without middlemen fees.'
    },
    {
      icon: ShieldCheck,
      title: 'Accurate details before you visit',
      description:
        'No misleading photos, fake listings, or bait-and-switch tactics. We provide upfront clarity on rent, maintenance, deposit, furnishing, and house rules before you travel across town.'
    },
    {
      icon: UserCheck,
      title: 'Respectful relationships',
      description:
        'Long-term renting works best when both tenants and owners trust each other. We foster direct, transparent communication so expectations are aligned from day one.'
    }
  ];

  return (
    <section className="py-20 sm:py-24 bg-[#FAFAFA] border-b border-[#EDEDED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EDEDED] text-xs font-semibold text-[#4B5563] tracking-tight mb-3 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ED3258]" />
            <span>The Long-Term Problem</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A]">
            Renting in a new city shouldn&apos;t feel like a high-stakes gamble.
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#6B7280] leading-relaxed">
            Finding a home away from home should be straightforward. Here is how ApnaStay is reshaping the long-term rental journey.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white p-7 sm:p-8 rounded-3xl border border-[#EDEDED] shadow-xs hover:border-[#D1D5DB] transition-all"
              >
                <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center text-[#ED3258] mb-5">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-2 tracking-tight">
                  {pillar.title}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
