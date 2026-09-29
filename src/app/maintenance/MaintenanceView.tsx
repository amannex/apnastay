'use client';

import React from 'react';
import Link from 'next/link';
import HouseIllustration from './HouseIllustration';

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
    <div className="min-h-screen w-full bg-[#FFFFFF] text-[#111111] flex flex-col justify-between selection:bg-[#FFE4EA] selection:text-[#ED3258] antialiased overflow-x-hidden">
      {/* 1. Header / Brand */}
      <header className="w-full pt-8 sm:pt-12 md:pt-14 px-5 sm:px-6 flex justify-center items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258] focus-visible:ring-offset-2 p-1"
          aria-label="ApnaStay Home"
        >
          <img
            src="/logo-icon.png"
            alt="ApnaStay Logo"
            className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            width={36}
            height={36}
          />
          <span className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-[#111111]">
            ApnaStay<span className="text-[#ED3258]">.</span>
          </span>
        </Link>
      </header>

      {/* 2. Main Hero Content */}
      <main className="w-full max-w-2xl mx-auto px-5 sm:px-6 py-6 sm:py-8 md:py-12 flex-1 flex flex-col items-center justify-center text-center">
        {/* Central Visual: House Illustration */}
        <section
          aria-label="House illustration"
          className="w-full flex items-center justify-center my-3 sm:my-5 md:my-6"
        >
          <HouseIllustration />
        </section>

        {/* Hero Headline: Mobile 34-42px, Desktop 52-64px */}
        <h1 className="text-[34px] sm:text-[40px] md:text-[52px] lg:text-[58px] font-bold text-[#111111] tracking-tight leading-[1.14] sm:leading-[1.12] mb-3 sm:mb-4 md:mb-5">
          We&apos;re getting things ready.
        </h1>

        {/* Supporting Description: Mobile 15-17px */}
        <p className="text-[15px] sm:text-base md:text-[17px] text-[#6B7280] leading-relaxed max-w-[540px] mx-auto mb-5 sm:mb-7 md:mb-8 font-normal">
          ApnaStay is currently under maintenance while we&apos;re preparing a better way to find your next place to stay.
        </p>

        {/* Status Message */}
        <div className="flex items-center justify-center gap-2 text-sm sm:text-[15px] font-medium text-[#111111] mb-6 sm:mb-8">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ED3258] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ED3258]"></span>
          </span>
          <span>We&apos;ll be back soon.</span>
        </div>

        {/* Minimal "← Go back" CTA with accessible touch target (>= 44px) */}
        <div>
          <button
            type="button"
            onClick={handleGoBack}
            className="group inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-sm sm:text-base font-medium text-[#111111] hover:text-[#ED3258] transition-colors duration-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258] focus-visible:ring-offset-2 cursor-pointer"
            aria-label="Go back to previous page"
          >
            <span
              className="inline-block transition-transform duration-200 ease-out group-hover:-translate-x-1.5 motion-reduce:transform-none"
              aria-hidden="true"
            >
              &larr;
            </span>
            <span>Go back</span>
          </button>
        </div>
      </main>

      {/* 3. Footer Links with accessible tap targets */}
      <footer className="w-full pb-8 sm:pb-12 md:pb-14 pt-4 sm:pt-6 px-5 sm:px-6 text-center">
        <nav
          aria-label="Footer links"
          className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm text-[#6B7280]"
        >
          <a
            href="https://www.instagram.com/apnastay/"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] inline-flex items-center px-2 hover:text-[#ED3258] transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258] focus-visible:ring-offset-2"
          >
            Instagram
          </a>
          <span className="text-gray-300 select-none" aria-hidden="true">&middot;</span>
          <a
            href="https://apnastay.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] inline-flex items-center px-2 hover:text-[#ED3258] transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ED3258] focus-visible:ring-offset-2"
          >
            ApnaStay.in
          </a>
        </nav>
      </footer>
    </div>
  );
}
