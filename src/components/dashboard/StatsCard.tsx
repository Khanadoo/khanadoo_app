interface StatsCardProps {
    title: string;
    value: number;
}

export default function StatsCard({
    title,
    value,
}: StatsCardProps) {
    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
                {title}
            </p>

            <h3 className="mt-2 text-3xl font-bold">
                {value}
            </h3>
        </div>
    );
}