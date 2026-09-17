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
              src="/images/isometric-house.png"
              alt="Isometric 3D Duplex Model"
              className="w-full h-full object-contain drop-shadow-[0_24px_45px_rgba(0,0,0,0.12)] transition-transform duration-300"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

