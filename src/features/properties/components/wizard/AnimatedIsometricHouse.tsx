'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

export interface AnimatedIsometricHouseProps {
  className?: string;
}

export default function AnimatedIsometricHouse({
  className = '',
}: AnimatedIsometricHouseProps) {
  // Interactive 3D Parallax Tilt Effect on Mouse Move
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 24, stiffness: 180 };
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

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

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full aspect-[4/3] max-w-[640px] mx-auto select-none flex items-center justify-center [perspective:1400px] ${className}`}
    >
      {/* 1. SOFT AMBIENT LIGHTING GLOW */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.03] via-transparent to-amber-400/[0.04] rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* 2. GROUNDED 3D CONTACT SHADOW (Blooms as the house lands) */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          transition: {
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.2,
          },
        }}
        className="absolute bottom-6 sm:bottom-8 w-[68%] h-12 bg-gradient-to-r from-black/5 via-black/15 to-black/5 blur-xl rounded-full pointer-events-none"
      />

      {/* 3. PARALLAX 3D WRAPPER */}
      <motion.div
        style={{
          rotateX: tiltX,
          rotateY: tiltY,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* 4. ISOMETRIC 3D ENTRANCE & GENTLE IDLE FLOAT */}
        <motion.div
          initial={{
            opacity: 0,
            y: 50,
            scale: 0.88,
            rotateX: 12,
            rotateY: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            rotateY: 0,
            transition: {
              type: 'spring',
              damping: 18,
              stiffness: 120,
              mass: 0.8,
              delay: 0.1,
            },
          }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Subtle Continuous 3D Floating Bob */}
          <motion.div
            animate={{
              y: [-4, 4, -4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-[92%] h-[92%] max-w-[620px] rounded-3xl flex items-center justify-center"
          >
            <img
              src="/images/isometric-house.jpg"
              alt="Isometric 3D Duplex Model"
              className="w-full h-full object-contain mix-blend-multiply drop-shadow-[0_20px_35px_rgba(0,0,0,0.12)] transition-transform duration-300"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

