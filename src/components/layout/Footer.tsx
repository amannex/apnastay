'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function Footer({ onExploreClick }: { onExploreClick?: () => void }) {
  return (
    <footer className="bg-[#1A1A1A] text-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* COMPREHENSIVE FINAL CTA BANNER */}
        <div className="bg-gradient-to-br from-[#E1224D] to-[#9E1332] rounded-3xl p-8 sm:p-14 mb-20 text-center relative overflow-hidden shadow-apple-lg">
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-4">
              Zero Brokerage • 100% Verified in India
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Your next home starts here.
            </h2>
            <p className="text-white/90 text-sm sm:text-base mb-8">
              Join thousands of Indian renters who ditched 1-month brokerage commissions and messy paper leases.
            </p>
            <Link
              href="/properties"
              className="inline-block px-8 py-4 rounded-full bg-white text-[#E1224D] font-bold text-sm shadow-apple hover:bg-[#FAFAFA] transition-all duration-300 hover:scale-105"
            >
              Explore Verified Indian Rooms →
            </Link>
          </div>
        </div>

        {/* FOOTER LINKS & BRAND */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-16 border-b border-white/10">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3.5 mb-4 group">
              <img
                src="/logo-icon.png"
                alt="ApnaStay"
                className="h-14 w-auto group-hover:scale-105 transition-transform object-contain brightness-0 invert"
              />
              <div className="flex flex-col justify-center select-none">
                <div className="text-[28px] font-gotham-black leading-none tracking-tighter text-white">
                  ApnaStay
                </div>
                <span className="text-[10px] text-[#E1224D] font-semibold tracking-wide mt-1">
                  Good Stay. Good Vibes.
                </span>
              </div>
            </Link>
            <p className="text-white/70 text-sm max-w-sm leading-relaxed mb-6">
              India's premium Apple, Airbnb, and Linear inspired rental platform. Built with interactive 3D storytelling, ₹0 brokerage guarantees, and instant NFC smart-lock tours across Tier-2 and Tier-1 hubs.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/80 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#E1224D]" />
              <span>25-Point Physical Inspection Guaranteed</span>
            </div>
          </div>

          {/* Links Col 1: Indian Tier-2 Cities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4">
              Explore Tier-2 Hubs
            </h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><Link href="/cities" className="hover:text-white transition-colors">Indore (248 Homes)</Link></li>
              <li><Link href="/cities" className="hover:text-white transition-colors">Jaipur (184 Homes)</Link></li>
              <li><Link href="/cities" className="hover:text-white transition-colors">Coimbatore (196 Homes)</Link></li>
              <li><Link href="/cities" className="hover:text-white transition-colors">Kochi (162 Homes)</Link></li>
              <li><Link href="/cities" className="hover:text-white transition-colors">Chandigarh (210 Homes)</Link></li>
              <li><Link href="/cities" className="hover:text-white transition-colors">Pune (312 Homes)</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4">
              ApnaStay Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><Link href="/why-apnastay" className="hover:text-white transition-colors">₹0 Brokerage Promise</Link></li>
              <li><Link href="/properties" className="hover:text-white transition-colors">Verified Indian Listings</Link></li>
              <li><Link href="/why-apnastay" className="hover:text-white transition-colors">Aadhaar / PAN E-Sign</Link></li>
              <li><Link href="/why-apnastay" className="hover:text-white transition-colors">Instant NFC Self-Tour</Link></li>
              <li><Link href="/permission-matrix" className="hover:text-white transition-colors text-emerald-400 font-semibold">🔒 Phase 24 RBAC Matrix Suite</Link></li>
              <li><Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Links Col 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><Link href="/journal" className="hover:text-white transition-colors">ApnaStay Journal</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Partner with ApnaStay</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© 2026 ApnaStay Technologies India Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Made for Indian Renters & Owners</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
