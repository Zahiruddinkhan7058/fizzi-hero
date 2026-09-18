"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type GarmentType = "tuxedo" | "sherwani" | "suit";

interface GarmentProps {
  type: GarmentType;
  levitationIntensity?: number;
  mousePos: { x: number; y: number };
}

export function FloatingGarment({
  type,
  levitationIntensity = 1,
  mousePos,
}: GarmentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const secondaryGroupRef = useRef<THREE.Group>(null);
  const accessoriesRef = useRef<THREE.Group>(null);

  // Materials tailored for luxury fabrics with realistic sheen & anisotropic highlights
  const materials = useMemo(() => {
    return {
      // Tuxedo materials
      tuxedoFabric: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#0d111a"),
        roughness: 0.65,
        metalness: 0.15,
      }),
      tuxedoSatinLapel: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#161b26"),
        roughness: 0.2,
        metalness: 0.45,
      }),
      whiteShirt: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#fafafa"),
        roughness: 0.5,
        metalness: 0.05,
      }),
      silkBowtie: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#080a10"),
        roughness: 0.3,
        metalness: 0.35,
      }),
      goldAccents: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#e6b800"),
        roughness: 0.18,
        metalness: 0.92,
      }),
      platinumAccents: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#dcdde1"),
        roughness: 0.15,
        metalness: 0.95,
      }),

      // Sherwani materials
      sherwaniSilk: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#f7f1e3"),
        roughness: 0.4,
        metalness: 0.25,
      }),
      goldBrocade: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#d4af37"),
        roughness: 0.25,
        metalness: 0.85,
      }),
      rubyJewel: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#900C3F"),
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.6,
        thickness: 0.5,
      }),
      royalStole: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#b82434"),
        roughness: 0.35,
        metalness: 0.3,
      }),

      // Savile Row Suit materials
      charcoalWool: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1e2229"),
        roughness: 0.75,
        metalness: 0.1,
      }),
      pinstripeInner: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#2a303c"),
        roughness: 0.55,
        metalness: 0.2,
      }),
      burgundyTie: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#581825"),
        roughness: 0.28,
        metalness: 0.4,
      }),
      silverCuff: new THREE.MeshStandardMaterial({
        color: new THREE.Color("#e0e0e0"),
        roughness: 0.1,
        metalness: 0.95,
      }),
    };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const group = groupRef.current;
    if (!group) return;

    // Harmonic Anti-Gravity Levitation Equations
    const hoverY = Math.sin(time * 1.3) * 0.12 * levitationIntensity;
    const hoverX = Math.cos(time * 0.9) * 0.04 * levitationIntensity;
    const hoverZ = Math.sin(time * 0.7) * 0.05 * levitationIntensity;

    // Gentle rotational roll, pitch, and yaw
    const roll = Math.sin(time * 0.8) * 0.04 * levitationIntensity;
    const pitch = Math.cos(time * 1.1) * 0.03 * levitationIntensity;

    // Smooth inertia following viewer cursor
    const targetRotY = mousePos.x * 0.45;
    const targetRotX = -mousePos.y * 0.25;

    group.position.y = THREE.MathUtils.lerp(group.position.y, hoverY, 0.08);
    group.position.x = THREE.MathUtils.lerp(group.position.x, hoverX, 0.08);
    group.position.z = THREE.MathUtils.lerp(group.position.z, hoverZ, 0.08);

    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      targetRotY + Math.sin(time * 0.4) * 0.05,
      0.06
    );
    group.rotation.x = THREE.MathUtils.lerp(
      group.rotation.x,
      targetRotX + pitch,
      0.06
    );
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, roll, 0.06);

    // Floating accessories have secondary micro-levitation phase
    if (accessoriesRef.current) {
      accessoriesRef.current.position.y = Math.sin(time * 1.8) * 0.03;
      accessoriesRef.current.rotation.y = Math.sin(time * 1.2) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. BESPOKE MIDNIGHT TUXEDO */}
      {type === "tuxedo" && (
        <group scale={[1.25, 1.25, 1.25]} position={[0, -0.2, 0]}>
          {/* Main Tailored Torso Silhouette */}
          <mesh position={[0, 0, 0]} material={materials.tuxedoFabric} castShadow>
            <cylinderGeometry args={[0.58, 0.48, 1.35, 32]} />
          </mesh>

          {/* Sculpted Shoulder Pads */}
          <mesh position={[-0.64, 0.56, 0]} rotation={[0, 0, 0.25]} material={materials.tuxedoFabric}>
            <capsuleGeometry args={[0.18, 0.38, 16, 16]} />
          </mesh>
          <mesh position={[0.64, 0.56, 0]} rotation={[0, 0, -0.25]} material={materials.tuxedoFabric}>
            <capsuleGeometry args={[0.18, 0.38, 16, 16]} />
          </mesh>

          {/* Luxury Silk Satin Peak Lapels */}
          <mesh position={[-0.24, 0.28, 0.36]} rotation={[0.1, 0.22, -0.18]} material={materials.tuxedoSatinLapel}>
            <boxGeometry args={[0.22, 0.85, 0.06]} />
          </mesh>
          <mesh position={[0.24, 0.28, 0.36]} rotation={[0.1, -0.22, 0.18]} material={materials.tuxedoSatinLapel}>
            <boxGeometry args={[0.22, 0.85, 0.06]} />
          </mesh>

          {/* Crisp Pleated Tuxedo Shirt Bib */}
          <mesh position={[0, 0.32, 0.3]} material={materials.whiteShirt}>
            <boxGeometry args={[0.32, 0.72, 0.12]} />
          </mesh>

          {/* Floating Silk Bowtie */}
          <group position={[0, 0.64, 0.42]}>
            {/* Center knot */}
            <mesh material={materials.silkBowtie}>
              <boxGeometry args={[0.1, 0.09, 0.08]} />
            </mesh>
            {/* Wings */}
            <mesh position={[-0.14, 0, 0]} rotation={[0, 0, 0.1]} material={materials.silkBowtie}>
              <boxGeometry args={[0.2, 0.14, 0.04]} />
            </mesh>
            <mesh position={[0.14, 0, 0]} rotation={[0, 0, -0.1]} material={materials.silkBowtie}>
              <boxGeometry args={[0.2, 0.14, 0.04]} />
            </mesh>
          </group>

          {/* Polished Gold Jacket Button */}
          <mesh position={[0, -0.12, 0.52]} rotation={[Math.PI / 2, 0, 0]} material={materials.goldAccents}>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 24]} />
          </mesh>
          <mesh position={[0, -0.32, 0.5]} rotation={[Math.PI / 2, 0, 0]} material={materials.goldAccents}>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 24]} />
          </mesh>

          {/* Folded Silk Pocket Square */}
          <mesh position={[-0.32, 0.38, 0.44]} rotation={[0, 0, 0.15]} material={materials.whiteShirt}>
            <coneGeometry args={[0.08, 0.15, 3]} />
          </mesh>

          {/* Floating Gold Cufflinks drifting in mid-air */}
          <group ref={accessoriesRef}>
            <mesh position={[-0.88, 0.1, 0.25]} material={materials.goldAccents}>
              <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
            </mesh>
            <mesh position={[0.88, 0.15, 0.28]} material={materials.goldAccents}>
              <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
            </mesh>
          </group>
        </group>
      )}

      {/* 2. IMPERIAL ROYAL SHERWANI */}
      {type === "sherwani" && (
        <group scale={[1.25, 1.25, 1.25]} position={[0, -0.2, 0]}>
          {/* Elongated Imperial Silhouette */}
          <mesh position={[0, -0.1, 0]} material={materials.sherwaniSilk} castShadow>
            <cylinderGeometry args={[0.56, 0.58, 1.6, 32]} />
          </mesh>

          {/* Royal Mandarin / Bandhgala Stand-Up Collar */}
          <mesh position={[0, 0.72, 0]} material={materials.goldBrocade}>
            <cylinderGeometry args={[0.26, 0.28, 0.18, 32]} />
          </mesh>

          {/* Central Gold Zardozi Embroidery Placket */}
          <mesh position={[0, -0.05, 0.56]} material={materials.goldBrocade}>
            <boxGeometry args={[0.1, 1.45, 0.04]} />
          </mesh>

          {/* Hand-Crafted Ornate Gold Buttons */}
          {[-0.55, -0.38, -0.21, -0.04, 0.13, 0.3, 0.47].map((y, i) => (
            <mesh key={`sherwani-btn-${i}`} position={[0, y, 0.59]} material={materials.goldAccents}>
              <sphereGeometry args={[0.03, 16, 16]} />
            </mesh>
          ))}

          {/* Royal Ruby Brooch & Kalgi Medallion on Chest */}
          <group position={[-0.26, 0.45, 0.54]}>
            {/* Gold setting */}
            <mesh material={materials.goldBrocade}>
              <cylinderGeometry args={[0.065, 0.065, 0.02, 24]} />
            </mesh>
            {/* Center Ruby gem */}
            <mesh position={[0, 0, 0.02]} material={materials.rubyJewel}>
              <octahedronGeometry args={[0.045, 0]} />
            </mesh>
          </group>

          {/* Imperial Epaulette Shoulder Brocade */}
          <mesh position={[-0.58, 0.62, 0]} rotation={[0, 0, 0.2]} material={materials.goldBrocade}>
            <boxGeometry args={[0.3, 0.08, 0.25]} />
          </mesh>
          <mesh position={[0.58, 0.62, 0]} rotation={[0, 0, -0.2]} material={materials.goldBrocade}>
            <boxGeometry args={[0.3, 0.08, 0.25]} />
          </mesh>

          {/* Floating Regal Ceremonial Stole (Dupatta) Levitation */}
          <group ref={accessoriesRef}>
            <mesh position={[0.52, 0.1, 0.42]} rotation={[0.2, 0.3, -0.4]} material={materials.royalStole}>
              <tubeGeometry
                args={[
                  new THREE.CatmullRomCurve3([
                    new THREE.Vector3(0.2, 0.7, 0.1),
                    new THREE.Vector3(0.5, 0.3, 0.3),
                    new THREE.Vector3(0.6, -0.4, 0.35),
                    new THREE.Vector3(0.5, -0.9, 0.2),
                  ]),
                  32,
                  0.07,
                  8,
                  false,
                ]}
              />
            </mesh>
            {/* Stole Gold Tassel */}
            <mesh position={[0.55, -0.98, 0.22]} material={materials.goldAccents}>
              <coneGeometry args={[0.04, 0.12, 16]} />
            </mesh>
          </group>
        </group>
      )}

      {/* 3. SAVILE ROW EXECUTIVE SUIT */}
      {type === "suit" && (
        <group scale={[1.25, 1.25, 1.25]} position={[0, -0.2, 0]}>
          {/* Structured Charcoal Wool Jacket Body */}
          <mesh position={[0, 0, 0]} material={materials.charcoalWool} castShadow>
            <cylinderGeometry args={[0.56, 0.46, 1.35, 32]} />
          </mesh>

          {/* Structured Shoulders */}
          <mesh position={[-0.62, 0.58, 0]} rotation={[0, 0, 0.18]} material={materials.charcoalWool}>
            <boxGeometry args={[0.32, 0.18, 0.4]} />
          </mesh>
          <mesh position={[0.62, 0.58, 0]} rotation={[0, 0, -0.18]} material={materials.charcoalWool}>
            <boxGeometry args={[0.32, 0.18, 0.4]} />
          </mesh>

          {/* Tailored Notch Lapels */}
          <mesh position={[-0.22, 0.3, 0.38]} rotation={[0.08, 0.18, -0.14]} material={materials.charcoalWool}>
            <boxGeometry args={[0.2, 0.88, 0.05]} />
          </mesh>
          <mesh position={[0.22, 0.3, 0.38]} rotation={[0.08, -0.18, 0.14]} material={materials.charcoalWool}>
            <boxGeometry args={[0.2, 0.88, 0.05]} />
          </mesh>

          {/* Crisp Executive Shirt */}
          <mesh position={[0, 0.35, 0.28]} material={materials.whiteShirt}>
            <boxGeometry args={[0.3, 0.65, 0.1]} />
          </mesh>

          {/* Floating Burgundy Silk Necktie */}
          <group position={[0, 0.25, 0.38]}>
            {/* Knot */}
            <mesh position={[0, 0.32, 0.02]} material={materials.burgundyTie}>
              <coneGeometry args={[0.065, 0.12, 16]} />
            </mesh>
            {/* Body of Tie */}
            <mesh position={[0, -0.08, 0]} material={materials.burgundyTie}>
              <boxGeometry args={[0.09, 0.72, 0.03]} />
            </mesh>
            {/* Platinum Tie Bar */}
            <mesh position={[0.02, 0.05, 0.03]} material={materials.platinumAccents}>
              <boxGeometry args={[0.085, 0.018, 0.02]} />
            </mesh>
          </group>

          {/* Horn Buttons */}
          <mesh position={[0, -0.14, 0.5]} rotation={[Math.PI / 2, 0, 0]} material={materials.tuxedoFabric}>
            <cylinderGeometry args={[0.038, 0.038, 0.02, 20]} />
          </mesh>
          <mesh position={[0, -0.32, 0.48]} rotation={[Math.PI / 2, 0, 0]} material={materials.tuxedoFabric}>
            <cylinderGeometry args={[0.038, 0.038, 0.02, 20]} />
          </mesh>

          {/* Floating Silver Pocket Square & Floating Accessories */}
          <group ref={accessoriesRef}>
            <mesh position={[-0.3, 0.36, 0.44]} material={materials.silverCuff}>
              <boxGeometry args={[0.12, 0.04, 0.02]} />
            </mesh>
            <mesh position={[-0.85, 0.15, 0.28]} rotation={[0.4, 0.8, 0]} material={materials.platinumAccents}>
              <torusGeometry args={[0.04, 0.015, 12, 24]} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}
