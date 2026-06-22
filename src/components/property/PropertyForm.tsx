"use client";

import { useState } from "react";

import { useAuth } from "@/context/AuthContext";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUploader from "./ImageUploader";

import { uploadClient } from "@/services/upload.client";

import {
    PropertyType,
    PropertyPurpose,
} from "@/types/common";

export interface PropertyFormValues {
    title: string;
    description: string;

    type: PropertyType;
    purpose: PropertyPurpose;

    price: number;

    city: string;
    locality: string;
    address: string;

    bedrooms?: number;
    bathrooms?: number;
    area?: number;

    imageUrls: string[];
}

interface PropertyFormProps {
    initialValues?: PropertyFormValues;

    onSubmit: (
        values: PropertyFormValues
    ) => Promise<void>;

    submitLabel?: string;
}

export default function PropertyForm({
    initialValues,
    onSubmit,
    submitLabel = "Save Property",
}: PropertyFormProps) {
    const { accessToken } = useAuth();

    const [loading, setLoading] =
        useState(false);

    const [uploading, setUploading] =
        useState(false);

    const [form, setForm] =
        useState<PropertyFormValues>(
            initialValues || {
                title: "",
                description: "",

                type: "ROOM",
                purpose: "RENT",

                price: 0,

                city: "",
                locality: "",
                address: "",

                bedrooms: undefined,
                bathrooms: undefined,
                area: undefined,

                imageUrls: [],
            }
        );

    const handleChange = (
        key: keyof PropertyFormValues,
        value: any
    ) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        try {
            setLoading(true);

            await onSubmit(form);
        } finally {
            setLoading(false);
        }
    };

    const handleImages = async (
        files: File[]
    ) => {
        if (!accessToken) return;

        try {
            setUploading(true);

            const uploadedUrls =
                await Promise.all(
                    files.map(async (file) => {
                        const result =
                            await uploadClient.upload(
                                file,
                                accessToken,
                            );

                        return result.url;
                    })
                );

            setForm((prev) => ({
                ...prev,

                imageUrls: [
                    ...prev.imageUrls,
                    ...uploadedUrls,
                ],
            }));
        } catch (err: any) {
            alert(
                err.message ||
                "Image upload failed"
            );
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (url: string) => {
        setForm((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.filter(
                (img) => img !== url
            ),
        }));
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* Title */}

            <Input
                label="Title"
                value={form.title}
                onChange={(e) =>
                    handleChange(
                        "title",
                        e.target.value
                    )
                }
                required
            />

            {/* Description */}

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Description
                </label>

                <textarea
                    value={form.description}
                    onChange={(e) =>
                        handleChange(
                            "description",
                            e.target.value
                        )
                    }
                    className="w-full rounded-lg border border-gray-300 p-3"
                    rows={5}
                />
            </div>

            {/* Type */}

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Property Type
                </label>

                <select
                    value={form.type}
                    onChange={(e) =>
                        handleChange(
                            "type",
                            e.target.value
                        )
                    }
                    className="w-full rounded-lg border border-gray-300 p-2"
                >
                    <option value="ROOM">
                        Room
                    </option>

                    <option value="PG">
                        PG
                    </option>

                    <option value="HOUSE">
                        House
                    </option>

                    <option value="APARTMENT">
                        Apartment
                    </option>
                </select>
            </div>

            {/* Purpose */}

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Purpose
                </label>

                <select
                    value={form.purpose}
                    onChange={(e) =>
                        handleChange(
                            "purpose",
                            e.target.value
                        )
                    }
                    className="w-full rounded-lg border border-gray-300 p-2"
                >
                    <option value="RENT">
                        Rent
                    </option>

                    <option value="SALE">
                        Sale
                    </option>
                </select>
            </div>

            {/* Price */}

            <Input
                label="Price"
                type="number"
                value={form.price}
                onChange={(e) =>
                    handleChange(
                        "price",
                        Number(e.target.value)
                    )
                }
                required
            />

            {/* City */}

            <Input
                label="City"
                value={form.city}
                onChange={(e) =>
                    handleChange(
                        "city",
                        e.target.value
                    )
                }
                required
            />

            {/* Locality */}

            <Input
                label="Locality"
                value={form.locality}
                onChange={(e) =>
                    handleChange(
                        "locality",
                        e.target.value
                    )
                }
                required
            />

            {/* Address */}

            <Input
                label="Address"
                value={form.address}
                onChange={(e) =>
                    handleChange(
                        "address",
                        e.target.value
                    )
                }
                required
            />

            {/* Bedrooms */}

            <Input
                label="Bedrooms"
                type="number"
                value={form.bedrooms ?? ""}
                onChange={(e) =>
                    handleChange(
                        "bedrooms",
                        e.target.value
                            ? Number(e.target.value)
                            : undefined
                    )
                }
            />

            {/* Bathrooms */}

            <Input
                label="Bathrooms"
                type="number"
                value={form.bathrooms ?? ""}
                onChange={(e) =>
                    handleChange(
                        "bathrooms",
                        e.target.value
                            ? Number(e.target.value)
                            : undefined
                    )
                }
            />

            {/* Area */}

            <Input
                label="Area (sq.ft)"
                type="number"
                value={form.area ?? ""}
                onChange={(e) =>
                    handleChange(
                        "area",
                        e.target.value
                            ? Number(e.target.value)
                            : undefined
                    )
                }
            />

            {/* Images Placeholder */}

            <div className="space-y-3">
                <label className="block text-sm font-medium">
                    Property Images
                </label>

                <ImageUploader
                    onChange={handleImages}
                />

                {uploading && (
                    <p className="text-sm text-gray-500">
                        Uploading images...
                    </p>
                )}

                <div className="grid grid-cols-3 gap-3">
                    {form.imageUrls.map((url) => (
                        <img
                            key={url}
                            src={url}
                            alt="Property"
                            className="h-24 w-full rounded-lg object-cover border"
                        />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {form.imageUrls.map((url) => (
                    <div
                        key={url}
                        className="relative"
                    >
                        <img
                            src={url}
                            alt="Property"
                            className="h-24 w-full rounded-lg object-cover border"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                removeImage(url)
                            }
                            className="absolute right-1 top-1 rounded-full  bg-red-500 px-2  text-white"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <Button
                size="md"
                type="submit"
                disabled={loading}
            >
                {loading
                    ? "Saving..."
                    : submitLabel}
            </Button>
        </form>
    );
}