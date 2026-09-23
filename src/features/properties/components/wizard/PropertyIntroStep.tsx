'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AnimatedIsometricHouse from './AnimatedIsometricHouse';

export interface PropertyIntroStepProps {
  phase?: 1 | 2 | 3;
  onStart: () => void;
  onBack?: () => void;
  onExit?: () => void;
}

export default function PropertyIntroStep({
  phase = 1,
  onStart,
  onBack,
  onExit
}: PropertyIntroStepProps) {
  const [showQuestionsModal, setShowQuestionsModal] = useState<boolean>(false);

  const stepMeta = {
    1: {
      stepLabel: 'Step 1',
      title: 'Tell us about your property',
      description:
        'In this step, we’ll ask you what type of property you have, what you are offering, where it is located, and basic details about your space.',
      modalTitle: 'Need Help Getting Started?',
      modalDesc:
        'Adding your property takes about 5 minutes. You can save your draft at any point and return later. Our automated KYC and lease engine handles the rest!',
      modalTips: [
        'Have clear photos of the bedroom and living space ready.',
        'Ensure accurate rental amounts and deposit terms.',
        'Your listing goes live instantly after a quick review.'
      ]
    },
    2: {
      stepLabel: 'Step 2',
      title: 'Make your place stand out',
      description:
        'In this step, you’ll add the amenities your property offers, upload photos and an optional video, set who can stay at your place, and configure property rules & stay terms.',
      modalTitle: 'Step 2: Make Your Place Stand Out',
      modalDesc:
        'Highlight what makes your place unique. High-quality photos, rich amenities, clear resident preferences, and house rules help attract high-quality prospective tenants.',
      modalTips: [
        'Select all true amenities and utilities included.',
        'Upload at least 5 clear photos showing different angles.',
        'Specify who can stay and age requirements.',
        'Set clear rules on smoking, alcohol, visitors, pets, and parties.'
      ]
    },
    3: {
      stepLabel: 'Step 3',
      title: 'Finish up and publish',
      description:
        'In this final step, you’ll set up your pricing, security deposit, move-in availability, and review & publish your property live on ApnaStay.',
      modalTitle: 'Step 3: Pricing & Publishing',
      modalDesc:
        'You are on the final step! Setting clear monthly rent, deposit terms, and move-in availability ensures smooth tenant onboarding and automated agreements.',
      modalTips: [
        'Review your monthly rent, security deposit, and maintenance charges.',
        'Set move-in availability status and date.',
        'Preview your listing and publish live instantly on ApnaStay.'
      ]
    }
  }[phase];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between overflow-y-auto min-h-screen text-[#1D1D1F]">
      {/* ==================================================================== */}
      {/* 1. CLEAN TOP HEADER (Responsive: Save & exit on left on mobile)      */}
      {/* ==================================================================== */}
      <header className="px-5 sm:px-12 py-4 sm:py-6 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-30 transition-all">
        {/* Mobile: Save & exit button on left */}
        <div className="flex sm:hidden">
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#E5E5EA] hover:border-[#D1D1D6] hover:bg-[#F8F8FA] text-xs sm:text-sm font-semibold text-[#1D1D1F] transition-all active:scale-[0.98] whitespace-nowrap inline-flex items-center justify-center shrink-0 shadow-apple-xs"
            >
              <span>Save & exit</span>
            </button>
          )}
        </div>

        {/* Desktop: Logo on left */}
        <Link href="/" className="hidden sm:flex items-center gap-2.5 group transition-transform" title="ApnaStay Home">
          <img
            src="/logo-icon.png"
            alt="ApnaStay Logo"
            className="h-8 sm:h-9 w-auto group-hover:scale-105 transition-transform object-contain"
          />
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#1D1D1F]">
            ApnaStay<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Right: Help button (and Save & exit on desktop) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowQuestionsModal(true)}
            className="px-5 py-2 sm:py-2.5 rounded-full border border-[#E5E5EA] hover:border-[#D1D1D6] hover:bg-[#F8F8FA] text-xs sm:text-sm font-semibold text-[#1D1D1F] transition-all active:scale-[0.98] whitespace-nowrap inline-flex items-center justify-center shrink-0 shadow-apple-xs"
          >
            <span>Help?</span>
          </button>

          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="hidden sm:inline-flex px-5 py-2.5 rounded-full border border-[#E5E5EA] hover:border-[#D1D1D6] hover:bg-[#F8F8FA] text-xs sm:text-sm font-semibold text-[#1D1D1F] transition-all active:scale-[0.98] whitespace-nowrap items-center justify-center shrink-0 shadow-apple-xs"
            >
              <span>Save & exit</span>
            </button>
          )}
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. MAIN SPLIT CONTENT (Mobile: House on top, Text on bottom)         */}
      {/* ==================================================================== */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-12 py-3 sm:py-8 lg:py-16 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 lg:gap-16 items-center w-full">
          {/* 3D ISOMETRIC HOUSE (order-1 on mobile: appears on top) */}
          <div className="order-1 lg:order-2 lg:col-span-6 flex items-center justify-center py-2 sm:py-0">
            <AnimatedIsometricHouse phase={phase} />
          </div>

          {/* INTRODUCTION TEXT (order-2 on mobile: appears below house) */}
          <div className="order-2 lg:order-1 lg:col-span-6 space-y-3 sm:space-y-4 max-w-xl">
            <div className="text-sm sm:text-base lg:text-lg font-semibold text-[#222222]">
              {stepMeta.stepLabel}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-[48px] font-semibold tracking-tight text-[#222222] leading-[1.18] sm:leading-[1.15]">
              {stepMeta.title}
            </h1>

            <p className="text-xs sm:text-base text-[#484848] font-normal leading-relaxed max-w-lg">
              {stepMeta.description}
            </p>
          </div>
        </div>
      </main>

      {/* ==================================================================== */}
      {/* 3. STICKY BOTTOM NAVIGATION BAR WITH 3-PHASE PROGRESS                */}
      {/* ==================================================================== */}
      <footer className="sticky bottom-0 bg-white z-30 shadow-lg">
        {/* SEGMENTED PROGRESS TRACK (3 distinct portions with rounded ends) */}
        <div className="w-full grid grid-cols-3 gap-1 h-[4px] sm:h-[5px] bg-white">
          {/* Portion 1: Step 1 (Completed for phase >= 1) */}
          <div className="h-full bg-[#222222] rounded-full transition-all duration-500" />
          {/* Portion 2: Step 2 (Fully black for phase >= 2) */}
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              phase >= 2 ? 'bg-[#222222]' : 'bg-[#E5E5EA]'
            }`}
          />
          {/* Portion 3: Step 3 (Fully black for phase >= 3) */}
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              phase >= 3 ? 'bg-[#222222]' : 'bg-[#E5E5EA]'
            }`}
          />
        </div>

        <div
          className={`max-w-7xl mx-auto px-5 sm:px-12 py-3.5 sm:py-5 flex items-center ${
            onBack ? 'justify-between' : 'justify-end'
          }`}
        >
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-sm sm:text-base font-semibold text-[#222222] underline underline-offset-4 hover:text-black transition-colors"
            >
              Back
            </button>
          )}

          <button
            type="button"
            onClick={onStart}
            className="w-full sm:w-auto min-w-[130px] py-3.5 sm:px-8 rounded-xl bg-[#222222] hover:bg-black text-white text-sm sm:text-base font-semibold inline-flex items-center justify-center transition-all active:scale-[0.98] shadow-apple-sm lg:translate-x-[10px]"
          >
            <span>Next</span>
          </button>
        </div>
      </footer>

      {/* QUESTIONS HELPER MODAL */}
      {showQuestionsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EDEDED] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1D1D1F]">{stepMeta.modalTitle}</h3>
              <button
                type="button"
                onClick={() => setShowQuestionsModal(false)}
                className="text-[#86868B] hover:text-[#1D1D1F] text-xs font-bold px-2 py-1 rounded-lg hover:bg-[#F5F5F7]"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-[#6E6E73] leading-relaxed">
              {stepMeta.modalDesc}
            </p>

            <div className="p-3.5 rounded-2xl bg-[#F5F5F7] text-xs space-y-1.5 text-[#1D1D1F]">
              <p className="font-bold">Key Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-[#6E6E73]">
                {stepMeta.modalTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowQuestionsModal(false)}
              className="w-full py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
