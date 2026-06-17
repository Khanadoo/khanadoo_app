"use client";

import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const {
        user,
        logout,
        isAuthenticated,
    } = useAuth();

    return (
        <header className="h-16 border-b bg-white">
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
                <Link
                    href="/"
                    className="text-xl font-bold"
                >
                    PropertyHub
                </Link>

                <nav className="flex items-center gap-6">
                    <Link href="/">
                        Home
                    </Link>

                    <Link href="/properties">
                        Properties
                    </Link>

                    {!isAuthenticated ? (
                        <>
                            <Link href="/login">
                                Login
                            </Link>

                            <Link href="/register">
                                Register
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard">
                                Dashboard
                            </Link>

                            <Link href="/profile">
                                Profile
                            </Link>

                            <button
                                onClick={logout}
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