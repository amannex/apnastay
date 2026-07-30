import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, MeshReflectorMaterial, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export default function BuildingScene({ doorOpenProgress = 0, sceneIndex = 0, interactiveMode = false }) {
  const buildingGroup = useRef();
  const doorRef = useRef();
  const fanRef = useRef();

  useFrame((state, delta) => {
    // Subtle architectural breathing rotation in interactive mode
    if (interactiveMode && buildingGroup.current) {
      buildingGroup.current.rotation.y = THREE.MathUtils.lerp(
        buildingGroup.current.rotation.y,
        Math.sin(state.clock.elapsedTime * 0.25) * 0.08,
        delta * 3
      );
    } else if (buildingGroup.current) {
      buildingGroup.current.rotation.y = THREE.MathUtils.lerp(buildingGroup.current.rotation.y, 0, delta * 5);
    }

    // Soft ceiling fan rotation in living/bedroom
    if (fanRef.current) {
      fanRef.current.rotation.y += delta * 1.8;
    }

    // Realistic door hinge animation (doorOpenProgress 0 = closed, 1 = open 95 degrees)
    if (doorRef.current) {
      doorRef.current.rotation.y = THREE.MathUtils.lerp(
        doorRef.current.rotation.y,
        -doorOpenProgress * (Math.PI / 1.9),
        delta * 6
      );
    }
  });

  return (
    <group ref={buildingGroup}>
      {/* =========================================================================
          1. REALISTIC MODERN MULTI-STORY BUILDING EXTERIOR (FACADE & CANOPY)
         ========================================================================= */}
      <group position={[0, 0, 0]}>
        {/* Architectural Multi-Story Concrete & Glass Tower Shell */}
        <RoundedBox args={[20, 16, 18]} radius={0.4} smoothness={4} position={[0, 8, 0]}>
          <meshStandardMaterial color="#FAFAFA" roughness={0.25} metalness={0.15} />
        </RoundedBox>

        {/* Tinted Glass Balcony Dividers & Upper Floors Facade */}
        {[-4, 0, 4].map((yOffset, idx) => (
          <group key={idx} position={[0, 10 + yOffset, 9.1]}>
            <mesh position={[0, 0, 0]}>
              <planeGeometry args={[16, 2.8]} />
              <meshPhysicalMaterial
                color="#1E293B"
                transmission={0.6}
                opacity={0.8}
                transparent
                roughness={0.1}
                reflectivity={0.9}
              />
            </mesh>
            {/* LED Linear Architectural Sconce Bar */}
            <mesh position={[0, 1.5, 0.05]}>
              <boxGeometry args={[16.2, 0.08, 0.1]} />
              <meshBasicMaterial color="#FFF7ED" />
            </mesh>
          </group>
        ))}

        {/* Grand Street Canopy Entrance */}
        <group position={[0, 3.8, 11]}>
          <RoundedBox args={[14, 0.4, 4.5]} radius={0.1} position={[0, 0, 0]}>
            <meshStandardMaterial color="#1A1A1A" metalness={0.7} roughness={0.2} />
          </RoundedBox>
          {/* Canopy Support Pillars */}
          <mesh position={[-6, -1.9, 1.8]}>
            <cylinderGeometry args={[0.2, 0.2, 3.8, 16]} />
            <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[6, -1.9, 1.8]}>
            <cylinderGeometry args={[0.2, 0.2, 3.8, 16]} />
            <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Recessed Warm LED Canopy Downlights */}
          <pointLight position={[0, -0.5, 0]} intensity={4.0} distance={12} color="#FFF8E7" />
        </group>

        {/* Ground Sidewalk & Curated Planter Landscape */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 12]}>
          <planeGeometry args={[30, 14]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.85} />
        </mesh>
        {/* Exterior Planters */}
        <group position={[-7.5, 0.6, 11]}>
          <RoundedBox args={[2.5, 1.2, 2.5]} radius={0.1} position={[0, 0, 0]}>
            <meshStandardMaterial color="#334155" roughness={0.4} />
          </RoundedBox>
          <mesh position={[0, 1.0, 0]}>
            <sphereGeometry args={[1.1, 16, 16]} />
            <meshStandardMaterial color="#15803D" roughness={0.5} />
          </mesh>
        </group>
        <group position={[7.5, 0.6, 11]}>
          <RoundedBox args={[2.5, 1.2, 2.5]} radius={0.1} position={[0, 0, 0]}>
            <meshStandardMaterial color="#334155" roughness={0.4} />
          </RoundedBox>
          <mesh position={[0, 1.0, 0]}>
            <sphereGeometry args={[1.1, 16, 16]} />
            <meshStandardMaterial color="#15803D" roughness={0.5} />
          </mesh>
        </group>

        {/* 3D Architectural Brand Logo on Upper Facade */}
        <group position={[0, 13.8, 9.15]}>
          <Text
            fontSize={1.2}
            color="#E1224D"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#FFFFFF"
          >
            OWNSTAY RESIDENCES
          </Text>
        </group>
      </group>

      {/* =========================================================================
          2. GRAND GLASS ENTRANCE LOBBY & ART GALLERY (SCENE 2)
         ========================================================================= */}
      <group position={[0, 1.8, 7]}>
        {/* Lobby Reflective Marble-Look Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.78, 0]}>
          <planeGeometry args={[16, 8]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={1024}
            mirror={0.3}
            mixBlur={0.7}
            mixStrength={1.8}
            roughness={0.35}
            color="#F8FAFC"
          />
        </mesh>

        {/* Automatic Sliding Glass Entrance Wall */}
        <mesh position={[0, 0.5, 2]}>
          <planeGeometry args={[14, 4.5]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            transmission={0.92}
            opacity={1}
            transparent
            roughness={0.03}
            ior={1.45}
            thickness={0.5}
          />
        </mesh>

        {/* Architectural Reception & Security Inspection Desk */}
        <group position={[0, -0.6, -1.2]}>
          <RoundedBox args={[4.6, 1.2, 1.1]} radius={0.1} position={[0, 0, 0]}>
            <meshStandardMaterial color="#0F172A" roughness={0.2} metalness={0.3} />
          </RoundedBox>
          {/* Glowing Red Coral Toe-Kick Strip */}
          <mesh position={[0, -0.55, 0.56]}>
            <boxGeometry args={[4.2, 0.08, 0.05]} />
            <meshBasicMaterial color="#E1224D" />
          </mesh>
          {/* White Marble Transaction Countertop */}
          <RoundedBox args={[4.8, 0.12, 1.3]} radius={0.03} position={[0, 0.65, 0]}>
            <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
          </RoundedBox>
          {/* Digital Check-in Terminal */}
          <mesh position={[1.2, 0.95, 0]}>
            <boxGeometry args={[0.5, 0.35, 0.1]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
        </group>

        {/* Lobby Art Gallery Walls & Framed Artwork */}
        <group position={[-5.8, 0.5, -1]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[3, 2.2]} />
            <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
          </mesh>
          {/* Gallery Artwork Canvas */}
          <mesh position={[0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[2.6, 1.8]} />
            <meshBasicMaterial color="#E1224D" />
          </mesh>
          {/* Art Gallery Spotlight */}
          <pointLight position={[1, 1.5, 0]} intensity={2.5} distance={6} color="#FFFBEB" />
        </group>

        <group position={[5.8, 0.5, -1]}>
          <mesh rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[3, 2.2]} />
            <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
          </mesh>
          <mesh position={[-0.05, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[2.6, 1.8]} />
            <meshBasicMaterial color="#3B82F6" />
          </mesh>
          <pointLight position={[-1, 1.5, 0]} intensity={2.5} distance={6} color="#FFFBEB" />
        </group>
      </group>

      {/* =========================================================================
          3. LUXURY HALLWAY & NFC SMART-LOCK APARTMENT DOOR (SCENE 3)
         ========================================================================= */}
      <group position={[0, 3, 2.5]}>
        {/* Corridor Side Walls with Warm Wood Paneling Accents */}
        <mesh position={[-3.2, 0.5, 0]}>
          <boxGeometry args={[0.3, 4, 9]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.7} />
        </mesh>
        <mesh position={[3.2, 0.5, 0]}>
          <boxGeometry args={[0.3, 4, 9]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.7} />
        </mesh>

        {/* Hallway Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.48, 0]}>
          <planeGeometry args={[6.4, 9]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
        </mesh>

        {/* Recessed Ceiling LED Track Light */}
        <mesh position={[0, 2.45, 0]}>
          <boxGeometry args={[0.3, 0.08, 7]} />
          <meshBasicMaterial color="#FFF5DC" />
        </mesh>
        <pointLight position={[0, 2.1, 1]} intensity={3.0} distance={10} color="#FFF8E7" />

        {/* === REALISTIC OPENABLE SOLID-CORE WOODEN APARTMENT DOOR WITH NFC LOCK === */}
        <group position={[-1.4, -1.5, -4]} ref={doorRef}>
          {/* Door Frame Surround */}
          <mesh position={[1.4, 2, 0.05]}>
            <boxGeometry args={[3.1, 4.1, 0.15]} />
            <meshStandardMaterial color="#0F172A" roughness={0.4} />
          </mesh>
          {/* Main Solid Walnut Door Panel */}
          <mesh position={[1.4, 2, 0]}>
            <boxGeometry args={[2.8, 3.9, 0.14]} />
            <meshStandardMaterial color="#3F2E21" roughness={0.4} />
          </mesh>
          {/* Brushed Steel Door Handle & NFC Smart-Lock Reader */}
          <group position={[2.4, 2, 0.1]}>
            {/* Lock Backplate */}
            <mesh>
              <boxGeometry args={[0.18, 0.45, 0.05]} />
              <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* NFC Sensor Circle */}
            <mesh position={[0, 0.1, 0.03]}>
              <circleGeometry args={[0.05, 24]} />
              <meshBasicMaterial color={doorOpenProgress > 0.25 ? '#10B981' : '#E1224D'} />
            </mesh>
            {/* Lever Handle */}
            <mesh position={[0.08, -0.05, 0.06]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.2, 16]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        </group>
      </group>

      {/* =========================================================================
          4. REALISTIC GOURMET KITCHEN & LIVING ROOM GALLERY (SCENE 4)
         ========================================================================= */}
      <group position={[0, 3, -3]}>
        {/* Apartment White Oak Hardwood Flooring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.48, 0]}>
          <planeGeometry args={[16, 8]} />
          <meshStandardMaterial color="#E6D5BC" roughness={0.45} />
        </mesh>

        {/* --- KITCHEN ISLAND & MARBLE WATERFALL COUNTERTOP --- */}
        <group position={[-2.5, -0.4, 1]}>
          {/* Matte Black Kitchen Island Cabinet Base */}
          <RoundedBox args={[3.8, 1.8, 1.8]} radius={0.05} position={[0, 0, 0]}>
            <meshStandardMaterial color="#1E293B" roughness={0.3} />
          </RoundedBox>
          {/* Calacatta Marble Countertop with Waterfall Edge */}
          <RoundedBox args={[4.2, 0.15, 2.1]} radius={0.04} position={[0, 0.95, 0]}>
            <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
          </RoundedBox>
          {/* Built-in Induction Cooktop */}
          <mesh position={[-0.6, 1.03, 0]}>
            <boxGeometry args={[1.2, 0.02, 0.8]} />
            <meshStandardMaterial color="#0F172A" roughness={0.05} metalness={0.8} />
          </mesh>
          {/* Architectural Pendant Lights Over Island */}
          {[-1.2, 0, 1.2].map((xOffset, idx) => (
            <group key={idx} position={[xOffset, 2.5, 0]}>
              <mesh>
                <cylinderGeometry args={[0.12, 0.12, 0.4, 16]} />
                <meshStandardMaterial color="#1A1A1A" metalness={0.8} />
              </mesh>
              <mesh position={[0, -0.22, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="#FFF5DC" />
              </mesh>
            </group>
          ))}
          {/* Barstools */}
          {[0.6, 1.5].map((xPos, idx) => (
            <group key={idx} position={[xPos, -0.3, 1.3]}>
              <cylinderGeometry args={[0.25, 0.28, 1.3, 16]} />
              <meshStandardMaterial color="#334155" metalness={0.5} />
            </group>
          ))}
        </group>

        {/* --- LIVING ROOM GALLERY & LOUNGE --- */}
        <group position={[3.5, -0.6, 0.5]}>
          {/* Modern Low-Profile Sectional Sofa */}
          <RoundedBox args={[4.2, 0.8, 2.4]} radius={0.2} position={[0, 0.4, 0]}>
            <meshStandardMaterial color="#94A3B8" roughness={0.65} />
          </RoundedBox>
          {/* Sofa Backrest */}
          <RoundedBox args={[4.2, 0.7, 0.5]} radius={0.15} position={[0, 1.0, -0.95]}>
            <meshStandardMaterial color="#64748B" roughness={0.65} />
          </RoundedBox>
          {/* Red Coral Accent Throw Pillow */}
          <RoundedBox args={[0.6, 0.5, 0.3]} radius={0.1} position={[-1.4, 1.0, -0.6]} rotation={[0.2, 0.3, 0]}>
            <meshStandardMaterial color="#E1224D" roughness={0.4} />
          </RoundedBox>

          {/* Architectural Glass & Oak Coffee Table */}
          <group position={[0, 0.3, 2.2]}>
            <RoundedBox args={[2.2, 0.08, 1.4]} radius={0.04} position={[0, 0.35, 0]}>
              <meshPhysicalMaterial color="#FFFFFF" transmission={0.9} roughness={0.05} />
            </RoundedBox>
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[1.8, 0.3, 1.0]} />
              <meshStandardMaterial color="#3F2E21" />
            </mesh>
          </group>
        </group>

        {/* Gallery Wall with Large Architectural Print */}
        <group position={[0, 1.2, -3.8]}>
          <mesh>
            <planeGeometry args={[5, 2.5]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[4.6, 2.1]} />
            <meshBasicMaterial color="#E1224D" />
          </mesh>
        </group>

        {/* Kitchen & Living Room Warm Ambient Lighting */}
        <pointLight position={[-2.5, 1.8, 1]} intensity={3.5} distance={12} color="#FFF8E7" />
        <pointLight position={[3.5, 1.8, 1]} intensity={3.5} distance={12} color="#FFF8E7" />
      </group>

      {/* =========================================================================
          5. EXECUTIVE FURNISHED BEDROOM & WORKSPACE ROOM (SCENE 5)
         ========================================================================= */}
      <group position={[0, 3, -9]}>
        {/* Bedroom Oak Wood Flooring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.48, 0]}>
          <planeGeometry args={[16, 8]} />
          <meshStandardMaterial color="#E6D5BC" roughness={0.45} />
        </mesh>

        {/* === EXECUTIVE LUXURY BED === */}
        <group position={[-3.2, -0.8, 0]}>
          {/* Upholstered Platform Frame */}
          <RoundedBox args={[4.4, 0.7, 5.2]} radius={0.1} position={[0, 0, 0]}>
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </RoundedBox>
          {/* Plush White Mattress */}
          <RoundedBox args={[4.0, 0.55, 4.8]} radius={0.18} position={[0, 0.55, 0]}>
            <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
          </RoundedBox>
          {/* Textured Duvet Blanket */}
          <mesh position={[0, 0.85, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.8, 3.0]} />
            <meshStandardMaterial color="#E1224D" roughness={0.4} />
          </mesh>
          {/* Ergonomic Pillows */}
          <RoundedBox args={[1.5, 0.3, 0.8]} radius={0.12} position={[-1.1, 0.95, -1.8]}>
            <meshStandardMaterial color="#FAFAFA" />
          </RoundedBox>
          <RoundedBox args={[1.5, 0.3, 0.8]} radius={0.12} position={[1.1, 0.95, -1.8]}>
            <meshStandardMaterial color="#FAFAFA" />
          </RoundedBox>
        </group>

        {/* === EXECUTIVE WFH STANDING DESK & HERMAN MILLER STYLE CHAIR === */}
        <group position={[3.8, -0.8, 0]}>
          {/* White Oak Standing Desk Top */}
          <RoundedBox args={[3.2, 0.12, 1.8]} radius={0.04} position={[0, 1.6, 0]}>
            <meshStandardMaterial color="#FAFAFA" roughness={0.2} />
          </RoundedBox>
          {/* Brushed Metal T-Legs */}
          <mesh position={[-1.3, 0.8, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 1.6]} />
            <meshStandardMaterial color="#0F172A" metalness={0.8} />
          </mesh>
          <mesh position={[1.3, 0.8, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 1.6]} />
            <meshStandardMaterial color="#0F172A" metalness={0.8} />
          </mesh>

          {/* Curved Ultra-Wide 4K WFH Monitor */}
          <mesh position={[0, 2.35, -0.6]}>
            <boxGeometry args={[2.4, 1.1, 0.08]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} />
          </mesh>
          {/* Illuminated Active Screen Display */}
          <mesh position={[0, 2.35, -0.55]}>
            <planeGeometry args={[2.3, 1.0]} />
            <meshBasicMaterial color="#E0F2FE" />
          </mesh>
          {/* Minimalist Desk LED Lamp */}
          <mesh position={[1.2, 2.0, -0.4]}>
            <cylinderGeometry args={[0.18, 0.22, 0.7]} />
            <meshStandardMaterial color="#E1224D" />
          </mesh>

          {/* Realistic Ergonomic WFH Chair */}
          <group position={[0, 0.8, 0.7]}>
            <RoundedBox args={[1.1, 0.12, 1.1]} radius={0.05} position={[0, 0, 0]}>
              <meshStandardMaterial color="#1E293B" />
            </RoundedBox>
            <RoundedBox args={[1.0, 1.3, 0.12]} radius={0.05} position={[0, 0.7, -0.5]}>
              <meshStandardMaterial color="#334155" />
            </RoundedBox>
          </group>
        </group>

        {/* Soft Bedroom Ambient Lighting */}
        <pointLight position={[0, 2.2, 0]} intensity={3.5} distance={14} color="#FFF8E7" />
      </group>

      {/* =========================================================================
          6. PRIVATE SUNLIT BALCONY & TERRACE VIEW (SCENE 6)
         ========================================================================= */}
      <group position={[0, 3, -15]}>
        {/* Floor-to-Ceiling Glass Sliding Doors to Terrace */}
        <mesh position={[0, 0.5, 2]}>
          <planeGeometry args={[14, 4.2]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            transmission={0.92}
            opacity={1}
            transparent
            roughness={0.03}
          />
        </mesh>

        {/* Balcony Deck Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.48, 0]}>
          <planeGeometry args={[16, 6]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.8} />
        </mesh>

        {/* Frameless Glass Balcony Railing */}
        <mesh position={[0, -0.3, -2.8]}>
          <boxGeometry args={[16, 1.4, 0.08]} />
          <meshPhysicalMaterial color="#FFFFFF" transmission={0.85} opacity={0.65} transparent />
        </mesh>
        {/* Brushed Stainless Steel Handrail Cap */}
        <mesh position={[0, 0.45, -2.8]}>
          <boxGeometry args={[16, 0.08, 0.14]} />
          <meshStandardMaterial color="#1E293B" metalness={0.7} />
        </mesh>

        {/* Realistic Potted Monstera & Fiddle-Leaf Fig Greenery */}
        <group position={[-5.5, -0.8, -1.5]}>
          <cylinderGeometry args={[0.5, 0.4, 1.2, 16]} />
          <meshStandardMaterial color="#FAFAFA" />
          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[1.0, 16, 16]} />
            <meshStandardMaterial color="#15803D" roughness={0.4} />
          </mesh>
        </group>
        <group position={[5.5, -0.8, -1.5]}>
          <cylinderGeometry args={[0.55, 0.42, 1.3, 16]} />
          <meshStandardMaterial color="#FAFAFA" />
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[1.1, 16, 16]} />
            <meshStandardMaterial color="#166534" roughness={0.4} />
          </mesh>
        </group>

        {/* Golden Sunbeams & Floating Dust Particles */}
        <Sparkles count={60} scale={[14, 5, 8]} size={3.0} speed={0.3} color="#FDE047" position={[0, 1, 0]} />
      </group>

      {/* Global Warm Sun Directional Light & Ambient Fill */}
      <directionalLight position={[20, 30, 25]} intensity={3.0} color="#FFFBEB" castShadow />
      <ambientLight intensity={1.3} color="#FFFFFF" />
    </group>
  );
}
