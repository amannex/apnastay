'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Building,
  DoorOpen,
  Home,
  BedDouble,
  Sun,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import Link from 'next/link';

const WALKTHROUGH_STAGES = [
  {
    id: 'building',
    step: 1,
    title: 'Realistic Multi-Story Building',
    subtitle: 'Architectural residential towers in Indore, Jaipur & Coimbatore tech corridors.',
    location: 'Indore IT SEZ • Building #IND-804',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
    icon: Building,
    aiAnalysis: 'Exterior Facade • Seismic Grade IV Certified • 100% Zero-Brokerage Property',
    aiMetrics: [
      { label: 'Brokerage Fee', value: '₹0 (0% Commission)' },
      { label: 'Building Security', value: '24/7 Biometric + CCTV' },
      { label: 'Power Backup', value: '100% Genset Backup' }
    ]
  },
  {
    id: 'gallery',
    step: 2,
    title: 'Entrance & Glass Gallery',
    subtitle: '24/7 concierge lobby with digital KYC verification and art gallery.',
    location: 'Main Reception & Art Corridor',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    icon: ShieldCheck,
    aiAnalysis: 'Lobby & Gallery • 25-Point Physical Inspection Passed • Verified Owner Deed',
    aiMetrics: [
      { label: 'KYC Onboarding', value: 'Instant Aadhaar OTP' },
      { label: 'Visitor Management', value: 'App-Controlled Entry' },
      { label: 'Package Locker', value: '24/7 Smart Storage' }
    ]
  },
  {
    id: 'hallway',
    step: 3,
    title: 'Hallway & NFC Smart Door',
    subtitle: 'Keyless mobile entry with instant self-tour passes—no broker keys needed.',
    location: 'Level 4 Residence Corridor',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
    icon: DoorOpen,
    aiAnalysis: 'Doorway • NFC Smart-Lock Active • Aadhaar-Verified Digital Key',
    aiMetrics: [
      { label: 'Lock Tech', value: 'Yale NFC / Biometric' },
      { label: 'Self-Tour Pass', value: 'Valid 30 mins via App' },
      { label: 'Soundproofing', value: '32dB Acoustic Rating' }
    ]
  },
  {
    id: 'kitchen',
    step: 4,
    title: 'Gourmet Kitchen & Living Room',
    subtitle: 'Calacatta marble waterfall island, designer furnishings, and zero brokerage.',
    location: '402 Suite • Open Plan Lounge',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
    icon: Home,
    aiAnalysis: 'Living & Dining • 100% Waterproof Flooring • Modular Induction Cooktop',
    aiMetrics: [
      { label: 'Kitchen Setup', value: 'Modular + Chimney + RO' },
      { label: 'Furnishing', value: 'Premium Custom Teak' },
      { label: 'Natural Light', value: '98.4% Daylight Ratio' }
    ]
  },
  {
    id: 'bedroom',
    step: 5,
    title: 'Executive Room & Work Nook',
    subtitle: 'Herman Miller style WFH desk, orthopedic mattress, and high-speed fiber Wi-Fi.',
    location: 'Master Suite • East Facing Window',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80',
    icon: BedDouble,
    aiAnalysis: 'Executive Bedroom • 300 Mbps FTTH Ready • Ergonomic WFH Setup Included',
    aiMetrics: [
      { label: 'Bed Setup', value: 'King Orthopedic 8-inch' },
      { label: 'Workstation', value: 'Ergonomic Chair + Desk' },
      { label: 'Air Quality', value: 'HEPA Filtered • AQI 24' }
    ]
  },
  {
    id: 'balcony',
    step: 6,
    title: 'Sunlit Balcony Sanctuary',
    subtitle: 'Private open-air terrace overlooking Indian tier-2 tech parks.',
    location: 'Private Deck • Sunset Orientation',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80',
    icon: Sun,
    aiAnalysis: 'Terrace Balcony • Organic Plant Wall • South-West Breezeway',
    aiMetrics: [
      { label: 'View Type', value: 'Unobstructed Tech Park' },
      { label: 'Greenery', value: 'Curated Monstera Planters' },
      { label: 'Railings', value: 'Toughened Safety Glass' }
    ]
  }
];

