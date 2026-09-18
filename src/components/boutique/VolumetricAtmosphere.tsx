"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface VolumetricAtmosphereProps {
  fogEnabled?: boolean;
  lightingTheme?: "studio" | "gold" | "midnight";
}

export function VolumetricAtmosphere({
  fogEnabled = true,
  lightingTheme = "gold",
}: VolumetricAtmosphereProps) {
  const fogMeshRef = useRef<THREE.InstancedMesh>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);

  // Fog particle count & positions
  const FOG_COUNT = 120;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particlesData = useMemo(() => {
    const data = [];
    for (let i = 0; i < FOG_COUNT; i++) {
      data.push({
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 6,
        z: (Math.random() - 0.5) * 6,
        speedY: 0.002 + Math.random() * 0.004,
        speedX: (Math.random() - 0.5) * 0.003,
        scale: 0.2 + Math.random() * 0.45,
      });
    }
    return data;
  }, []);

  // Theme colors
  const theme = useMemo(() => {
    switch (lightingTheme) {
      case "gold":
        return {
          spotColor: "#ffecd2",
          rimColor: "#fcb045",
          ambientColor: "#2a1e12",
          ambientIntensity: 0.7,
        };
      case "midnight":
        return {
          spotColor: "#e0eafc",
          rimColor: "#4facfe",
          ambientColor: "#0f172a",
          ambientIntensity: 0.5,
        };
      case "studio":
      default:
        return {
          spotColor: "#ffffff",
          rimColor: "#e2e8f0",
          ambientColor: "#1e293b",
          ambientIntensity: 0.8,
        };
    }
  }, [lightingTheme]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Dynamic Ray-Traced Light Modulation
    if (spotLightRef.current) {
      spotLightRef.current.position.x = Math.sin(time * 0.6) * 1.5 + 2;
      spotLightRef.current.position.y = Math.cos(time * 0.8) * 0.8 + 4;
    }

    if (rimLightRef.current) {
      rimLightRef.current.position.x = -Math.cos(time * 0.5) * 2 - 2;
      rimLightRef.current.position.z = -Math.sin(time * 0.5) * 2 - 2;
    }

    // Volumetric Fog Animation
    if (fogMeshRef.current && fogEnabled) {
      particlesData.forEach((p, i) => {
        p.y += p.speedY;
        p.x += Math.sin(time + i) * p.speedX;

        // Reset if drifted beyond view
        if (p.y > 3) p.y = -3;
        if (p.x > 4) p.x = -4;
        if (p.x < -4) p.x = 4;

        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.rotation.z = time * 0.1 + i;
        dummy.updateMatrix();

        fogMeshRef.current?.setMatrixAt(i, dummy.matrix);
      });
      fogMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Studio Ambient Grounding Light */}
      <ambientLight color={theme.ambientColor} intensity={theme.ambientIntensity} />

      {/* Main Ray-Traced Key Spotlight with Soft Shadows */}
      <spotLight
        ref={spotLightRef}
        position={[3, 5, 4]}
        angle={0.45}
        penumbra={0.8}
        intensity={3.2}
        color={theme.spotColor}
        castShadow
        shadow-bias={-0.0001}
      />

      {/* Rim / Backlight for Fresnel Fabric Glow */}
      <pointLight
        ref={rimLightRef}
        position={[-3, 2, -3]}
        intensity={2.4}
        color={theme.rimColor}
      />

      {/* Under-Glow Fill Light for floating levitation shadow contrast */}
      <pointLight position={[0, -2.5, 1]} intensity={0.9} color="#d4af37" />

      {/* Soft Volumetric Fog Particles */}
      {fogEnabled && (
        <instancedMesh
          ref={fogMeshRef}
          args={[undefined, undefined, FOG_COUNT]}
          position={[0, 0, 0]}
        >
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshBasicMaterial
            color={theme.rimColor}
            transparent
            opacity={0.06}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </instancedMesh>
      )}

      {/* Reflective Luxury Boutique Floor with Soft Gradient Shadow */}
      <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial
          color="#06080e"
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>
    </>
  );
}
