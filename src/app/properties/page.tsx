"use client";

import { useEffect, useState } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import PropertyCard from "@/components/ui/PropertyCard";

import { Property } from "@/types/property";
import { propertyClient } from "@/services/property.client";

export default function PropertiesPage() {
    const [properties, setProperties] =
        useState<Property[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // Filter state
    const [city, setCity] =
        useState("");

    const [locality, setLocality] =
        useState("");

    const [type, setType] =
        useState("");

    const [purpose, setPurpose] =
        useState("");

    const [minPrice, setMinPrice] =
        useState("");

    const [maxPrice, setMaxPrice] =
        useState("");

    const [sort, setSort] =
        useState("newest");

    const loadProperties = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await propertyClient.getAll(1, 10, {
                    city: city.trim() || undefined,
                    locality: locality.trim() || undefined,
                    type: type || undefined,
                    purpose: purpose || undefined,
                    minPrice:
                        minPrice !== ""
                            ? Number(minPrice)
                            : undefined,
                    maxPrice:
                        maxPrice !== ""
                            ? Number(maxPrice)
                            : undefined,
                    sort,
                });

            setProperties(response.data);
        } catch (err: any) {
            setError(
                err.message ||
                "Failed to load properties"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProperties();
    }, []);

    const handleSearch = () => {
        loadProperties();
    };

    const handleClear = () => {
        setCity("");
        setLocality("");
        setType("");
        setPurpose("");
        setMinPrice("");
        setMaxPrice("");
        setSort("newest");

        // Load unfiltered properties
        setTimeout(() => {
            propertyClient
                .getAll(1, 10, {
                    sort: "newest",
                })
                .then((response) => {
                    setProperties(response.data);
                })
                .catch((err: any) => {
                    setError(
                        err.message ||
                        "Failed to load properties"
                    );
                });
        }, 0);
    };

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-10">

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">
                        Available Properties
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Browse verified properties
                        available for rent and sale.
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                        {/* City */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                City
                            </label>

                            <input
                                type="text"
                                value={city}
                                onChange={(e) =>
                                    setCity(e.target.value)
                                }
                                placeholder="e.g. Silchar"
                                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
                            />
                        </div>

                        {/* Locality */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Locality
                            </label>

                            <input
                                type="text"
                                value={locality}
                                onChange={(e) =>
                                    setLocality(e.target.value)
                                }
                                placeholder="e.g. Tarapur"
                                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
                            />
                        </div>

                        {/* Property Type */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Property Type
                            </label>

                            <select
                                value={type}
                                onChange={(e) =>
                                    setType(e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2"
                            >
                                <option value="">
                                    All Types
                                </option>

                                <option value="ROOM">
                                    Room
                                </option>

                                <option value="PG">
                                    PG
                                </option>

                                <option value="HOUSE">
                                    House
                                </option>

                                <option value="APARTMENT">
                                    Apartment
                                </option>
                            </select>
                        </div>

                        {/* Purpose */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Purpose
                            </label>

                            <select
                                value={purpose}
                                onChange={(e) =>
                                    setPurpose(e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2"
                            >
                                <option value="">
                                    Rent or Sale
                                </option>

                                <option value="RENT">
                                    Rent
                                </option>

                                <option value="SALE">
                                    Sale
                                </option>
                            </select>
                        </div>

                        {/* Minimum Price */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Min Price
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={minPrice}
                                onChange={(e) =>
                                    setMinPrice(e.target.value)
                                }
                                placeholder="₹ Minimum"
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>

                        {/* Maximum Price */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Max Price
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={maxPrice}
                                onChange={(e) =>
                                    setMaxPrice(e.target.value)
                                }
                                placeholder="₹ Maximum"
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Sort By
                            </label>

                            <select
                                value={sort}
                                onChange={(e) =>
                                    setSort(e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2"
                            >
                                <option value="newest">
                                    Newest
                                </option>

                                <option value="price_low">
                                    Price: Low to High
                                </option>

                                <option value="price_high">
                                    Price: High to Low
                                </option>
                            </select>
                        </div>

                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex gap-3">

                        <button
                            type="button"
                            onClick={handleSearch}
                            className="rounded-lg bg-black px-5 py-2 text-white"
                        >
                            Search
                        </button>

                        <button
                            type="button"
                            onClick={handleClear}
                            className="rounded-lg border px-5 py-2"
                        >
                            Clear
                        </button>

                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div>
                        Loading properties...
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="text-red-500">
                        {error}
                    </div>
                )}

                {/* Empty */}
                {!loading &&
                    !error &&
                    properties.length === 0 && (
                        <div>
                            No properties found.
                        </div>
                    )}

                {/* Properties */}
                {!loading &&
                    properties.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {properties.map(
                                (property) => (
                                    <PropertyCard
                                        key={property.id}
                                        property={property}
                                    />
                                )
                            )}
                        </div>
                    )}

            </main>

            <Footer />
        </>
    );
}