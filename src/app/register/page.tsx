
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Input, Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);

            await register(name, email, password, phone);

            router.push("/login");
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Registration failed"
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
                                Make yourself at home
                            </p>

                            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
                                A better property journey begins with you.
                            </h1>

                            <p className="mt-6 text-base leading-8 text-white/75">
                                Create your account to explore listings,
                                send enquiries, and stay connected throughout
                                your property search.
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="space-y-4">
                            {[
                                "Explore properties in one place",
                                "Keep track of your enquiries",
                                "Connect with property owners",
                            ].map((item, index) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3 text-sm text-white/85"
                                >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs ring-1 ring-white/15">
                                        {index + 1}
                                    </span>
                                    {item}
                                </div>
                            ))}
                        </div>

                        <p className="mt-8 text-xs text-white/50">
                            Your next chapter starts here.
                        </p>
                    </div>
                </aside>

                {/* Registration form */}
                <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
                    <div className="w-full max-w-md">

                        <Link
                            href="/"
                            className="mb-8 inline-flex items-center gap-3 lg:hidden"
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
                                Get started
                            </p>

                            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Create your account
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                                A few details are all you need to get started
                                with PropertyHub.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-7 space-y-4"
                        >
                            <Input
                                label="Full name"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                                className="rounded-xl border-[var(--line)] bg-[var(--background)] px-4 py-3.5 focus:ring-[var(--brand)]"
                                required
                            />

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
                                    htmlFor="register-password"
                                    className="block text-sm font-medium"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <Input
                                        id="register-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
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

                            <Input
                                label="Phone number"
                                type="tel"
                                placeholder="Enter your phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                autoComplete="tel"
                                className="rounded-xl border-[var(--line)] bg-[var(--background)] px-4 py-3.5 focus:ring-[var(--brand)]"
                            />

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
                                Create Account
                            </Button>
                        </form>

                        <p className="mt-7 text-center text-sm text-[var(--muted)]">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-[var(--brand-deep)] underline-offset-4 hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>

                        <p className="mt-6 text-center text-xs leading-5 text-[var(--muted)]">
                            Your account lets you keep your property activity
                            organised in one place.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
