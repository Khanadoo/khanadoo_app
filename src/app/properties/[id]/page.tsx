"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { propertyClient } from "@/services/property.client";

import { PropertyDetails } from "@/types/property";

import { formatCurrency } from "@/lib/utils";

export default function PropertyDetailsPage() {
    const params = useParams();

    const [property, setProperty] =
        useState<PropertyDetails | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadProperty = async () => {
            try {
                const data =
                    await propertyClient.getById(
                        params.id as string
                    );

                setProperty(data);
            } catch (err: any) {
                setError(
                    err.message ||
                    "Failed to load property"
                );
            } finally {
                setLoading(false);
            }
        };

        loadProperty();
    }, [params.id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error || !property) {
        return (
            <div className="p-10 text-red-500">
                {error || "Property not found"}
            </div>
        );
    }

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-10">
                {/* IMAGE */}

                <div className="overflow-hidden rounded-xl border">
                    <img
                        src={
                            property.imageUrls?.[0] ??
                            "/placeholder-property.jpg"
                        }
                        alt={property.title}
                        className="h-112.5 w-full object-cover"
                    />
                </div>

                {/* HEADER */}

                <div className="mt-8">
                    <h1 className="text-4xl font-bold">
                        {property.title}
                    </h1>

                    <p className="mt-2 text-gray-600">
                        {property.locality},{" "}
                        {property.city}
                    </p>

                    <p className="mt-4 text-3xl font-bold">
                        {formatCurrency(
                            property.price
                        )}
                    </p>
                </div>

                {/* PROPERTY INFO */}

                <section className="mt-10">
                    <h2 className="text-2xl font-semibold">
                        Property Details
                    </h2>

                    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                            <p className="text-sm text-gray-500">
                                Type
                            </p>
                            <p>{property.type}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Purpose
                            </p>
                            <p>{property.purpose}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Bedrooms
                            </p>
                            <p>
                                {property.bedrooms ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Bathrooms
                            </p>
                            <p>
                                {property.bathrooms ?? "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Area
                            </p>
                            <p>
                                {property.area
                                    ? `${property.area} sq.ft`
                                    : "-"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Status
                            </p>
                            <p>{property.status}</p>
                        </div>
                    </div>
                </section>

                {/* DESCRIPTION */}

                <section className="mt-10">
                    <h2 className="text-2xl font-semibold">
                        Description
                    </h2>

                    <p className="mt-4 whitespace-pre-line text-gray-700">
                        {property.description ||
                            "No description provided."}
                    </p>
                </section>

                {/* OWNER */}

                <section className="mt-10 rounded-xl border p-6">
                    <h2 className="text-2xl font-semibold">
                        Owner Information
                    </h2>

                    <div className="mt-4 space-y-2">
                        <p>
                            <strong>Name:</strong>{" "}
                            {property.owner.name}
                        </p>

                        <p>
                            <strong>Email:</strong>{" "}
                            {property.owner.email}
                        </p>

                        <p>
                            <strong>Phone:</strong>{" "}
                            {property.owner.phone ??
                                "Not provided"}
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}