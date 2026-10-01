"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const commonLinks = [
    {
        label: "Dashboard",
        href: "/dashboard",
    },
    {
        label: "Properties",
        href: "/properties",
    },
    {
        label: "My Enquiries",
        href: "/dashboard/enquiries",
    },
    {
        label: "Profile",
        href: "/profile",
    },
];

const ownerLinks = [
    {
        label: "My Properties",
        href: "/owner/properties",
    },
    {
        label: "Add Property",
        href: "/properties/new",
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    const links =
        user?.role === "OWNER"
            ? [
                commonLinks[0],
                commonLinks[1],
                ...ownerLinks,
                commonLinks[2],
                commonLinks[3],
            ]
            : commonLinks;

    return (
        <aside className="surface h-fit rounded-[2rem] p-4">
            <div className="rounded-[1.5rem] bg-[var(--panel-strong)] p-5">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                    Signed in as
                </p>

                <p className="mt-2 truncate text-lg font-semibold">
                    {user?.name || "User"}
                </p>

                <p className="mt-1 text-sm capitalize text-[var(--muted)]">
                    {user?.role?.toLowerCase() || "user"}
                </p>
            </div>

            <nav className="mt-5 space-y-1.5">
                {links.map((link) => {
                    const isActive =
                        pathname === link.href ||
                        pathname.startsWith(`${link.href}/`);

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-[var(--brand)] text-white shadow-sm"
                                    : "text-[var(--muted)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]",
                            )}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}