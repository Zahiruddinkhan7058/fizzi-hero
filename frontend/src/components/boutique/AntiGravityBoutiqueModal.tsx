"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Float } from "@react-three/drei";
import { FloatingGarment, GarmentType } from "./GarmentModels";
import { VolumetricAtmosphere } from "./VolumetricAtmosphere";

interface AntiGravityBoutiqueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GARMENT_DATA: Record<
  GarmentType,
  {
    title: string;
    subtitle: string;
    description: string;
    fabric: string;
    craftsmanship: string;
    elevation: string;
    accentColor: string;
  }
> = {
  tuxedo: {
    title: "Midnight Peak-Lapel Tuxedo",
    subtitle: "Atelier Haute Couture No. 01",
    description:
      "Hand-canvassed midnight silk velvet paired with jet-black satin peak lapels. Engineered with zero-gravity micro-levitation balance and hand-cast 24k gilded buttons.",
    fabric: "Super 180s Wool & Mulberry Silk Velvet",
    craftsmanship: "Savile Row Bespoke • 72 Hand-Crafted Hours",
    elevation: "Zero-G Harmonic Drift (+12cm)",
    accentColor: "#f59e0b",
  },
  sherwani: {
    title: "Imperial Royal Sherwani",
    subtitle: "Regal Jaipur Heritage Edition",
    description:
      "Exquisite ivory silk brocade intricately embroidered with authentic gold zardozi thread. Features a structured Mandarin bandhgala collar, ruby kalgi jewel brooch, and levitating ceremonial stole.",
    fabric: "Pure Banarasi Katan Silk & Real Gold Thread",
    craftsmanship: "Royal Jaipur Atelier • 140 Hours Zardozi Handwork",
    elevation: "Anti-Gravity Orbital Levitation (+18cm)",
    accentColor: "#ef4444",
  },
  suit: {
    title: "Savile Row Executive Pinstripe",
    subtitle: "Milanese Master Cut No. 07",
    description:
      "Sculpted Italian charcoal wool pinstripe with razor-sharp AMF pick stitching, floating burgundy silk necktie, and solid platinum tie bar accents.",
    fabric: "Italian Loro Piana 100% Tasmanian Wool",
    craftsmanship: "Milan Tailoring House • Full Canvas Construction",
    elevation: "Lunar Atmospheric Float (+9cm)",
    accentColor: "#38bdf8",
  },
};

