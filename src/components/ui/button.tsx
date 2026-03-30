"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg" | "icon";
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center rounded-2xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-[rgba(199,123,82,0.25)]",
    variant === "primary" &&
      "bg-[var(--brand)] text-white shadow-[0_18px_40px_rgba(199,123,82,0.28)] hover:bg-[var(--brand-deep)]",
    variant === "secondary" &&
      "border border-[var(--line)] bg-white/80 text-[var(--foreground)] hover:bg-[var(--panel-strong)]",
    variant === "ghost" && "text-[var(--muted)] hover:bg-white/70 hover:text-[var(--foreground)]",
    size === "lg" && "h-13 px-6 text-sm",
    size === "md" && "h-11 px-5 text-sm",
    size === "icon" && "h-11 w-11 text-lg",
    className,
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {children}
    </motion.button>
  );
}
