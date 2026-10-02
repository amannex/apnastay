'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import SearchBar from '../search/SearchBar';
import { siteConfig } from '../../config/site';

interface HeroSectionProps {
  filters?: any;
  onChange?: (key: string, value: any) => void;
  onReset?: () => void;
  onCitySelect?: (city: string) => void;
}

export default function HeroSection({
  filters,
  onChange,
  onReset,
}: HeroSectionProps) {
  const handleCommunityClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById('community');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/register';
    }
  };

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-between pt-24 sm:pt-28 lg:pt-32 pb-6 sm:pb-8 overflow-hidden bg-white">
      {/* Subtle editorial warm background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[340px] bg-gradient-to-b from-[#ED3258]/[0.045] via-[#ED3258]/[0.015] to-transparent blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 -left-24 w-[320px] h-[320px] bg-[#FAFAFA] rounded-full blur-2xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/4 -right-24 w-[320px] h-[320px] bg-rose-50/20 rounded-full blur-2xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Hero Content: Centered, balanced typography-led composition */}
      <div className="flex-1 flex flex-col justify-center max-w-7xl lg:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 text-center w-full my-auto py-2 sm:py-4">
        {/* 1. Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[74px] xl:text-[84px] 2xl:text-[92px] font-extrabold tracking-tight text-[#1A1A1A] leading-[1.08] sm:leading-[1.02] max-w-full mx-auto animate-slide-up">
          <span className="block">Not another</span>
          <span className="block mt-0.5 sm:mt-1.5 whitespace-nowrap">
            <span className="font-black text-[#ED3258] pr-2 uppercase tracking-wide">
              ONE-NIGHT
            </span>
            stay platform.
          </span>
        </h1>

        {/* 2. Supporting Text */}
        <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-[#52525B] max-w-4xl lg:max-w-5xl mx-auto font-normal leading-relaxed tracking-tight">
          We&apos;re building an Indian platform to make long-term renting simpler — from finding genuine properties to connecting directly with owners. Find your long-term home, faaaaaar from home.
        </p>

        {/* 4. Single Primary Hero CTA */}
        <div className="mt-5 sm:mt-7">
          <a
            href={siteConfig.links.whatsappCommunity}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#1A1A1A] text-white hover:bg-[#ED3258] text-xs sm:text-sm font-semibold shadow-apple hover:shadow-apple-md transition-all active:scale-[0.98] group"
          >
            <span>Join the ApnaStay Community</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* 5. Existing Search Bar in lower portion of the hero (visible without scrolling) */}
      <div className="w-full relative z-30 pt-2 sm:pt-4">
        <SearchBar
          filters={filters}
          onChange={onChange}
          onReset={onReset}
        />
      </div>
    </section>
  );
}
