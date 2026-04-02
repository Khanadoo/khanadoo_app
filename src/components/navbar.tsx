"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/providers/app-provider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/products", label: "Products" },
  { href: "/cart", label: "Cart" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, cartCount, logout, hydrated } = useAppContext();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(248,244,238,0.82)] backdrop-blur-xl">
      <div className="page-shell flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand)] text-lg font-bold text-white">
            K
          </div>
          <div>
            <p className="display-font text-2xl font-semibold">Khanadoo</p>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Campus food, delivered smarter
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === link.href
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  active
                    ? "bg-white text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]",
                )}
              >
                {link.label}
                {link.href === "/cart" && cartCount > 0 ? ` (${cartCount})` : ""}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {hydrated && user ? (
            <>
              <Link href="/home" className={buttonStyles({ variant: "secondary", size: "md" })}>
                {user.role === "student"
                  ? "Student Home"
                  : user.role === "vendor"
                    ? "Vendor Desk"
                    : "Admin Panel"}
              </Link>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className={buttonStyles({ variant: "ghost", size: "md" })}
              >
                Logout
              </motion.button>
            </>
          ) : (
            <Link href="/login" className={buttonStyles({ variant: "primary", size: "md" })}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
