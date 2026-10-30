
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";

import { useAuth } from "@/context/AuthContext";
import { enquiryClient } from "@/services/enquiry.client";

import type {
    EnquiryWithUserAndProperty,
} from "@/types/enquiry";

import type {
    EnquiryStatus,
} from "@/types/common";

const statusOptions = [
    { label: "All Enquiries", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Contacted", value: "CONTACTED" },
    { label: "Negotiating", value: "NEGOTIATING" },
    { label: "Closed", value: "CLOSED" },
    { label: "Cancelled", value: "CANCELLED" },
];

const enquiryStatusOptions = [
    { label: "Pending", value: "PENDING" },
    { label: "Contacted", value: "CONTACTED" },
    { label: "Negotiating", value: "NEGOTIATING" },
    { label: "Closed", value: "CLOSED" },
    { label: "Cancelled", value: "CANCELLED" },
];

function getBadgeVariant(status: EnquiryStatus) {
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

function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(date: string | Date) {
    return new Date(date).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

export default function OwnerEnquiriesPage() {
    const { accessToken } = useAuth();

    const [enquiries, setEnquiries] = useState<
        EnquiryWithUserAndProperty[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        const loadEnquiries = async () => {
            if (!accessToken) {
                setLoading(false);
                return;
            }

            try {
                setError("");

                const response = await enquiryClient.getOwner(
                    accessToken
                );

                setEnquiries(response.enquiries);
            } catch (err: any) {
                setError(
                    err.message || "Failed to load enquiries"
                );
            } finally {
                setLoading(false);
            }
        };

        loadEnquiries();
    }, [accessToken]);

    const filteredEnquiries = useMemo(() => {
        if (filter === "ALL") {
            return enquiries;
        }

        return enquiries.filter(
            (enquiry) => enquiry.status === filter
        );
    }, [enquiries, filter]);

    const handleStatusChange = async (
        enquiryId: string,
        status: EnquiryStatus
    ) => {
        if (!accessToken) return;

        try {
            setUpdatingId(enquiryId);
            setError("");

            const response = await enquiryClient.updateStatus(
                enquiryId,
                { status },
                accessToken
            );

            setEnquiries((current) =>
                current.map((enquiry) =>
                    enquiry.id === enquiryId
                        ? {
                            ...enquiry,
                            status: response.enquiry.status,
                            updatedAt: response.enquiry.updatedAt,
                        }
                        : enquiry
                )
            );
        } catch (err: any) {
            setError(
                err.message || "Failed to update enquiry status"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const totalCount = enquiries.length;

    const pendingCount = enquiries.filter(
        (enquiry) => enquiry.status === "PENDING"
    ).length;

    const negotiatingCount = enquiries.filter(
        (enquiry) => enquiry.status === "NEGOTIATING"
    ).length;

    const closedCount = enquiries.filter(
        (enquiry) => enquiry.status === "CLOSED"
    ).length;

    const summaryCards = [
        {
            label: "Total Enquiries",
            value: totalCount,
            description: "All received enquiries",
            icon: "▤",
            iconClass: "bg-[var(--panel-strong)] text-[var(--brand-deep)]",
        },
        {
            label: "Pending",
            value: pendingCount,
            description: "Awaiting your response",
            icon: "◷",
            iconClass: "bg-amber-50 text-amber-700",
        },
        {
            label: "Negotiating",
            value: negotiatingCount,
            description: "Active discussions",
            icon: "↔",
            iconClass: "bg-blue-50 text-blue-700",
        },
        {
            label: "Closed",
            value: closedCount,
            description: "Completed enquiries",
            icon: "✓",
            iconClass: "bg-emerald-50 text-emerald-700",
        },
    ];

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[var(--background)]">
                <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">

                    {/* Page Header */}
                    <section className="mb-10">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
                            Owner Dashboard
                        </p>

                        <h1 className="display-font text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
                            Enquiry Management
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                            Keep track of people interested in your properties.
                            Review their messages, manage enquiry statuses, and
                            continue conversations from one place.
                        </p>
                    </section>

                    {/* Loading State */}
                    {loading ? (
                        <div className="surface flex min-h-64 flex-col items-center justify-center rounded-3xl border border-[var(--line)]">
                            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[var(--line)] border-t-[var(--brand)]" />

                            <p className="mt-4 text-sm font-medium text-[var(--muted)]">
                                Loading your enquiries...
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Error Message */}
                            {error && (
                                <div
                                    role="alert"
                                    className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
                                >
                                    {error}
                                </div>
                            )}

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

                            {/* Enquiry Workspace */}
                            <section>
                                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <h2 className="display-font text-xl font-semibold text-[var(--foreground)]">
                                            Received Enquiries
                                        </h2>

                                        <p className="mt-1 text-sm text-[var(--muted)]">
                                            {filteredEnquiries.length}{" "}
                                            {filteredEnquiries.length === 1
                                                ? "enquiry"
                                                : "enquiries"}{" "}
                                            displayed
                                        </p>
                                    </div>

                                    <div className="w-full sm:max-w-xs">
                                        <Select
                                            label="Filter by status"
                                            value={filter}
                                            onChange={(e) =>
                                                setFilter(e.target.value)
                                            }
                                            options={statusOptions}
                                        />
                                    </div>
                                </div>

                                {/* Empty State */}
                                {filteredEnquiries.length === 0 ? (
                                    <div className="surface flex flex-col items-center rounded-3xl border border-dashed border-[var(--line)] px-6 py-16 text-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--panel-strong)] text-3xl text-[var(--brand-deep)]">
                                            {filter === "ALL" ? "▤" : "⌕"}
                                        </div>

                                        <h3 className="display-font mt-6 text-xl font-semibold text-[var(--foreground)]">
                                            {filter === "ALL"
                                                ? "No enquiries received yet"
                                                : "No enquiries found"}
                                        </h3>

                                        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                                            {filter === "ALL"
                                                ? "When someone expresses interest in one of your properties, their enquiry will appear here."
                                                : "There are currently no enquiries with this status. Try selecting another filter."}
                                        </p>

                                        {filter !== "ALL" && (
                                            <button
                                                type="button"
                                                onClick={() => setFilter("ALL")}
                                                className="mt-5 rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel-strong)]"
                                            >
                                                View all enquiries
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    /* Enquiry Cards */
                                    <div className="space-y-5">
                                        {filteredEnquiries.map((enquiry) => {
                                            const isUpdating =
                                                updatingId === enquiry.id;

                                            return (
                                                <article
                                                    key={enquiry.id}
                                                    className="surface overflow-hidden rounded-3xl border border-[var(--line)] transition hover:shadow-md"
                                                >
                                                    {/* Property Header */}
                                                    <div className="border-b border-[var(--line)] bg-[var(--panel)] px-5 py-5 sm:px-7">
                                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                            <div className="min-w-0">
                                                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
                                                                    Property Enquiry
                                                                </p>

                                                                <h3 className="display-font text-xl font-semibold text-[var(--foreground)]">
                                                                    {enquiry.property.title}
                                                                </h3>

                                                                <p className="mt-2 flex items-center gap-2 text-sm text-[var(--muted)]">
                                                                    <span aria-hidden="true">⌖</span>
                                                                    {enquiry.property.locality},{" "}
                                                                    {enquiry.property.city}
                                                                </p>
                                                            </div>

                                                            <div className="shrink-0">
                                                                <Badge
                                                                    variant={getBadgeVariant(
                                                                        enquiry.status
                                                                    )}
                                                                >
                                                                    {enquiry.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Enquiry Details */}
                                                    <div className="px-5 py-6 sm:px-7">
                                                        <div className="grid gap-6 md:grid-cols-3">
                                                            {/* Interested User */}
                                                            <div className="md:col-span-1">
                                                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                                                                    Interested User
                                                                </p>

                                                                <div className="mt-3 flex items-center gap-3">
                                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--panel-strong)] text-sm font-semibold text-[var(--brand-deep)]">
                                                                        {getInitials(
                                                                            enquiry.user.name
                                                                        )}
                                                                    </div>

                                                                    <div className="min-w-0">
                                                                        <p className="truncate font-semibold text-[var(--foreground)]">
                                                                            {enquiry.user.name}
                                                                        </p>

                                                                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                                                                            Property interested user
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Email */}
                                                            <div>
                                                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                                                                    Email Address
                                                                </p>

                                                                <p className="mt-3 break-all text-sm font-medium text-[var(--foreground)]">
                                                                    {enquiry.user.email}
                                                                </p>
                                                            </div>

                                                            {/* Phone */}
                                                            <div>
                                                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                                                                    Contact Number
                                                                </p>

                                                                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                                                                    {enquiry.phone || "Not provided"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Message */}
                                                        <div className="mt-7">
                                                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                                                                Enquiry Message
                                                            </p>

                                                            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4">
                                                                {enquiry.message ? (
                                                                    <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">
                                                                        {enquiry.message}
                                                                    </p>
                                                                ) : (
                                                                    <p className="text-sm italic text-[var(--muted)]">
                                                                        No additional message was provided.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Footer Actions */}
                                                        <div className="mt-7 flex flex-col gap-5 border-t border-[var(--line)] pt-6 lg:flex-row lg:items-end lg:justify-between">
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                                                                        Received On
                                                                    </p>

                                                                    <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                                                                        {formatDateTime(
                                                                            enquiry.createdAt
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                                                                        Last Updated
                                                                    </p>

                                                                    <p className="mt-1 text-sm text-[var(--muted)]">
                                                                        {formatDate(
                                                                            enquiry.updatedAt
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                                                {/* Status Update */}
                                                                <div className="w-full sm:w-52">
                                                                    <Select
                                                                        label="Update status"
                                                                        value={enquiry.status}
                                                                        disabled={isUpdating}
                                                                        onChange={(e) =>
                                                                            handleStatusChange(
                                                                                enquiry.id,
                                                                                e.target.value as EnquiryStatus
                                                                            )
                                                                        }
                                                                        options={enquiryStatusOptions}
                                                                    />

                                                                    {isUpdating && (
                                                                        <p className="mt-1 text-xs text-[var(--muted)]">
                                                                            Updating status...
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {/* Conversation Link */}
                                                                <Link
                                                                    href={`/dashboard/enquiries/${enquiry.id}`}
                                                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]"
                                                                >
                                                                    {enquiry.status === "CLOSED" ||
                                                                        enquiry.status === "CANCELLED"
                                                                        ? "View Conversation"
                                                                        : "Continue Negotiation"}

                                                                    <span aria-hidden="true">
                                                                        →
                                                                    </span>
                                                                </Link>
                                                            </div>
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
        </>
    );
}
