"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, saveAuth } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser({
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      saveAuth(data.token, data.user);

      router.push("/");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] px-5 py-12 text-white md:px-6 md:py-20">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md items-center justify-center">
        <div className="w-full">

          {/* Header */}
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="inline-block text-xs font-bold uppercase tracking-[0.35em] text-yellow-400"
            >
              Fizzi
            </Link>

            <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Create Account
            </h1>

            <p className="mt-3 text-sm text-white/50">
              Create your account and start shopping.
            </p>
          </div>

          {/* Card */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl md:p-8"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white placeholder:text-white/30 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
              />
            </div>

            {/* Mobile */}
            <div className="mt-5">
              <label
                htmlFor="mobile"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                Mobile Number
              </label>

              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter your mobile number"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white placeholder:text-white/30 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
              />
            </div>

            {/* Email */}
            <div className="mt-5">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white placeholder:text-white/30 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
              />
            </div>

            {/* Password */}
            <div className="mt-5">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white placeholder:text-white/30 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
              />
            </div>

            {/* Confirm Password */}
            <div className="mt-5">
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white placeholder:text-white/30 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-sm font-medium text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-yellow-400 px-5 py-3.5 font-black text-black transition hover:bg-yellow-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>

            {/* Login */}
            <p className="mt-6 text-center text-sm text-white/50">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-yellow-400 hover:text-yellow-300 hover:underline"
              >
                Login
              </Link>
            </p>
          </form>

          {/* Back */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-white/40 transition hover:text-white"
            >
              ← Back to Fizzi
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}