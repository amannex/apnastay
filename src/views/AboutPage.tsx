'use client';

import React from 'react';
import {
  ShieldCheck,
  Award,
  Users,
  MapPin,
  CheckCircle2,
  Sparkles,
  Heart,
  ArrowRight
} from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-100 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Mission for Indian Real Estate</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F] tracking-tight leading-tight">
            Redefining Rentals Across India with 0% Brokerage
          </h1>
          <p className="text-base sm:text-lg text-[#6E6E73] mt-4 leading-relaxed">
            ApnaStay connects verified residential property owners directly with screened tenants across Tier-2 Indian hubs—eliminating middlemen, unfair deposits, and broker fees forever.
          </p>
        </div>

        {/* PILLAR CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-3xl p-8 border border-[#EDEDED] shadow-apple-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#E1224D] flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F] mb-2">
              25-Point Engineering Audits
            </h3>
            <p className="text-xs text-[#6E6E73] leading-relaxed">
              Every home in Indore, Pune, Jaipur, and Chandigarh is physically inspected for dB noise levels, Wi-Fi fiber speeds, inverter backup, and water pressure before listing.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#EDEDED] shadow-apple-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F] mb-2">
              100% Zero-Brokerage Guaranteed
            </h3>
            <p className="text-xs text-[#6E6E73] leading-relaxed">
              No hidden commissions or annual renewal fees. Property owners keep 100% of their rent and tenants save an entire month’s brokerage upfront.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#EDEDED] shadow-apple-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F] mb-2">
              Aadhaar & PAN E-Signing
            </h3>
            <p className="text-xs text-[#6E6E73] leading-relaxed">
              Digital rental deeds e-stamped under the Indian Registration Act within 10 minutes. Legally enforceable, transparent, and completely paperless.
            </p>
          </div>
        </div>

        {/* STATS BANNER */}
        <div className="bg-[#1D1D1F] text-white rounded-3xl p-8 sm:p-12 mb-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white">₹2.84 Cr+</div>
            <div className="text-xs text-[#A1A1A6] font-semibold mt-1">Brokerage Saved for Indians</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#E1224D]">1,400+</div>
            <div className="text-xs text-[#A1A1A6] font-semibold mt-1">Engineering Audited Residences</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">6 Hubs</div>
            <div className="text-xs text-[#A1A1A6] font-semibold mt-1">Indore, Pune, Jaipur & More</div>
          </div>
        </div>
      </div>
    </main>
  );
}
