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
    <div className="min-h-screen w-full bg-[#FFFFFF] text-[#111111] flex flex-col justify-between selection:bg-[#FFE4EA] selection:text-[#ED3258] antialiased">
      {/* 1. Header / Brand */}
      <header className="w-full pt-10 sm:pt-14 px-6 flex justify-center items-center">
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

      {/* 2. Main Content & Visual Hierarchy */}
      <main className="w-full max-w-2xl mx-auto px-6 py-6 sm:py-10 flex-1 flex flex-col items-center justify-center text-center">
        {/* Central Visual: Polished House Illustration with Animated Key & Moving Boxes */}
        <section
          aria-label="ApnaStay house illustration"
          className="w-full flex items-center justify-center my-4 sm:my-6"
        >
          <HouseIllustration />
        </section>

        {/* 3. Main Headline */}
        <h1 className="text-[34px] sm:text-[42px] md:text-[54px] lg:text-[58px] font-bold text-[#111111] tracking-tight leading-[1.12] mb-4 sm:mb-5">
          We&apos;re getting things ready.
        </h1>

        {/* 4. Supporting Description */}
        <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed max-w-[540px] mx-auto mb-6 sm:mb-8 font-normal">
          ApnaStay is currently under maintenance while we&apos;re preparing a better way to find your next place to stay.
        </p>

        {/* 5. Status Message */}
        <div className="flex items-center justify-center gap-2 text-sm sm:text-[15px] font-medium text-[#111111] mb-6 sm:mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ED3258] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ED3258]"></span>
          </span>
          <span>We&apos;ll be back soon.</span>
        </div>

        {/* 6. Go Back CTA (Enhanced Understated Hover Micro-Interaction) */}
        <div>
          <button
            onClick={handleGoBack}
            className="group inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#111111] hover:text-[#ED3258] transition-colors duration-200 py-2 px-3 rounded-lg focus-visible:outline-2 focus-visible:outline-[#ED3258] focus-visible:outline-offset-4 cursor-pointer"
            aria-label="Go back to previous page"
          >
            <span className="inline-block transition-transform duration-250 ease-out group-hover:-translate-x-1.5">
              &larr;
            </span>
            <span>Go back</span>
          </button>
        </div>
      </main>

      {/* 7. Social / Website Links (Footer) */}
      <footer className="w-full pb-10 sm:pb-14 pt-6 px-6 text-center">
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
