'use client';

import React, { useState } from 'react';
import { Search, MessageSquare, KeyRound, Building, Users, CheckCircle2 } from 'lucide-react';

export default function HowItWorksSimple() {
  const [role, setRole] = useState<'tenant' | 'owner'>('tenant');

  const tenantSteps = [
    {
      step: '01',
      title: 'Find a genuine space',
      description: 'Search properties with authentic photos, verified amenity details, and exact monthly rent breakdowns.',
      icon: Search,
    },
    {
      step: '02',
      title: 'Connect directly with the owner',
      description: 'Schedule a visit, ask questions, and converse directly with the person who actually owns the property.',
      icon: MessageSquare,
    },
    {
      step: '03',
      title: 'Move in with zero brokerage',
      description: 'No middleman cuts, no surprise 1-month commissions. Clear security deposit terms agreed upon up front.',
      icon: KeyRound,
    },
  ];

  const ownerSteps = [
    {
      step: '01',
      title: 'List your property for free',
      description: 'Upload genuine room photos, set your expected rent, and define your house guidelines in a few minutes.',
      icon: Building,
    },
    {
      step: '02',
      title: 'Reach serious long-term tenants',
      description: 'Connect with working professionals and families searching for a reliable home for months or years.',
      icon: Users,
    },
    {
      step: '03',
      title: 'Keep 100% of your rental income',
      description: 'Deal directly with your future tenants. No broker margins deducted from your hard-earned rental yield.',
      icon: CheckCircle2,
    },
  ];

  const currentSteps = role === 'tenant' ? tenantSteps : ownerSteps;

  return (
    <section id="how-it-works" className="py-20 sm:py-24 bg-[#FAFAFA] border-b border-[#EDEDED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EDEDED] text-xs font-semibold text-[#4B5563] tracking-tight mb-3 shadow-xs">
            <span>Simple &amp; Direct</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A]">
            How ApnaStay works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6B7280]">
            A transparent 3-step process without brokers, hidden commissions, or runarounds.
          </p>

          {/* Role Toggle */}
          <div className="inline-flex p-1 bg-white border border-[#EDEDED] rounded-full mt-6 shadow-xs">
            <button
              onClick={() => setRole('tenant')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                role === 'tenant'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              For Tenants
            </button>
            <button
              onClick={() => setRole('owner')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                role === 'owner'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              For Property Owners
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {currentSteps.map((stepItem) => {
            const Icon = stepItem.icon;
            return (
              <div
                key={stepItem.step}
                className="bg-white p-8 rounded-3xl border border-[#EDEDED] shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-[#ED3258]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold text-[#E5E7EB] font-mono">
                      {stepItem.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 tracking-tight">
                    {stepItem.title}
                  </h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    {stepItem.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
