
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type UserRole = "USER" | "OWNER" | "ADMIN";
type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

type AdminUser = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
};

type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

type PendingAction = {
    user: AdminUser;
    status: UserStatus;
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

function statusClasses(status: UserStatus) {
    switch (status) {
        case "ACTIVE":
            return "bg-green-100 text-green-800";
        case "SUSPENDED":
            return "bg-yellow-100 text-yellow-800";
        case "BANNED":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

export default function AdminUsersPage() {
    const { accessToken } = useAuth();

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [pagination, setPagination] =
        useState<Pagination>(initialPagination);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [pendingAction, setPendingAction] =
        useState<PendingAction | null>(null);

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        if (!accessToken) {
            setLoading(false);
            setError("Authentication required. Please log in again.");
            return;
        }

        const controller = new AbortController();

        async function loadUsers() {
            setLoading(true);
            setError("");

            try {
                const params = new URLSearchParams({
                    page: String(page),
                    limit: "10",
                });

                if (search) params.set("search", search);
                if (roleFilter) params.set("role", roleFilter);
                if (statusFilter) params.set("status", statusFilter);

                const response = await fetch(
                    `/api/admin/users?${params.toString()}`,
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
                        data.error || "Failed to load users.",
                    );
                }

                setUsers(data.users ?? []);
                setPagination(data.pagination ?? initialPagination);
            } catch (err) {
                if (controller.signal.aborted) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : "Something went wrong.",
                );
                setUsers([]);
                setPagination(initialPagination);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadUsers();

        return () => controller.abort();
    }, [
        accessToken,
        page,
        search,
        roleFilter,
        statusFilter,
        refreshKey,
    ]);

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    }

    function handleRoleChange(value: string) {
        setPage(1);
        setRoleFilter(value);
    }

    function handleStatusChange(value: string) {
        setPage(1);
        setStatusFilter(value);
    }

    function clearFilters() {
        setSearchInput("");
        setSearch("");
        setRoleFilter("");
        setStatusFilter("");
        setPage(1);
    }

    const hasFilters = Boolean(search || roleFilter || statusFilter);


    async function confirmStatusChange() {
        if (!pendingAction || !accessToken || actionLoading) return;

        const { user, status } = pendingAction;

        setActionLoading(true);
        setActionError("");
        setActionSuccess("");

        try {
            const response = await fetch(
                `/api/admin/users/${encodeURIComponent(user.id)}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to update account status.",
                );
            }

            setActionSuccess(
                `${user.name}'s account status is now ${status}.`,
            );

            setPendingAction(null);
            setRefreshKey((current) => current + 1);
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong while updating the account.",
            );
        } finally {
            setActionLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    User Management
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                    View, search, and filter PropertyHub accounts.
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
                        placeholder="Search by name or email..."
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

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <select
                        value={roleFilter}
                        onChange={(event) =>
                            handleRoleChange(event.target.value)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="">All roles</option>
                        <option value="USER">User</option>
                        <option value="OWNER">Owner</option>
                        <option value="ADMIN">Admin</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            handleStatusChange(event.target.value)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="">All statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="BANNED">Banned</option>
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
                        onClick={() => setPage((current) => current)}
                        className="ml-2 font-semibold underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-1 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="font-semibold text-gray-900">
                        All Users
                    </h2>
                    <p className="text-sm text-gray-500">
                        {loading
                            ? "Loading users..."
                            : `${pagination.total} user(s) found`}
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">
                                    User
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Phone
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Role
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Status
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Registered
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
                                        colSpan={5}
                                        className="px-4 py-12 text-center text-gray-500"
                                    >
                                        Loading users...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-12 text-center text-gray-500"
                                    >
                                        Users could not be loaded.
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-12 text-center text-gray-500"
                                    >
                                        No users found. Try changing your
                                        search or filters.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-gray-900">
                                                {user.name}
                                            </div>
                                            <div className="mt-1 text-gray-500">
                                                {user.email}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-gray-600">
                                            {user.phone || "—"}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                                {user.role}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(user.status)}`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-gray-600">
                                            {formatDate(user.createdAt)}
                                        </td>


                                        <td className="px-4 py-4">
                                            {user.role === "ADMIN" ? (
                                                <span className="text-xs text-gray-400">
                                                    Protected account
                                                </span>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {user.status !== "ACTIVE" && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setPendingAction({
                                                                    user,
                                                                    status: "ACTIVE",
                                                                })
                                                            }
                                                            disabled={actionLoading}
                                                            className="rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                                                        >
                                                            Reactivate
                                                        </button>
                                                    )}

                                                    {user.status === "ACTIVE" && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setPendingAction({
                                                                    user,
                                                                    status: "SUSPENDED",
                                                                })
                                                            }
                                                            disabled={actionLoading}
                                                            className="rounded-md bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-800 hover:bg-yellow-100 disabled:opacity-50"
                                                        >
                                                            Suspend
                                                        </button>
                                                    )}

                                                    {user.status !== "BANNED" && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setPendingAction({
                                                                    user,
                                                                    status: "BANNED",
                                                                })
                                                            }
                                                            disabled={actionLoading}
                                                            className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                                                        >
                                                            Ban
                                                        </button>
                                                    )}
                                                </div>
                                            )}
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
                            disabled={
                                loading ||
                                page <= 1 ||
                                pagination.totalPages === 0
                            }
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <button
                            type="button"
                            onClick={() => setPage((current) => current + 1)}
                            disabled={
                                loading ||
                                page >= pagination.totalPages
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
                        aria-labelledby="status-dialog-title"
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2
                            id="status-dialog-title"
                            className="text-lg font-semibold text-gray-900"
                        >
                            Confirm account status change
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-gray-600">
                            Change{" "}
                            <strong>{pendingAction.user.name}</strong>'s account
                            status to{" "}
                            <strong>{pendingAction.status}</strong>?
                        </p>

                        {pendingAction.status !== "ACTIVE" && (
                            <p className="mt-2 text-sm text-gray-500">
                                Their existing refresh-token sessions will be revoked.
                            </p>
                        )}

                        {pendingAction.status === "ACTIVE" && (
                            <p className="mt-2 text-sm text-gray-500">
                                The user may need to log in again to access their account.
                            </p>
                        )}

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
                                onClick={confirmStatusChange}
                                disabled={actionLoading}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {actionLoading ? "Updating..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
