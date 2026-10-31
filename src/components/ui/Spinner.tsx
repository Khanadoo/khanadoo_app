
import { cn } from "@/lib/utils";

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    label?: string;
}

export default function Spinner({
    size = "md",
    className,
    label = "Loading",
}: SpinnerProps) {
    const sizes = {
        sm: "h-4 w-4 border-2",
        md: "h-6 w-6 border-2",
        lg: "h-9 w-9 border-[3px]",
    };

    return (
        <span
            role="status"
            aria-label={label}
            className={cn(
                "inline-block animate-spin rounded-full border-current border-t-transparent",
                sizes[size],
                className,
            )}
        />
    );
}
