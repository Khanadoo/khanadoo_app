"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const adminLinks = [
    { label: "Overview", href: "/admin" },
    { label: "User Management", href: "/admin/users" },
    { label: "Property Moderation", href: "/admin/properties" },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4">
                        <Link
                            href="/admin"
                            className="text-xl font-bold text-gray-900"
                        >
                            PropertyHub Admin
                        </Link>

                        <span className="text-sm text-gray-600">
                            {user?.name ?? "Administrator"}
                        </span>
                    </div>

                    <nav className="flex flex-wrap gap-2">
                        {adminLinks.map((link) => {
                            const isActive =
                                link.href === "/admin"
                                    ? pathname === "/admin"
                                    : pathname.startsWith(link.href);

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${isActive
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}

                        <Link
                            href="/"
                            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                            Back to site
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}