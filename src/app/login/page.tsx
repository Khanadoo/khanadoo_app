
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Input, Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] shadow-xl sm:min-h-[calc(100vh-4rem)] lg:grid-cols-2">

        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden bg-[var(--brand-deep)] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-20 h-80 w-80 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-8 h-56 w-56 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/[0.04]"
          />

          <div className="relative">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold ring-1 ring-white/15">
                P
              </span>
              <span className="text-xl font-semibold tracking-tight">
                PropertyHub
              </span>
            </Link>

            <div className="mt-24 max-w-md xl:mt-32">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
                Your next chapter starts here
              </p>

              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
                Find a place that feels like yours.
              </h1>

              <p className="mt-6 text-base leading-8 text-white/75">
                Discover properties, connect with owners,
                and keep your property journey organised
                in one place.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="flex flex-wrap gap-2">
              {["Explore properties", "Connect with owners", "Manage enquiries"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-white/85"
                  >
                    {item}
                  </span>
                )
              )}
            </div>

            <p className="mt-8 text-xs text-white/50">
              A simpler way to find your place.
            </p>
          </div>
        </aside>

        {/* Login form */}
        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
          <div className="w-full max-w-md">

            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-3 lg:hidden"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-deep)] text-lg font-bold text-white">
                P
              </span>
              <span className="text-lg font-semibold tracking-tight">
                PropertyHub
              </span>
            </Link>

            <div>
              <p className="text-sm font-semibold text-[var(--brand-deep)]">
                Welcome back
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Enter your details below to continue
                where you left off.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="rounded-xl border-[var(--line)] bg-[var(--background)] px-4 py-3.5 focus:ring-[var(--brand)]"
                required
              />


              <div className="space-y-1">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium"
                >
                  Password
                </label>

                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="rounded-xl border-[var(--line)] bg-[var(--background)] px-4 py-3.5 pr-12 focus:ring-[var(--brand)]"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-[var(--muted)] transition hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--brand-deep)]"
                  >
                    {showPassword ? (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.3 9.5 7-.4 1.1-1.2 2.3-2.3 3.3M6.2 6.2C3.9 7.6 2.8 9.5 2.5 12c.8 2.3 4.5 7 9.5 7 1.3 0 2.5-.3 3.6-.8"
                        />
                      </svg>
                    ) : (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
                        />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>


              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                size="lg"
                className="w-full rounded-xl py-3.5 text-base shadow-sm"
              >
                Sign In
              </Button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[var(--line)]" />
              <span className="text-xs text-[var(--muted)]">
                NEW TO PROPERTYHUB?
              </span>
              <div className="h-px flex-1 bg-[var(--line)]" />
            </div>

            <p className="text-center text-sm text-[var(--muted)]">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[var(--brand-deep)] underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>

            <p className="mt-10 text-center text-xs leading-5 text-[var(--muted)]">
              By signing in, you can access your PropertyHub
              account and manage your property activity.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
