'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
      <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full my-auto py-2 sm:py-4">
        {/* 1. Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[68px] font-bold tracking-tight text-[#1A1A1A] leading-[1.12] sm:leading-[1.08] max-w-4xl mx-auto animate-slide-up">
          Not another{' '}
          <span className="relative inline-block font-extrabold text-[#ED3258] px-1 uppercase tracking-wide">
            ONE-NIGHT
            {/* Transparent thin black strike-through line */}
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.45, delay: 0.2, ease: 'easeInOut' }}
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] sm:h-[4px] bg-black/40 rounded-full origin-left pointer-events-none"
              aria-hidden="true"
            />
          </span>{' '}
          stay platform.
        </h1>

        {/* 2. Subheading */}
        <p className="mt-4 sm:mt-5 text-lg sm:text-2xl md:text-[26px] font-semibold text-[#1A1A1A] tracking-tight max-w-3xl mx-auto leading-snug">
          Find your long-term home, even when it&apos;s far from home.
        </p>

        {/* 3. Supporting Text */}
        <p className="mt-2.5 sm:mt-3 text-sm sm:text-base md:text-lg text-[#52525B] max-w-2xl mx-auto font-normal leading-relaxed">
          We&apos;re building an Indian platform to make long-term renting simpler — from finding genuine properties to connecting directly with owners.
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
