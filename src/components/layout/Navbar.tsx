"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const pathname = usePathname();

    const {
        logout,
        isAuthenticated,
    } = useAuth();

    const navLinks = [
        {
            label: "Home",
            href: "/",
        },
        {
            label: "Properties",
            href: "/properties",
        },
    ];

    return (
        <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(248,244,238,0.88)] backdrop-blur-xl">
            <div className="page-shell flex h-18 items-center justify-between">
                <Link
                    href="/"
                    className="display-font text-2xl font-semibold tracking-tight"
                >
                    PropertyHub
                </Link>

                <nav className="flex items-center gap-2">
                    {navLinks.map((link) => {
                        const isActive =
                            pathname === link.href ||
                            (link.href !== "/" &&
                                pathname.startsWith(`${link.href}/`));

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "rounded-full px-4 py-2 text-sm font-medium transition",
                                    isActive
                                        ? "bg-[var(--brand)] text-white"
                                        : "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]",
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}

                    {!isAuthenticated ? (
                        <>
                            <Link
                                href="/login"
                                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
                            >
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-medium text-white transition hover:bg-[var(--brand-deep)]"
                            >
                                Register
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/dashboard"
                                className={cn(
                                    "rounded-full px-4 py-2 text-sm font-medium transition",
                                    pathname.startsWith("/dashboard")
                                        ? "bg-[var(--brand)] text-white"
                                        : "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]",
                                )}
                            >
                                Dashboard
                            </Link>

                            <button
                                onClick={logout}
                                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}