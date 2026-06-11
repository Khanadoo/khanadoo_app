import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size: "sm" | "md" | "lg";
  loading?: boolean;
}

export default function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return(
    <button
      disabled={disabled || loading}
      className={cn(
        "rounded-lg font-medium transition-all disabled::opacity-50 disabled:cursor-not-allowed",

        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",

        variant === "secondary" && "bg-gray-700 text-white hover:bg-gray-800",

        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",

        variant === "outline" && "border border-gray-300 hover:bg-gray-100",

        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2",
        size === "lg" && "px-6 py-3 text-lg",

        className
      )}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}