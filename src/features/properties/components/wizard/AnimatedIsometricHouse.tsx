'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Building2 } from 'lucide-react';

export interface AnimatedIsometricHouseProps {
  className?: string;
  autoPlay?: boolean;
}

export default function AnimatedIsometricHouse({
  className = '',
}: AnimatedIsometricHouseProps) {
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [isBuilding, setIsBuilding] = useState<boolean>(true);

  const handleReplay = () => {
    setIsBuilding(true);
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div className={`relative w-full aspect-[4/3] max-w-[650px] mx-auto select-none flex items-center justify-center ${className}`}>
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.03] via-transparent to-amber-500/[0.02] rounded-3xl -z-10 pointer-events-none" />

      {/* SVG ISOMETRIC ARCHITECTURE */}
      <AnimatePresence mode="wait">
        <motion.svg
          key={animationKey}
          viewBox="0 0 820 680"
          className="w-full h-full drop-shadow-2xl overflow-visible"
          initial="hidden"
          animate="visible"
          onAnimationComplete={() => setIsBuilding(false)}
        >
          <defs>
            {/* FLOOR GRADIENTS */}
            <linearGradient id="floorWood" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5EBE1" />
              <stop offset="50%" stopColor="#EEDBCC" />
              <stop offset="100%" stopColor="#E2CCA8" />
            </linearGradient>

            <linearGradient id="loftWood" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EEDBCC" />
              <stop offset="100%" stopColor="#DFC3A0" />
            </linearGradient>

            {/* WALL GRADIENTS (Lighting from top-left) */}
            <linearGradient id="wallLeft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#ECECEC" />
            </linearGradient>
            <linearGradient id="wallRight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F8F8F9" />
              <stop offset="100%" stopColor="#DFDFE2" />
            </linearGradient>
            <linearGradient id="wallInterior" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F0F0F2" />
            </linearGradient>
            <linearGradient id="plinthEdge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C9B49C" />
              <stop offset="100%" stopColor="#A89278" />
            </linearGradient>

            {/* GLASS GRADIENT */}
            <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#E0F2FE" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.4" />
            </linearGradient>

            {/* BRAND PRIMARY ACCENT */}
            <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF385C" />
              <stop offset="100%" stopColor="#E1224D" />
            </linearGradient>

            {/* SOFA NAVY GRADIENT */}
            <linearGradient id="sofaBlue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            {/* DROP SHADOW FILTER */}
            <filter id="isoShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="18" stdDeviation="20" floodColor="#1D1D1F" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* ================================================================ */}
          {/* PHASE 1: GROUND SHADOW & ISOMETRIC FOUNDATION PLINTH (0.0s - 0.7s) */}
          {/* ================================================================ */}
          <motion.g
            variants={{
              hidden: { opacity: 0, scale: 0.85, y: 30 },
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            {/* Soft ground shadow beneath plinth */}
            <polygon
              points="410,630 730,470 410,310 90,470"
              fill="#1D1D1F"
              fillOpacity="0.06"
              filter="blur(14px)"
            />

            {/* Concrete / Timber Plinth Thickness */}
            <polygon
              points="90,470 410,630 410,646 90,486"
              fill="#BCA68E"
            />
            <polygon
              points="410,630 730,470 730,486 410,646"
              fill="#9F876E"
            />

            {/* Main Ground Floor Slab Top Face */}
            <polygon
              points="410,630 730,470 410,310 90,470"
              fill="url(#floorWood)"
              stroke="#D4C0A8"
              strokeWidth="1"
            />

            {/* Decorative Floor Planks Lines (Subtle Isometric Grid) */}
            <path
              d="
                M 170,430 L 490,590 
                M 250,390 L 570,550 
                M 330,350 L 650,510
                M 250,550 L 570,390
                M 170,510 L 490,350
                M 330,590 L 650,430
              "
              stroke="#DFC7AF"
              strokeWidth="0.8"
              strokeDasharray="4 6"
              opacity="0.6"
            />
          </motion.g>

          {/* ================================================================ */}
          {/* PHASE 2: PERIMETER WALLS & ARCHITECTURAL CUTAWAYS (0.5s - 1.3s)   */}
          {/* ================================================================ */}
          {/* Left Exterior Wall with Windows (Cutaway view) */}
          <motion.g
            variants={{
              hidden: { opacity: 0, y: 50, scaleY: 0.2 },
              visible: {
                opacity: 1,
                y: 0,
                scaleY: 1,
                transition: { duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            style={{ transformOrigin: '250px 470px' }}
          >
            {/* Left Wall Outer Face */}
            <polygon
              points="90,470 90,320 230,250 230,400"
              fill="url(#wallLeft)"
              stroke="#E0E0E0"
              strokeWidth="1.5"
            />
            {/* Wall Top Edge */}
            <polygon
              points="90,320 102,314 242,244 230,250"
              fill="#FFFFFF"
            />
            {/* Cutaway edge depth */}
            <polygon
              points="230,250 242,244 242,394 230,400"
              fill="#D8D8DC"
            />

            {/* Window Cutout 1 */}
            <polygon
              points="115,400 115,355 145,340 145,385"
              fill="#E8F4FD"
              stroke="#1D1D1F"
              strokeWidth="1.5"
            />
            {/* Window Cutout 2 */}
            <polygon
              points="160,378 160,333 190,318 190,363"
              fill="#E8F4FD"
              stroke="#1D1D1F"
              strokeWidth="1.5"
            />
          </motion.g>

          {/* Rear High Wall (Back of the loft) */}
          <motion.g
            variants={{
              hidden: { opacity: 0, y: -40, scaleY: 0.3 },
              visible: {
                opacity: 1,
                y: 0,
                scaleY: 1,
                transition: { duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            style={{ transformOrigin: '570px 390px' }}
          >
            {/* Main Tall Back Wall */}
            <polygon
              points="410,310 730,470 730,230 410,70"
              fill="url(#wallRight)"
              stroke="#E0E0E0"
              strokeWidth="1"
            />
            {/* Top thickness of back wall */}
            <polygon
              points="410,70 398,76 718,236 730,230"
              fill="#FFFFFF"
            />
            {/* Far Left return edge */}
            <polygon
              points="398,76 410,70 410,310 398,316"
              fill="#ECECEF"
            />
          </motion.g>

          {/* Bedroom / Bathroom Interior Partition Wall */}
          <motion.g
            variants={{
              hidden: { opacity: 0, scaleY: 0 },
              visible: {
                opacity: 1,
                scaleY: 1,
                transition: { duration: 0.6, delay: 0.8, ease: 'easeOut' },
              },
            }}
            style={{ transformOrigin: '250px 470px' }}
          >
            {/* Partition divider */}
            <polygon
              points="230,400 340,455 340,365 230,310"
              fill="url(#wallInterior)"
              stroke="#EDEDED"
              strokeWidth="1"
            />
            {/* Partition top thickness */}
            <polygon
              points="230,310 238,306 348,361 340,365"
              fill="#FFFFFF"
            />
            {/* Doorway cutout */}
            <polygon
              points="285,427 325,447 325,385 285,365"
              fill="#EDE1D1"
            />
          </motion.g>

          {/* ================================================================ */}
          {/* PHASE 3: INDUSTRIAL GLASS LOFT WINDOW & UPPER MEZZANINE (1.0s - 1.8s) */}
          {/* ================================================================ */}
          {/* Grand Industrial Multi-pane Glass Window Wall (Rear) */}
          <motion.g
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: { duration: 0.7, delay: 1.0, ease: 'easeOut' },
              },
            }}
          >
            {/* Large Window Panel */}
            <polygon
              points="440,110 590,185 590,300 440,225"
              fill="url(#glassGradient)"
              stroke="#1D1D1F"
              strokeWidth="2.5"
            />
            {/* Window Mullions / Grid */}
            <line x1="490" y1="135" x2="490" y2="250" stroke="#1D1D1F" strokeWidth="2" />
            <line x1="540" y1="160" x2="540" y2="275" stroke="#1D1D1F" strokeWidth="2" />
            <line x1="440" y1="168" x2="590" y2="243" stroke="#1D1D1F" strokeWidth="2" />
            {/* Diagonal Sun Reflection Glare */}
            <path
              d="M 460,135 L 530,230 M 500,140 L 560,215"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
          </motion.g>

          {/* Upper Mezzanine / Loft Floor Platform */}
          <motion.g
            variants={{
              hidden: { opacity: 0, y: -60 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, delay: 1.2, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            {/* Loft Floor Slab */}
            <polygon
              points="410,210 650,330 520,395 280,275"
              fill="url(#loftWood)"
              stroke="#C4A88B"
              strokeWidth="1"
            />
            {/* Loft Front Edge Thickness */}
            <polygon
              points="280,275 520,395 520,407 280,287"
              fill="#8F6E4E"
            />
            <polygon
              points="520,395 650,330 650,342 520,407"
              fill="#6B5035"
            />

            {/* Sleek Glass Balcony Railing */}
            <polygon
              points="280,275 520,395 520,355 280,235"
              fill="url(#glassGradient)"
              stroke="#38BDF8"
              strokeWidth="1"
              strokeOpacity="0.5"
            />
            {/* Handrail Top Bar */}
            <line x1="280" y1="235" x2="520" y2="355" stroke="#1D1D1F" strokeWidth="3" />
            {/* Railing Posts */}
            <line x1="280" y1="235" x2="280" y2="275" stroke="#1D1D1F" strokeWidth="2.5" />
            <line x1="360" y1="275" x2="360" y2="315" stroke="#1D1D1F" strokeWidth="2" />
            <line x1="440" y1="315" x2="440" y2="355" stroke="#1D1D1F" strokeWidth="2" />
            <line x1="520" y1="355" x2="520" y2="395" stroke="#1D1D1F" strokeWidth="2.5" />
          </motion.g>

          {/* Modern Architectural Open-Tread Staircase */}
          <motion.g
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05, delayChildren: 1.4 },
              },
            }}
          >
            {/* Stair treads cascading down */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((stepIdx) => {
              const startX = 640 - stepIdx * 16;
              const startY = 340 + stepIdx * 18;
              return (
                <motion.g
                  key={`stair-${stepIdx}`}
                  variants={{
                    hidden: { opacity: 0, y: -20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                >
                  <polygon
                    points={`${startX},${startY} ${startX + 28},${startY - 14} ${startX + 18},${startY - 19} ${startX - 10},${startY - 5}`}
                    fill="#D4B495"
                    stroke="#8F6E4E"
                    strokeWidth="0.8"
                  />
                  <polygon
                    points={`${startX - 10},${startY - 5} ${startX},${startY} ${startX},${startY + 6} ${startX - 10},${startY + 1}`}
                    fill="#8F6E4E"
                  />
                </motion.g>
              );
            })}
            {/* Stair Handrail */}
            <motion.line
              x1="655"
              y1="320"
              x2="530"
              y2="465"
              stroke="#1D1D1F"
              strokeWidth="2.5"
              variants={{
                hidden: { pathLength: 0 },
                visible: { pathLength: 1, transition: { duration: 0.6, delay: 1.8 } },
              }}
            />
          </motion.g>

          {/* ================================================================ */}
          {/* PHASE 4: FURNISHINGS & APNASTAY BRAND ACCENTS (1.8s - 2.8s)      */}
          {/* ================================================================ */}
          {/* UPPER LOFT BEDROOM: Queen Bed with ApnaStay Red Throw */}
          <motion.g
            variants={{
              hidden: { opacity: 0, scale: 0.5, y: -30 },
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { type: 'spring', damping: 15, delay: 1.9 },
              },
            }}
          >
            {/* Headboard */}
            <polygon
              points="440,240 480,260 480,230 440,210"
              fill="#5A402B"
            />
            {/* Mattress base */}
            <polygon
              points="440,240 520,280 480,300 400,260"
              fill="#FFFFFF"
              stroke="#E0E0E0"
              strokeWidth="1"
            />
            {/* White Bed Sheets */}
            <polygon
              points="435,243 495,273 465,288 405,258"
              fill="#F8FAFC"
            />
            {/* Pillows */}
            <polygon
              points="435,235 455,245 448,252 428,242"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="0.8"
            />
            <polygon
              points="455,245 475,255 468,262 448,252"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="0.8"
            />
            {/* APNASTAY BRAND SIGNATURE THROW BLANKET (Primary Red) */}
            <polygon
              points="465,273 515,298 495,308 445,283"
              fill="url(#primaryGradient)"
              stroke="#BE123C"
              strokeWidth="0.8"
            />

            {/* Bedside Nightstand & Lamp */}
            <polygon
              points="385,250 405,260 400,270 380,260"
              fill="#9A7B56"
            />
            {/* Warm lamp bulb */}
            <circle cx="392" cy="246" r="3.5" fill="#FEF08A" />
            <circle cx="392" cy="246" r="7" fill="#FEF08A" fillOpacity="0.3" filter="blur(2px)" />

            {/* Wardrobe / Dresser */}
            <polygon
              points="550,260 590,280 590,240 550,220"
              fill="#C4A88B"
              stroke="#8F6E4E"
              strokeWidth="1"
            />
            <polygon
              points="550,220 590,240 580,245 540,225"
              fill="#DFC7AF"
            />
          </motion.g>

          {/* LOWER LEVEL LIVING ROOM: Designer Royal Blue Sofa */}
          <motion.g
            variants={{
              hidden: { opacity: 0, scale: 0.6, y: 30 },
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { type: 'spring', damping: 14, delay: 2.1 },
              },
            }}
          >
            {/* Sofa Shadow */}
            <polygon
              points="450,560 530,520 480,495 400,535"
              fill="#1D1D1F"
              fillOpacity="0.08"
              filter="blur(4px)"
            />

            {/* Sofa Backrest */}
            <polygon
              points="420,505 480,475 480,495 420,525"
              fill="#1E40AF"
            />
            {/* Sofa Seat Cushion */}
            <polygon
              points="420,525 480,495 510,510 450,540"
              fill="url(#sofaBlue)"
              stroke="#1E3A8A"
              strokeWidth="1"
            />
            {/* Sofa Front Base */}
            <polygon
              points="450,540 510,510 510,522 450,552"
              fill="#1D4ED8"
            />
            {/* Sofa Left Armrest */}
            <polygon
              points="415,518 435,508 445,523 425,533"
              fill="#3B82F6"
            />
            {/* Sofa Right Armrest */}
            <polygon
              points="495,498 515,488 525,503 505,513"
              fill="#3B82F6"
            />

            {/* Accent Cushion with ApnaStay Primary Red dot */}
            <polygon
              points="435,515 450,508 455,520 440,527"
              fill="url(#primaryGradient)"
            />
          </motion.g>

          {/* LIVING ROOM: Modern Wood Coffee Table */}
          <motion.g
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, delay: 2.3 },
              },
            }}
          >
            {/* Coffee Table Top */}
            <polygon
              points="440,555 480,535 465,527 425,547"
              fill="#EEDBCC"
              stroke="#C9A680"
              strokeWidth="0.8"
            />
            <polygon
              points="425,547 440,555 440,560 425,552"
              fill="#B08D67"
            />
            {/* Mini Plant / Succulent */}
            <circle cx="452" cy="538" r="2.5" fill="#10B981" />
          </motion.g>

          {/* DINING AREA: Round Dining Table with 4 Chairs */}
          <motion.g
            variants={{
              hidden: { opacity: 0, scale: 0.6 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: { type: 'spring', damping: 15, delay: 2.4 },
              },
            }}
          >
            {/* Round Table (Isometric Ellipse) */}
            <ellipse
              cx="580"
              cy="490"
              rx="32"
              ry="18"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="1.5"
            />
            <ellipse
              cx="580"
              cy="493"
              rx="32"
              ry="18"
              fill="#CBD5E1"
              opacity="0.4"
            />
            {/* Table Pedestal Leg */}
            <line x1="580" y1="493" x2="580" y2="512" stroke="#64748B" strokeWidth="4" />
            <ellipse cx="580" cy="512" rx="14" ry="7" fill="#475569" />

            {/* 4 Dining Chairs */}
            <ellipse cx="545" cy="485" rx="7" ry="5" fill="#D4B495" stroke="#9A7B56" />
            <ellipse cx="615" cy="485" rx="7" ry="5" fill="#D4B495" stroke="#9A7B56" />
            <ellipse cx="570" cy="468" rx="7" ry="5" fill="#D4B495" stroke="#9A7B56" />
            <ellipse cx="590" cy="508" rx="7" ry="5" fill="#D4B495" stroke="#9A7B56" />
          </motion.g>

          {/* LOWER BEDROOM: Queen Bed & Work Desk */}
          <motion.g
            variants={{
              hidden: { opacity: 0, x: -30 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.6, delay: 2.5, ease: 'easeOut' },
              },
            }}
          >
            {/* Bed Frame & Headboard */}
            <polygon
              points="140,430 180,450 180,425 140,405"
              fill="#785E43"
            />
            {/* Mattress */}
            <polygon
              points="140,430 220,470 190,485 110,445"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="1"
            />
            {/* Cozy Duvet */}
            <polygon
              points="135,445 195,475 180,483 120,453"
              fill="#F1F5F9"
            />
            {/* Pillow */}
            <polygon
              points="135,425 155,435 150,442 130,432"
              fill="#FFFFFF"
              stroke="#E2E8F0"
            />

            {/* Wooden Bench at foot of bed */}
            <polygon
              points="200,480 230,495 225,502 195,487"
              fill="#C4A88B"
              stroke="#8F6E4E"
            />

            {/* Modern Work Desk & Chair beside window */}
            <polygon
              points="110,390 140,405 135,410 105,395"
              fill="#334155"
            />
            {/* Laptop on desk with glowing screen */}
            <polygon points="120,396 128,400 126,402 118,398" fill="#E2E8F0" />
            <polygon points="128,400 128,392 120,388 120,396" fill="#38BDF8" />
            {/* Chair */}
            <ellipse cx="132" cy="415" rx="5" ry="3.5" fill="#1D1D1F" />
          </motion.g>

          {/* ================================================================ */}
          {/* PHASE 5: AMBIENT LIGHTING, SPARKLES & READY BADGE (2.8s - 3.5s)   */}
          {/* ================================================================ */}
          {/* Warm Interior Lighting Pools */}
          <motion.g
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { duration: 0.8, delay: 2.8 },
              },
            }}
          >
            {/* Soft yellow ambient glow on lower level floor */}
            <ellipse
              cx="450"
              cy="530"
              rx="90"
              ry="45"
              fill="#FEF08A"
              fillOpacity="0.12"
              filter="blur(16px)"
            />
            {/* Soft ambient glow on loft level */}
            <ellipse
              cx="450"
              cy="280"
              rx="70"
              ry="35"
              fill="#FEF08A"
              fillOpacity="0.15"
              filter="blur(12px)"
            />
          </motion.g>

          {/* Floating ApnaStay Listing Readiness Tag */}
          <motion.g
            variants={{
              hidden: { opacity: 0, scale: 0, y: 15 },
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { type: 'spring', damping: 12, delay: 3.0 },
              },
            }}
          >
            {/* Badge Container */}
            <g transform="translate(620, 160)">
              {/* Soft Drop Shadow */}
              <rect
                x="-8"
                y="-8"
                width="140"
                height="46"
                rx="23"
                fill="#1D1D1F"
                fillOpacity="0.12"
                filter="blur(6px)"
              />
              {/* White Pill Badge */}
              <rect
                x="-10"
                y="-10"
                width="144"
                height="44"
                rx="22"
                fill="#FFFFFF"
                stroke="#EDEDED"
                strokeWidth="1.5"
              />
              {/* ApnaStay Brand Dot */}
              <circle cx="10" cy="12" r="6" fill="#E1224D" />
              <circle cx="10" cy="12" r="10" fill="#E1224D" fillOpacity="0.2" />
              {/* Badge Text */}
              <text
                x="26"
                y="11"
                fill="#1D1D1F"
                fontSize="11"
                fontWeight="800"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                ApnaStay Ready
              </text>
              <text
                x="26"
                y="22"
                fill="#86868B"
                fontSize="9"
                fontWeight="600"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                High Demand Model
              </text>
            </g>
          </motion.g>

          {/* Floating Sparkles */}
          <motion.g
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { delay: 3.2, duration: 0.6 },
              },
            }}
          >
            <circle cx="210" cy="220" r="2.5" fill="#E1224D" />
            <circle cx="680" cy="310" r="2" fill="#E1224D" />
            <circle cx="340" cy="140" r="3" fill="#E1224D" fillOpacity="0.7" />
          </motion.g>
        </motion.svg>
      </AnimatePresence>

      {/* FLOATING ACTION OVERLAY: REPLAY BUTTON */}
      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20">
        <button
          type="button"
          onClick={handleReplay}
          title="Replay 3D house construction animation"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white border border-[#EDEDED] shadow-apple-xs backdrop-blur-md text-[11px] font-bold text-[#1D1D1F] hover:text-primary transition-all active:scale-95 group"
        >
          <RotateCw className={`w-3.5 h-3.5 text-[#86868B] group-hover:text-primary transition-transform ${isBuilding ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`} />
          <span>{isBuilding ? 'Building...' : 'Replay Build'}</span>
        </button>
      </div>

      {/* ARCHITECTURAL PERSPECTIVE BADGE */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 border border-[#EDEDED] shadow-apple-xs backdrop-blur-md text-[10px] font-bold text-[#86868B]">
          <Building2 className="w-3 h-3 text-primary" />
          <span className="text-[#1D1D1F]">3D Isometric Model</span>
        </div>
      </div>
    </div>
  );
}
