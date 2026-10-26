
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type PropertyType = "ROOM" | "PG" | "HOUSE" | "APARTMENT";
type PropertyPurpose = "RENT" | "SALE";
type PropertyStatus = "AVAILABLE" | "RENTED" | "SOLD";

type AdminProperty = {
    id: string;
    title: string;
    type: PropertyType;
    purpose: PropertyPurpose;
    price: number | string;
    city: string;
    locality: string;
    status: PropertyStatus;
    isActive: boolean;
    featured: boolean;
    verified: boolean;
    imageUrls: string[];
    createdAt: string;
    updatedAt: string;
    owner: {
        id: string;
        name: string;
        email: string;
    };
};

type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

type PendingAction = {
    property: AdminProperty;
    isActive: boolean;
};

const initialPagination: Pagination = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
};

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatPrice(value: number | string) {
    const price = Number(value);

    if (!Number.isFinite(price)) {
        return "—";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(price);
}

function moderationClasses(isActive: boolean) {
    return isActive
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";
}

function propertyStatusClasses(status: PropertyStatus) {
    switch (status) {
        case "AVAILABLE":
            return "bg-blue-100 text-blue-800";
        case "RENTED":
            return "bg-yellow-100 text-yellow-800";
        case "SOLD":
            return "bg-purple-100 text-purple-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

export default function AdminPropertiesPage() {
    const { accessToken } = useAuth();

    const [properties, setProperties] = useState<AdminProperty[]>([]);
    const [pagination, setPagination] =
        useState<Pagination>(initialPagination);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [purposeFilter, setPurposeFilter] = useState("");
    const [activeFilter, setActiveFilter] = useState("");

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const [pendingAction, setPendingAction] =
        useState<PendingAction | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

    useEffect(() => {
        if (!accessToken) {
            setLoading(false);
            setError("Authentication required. Please log in again.");
            return;
        }

        const controller = new AbortController();

        async function loadProperties() {
            setLoading(true);
            setError("");

            try {
                const params = new URLSearchParams({
                    page: String(page),
                    limit: "10",
                });

                if (search) params.set("search", search);
                if (statusFilter) params.set("status", statusFilter);
                if (typeFilter) params.set("type", typeFilter);
                if (purposeFilter) params.set("purpose", purposeFilter);

                if (activeFilter) {
                    params.set("isActive", activeFilter);
                }

                const response = await fetch(
                    `/api/admin/properties?${params.toString()}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                        signal: controller.signal,
                    },
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || "Failed to load properties.",
                    );
                }

                setProperties(data.properties ?? []);
                setPagination(data.pagination ?? initialPagination);
            } catch (err) {
                if (controller.signal.aborted) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : "Something went wrong.",
                );
                setProperties([]);
                setPagination(initialPagination);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadProperties();

        return () => controller.abort();
    }, [
        accessToken,
        page,
        search,
        statusFilter,
        typeFilter,
        purposeFilter,
        activeFilter,
        refreshKey,
    ]);

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    }

    function clearFilters() {
        setSearchInput("");
        setSearch("");
        setStatusFilter("");
        setTypeFilter("");
        setPurposeFilter("");
        setActiveFilter("");
        setPage(1);
    }

    const hasFilters = Boolean(
        search || statusFilter || typeFilter || purposeFilter || activeFilter,
    );

    async function confirmModerationChange() {
        if (!pendingAction || !accessToken || actionLoading) return;

        const { property, isActive } = pendingAction;

        setActionLoading(true);
        setActionError("");
        setActionSuccess("");

        try {
            const response = await fetch(
                `/api/admin/properties/${encodeURIComponent(property.id)}/moderation`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ isActive }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to update property moderation.",
                );
            }

            setActionSuccess(
                `"${property.title}" was ${isActive ? "reactivated" : "deactivated"
                } successfully.`,
            );

            setPendingAction(null);
            setRefreshKey((current) => current + 1);
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong while updating the property.",
            );
        } finally {
            setActionLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Property Moderation
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                    Review property listings and control their visibility on
                    PropertyHub.
                </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col gap-3 sm:flex-row"
                >
                    <input
                        type="search"
                        value={searchInput}
                        onChange={(event) =>
                            setSearchInput(event.target.value)
                        }
                        placeholder="Search title, city, locality, or owner..."
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Search
                    </button>
                </form>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <select
                        value={statusFilter}
                        onChange={(event) => {
                            setPage(1);
                            setStatusFilter(event.target.value);
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="">All property statuses</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="RENTED">Rented</option>
                        <option value="SOLD">Sold</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(event) => {
                            setPage(1);
                            setTypeFilter(event.target.value);
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="">All property types</option>
                        <option value="ROOM">Room</option>
                        <option value="PG">PG</option>
                        <option value="HOUSE">House</option>
                        <option value="APARTMENT">Apartment</option>
                    </select>

                    <select
                        value={purposeFilter}
                        onChange={(event) => {
                            setPage(1);
                            setPurposeFilter(event.target.value);
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="">Rent and sale</option>
                        <option value="RENT">For rent</option>
                        <option value="SALE">For sale</option>
                    </select>

                    <select
                        value={activeFilter}
                        onChange={(event) => {
                            setPage(1);
                            setActiveFilter(event.target.value);
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="">All moderation states</option>
                        <option value="true">Active listings</option>
                        <option value="false">Deactivated listings</option>
                    </select>

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    {error}
                    <button
                        type="button"
                        onClick={() => setRefreshKey((current) => current + 1)}
                        className="ml-2 font-semibold underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-1 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="font-semibold text-gray-900">
                        All Properties
                    </h2>
                    <p className="text-sm text-gray-500">
                        {loading
                            ? "Loading properties..."
                            : `${pagination.total} propert${pagination.total === 1 ? "y" : "ies"} found`}
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">
                                    Property
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Owner
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Price
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Status
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Moderation
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Listed
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-12 text-center text-gray-500"
                                    >
                                        Loading properties...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-12 text-center text-gray-500"
                                    >
                                        Properties could not be loaded.
                                    </td>
                                </tr>
                            ) : properties.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-12 text-center text-gray-500"
                                    >
                                        No properties found. Try changing your
                                        search or filters.
                                    </td>
                                </tr>
                            ) : (
                                properties.map((property) => (
                                    <tr
                                        key={property.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-gray-900">
                                                {property.title}
                                            </div>
                                            <div className="mt-1 text-gray-500">
                                                {property.type} · {property.purpose}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {property.locality}, {property.city}
                                            </div>
                                            {(property.featured || property.verified) && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {property.featured && (
                                                        <span className="rounded bg-purple-50 px-2 py-1 text-xs text-purple-700">
                                                            Featured
                                                        </span>
                                                    )}
                                                    {property.verified && (
                                                        <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
                                                            Verified
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="font-medium text-gray-900">
                                                {property.owner?.name || "Unknown owner"}
                                            </div>
                                            <div className="mt-1 text-gray-500">
                                                {property.owner?.email || "—"}
                                            </div>
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-700">
                                            {formatPrice(property.price)}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${propertyStatusClasses(property.status)}`}
                                            >
                                                {property.status}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${moderationClasses(property.isActive)}`}
                                            >
                                                {property.isActive
                                                    ? "Active"
                                                    : "Deactivated"}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                                            {formatDate(property.createdAt)}
                                        </td>

                                        <td className="px-4 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPendingAction({
                                                        property,
                                                        isActive: !property.isActive,
                                                    })
                                                }
                                                disabled={actionLoading}
                                                className={`rounded-md px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${property.isActive
                                                        ? "bg-red-50 text-red-700 hover:bg-red-100"
                                                        : "bg-green-50 text-green-700 hover:bg-green-100"
                                                    }`}
                                            >
                                                {property.isActive
                                                    ? "Deactivate"
                                                    : "Reactivate"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500">
                        Page {pagination.page} of{" "}
                        {Math.max(pagination.totalPages, 1)}
                    </p>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((current) => current - 1)}
                            disabled={loading || page <= 1}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <button
                            type="button"
                            onClick={() => setPage((current) => current + 1)}
                            disabled={
                                loading ||
                                page >= pagination.totalPages ||
                                pagination.totalPages === 0
                            }
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {actionSuccess && (
                <div
                    role="status"
                    className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                >
                    {actionSuccess}
                    <button
                        type="button"
                        onClick={() => setActionSuccess("")}
                        className="ml-3 font-semibold underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {actionError && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    {actionError}
                    <button
                        type="button"
                        onClick={() => setActionError("")}
                        className="ml-3 font-semibold underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {pendingAction && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => {
                        if (!actionLoading) setPendingAction(null);
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="moderation-dialog-title"
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2
                            id="moderation-dialog-title"
                            className="text-lg font-semibold text-gray-900"
                        >
                            Confirm property moderation
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-gray-600">
                            {pendingAction.isActive
                                ? "Reactivate"
                                : "Deactivate"}{" "}
                            the listing{" "}
                            <strong>{pendingAction.property.title}</strong>?
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            {pendingAction.isActive
                                ? "The listing will be eligible to appear in public property searches again."
                                : "The listing will be hidden from public property searches. Its Available, Rented, or Sold status will remain unchanged."}
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setPendingAction(null)}
                                disabled={actionLoading}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmModerationChange}
                                disabled={actionLoading}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {actionLoading
                                    ? "Updating..."
                                    : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
