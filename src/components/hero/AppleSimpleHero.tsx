'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Sparkles, Key, CheckCircle2 } from 'lucide-react';

export default function AppleSimpleHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#FAFAFA]/40 to-white pt-32 pb-10 sm:pt-36 sm:pb-14 lg:pt-44 lg:pb-16">
      {/* Subtle Apple-style Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-[#E1224D]/5 via-[#E1224D]/3 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Apple Segment Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EDEDED] shadow-sm hover:border-[#D1D5DB] transition-all mb-6 sm:mb-8 group">
          <span className="w-2 h-2 rounded-full bg-[#E1224D] animate-pulse" />
          <span className="text-xs font-semibold text-[#1A1A1A] tracking-tight">
            India&apos;s Zero-Brokerage Verified Residences
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-[#E1224D] group-hover:scale-110 transition-transform" />
        </div>

        {/* Minimalist Apple Display Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1A1A1A] max-w-4xl mx-auto leading-[1.08] sm:leading-[1.06]">
          Where Indian urban living meets{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E1224D] to-[#FF4D6D]">
            zero brokerage.
          </span>
        </h1>

        {/* Crisp Subheadline */}
        <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-[#6B7280] max-w-2xl mx-auto font-normal leading-relaxed">
          Explore 25-point engineering verified stays across India&apos;s fastest-growing tech hubs. 
          Digital Aadhaar e-sign, instant smart-lock tours, and 100% direct-to-landlord transparency.
        </p>

        {/* Sleek Apple Button Row */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/properties"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-sm font-semibold shadow-apple hover:shadow-apple-md transition-all active:scale-[0.98]"
          >
            <span>Explore Verified Rooms</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/why-apnastay"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-[#FAFAFA] text-[#1A1A1A] border border-[#EDEDED] hover:border-[#D1D5DB] text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-[#E1224D]" />
            <span>How ₹0 Brokerage Works</span>
          </Link>
        </div>

        {/* Apple Value Proposition Trust Row */}
        <div className="mt-14 sm:mt-20 pt-10 border-t border-[#EDEDED]/80 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto text-left sm:text-center">
          <div className="flex items-center sm:flex-col sm:items-center gap-3 sm:gap-1.5">
            <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-[#E1224D] shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A1A1A]">₹0 Brokerage</p>
              <p className="text-xs text-[#6B7280]">100% Direct to Verified Landlords</p>
            </div>
          </div>

          <div className="flex items-center sm:flex-col sm:items-center gap-3 sm:gap-1.5">
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A1A1A]">25-Point Engineering Audit</p>
              <p className="text-xs text-[#6B7280]">100 Mbps Wi-Fi &amp; Acoustic Tested</p>
            </div>
          </div>

          <div className="flex items-center sm:flex-col sm:items-center gap-3 sm:gap-1.5">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A1A1A]">Instant Smart-Lock Tours</p>
              <p className="text-xs text-[#6B7280]">45-Min Unaccompanied NFC Access</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
