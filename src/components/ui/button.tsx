import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export default function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-control)] font-semibold transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-deep)]",
        "disabled:cursor-not-allowed disabled:opacity-50",

        variant === "primary" &&
        "bg-[var(--brand)] text-white hover:bg-[var(--brand-deep)]",

        variant === "secondary" &&
        "border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--foreground)] hover:bg-[var(--sand)]",

        variant === "danger" &&
        "bg-red-700 text-white hover:bg-red-800",

        variant === "outline" &&
        "border border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)] hover:bg-[var(--panel-strong)]",

        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2",
        size === "lg" && "px-6 py-3 text-lg",

        className,
      )}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}