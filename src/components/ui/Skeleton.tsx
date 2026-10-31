
import { cn } from "@/lib/utils";

interface SkeletonProps {
    variant?: "text" | "circular" | "rectangular";
    className?: string;
    count?: number;
}

export default function Skeleton({
    variant = "rectangular",
    className,
    count = 1,
}: SkeletonProps) {
    const variants = {
        text: "h-4 w-full rounded-md",
        circular: "h-10 w-10 rounded-full",
        rectangular: "rounded-xl",
    };

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    aria-hidden="true"
                    className={cn(
                        "animate-pulse bg-[var(--panel-strong)]",
                        variants[variant],
                        className,
                    )}
                />
            ))}
        </>
    );
}
