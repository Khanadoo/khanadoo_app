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

    const [editingProperty, setEditingProperty] =
        useState<Property | null>(null);

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

    const handleDelete = async (
        propertyId: string
    ) => {
        if (!accessToken) return;

        const confirmed = window.confirm(
            "Delete this property?"
        );

        if (!confirmed) return;

        try {
            await propertyClient.delete(
                propertyId,
                accessToken
            );

            setProperties((prev) =>
                prev.filter(
                    (p) => p.id !== propertyId
                )
            );
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleEdit = async (
        values: PropertyFormValues
    ) => {
        if (
            !editingProperty ||
            !accessToken
        )
            return;

        try {
            await propertyClient.update(
                editingProperty.id,
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

            setEditingProperty(null);
        } catch (err: any) {
            alert(err.message);
        }
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
                                    <Button size="md"
                                        variant="secondary"
                                        className="w-full"
                                        onClick={() => setEditingProperty(property)}
                                    >
                                        Edit
                                    </Button>

                                    <Button size="md"
                                        variant="danger"
                                        className="flex-1"
                                        onClick={() => handleDelete(property.id)}
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
                onClose={() => setShowCreateModal(false)}
            >
                <PropertyForm
                    submitLabel="Create Property"
                    onSubmit={handleCreateProperty}
                />
            </Modal>
            <Modal
                open={!!editingProperty}
                title="Edit Property"
                onClose={() =>
                    setEditingProperty(null)
                }
            >
                {editingProperty && (
                    <PropertyForm
                        initialValues={{
                            title:
                                editingProperty.title,

                            description:
                                editingProperty.description ?? "",

                            type:
                                editingProperty.type,

                            purpose:
                                editingProperty.purpose,

                            price:
                                editingProperty.price,

                            city:
                                editingProperty.city,

                            locality:
                                editingProperty.locality,

                            address:
                                editingProperty.address,

                            bedrooms:
                                editingProperty.bedrooms,

                            bathrooms:
                                editingProperty.bathrooms,

                            area:
                                editingProperty.area,

                            imageUrls:
                                editingProperty.imageUrls,
                        }}

                        submitLabel="Update Property"

                        onSubmit={handleEdit}
                    />
                )}
            </Modal>
        </>
    );
}