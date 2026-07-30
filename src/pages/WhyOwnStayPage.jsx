import React from 'react';
import WhyOwnStayGrid from '../components/sections/WhyOwnStayGrid';
import FAQSection from '../components/sections/FAQSection';
import { Sparkles, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WhyOwnStayPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HERO BANNER */}
        <div className="py-12 border-b border-[#EDEDED] mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Zero Brokerage Architecture
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1A1A1A] mb-4">
            How We Eliminate 1-Month Brokerage Across India.
          </h1>
          <p className="text-[#6B7280] text-base sm:text-lg leading-relaxed">
            Traditional Indian real estate relies on offline brokers charging 1 to 2 months rent just for showing keys. OwnStay automates verification, touring, and legal Aadhaar e-signing.
          </p>
        </div>

        {/* BENTO GRID */}
        <WhyOwnStayGrid />

        {/* COMPARISON TABLE: TRADITIONAL BROKER vs OWNSTAY INDIA */}
        <div className="my-20 bg-white rounded-3xl p-8 sm:p-12 border border-[#EDEDED] shadow-sm">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2 text-center">
            Traditional Broker vs. OwnStay Direct
          </h3>
          <p className="text-sm text-[#6B7280] text-center mb-8">
            Why Indian renters and landlords are switching to digital verification
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDEDED] text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  <th className="py-4 px-4">Feature / Metric</th>
                  <th className="py-4 px-4 text-red-500">Traditional Broker / Middleman</th>
                  <th className="py-4 px-4 text-[#E1224D] bg-rose-50/50 rounded-t-xl">OwnStay India Platform</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#EDEDED]">
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#1A1A1A]">Brokerage Fee</td>
                  <td className="py-4 px-4 text-red-500 font-bold">1 Month Rent (₹20,000+)</td>
                  <td className="py-4 px-4 text-[#E1224D] font-bold bg-rose-50/30">₹0.00 Guaranteed</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#1A1A1A]">Physical Inspection</td>
                  <td className="py-4 px-4 text-[#6B7280]">None (Photos often misleading)</td>
                  <td className="py-4 px-4 font-bold text-emerald-600 bg-rose-50/30">25-Point Field Audit Report</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#1A1A1A]">Lease Agreement</td>
                  <td className="py-4 px-4 text-[#6B7280]">Paper Stamp Paper + Court Visit</td>
                  <td className="py-4 px-4 font-bold text-emerald-600 bg-rose-50/30">Aadhaar / PAN Digital E-Sign</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-[#1A1A1A]">Security Deposit Return</td>
                  <td className="py-4 px-4 text-[#6B7280]">Unclear deductions at vacate</td>
                  <td className="py-4 px-4 font-bold text-emerald-600 bg-rose-50/30">100% Refundable in 48 Hours</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#E1224D] text-white font-bold text-sm shadow-apple hover:bg-[#C71B42] transition-all hover:scale-105"
            >
              <span>Browse Verified Rooms Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <FAQSection />
      </div>
    </main>
  );
}
