
"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

function DetailCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: string;
}) {
    return (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--background)]/50 p-5 transition duration-200 hover:border-[var(--brand)]/40 hover:shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--panel-strong)] text-lg text-[var(--brand-deep)]">
                    {icon}
                </div>

                <p className="text-sm font-medium text-[var(--muted)]">
                    {label}
                </p>
            </div>

            <p className="mt-4 break-words text-base font-semibold text-[var(--foreground)]">
                {value}
            </p>
        </div>
    );
}

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();

    if (loading) {
        return (
            <div className="surface rounded-[2rem] p-8">
                <p className="text-sm text-[var(--muted)]">
                    Loading your profile...
                </p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="surface rounded-[2rem] p-8">
                <h1 className="text-xl font-semibold">
                    Profile unavailable
                </h1>

                <p className="mt-2 text-sm text-[var(--muted)]">
                    Please sign in to view your profile.
                </p>

                <Link
                    href="/login"
                    className="mt-5 inline-flex rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    Go to Login
                </Link>
            </div>
        );
    }

    const roleLabel =
        user.role.charAt(0) +
        user.role.slice(1).toLowerCase();

    const initial =
        user.name.trim().charAt(0).toUpperCase() || "U";

    return (
        <div className="mx-auto w-full max-w-5xl space-y-7">
            {/* Page heading */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-deep)]">
                    Account Settings
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
                    My Profile
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                    Manage your account information and keep your
                    PropertyHub profile details close at hand.
                </p>
            </div>

            {/* Profile overview */}
            <section className="surface overflow-hidden rounded-[2rem]">
                <div className="h-2 bg-[var(--brand)]" />

                <div className="p-6 sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] bg-[var(--panel-strong)] text-3xl font-semibold text-[var(--brand-deep)] ring-1 ring-[var(--line)]">
                            {initial}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm text-[var(--muted)]">
                                Welcome to your account
                            </p>

                            <h2 className="mt-1 break-words text-2xl font-semibold tracking-tight">
                                {user.name}
                            </h2>

                            <p className="mt-2 break-all text-sm text-[var(--muted)]">
                                {user.email}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--panel-strong)] px-3 py-1.5 text-xs font-semibold">
                                    <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
                                    {roleLabel} Account
                                </span>

                                <span className="inline-flex items-center rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--muted)]">
                                    PropertyHub Member
                                </span>
                            </div>
                        </div>

                        <Link
                            href="/dashboard"
                            className="inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold transition hover:bg-[var(--panel-strong)]"
                        >
                            Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* Personal information */}
            <section className="surface rounded-[2rem] p-6 sm:p-8">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                        Personal Information
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        The information associated with your account.
                    </p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <DetailCard
                        label="Full Name"
                        value={user.name}
                        icon="♙"
                    />

                    <DetailCard
                        label="Email Address"
                        value={user.email}
                        icon="✉"
                    />

                    <DetailCard
                        label="Phone Number"
                        value={user.phone || "Not provided"}
                        icon="☎"
                    />

                    <DetailCard
                        label="Account Role"
                        value={roleLabel}
                        icon="⌂"
                    />
                </div>
            </section>

            {/* Account actions */}
            <section className="surface rounded-[2rem] p-6 sm:p-8">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                        Account Actions
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        Jump to the areas you use most in PropertyHub.
                    </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Link
                        href="/properties"
                        className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] p-4 transition hover:border-[var(--brand)]/40 hover:bg-[var(--panel-strong)]"
                    >
                        <div>
                            <p className="font-semibold">
                                Browse Properties
                            </p>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                                Explore available listings.
                            </p>
                        </div>
                        <span className="text-lg transition-transform group-hover:translate-x-1">
                            →
                        </span>
                    </Link>

                    <Link
                        href={
                            user.role === "OWNER"
                                ? "/owner/properties"
                                : "/dashboard/enquiries"
                        }
                        className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] p-4 transition hover:border-[var(--brand)]/40 hover:bg-[var(--panel-strong)]"
                    >
                        <div>
                            <p className="font-semibold">
                                {user.role === "OWNER"
                                    ? "My Properties"
                                    : "My Enquiries"}
                            </p>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                                {user.role === "OWNER"
                                    ? "Manage your property listings."
                                    : "Review your property enquiries."}
                            </p>
                        </div>
                        <span className="text-lg transition-transform group-hover:translate-x-1">
                            →
                        </span>
                    </Link>
                </div>

                <div className="mt-6 border-t border-[var(--line)] pt-6">
                    <button
                        type="button"
                        onClick={() => void logout()}
                        className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                        Sign Out
                    </button>
                </div>
            </section>
        </div>
    );
}
