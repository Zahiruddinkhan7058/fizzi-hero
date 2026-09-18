"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FizziLogo } from "@/components/FizziLogo";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import AntiGravityBoutiqueModal from "@/components/boutique/AntiGravityBoutiqueModal";

type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isBoutiqueOpen, setIsBoutiqueOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = getCurrentUser();
    if (u) setUser(u);
  }, []);

  function handleLogout() {
    logoutUser();
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <>
      <header className="-mb-28 relative z-20 flex items-center justify-between px-6 py-4 md:px-12">
        {/* Left Navigation */}
        <nav className="flex items-center gap-3">
          <Link
            href="/products"
            className="rounded-full bg-orange-600 px-5 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:bg-orange-700 hover:scale-105 active:scale-95"
          >
            SHOP NOW
          </Link>
          <button
            type="button"
            onClick={() => setIsBoutiqueOpen(true)}
            className="group flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-300 shadow-md backdrop-blur-md transition-all duration-300 hover:border-amber-300 hover:bg-black/60 hover:scale-105 active:scale-95"
            title="Explore Anti-Gravity Luxury Menswear Atelier"
          >
            <span className="text-amber-400 text-sm animate-pulse">✦</span>
            <span>Boutique 3D</span>
          </button>
        </nav>

      {/* Centered Logo */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2">
        <Link href="/" aria-label="Fizzi Home">
          <FizziLogo className="h-16 cursor-pointer text-sky-800 md:h-20" />
        </Link>
      </div>

      {/* Right Navigation */}
      <nav className="flex items-center gap-3">
        {mounted && user ? (
          <>
            <Link
              href="/dashboard"
              className="rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-yellow-300"
            >
              {user.name ? `Hi, ${user.name.split(" ")[0]}` : "Dashboard"}
            </Link>
            <Link
              href="/orders"
              className="hidden rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/20 sm:inline-block"
            >
              Orders
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full bg-red-500/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-red-500"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-yellow-300"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>

    <AntiGravityBoutiqueModal
      isOpen={isBoutiqueOpen}
      onClose={() => setIsBoutiqueOpen(false)}
    />
  </>
);
}
