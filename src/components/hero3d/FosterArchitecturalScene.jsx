import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Sphere, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

export default function FosterArchitecturalScene({ progress = 0, interactiveMode = false }) {
  const doorGroupRef = useRef();
  const curtainRef1 = useRef();
  const curtainRef2 = useRef();
  const cloudsGroupRef = useRef();
  const nfcLedRef = useRef();

  // Smoothly animate door opening between progress 0.38 (Door stage) and 0.95 (CTA stage)
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Animated Sheer Curtains on Balcony (Subtle wind billowing)
    if (curtainRef1.current) {
      curtainRef1.current.position.z = -14 + Math.sin(time * 1.5) * 0.12;
      curtainRef1.current.rotation.y = Math.sin(time * 1.2) * 0.04;
    }
    if (curtainRef2.current) {
      curtainRef2.current.position.z = -14 + Math.cos(time * 1.7) * 0.12;
      curtainRef2.current.rotation.y = Math.cos(time * 1.4) * 0.04;
    }

    // 2. Animated Sky Clouds drifting across horizon
    if (cloudsGroupRef.current) {
      cloudsGroupRef.current.position.x = Math.sin(time * 0.15) * 6;
    }

    // 3. Smooth Walnut Room Door Unlock & Swing Open animation
    if (doorGroupRef.current) {
      // Open door when progress >= 0.36 (Stage 4 to 8)
      const targetAngle = progress >= 0.36 ? -Math.PI / 2.15 : 0;
      doorGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        doorGroupRef.current.rotation.y,
        targetAngle,
        delta * 5
      );
    }

    // 4. Glowing NFC Smart-Lock LED (#E1224D)
    if (nfcLedRef.current) {
      const pulse = (Math.sin(time * 4) + 1) * 0.5;
      nfcLedRef.current.material.emissiveIntensity = 0.8 + pulse * 1.2;
    }
  });

  return (
    <group>
      {/* REALISTIC DAYLIGHT & SOFT ARCHITECTURAL SHADOWS */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[25, 45, 30]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-20, 20, -20]} intensity={0.6} color="#FFE8D6" />

      {/* SOFT HDRI ARCHITECTURAL ENVIRONMENT REFLECTIONS */}
      <Environment preset="apartment" />

      {/* FLOATING SKY CLOUDS (ENVIRONMENTAL ANIMATION) */}
      <group ref={cloudsGroupRef} position={[0, 28, -60]}>
        <mesh position={[-25, 4, 0]}>
          <sphereGeometry args={[14, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.65} />
        </mesh>
        <mesh position={[0, 6, -5]}>
          <sphereGeometry args={[18, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.7} />
        </mesh>
        <mesh position={[28, 2, 0]}>
          <sphereGeometry args={[15, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.65} />
        </mesh>
      </group>

      {/* ==============================================================
          1. REALISTIC MULTI-STORY ARCHITECTURAL RESIDENTIAL TOWER
         ============================================================== */}
      <group position={[0, 0, 0]}>
        {/* Main Building Core & Glass Curtain Wall Facade */}
        <mesh position={[0, 11, -8]} receiveShadow castShadow>
          <boxGeometry args={[26, 22, 34]} />
          <meshPhysicalMaterial
            color="#FAFAFA"
            roughness={0.25}
            metalness={0.05}
            clearcoat={0.3}
          />
        </mesh>

        {/* Architectural Glass Facade Panels */}
        <mesh position={[0, 11, 9.1]}>
          <boxGeometry args={[22, 18, 0.4]} />
          <meshPhysicalMaterial
            color="#E8F4F8"
            roughness={0.1}
            metalness={0.1}
            transmission={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Architectural Floor Slab Bands (Foster + Partners horizontal louvers) */}
        {[-3, 2, 7, 12, 17].map((y, idx) => (
          <mesh key={idx} position={[0, y, -8]} receiveShadow>
            <boxGeometry args={[27.6, 0.45, 35.4]} />
            <meshPhysicalMaterial color="#EDEDED" roughness={0.4} metalness={0.1} />
          </mesh>
        ))}
      </group>

      {/* ==============================================================
          2. ENTRANCE & GLASS GALLERY LOBBY (LEVEL 1 / 2)
         ============================================================== */}
      <group position={[0, 2.2, 15]}>
        {/* Glass Entrance Canopy */}
        <mesh position={[0, 3.2, 2]} receiveShadow castShadow>
          <boxGeometry args={[16, 0.35, 6]} />
          <meshPhysicalMaterial color="#1A1A1A" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Entrance Columns */}
        {[-7, 7].map((x, i) => (
          <mesh key={i} position={[x, 1.5, 3.5]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 3.5, 32]} />
            <meshPhysicalMaterial color="#E1224D" roughness={0.3} metalness={0.2} />
          </mesh>
        ))}
        {/* Reception Desk inside lobby */}
        <mesh position={[0, 0.8, -3]} castShadow receiveShadow>
          <boxGeometry args={[7, 1.1, 2.2]} />
          <meshPhysicalMaterial color="#1D1D1F" roughness={0.2} metalness={0.4} />
        </mesh>
      </group>

      {/* ==============================================================
          3. NATURALLY LIT CORRIDOR (LEVEL 4 HALLWAY)
         ============================================================== */}
      <group position={[0, 3.8, 8]}>
        {/* Walnut Timber Corridor Flooring */}
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[8, 0.1, 14]} />
          <meshPhysicalMaterial color="#A47551" roughness={0.4} metalness={0.05} />
        </mesh>
        {/* Recessed Warm Ceiling LED Strip */}
        <mesh position={[0, 2.8, 0]}>
          <boxGeometry args={[0.4, 0.05, 12]} />
          <meshBasicMaterial color="#FFF9E6" />
        </mesh>
      </group>

      {/* ==============================================================
          4. SMART WALNUT ROOM DOORWAY & NFC SMART LOCK (LEVEL 4)
         ============================================================== */}
      <group position={[0, 3.8, 2.8]}>
        {/* Architectural Door Frame */}
        <mesh position={[-2.4, 1.3, 0]}>
          <boxGeometry args={[0.3, 2.7, 0.4]} />
          <meshPhysicalMaterial color="#1A1A1A" roughness={0.3} />
        </mesh>
        <mesh position={[2.4, 1.3, 0]}>
          <boxGeometry args={[0.3, 2.7, 0.4]} />
          <meshPhysicalMaterial color="#1A1A1A" roughness={0.3} />
        </mesh>

        {/* Solid Walnut Door Mesh with Rotating Pivot Ref */}
        <group position={[-2.2, 0, 0]} ref={doorGroupRef}>
          <mesh position={[2.2, 1.3, 0]} castShadow receiveShadow>
            <boxGeometry args={[4.4, 2.6, 0.18]} />
            <meshPhysicalMaterial color="#6B4423" roughness={0.45} metalness={0.05} />
          </mesh>

          {/* Glowing NFC Smart Lock Handle & Badge (#E1224D) */}
          <group position={[4.0, 1.25, 0.12]}>
            <mesh castShadow>
              <boxGeometry args={[0.35, 0.9, 0.1]} />
              <meshPhysicalMaterial color="#1D1D1F" roughness={0.2} metalness={0.8} />
            </mesh>
            {/* LED Status Ring */}
            <mesh position={[0, 0.25, 0.06]} ref={nfcLedRef}>
              <cylinderGeometry args={[0.06, 0.06, 0.02, 32]} />
              <meshStandardMaterial
                color="#E1224D"
                emissive="#E1224D"
                emissiveIntensity={1.5}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* ==============================================================
          5. FURNISHED INTERIOR: EXECUTIVE BEDROOM & WORKSPACE (LEVEL 4)
         ============================================================== */}
      <group position={[-4, 3.8, -4]}>
        {/* Executive King Platform Bed */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 0.8, 6]} />
          <meshPhysicalMaterial color="#EAEAEA" roughness={0.6} />
        </mesh>
        {/* Upholstered Headboard */}
        <mesh position={[0, 1.4, -2.9]} castShadow>
          <boxGeometry args={[5.2, 1.8, 0.4]} />
          <meshPhysicalMaterial color="#8E8E93" roughness={0.5} />
        </mesh>

        {/* Herman Miller style Executive Work Desk & Curved Monitor */}
        <group position={[5.5, 0, -1]}>
          <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 0.12, 1.8]} />
            <meshPhysicalMaterial color="#1D1D1F" roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Curved 4K Monitor */}
          <mesh position={[0, 1.45, -0.6]} castShadow>
            <boxGeometry args={[2.2, 1.1, 0.1]} />
            <meshPhysicalMaterial color="#0A0A0A" roughness={0.1} metalness={0.8} />
          </mesh>
        </group>
      </group>

      {/* ==============================================================
          6. GOURMET KITCHEN & ARCHITECTURAL BATHROOM (LEVEL 4)
         ============================================================== */}
      <group position={[4.5, 3.8, -4]}>
        {/* Calacatta Marble Waterfall Kitchen Island */}
        <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.5, 1.0, 2.4]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            roughness={0.12}
            metalness={0.05}
            clearcoat={0.5}
          />
        </mesh>
        {/* Architectural Barstools */}
        {[-1.6, 0, 1.6].map((x, i) => (
          <mesh key={i} position={[x, 0.45, 1.8]} castShadow>
            <cylinderGeometry args={[0.4, 0.45, 0.9, 32]} />
            <meshPhysicalMaterial color="#E1224D" roughness={0.3} metalness={0.2} />
          </mesh>
        ))}
      </group>

      {/* ==============================================================
          7. SUNLIT BALCONY WITH PANORAMIC CITY VIEW & CURTAINS
         ============================================================== */}
      <group position={[0, 3.8, -13.5]}>
        {/* Balcony Timber Deck Flooring */}
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[16, 0.1, 5]} />
          <meshPhysicalMaterial color="#9C6644" roughness={0.5} />
        </mesh>
        {/* Safety Glass Balustrade Railing */}
        <mesh position={[0, 1.1, -2.4]}>
          <boxGeometry args={[16, 2.2, 0.08]} />
          <meshPhysicalMaterial
            color="#E8F4F8"
            roughness={0.05}
            metalness={0.1}
            transmission={0.8}
            transparent
            opacity={0.65}
          />
        </mesh>

        {/* Animated Billowing Sheer Curtains */}
        <mesh position={[-5, 2.0, 1.5]} ref={curtainRef1}>
          <boxGeometry args={[3.5, 4.0, 0.06]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            roughness={0.4}
            transmission={0.5}
            transparent
            opacity={0.85}
          />
        </mesh>
        <mesh position={[5, 2.0, 1.5]} ref={curtainRef2}>
          <boxGeometry args={[3.5, 4.0, 0.06]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            roughness={0.4}
            transmission={0.5}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Curated Monstera Planters on Balcony */}
        {[-6.5, 6.5].map((x, idx) => (
          <group key={idx} position={[x, 0, -1]}>
            <mesh position={[0, 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.5, 0.4, 1.0, 32]} />
              <meshPhysicalMaterial color="#2C2C2E" roughness={0.3} />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshPhysicalMaterial color="#2E6F40" roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ==============================================================
          8. PANORAMIC CITY SKYLINE SILHOUETTES IN DISTANCE
         ============================================================== */}
      <group position={[0, 0, -55]}>
        {[-35, -20, -8, 8, 22, 38].map((x, idx) => (
          <mesh key={idx} position={[x, 15, 0]} receiveShadow>
            <boxGeometry args={[10, 30 + (idx % 3) * 8, 10]} />
            <meshPhysicalMaterial color="#EAEAEA" roughness={0.7} metalness={0.1} />
          </mesh>
        ))}
      </group>

      {/* SOFT ARCHITECTURAL FLOOR CONTACT SHADOW */}
      <ContactShadows
        position={[0, -0.1, 0]}
        opacity={0.4}
        scale={60}
        blur={2}
        far={15}
      />
    </group>
  );
}
