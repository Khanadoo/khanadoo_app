"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FoodCard } from "@/components/food-card";
import { SectionHeading } from "@/components/section-heading";
import { buttonStyles } from "@/components/ui/button";
import { foodItems, studentBenefits } from "@/lib/mock-data";

export function LandingPage() {
  return (
    <div className="pb-16">
      <section className="page-shell grid min-h-[calc(100vh-5rem)] items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-8"
        >
          <div className="inline-flex rounded-full border border-[var(--line)] bg-white/75 px-4 py-2 text-sm font-medium text-[var(--muted)]">
            Student-first campus delivery for central university life
          </div>
          <div className="space-y-5">
            <h1 className="display-font max-w-2xl text-5xl leading-tight font-semibold sm:text-6xl">
              Khanadoo makes campus food feel quick, calm, and reliable.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[var(--muted)]">
              Order from trusted campus vendors, reorder your usuals in seconds, and
              keep late-study cravings organised without the delivery chaos.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/menu" className={buttonStyles({ variant: "primary", size: "lg" })}>
              Explore Menu
            </Link>
            <Link href="/login" className={buttonStyles({ variant: "secondary", size: "lg" })}>
              Login
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["14 min", "Average campus drop"],
              ["24", "Verified vendors"],
              ["4.8/5", "Student satisfaction"],
            ].map(([value, label]) => (
              <div key={label} className="surface rounded-[2rem] p-5">
                <p className="text-3xl font-semibold">{value}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="surface relative overflow-hidden rounded-[2.5rem] p-6"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(199,123,82,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(140,160,139,0.18),transparent_30%)]" />
          <div className="relative space-y-5">
            <div className="rounded-[2rem] bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-[var(--muted)]">Trending around the hostels</p>
              <div className="mt-4 grid gap-3">
                {foodItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-[1.5rem] bg-[var(--panel)] px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-[var(--muted)]">{item.vendor}</p>
                    </div>
                    <div className="rounded-full bg-[var(--panel-strong)] px-3 py-2 text-sm font-semibold">
                      {item.rating}★
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[2rem] bg-[var(--brand)] p-5 text-white">
                <p className="text-sm uppercase tracking-[0.16em] text-white/75">Quick reorder</p>
                <p className="mt-4 text-3xl font-semibold">2 taps</p>
                <p className="mt-2 text-sm text-white/80">Built for daily campus routines and lab breaks.</p>
              </div>
              <div className="rounded-[2rem] bg-[var(--sage)] p-5 text-white">
                <p className="text-sm uppercase tracking-[0.16em] text-white/75">Order visibility</p>
                <p className="mt-4 text-3xl font-semibold">Live ETA</p>
                <p className="mt-2 text-sm text-white/80">See prep and delivery flow without constant follow-up.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="page-shell section-grid py-12">
        <SectionHeading
          eyebrow="Featured"
          title="Designed for the meals students actually order."
          description="A tight, campus-aware menu with dependable vendors, comfort food, and quick snack picks between classes."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {foodItems.slice(0, 3).map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="page-shell section-grid py-12">
        <SectionHeading
          eyebrow="How It Works"
          title="A simple flow that fits class schedules."
          description="Khanadoo keeps the ordering journey light, quick, and predictable from browse to doorstep."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["01", "Browse", "Explore curated campus menus and search by craving, category, or budget."],
            ["02", "Order", "Add items, tweak quantities, and review a clean cart before checkout."],
            ["03", "Deliver", "Track active orders and receive them across hostels, libraries, and blocks."],
          ].map(([count, title, copy]) => (
            <motion.div
              key={title}
              whileHover={{ y: -4 }}
              className="surface rounded-[2rem] p-6"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-deep)]">
                {count}
              </p>
              <h3 className="mt-4 text-2xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="page-shell section-grid py-12">
        <SectionHeading
          eyebrow="Student Benefits"
          title="Built around campus rhythms, not generic city delivery."
          description="The interface stays clean and helpful while the experience remains tuned for student needs."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {studentBenefits.map((benefit) => (
            <div key={benefit} className="surface rounded-[2rem] p-6">
              <p className="text-base leading-7 text-[var(--foreground)]">{benefit}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
