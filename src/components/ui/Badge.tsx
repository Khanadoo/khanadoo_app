import { cn } from "@/lib/utils";

interface BadgeProps {
    children: React.ReactNode;
    variant?:
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "default";
}

export default function Badge({
    children,
    variant = "default",
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-medium",

                variant === "success" &&
                "bg-green-100 text-green-700",

                variant === "warning" &&
                "bg-yellow-100 text-yellow-700",

                variant === "danger" &&
                "bg-red-100 text-red-700",

                variant === "info" &&
                "bg-blue-100 text-blue-700",

                variant === "default" &&
                "bg-gray-100 text-gray-700"
            )}
        >
            {children}
        </span>
    );
}