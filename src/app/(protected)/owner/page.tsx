"use client";

import { useEffect, useState } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import StatsCard from "@/components/dashboard/StatsCard";

import { ownerClient } from "@/services/owner.client";

import { useAuth } from "@/context/AuthContext";

import type {
    DashboardResponse,
} from "@/services/owner.client";

export default function OwnerDashboardPage() {
    const { accessToken } = useAuth();

    const [data, setData] =
        useState<DashboardResponse | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            if (!accessToken) return;

            try {
                const response =
                    await ownerClient.getDashboard(
                        accessToken
                    );

                setData(response);
            } catch (err: any) {
                setError(
                    err.message ||
                    "Failed to load dashboard"
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [accessToken]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error || !data) {
        return (
            <div className="p-10 text-red-500">
                {error || "Failed to load dashboard"}
            </div>
        );
    }

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-10">
                <h1 className="mb-8 text-4xl font-bold">
                    Owner Dashboard
                </h1>

                {/* Stats */}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Properties"
                        value={
                            data.stats.totalProperties
                        }
                    />

                    <StatsCard
                        title="Active Listings"
                        value={
                            data.stats.activeProperties
                        }
                    />

                    <StatsCard
                        title="Total Enquiries"
                        value={
                            data.stats.totalEnquiries
                        }
                    />

                    <StatsCard
                        title="Pending Enquiries"
                        value={
                            data.stats.pendingEnquiries
                        }
                    />
                </div>

                {/* Recent Properties */}

                <section className="mt-12">
                    <h2 className="mb-4 text-2xl font-semibold">
                        Recent Properties
                    </h2>

                    <div className="rounded-xl border bg-white">
                        {data.recentProperties.length === 0 ? (
                            <p className="p-6 text-gray-500">
                                No properties found.
                            </p>
                        ) : (
                            data.recentProperties.map(
                                (property) => (
                                    <div
                                        key={property.id}
                                        className="border-b p-4 last:border-b-0"
                                    >
                                        <p className="font-medium">
                                            {property.title}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {property.locality},{" "}
                                            {property.city}
                                        </p>
                                    </div>
                                )
                            )
                        )}
                    </div>
                </section>

                {/* Recent Enquiries */}

                <section className="mt-12">
                    <h2 className="mb-4 text-2xl font-semibold">
                        Recent Enquiries
                    </h2>

                    <div className="rounded-xl border bg-white">
                        {data.recentEnquiries.length === 0 ? (
                            <p className="p-6 text-gray-500">
                                No enquiries found.
                            </p>
                        ) : (
                            data.recentEnquiries.map(
                                (enquiry) => (
                                    <div
                                        key={enquiry.id}
                                        className="border-b p-4 last:border-b-0"
                                    >
                                        <p className="font-medium">
                                            {enquiry.user.name}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            Property:{" "}
                                            {enquiry.property.title}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {enquiry.phone}
                                        </p>

                                        {enquiry.message && (
                                            <p className="mt-2 text-sm">
                                                {enquiry.message}
                                            </p>
                                        )}
                                    </div>
                                )
                            )
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}