"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/providers/app-provider";
import type { UserRole } from "@/lib/types";

const roles: Array<{ role: UserRole; title: string; copy: string }> = [
  {
    role: "student",
    title: "Student",
    copy: "Browse food, reorder favourites, and track active deliveries.",
  },
  {
    role: "vendor",
    title: "Vendor",
    copy: "Manage active orders, menu visibility, and campus sales snapshots.",
  },
  {
    role: "admin",
    title: "Admin",
    copy: "Approve vendors, review platform metrics, and monitor user activity.",
  },
];

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, hydrated } = useAppContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (hydrated && user) {
      router.replace("/home");
    }
  }, [hydrated, router, user]);

  const redirect = searchParams.get("redirect") || "/home";

  return (
    <div className="page-shell grid min-h-[calc(100vh-5rem)] items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand-deep)]">
          Mock authentication
        </p>
        <h1 className="display-font text-5xl font-semibold leading-tight">
          Choose a role and step into your Khanadoo workspace.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-[var(--muted)]">
          This demo keeps authentication entirely on the frontend using local storage and
          role-based routing.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface rounded-[2.5rem] p-6 sm:p-8"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {roles.map((entry) => (
            <button
              key={entry.role}
              type="button"
              onClick={() => setSelectedRole(entry.role)}
              className={`rounded-[1.5rem] p-4 text-left transition ${
                selectedRole === entry.role
                  ? "bg-[var(--brand)] text-white"
                  : "bg-white text-[var(--foreground)]"
              }`}
            >
              <p className="text-lg font-semibold">{entry.title}</p>
              <p
                className={`mt-2 text-sm leading-6 ${
                  selectedRole === entry.role ? "text-white/80" : "text-[var(--muted)]"
                }`}
              >
                {entry.copy}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name (optional)"
            className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm outline-none"
          />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email (optional)"
            className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm outline-none"
          />
        </div>

        <Button
          size="lg"
          className="mt-6 w-full"
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              login(selectedRole, name, email);
              router.push(redirect);
            })
          }
        >
          {isPending ? "Signing in..." : `Continue as ${selectedRole}`}
        </Button>
      </motion.div>
    </div>
  );
}
