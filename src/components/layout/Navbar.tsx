"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import NotificationDropdown from "@/components/notifications/NotificationDropDown";

export default function Navbar() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    const { logout, isAuthenticated } = useAuth();

    const navLinks = [
        { label: "Home", href: "/" },
        { label: "Properties", href: "/properties" },
    ];

    const isActive = (href: string) =>
        pathname === href ||
        (href !== "/" && pathname.startsWith(`${href}/`));

    const linkClasses = (active: boolean) =>
        cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            active
                ? "bg-[var(--brand)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]",
        );

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = () => {
        closeMenu();
        logout();
    };

    return (
        <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--background)]/95 backdrop-blur-xl">
            <div className="page-shell flex min-h-16 items-center justify-between gap-3">
                <Link
                    href="/"
                    onClick={closeMenu}
                    className="display-font shrink-0 text-xl font-semibold tracking-tight sm:text-2xl"
                >
                    PropertyHub
                </Link>

                {/* Desktop navigation */}
                <nav
                    aria-label="Main navigation"
                    className="hidden items-center gap-1 md:flex"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            aria-current={isActive(link.href) ? "page" : undefined}
                            className={linkClasses(isActive(link.href))}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {!isAuthenticated ? (
                        <>
                            <Link
                                href="/login"
                                className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-lg bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-deep)]"
                            >
                                Register
                            </Link>
                        </>
                    ) : (
                        <>
                            <NotificationDropdown />
                            <Link
                                href="/dashboard"
                                aria-current={
                                    pathname.startsWith("/dashboard") ? "page" : undefined
                                }
                                className={linkClasses(pathname.startsWith("/dashboard"))}
                            >
                                Dashboard
                            </Link>
                            <button
                                type="button"
                                onClick={logout}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </nav>

                {/* Mobile menu toggle */}
                <button
                    type="button"
                    className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--panel-strong)] md:hidden"
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    aria-controls="mobile-navigation"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    {menuOpen ? "Close" : "Menu"}
                </button>
            </div>

            {/* Mobile navigation panel */}
            {menuOpen && (
                <nav
                    id="mobile-navigation"
                    aria-label="Mobile navigation"
                    className="border-t border-[var(--line)] bg-[var(--panel)] md:hidden"
                >
                    <div className="page-shell flex flex-col gap-1 py-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={closeMenu}
                                aria-current={isActive(link.href) ? "page" : undefined}
                                className={linkClasses(isActive(link.href))}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {!isAuthenticated ? (
                            <>
                                <Link
                                    href="/login"
                                    onClick={closeMenu}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={closeMenu}
                                    className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
                                >
                                    Register
                                </Link>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center px-4 py-2">
                                    <NotificationDropdown />
                                </div>
                                <Link
                                    href="/dashboard"
                                    onClick={closeMenu}
                                    aria-current={
                                        pathname.startsWith("/dashboard") ? "page" : undefined
                                    }
                                    className={linkClasses(pathname.startsWith("/dashboard"))}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </nav>
            )}
        </header>
    );
}