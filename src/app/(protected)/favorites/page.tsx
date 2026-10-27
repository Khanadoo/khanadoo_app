
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
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    My Favorites
                </h1>

                <p className="mt-2 text-gray-600">
                    All the properties you have saved in one place.
                </p>
            </div>

            {isLoading ? (
                <div className="py-16 text-center text-gray-500">
                    Loading your favorites...
                </div>
            ) : error ? (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
                >
                    {error}
                </div>
            ) : !accessToken ? (
                <div className="rounded-xl border bg-white px-6 py-12 text-center">
                    <h2 className="text-xl font-semibold">
                        Please log in
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Log in to view your saved properties.
                    </p>
                </div>
            ) : favorites.length === 0 ? (
                <div className="rounded-xl border bg-white px-6 py-12 text-center">
                    <div className="mb-3 text-4xl">♡</div>

                    <h2 className="text-xl font-semibold">
                        No favorites yet
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Browse properties and tap the heart to save
                        the ones you like.
                    </p>
                </div>
            ) : (
                <>
                    <p className="mb-5 text-sm text-gray-500">
                        {favorites.length}{" "}
                        {favorites.length === 1
                            ? "saved property"
                            : "saved properties"}
                    </p>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {favorites.map((favorite) => (
                            <PropertyCard
                                key={favorite.id}
                                property={favorite.property}
                            />
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}
