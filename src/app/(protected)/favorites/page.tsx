
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PropertyCard from "@/components/ui/PropertyCard";
import type { Property } from "@/types/property";

interface FavoriteItem {
    id: string;
    createdAt: string;
    property: Property;
}

export default function FavoritesPage() {
    const { accessToken } = useAuth();

    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadFavorites() {
            if (!accessToken) {
                setFavorites([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError("");

            try {
                const response = await fetch("/api/favorites", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    cache: "no-store",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || "Failed to load favorites.",
                    );
                }

                if (!cancelled) {
                    setFavorites(data.favorites ?? []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Something went wrong.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadFavorites();

        return () => {
            cancelled = true;
        };
    }, [accessToken]);

    return (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            {/* Page Header */}
            <section className="mb-9">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
                                Your collection
                            </p>
                        </div>

                        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                            My Favorites
                        </h1>

                        <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">
                            Keep track of the properties you love.
                            All your saved places, together in one spot.
                        </p>
                    </div>

                    {accessToken && !isLoading && !error && (
                        <div className="flex w-fit items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--panel-strong)] text-[var(--brand)]">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="h-5 w-5"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            <div>
                                <p className="font-display text-xl font-semibold tabular-nums">
                                    {favorites.length}
                                </p>
                                <p className="text-xs text-[var(--muted)]">
                                    {favorites.length === 1
                                        ? "Saved property"
                                        : "Saved properties"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Loading State */}
            {isLoading ? (
                <section className="surface rounded-[1.75rem] border border-[var(--line)] px-6 py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="mb-4 h-9 w-9 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--brand)]" />

                        <p className="text-sm font-medium text-[var(--foreground)]">
                            Loading your favorites
                        </p>

                        <p className="mt-1 text-xs text-[var(--muted)]">
                            Getting your saved properties ready...
                        </p>
                    </div>
                </section>
            ) : error ? (
                /* Error State */
                <section
                    role="alert"
                    className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 sm:p-8"
                >
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-5 w-5"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <circle cx="12" cy="12" r="9" />
                                <path
                                    d="M12 8v5m0 3h.01"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>

                        <div>
                            <h2 className="font-semibold text-red-800">
                                Couldn't load your favorites
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-red-700">
                                {error}
                            </p>
                        </div>
                    </div>
                </section>
            ) : !accessToken ? (
                /* Login State */
                <section className="surface overflow-hidden rounded-[1.75rem] border border-[var(--line)] px-6 py-16 text-center sm:py-20">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--panel-strong)] text-[var(--brand)]">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-8 w-8"
                            stroke="currentColor"
                            strokeWidth="1.6"
                        >
                            <path
                                d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <h2 className="mt-5 font-display text-2xl font-semibold">
                        Your favorites are waiting
                    </h2>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                        Log in to access the properties you've saved
                        and keep your shortlist organised.
                    </p>

                    <a
                        href="/login"
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                        Log in to continue

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-4 w-4"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <path
                                d="M5 12h14m-6-6 6 6-6 6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </a>
                </section>
            ) : favorites.length === 0 ? (
                /* Empty State */
                <section className="surface overflow-hidden rounded-[1.75rem] border border-[var(--line)] px-6 py-16 text-center sm:py-20">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--panel-strong)] text-[var(--brand)]">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-8 w-8"
                            stroke="currentColor"
                            strokeWidth="1.6"
                        >
                            <path
                                d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <h2 className="mt-5 font-display text-2xl font-semibold">
                        Nothing saved just yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                        When you find a property you like, tap the
                        heart icon to save it here. Your personal
                        shortlist starts with one.
                    </p>

                    <a
                        href="/properties"
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                        Explore properties

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-4 w-4"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <path
                                d="M5 12h14m-6-6 6 6-6 6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </a>
                </section>
            ) : (
                /* Favorites Grid */
                <section>
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-display text-lg font-semibold">
                                Your saved properties
                            </h2>

                            <p className="mt-1 text-xs text-[var(--muted)]">
                                Properties you've shortlisted for later.
                            </p>
                        </div>

                        <span className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs font-medium text-[var(--muted)]">
                            {favorites.length}{" "}
                            {favorites.length === 1
                                ? "property"
                                : "properties"}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {favorites.map((favorite) => (
                            <PropertyCard
                                key={favorite.id}
                                property={favorite.property}
                            />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
