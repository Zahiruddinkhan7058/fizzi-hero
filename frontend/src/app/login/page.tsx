"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [loginMode, setLoginMode] = useState<"user" | "admin">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginMode === "admin") {
        if (data.user?.role !== "admin") {
          setError("Access denied. Only authorized administrators can log in here.");
          return;
        }

        if (data.token) {
          saveAuth(data.token, data.user);
        }

        router.push("/admin");
        router.refresh();
      } else {
        // Normal user login
        if (data.user?.role === "admin") {
          setError("This is an administrator account. Please select 'LOGIN AS ADMIN' above.");
          return;
        }

        if (data.token) {
          saveAuth(data.token, data.user);
        }

        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-32 text-white">
      <div className="mx-auto w-full max-w-md">

        {/* Dual Mode Switcher */}
        <div className="mb-8 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 shadow-xl">
          <button
            type="button"
            id="login-user-tab"
            onClick={() => {
              setLoginMode("user");
              setError("");
            }}
            className={`rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all sm:text-sm ${
              loginMode === "user"
                ? "bg-yellow-400 text-black shadow-lg"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            Login as User
          </button>
          <button
            type="button"
            id="login-admin-tab"
            onClick={() => {
              setLoginMode("admin");
              setError("");
            }}
            className={`rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all sm:text-sm ${
              loginMode === "admin"
                ? "bg-yellow-400 text-black shadow-lg"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            Login as Admin
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-yellow-500">
            {loginMode === "admin" ? "🛡️ Admin Portal" : "Fizzi Customer Portal"}
          </p>

          <h1 className="text-4xl font-bold">
            {loginMode === "admin" ? "Admin Login" : "Welcome Back"}
          </h1>

          <p className="mt-3 text-sm text-white/60">
            {loginMode === "admin"
              ? "Sign in with authorized administrator credentials"
              : "Login to your Fizzi shopping account"}
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
        >
          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Email Address
            </label>

            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={loginMode === "admin" ? "admin@fizzi.com" : "Enter your email"}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-yellow-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Password
            </label>

            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-yellow-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-yellow-400 py-3 font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg"
          >
            {loading
              ? "Authenticating..."
              : loginMode === "admin"
              ? "Login as Admin"
              : "Login as User"}
          </button>

          {/* Register Option - ONLY visible in User Mode */}
          {loginMode === "user" ? (
            <p className="text-center text-sm text-white/60">
              New to Fizzi?{" "}
              <Link
                href="/register"
                className="text-yellow-400 hover:underline"
              >
                Create account
              </Link>
            </p>
          ) : (
            <p className="text-center text-xs text-white/40">
              Restricted portal • Authorized administrator accounts only
            </p>
          )}
        </form>
      </div>
    </main>
  );
}