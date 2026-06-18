"use client";

import { useEffect, useState } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import PropertyCard from "@/components/ui/PropertyCard";

import { Property } from "@/types/property";
import { propertyClient } from "@/services/property.client";

export default function PropertiesPage() {
    const [properties, setProperties] =
        useState<Property[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadProperties = async () => {
            try {
                const response =
                    await propertyClient.getAll();

                setProperties(response.data);
            } catch (err: any) {
                setError(
                    err.message ||
                    "Failed to load properties"
                );
            } finally {
                setLoading(false);
            }
        };

        loadProperties();
    }, []);

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">
                        Available Properties
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Browse verified properties
                        available for rent and sale.
                    </p>
                </div>

                {loading && (
                    <div>
                        Loading properties...
                    </div>
                )}

                {error && (
                    <div className="text-red-500">
                        {error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    properties.length === 0 && (
                        <div>
                            No properties found.
                        </div>
                    )}

                {!loading &&
                    properties.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {properties.map(
                                (property) => (
                                    <PropertyCard
                                        key={property.id}
                                        property={property}
                                    />
                                )
                            )}
                        </div>
                    )}
            </main>

            <Footer />
        </>
    );
}