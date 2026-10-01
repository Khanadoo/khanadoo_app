"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import Badge from "@/components/ui/Badge";

import { useAuth } from "@/context/AuthContext";

import { enquiryClient } from "@/services/enquiry.client";
import { propertyClient } from "@/services/property.client";

import {
    EnquiryWithProperty,
    EnquiryWithUserAndProperty,
} from "@/types/enquiry";

import { Property } from "@/types/property";
import { EnquiryStatus } from "@/types/common";
import { formatCurrency } from "@/lib/utils";

function getEnquiryBadgeVariant(
    status: EnquiryStatus,
) {
    switch (status) {
        case "PENDING":
            return "warning";

        case "CONTACTED":
            return "info";

        case "NEGOTIATING":
            return "default";

        case "CLOSED":
            return "success";

        case "CANCELLED":
            return "danger";

        default:
            return "default";
    }
}

function formatStatus(status: string) {
    return status
        .toLowerCase()
        .replace("_", " ")
        .replace(/^\w/, (char) => char.toUpperCase());
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function DashboardPage() {
    const {
        user,
        accessToken,
        loading: authLoading,
    } = useAuth();

    const [userEnquiries, setUserEnquiries] =
        useState<EnquiryWithProperty[]>([]);

    const [ownerEnquiries, setOwnerEnquiries] =
        useState<EnquiryWithUserAndProperty[]>([]);

    const [properties, setProperties] =
        useState<Property[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (
            authLoading ||
            !accessToken ||
            !user
        ) {
            return;
        }

        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                if (user.role === "OWNER") {
                    const [
                        propertyResponse,
                        enquiryResponse,
                    ] = await Promise.all([
                        propertyClient.getMyProperties(
                            accessToken,
                        ),
                        enquiryClient.getOwner(
                            accessToken,
                        ),
                    ]);

                    setProperties(
                        propertyResponse.properties,
                    );

                    setOwnerEnquiries(
                        enquiryResponse.enquiries,
                    );
                } else {
                    const enquiryResponse =
                        await enquiryClient.getMine(accessToken);

                    setUserEnquiries(
                        enquiryResponse.enquiries,
                    );
                }
            } catch (err: any) {
                setError(
                    err.message ||
                        "Failed to load dashboard",
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [
        accessToken,
        user,
        authLoading,
    ]);

    const userStats = useMemo(() => {
        return {
            total: userEnquiries.length,

            pending: userEnquiries.filter(
                (enquiry) =>
                    enquiry.status === "PENDING",
            ).length,

            active: userEnquiries.filter(
                (enquiry) =>
                    enquiry.status === "CONTACTED" ||
                    enquiry.status === "NEGOTIATING",
            ).length,

            closed: userEnquiries.filter(
                (enquiry) =>
                    enquiry.status === "CLOSED",
            ).length,
        };
    }, [userEnquiries]);

    const ownerStats = useMemo(() => {
        return {
            totalProperties:
                properties.length,

            availableProperties:
                properties.filter(
                    (property) =>
                        property.status ===
                        "AVAILABLE",
                ).length,

            totalEnquiries:
                ownerEnquiries.length,

            pendingEnquiries:
                ownerEnquiries.filter(
                    (enquiry) =>
                        enquiry.status ===
                        "PENDING",
                ).length,
        };
    }, [
        properties,
        ownerEnquiries,
    ]);

    if (authLoading || loading) {
        return (
            <DashboardLayout>
                <div className="flex min-h-[400px] items-center justify-center">
                    <p className="text-sm text-[var(--muted)]">
                        Loading your dashboard...
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return null;
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="surface rounded-[2rem] p-8">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <PageHeader
                title={`Welcome back, ${user.name}`}
                subtitle={
                    user.role === "OWNER"
                        ? "Manage your properties and keep track of your enquiries."
                        : "Keep track of your property enquiries and continue your search."
                }
            />

            {user.role === "OWNER" ? (
                <OwnerDashboard
                    properties={properties}
                    enquiries={ownerEnquiries}
                    stats={ownerStats}
                />
            ) : (
                <UserDashboard
                    enquiries={userEnquiries}
                    stats={userStats}
                />
            )}
        </DashboardLayout>
    );
}

interface UserDashboardProps {
    enquiries: EnquiryWithProperty[];

    stats: {
        total: number;
        pending: number;
        active: number;
        closed: number;
    };
}

function UserDashboard({
    enquiries,
    stats,
}: UserDashboardProps) {
    const recentEnquiries =
        enquiries.slice(0, 5);

    return (
        <div className="space-y-8">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total Enquiries"
                    value={stats.total}
                />

                <StatCard
                    label="Pending"
                    value={stats.pending}
                />

                <StatCard
                    label="Active"
                    value={stats.active}
                />

                <StatCard
                    label="Closed"
                    value={stats.closed}
                />
            </section>

            <section className="surface rounded-[2rem] p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="display-font text-2xl font-semibold">
                            Recent Enquiries
                        </h2>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                            Keep track of your latest property enquiries.
                        </p>
                    </div>

                    <Link
                        href="/enquiries"
                        className="text-sm font-medium text-[var(--brand-deep)] hover:underline"
                    >
                        View all
                    </Link>
                </div>

                <div className="mt-6">
                    {recentEnquiries.length === 0 ? (
                        <EmptyState
                            title="No enquiries yet"
                            description="Find a property you're interested in and send your first enquiry."
                            actionLabel="Browse Properties"
                            actionHref="/properties"
                        />
                    ) : (
                        <div className="divide-y divide-[var(--line)]">
                            {recentEnquiries.map(
                                (enquiry) => (
                                    <EnquiryRow
                                        key={
                                            enquiry.id
                                        }
                                        title={
                                            enquiry
                                                .property
                                                .title
                                        }
                                        location={`${enquiry.property.locality}, ${enquiry.property.city}`}
                                        status={
                                            enquiry.status
                                        }
                                        date={
                                            enquiry.updatedAt
                                        }
                                    />
                                ),
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="surface rounded-[2rem] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="display-font text-2xl font-semibold">
                            Continue your search
                        </h2>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                            Browse available properties on PropertyHub.
                        </p>
                    </div>

                    <Link
                        href="/properties"
                        className="inline-flex rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--brand-deep)]"
                    >
                        Browse Properties
                    </Link>
                </div>
            </section>
        </div>
    );
}

interface OwnerDashboardProps {
    properties: Property[];
    enquiries: EnquiryWithUserAndProperty[];

    stats: {
        totalProperties: number;
        availableProperties: number;
        totalEnquiries: number;
        pendingEnquiries: number;
    };
}

function OwnerDashboard({
    properties,
    enquiries,
    stats,
}: OwnerDashboardProps) {
    const recentEnquiries =
        enquiries.slice(0, 5);

    const recentProperties =
        properties.slice(0, 4);

    return (
        <div className="space-y-8">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="My Properties"
                    value={
                        stats.totalProperties
                    }
                />

                <StatCard
                    label="Available"
                    value={
                        stats.availableProperties
                    }
                />

                <StatCard
                    label="Total Enquiries"
                    value={
                        stats.totalEnquiries
                    }
                />

                <StatCard
                    label="Pending Enquiries"
                    value={
                        stats.pendingEnquiries
                    }
                />
            </section>

            <section className="surface rounded-[2rem] p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="display-font text-2xl font-semibold">
                            Recent Enquiries
                        </h2>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                            See who is interested in your properties.
                        </p>
                    </div>

                    <Link
                        href="/owner/enquiries"
                        className="text-sm font-medium text-[var(--brand-deep)] hover:underline"
                    >
                        Manage enquiries
                    </Link>
                </div>

                <div className="mt-6">
                    {recentEnquiries.length === 0 ? (
                        <EmptyState
                            title="No enquiries yet"
                            description="Enquiries from interested users will appear here."
                        />
                    ) : (
                        <div className="divide-y divide-[var(--line)]">
                            {recentEnquiries.map(
                                (enquiry) => (
                                    <EnquiryRow
                                        key={
                                            enquiry.id
                                        }
                                        title={
                                            enquiry
                                                .property
                                                .title
                                        }
                                        location={`${enquiry.property.locality}, ${enquiry.property.city}`}
                                        status={
                                            enquiry.status
                                        }
                                        date={
                                            enquiry.updatedAt
                                        }
                                        secondaryText={
                                            enquiry
                                                .user
                                                .name
                                        }
                                    />
                                ),
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="surface rounded-[2rem] p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="display-font text-2xl font-semibold">
                            Your Properties
                        </h2>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                            Manage the properties you're currently listing.
                        </p>
                    </div>

                    <Link
                        href="/owner/properties"
                        className="text-sm font-medium text-[var(--brand-deep)] hover:underline"
                    >
                        View all
                    </Link>
                </div>

                <div className="mt-6">
                    {recentProperties.length === 0 ? (
                        <EmptyState
                            title="No properties listed"
                            description="Add your first property to start receiving enquiries."
                            actionLabel="Add Property"
                            actionHref="/properties/new"
                        />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {recentProperties.map(
                                (property) => (
                                    <PropertySummary
                                        key={
                                            property.id
                                        }
                                        property={
                                            property
                                        }
                                    />
                                ),
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: number;
}

function StatCard({
    label,
    value,
}: StatCardProps) {
    return (
        <div className="surface rounded-[2rem] p-5">
            <p className="text-sm text-[var(--muted)]">
                {label}
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
                {value}
            </p>
        </div>
    );
}

interface EnquiryRowProps {
    title: string;
    location: string;
    status: EnquiryStatus;
    date: string;
    secondaryText?: string;
}

function EnquiryRow({
    title,
    location,
    status,
    date,
    secondaryText,
}: EnquiryRowProps) {
    return (
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <p className="truncate font-medium">
                    {title}
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                    {location}
                </p>

                {secondaryText && (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                        Enquirer: {secondaryText}
                    </p>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-3">
                <Badge
                    variant={getEnquiryBadgeVariant(
                        status,
                    )}
                >
                    {formatStatus(status)}
                </Badge>

                <span className="text-xs text-[var(--muted)]">
                    {formatDate(date)}
                </span>
            </div>
        </div>
    );
}

interface PropertySummaryProps {
    property: Property;
}

function PropertySummary({
    property,
}: PropertySummaryProps) {
    return (
        <Link
            href={`/properties/${property.id}`}
            className="group rounded-[1.5rem] border border-[var(--line)] p-4 transition hover:bg-[var(--panel-strong)]"
        >
            <div className="flex gap-4">
                <div className="h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-[var(--panel-strong)]">
                    {property.imageUrls?.[0] ? (
                        <img
                            src={
                                property.imageUrls[0]
                            }
                            alt={
                                property.title
                            }
                            className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
                            No image
                        </div>
                    )}
                </div>

                <div className="min-w-0">
                    <p className="truncate font-medium">
                        {property.title}
                    </p>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                        {property.locality},{" "}
                        {property.city}
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                        {formatCurrency(
                            property.price,
                        )}
                    </p>
                </div>
            </div>
        </Link>
    );
}

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
}

function EmptyState({
    title,
    description,
    actionLabel,
    actionHref,
}: EmptyStateProps) {
    return (
        <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] p-8 text-center">
            <h3 className="font-medium">
                {title}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                {description}
            </p>

            {actionLabel &&
                actionHref && (
                    <Link
                        href={actionHref}
                        className="mt-5 inline-flex rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--brand-deep)]"
                    >
                        {actionLabel}
                    </Link>
                )}
        </div>
    );
}