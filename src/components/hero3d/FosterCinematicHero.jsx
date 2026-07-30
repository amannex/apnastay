import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  Play,
  Pause,
  Sparkles,
  ShieldCheck,
  Building,
  DoorOpen,
  Home,
  Sun,
  ArrowRight,
  Compass,
  CheckCircle2,
  Lock,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FosterArchitecturalScene from './FosterArchitecturalScene';

gsap.registerPlugin(ScrollTrigger);

// 8 Single-Shot Camera Stages for the Foster + Partners Architectural Walkthrough
const CAMERA_STAGES = [
  {
    stage: 1,
    id: 'aerial',
    title: '01. Aerial Architectural View',
    subtitle: 'Modern high-rise residential tower with realistic morning daylight and sky.',
    badge: 'Foster + Partners Inspired',
    cameraPos: [0, 24, 44],
    targetPos: [0, 8, -5],
    tag: 'Seismic Grade IV • Zero Brokerage'
  },
  {
    stage: 2,
    id: 'entrance',
    title: '02. Glass Entrance & Reception',
    subtitle: '24/7 concierge lobby with digital KYC and 25-point engineering inspection desk.',
    badge: '100% Verified Residences',
    cameraPos: [0, 5.2, 25],
    targetPos: [0, 3.2, 10],
    tag: 'Biometric Access Control'
  },
  {
    stage: 3,
    id: 'corridor',
    title: '03. Naturally Lit Corridor',
    subtitle: 'Warm recessed LED lighting, walnut flooring, and 32dB acoustic soundproofing.',
    badge: 'Architectural Light & Calm',
    cameraPos: [0, 4.8, 14],
    targetPos: [0, 4.2, 4],
    tag: '32dB Acoustic Privacy'
  },
  {
    stage: 4,
    id: 'door',
    title: '04. Smart NFC Door Opening',
    subtitle: 'Watch the solid walnut door unlock and smoothly swing open via your mobile app.',
    badge: 'Keyless Mobile Entry',
    cameraPos: [0, 4.8, 6.5],
    targetPos: [0, 4.5, 0],
    tag: 'Yale NFC Smart-Lock Active'
  },
  {
    stage: 5,
    id: 'bedroom',
    title: '05. Executive Bedroom & Workspace',
    subtitle: 'Furnished interior with upholstered king bed and ergonomic Herman Miller style WFH desk.',
    badge: 'Furnished for Work & Rest',
    cameraPos: [-2.8, 4.8, 0.8],
    targetPos: [-4, 4.2, -4],
    tag: '300 Mbps Fiber FTTH'
  },
  {
    stage: 6,
    id: 'kitchen',
    title: '06. Gourmet Marble Kitchen',
    subtitle: 'Calacatta marble waterfall island, induction cooktop, and architectural bath vanity.',
    badge: 'Calacatta Marble Finishes',
    cameraPos: [2.8, 4.8, 0.8],
    targetPos: [4.5, 4.2, -4],
    tag: 'RO Purified Water + Modular'
  },
  {
    stage: 7,
    id: 'balcony',
    title: '07. Balcony & Panoramic City View',
    subtitle: 'Open-air private terrace with monstera planters overlooking Indian IT corridors.',
    badge: 'Sunlit Balcony Sanctuary',
    cameraPos: [0, 5.2, -7],
    targetPos: [0, 4.8, -25],
    tag: 'AQI 24 Clean Air • Sunset Deck'
  },
  {
    stage: 8,
    id: 'cta',
    title: '08. Ready for Zero-Brokerage Living?',
    subtitle: 'Sign your Aadhaar e-agreement in 10 minutes and move in within 24 hours.',
    badge: 'Primary CTA Reveal',
    cameraPos: [0, 16, 32],
    targetPos: [0, 6, -8],
    tag: '₹0 Brokerage Guaranteed'
  }
];

// Single-shot camera controller component inside R3F Canvas
function SingleShotCameraController({ progress, interactiveMode }) {
  const cameraRef = useRef();
  const controlsRef = useRef();

  useFrame(() => {
    if (interactiveMode || !cameraRef.current || !controlsRef.current) return;

    // Determine current interval between the 8 stages
    const totalSegments = CAMERA_STAGES.length - 1;
    const rawIndex = progress * totalSegments;
    const idx = Math.min(Math.floor(rawIndex), totalSegments - 1);
    const t = rawIndex - idx;

    // Cubic easing for cinematic Foster + Partners smoothness
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const fromStage = CAMERA_STAGES[idx];
    const toStage = CAMERA_STAGES[idx + 1];

    // Lerp camera position
    cameraRef.current.position.lerpVectors(
      new THREE.Vector3(...fromStage.cameraPos),
      new THREE.Vector3(...toStage.cameraPos),
      easeT
    );

    // Lerp camera target (OrbitControls target)
    controlsRef.current.target.lerpVectors(
      new THREE.Vector3(...fromStage.targetPos),
      new THREE.Vector3(...toStage.targetPos),
      easeT
    );

    controlsRef.current.update();
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 24, 44]} fov={45} />
      <OrbitControls
        ref={controlsRef}
        enableZoom={interactiveMode}
        enablePan={interactiveMode}
        enableRotate={interactiveMode}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  );
}