export default function AntiGravityBoutiqueModal({
  isOpen,
  onClose,
}: AntiGravityBoutiqueModalProps) {
  const [activeGarment, setActiveGarment] = useState<GarmentType>("tuxedo");
  const [gravityMode, setGravityMode] = useState<"zero" | "lunar" | "subtle">("zero");
  const [lightingTheme, setLightingTheme] = useState<"gold" | "midnight" | "studio">("gold");
  const [fogEnabled, setFogEnabled] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Track viewer presence/mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { clientWidth, clientHeight } = currentTarget;
    const x = (clientX / clientWidth) * 2 - 1;
    const y = -(clientY / clientHeight) * 2 + 1;
    setMousePos({ x, y });
  };

  if (!isOpen) return null;

  const currentInfo = GARMENT_DATA[activeGarment];
  const levitationMultiplier =
    gravityMode === "zero" ? 1.4 : gravityMode === "lunar" ? 0.9 : 0.5;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-2xl transition-all duration-500"
      onMouseMove={handleMouseMove}
    >
      {/* 3D WebGL Canvas Chamber */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          camera={{ position: [0, 0.4, 4.2], fov: 38 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <VolumetricAtmosphere
              fogEnabled={fogEnabled}
              lightingTheme={lightingTheme}
            />

            <Float
              speed={1.5}
              rotationIntensity={0.2}
              floatIntensity={0.4 * levitationMultiplier}
            >
              <FloatingGarment
                type={activeGarment}
                levitationIntensity={levitationMultiplier}
                mousePos={mousePos}
              />
            </Float>

            {/* Soft ray-traced contact shadow below the floating garment */}
            <ContactShadows
              position={[0, -2.15, 0]}
              opacity={0.65}
              scale={6}
              blur={2.4}
              far={4.5}
              color="#000000"
            />

            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={2.5}
              maxDistance={6.0}
              maxPolarAngle={Math.PI / 2 + 0.1}
              minPolarAngle={Math.PI / 4}
              autoRotate={autoRotate}
              autoRotateSpeed={0.8}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* TOP BAR: Luxury Header & Close Button */}
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-400">
            ✦
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400/90">
              ANTI-GRAVITY ATELIER
            </p>
            <h2 className="text-sm font-black uppercase tracking-wider text-white md:text-base">
              Haute Couture 3D Exhibition
            </h2>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Anti-Gravity Boutique"
          className="group flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-200 hover:border-amber-400 hover:bg-amber-400 hover:text-black hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] active:scale-95"
        >
          <span>CLOSE</span>
          <span className="text-base leading-none transition-transform group-hover:rotate-90">
            ✕
          </span>
        </button>
      </header>

      {/* CENTER-TOP: Garment Switcher Tabs */}
      <div className="absolute top-20 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 p-1.5 backdrop-blur-xl shadow-2xl md:top-6">
        {(["tuxedo", "sherwani", "suit"] as GarmentType[]).map((type) => {
          const isActive = activeGarment === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setActiveGarment(type)}
              className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {type === "tuxedo"
                ? "Tuxedo"
                : type === "sherwani"
                ? "Sherwani"
                : "Bespoke Suit"}
            </button>
          );
        })}
      </div>

      {/* BOTTOM-LEFT: Garment Provenance & Craftsmanship HUD */}
      <div className="pointer-events-none absolute bottom-8 left-6 z-20 max-w-sm rounded-3xl border border-white/15 bg-gradient-to-b from-black/80 to-black/95 p-6 text-white backdrop-blur-2xl shadow-2xl md:bottom-12 md:left-12">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full animate-ping bg-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">
              {currentInfo.subtitle}
            </span>
          </div>

          <h3 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
            {currentInfo.title}
          </h3>

          <p className="mt-3 text-xs leading-relaxed text-white/70 md:text-sm">
            {currentInfo.description}
          </p>

          <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs">
            <div className="flex justify-between">
              <span className="text-white/40 uppercase font-semibold tracking-wider">
                Fabric Weave:
              </span>
              <span className="font-bold text-white/90 text-right">
                {currentInfo.fabric}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40 uppercase font-semibold tracking-wider">
                Craftsmanship:
              </span>
              <span className="font-bold text-amber-300/90 text-right">
                {currentInfo.craftsmanship}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40 uppercase font-semibold tracking-wider">
                Levitation State:
              </span>
              <span className="font-bold text-emerald-400 text-right">
                {currentInfo.elevation}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM-RIGHT: Physics & Atmosphere Controls Panel */}
      <aside className="absolute bottom-8 right-6 z-20 flex flex-col gap-3 rounded-3xl border border-white/15 bg-black/75 p-5 text-white backdrop-blur-2xl shadow-2xl md:bottom-12 md:right-12">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/90">
          CHAMBER CONTROLS
        </p>

        {/* Gravity Multiplier */}
        <div>
          <span className="text-[11px] font-semibold text-white/60">
            Anti-Gravity Physics
          </span>
          <div className="mt-1 flex gap-1 rounded-xl bg-white/5 p-1">
            {(["zero", "lunar", "subtle"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setGravityMode(mode)}
                className={`flex-1 rounded-lg py-1 text-[10px] font-bold uppercase transition ${
                  gravityMode === mode
                    ? "bg-amber-400 text-black shadow"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {mode === "zero" ? "Zero-G" : mode === "lunar" ? "Lunar" : "Subtle"}
              </button>
            ))}
          </div>
        </div>

        {/* Ray-Traced Lighting */}
        <div>
          <span className="text-[11px] font-semibold text-white/60">
            Ray-Traced Mood
          </span>
          <div className="mt-1 flex gap-1 rounded-xl bg-white/5 p-1">
            {(["gold", "midnight", "studio"] as const).map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => setLightingTheme(theme)}
                className={`flex-1 rounded-lg py-1 text-[10px] font-bold uppercase transition ${
                  lightingTheme === theme
                    ? "bg-amber-400 text-black shadow"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-2 text-xs">
          <button
            type="button"
            onClick={() => setFogEnabled(!fogEnabled)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase transition ${
              fogEnabled
                ? "bg-white/20 text-white"
                : "text-white/40 hover:text-white"
            }`}
          >
            <span>☁ Volumetric Fog:</span>
            <span className={fogEnabled ? "text-emerald-400" : "text-white/40"}>
              {fogEnabled ? "ON" : "OFF"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase transition ${
              autoRotate
                ? "bg-white/20 text-white"
                : "text-white/40 hover:text-white"
            }`}
          >
            <span>🔄 360° Orbit:</span>
            <span className={autoRotate ? "text-emerald-400" : "text-white/40"}>
              {autoRotate ? "ON" : "OFF"}
            </span>
          </button>
        </div>

        {/* Interaction Hint */}
        <p className="mt-1 text-center text-[10px] text-white/40">
          Drag to inspect in 360° • Scroll to zoom
        </p>
      </aside>
    </div>
  );
}
