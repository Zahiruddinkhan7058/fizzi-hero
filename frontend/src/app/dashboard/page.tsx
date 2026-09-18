"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (currentUser.role === "admin") {
      router.replace("/admin");
      return;
    }

    setUser(currentUser as User);
  }, [router]);

  function handleLogout() {
    logoutUser();
    router.push("/login");
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-sm uppercase tracking-[0.3em] text-yellow-400 hover:underline"
            >
              Fizzi
            </Link>

            <h1 className="mt-2 text-4xl font-bold">
              Welcome, {user.name}
            </h1>

            <p className="mt-2 text-white/60">
              {user.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white hover:bg-white/10"
            >
              Back to Home
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Account Details */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-5 text-2xl font-bold">
            Account Details
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-white/50">Name</p>
              <p className="mt-1 font-semibold">{user.name}</p>
            </div>

            <div>
              <p className="text-sm text-white/50">Email</p>
              <p className="mt-1 font-semibold">{user.email}</p>
            </div>

            <div>
              <p className="text-sm text-white/50">Mobile</p>
              <p className="mt-1 font-semibold">{user.mobile}</p>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/products"
            className="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:bg-white/10"
          >
            <h2 className="text-2xl font-bold text-yellow-400">
              🛒 Shop Products
            </h2>

            <p className="mt-2 text-white/60">
              Browse Fizzi drinks and add them to your cart.
            </p>
          </Link>

          <Link
            href="/cart"
            className="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:bg-white/10"
          >
            <h2 className="text-2xl font-bold text-yellow-400">
              🛍️ My Cart
            </h2>

            <p className="mt-2 text-white/60">
              View your cart and continue to checkout.
            </p>
          </Link>

          <Link
            href="/orders"
            className="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:bg-white/10"
          >
            <h2 className="text-2xl font-bold text-yellow-400">
              📦 My Orders
            </h2>

            <p className="mt-2 text-white/60">
              View your previous and current orders.
            </p>
          </Link>

          <Link
            href="/checkout"
            className="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:bg-white/10"
          >
            <h2 className="text-2xl font-bold text-yellow-400">
              💳 Payment
            </h2>

            <p className="mt-2 text-white/60">
              Continue with your order and payment.
            </p>
          </Link>
        </div>

        {/* Tracking */}
        <div className="mt-6">
          <Link
            href="/orders"
            className="block rounded-2xl bg-yellow-400 p-8 text-black transition hover:bg-yellow-300"
          >
            <h2 className="text-2xl font-bold">
              🚚 Track My Order
            </h2>

            <p className="mt-2">
              Check your order status and delivery information.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
