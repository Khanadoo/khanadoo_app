"use client";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { useAuth } from "@/context/AuthContext";

interface FavoriteButtonProps {
    propertyId: string;
}

interface FavoriteItem {
    id: string;
    property: {
        id: string;
    };
}

export default function FavoriteButton({
    propertyId,
}: FavoriteButtonProps) {
    const { accessToken } = useAuth();

    const [favoriteId, setFavoriteId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function checkFavorite() {
            if (!accessToken) {
                setFavoriteId(null);
                setIsChecking(false);
                return;
            }

            setIsChecking(true);

            try {
                const response = await fetch("/api/favorites", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error("Could not load favorites.");
                }

                const data = await response.json();
                const favorites: FavoriteItem[] = data.favorites ?? [];

                const existing = favorites.find(
                    (favorite) => favorite.property.id === propertyId,
                );

                if (!cancelled) {
                    setFavoriteId(existing?.id ?? null);
                    setError("");
                }
            } catch {
                if (!cancelled) {
                    setError("Couldn't check favorite status.");
                }
            } finally {
                if (!cancelled) {
                    setIsChecking(false);
                }
            }
        }

        void checkFavorite();

        return () => {
            cancelled = true;
        };
    }, [accessToken, propertyId]);

    async function toggleFavorite(
        event: MouseEvent<HTMLButtonElement>,
    ) {
        event.preventDefault();
        event.stopPropagation();

        if (!accessToken) {
            setError("Please log in to save favorites.");
            return;
        }

        if (isLoading || isChecking) return;

        setIsLoading(true);
        setError("");

        try {
            const isFavorite = favoriteId !== null;

            const response = await fetch(
                isFavorite
                    ? `/api/favorites/${favoriteId}`
                    : "/api/favorites",
                {
                    method: isFavorite ? "DELETE" : "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        ...(isFavorite
                            ? {}
                            : { "Content-Type": "application/json" }),
                    },
                    ...(!isFavorite && {
                        body: JSON.stringify({ propertyId }),
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to update favorites.",
                );
            }

            if (isFavorite) {
                setFavoriteId(null);
            } else {
                // Reload the list to obtain the favorite record ID
                // returned by the GET endpoint.
                const favoritesResponse = await fetch("/api/favorites", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    cache: "no-store",
                });

                if (!favoritesResponse.ok) {
                    throw new Error(
                        "Favorite saved, but its status could not be refreshed.",
                    );
                }

                const favoritesData = await favoritesResponse.json();
                const favorites: FavoriteItem[] =
                    favoritesData.favorites ?? [];

                const existing = favorites.find(
                    (favorite) => favorite.property.id === propertyId,
                );

                setFavoriteId(existing?.id ?? null);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    const isFavorite = favoriteId !== null;

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                type="button"
                onClick={toggleFavorite}
                disabled={isLoading || isChecking}
                aria-label={
                    isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                }
                aria-pressed={isFavorite}
                title={
                    isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                }
                className="rounded-full bg-white p-2 text-xl shadow transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isLoading || isChecking
                    ? "…"
                    : isFavorite
                        ? "♥"
                        : "♡"}
            </button>

            {error && (
                <p
                    role="status"
                    className="max-w-48 rounded bg-white px-2 py-1 text-xs text-red-600 shadow"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
