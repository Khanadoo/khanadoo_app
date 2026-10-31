
import Spinner from "@/components/ui/Spinner";

interface PageLoaderProps {
    title?: string;
    description?: string;
    fullScreen?: boolean;
}

export default function PageLoader({
    title = "Loading...",
    description = "Please wait while we get things ready.",
    fullScreen = false,
}: PageLoaderProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center px-4 text-center ${fullScreen ? "min-h-screen" : "min-h-[50vh]"
                }`}
            role="status"
            aria-live="polite"
        >
            <Spinner
                size="lg"
                className="text-[var(--brand)]"
            />

            <h2 className="mt-5 text-base font-semibold text-[var(--foreground)]">
                {title}
            </h2>

            {description && (
                <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                    {description}
                </p>
            )}
        </div>
    );
}
