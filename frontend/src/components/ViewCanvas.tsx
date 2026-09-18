"use client";

import { View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { usePathname } from "next/navigation";

export default function ViewCanvas() {
  const pathname = usePathname();
  const is3DPage = pathname === "/" || pathname?.startsWith("/slice-simulator");

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 30,
        display: is3DPage ? "block" : "none",
      }}
      aria-hidden={!is3DPage}
    >
      <Canvas
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
        }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
        camera={{
          fov: 30,
        }}
      >
        <Suspense fallback={null}>
          <View.Port />
        </Suspense>

        <ambientLight intensity={2} />
        <spotLight intensity={3} position={[1, 1, 1]} />
      </Canvas>
    </div>
  );
}
