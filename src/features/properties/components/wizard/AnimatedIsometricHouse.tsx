'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { RotateCw, Sparkles, Building2, Bed, Sofa, UtensilsCrossed, ShieldCheck, Layers, Maximize2 } from 'lucide-react';

export interface AnimatedIsometricHouseProps {
  className?: string;
  autoPlay?: boolean;
}

interface RoomHotspot {
  id: string;
  name: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  x: number; // Percentage X
  y: number; // Percentage Y
  delay: number;
}

const ROOM_HOTSPOTS: RoomHotspot[] = [
  {
    id: 'loft',
    name: 'Mezzanine Loft Bedroom',
    detail: 'Plush Queen Suite with Panoramic Windows',
    icon: Bed,
    x: 35,
    y: 32,
    delay: 2.5,
  },
  {
    id: 'living',
    name: 'Designer Living Lounge',
    detail: 'Modern Sofa, Coffee Table & Oak Flooring',
    icon: Sofa,
    x: 44,
    y: 72,
    delay: 2.8,
  },
  {
    id: 'dining',
    name: 'Dining & Kitchenette',
    detail: 'Round Dining Set & Full-Service Space',
    icon: UtensilsCrossed,
    x: 50,
    y: 59,
    delay: 3.1,
  },
];

export default function AnimatedIsometricHouse({
  className = '',
}: AnimatedIsometricHouseProps) {
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [constructionStage, setConstructionStage] = useState<'blueprint' | 'building' | 'complete'>('blueprint');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // 3D Parallax Tilt Effect on Mouse Move
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleReplay = () => {
    setConstructionStage('blueprint');
    setAnimationKey((prev) => prev + 1);
  };

  useEffect(() => {
    // Stage 1: Blueprint wireframe draws for 0.9s
    const t1 = setTimeout(() => {
      setConstructionStage('building');
    }, 900);

    // Stage 2: Physical structure materials assemble for 1.8s
    const t2 = setTimeout(() => {
      setConstructionStage('complete');
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [animationKey]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full aspect-[4/3] max-w-[650px] mx-auto select-none flex items-center justify-center perspective-[1200px] ${className}`}
    >
      {/* SOFT AMBIENT LIGHTING BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.04] via-transparent to-amber-500/[0.03] rounded-3xl -z-10 pointer-events-none" />

      {/* 3D PARALLAX CONTAINER */}
      <motion.div
        key={animationKey}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* ================================================================ */}
        {/* 1. BLUEPRINT & ISOMETRIC CAD WIREFRAME GRID (STAGE 1)            */}
        {/* ================================================================ */}
        <AnimatePresence>
          {constructionStage === 'blueprint' && (
            <motion.svg
              viewBox="0 0 800 600"
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
            >
              {/* Foundation Outline */}
              <motion.polygon
                points="400,530 680,390 400,250 120,390"
                fill="none"
                stroke="#E1224D"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
              {/* Vertical Corner Guides */}
              <motion.line
                x1="400"
                y1="530"
                x2="400"
                y2="280"
                stroke="#1D1D1F"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
              <motion.line
                x1="680"
                y1="390"
                x2="680"
                y2="150"
                stroke="#1D1D1F"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
              <motion.line
                x1="120"
                y1="390"
                x2="120"
                y2="150"
                stroke="#1D1D1F"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
              {/* Mezzanine Loft Outline */}
              <motion.polygon
                points="400,320 580,230 400,140 220,230"
                fill="none"
                stroke="#E1224D"
                strokeWidth="1.5"
                strokeDasharray="5 5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* ================================================================ */}
        {/* 2. PHOTOREALISTIC 3D DUPLEX HOUSE RENDERING (STAGE 2 & 3)        */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 35 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              duration: 1.1,
              delay: 0.4,
              ease: [0.16, 1, 0.3, 1], // Apple spring curve
            },
          }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Main Photorealistic 3D Image */}
          <div className="relative w-[92%] h-[92%] max-w-[620px] rounded-3xl overflow-hidden flex items-center justify-center">
            {/* The Photorealistic Render */}
            <motion.img
              src="/images/isometric-house.jpg"
              alt="Photorealistic 3D Duplex Loft Model"
              className="w-full h-full object-contain mix-blend-multiply drop-shadow-[0_25px_35px_rgba(0,0,0,0.12)]"
              initial={{ filter: 'blur(8px) brightness(1.2)' }}
              animate={{
                filter: 'blur(0px) brightness(1)',
                transition: { duration: 0.9, delay: 0.6 },
              }}
            />

            {/* ARCHITECTURAL LASER SCANNER BEAM EFFECT */}
            <AnimatePresence>
              {constructionStage === 'building' && (
                <motion.div
                  className="absolute inset-0 pointer-events-none z-20"
                  initial={{ y: '100%', opacity: 1 }}
                  animate={{ y: '-110%', opacity: [0, 1, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, ease: 'easeInOut' }}
                >
                  {/* Glowing Laser Scan Bar */}
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#E1224D] to-transparent shadow-[0_0_18px_#E1224D]" />
                  <div className="w-full h-16 bg-gradient-to-t from-[#E1224D]/15 to-transparent" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* WARM INTERIOR LIGHTING GLOW ON COMPLETION */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: constructionStage === 'complete' ? 1 : 0,
                transition: { duration: 1.2 },
              }}
              className="absolute inset-0 pointer-events-none bg-radial from-amber-400/[0.08] via-transparent to-transparent mix-blend-screen"
            />
          </div>

          {/* ================================================================ */}
          {/* 3. INTERACTIVE ROOM HOTSPOT PINS (STAGE 3)                       */}
          {/* ================================================================ */}
          <AnimatePresence>
            {constructionStage === 'complete' && (
              <>
                {ROOM_HOTSPOTS.map((spot) => {
                  const Icon = spot.icon;
                  const isActive = activeHotspot === spot.id;

                  return (
                    <motion.div
                      key={spot.id}
                      style={{
                        left: `${spot.x}%`,
                        top: `${spot.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{ scale: 0, opacity: 0, y: 15 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        y: 0,
                        transition: {
                          type: 'spring',
                          damping: 12,
                          stiffness: 220,
                          delay: spot.delay - 1.8,
                        },
                      }}
                      className="absolute z-30"
                    >
                      {/* Pulse Ring */}
                      <span className="absolute -inset-1.5 rounded-full bg-primary/20 animate-ping pointer-events-none" />

                      {/* Hotspot Button */}
                      <button
                        type="button"
                        onClick={() => setActiveHotspot(isActive ? null : spot.id)}
                        onMouseEnter={() => setActiveHotspot(spot.id)}
                        onMouseLeave={() => setActiveHotspot(null)}
                        className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-apple-md ${
                          isActive
                            ? 'bg-primary text-white scale-110 ring-4 ring-[#FFE4EA]'
                            : 'bg-white text-[#1D1D1F] hover:bg-primary hover:text-white border border-[#EDEDED]'
                        }`}
                        title={spot.name}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>

                      {/* Tooltip Card */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: -4, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.95 }}
                            transition={{ duration: 0.18 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 rounded-2xl bg-[#1D1D1F] text-white shadow-2xl z-40 text-center pointer-events-none"
                          >
                            <p className="text-xs font-extrabold text-white leading-tight">
                              {spot.name}
                            </p>
                            <p className="text-[10px] text-[#A1A1A6] mt-0.5 leading-snug">
                              {spot.detail}
                            </p>
                            <div className="mt-1.5 pt-1 border-t border-white/10 flex items-center justify-center gap-1 text-[9px] font-bold text-emerald-400">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified ApnaStay Layout</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </>
            )}
          </AnimatePresence>

          {/* FLOATING APNASTAY BADGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{
              opacity: constructionStage === 'complete' ? 1 : 0,
              scale: constructionStage === 'complete' ? 1 : 0.8,
              x: 0,
              transition: { type: 'spring', damping: 15, delay: 1.0 },
            }}
            className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#EDEDED] shadow-apple-sm backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-bold text-[#1D1D1F]">
              Photorealistic 3D Model
            </span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* FLOATING ACTION: REPLAY BUILD BUTTON */}
      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20">
        <button
          type="button"
          onClick={handleReplay}
          title="Replay 3D house construction animation"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white border border-[#EDEDED] shadow-apple-xs backdrop-blur-md text-[11px] font-bold text-[#1D1D1F] hover:text-primary transition-all active:scale-95 group"
        >
          <RotateCw
            className={`w-3.5 h-3.5 text-[#86868B] group-hover:text-primary transition-transform ${
              constructionStage !== 'complete' ? 'animate-spin text-primary' : 'group-hover:rotate-180 duration-500'
            }`}
          />
          <span>{constructionStage !== 'complete' ? 'Constructing...' : 'Replay Build'}</span>
        </button>
      </div>

      {/* ARCHITECTURAL STATUS BADGE */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 border border-[#EDEDED] shadow-apple-xs backdrop-blur-md text-[10px] font-bold text-[#86868B]">
          <Building2 className="w-3 h-3 text-primary" />
          <span className="text-[#1D1D1F]">
            {constructionStage === 'blueprint'
              ? 'Phase 1: Blueprint Grid'
              : constructionStage === 'building'
              ? 'Phase 2: Structural Assembly'
              : 'Phase 3: Ready to Host'}
          </span>
        </div>
      </div>
    </div>
  );
}
