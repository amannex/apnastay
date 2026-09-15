'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, HelpCircle, Bookmark } from 'lucide-react';
import AnimatedIsometricHouse from './AnimatedIsometricHouse';

export interface PropertyIntroStepProps {
  onStart: () => void;
  onExit?: () => void;
}

export default function PropertyIntroStep({ onStart, onExit }: PropertyIntroStepProps) {
  const [showQuestionsModal, setShowQuestionsModal] = useState<boolean>(false);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between overflow-y-auto min-h-screen text-[#1D1D1F]">
      {/* ==================================================================== */}
      {/* 1. CLEAN TOP HEADER (Aligned with max-w-7xl content)                  */}
      {/* ==================================================================== */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-30 w-full">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group transition-transform" title="ApnaStay Home">
            <img
              src="/logo-icon.png"
              alt="ApnaStay Logo"
              className="h-8 w-auto group-hover:scale-105 transition-transform object-contain"
            />
            <span className="font-black text-xl tracking-tight text-[#1D1D1F]">
              ApnaStay<span className="text-primary">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowQuestionsModal(true)}
              className="px-4 py-2 rounded-full border border-[#EDEDED] hover:bg-[#F5F5F7] text-xs font-bold text-[#1D1D1F] transition-all shadow-apple-xs active:scale-95 flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#86868B]" />
              <span>Questions?</span>
            </button>

            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="px-4 py-2 rounded-full border border-[#EDEDED] hover:bg-[#F5F5F7] text-xs font-bold text-[#1D1D1F] transition-all shadow-apple-xs active:scale-95 flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#86868B]" />
                <span>Save & exit</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. MAIN SPLIT CONTENT (Left: Overview, Right: Animated Isometric House) */}
      {/* ==================================================================== */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-12 py-8 lg:py-14 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center w-full">
          {/* LEFT COLUMN: INTRODUCTION TEXT */}
          <div className="lg:col-span-6 space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F5F7] border border-[#EDEDED] text-xs font-bold text-[#1D1D1F] shadow-apple-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Step 1 · The Basics</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-black tracking-tight text-[#1D1D1F] leading-tight sm:whitespace-nowrap">
              Tell us about your place
            </h1>

            <p className="text-sm sm:text-base lg:text-[17px] text-[#6E6E73] font-normal leading-relaxed">
              In this step, we’ll ask you which type of property you have and if tenants will rent the entire place or just a room. Then let us know the location and how many guests can stay.
            </p>

            {/* TRUST & EFFORT MICRO-DETAILS */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-[#86868B]">
              <div className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Auto-saved draft</span>
              </div>
              <span className="text-[#D1D1D6]">·</span>
              <span>Takes ~2 min</span>
              <span className="text-[#D1D1D6]">·</span>
              <span>Direct tenant discovery</span>
            </div>
          </div>

          {/* RIGHT COLUMN: ANIMATED ISOMETRIC HOUSE */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <AnimatedIsometricHouse />
          </div>
        </div>
      </main>

      {/* ==================================================================== */}
      {/* 3. STICKY BOTTOM NAVIGATION BAR WITH 3-PHASE PROGRESS                */}
      {/* ==================================================================== */}
      <footer className="sticky bottom-0 bg-white z-30 shadow-lg">
        {/* SEGMENTED PROGRESS TRACK (Increased by +1pt to 5px, Primary Completion Color) */}
        <div className="w-full grid grid-cols-3 gap-2 h-[5px] bg-white">
          {/* Portion 1: Tell us about your place (Active in ApnaStay Primary Red) */}
          <div className="h-full bg-gradient-to-r from-primary to-[#FF385C] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(225,34,77,0.35)]" />
          {/* Portion 2: Stand out */}
          <div className="h-full bg-[#E5E5EA] rounded-full transition-all duration-500" />
          {/* Portion 3: Finish up & publish */}
          <div className="h-full bg-[#E5E5EA] rounded-full transition-all duration-500" />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-4 sm:py-5 flex items-center justify-end">
          <button
            type="button"
            onClick={onStart}
            className="w-full sm:w-auto px-9 py-3.5 sm:py-4 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white text-sm sm:text-base font-bold inline-flex items-center justify-center gap-2.5 shadow-apple-md hover:shadow-apple-lg transition-all active:scale-[0.98] group"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </footer>

      {/* QUESTIONS HELPER MODAL */}
      {showQuestionsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EDEDED] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1D1D1F]">Need Help Getting Started?</h3>
              <button
                type="button"
                onClick={() => setShowQuestionsModal(false)}
                className="text-[#86868B] hover:text-[#1D1D1F] text-xs font-bold px-2 py-1 rounded-lg hover:bg-[#F5F5F7]"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-[#6E6E73] leading-relaxed">
              Adding your property takes about 5 minutes. You can save your draft at any point and return later. Our automated KYC and lease engine handles the rest!
            </p>

            <div className="p-3.5 rounded-2xl bg-[#F5F5F7] text-xs space-y-1.5 text-[#1D1D1F]">
              <p className="font-bold">Key Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-[#6E6E73]">
                <li>Have clear photos of the bedroom and living space ready.</li>
                <li>Ensure accurate rental amounts and deposit terms.</li>
                <li>Your listing goes live instantly after a quick review.</li>
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
