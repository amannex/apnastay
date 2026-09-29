'use client';

import React from 'react';
import Link from 'next/link';

export default function MaintenanceView() {
  const handleGoBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'https://apnastay.in/';
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-[#111111] flex flex-col justify-between selection:bg-[#FFE4EA] selection:text-[#ED3258] antialiased">
      {/* 1. Header: Brand Logo / Wordmark */}
      <header className="w-full pt-8 sm:pt-12 px-6 flex justify-center items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-[#ED3258] focus-visible:outline-offset-4 rounded-md"
          aria-label="ApnaStay Home"
        >
          <img
            src="/logo-icon.png"
            alt="ApnaStay Logo"
            className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-[#111111]">
            ApnaStay<span className="text-[#ED3258]">.</span>
          </span>
        </Link>
      </header>

      {/* 2. Hero & Central Composition */}
      <main className="w-full max-w-xl mx-auto px-6 py-10 sm:py-16 flex-1 flex flex-col items-center justify-center text-center">
        {/* Visual Illustration Placeholder (Phase 1 container setup for Phase 2) */}
        <section
          aria-label="Illustration area"
          className="w-full flex flex-col items-center justify-center mb-8 sm:mb-10"
        >
          <div className="relative w-[240px] sm:w-[280px] h-[200px] sm:h-[230px] rounded-3xl bg-[#FAFAFA] border border-[#EDEDED] flex flex-col items-center justify-center p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            {/* Minimal architectural silhouette placeholder */}
            <div className="relative flex flex-col items-center">
              {/* Roof & House Silhouette */}
              <div className="w-24 sm:w-28 h-20 rounded-t-2xl border-2 border-[#111111]/15 bg-white relative flex flex-col items-center justify-end pb-0 overflow-hidden shadow-xs">
                {/* 2x2 Windows Placeholder */}
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#ED3258]/20 border border-[#ED3258]/40" />
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#ED3258]/20 border border-[#ED3258]/40" />
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#ED3258]/20 border border-[#ED3258]/40" />
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#ED3258]/20 border border-[#ED3258]/40" />
                </div>
                {/* Doorway */}
                <div className="w-6 h-6 rounded-t-full bg-[#111111]/10 border-t border-x border-[#111111]/20" />
              </div>
              {/* Ground base & accents */}
              <div className="w-36 h-1 rounded-full bg-[#EDEDED] mt-2" />
            </div>

            {/* Subtle Phase 1 placeholder label */}
            <div className="mt-4 flex items-center gap-1.5 text-xs text-[#6B7280]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ED3258]" />
              <span className="font-medium tracking-tight">The keys are being prepared</span>
            </div>
          </div>
        </section>

        {/* Brand Subtitle / Optional Secondary Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0F3] border border-[#FFC3D1]/60 text-[#ED3258] text-xs sm:text-[13px] font-medium tracking-tight mb-4">
          <span>Something good is coming home</span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-[44px] font-bold text-[#111111] tracking-tight leading-[1.18] mb-4">
          We&apos;re getting things ready.
        </h1>

        {/* Supporting Copy */}
        <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed max-w-md mx-auto mb-6 font-normal">
          ApnaStay is currently under maintenance while we&apos;re preparing a better way to find your next place to stay.
        </p>

        {/* Status Message */}
        <div className="flex items-center justify-center gap-2 text-sm sm:text-[15px] font-medium text-[#111111] mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ED3258] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ED3258]"></span>
          </span>
          <span>We&apos;ll be back soon.</span>
        </div>

        {/* CTA: Minimal text-based Go Back */}
        <div>
          <button
            onClick={handleGoBack}
            className="group inline-flex items-center gap-1.5 text-sm sm:text-base font-medium text-[#111111] hover:text-[#ED3258] transition-colors duration-200 py-2 px-3 rounded-lg focus-visible:outline-2 focus-visible:outline-[#ED3258] focus-visible:outline-offset-4 cursor-pointer"
            aria-label="Go back to previous page"
          >
            <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">
              &larr;
            </span>
            <span>Go back</span>
          </button>
        </div>
      </main>

      {/* 3. Footer: Simple Social & Website Links */}
      <footer className="w-full pb-8 sm:pb-12 pt-6 px-6 text-center">
        <nav
          aria-label="Footer links"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#6B7280]"
        >
          <a
            href="https://www.instagram.com/apnastay/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ED3258] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[#ED3258] focus-visible:outline-offset-2 rounded"
          >
            Instagram
          </a>
          <span className="text-gray-300 select-none" aria-hidden="true">&middot;</span>
          <a
            href="https://apnastay.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ED3258] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[#ED3258] focus-visible:outline-offset-2 rounded"
          >
            ApnaStay.in
          </a>
        </nav>
      </footer>
    </div>
  );
}
