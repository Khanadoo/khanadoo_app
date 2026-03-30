"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button, buttonStyles } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { formatCurrency } from "@/lib/utils";
import { useAppContext } from "@/providers/app-provider";

export function CartPage() {
  const { cartItemsDetailed, subtotal, addToCart, decreaseItem, removeFromCart, clearCart } =
    useAppContext();
  const deliveryFee = subtotal > 0 ? 24 : 0;
  const total = subtotal + deliveryFee;

  if (cartItemsDetailed.length === 0) {
    return (
      <div className="page-shell flex min-h-[70vh] items-center py-10">
        <div className="surface w-full rounded-[2.5rem] p-8 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--brand-deep)]">Cart</p>
          <h1 className="display-font mt-4 text-4xl font-semibold">Your cart is still empty.</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[var(--muted)]">
            Add a few campus favourites and Khanadoo will keep the checkout smooth.
          </p>
          <Link href="/menu" className={`${buttonStyles({ variant: "primary", size: "lg" })} mt-8`}>
            Explore Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell grid gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Cart"
          title="Review your order before the dummy checkout."
          description="Adjust quantities, keep the total visible, and move through a clean front-end cart flow."
        />
        {cartItemsDetailed.map(({ item, quantity }) => (
          <motion.div
            key={item.id}
            layout
            className="surface flex flex-col justify-between gap-5 rounded-[2rem] p-5 sm:flex-row sm:items-center"
          >
            <div>
              <p className="text-lg font-semibold">{item.name}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{item.vendor}</p>
              <p className="mt-3 text-sm text-[var(--muted)]">{formatCurrency(item.price)} each</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-[var(--panel-strong)] p-1">
                <button
                  type="button"
                  onClick={() => decreaseItem(item.id)}
                  className="h-9 w-9 rounded-full bg-white text-lg"
                >
                  -
                </button>
                <span className="min-w-10 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => addToCart(item.id)}
                  className="h-9 w-9 rounded-full bg-white text-lg"
                >
                  +
                </button>
              </div>
              <p className="min-w-20 text-right text-lg font-semibold">
                {formatCurrency(item.price * quantity)}
              </p>
              <button
                type="button"
                onClick={() => removeFromCart(item.id)}
                className={buttonStyles({ variant: "ghost", size: "md" })}
              >
                Remove
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <aside className="surface h-fit rounded-[2rem] p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--brand-deep)]">Summary</p>
        <div className="mt-6 space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">Delivery fee</span>
            <span className="font-semibold">{formatCurrency(deliveryFee)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--line)] pt-4 text-base">
            <span>Total</span>
            <span className="font-semibold">{formatCurrency(total)}</span>
          </div>
        </div>
        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={() => {
            clearCart();
            window.alert("Frontend-only checkout complete. Your mock order is on its way.");
          }}
        >
          Checkout
        </Button>
      </aside>
    </div>
  );
}
