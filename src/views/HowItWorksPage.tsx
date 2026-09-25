'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Search,
  KeyRound,
  FileCheck,
  CreditCard,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  BadgePercent,
  Clock,
  Lock
} from 'lucide-react';
import WhyApnaStayGrid from '../components/sections/WhyApnaStayGrid';
import FAQSection from '../components/sections/FaqSection';

export default function HowItWorksPage() {
  const [activeAudience, setActiveAudience] = useState<'renter' | 'owner'>('renter');

  const renterSteps = [
    {
      step: '01',
      title: 'Discover 25-Point Audited Homes',
      subtitle: 'Real photos, zero catfishing, accurate acoustic dB data',
      desc: 'Browse 100% physically inspected rooms across Tier-2 hubs like Indore, Pune, Jaipur, and Chandigarh. Every listing features verified fiber Wi-Fi speeds, noise decibel readings, and water pressure reports.',
      icon: Search,
      badge: '100% Zero Brokerage',
      highlight: 'No fake broker listings'
    },
    {
      step: '02',
      title: 'Instant NFC Smart-Lock Self Tour',
      subtitle: 'Tour at your convenience with zero broker pressure',
      desc: 'Select your preferred time slot online. Upon arrival at the property, tap your smartphone on the NFC smart-lock or input your one-time encrypted PIN to tour the residence privately.',
      icon: KeyRound,
      badge: 'Smart Tour',
      highlight: 'Available 8 AM - 8 PM'
    },
    {
      step: '03',
      title: 'Aadhaar & PAN Digital E-Sign Lease',
      subtitle: 'Government legally valid rental deed in 10 minutes',
      desc: 'Ditch messy paper agreements and unrecorded terms. Both tenant and owner e-sign an official Indian Registration Act compliant rental agreement using DigiLocker Aadhaar OTP verification.',
      icon: FileCheck,
      badge: 'Legally Binding',
      highlight: 'E-stamped digitally'
    },
    {
      step: '04',
      title: 'Move In & Autopay via UPI',
      subtitle: 'Direct owner transactions with instant rent receipts',
      desc: 'Pay your monthly rent directly to your property owner via UPI, NEFT, or cards without middleman fees. Receive automated GST-compliant rent receipts for your HRA tax claims instantly.',
      icon: CreditCard,
      badge: 'Zero Commissions',
      highlight: 'Direct bank transfer'
    }
  ];

  const ownerSteps = [
    {
      step: '01',
      title: 'List Your Space in 5 Minutes',
      subtitle: 'Zero listing charges, full control over rental terms',
      desc: 'Upload room photos, configure monthly rent, security deposit terms, and tenant preferences (working professionals, students, families) using our guided owner portal.',
      icon: Building2,
      badge: 'Free Listing',
      highlight: 'Keep 100% of your rent'
    },
    {
      step: '02',
      title: 'Free Engineering Inspection',
      subtitle: 'Our certified field engineer audits your property',
      desc: 'We send a local ApnaStay engineer to verify plumbing, electrical safety, acoustic noise levels, and Wi-Fi speeds, awarding your listing the prestigious Verified Badge.',
      icon: ShieldCheck,
      badge: 'Engineering Verified',
      highlight: 'Attracts 3x more tenants'
    },
    {
      step: '03',
      title: 'Pre-Screened Tenant Matches',
      subtitle: 'DigiLocker KYC & employment verification upfront',
      desc: 'Never deal with suspicious inquiries or endless phone calls. Review tenant profiles with verified employment, LinkedIn/salary status, and background documentation.',
      icon: Users,
      badge: 'Verified Tenants',
      highlight: 'Zero unverified visitors'
    },
    {
      step: '04',
      title: 'Automated 1st-of-the-Month Rent',
      subtitle: 'Hands-off rent collection deposited directly to your bank',
      desc: 'Enjoy predictable rental yields with automated UPI rent payment reminders and direct bank deposits on the 1st of every month, backed by digitally signed legal deeds.',
      icon: CreditCard,
      badge: 'Timely Payouts',
      highlight: 'Automated ledger & alerts'
    }
  ];

  const currentSteps = activeAudience === 'renter' ? renterSteps : ownerSteps;

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HERO BANNER */}
        <div className="py-12 border-b border-[#EDEDED] mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-4 border border-rose-100">
            <Sparkles className="w-3.5 h-3.5" />
            Simple • Transparent • Zero Brokerage
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1A1A1A] mb-4">
            How ApnaStay Works.
          </h1>
          <p className="text-[#6B7280] text-base sm:text-lg leading-relaxed">
            From discovering verified homes in Tier-2 Indian hubs to instant NFC smart-lock self-tours and Aadhaar e-signing—here is how we make renting painless.
          </p>

          {/* AUDIENCE SWITCHER PILL */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-full bg-white border border-[#EDEDED] shadow-apple-sm">
            <button
              onClick={() => setActiveAudience('renter')}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeAudience === 'renter'
                  ? 'bg-[#E1224D] text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              For Tenants & Renters
            </button>
            <button
              onClick={() => setActiveAudience('owner')}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeAudience === 'owner'
                  ? 'bg-[#E1224D] text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              For Property Owners
            </button>
          </div>
        </div>

        {/* STEP-BY-STEP PROCESS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {currentSteps.map((stepItem, idx) => {
            const Icon = stepItem.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-[#EDEDED] shadow-apple-sm hover:shadow-apple-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-gotham-black text-2xl text-[#E1224D]/40 group-hover:text-[#E1224D] transition-colors">
                      {stepItem.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#E1224D] flex items-center justify-center group-hover:bg-[#E1224D] group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 text-[#4B5563] text-[10px] font-bold uppercase tracking-wider mb-2">
                    {stepItem.badge}
                  </span>
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 leading-snug">
                    {stepItem.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
                    {stepItem.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F3F4F6] flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{stepItem.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA BANNER */}
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2D3748] rounded-3xl p-8 sm:p-12 mb-20 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-apple-lg">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
              Ready to experience zero brokerage?
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {activeAudience === 'renter'
                ? 'Find your next verified home today.'
                : 'List your property with ₹0 brokerage fees.'}
            </h2>
            <p className="text-white/70 text-xs sm:text-sm mt-1 max-w-xl">
              {activeAudience === 'renter'
                ? 'Browse 1,200+ engineering-audited rooms in Tier-2 Indian hubs with zero middleman commissions.'
                : 'Connect with verified Indian professionals and keep 100% of your rental income every month.'}
            </p>
          </div>
          <Link
            href={activeAudience === 'renter' ? '/properties' : '/owner/dashboard/properties/new'}
            className="px-6 py-3.5 rounded-full bg-[#E1224D] hover:bg-[#C71B42] text-white text-xs sm:text-sm font-bold transition-all shadow-apple shrink-0 flex items-center gap-2"
          >
            <span>{activeAudience === 'renter' ? 'Find ApnaStay' : 'List ApnaStay'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* BENTO ARCHITECTURE GRID */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-bold text-[#1A1A1A] mb-3">
              Built on Direct Owner-to-Tenant Architecture
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              Every layer of the ApnaStay platform is engineered to replace expensive offline brokers with digital trust.
            </p>
          </div>
          <WhyApnaStayGrid />
        </div>

        {/* COMPARISON TABLE */}
        <div className="my-20 bg-white rounded-3xl p-8 sm:p-12 border border-[#EDEDED] shadow-apple-sm">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2 text-center">
            Traditional Broker vs. ApnaStay Direct
          </h3>
          <p className="text-sm text-[#6B7280] text-center mb-8">
            Why thousands of Indian renters and owners are switching to ApnaStay
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDEDED] text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  <th className="py-4 px-4">Feature / Metric</th>
                  <th className="py-4 px-4 text-red-500">Traditional Broker / Middleman</th>
                  <th className="py-4 px-4 text-[#E1224D] bg-rose-50/50 rounded-t-xl">ApnaStay Direct</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#EDEDED]">
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#1A1A1A]">Brokerage Fee</td>
                  <td className="py-4 px-4 text-red-600 font-medium">1 to 2 Months Rent upfront</td>
                  <td className="py-4 px-4 text-emerald-600 font-bold bg-rose-50/30">₹0 Forever</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#1A1A1A]">Property Verification</td>
                  <td className="py-4 px-4 text-[#6B7280]">None (Unchecked photos & fake ads)</td>
                  <td className="py-4 px-4 text-emerald-600 font-bold bg-rose-50/30">25-Point Physical Inspection</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#1A1A1A]">Home Touring</td>
                  <td className="py-4 px-4 text-[#6B7280]">Dependent on broker schedules</td>
                  <td className="py-4 px-4 text-emerald-600 font-bold bg-rose-50/30">Instant NFC Smart-Lock Self-Tour</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#1A1A1A]">Rental Agreement</td>
                  <td className="py-4 px-4 text-[#6B7280]">Messy offline paper drafts</td>
                  <td className="py-4 px-4 text-emerald-600 font-bold bg-rose-50/30">Aadhaar E-Sign in 10 Mins</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#1A1A1A]">Payment Transparency</td>
                  <td className="py-4 px-4 text-[#6B7280]">Cash receipts, deposit disputes</td>
                  <td className="py-4 px-4 text-emerald-600 font-bold bg-rose-50/30">Direct UPI & Automated Receipts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <FAQSection />
      </div>
    </main>
  );
}
