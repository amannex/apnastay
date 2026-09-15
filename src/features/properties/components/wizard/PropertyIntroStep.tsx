'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, HelpCircle, Bookmark, CheckCircle2, ShieldCheck, Sparkles, Building, MapPin, Camera } from 'lucide-react';
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
      {/* 1. CLEAN TOP HEADER                                                  */}
      {/* ==================================================================== */}
      <header className="px-6 sm:px-12 py-5 flex items-center justify-between border-b border-[#F0F0F2] sticky top-0 bg-white/95 backdrop-blur-md z-30">
        <Link href="/" className="flex items-center gap-2 group transition-transform" title="ApnaStay Home">
          <img
            src="/logo-icon.png"
            alt="ApnaStay Logo"
            className="h-8 w-auto group-hover:scale-105 transition-transform object-contain"
          />
          <span className="font-extrabold text-lg tracking-tight text-[#1D1D1F]">
            ApnaStay<span className="text-[#E1224D]">.</span>
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
      </header>

      {/* ==================================================================== */}
      {/* 2. MAIN SPLIT CONTENT (Left: Overview, Right: Animated Isometric House) */}
      {/* ==================================================================== */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-12 py-8 lg:py-16 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center w-full">
          {/* LEFT COLUMN: INTRODUCTION TEXT & MILESTONES */}
          <div className="lg:col-span-6 space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F7] border border-[#EDEDED] text-xs font-bold text-[#1D1D1F]">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>Step 1</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-[#1D1D1F] leading-[1.12]">
              Tell us about <br className="hidden sm:inline" />
              your place
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[#6E6E73] font-normal leading-relaxed">
              In this step, we’ll ask you which type of property you have and if tenants will rent the entire place or just a room. Then let us know the location and how many guests can stay.
            </p>

            {/* QUICK MILESTONES LIST */}
            <div className="pt-4 space-y-3.5 border-t border-[#F0F0F2]">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-primary/[0.06] text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-[#1D1D1F]">Property type & rental model</h2>
                  <p className="text-xs text-[#86868B]">Single room, 1RK/1BHK studio, shared flat, or co-living PG.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-primary/[0.06] text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-[#1D1D1F]">Pinpoint address & map location</h2>
                  <p className="text-xs text-[#86868B]">Precise coordinates for verified tenant route discovery.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-primary/[0.06] text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-[#1D1D1F]">Photos, amenities & pricing</h2>
                  <p className="text-xs text-[#86868B]">Showcase your space, configure deposits, and set live rent.</p>
                </div>
              </div>
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
      <footer className="sticky bottom-0 bg-white border-t border-[#EDEDED] z-30 shadow-lg">
        {/* SEGMENTED PROGRESS TRACK (Airbnb-style 3 phases) */}
        <div className="w-full flex items-center h-1 bg-[#EDEDED]">
          {/* Phase 1: Tell us about your place (Active) */}
          <div className="flex-1 h-full bg-[#1D1D1F] transition-all duration-500" />
          {/* Phase 2: Stand out */}
          <div className="flex-1 h-full bg-[#EDEDED]" />
          {/* Phase 3: Finish up & publish */}
          <div className="flex-1 h-full bg-[#EDEDED]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-4 flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#86868B]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ApnaStay Verified Landlord Protection included</span>
          </div>

          <button
            type="button"
            onClick={onStart}
            className="w-full sm:w-auto ml-auto px-8 py-3.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-apple-sm transition-all active:scale-[0.98] group"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
