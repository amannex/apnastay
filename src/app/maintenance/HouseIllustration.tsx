'use client';

import React, { useState } from 'react';

export default function HouseIllustration() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative w-full max-w-[260px] sm:max-w-[320px] md:max-w-[380px] mx-auto flex flex-col items-center justify-center select-none cursor-default group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="img"
      aria-label="ApnaStay home illustration with moving boxes and the key preparing your next stay"
    >
      {/* Scalable SVG Canvas */}
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          {/* Ground Ambient Shadow */}
          <radialGradient
            id="groundShadow"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#111111" stopOpacity="0.08" />
            <stop offset="60%" stopColor="#111111" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#111111" stopOpacity="0" />
          </radialGradient>

          {/* Entrance Warm Pink Glow */}
          <radialGradient
            id="doorGlow"
            cx="50%"
            cy="70%"
            r="60%"
            fx="50%"
            fy="70%"
          >
            <stop offset="0%" stopColor="#ED3258" stopOpacity="0.32" />
            <stop offset="50%" stopColor="#ED3258" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ED3258" stopOpacity="0" />
          </radialGradient>

          {/* Roof Subtle Soft-Vector Gradient */}
          <linearGradient id="roofGrad" x1="200" y1="52" x2="200" y2="152" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FAFAFA" />
          </linearGradient>

          {/* House Wall Gradient */}
          <linearGradient id="wallGrad" x1="200" y1="130" x2="200" y2="245" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F9FAFB" />
          </linearGradient>

          {/* Moving Box Gradient 1 */}
          <linearGradient id="boxGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5F5F7" />
            <stop offset="100%" stopColor="#E5E7EB" />
          </linearGradient>

          {/* Moving Box Gradient 2 */}
          <linearGradient id="boxGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FAF5F2" />
            <stop offset="100%" stopColor="#E9DED6" />
          </linearGradient>

          {/* Key Polished Metallic Gradient with Brand Accent */}
          <linearGradient id="keyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ED3258" />
            <stop offset="100%" stopColor="#C71B42" />
          </linearGradient>
        </defs>

        {/* 1. Ambient Ground Shadow */}
        <ellipse
          cx="200"
          cy="254"
          rx="145"
          ry="18"
          fill="url(#groundShadow)"
        />

        {/* 2. Moving Box 1: Left Background (Partially behind house) */}
        <g className="transition-transform duration-300" transform="translate(100, 205)">
          <rect
            x="0"
            y="0"
            width="42"
            height="38"
            rx="4"
            fill="url(#boxGrad1)"
            stroke="#D1D5DB"
            strokeWidth="1.5"
          />
          <path
            d="M 17 0 L 17 38"
            stroke="#9CA3AF"
            strokeWidth="3"
            strokeDasharray="2 1"
            opacity="0.5"
          />
          <line
            x1="0"
            y1="8"
            x2="42"
            y2="8"
            stroke="#D1D5DB"
            strokeWidth="1"
            opacity="0.8"
          />
        </g>

        {/* 3. The Main House */}
        <g id="house-structure">
          {/* House Body Base Wall */}
          <rect
            x="132"
            y="134"
            width="136"
            height="112"
            rx="12"
            fill="url(#wallGrad)"
            stroke="#E5E7EB"
            strokeWidth="2"
          />

          {/* Rounded Roof (ApnaStay Architectural Inspired Curve) */}
          <path
            d="M 112 142 C 112 142, 134 78, 192 60 C 196 58.5, 204 58.5, 208 60 C 266 78, 288 142, 288 142 C 291 148, 286 154, 280 154 L 120 154 C 114 154, 109 148, 112 142 Z"
            fill="url(#roofGrad)"
            stroke="#E5E7EB"
            strokeWidth="2"
          />

          {/* Roof Ridge Peak Accent (Subtle ApnaStay Pink Accent Dot) */}
          <circle
            cx="200"
            cy="61"
            r="3.5"
            fill="#ED3258"
          />

          {/* Roof Lower Trim Line */}
          <line
            x1="126"
            y1="146"
            x2="274"
            y2="146"
            stroke="#EDEDED"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* 4 Windows Arranged 2x2 */}
          <g id="windows" className="transition-all duration-300">
            {/* Top-Left Window */}
            <rect
              x="154"
              y="156"
              width="18"
              height="18"
              rx="4"
              fill={isHovered ? '#FFF0F3' : '#F8F9FA'}
              stroke={isHovered ? '#ED3258' : '#E5E7EB'}
              strokeWidth="1.5"
              className="transition-colors duration-300"
            />
            {/* Top-Right Window */}
            <rect
              x="228"
              y="156"
              width="18"
              height="18"
              rx="4"
              fill={isHovered ? '#FFF0F3' : '#F8F9FA'}
              stroke={isHovered ? '#ED3258' : '#E5E7EB'}
              strokeWidth="1.5"
              className="transition-colors duration-300"
            />
            {/* Bottom-Left Window */}
            <rect
              x="154"
              y="182"
              width="18"
              height="18"
              rx="4"
              fill={isHovered ? '#FFF0F3' : '#F8F9FA'}
              stroke={isHovered ? '#ED3258' : '#E5E7EB'}
              strokeWidth="1.5"
              className="transition-colors duration-300"
            />
            {/* Bottom-Right Window */}
            <rect
              x="228"
              y="182"
              width="18"
              height="18"
              rx="4"
              fill={isHovered ? '#FFF0F3' : '#F8F9FA'}
              stroke={isHovered ? '#ED3258' : '#E5E7EB'}
              strokeWidth="1.5"
              className="transition-colors duration-300"
            />
          </g>

          {/* Door Entrance Area */}
          <ellipse
            cx="200"
            cy="234"
            rx={isHovered ? '42' : '32'}
            ry="24"
            fill="url(#doorGlow)"
            className="door-glow-pulse transition-all duration-500"
          />

          {/* Rounded Doorway Frame */}
          <path
            d="M 185 246 L 185 212 C 185 203.7 191.7 197 200 197 C 208.3 197 215 203.7 215 212 L 215 246 Z"
            fill="#FFFFFF"
            stroke="#D1D5DB"
            strokeWidth="1.5"
          />

          {/* Inner Door Panel */}
          <path
            d="M 188 246 L 188 214 C 188 207.4 193.4 202 200 202 C 206.6 202 212 207.4 212 214 L 212 246 Z"
            fill={isHovered ? '#FFF5F7' : '#F9FAFB'}
            stroke={isHovered ? '#FFC3D1' : '#E5E7EB'}
            strokeWidth="1"
            className="transition-colors duration-300"
          />

          {/* Door Handle */}
          <circle
            cx="192"
            cy="226"
            r="1.8"
            fill={isHovered ? '#ED3258' : '#9CA3AF'}
            className="transition-colors duration-300"
          />
        </g>

        {/* 4. Moving Box 2: Foreground Right */}
        <g className="transition-transform duration-300" transform="translate(262, 222)">
          <rect
            x="0"
            y="0"
            width="34"
            height="28"
            rx="3.5"
            fill="url(#boxGrad2)"
            stroke="#D7C9BF"
            strokeWidth="1.5"
          />
          <path
            d="M 14 0 L 14 28"
            stroke="#C4B5A9"
            strokeWidth="2.5"
            opacity="0.6"
          />
          <rect
            x="4"
            y="5"
            width="7"
            height="5"
            rx="1"
            fill="#FFFFFF"
            opacity="0.85"
          />
        </g>

        {/* 5. The Key (Animated Hero Element) */}
        <g
          id="animated-key"
          className={`key-journey ${isHovered ? 'key-hovered' : ''}`}
        >
          {/* Key Shadow */}
          <ellipse
            cx="224"
            cy="252"
            rx="14"
            ry="4"
            fill="#111111"
            opacity="0.08"
            className="key-shadow-pulse"
          />

          {/* Key Body */}
          <g transform="translate(224, 218) rotate(-22)">
            <circle
              cx="0"
              cy="0"
              r="8"
              fill="url(#keyGrad)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <circle
              cx="0"
              cy="0"
              r="3.5"
              fill="#FFFFFF"
            />
            <rect
              x="-1.5"
              y="7"
              width="3"
              height="16"
              rx="1.2"
              fill="url(#keyGrad)"
            />
            <rect
              x="1"
              y="16"
              width="4"
              height="2.5"
              rx="0.8"
              fill="url(#keyGrad)"
            />
            <rect
              x="1"
              y="20"
              width="3"
              height="2.5"
              rx="0.8"
              fill="url(#keyGrad)"
            />
          </g>
        </g>
      </svg>

      {/* 6. Subtle Tooltip / Message on Desktop Hover */}
      <div
        className={`absolute -bottom-2 transition-all duration-300 pointer-events-none transform hidden sm:block ${
          isHovered
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-1'
        }`}
        aria-hidden={!isHovered}
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EDEDED] shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-xs font-medium text-[#111111] whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ED3258]" />
          <span>Your next stay is almost ready.</span>
        </span>
      </div>

      {/* Motion and Reduced-Motion CSS */}
      <style jsx>{`
        @keyframes keyCycle {
          0%, 100% {
            transform: translate(0px, 0px);
          }
          20% {
            transform: translate(-4px, -3px);
          }
          45% {
            transform: translate(-20px, 2px);
          }
          60% {
            transform: translate(-22px, 3px);
          }
          85% {
            transform: translate(-3px, -1px);
          }
        }

        @keyframes keyShadowCycle {
          0%, 100% {
            transform: scale(1) translate(0px, 0px);
            opacity: 0.08;
          }
          20% {
            transform: scale(0.9) translate(-4px, 0px);
            opacity: 0.06;
          }
          45% {
            transform: scale(1.1) translate(-20px, 0px);
            opacity: 0.12;
          }
          60% {
            transform: scale(1.15) translate(-22px, 0px);
            opacity: 0.13;
          }
          85% {
            transform: scale(1) translate(-3px, 0px);
            opacity: 0.08;
          }
        }

        @keyframes doorGlowCycle {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.95);
          }
          45%, 65% {
            opacity: 0.85;
            transform: scale(1.1);
          }
          85% {
            opacity: 0.3;
            transform: scale(0.98);
          }
        }

        .key-journey {
          animation: keyCycle 4.8s cubic-bezier(0.42, 0, 0.58, 1) infinite;
          transform-origin: 224px 218px;
        }

        .key-shadow-pulse {
          animation: keyShadowCycle 4.8s cubic-bezier(0.42, 0, 0.58, 1) infinite;
          transform-origin: 224px 252px;
        }

        .door-glow-pulse {
          animation: doorGlowCycle 4.8s ease-in-out infinite;
          transform-origin: 200px 234px;
        }

        .key-hovered {
          animation-play-state: paused;
          transform: translate(-18px, 1px) !important;
          transition: transform 0.4s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .key-journey,
          .key-shadow-pulse,
          .door-glow-pulse {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
