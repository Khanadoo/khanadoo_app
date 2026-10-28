"use client";

import { useCallback, useEffect, useState } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/ui/PropertyCard";

import { Property } from "@/types/property";
import { propertyClient } from "@/services/property.client";

type PropertyFilters = {
    city?: string;
    locality?: string;
    type?: string;
    purpose?: string;
    minPrice?: number;
    maxPrice?: number;
    sort: string;
};

const inputClasses =
    "min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus-visible:border-[var(--brand)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]/20";

const labelClasses =
    "mb-1.5 block text-sm font-medium text-[var(--foreground)]";

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filter state
    const [city, setCity] = useState("");
    const [locality, setLocality] = useState("");
    const [type, setType] = useState("");
    const [purpose, setPurpose] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sort, setSort] = useState("newest");

    const [validationError, setValidationError] = useState("");

    const loadProperties = useCallback(
        async (filters: PropertyFilters) => {
            try {
                setLoading(true);
                setError("");
                setValidationError("");

                const response = await propertyClient.getAll(1, 10, filters);

                setProperties(response.data);
            } catch (err: unknown) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "We couldn't load the properties. Please try again.",
                );
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    // Load the initial listings.
    useEffect(() => {
        void loadProperties({ sort: "newest" });
    }, [loadProperties]);

    const handleSearch = async () => {
        const minimum = minPrice === "" ? undefined : Number(minPrice);
        const maximum = maxPrice === "" ? undefined : Number(maxPrice);

        if (
            (minimum !== undefined && (!Number.isFinite(minimum) || minimum < 0)) ||
            (maximum !== undefined && (!Number.isFinite(maximum) || maximum < 0))
        ) {
            setValidationError("Please enter valid, non-negative prices.");
            return;
        }

        if (
            minimum !== undefined &&
            maximum !== undefined &&
            minimum > maximum
        ) {
            setValidationError(
                "Minimum price cannot be greater than maximum price.",
            );
            return;
        }

        await loadProperties({
            city: city.trim() || undefined,
            locality: locality.trim() || undefined,
            type: type || undefined,
            purpose: purpose || undefined,
            minPrice: minimum,
            maxPrice: maximum,
            sort,
        });
    };

    const handleClear = () => {
        setCity("");
        setLocality("");
        setType("");
        setPurpose("");
        setMinPrice("");
        setMaxPrice("");
        setSort("newest");

        void loadProperties({ sort: "newest" });
    };

    const hasFilters = Boolean(
        city.trim() ||
        locality.trim() ||
        type ||
        purpose ||
        minPrice !== "" ||
        maxPrice !== "",
    );

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[var(--background)]">
                {/* Page introduction */}
                <section className="border-b border-[var(--line)] bg-[var(--panel)]">
                    <div className="page-shell py-10 sm:py-14">
                        <div className="max-w-3xl">
                            <span className="inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-[var(--brand-deep)]">
                                Find your next place
                            </span>

                            <h1 className="display-font mt-4 text-4xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">
                                Explore properties
                                <span className="text-[var(--brand-deep)]"> your way.</span>
                            </h1>

                            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                                Browse rooms, PGs, houses, and apartments for rent or sale.
                                Narrow your search by location, property type, and price.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="page-shell py-8 sm:py-10">
                    {/* Search and filters */}
                    <section
                        aria-labelledby="filters-heading"
                        className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[var(--shadow-card)] sm:p-7"
                    >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2
                                    id="filters-heading"
                                    className="text-xl font-semibold tracking-tight text-[var(--foreground)]"
                                >
                                    Find the right property
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                                    Use the filters below to narrow your options.
                                </p>
                            </div>

                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="self-start text-sm font-medium text-[var(--brand-deep)] underline-offset-4 hover:underline"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>

                        <form
                            className="mt-6"
                            onSubmit={(event) => {
                                event.preventDefault();
                                void handleSearch();
                            }}
                        >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label htmlFor="property-city" className={labelClasses}>
                                        City
                                    </label>
                                    <input
                                        id="property-city"
                                        type="text"
                                        autoComplete="address-level2"
                                        value={city}
                                        onChange={(event) => setCity(event.target.value)}
                                        placeholder="e.g. Silchar"
                                        className={inputClasses}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="property-locality" className={labelClasses}>
                                        Locality
                                    </label>
                                    <input
                                        id="property-locality"
                                        type="text"
                                        autoComplete="address-level3"
                                        value={locality}
                                        onChange={(event) => setLocality(event.target.value)}
                                        placeholder="e.g. Tarapur"
                                        className={inputClasses}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="property-type" className={labelClasses}>
                                        Property type
                                    </label>
                                    <select
                                        id="property-type"
                                        value={type}
                                        onChange={(event) => setType(event.target.value)}
                                        className={inputClasses}
                                    >
                                        <option value="">All types</option>
                                        <option value="ROOM">Room</option>
                                        <option value="PG">PG</option>
                                        <option value="HOUSE">House</option>
                                        <option value="APARTMENT">Apartment</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="property-purpose" className={labelClasses}>
                                        Looking to
                                    </label>
                                    <select
                                        id="property-purpose"
                                        value={purpose}
                                        onChange={(event) => setPurpose(event.target.value)}
                                        className={inputClasses}
                                    >
                                        <option value="">Rent or buy</option>
                                        <option value="RENT">Rent</option>
                                        <option value="SALE">Buy</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="minimum-price" className={labelClasses}>
                                        Minimum price (₹)
                                    </label>
                                    <input
                                        id="minimum-price"
                                        type="number"
                                        min="0"
                                        step="any"
                                        inputMode="decimal"
                                        value={minPrice}
                                        onChange={(event) => setMinPrice(event.target.value)}
                                        placeholder="No minimum"
                                        className={inputClasses}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="maximum-price" className={labelClasses}>
                                        Maximum price (₹)
                                    </label>
                                    <input
                                        id="maximum-price"
                                        type="number"
                                        min="0"
                                        step="any"
                                        inputMode="decimal"
                                        value={maxPrice}
                                        onChange={(event) => setMaxPrice(event.target.value)}
                                        placeholder="No maximum"
                                        className={inputClasses}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="property-sort" className={labelClasses}>
                                        Sort results
                                    </label>
                                    <select
                                        id="property-sort"
                                        value={sort}
                                        onChange={(event) => setSort(event.target.value)}
                                        className={inputClasses}
                                    >
                                        <option value="newest">Newest first</option>
                                        <option value="price_low">Price: low to high</option>
                                        <option value="price_high">Price: high to low</option>
                                    </select>
                                </div>
                            </div>

                            {validationError && (
                                <p
                                    role="alert"
                                    className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                                >
                                    {validationError}
                                </p>
                            )}

                            <div className="mt-6 flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand-deep)] px-6 py-2.5 font-semibold text-white transition-colors hover:bg-[#294b43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? "Searching..." : "Search properties"}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleClear}
                                    disabled={loading && !hasFilters}
                                    className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--panel)] px-6 py-2.5 font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Reset
                                </button>

                                <p className="text-sm text-[var(--muted)] sm:ml-auto">
                                    Search when you're ready to update the results.
                                </p>
                            </div>
                        </form>
                    </section>

                    {/* Results heading */}
                    <section className="mt-10" aria-labelledby="results-heading">
                        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2
                                    id="results-heading"
                                    className="text-2xl font-semibold tracking-tight text-[var(--foreground)]"
                                >
                                    Available listings
                                </h2>
                                <p className="mt-1 text-sm text-[var(--muted)]" aria-live="polite">
                                    {!loading && !error
                                        ? `Showing ${properties.length} ${properties.length === 1 ? "listing" : "listings"
                                        } on this page`
                                        : "Explore options that fit your needs"}
                                </p>
                            </div>
                        </div>

                        {/* Loading state */}
                        {loading && (
                            <div
                                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                                role="status"
                                aria-label="Loading properties"
                            >
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel)]"
                                    >
                                        <div className="aspect-[4/3] animate-pulse bg-[var(--panel-strong)]" />
                                        <div className="space-y-3 p-5">
                                            <div className="h-5 w-2/3 animate-pulse rounded bg-[var(--panel-strong)]" />
                                            <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--panel-strong)]" />
                                            <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--panel-strong)]" />
                                        </div>
                                    </div>
                                ))}
                                <span className="sr-only">Loading properties...</span>
                            </div>
                        )}

                        {/* Error state */}
                        {!loading && error && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 sm:p-8">
                                <h3 className="text-lg font-semibold text-red-900">
                                    We couldn't load the listings
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-red-800">
                                    {error}
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        void loadProperties({
                                            city: city.trim() || undefined,
                                            locality: locality.trim() || undefined,
                                            type: type || undefined,
                                            purpose: purpose || undefined,
                                            minPrice: minPrice === "" ? undefined : Number(minPrice),
                                            maxPrice: maxPrice === "" ? undefined : Number(maxPrice),
                                            sort,
                                        })
                                    }
                                    className="mt-4 rounded-[var(--radius-control)] bg-red-800 px-5 py-2.5 font-semibold text-white hover:bg-red-900"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && !error && properties.length === 0 && (
                            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-6 py-12 text-center sm:px-10">
                                <div
                                    aria-hidden="true"
                                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--sage)] text-2xl text-[var(--brand-deep)]"
                                >
                                    ⌕
                                </div>
                                <h3 className="mt-5 text-xl font-semibold text-[var(--foreground)]">
                                    No properties found
                                </h3>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                                    Try another location, adjust your price range, or clear the
                                    filters to explore all available listings.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand-deep)] px-5 py-2.5 font-semibold text-white hover:bg-[#294b43]"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}

                        {/* Property cards */}
                        {!loading && !error && properties.length > 0 && (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {properties.map((property) => (
                                    <PropertyCard key={property.id} property={property} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}