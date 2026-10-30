
"use client";

import { useEffect, useState } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Button from "@/components/ui/Button";
import PropertyCard from "@/components/ui/PropertyCard";

import { Property } from "@/types/property";
import { propertyClient } from "@/services/property.client";
import { useAuth } from "@/context/AuthContext";

import PropertyForm, {
    PropertyFormValues,
} from "@/components/property/PropertyForm";

import AddPropertyModal from "@/components/property/AddPropertyModal";
import { Modal } from "@/components/ui";

function formatPrice(price: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(price);
}

function getStatusDetails(status: Property["status"]) {
    switch (status) {
        case "AVAILABLE":
            return {
                label: "Available",
                className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
                dotClass: "bg-emerald-500",
            };

        case "RENTED":
            return {
                label: "Rented",
                className: "bg-blue-50 text-blue-700 ring-blue-600/20",
                dotClass: "bg-blue-500",
            };

        case "SOLD":
            return {
                label: "Sold",
                className: "bg-slate-100 text-slate-700 ring-slate-500/20",
                dotClass: "bg-slate-500",
            };

        default:
            return {
                label: status,
                className: "bg-slate-100 text-slate-700 ring-slate-500/20",
                dotClass: "bg-slate-500",
            };
    }
}

export default function MyPropertiesPage() {
    const { accessToken } = useAuth();

    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [updatingPropertyId, setUpdatingPropertyId] = useState<string | null>(null);

    useEffect(() => {
        const loadProperties = async () => {
            if (!accessToken) return;

            try {
                setError("");

                const response = await propertyClient.getMyProperties(
                    accessToken
                );

                setProperties(response.properties);
            } catch (err: any) {
                setError(err.message || "Failed to load properties");
            } finally {
                setLoading(false);
            }
        };

        loadProperties();
    }, [accessToken]);

    const refreshProperties = async () => {
        if (!accessToken) return;

        const refreshed = await propertyClient.getMyProperties(
            accessToken
        );

        setProperties(refreshed.properties);
    };

    const handleDelete = async (propertyId: string) => {
        if (!accessToken) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this property?"
        );

        if (!confirmed) return;

        try {
            await propertyClient.delete(propertyId, accessToken);

            setProperties((prev) =>
                prev.filter((property) => property.id !== propertyId)
            );
        } catch (err: any) {
            alert(err.message || "Failed to delete property");
        }
    };

    const handleStatusUpdate = async (property: Property) => {
        if (!accessToken) return;

        const newStatus =
            property.purpose === "RENT" ? "RENTED" : "SOLD";

        const confirmed = window.confirm(
            `Mark "${property.title}" as ${newStatus.toLowerCase()}?`
        );

        if (!confirmed) return;

        try {
            setUpdatingPropertyId(property.id);

            const updatedProperty = await propertyClient.updateStatus(
                property.id,
                newStatus,
                accessToken
            );

            setProperties((prev) =>
                prev.map((item) =>
                    item.id === updatedProperty.id
                        ? updatedProperty
                        : item
                )
            );
        } catch (err: any) {
            alert(err.message || "Failed to update property status");
        } finally {
            setUpdatingPropertyId(null);
        }
    };

    const handleEdit = async (values: PropertyFormValues) => {
        if (!editingProperty || !accessToken) return;

        try {
            await propertyClient.update(
                editingProperty.id,
                values,
                accessToken
            );

            await refreshProperties();
            setEditingProperty(null);
        } catch (err: any) {
            alert(err.message || "Failed to update property");
        }
    };

    const totalProperties = properties.length;

    const availableProperties = properties.filter(
        (property) => property.status === "AVAILABLE"
    ).length;

    const rentedProperties = properties.filter(
        (property) => property.status === "RENTED"
    ).length;

    const soldProperties = properties.filter(
        (property) => property.status === "SOLD"
    ).length;

    const summaryCards = [
        {
            label: "Total Properties",
            value: totalProperties,
            description: "All your listings",
            icon: "▦",
            iconClass: "bg-[var(--panel-strong)] text-[var(--brand-deep)]",
        },
        {
            label: "Available",
            value: availableProperties,
            description: "Currently active listings",
            icon: "✓",
            iconClass: "bg-emerald-50 text-emerald-700",
        },
        {
            label: "Rented",
            value: rentedProperties,
            description: "Successfully rented",
            icon: "⌂",
            iconClass: "bg-blue-50 text-blue-700",
        },
        {
            label: "Sold",
            value: soldProperties,
            description: "Successfully sold",
            icon: "↗",
            iconClass: "bg-slate-100 text-slate-700",
        },
    ];

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[var(--background)]">
                <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">

                    {/* Page Header */}
                    <section className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
                                Owner Dashboard
                            </p>

                            <h1 className="display-font text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
                                My Properties
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                                Manage your property listings, track their
                                availability, and keep your information up to date.
                            </p>
                        </div>

                        <Button
                            size="md"
                            onClick={() => setShowCreateModal(true)}
                            className="shrink-0"
                        >
                            <span className="mr-2 text-lg">+</span>
                            Add Property
                        </Button>
                    </section>

                    {/* Loading State */}
                    {loading ? (
                        <div className="surface flex min-h-64 flex-col items-center justify-center rounded-3xl border border-[var(--line)]">
                            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[var(--line)] border-t-[var(--brand)]" />

                            <p className="mt-4 text-sm font-medium text-[var(--muted)]">
                                Loading your properties...
                            </p>
                        </div>
                    ) : error ? (
                        /* Error State */
                        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
                            <p className="text-lg font-semibold text-red-800">
                                Unable to load properties
                            </p>

                            <p className="mt-2 text-sm text-red-700">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="mt-5 rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {summaryCards.map((card) => (
                                    <div
                                        key={card.label}
                                        className="surface rounded-2xl border border-[var(--line)] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-[var(--muted)]">
                                                    {card.label}
                                                </p>

                                                <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                                                    {card.value}
                                                </p>
                                            </div>

                                            <div
                                                className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl font-semibold ${card.iconClass}`}
                                            >
                                                {card.icon}
                                            </div>
                                        </div>

                                        <p className="mt-4 text-xs text-[var(--muted)]">
                                            {card.description}
                                        </p>
                                    </div>
                                ))}
                            </section>

                            {/* Property Listings Header */}
                            <section>
                                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h2 className="display-font text-xl font-semibold text-[var(--foreground)]">
                                            Your Listings
                                        </h2>

                                        <p className="mt-1 text-sm text-[var(--muted)]">
                                            {totalProperties}{" "}
                                            {totalProperties === 1
                                                ? "property"
                                                : "properties"}{" "}
                                            listed
                                        </p>
                                    </div>
                                </div>

                                {/* Empty State */}
                                {properties.length === 0 ? (
                                    <div className="surface flex flex-col items-center rounded-3xl border border-dashed border-[var(--line)] px-6 py-16 text-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--panel-strong)] text-3xl text-[var(--brand-deep)]">
                                            +
                                        </div>

                                        <h3 className="display-font mt-6 text-xl font-semibold text-[var(--foreground)]">
                                            No properties listed yet
                                        </h3>

                                        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                                            Start by adding your first property.
                                            Your listings will appear here, where
                                            you can manage their details and status.
                                        </p>

                                        <Button
                                            size="md"
                                            className="mt-6"
                                            onClick={() =>
                                                setShowCreateModal(true)
                                            }
                                        >
                                            + Add Your First Property
                                        </Button>
                                    </div>
                                ) : (
                                    /* Property Grid */
                                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                        {properties.map((property) => {
                                            const status = getStatusDetails(
                                                property.status
                                            );

                                            const isUpdating =
                                                updatingPropertyId === property.id;

                                            return (
                                                <article
                                                    key={property.id}
                                                    className="surface overflow-hidden rounded-3xl border border-[var(--line)] p-3 transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                                                >
                                                    {/* Existing Property Card */}
                                                    <PropertyCard
                                                        property={property}
                                                    />

                                                    <div className="px-2 pb-2 pt-4">
                                                        {/* Property Information */}
                                                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                                            <span
                                                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${status.className}`}
                                                            >
                                                                <span
                                                                    className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`}
                                                                />
                                                                {status.label}
                                                            </span>

                                                            <span className="text-xs font-medium text-[var(--muted)]">
                                                                {property.purpose === "RENT"
                                                                    ? "For Rent"
                                                                    : "For Sale"}
                                                            </span>
                                                        </div>

                                                        <div className="mb-5">
                                                            <p className="text-xs font-medium text-[var(--muted)]">
                                                                {property.purpose === "RENT"
                                                                    ? "Monthly Rent"
                                                                    : "Selling Price"}
                                                            </p>

                                                            <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">
                                                                {formatPrice(property.price)}
                                                                {property.purpose === "RENT" && (
                                                                    <span className="ml-1 text-xs font-medium text-[var(--muted)]">
                                                                        / month
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>

                                                        {/* Lifecycle Action */}
                                                        {property.status === "AVAILABLE" && (
                                                            <Button
                                                                size="md"
                                                                variant="secondary"
                                                                className="mb-3 w-full"
                                                                disabled={isUpdating}
                                                                onClick={() =>
                                                                    handleStatusUpdate(property)
                                                                }
                                                            >
                                                                {isUpdating
                                                                    ? "Updating..."
                                                                    : property.purpose === "RENT"
                                                                        ? "Mark as Rented"
                                                                        : "Mark as Sold"}
                                                            </Button>
                                                        )}

                                                        {/* Edit and Delete */}
                                                        <div className="flex gap-3">
                                                            <Button
                                                                size="md"
                                                                variant="secondary"
                                                                className="flex-1"
                                                                onClick={() =>
                                                                    setEditingProperty(property)
                                                                }
                                                            >
                                                                Edit Details
                                                            </Button>

                                                            <Button
                                                                size="md"
                                                                variant="danger"
                                                                className="flex-1"
                                                                onClick={() =>
                                                                    handleDelete(property.id)
                                                                }
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </main>

            <Footer />

            {/* Create Property Modal */}
            <AddPropertyModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={refreshProperties}
            />

            {/* Edit Property Modal */}
            <Modal
                open={!!editingProperty}
                title="Edit Property"
                onClose={() => setEditingProperty(null)}
            >
                {editingProperty && (
                    <PropertyForm
                        initialValues={{
                            title: editingProperty.title,
                            description: editingProperty.description ?? "",
                            type: editingProperty.type,
                            purpose: editingProperty.purpose,
                            price: editingProperty.price,
                            city: editingProperty.city,
                            locality: editingProperty.locality,
                            address: editingProperty.address,
                            bedrooms: editingProperty.bedrooms,
                            bathrooms: editingProperty.bathrooms,
                            area: editingProperty.area,
                            imageUrls: editingProperty.imageUrls,
                        }}
                        submitLabel="Update Property"
                        onSubmit={handleEdit}
                    />
                )}
            </Modal>
        </>
    );
}
