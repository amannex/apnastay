'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

export interface AnimatedIsometricHouseProps {
  className?: string;
  phase?: 1 | 2 | 3;
  imageSrc?: string;
  imageAlt?: string;
}

const PHASE_IMAGES: Record<1 | 2 | 3, { src: string; alt: string }> = {
  1: {
    src: '/images/isometric-house.png',
    alt: 'Isometric 3D Property Structure & Architecture'
  },
  2: {
    src: '/images/isometric-step2.jpg',
    alt: 'Isometric 3D Living Space & Amenities'
  },
  3: {
    src: '/images/isometric-step3.jpg',
    alt: 'Isometric 3D Property Management & Final Handover'
  }
};

export default function AnimatedIsometricHouse({
  className = '',
  phase = 1,
  imageSrc,
  imageAlt
}: AnimatedIsometricHouseProps) {
  const activeImage = imageSrc
    ? { src: imageSrc, alt: imageAlt || 'Isometric 3D View' }
    : PHASE_IMAGES[phase] || PHASE_IMAGES[1];
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
      className={`relative w-full aspect-[4/3] max-w-[360px] xs:max-w-[420px] sm:max-w-[540px] lg:max-w-[760px] lg:scale-110 xl:scale-115 mx-auto select-none flex items-center justify-center [perspective:1400px] ${className}`}
    >
      {/* 3D PARALLAX WRAPPER */}
      <motion.div
        style={{
          rotateX: tiltX,
          rotateY: tiltY,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* ISOMETRIC 3D ENTRANCE & GENTLE IDLE FLOAT */}
        <motion.div
          initial={{
            opacity: 0,
            y: 45,
            scale: 0.9,
            rotateX: 10,
            rotateY: -8,
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
            className="relative w-full h-full max-w-[740px] flex items-center justify-center"
          >
            <img
              key={activeImage.src}
              src={activeImage.src}
              alt={activeImage.alt}
              className="w-full h-full object-contain drop-shadow-[0_24px_45px_rgba(0,0,0,0.12)] transition-transform duration-300"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

