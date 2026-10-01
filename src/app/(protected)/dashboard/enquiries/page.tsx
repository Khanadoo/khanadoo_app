"use client";

import { useEffect, useMemo, useState } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";

import { useAuth } from "@/context/AuthContext";

import { enquiryClient } from "@/services/enquiry.client";

import type { EnquiryWithProperty } from "@/types/enquiry";
import type { EnquiryStatus } from "@/types/common";

const statusOptions = [
    {
        label: "All Enquiries",
        value: "ALL",
    },
    {
        label: "Pending",
        value: "PENDING",
    },
    {
        label: "Contacted",
        value: "CONTACTED",
    },
    {
        label: "Negotiating",
        value: "NEGOTIATING",
    },
    {
        label: "Closed",
        value: "CLOSED",
    },
    {
        label: "Cancelled",
        value: "CANCELLED",
    },
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

export default function UserEnquiriesPage() {
    const { accessToken } = useAuth();

    const [enquiries, setEnquiries] =
        useState<EnquiryWithProperty[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [filter, setFilter] =
        useState("ALL");

    useEffect(() => {
        const loadEnquiries = async () => {
            if (!accessToken) {
                setLoading(false);
                return;
            }

            try {
                setError("");

                const response =
                    await enquiryClient.getMine(accessToken);

                setEnquiries(response.enquiries);
            } catch (err: any) {
                setError(
                    err.message ||
                    "Failed to load your enquiries"
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
            (enquiry) =>
                enquiry.status === filter
        );
    }, [enquiries, filter]);

    const totalCount = enquiries.length;

    const pendingCount = enquiries.filter(
        (enquiry) =>
            enquiry.status === "PENDING"
    ).length;

    const activeCount = enquiries.filter(
        (enquiry) =>
            enquiry.status === "CONTACTED" ||
            enquiry.status === "NEGOTIATING"
    ).length;

    const closedCount = enquiries.filter(
        (enquiry) =>
            enquiry.status === "CLOSED"
    ).length;

    if (loading) {
        return (
            <>
                <Navbar />

                <main className="mx-auto max-w-7xl px-6 py-10">
                    <p className="text-gray-500">
                        Loading your enquiries...
                    </p>
                </main>

                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-10">

                {/* Header */}

                <div className="mb-8">
                    <h1 className="text-4xl font-bold">
                        My Enquiries
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Track the enquiries you have submitted
                        for properties.
                    </p>
                </div>

                {/* Error */}

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Stats */}

                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-xl border bg-white p-5">
                        <p className="text-sm text-gray-500">
                            Total Enquiries
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {totalCount}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5">
                        <p className="text-sm text-gray-500">
                            Pending
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {pendingCount}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5">
                        <p className="text-sm text-gray-500">
                            Active
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {activeCount}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5">
                        <p className="text-sm text-gray-500">
                            Closed
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {closedCount}
                        </p>
                    </div>

                </div>

                {/* Filter */}

                <div className="mb-6 max-w-xs">
                    <Select
                        label="Filter enquiries"
                        value={filter}
                        onChange={(e) =>
                            setFilter(e.target.value)
                        }
                        options={statusOptions}
                    />
                </div>

                {/* Enquiries */}

                {filteredEnquiries.length === 0 ? (
                    <div className="rounded-xl border bg-white p-10 text-center">

                        <h2 className="text-xl font-semibold">
                            No enquiries found
                        </h2>

                        <p className="mt-2 text-gray-500">
                            {filter === "ALL"
                                ? "You haven't submitted any enquiries yet."
                                : "There are no enquiries with this status."
                            }
                        </p>

                    </div>
                ) : (
                    <div className="space-y-5">

                        {filteredEnquiries.map(
                            (enquiry) => (
                                <div
                                    key={enquiry.id}
                                    className="rounded-xl border bg-white p-6 shadow-sm"
                                >

                                    {/* Top section */}

                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                                        <div>
                                            <h2 className="text-xl font-semibold">
                                                {enquiry.property.title}
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {enquiry.property.locality},{" "}
                                                {enquiry.property.city}
                                            </p>
                                        </div>

                                        <Badge
                                            variant={getBadgeVariant(
                                                enquiry.status
                                            )}
                                        >
                                            {enquiry.status}
                                        </Badge>

                                    </div>

                                    {/* Divider */}

                                    <div className="my-5 border-t" />

                                    {/* Property information */}

                                    <div className="grid gap-5 md:grid-cols-3">

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Property Type
                                            </p>

                                            <p className="mt-1 font-medium">
                                                {enquiry.property.type}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Purpose
                                            </p>

                                            <p className="mt-1 font-medium">
                                                {enquiry.property.purpose}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Price
                                            </p>

                                            <p className="mt-1 font-medium">
                                                ₹{enquiry.property.price.toLocaleString("en-IN")}
                                            </p>
                                        </div>

                                    </div>

                                    {/* Message */}

                                    {enquiry.message && (
                                        <div className="mt-5">

                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Your Message
                                            </p>

                                            <p className="mt-1 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                                                {enquiry.message}
                                            </p>

                                        </div>
                                    )}

                                    {/* Bottom section */}

                                    <div className="mt-6 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-end sm:justify-between">

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Submitted
                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                {new Date(
                                                    enquiry.createdAt
                                                ).toLocaleString()}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Last Updated
                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                {new Date(
                                                    enquiry.updatedAt
                                                ).toLocaleString()}
                                            </p>
                                        </div>

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

            </main>

            <Footer />
        </>
    );
}