"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { mockOrders } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useAppContext } from "@/providers/app-provider";

export function AccountPage() {
  const { user, logout } = useAppContext();
  const [tab, setTab] = useState<"orders" | "settings">("orders");

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="surface rounded-[2rem] p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--brand-deep)]">Account Centre</p>
        <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{user.name}</h1>
            <p className="mt-2 text-[var(--muted)]">{user.email}</p>
            <p className="mt-1 text-sm capitalize text-[var(--muted)]">{user.role}</p>
          </div>
          <Button onClick={logout} variant="secondary">
            Logout
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { key: "orders", label: "Orders" },
          { key: "settings", label: "Settings" },
        ].map((entry) => (
          <button
            key={entry.key}
            type="button"
            onClick={() => setTab(entry.key as "orders" | "settings")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === entry.key ? "bg-[var(--brand)] text-white" : "bg-white text-[var(--muted)]"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === "orders" ? (
        <div className="grid gap-4">
          {mockOrders.map((order) => (
            <div key={order.id} className="surface rounded-[2rem] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{order.id}</p>
                  <p className="text-sm text-[var(--muted)]">{order.placedAt}</p>
                </div>
                <span className="rounded-full bg-[var(--panel-strong)] px-3 py-2 text-sm font-medium">
                  {order.status}
                </span>
              </div>
              <p className="mt-4 text-sm text-[var(--muted)]">{order.items.join(", ")}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--muted)]">{order.vendor}</p>
                <p className="font-semibold">{formatCurrency(order.total)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="surface rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold">Settings</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["Email notifications", "Enabled"],
              ["Preferred delivery spot", "Hostel Gate 2"],
              ["Default payment mode", "Campus wallet"],
              ["Theme", "Soft daylight"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.5rem] bg-[var(--panel-strong)] p-4">
                <p className="text-sm text-[var(--muted)]">{label}</p>
                <p className="mt-2 font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
