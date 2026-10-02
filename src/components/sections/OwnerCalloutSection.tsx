'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function OwnerCalloutSection() {
  const { currentUser } = useApp();

  const listPropertyUrl = currentUser
    ? '/owner/dashboard/properties/new'
    : '/register?role=property_owner&redirect=/owner/dashboard/properties/new';

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-[#EDEDED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1A1A1A] rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden">
          {/* Subtle ambient highlight */}
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-[#ED3258]/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold tracking-tight mb-6">
              <Building2 className="w-3.5 h-3.5 text-[#ED3258]" />
              <span>For Property Owners</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
              Have a property in Indirapuram, Gurugram, or our launch hubs?
            </h2>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-8">
              Skip the middleman calls and broker commissions. List your apartment directly on ApnaStay, talk with genuine long-term tenants, and stay in complete control of your rental terms.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-xs sm:text-sm text-gray-300">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#ED3258]" />
                </div>
                <span>Free to list your space</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#ED3258]" />
                </div>
                <span>Zero broker deduction from your rent</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#ED3258]" />
                </div>
                <span>Connect directly with serious tenants</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#ED3258]" />
                </div>
                <span>Set your own guidelines and terms</span>
              </div>
            </div>

            <Link
              href={listPropertyUrl}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#ED3258] hover:bg-[#C71B42] text-white text-sm font-semibold shadow-apple hover:shadow-apple-md transition-all active:scale-[0.98] group"
            >
              <span>List Your Property on ApnaStay</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
