"use client";

import { useDeferredValue, useState } from "react";
import { motion } from "framer-motion";
import { FoodCard } from "@/components/food-card";
import { SectionHeading } from "@/components/section-heading";
import { foodItems } from "@/lib/mock-data";
import type { FoodCategory } from "@/lib/types";

const categories: Array<FoodCategory | "All"> = ["All", "Veg", "Non-Veg", "Snacks", "Drinks"];
const priceRanges = [
  { label: "All prices", min: 0, max: Number.POSITIVE_INFINITY },
  { label: "Under ₹100", min: 0, max: 100 },
  { label: "₹100 - ₹150", min: 100, max: 150 },
  { label: "₹150+", min: 150, max: Number.POSITIVE_INFINITY },
];

export function MenuPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [range, setRange] = useState(priceRanges[0].label);
  const deferredSearch = useDeferredValue(search);

  const activeRange = priceRanges.find((entry) => entry.label === range) ?? priceRanges[0];

  const filteredItems = foodItems.filter((item) => {
    const matchesSearch = [item.name, item.vendor, item.description]
      .join(" ")
      .toLowerCase()
      .includes(deferredSearch.toLowerCase());
    const matchesCategory = category === "All" || item.category === category;
    const matchesPrice = item.price >= activeRange.min && item.price <= activeRange.max;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="page-shell space-y-10 py-10">
      <SectionHeading
        eyebrow="Menu"
        title="Curated campus meals with quick filters."
        description="Search by craving, narrow the budget, and add your picks to cart with a smooth, lightweight flow."
      />

      <div className="surface rounded-[2rem] p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search food, vendor, or vibe"
            className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setCategory(entry)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === entry
                    ? "bg-[var(--brand)] text-white"
                    : "bg-white text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {entry}
              </button>
            ))}
          </div>
          <select
            value={range}
            onChange={(event) => setRange(event.target.value)}
            className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm outline-none"
          >
            {priceRanges.map((entry) => (
              <option key={entry.label}>{entry.label}</option>
            ))}
          </select>
        </div>
      </div>

      <motion.div layout className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </motion.div>
    </div>
  );
}
