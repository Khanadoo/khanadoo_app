"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { motion } from "framer-motion";
import { FoodCard } from "@/components/food-card";
import { Modal } from "@/components/ui/modal";
import { SectionHeading } from "@/components/section-heading";
import { Button, buttonStyles } from "@/components/ui/button";
import { foodItems } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useAppContext } from "@/providers/app-provider";

const sortOptions = [
  { value: "popularity", label: "Popularity" },
  { value: "price", label: "Price" },
  { value: "rating", label: "Rating" },
] as const;

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>("popularity");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const { addToCart } = useAppContext();

  const selectedItem = foodItems.find((item) => item.id === selectedId) ?? null;

  const items = foodItems
    .filter((item) =>
      [item.name, item.vendor, item.availability, item.description]
        .join(" ")
        .toLowerCase()
        .includes(deferredSearch.toLowerCase()),
    )
    .sort((left, right) => {
      if (sortBy === "price") {
        return left.price - right.price;
      }
      if (sortBy === "rating") {
        return right.rating - left.rating;
      }
      return right.popularity - left.popularity;
    });

  return (
    <div className="page-shell space-y-10 py-10">
      <SectionHeading
        eyebrow="Products"
        title="Detailed listings for fast campus decision-making."
        description="Compare vendors, availability, ratings, and price before opening a quick view or full detail page."
      />

      <div className="surface rounded-[2rem] p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search vendors or product details"
            className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm outline-none"
          />
          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as (typeof sortOptions)[number]["value"])
            }
            className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <motion.div layout className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <FoodCard
            key={item.id}
            item={item}
            showVendor
            actionLabel="Add"
            onSecondaryAction={() => setSelectedId(item.id)}
          />
        ))}
      </motion.div>

      <Modal
        open={Boolean(selectedItem)}
        onClose={() => setSelectedId(null)}
        title={selectedItem?.name ?? "Product details"}
      >
        {selectedItem ? (
          <div className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
            <div
              className={`relative h-64 overflow-hidden rounded-[2rem] bg-gradient-to-br ${selectedItem.accent}`}
            >
              <Image
                src={selectedItem.image}
                alt={selectedItem.name}
                fill
                className="object-cover"
                sizes="280px"
              />
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-xs font-medium text-[var(--muted)]">
                <span className="rounded-full bg-[var(--panel-strong)] px-3 py-2">
                  {selectedItem.vendor}
                </span>
                <span className="rounded-full bg-[var(--panel-strong)] px-3 py-2">
                  {selectedItem.availability}
                </span>
                <span className="rounded-full bg-[var(--panel-strong)] px-3 py-2">
                  {selectedItem.prepTime}
                </span>
              </div>
              <p className="text-base leading-7 text-[var(--muted)]">{selectedItem.description}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.5rem] bg-[var(--panel-strong)] p-4">
                  <p className="text-sm text-[var(--muted)]">Price</p>
                  <p className="mt-2 text-xl font-semibold">{formatCurrency(selectedItem.price)}</p>
                </div>
                <div className="rounded-[1.5rem] bg-[var(--panel-strong)] p-4">
                  <p className="text-sm text-[var(--muted)]">Rating</p>
                  <p className="mt-2 text-xl font-semibold">{selectedItem.rating}★</p>
                </div>
                <div className="rounded-[1.5rem] bg-[var(--panel-strong)] p-4">
                  <p className="text-sm text-[var(--muted)]">Popularity</p>
                  <p className="mt-2 text-xl font-semibold">{selectedItem.popularity}%</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => addToCart(selectedItem.id)}>Add to Cart</Button>
                <Link
                  href={`/products/${selectedItem.id}`}
                  className={buttonStyles({ variant: "secondary", size: "md" })}
                >
                  Open full page
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