export default function FosterCinematicHero() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [interactiveMode, setInteractiveMode] = useState(false);

  // 1. Initialize Lenis smooth scrolling for premium Apple-style scroll feel
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  // 2. Setup GSAP ScrollTrigger to tie scroll progress to camera flight
  useEffect(() => {
    if (isAutoPlaying) return; // Disable scrolltrigger when auto-play tour is running

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=450%',
      pin: true,
      scrub: 1.5,
      onUpdate: (self) => {
        const p = self.progress;
        setProgress(p);
        const idx = Math.min(
          Math.floor(p * CAMERA_STAGES.length),
          CAMERA_STAGES.length - 1
        );
        setActiveIdx(idx);
      }
    });

    return () => trigger.kill();
  }, [isAutoPlaying]);

  // 3. Optional Auto-Play Walkthrough timer (if user clicks Play)
  useEffect(() => {
    let timer;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 0.003;
          if (next >= 1) {
            setIsAutoPlaying(false);
            return 1;
          }
          const idx = Math.min(
            Math.floor(next * CAMERA_STAGES.length),
            CAMERA_STAGES.length - 1
          );
          setActiveIdx(idx);
          return next;
        });
      }, 30);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handleSelectStage = (idx) => {
    setIsAutoPlaying(false);
    setActiveIdx(idx);
    setProgress(idx / (CAMERA_STAGES.length - 1));
  };

  const currentStage = CAMERA_STAGES[activeIdx] || CAMERA_STAGES[0];

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-[#FAFAFA] overflow-hidden">
      {/* =========================================================================
          1. REALISTIC THREE.JS 3D ARCHITECTURAL WALKTHROUGH CANVAS
         ========================================================================= */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15
          }}
        >
          <SingleShotCameraController progress={progress} interactiveMode={interactiveMode} />
          <FosterArchitecturalScene progress={progress} interactiveMode={interactiveMode} />
        </Canvas>
      </div>

      {/* =========================================================================
          2. TOP ARCHITECTURAL APPLE VISION HUD & TITLE BAR
         ========================================================================= */}
      <div className="absolute top-24 left-0 right-0 z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="pointer-events-auto">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-gray-200/80 shadow-sm text-xs font-bold text-gray-900 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#E1224D] animate-pulse" />
              <span className="uppercase tracking-wider font-mono">
                Foster + Partners • Architectural Walkthrough
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-[#E1224D] font-semibold">{currentStage.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">
              {currentStage.title.split('.')[1]?.trim() || currentStage.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-xl leading-relaxed">
              {currentStage.subtitle}
            </p>
          </div>

          {/* RIGHT TOOLS: PLAY WALKTHROUGH + INTERACTIVE MODE */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md ${
                isAutoPlaying
                  ? 'bg-[#E1224D] text-white shadow-rose-500/25'
                  : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoPlaying ? 'Walkthrough Playing' : 'Play Cinematic Walkthrough'}</span>
            </button>

            <button
              onClick={() => setInteractiveMode(!interactiveMode)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all border ${
                interactiveMode
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white/80 backdrop-blur-md text-gray-700 hover:bg-white border-gray-200'
              }`}
              title="Toggle free orbit camera inspection"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{interactiveMode ? 'Orbit Mode ON' : 'Free Inspect'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. PRIMARY CALL-TO-ACTION REVEAL CARD (APPEARS ON STAGE 8 / ZOOM OUT)
         ========================================================================= */}
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center p-4 transition-all duration-700 pointer-events-none ${
          progress >= 0.85 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="max-w-2xl w-full bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-8 sm:p-10 shadow-2xl text-center pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-100 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Foster + Partners Living • Zero Brokerage</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Ready to experience OwnStay?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-lg mx-auto leading-relaxed">
            Sign your Aadhaar e-agreement in 10 minutes and unlock your solid walnut door with your mobile key. No broker commissions ever.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              to="/properties"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#E1224D] hover:bg-[#C71B42] text-white text-sm font-bold shadow-lg shadow-rose-600/30 transition-transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Book Instant Free Tour</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/cities"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-bold transition-all"
            >
              Explore Tier-2 Cities
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-gray-100">
            <div>
              <p className="text-lg font-extrabold text-gray-900">₹0</p>
              <p className="text-xs text-gray-500">Brokerage Ever</p>
            </div>
            <div>
              <p className="text-lg font-extrabold text-gray-900">25-Point</p>
              <p className="text-xs text-gray-500">Engineering Audit</p>
            </div>
            <div>
              <p className="text-lg font-extrabold text-gray-900">10 Min</p>
              <p className="text-xs text-gray-500">Aadhaar E-Sign</p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. BOTTOM 8-STAGE ARCHITECTURAL SCRUBBER PILLS
         ========================================================================= */}
      <div className="absolute bottom-6 left-0 right-0 z-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CAMERA_STAGES.map((stg, idx) => {
            const active = idx === activeIdx;
            return (
              <button
                key={stg.id}
                onClick={() => handleSelectStage(idx)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-left transition-all shrink-0 border ${
                  active
                    ? 'bg-gray-900 border-gray-900 text-white shadow-md scale-105'
                    : 'bg-white/80 backdrop-blur-md border-gray-200/80 text-gray-700 hover:bg-white hover:border-gray-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    active ? 'bg-[#E1224D]' : 'bg-gray-300'
                  }`}
                />
                <span className="text-xs font-bold whitespace-nowrap">
                  0{stg.stage} • {stg.title.split('.')[1]?.trim().split(' ')[0] || stg.id}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
