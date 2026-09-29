'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Clock, ShieldCheck, MessageCircle, Mail, RotateCw, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '../../config/site';

export default function MaintenancePage() {
  const [isChecking, setIsChecking] = useState(false);
  const [checkedMessage, setCheckedMessage] = useState<string | null>(null);

  const handleCheckStatus = () => {
    setIsChecking(true);
    setCheckedMessage(null);
    setTimeout(() => {
      setIsChecking(false);
      // Attempt to fetch current status or simply reload page
      window.location.reload();
    }, 1200);
  };

  const whatsappMessage = encodeURIComponent(
    'Hi ApnaStay Team, I am reaching out regarding a booking or inquiry while the site is undergoing maintenance.'
  );

  return (
    <div className="fixed inset-0 z-[9999] min-h-screen w-full bg-[#FAFAFA] overflow-y-auto flex flex-col justify-between selection:bg-[#FFE4EA] selection:text-[#E1224D]">
      {/* Top Bar with Brand Identity & Live Indicator */}
      <header className="w-full max-w-4xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-icon.png"
            alt="ApnaStay Logo"
            className="h-8 sm:h-9 w-auto object-contain"
          />
          <span className="font-outfit font-extrabold text-xl sm:text-2xl tracking-tight text-[#1A1A1A]">
            ApnaStay<span className="text-[#E1224D]">.</span>
          </span>
        </div>

        {/* Live Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs sm:text-[13px] font-medium tracking-tight">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span>Scheduled Upgrade in Progress</span>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="w-full max-w-2xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl p-7 sm:p-10 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.04),0_2px_8px_-2px_rgba(0,0,0,0.02)] border border-[#EDEDED] relative overflow-hidden">
          
          {/* Subtle Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E1224D] via-[#FF5370] to-[#E1224D]" />

          <div className="space-y-4">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#E1224D] bg-[#FFE4EA] px-2.5 py-1 rounded-md">
              System Maintenance
            </span>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] tracking-tight font-outfit leading-tight">
              We&apos;re upgrading ApnaStay for a faster, smoother experience.
            </h1>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-sans">
              Our engineering team is currently deploying scheduled database and performance optimizations across the platform. We&apos;ll be back online shortly.
            </p>
          </div>

          {/* Transparent Status Checklist */}
          <div className="mt-8 pt-6 border-t border-[#EDEDED] grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
              <ShieldCheck className="w-5 h-5 text-[#E1224D] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-[#1A1A1A]">Data &amp; Bookings Safe</h4>
                <p className="text-[12px] text-gray-500 leading-tight mt-0.5">
                  All active tenant agreements and visit schedules remain fully secure.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
              <Clock className="w-5 h-5 text-[#E1224D] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-[#1A1A1A]">Expected Window</h4>
                <p className="text-[12px] text-gray-500 leading-tight mt-0.5">
                  Routine upgrades typically conclude within under 45–60 minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Action & Direct Support Block */}
          <div className="mt-8 pt-6 border-t border-[#EDEDED] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#1A1A1A]">
                Have a visit or move-in scheduled today?
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Our concierge team is available directly via WhatsApp &amp; Email.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href={`https://wa.me/919876543210?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors text-xs font-semibold"
                aria-label="Contact concierge on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`mailto:${siteConfig.links.supportEmail}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-xs font-semibold"
                aria-label="Email support"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </a>
            </div>
          </div>

          {/* Live Reload Action Button */}
          <div className="mt-8 flex flex-col items-center justify-center pt-2">
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95 disabled:opacity-70 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking site status...' : 'Check if site is back'}</span>
            </button>
            {checkedMessage && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{checkedMessage}</span>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Understated Human Footer */}
      <footer className="w-full max-w-4xl mx-auto px-6 py-6 text-center text-xs text-gray-400 font-sans border-t border-[#EDEDED]/60">
        <p>
          &copy; {new Date().getFullYear()} ApnaStay Technologies Pvt. Ltd. &bull; India&apos;s Zero-Brokerage Rental Network
        </p>
      </footer>
    </div>
  );
}
