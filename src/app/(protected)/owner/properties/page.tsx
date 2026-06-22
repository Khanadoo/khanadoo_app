"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Button from "@/components/ui/Button";
import PropertyCard from "@/components/ui/PropertyCard";

import { Property } from "@/types/property";

import { propertyClient } from "@/services/property.client";

import { useAuth } from "@/context/AuthContext";

import PropertyForm, { PropertyFormValues } from "@/components/property/PropertyForm";
import { Modal } from "@/components/ui";

export default function MyPropertiesPage() {
    const { accessToken } = useAuth();

    const [properties, setProperties] =
        useState<Property[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [showCreateModal, setShowCreateModal] =
        useState(false);

    useEffect(() => {
        const loadProperties = async () => {
            if (!accessToken) return;

            try {
                const response =
                    await propertyClient.getMyProperties(
                        accessToken
                    );

                setProperties(response.properties);
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
    }, [accessToken]);

    const handleCreateProperty = async (
        values: PropertyFormValues
    ) => {
        if (!accessToken) return;

        await propertyClient.create(
            values,
            accessToken
        );

        const refreshed =
            await propertyClient.getMyProperties(
                accessToken
            );

        setProperties(
            refreshed.properties
        );

        setShowCreateModal(false);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <div className="p-10 text-red-500">
                {error}
            </div>
        );
    }

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-4xl font-bold">
                        My Properties
                    </h1>

                    <Button
                        size="md"
                        onClick={() =>
                            setShowCreateModal(true)
                        }
                    >
                        Add Property
                    </Button>
                </div>

                {properties.length === 0 ? (
                    <div className="rounded-xl border p-8 text-center">
                        <p className="text-gray-500">
                            You haven't listed any
                            properties yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {properties.map((property) => (
                            <div
                                key={property.id}
                                className="space-y-3"
                            >
                                <PropertyCard
                                    property={property}
                                />

                                <div className="flex gap-2">
                                    <Link
                                        href={`/owner/properties/${property.id}/edit`}
                                        className="flex-1"
                                    >
                                        <Button size="md"
                                            variant="secondary"
                                            className="w-full"
                                        >
                                            Edit
                                        </Button>
                                    </Link>

                                    <Button size="md"
                                        variant="danger"
                                        className="flex-1"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
            <Modal
                open={showCreateModal}
                title="Add property"
                onClose={()=>setShowCreateModal(false)}
            >
                <PropertyForm
                    submitLabel="Create Property"
                    onSubmit={handleCreateProperty}
                />
            </Modal>
        </>
    );
}