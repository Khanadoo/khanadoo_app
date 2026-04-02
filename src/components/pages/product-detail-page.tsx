"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, buttonStyles } from "@/components/ui/button";
import type { FoodItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAppContext } from "@/providers/app-provider";

export function ProductDetailPage({ item }: { item: FoodItem }) {
  const { addToCart } = useAppContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-shell grid gap-8 py-10 lg:grid-cols-[1fr_0.95fr]"
    >
      <div className={`relative min-h-[380px] overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${item.accent}`}>
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      <div className="surface flex flex-col rounded-[2.5rem] p-8">
        <div className="flex flex-wrap gap-2 text-xs font-medium text-[var(--muted)]">
          <span className="rounded-full bg-[var(--panel-strong)] px-3 py-2">{item.category}</span>
          <span className="rounded-full bg-[var(--panel-strong)] px-3 py-2">{item.vendor}</span>
          <span className="rounded-full bg-[var(--panel-strong)] px-3 py-2">{item.availability}</span>
        </div>
        <h1 className="display-font mt-6 text-4xl font-semibold">{item.name}</h1>
        <p className="mt-4 text-base leading-8 text-[var(--muted)]">{item.description}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-[var(--panel-strong)] p-4">
            <p className="text-sm text-[var(--muted)]">Price</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(item.price)}</p>
          </div>
          <div className="rounded-[1.5rem] bg-[var(--panel-strong)] p-4">
            <p className="text-sm text-[var(--muted)]">Rating</p>
            <p className="mt-2 text-2xl font-semibold">{item.rating}★</p>
          </div>
          <div className="rounded-[1.5rem] bg-[var(--panel-strong)] p-4">
            <p className="text-sm text-[var(--muted)]">Delivery</p>
            <p className="mt-2 text-2xl font-semibold">{item.prepTime}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={() => addToCart(item.id)} size="lg">
            Add to Cart
          </Button>
          <Link href="/products" className={buttonStyles({ variant: "secondary", size: "lg" })}>
            Back to Products
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
