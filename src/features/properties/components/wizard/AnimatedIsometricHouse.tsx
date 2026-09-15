'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

export interface AnimatedIsometricHouseProps {
  className?: string;
  autoPlay?: boolean;
}

export default function AnimatedIsometricHouse({
  className = '',
}: AnimatedIsometricHouseProps) {
  const [animationKey] = useState<number>(0);
  const [constructionStage, setConstructionStage] = useState<'blueprint' | 'building' | 'complete'>('blueprint');

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

        </motion.div>
      </motion.div>
    </div>
  );
}
