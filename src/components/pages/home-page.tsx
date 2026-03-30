"use client";

import { SectionHeading } from "@/components/section-heading";
import { foodItems, mockOrders, platformStats } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useAppContext } from "@/providers/app-provider";

export function HomePage() {
  const { user } = useAppContext();

  if (!user) {
    return null;
  }

  if (user.role === "student") {
    return (
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Student Home"
          title={`Welcome back, ${user.name.split(" ")[0]}.`}
          description="Your quick reorder lane, recommended picks, and active campus deliveries are all in one calm dashboard."
        />
        <div className="grid gap-5 xl:grid-cols-3">
          {foodItems.slice(0, 3).map((item) => (
            <div key={item.id} className="surface rounded-[2rem] p-5">
              <p className="text-sm text-[var(--muted)]">Recommended</p>
              <h3 className="mt-3 text-xl font-semibold">{item.name}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{item.vendor}</p>
              <p className="mt-4 text-lg font-semibold">{formatCurrency(item.price)}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="surface rounded-[2rem] p-6">
            <h3 className="text-xl font-semibold">Quick reorder</h3>
            <div className="mt-4 space-y-3">
              {mockOrders.slice(1).map((order) => (
                <div key={order.id} className="rounded-[1.5rem] bg-[var(--panel-strong)] p-4">
                  <p className="font-semibold">{order.items.join(" + ")}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{order.vendor}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="surface rounded-[2rem] p-6">
            <h3 className="text-xl font-semibold">Active orders</h3>
            <div className="mt-4 space-y-3">
              {mockOrders.slice(0, 2).map((order) => (
                <div key={order.id} className="rounded-[1.5rem] bg-[var(--panel-strong)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{order.id}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">{order.items.join(", ")}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">ETA: {order.eta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === "vendor") {
    return (
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Vendor Dashboard"
          title="Track kitchen flow and menu performance."
          description="A simple vendor desk for today's orders, active prep queue, and lightweight menu management."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total orders", "126"],
            ["Active orders", "18"],
            ["Avg. prep time", "13 min"],
            ["Today's revenue", "₹12.4k"],
          ].map(([label, value]) => (
            <div key={label} className="surface rounded-[2rem] p-5">
              <p className="text-sm text-[var(--muted)]">{label}</p>
              <p className="mt-3 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface rounded-[2rem] p-6">
            <h3 className="text-xl font-semibold">Menu management</h3>
            <div className="mt-4 space-y-3">
              {foodItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-[1.5rem] bg-[var(--panel-strong)] p-4"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-[var(--muted)]">{item.availability}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="rounded-full bg-white px-3 py-2 text-sm">
                      Edit
                    </button>
                    <button type="button" className="rounded-full bg-white px-3 py-2 text-sm">
                      Toggle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="surface rounded-[2rem] p-6">
            <h3 className="text-xl font-semibold">Analytics snapshot</h3>
            <div className="mt-4 space-y-3">
              {[
                ["Most ordered item", "Hostel Comfort Thali"],
                ["Repeat customers", "41%"],
                ["Peak slot", "7 PM - 9 PM"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.5rem] bg-[var(--panel-strong)] p-4">
                  <p className="text-sm text-[var(--muted)]">{label}</p>
                  <p className="mt-2 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admin Panel"
        title="Oversee the platform from one clean control layer."
        description="Review users, vendor approvals, and day-level platform performance without leaving the dashboard."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {platformStats.map((stat) => (
          <div key={stat.label} className="surface rounded-[2rem] p-5">
            <p className="text-sm text-[var(--muted)]">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="surface rounded-[2rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold">Manage users</h3>
          <div className="flex gap-2">
            <button type="button" className="rounded-full bg-[var(--panel-strong)] px-4 py-2 text-sm">
              All
            </button>
            <button type="button" className="rounded-full bg-[var(--panel-strong)] px-4 py-2 text-sm">
              Students
            </button>
            <button type="button" className="rounded-full bg-[var(--panel-strong)] px-4 py-2 text-sm">
              Vendors
            </button>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[var(--muted)]">
              <tr>
                <th className="pb-3">Name</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Aarav Singh", "Student", "Active", "View"],
                ["Mess Collective", "Vendor", "Pending approval", "Approve"],
                ["Brew Block", "Vendor", "Active", "Review"],
              ].map(([name, role, status, action]) => (
                <tr key={name} className="border-t border-[var(--line)]">
                  <td className="py-4 font-medium">{name}</td>
                  <td className="py-4 text-[var(--muted)]">{role}</td>
                  <td className="py-4 text-[var(--muted)]">{status}</td>
                  <td className="py-4">
                    <button type="button" className="rounded-full bg-[var(--panel-strong)] px-4 py-2">
                      {action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
