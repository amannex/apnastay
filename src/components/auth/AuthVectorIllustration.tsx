'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AuthVectorIllustration() {
  return (
    <div className="relative w-full max-w-[440px] xl:max-w-[500px] aspect-square flex items-center justify-center select-none pointer-events-none">
      
      {/* ======================================================================= */}
      {/* FLOATING AMBIENT GLOW BEHIND THE VECTOR ILLUSTRATION                    */}
      {/* ======================================================================= */}
      <motion.div
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.4, 0.65, 0.4]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#E1224D]/15 via-amber-200/20 to-transparent blur-3xl pointer-events-none"
      />

      {/* ======================================================================= */}
      {/* BESPOKE EDITORIAL VECTOR ART (PURE TRANSPARENT BACKGROUND)              */}
      {/* ======================================================================= */}
      <motion.svg
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
        animate={{
          y: [-4, 4, -4]
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <defs>
          {/* Primary Brand Gradient */}
          <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E1224D" />
            <stop offset="100%" stopColor="#C71B42" />
          </linearGradient>

          {/* Suitcase Gradient */}
          <linearGradient id="suitcaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E82A55" />
            <stop offset="60%" stopColor="#D91D46" />
            <stop offset="100%" stopColor="#A81233" />
          </linearGradient>

          {/* Door Interior Glow */}
          <linearGradient id="interiorGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFF9F5" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFF1E8" stopOpacity="0.4" />
          </linearGradient>

          {/* Ambient Ground Shadow */}
          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1A1A1A" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#1A1A1A" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#1A1A1A" stopOpacity="0" />
          </radialGradient>

          {/* Clothing Gradients */}
          <linearGradient id="coatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EADBCE" />
            <stop offset="100%" stopColor="#D8C7B5" />
          </linearGradient>
          <linearGradient id="pantsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#50565E" />
            <stop offset="100%" stopColor="#3C4148" />
          </linearGradient>
          <linearGradient id="doorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F5ECE1" />
            <stop offset="100%" stopColor="#E8DBCF" />
          </linearGradient>
        </defs>

        {/* --------------------------------------------------------------------- */}
        {/* GROUND SHADOWS                                                        */}
        {/* --------------------------------------------------------------------- */}
        <ellipse cx="300" cy="535" rx="210" ry="16" fill="url(#groundShadow)" />
        <ellipse cx="440" cy="534" rx="42" ry="7" fill="url(#groundShadow)" />
        <ellipse cx="310" cy="536" rx="48" ry="8" fill="url(#groundShadow)" />

        {/* --------------------------------------------------------------------- */}
        {/* MODERN ARCHITECTURAL DOORWAY                                          */}
        {/* --------------------------------------------------------------------- */}
        {/* Door Frame Outer */}
        <rect x="130" y="80" width="180" height="440" rx="4" fill="none" stroke="#2B2D33" strokeWidth="6" />
        <rect x="134" y="84" width="172" height="432" fill="url(#interiorGlow)" />

        {/* Wall Art Frame inside room */}
        <rect x="155" y="140" width="48" height="64" rx="2" fill="#FFFFFF" stroke="#33373D" strokeWidth="2.5" />
        <path d="M165 180 Q175 155 190 172 Q185 190 170 185" fill="none" stroke="#E1224D" strokeWidth="2" />
        <circle cx="180" cy="155" r="4" fill="#E8A87C" />

        {/* Monstera Plant Inside Room */}
        <g id="interior-plant">
          {/* Ceramic Pot */}
          <path d="M168 460 L188 460 L184 495 L172 495 Z" fill="#E6D7C8" stroke="#33373D" strokeWidth="2.5" />
          {/* Leaves */}
          <path d="M178 460 C165 440 152 425 158 410 C168 420 176 445 178 460 Z" fill="#36694C" stroke="#234532" strokeWidth="1.5" />
          <path d="M178 455 C185 435 200 422 198 406 C188 415 182 438 178 455 Z" fill="#468261" stroke="#234532" strokeWidth="1.5" />
          <path d="M178 450 C175 425 178 400 178 390 C182 405 180 430 178 450 Z" fill="#2E5A41" stroke="#234532" strokeWidth="1.5" />
        </g>

        {/* Open Door Swinging Out in Perspective */}
        <path
          d="M310 80 L395 105 L395 510 L310 520 Z"
          fill="url(#doorGrad)"
          stroke="#2B2D33"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Door Inset Panel */}
        <path
          d="M322 105 L382 122 L382 492 L322 502 Z"
          fill="#FAF5EE"
          stroke="#DDD0C1"
          strokeWidth="2"
        />
        {/* Modern Vertical Handle */}
        <rect x="382" y="280" width="5" height="42" rx="2.5" fill="#2B2D33" />

        {/* --------------------------------------------------------------------- */}
        {/* STYLISH PERSON ENTERING (STEPPING FORWARD)                           */}
        {/* --------------------------------------------------------------------- */}
        <g id="character">
          
          {/* Back Leg (Right Leg stepping down) */}
          <g id="back-leg">
            <path
              d="M342 390 L378 495 L360 498 L328 395 Z"
              fill="url(#pantsGrad)"
              stroke="#2B2D33"
              strokeWidth="3"
            />
            {/* Back Sneaker */}
            <path
              d="M362 495 L395 515 L395 528 L355 528 L356 502 Z"
              fill="#FFFFFF"
              stroke="#2B2D33"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M375 512 L385 520" stroke="#E1224D" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Rolling Suitcase (Behind forward foot) */}
          <g id="suitcase">
            {/* Suitcase Handle Rods */}
            <line x1="422" y1="365" x2="445" y2="435" stroke="#4A4E57" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="434" y1="361" x2="457" y2="431" stroke="#4A4E57" strokeWidth="4.5" strokeLinecap="round" />
            {/* Handle Grip */}
            <rect x="418" y="355" width="22" height="12" rx="3" transform="rotate(22 418 355)" fill="#2B2D33" />
            
            {/* Suitcase Main Body */}
            <rect
              x="430"
              y="420"
              width="68"
              height="95"
              rx="12"
              transform="rotate(18 430 420)"
              fill="url(#suitcaseGrad)"
              stroke="#2B2D33"
              strokeWidth="4"
            />
            {/* Suitcase Rib Lines */}
            <line x1="442" y1="445" x2="475" y2="456" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="436" y1="465" x2="469" y2="476" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="430" y1="485" x2="463" y2="496" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Suitcase Wheels */}
            <circle cx="438" cy="528" r="6" fill="#2B2D33" />
            <circle cx="498" cy="508" r="6" fill="#2B2D33" />
          </g>

          {/* Front Leg (Stepping forward) */}
          <g id="front-leg">
            <path
              d="M315 390 L292 492 L272 488 L296 385 Z"
              fill="url(#pantsGrad)"
              stroke="#2B2D33"
              strokeWidth="3"
            />
            {/* Front Sneaker */}
            <path
              d="M272 488 L240 518 L240 532 L285 532 L288 502 Z"
              fill="#FFFFFF"
              stroke="#2B2D33"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M255 515 L268 524" stroke="#E1224D" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Torso & Trench Coat */}
          <g id="torso">
            {/* Coat Body */}
            <path
              d="M275 220 L350 226 L362 390 L285 395 Z"
              fill="url(#coatGrad)"
              stroke="#2B2D33"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Inner Top / Crewneck */}
            <path d="M296 222 L326 224 L322 258 L300 258 Z" fill="#FFFFFF" stroke="#2B2D33" strokeWidth="2" />
            <line x1="311" y1="230" x2="311" y2="242" stroke="#E1224D" strokeWidth="2" strokeLinecap="round" />

            {/* Coat Collar & Lapels */}
            <path d="M296 222 L284 275 L306 270 Z" fill="#D3C0AD" stroke="#2B2D33" strokeWidth="2.5" />
            <path d="M326 224 L338 277 L318 272 Z" fill="#D3C0AD" stroke="#2B2D33" strokeWidth="2.5" />

            {/* Cross-body Bag Strap & Purse */}
            <path d="M292 222 L356 325" stroke="#875638" strokeWidth="5.5" strokeLinecap="round" />
            <rect x="340" y="315" width="28" height="32" rx="7" fill="#9C6644" stroke="#2B2D33" strokeWidth="2.5" />
            <circle cx="354" cy="328" r="2.5" fill="#E8A87C" />
          </g>

          {/* Right Arm (Holding Suitcase Handle) */}
          <g id="arm-right">
            <path
              d="M344 235 Q385 285 422 360"
              fill="none"
              stroke="url(#coatGrad)"
              strokeWidth="24"
              strokeLinecap="round"
            />
            <path
              d="M344 235 Q385 285 422 360"
              fill="none"
              stroke="#2B2D33"
              strokeWidth="3"
            />
            {/* Hand */}
            <circle cx="422" cy="360" r="8" fill="#F4C7A8" stroke="#2B2D33" strokeWidth="2" />
          </g>

          {/* Head, Hair & Face */}
          <g id="head">
            {/* Neck */}
            <rect x="303" y="200" width="16" height="24" fill="#F4C7A8" stroke="#2B2D33" strokeWidth="2" />
            {/* Face Shape */}
            <path
              d="M298 160 C298 135 328 135 328 160 C328 185 320 198 311 200 C302 198 298 185 298 160 Z"
              fill="#F4C7A8"
              stroke="#2B2D33"
              strokeWidth="3"
            />
            {/* Stylish Bob Haircut */}
            <path
              d="M290 162 C288 130 305 118 328 118 C345 118 348 135 344 165 C340 178 335 185 330 185 C328 170 326 155 315 155 C304 155 300 170 295 180 C292 180 290 172 290 162 Z"
              fill="#523628"
              stroke="#2B2D33"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Facial Features (Clean Minimalist Editorial) */}
            <path d="M304 165 Q308 163 312 165" fill="none" stroke="#2B2D33" strokeWidth="2" strokeLinecap="round" />
            <circle cx="308" cy="168" r="1.5" fill="#2B2D33" />
            <path d="M307 177 Q312 181 316 177" fill="none" stroke="#2B2D33" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Left Arm (Holding Smartphone in Front) */}
          <g id="arm-left">
            <path
              d="M280 235 Q252 278 268 315"
              fill="none"
              stroke="url(#coatGrad)"
              strokeWidth="22"
              strokeLinecap="round"
            />
            <path
              d="M280 235 Q252 278 268 315"
              fill="none"
              stroke="#2B2D33"
              strokeWidth="3"
            />
            {/* Hand */}
            <circle cx="270" cy="315" r="8" fill="#F4C7A8" stroke="#2B2D33" strokeWidth="2" />
            
            {/* Smartphone with ApnaStay Digital Key */}
            <rect
              x="264"
              y="288"
              width="22"
              height="38"
              rx="4"
              transform="rotate(-15 264 288)"
              fill="#1F242C"
              stroke="#2B2D33"
              strokeWidth="2.5"
            />
            {/* Phone Screen Glow */}
            <rect
              x="266"
              y="291"
              width="18"
              height="32"
              rx="2"
              transform="rotate(-15 266 291)"
              fill="#FFFFFF"
            />
            {/* Key / NFC Icon on Phone Screen */}
            <circle cx="274" cy="304" r="4" fill="#E1224D" />
            <rect x="273" y="307" width="2" height="6" rx="1" fill="#E1224D" />
          </g>
        </g>

        {/* --------------------------------------------------------------------- */}
        {/* ANIMATED PULSING SMART NFC SIGNALS (Micro-Interactions)               */}
        {/* --------------------------------------------------------------------- */}
        <motion.circle
          cx="274"
          cy="305"
          r="14"
          fill="none"
          stroke="#E1224D"
          strokeWidth="2"
          animate={{
            r: [8, 26, 38],
            opacity: [0.9, 0.4, 0]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
        <motion.circle
          cx="274"
          cy="305"
          r="10"
          fill="none"
          stroke="#E1224D"
          strokeWidth="1.5"
          animate={{
            r: [6, 18, 28],
            opacity: [1, 0.5, 0]
          }}
          transition={{
            duration: 2.2,
            delay: 0.5,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />

        {/* --------------------------------------------------------------------- */}
        {/* FLOATING VERIFIED ACCESS CHIP (Gently Floats Beside Door)             */}
        {/* --------------------------------------------------------------------- */}
        <motion.g
          animate={{
            y: [-6, 6, -6]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {/* Glass Badge Background */}
          <rect
            x="390"
            y="180"
            width="135"
            height="38"
            rx="19"
            fill="#FFFFFF"
            stroke="#EFEBE6"
            strokeWidth="1.5"
            filter="drop-shadow(0 4px 12px rgba(0,0,0,0.06))"
          />
          {/* Green Status Light */}
          <circle cx="406" cy="199" r="4" fill="#10B981" />
          {/* Badge Text */}
          <text x="418" y="203" fill="#1A1A1A" fontSize="11" fontWeight="700" fontFamily="sans-serif">
            Smart Stay Ready
          </text>
        </motion.g>

        {/* Subtle Decorative Star Sparkles */}
        <motion.path
          d="M120 220 L124 228 L132 230 L124 234 L120 242 L116 234 L108 230 L116 228 Z"
          fill="#E1224D"
          opacity="0.6"
          animate={{
            scale: [0.8, 1.2, 0.8],
            rotate: [0, 45, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        <motion.path
          d="M480 370 L483 376 L490 378 L483 381 L480 388 L477 381 L470 378 L477 376 Z"
          fill="#F59E0B"
          opacity="0.5"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -30, 0]
          }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

      </motion.svg>
    </div>
  );
}
