"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/providers/app-provider";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppContext();

  const items = [
    { href: "/home", label: "Overview" },
    { href: "/account", label: "Account Centre" },
    { href: "/menu", label: "Browse Menu" },
    { href: "/cart", label: "Cart" },
  ];

  return (
    <aside className="surface h-fit rounded-[2rem] p-4">
      <div className="rounded-[1.5rem] bg-[var(--panel-strong)] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Signed in as</p>
        <p className="mt-2 text-lg font-semibold">{user?.name}</p>
        <p className="text-sm capitalize text-[var(--muted)]">{user?.role}</p>
      </div>
      <nav className="mt-4 space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-2xl px-4 py-3 text-sm font-medium transition",
              pathname === item.href
                ? "bg-[var(--brand)] text-white"
                : "text-[var(--muted)] hover:bg-white hover:text-[var(--foreground)]",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