export default function UnsplashWalkthroughHero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentStage = WALKTHROUGH_STAGES[activeIdx];

  // Auto-play cinematic walkthrough timer
  useEffect(() => {
    let timer;
    if (isPlaying) {
      const intervalTime = 60; // ms
      const increment = 100 / (5500 / intervalTime); // 5.5 seconds per slide

      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setActiveIdx((idx) => (idx + 1) % WALKTHROUGH_STAGES.length);
            return 0;
          }
          return prev + increment;
        });
      }, intervalTime);
    } else {
      setProgress(0);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeIdx]);

  const handleSelectStage = (idx) => {
    setActiveIdx(idx);
    setProgress(0);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % WALKTHROUGH_STAGES.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + WALKTHROUGH_STAGES.length) % WALKTHROUGH_STAGES.length);
    setProgress(0);
  };

  return (
    <section className="relative w-full pt-20 pb-12 bg-[#0F0F12] text-white overflow-hidden">
      {/* TOP BADGE & HEADLINE HEADER */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 pt-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1C1C22] border border-white/10 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>OwnStay AI Cinematic Residence Walkthrough</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
              Step inside Indian Tier-2 <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-white via-white to-[#8E8E93] bg-clip-text text-transparent">
                verified zero-brokerage homes.
              </span>
            </h1>
          </div>

          {/* AI WALKTHROUGH CONTROLS */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all border ${
                isPlaying
                  ? 'bg-[#E1224D] border-[#E1224D] text-white shadow-lg shadow-rose-500/30'
                  : 'bg-[#1C1C22] border-white/15 text-white hover:bg-white/10'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'AI Auto-Tour Playing' : 'Play AI Tour'}</span>
            </button>

            <div className="flex items-center gap-1.5 bg-[#1C1C22] p-1 rounded-full border border-white/10">
              <button
                onClick={handlePrev}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
                aria-label="Previous room"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold px-2 text-[#A1A1A6]">
                0{activeIdx + 1} / 0{WALKTHROUGH_STAGES.length}
              </span>
              <button
                onClick={handleNext}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
                aria-label="Next room"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CINEMATIC UNSPLASH IMAGE SCREEN + AI HUD OVERLAY */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative w-full rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl transition-all duration-700 ${
            isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'h-[480px] sm:h-[580px] lg:h-[660px]'
          }`}
        >
          {/* IMAGE WITH KEN BURNS PARALLAX ANIMATION */}
          {WALKTHROUGH_STAGES.map((stage, idx) => {
            const active = idx === activeIdx;
            return (
              <div
                key={stage.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={stage.image}
                  alt={stage.title}
                  className="w-full h-full object-cover transform scale-105 animate-ken-burns transition-transform duration-1000"
                />
                {/* CINEMATIC GRADIENT OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F12]/80 via-transparent to-transparent" />
              </div>
            );
          })}

          {/* AI ARCHITECTURAL HUD OVERLAY (TOP LEFT) */}
          <div className="absolute top-6 left-6 z-20 max-w-sm hidden sm:block">
            <div className="glass-panel bg-black/60 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#34A853] animate-ping" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#34A853]">
                  OwnStay AI Space Analyzer • Active
                </span>
              </div>
              <p className="text-xs font-bold text-white leading-snug">
                {currentStage.aiAnalysis}
              </p>
              <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 gap-1.5">
                {currentStage.aiMetrics.map((metric, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="text-[#A1A1A6]">{metric.label}:</span>
                    <span className="font-semibold text-white">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LIVE ROOM TITLE & METADATA BAR (BOTTOM LEFT) */}
          <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-medium mb-2">
                <MapPin className="w-3.5 h-3.5 text-[#E1224D]" />
                <span>{currentStage.location}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                {currentStage.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#D2D2D7] mt-1 max-w-xl">
                {currentStage.subtitle}
              </p>
            </div>

            {/* ACTION CTAS IN OVERLAY */}
            <div className="flex items-center gap-3">
              <Link
                href="/properties"
                className="px-6 py-3 rounded-xl bg-[#E1224D] hover:bg-[#C71B42] text-white text-xs font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5"
              >
                <span>Book Instant Free Tour</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/why-ownstay"
                className="hidden sm:inline-flex px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition-all"
              >
                Why ₹0 Brokerage?
              </Link>
            </div>
          </div>

          {/* AUTO-PLAY PROGRESS BAR (TOP EDGE) */}
          {isPlaying && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30">
              <div
                className="h-full bg-[#E1224D] transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 6-STEP INTERACTIVE WALKTHROUGH PILLS AT BOTTOM */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {WALKTHROUGH_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const active = idx === activeIdx;
            return (
              <button
                key={stage.id}
                onClick={() => handleSelectStage(idx)}
                className={`flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all border ${
                  active
                    ? 'bg-[#1C1C22] border-[#E1224D] shadow-md shadow-rose-950/20 scale-[1.02]'
                    : 'bg-[#16161A] border-white/5 hover:border-white/15 hover:bg-[#1C1C22]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    active ? 'bg-[#E1224D] text-white' : 'bg-white/10 text-[#A1A1A6]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1A6]">
                      Step {stage.step}
                    </span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E1224D]" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-white truncate mt-0.5">
                    {stage.title.split('&')[0].trim()}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
