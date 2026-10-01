interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export default function PageHeader({
    title,
    subtitle,
    action,
}: PageHeaderProps) {
    return (
        <div className="mb-8 flex items-end justify-between gap-4">
            <div>
                <h1 className="display-font text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                    {title}
                </h1>

                {subtitle && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                        {subtitle}
                    </p>
                )}
            </div>

            {action && (
                <div className="shrink-0">
                    {action}
                </div>
            )}
        </div>
    );
}