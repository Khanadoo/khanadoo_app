import { Property } from "@/types/property";
import Badge from "../ui/Badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface PropertyCardProps {
    property: Property;
}

export default function PropertyCard({
    property,
}: PropertyCardProps) {
    return (
        <Link href={`/properties/${property.id}`}>
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <img
                    src={
                        property.imageUrls[0] ??
                        "/placeholder-property.jpg"
                    }
                    alt={property.title}
                    className="h-52 w-full object-cover"
                />

                <div className="space-y-3 p-4">
                    <div className="flex justify-between">
                        <h3 className="font-semibold">
                            {property.title}
                        </h3>

                        <Badge
                            variant={
                                property.status === "AVAILABLE"
                                    ? "success"
                                    : property.status === "RENTED"
                                        ? "warning"
                                        : "danger"
                            }
                        >
                            {property.status}
                        </Badge>
                    </div>

                    <p className="text-sm text-gray-500">
                        {property.locality}, {property.city}
                    </p>

                    <p className="text-lg font-bold">
                        {formatCurrency(property.price)}
                    </p>

                    <div className="flex gap-4 text-sm text-gray-500">
                        {property.bedrooms && (
                            <span>
                                🛏 {property.bedrooms}
                            </span>
                        )}

                        {property.bathrooms && (
                            <span>
                                🛁 {property.bathrooms}
                            </span>
                        )}

                        {property.area && (
                            <span>
                                📐 {property.area} sq.ft
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}