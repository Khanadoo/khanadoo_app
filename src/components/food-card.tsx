"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, buttonStyles } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { FoodItem } from "@/lib/types";
import { useAppContext } from "@/providers/app-provider";

export function FoodCard({
  item,
  showVendor = false,
  actionLabel = "Add to Cart",
  onSecondaryAction,
}: {
  item: FoodItem;
  showVendor?: boolean;
  actionLabel?: string;
  onSecondaryAction?: () => void;
}) {
  const { addToCart } = useAppContext();

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.18 }}
      className="surface overflow-hidden rounded-[2rem]"
    >
      <div className={cn("relative h-52 bg-gradient-to-br", item.accent)}>
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
          {item.category}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="text-sm leading-6 text-[var(--muted)]">{item.description}</p>
          </div>
          <div className="rounded-full bg-[var(--panel-strong)] px-3 py-1 text-sm font-semibold">
            {item.rating}★
          </div>
        </div>
        {showVendor ? (
          <div className="flex flex-wrap gap-2 text-xs font-medium text-[var(--muted)]">
            <span className="rounded-full bg-white px-3 py-2">{item.vendor}</span>
            <span className="rounded-full bg-white px-3 py-2">{item.availability}</span>
            <span className="rounded-full bg-white px-3 py-2">{item.prepTime}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xl font-semibold">{formatCurrency(item.price)}</p>
            <p className="text-sm text-[var(--muted)]">Campus delivery in {item.prepTime}</p>
          </div>
          <div className="flex items-center gap-2">
            {onSecondaryAction ? (
              <button
                type="button"
                onClick={onSecondaryAction}
                className={buttonStyles({ variant: "ghost", size: "md" })}
              >
                Quick view
              </button>
            ) : (
              <Link
                href={`/products/${item.id}`}
                className={buttonStyles({ variant: "ghost", size: "md" })}
              >
                Details
              </Link>
            )}
            <Button onClick={() => addToCart(item.id)}>{actionLabel}</Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
