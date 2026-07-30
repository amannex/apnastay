import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, RotateCcw, Compass, Sparkles, ArrowDown } from 'lucide-react';
import * as THREE from 'three';
import BuildingScene from './BuildingScene';

gsap.registerPlugin(ScrollTrigger);

// 7 Cinematic Camera Checkpoints for the Realistic Architectural Residence Scroll Story
const CAMERA_CHECKPOINTS = [
  {
    id: 'building',
    label: 'Realistic Building',
    headline: 'Your next home starts here.',
    subheadline: 'Architectural multi-story residence with zero-brokerage rental living.',
    pos: [0, 8, 33],
    target: [0, 6, 0],
    doorOpen: 0
  },
  {
    id: 'gallery',
    label: 'Entrance & Gallery',
    headline: 'Zero Brokerage. 100% Verified.',
    subheadline: 'Glass lobby with architectural reception, art gallery, and 25-point inspection desk.',
    pos: [0, 2.5, 16],
    target: [0, 2.0, 7],
    doorOpen: 0
  },
  {
    id: 'hallway',
    label: 'Hallway & Smart Door',
    headline: 'Instant NFC Smart-Lock Access.',
    subheadline: 'Tour on your schedule — watch the solid walnut door unlock and swing open.',
    pos: [0, 3.8, 9],
    target: [0, 3.0, 2],
    doorOpen: 1
  },
  {
    id: 'kitchen',
    label: 'Kitchen & Living Room',
    headline: 'Gourmet Kitchen & Living Gallery.',
    subheadline: 'Calacatta marble waterfall island, induction cooktop, and modern sectional lounge.',
    pos: [0, 3.8, 2.5],
    target: [0, 3.0, -3],
    doorOpen: 1
  },
  {
    id: 'bedroom',
    label: 'Executive Room',
    headline: 'Furnished for Deep Work & Rest.',
    subheadline: 'Herman Miller style WFH setup, curved 4K monitor, and upholstered platform bed.',
    pos: [0, 3.8, -3.5],
    target: [0, 3.0, -9],
    doorOpen: 1
  },
  {
    id: 'balcony',
    label: 'Sunlit Balcony',
    headline: 'Private Sunlit Sanctuaries.',
    subheadline: 'Breathe in the city from private balconies with curated monstera greenery.',
    pos: [0, 3.8, -9.5],
    target: [0, 3.2, -15],
    doorOpen: 1
  },
  {
    id: 'cta',
    label: 'Find Your Residence',
    headline: 'Ready to experience OwnStay?',
    subheadline: 'Sign your digital agreement in 10 minutes and move in within 24 hours.',
    pos: [0, 7.5, -4],
    target: [0, 3.0, -9],
    doorOpen: 1
  }
];

function CameraController({ sceneIndex, interactiveMode, progress }) {
  const cameraRef = useRef();

  useFrame((state, delta) => {
    if (interactiveMode) return; // OrbitControls take over in interactive mode
    if (!cameraRef.current) return;

    // Smoothly interpolate between checkpoints based on scroll progress
    const totalScenes = CAMERA_CHECKPOINTS.length - 1;
    const scaledProgress = progress * totalScenes;
    const currentIdx = Math.min(Math.floor(scaledProgress), totalScenes - 1);
    const nextIdx = Math.min(currentIdx + 1, totalScenes);
    const t = scaledProgress - currentIdx;

    const from = CAMERA_CHECKPOINTS[currentIdx];
    const to = CAMERA_CHECKPOINTS[nextIdx];

    // Lerp Camera position & target
    const targetPos = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...from.pos),
      new THREE.Vector3(...to.pos),
      t
    );
    const targetLook = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...from.target),
      new THREE.Vector3(...to.target),
      t
    );

    cameraRef.current.position.lerp(targetPos, delta * 5);
    cameraRef.current.lookAt(targetLook);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={48}
      position={CAMERA_CHECKPOINTS[0].pos}
    />
  );
}

export default function HeroScrollStory({ onExploreClick }) {
  const containerRef = useRef(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [doorOpenProgress, setDoorOpenProgress] = useState(0);

  useEffect(() => {
    if (interactiveMode) return;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        setScrollProgress(p);

        // Determine current scene index
        const total = CAMERA_CHECKPOINTS.length - 1;
        const currentIdx = Math.min(Math.floor(p * CAMERA_CHECKPOINTS.length), total);
        setSceneIndex(currentIdx);

        // Determine door opening progress around Hallway (scene index 2)
        if (p > 0.25) {
          setDoorOpenProgress(Math.min((p - 0.25) * 4, 1));
        } else {
          setDoorOpenProgress(0);
        }
      }
    });

    return () => trigger.kill();
  }, [interactiveMode]);

  const currentScene = CAMERA_CHECKPOINTS[sceneIndex] || CAMERA_CHECKPOINTS[0];

  return (
    <section ref={containerRef} className="relative w-full h-[600vh] bg-white">
      {/* 3D CANVAS VIEWPORT - STICKY FULL SCREEN */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* TOP FLOATING NAVBAR CONTROLS & APPLE-STYLE SCENE INDICATORS */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-none">
          {/* Scene Progress Pill */}
          <div className="pointer-events-auto glass-pill px-5 py-2.5 rounded-full flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E1224D] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Scene {sceneIndex + 1} / {CAMERA_CHECKPOINTS.length}
            </span>
            <span className="text-sm font-semibold text-[#1A1A1A] border-l border-[#EDEDED] pl-3">
              {currentScene.label}
            </span>
          </div>

          {/* Interactive Mode vs Scroll Story Toggle */}
          <div className="pointer-events-auto flex items-center gap-2 glass-pill p-1.5 rounded-full">
            <button
              onClick={() => setInteractiveMode(false)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                !interactiveMode
                  ? 'bg-[#E1224D] text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Scroll Story Mode
            </button>
            <button
              onClick={() => setInteractiveMode(true)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                interactiveMode
                  ? 'bg-[#1A1A1A] text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Interactive Orbit
            </button>
          </div>
        </div>

        {/* 3D R3F CANVAS */}
        <Canvas
          shadows
          className="w-full h-full"
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <CameraController
            sceneIndex={sceneIndex}
            interactiveMode={interactiveMode}
            progress={scrollProgress}
          />
          {interactiveMode && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxPolarAngle={Math.PI / 2 + 0.1}
              minDistance={4}
              maxDistance={35}
            />
          )}

          <Suspense fallback={null}>
            <BuildingScene
              doorOpenProgress={doorOpenProgress}
              sceneIndex={sceneIndex}
              interactiveMode={interactiveMode}
            />
          </Suspense>

          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.35}
            scale={40}
            blur={2.5}
            far={10}
            color="#000000"
          />
        </Canvas>

        {/* BOTTOM APPLE-STYLE STORY OVERLAY CARD (Animates on scene change) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 sm:px-6 pointer-events-none">
          <div
            key={currentScene.id}
            className="pointer-events-auto glass-panel p-5 sm:p-6 rounded-3xl shadow-apple-lg border border-white/80 transition-all duration-500 transform animate-slide-up text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {currentScene.label}
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A] mb-2">
              {currentScene.headline}
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] max-w-lg mx-auto mb-6">
              {currentScene.subheadline}
            </p>
            {sceneIndex === CAMERA_CHECKPOINTS.length - 1 ? (
              <button
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#E1224D] text-white font-semibold text-sm shadow-apple hover:bg-[#C71B42] transition-all duration-300 hover:scale-105"
              >
                Find Your Room Now
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
                <span>Scroll down to continue inside the building</span>
                <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#E1224D]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
