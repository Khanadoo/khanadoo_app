
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

interface AdminOverview {
    totalUsers: number;
    totalOwners: number;
    activeUsers: number;
    suspendedUsers: number;
    totalProperties: number;
    availableProperties: number;
    inactiveProperties: number;
    totalEnquiries: number;
    pendingEnquiries: number;
    totalMessages: number;
}

interface RecentUser {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
}

interface RecentProperty {
    id: string;
    title: string;
    city: string;
    locality: string;
    status: string;
    isActive: boolean;
    createdAt: string;
    owner: {
        id: string;
        name: string;
    };
}

interface AdminOverviewResponse {
    success: boolean;
    overview: AdminOverview;
    recentUsers: RecentUser[];
    recentProperties: RecentProperty[];
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function StatCard({
    title,
    value,
    description,
}: {
    title: string;
    value: number;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
            <p className="text-sm text-[var(--muted)]">{title}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
                {value.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
                {description}
            </p>
        </div>
    );
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const { user, accessToken, loading: authLoading } = useAuth();

    const [data, setData] = useState<AdminOverviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading) return;

        if (!user || !accessToken) {
            router.replace("/login");
            return;
        }

        if (user.role !== "ADMIN") {
            router.replace("/dashboard");
            return;
        }

        let cancelled = false;

        async function loadOverview() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/admin/overview", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    cache: "no-store",
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Failed to load admin dashboard",
                    );
                }

                if (!cancelled) {
                    setData(result as AdminOverviewResponse);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Something went wrong",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadOverview();

        return () => {
            cancelled = true;
        };
    }, [authLoading, user, accessToken, router]);

    if (authLoading || loading) {
        return (
            <main className="page-shell py-10">
                <p className="text-sm text-[var(--muted)]">
                    Loading admin dashboard...
                </p>
            </main>
        );
    }

    if (!user || user.role !== "ADMIN") {
        return null;
    }

    if (error) {
        return (
            <main className="page-shell py-10">
                <div className="rounded-2xl border border-red-300 p-6">
                    <h1 className="text-lg font-semibold">
                        Unable to load dashboard
                    </h1>
                    <p className="mt-2 text-sm">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 rounded-full bg-[var(--brand)] px-4 py-2 text-sm text-white"
                    >
                        Try again
                    </button>
                </div>
            </main>
        );
    }

    if (!data) return null;

    const stats = data.overview;

    return (
        <main className="page-shell space-y-8 py-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-[var(--brand)]">
                        PROPERTYHUB ADMINISTRATION
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                        Admin Dashboard
                    </h1>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                        Monitor users, property listings and platform activity.
                    </p>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-medium hover:bg-[var(--panel-strong)]"
                >
                    Refresh data
                </button>
            </header>

            <section>
                <h2 className="mb-4 text-lg font-semibold">
                    Platform overview
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total users"
                        value={stats.totalUsers}
                        description={`${stats.activeUsers} active accounts`}
                    />
                    <StatCard
                        title="Property owners"
                        value={stats.totalOwners}
                        description="Registered owners"
                    />
                    <StatCard
                        title="Total properties"
                        value={stats.totalProperties}
                        description={`${stats.availableProperties} available`}
                    />
                    <StatCard
                        title="Total enquiries"
                        value={stats.totalEnquiries}
                        description={`${stats.pendingEnquiries} awaiting response`}
                    />
                </div>
            </section>

            <section>
                <h2 className="mb-4 text-lg font-semibold">
                    Account and activity summary
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Suspended / banned"
                        value={stats.suspendedUsers}
                        description="Accounts needing review"
                    />
                    <StatCard
                        title="Inactive listings"
                        value={stats.inactiveProperties}
                        description="Deactivated properties"
                    />
                    <StatCard
                        title="Messages"
                        value={stats.totalMessages}
                        description="Platform-wide message count"
                    />
                    <StatCard
                        title="Available listings"
                        value={stats.availableProperties}
                        description="Active properties available now"
                    />
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="font-semibold">Recent registrations</h2>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                                The latest accounts on PropertyHub
                            </p>
                        </div>
                        <span className="text-sm text-[var(--muted)]">
                            {data.recentUsers.length} users
                        </span>
                    </div>

                    {data.recentUsers.length === 0 ? (
                        <p className="py-6 text-sm text-[var(--muted)]">
                            No users registered yet.
                        </p>
                    ) : (
                        <div className="divide-y divide-[var(--line)]">
                            {data.recentUsers.map((recentUser) => (
                                <div
                                    key={recentUser.id}
                                    className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">
                                            {recentUser.name}
                                        </p>
                                        <p className="mt-1 truncate text-sm text-[var(--muted)]">
                                            {recentUser.email}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-sm sm:text-right">
                                        <p>{recentUser.role}</p>
                                        <p className="mt-1 text-[var(--muted)]">
                                            {formatDate(recentUser.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
                    <div className="mb-5">
                        <h2 className="font-semibold">Recent properties</h2>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                            The latest submitted listings
                        </p>
                    </div>

                    {data.recentProperties.length === 0 ? (
                        <p className="py-6 text-sm text-[var(--muted)]">
                            No properties listed yet.
                        </p>
                    ) : (
                        <div className="divide-y divide-[var(--line)]">
                            {data.recentProperties.map((property) => (
                                <div key={property.id} className="py-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-medium">{property.title}</p>
                                            <p className="mt-1 text-sm text-[var(--muted)]">
                                                {property.locality}, {property.city}
                                            </p>
                                            <p className="mt-1 text-sm text-[var(--muted)]">
                                                Owner: {property.owner.name}
                                            </p>
                                        </div>
                                        <span className="shrink-0 rounded-full border border-[var(--line)] px-3 py-1 text-xs">
                                            {property.isActive
                                                ? property.status
                                                : "INACTIVE"}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-[var(--muted)]">
                                        Added {formatDate(property.createdAt)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
                <h2 className="font-semibold">Quick navigation</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                    Administrative tools will be added in the next steps.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                        href="/properties"
                        className="rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--brand-deep)]"
                    >
                        Browse properties
                    </Link>
                    <Link
                        href="/dashboard"
                        className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--panel-strong)]"
                    >
                        User dashboard
                    </Link>
                </div>
            </section>
        </main>
    );
}
