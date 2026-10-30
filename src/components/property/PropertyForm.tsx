
"use client";

import { useEffect, useState } from "react";

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
    initialValues?: Partial<PropertyFormValues>;

    onSubmit: (
        values: PropertyFormValues
    ) => Promise<void>;

    submitLabel?: string;
}

const defaultValues: PropertyFormValues = {
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
};

const selectClassName =
    "w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15";

const textareaClassName =
    "w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15";

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
        useState<PropertyFormValues>({
            ...defaultValues,
            ...initialValues,
        });

    useEffect(() => {
        setForm({
            ...defaultValues,
            ...initialValues,
        });
    }, [initialValues]);

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
                                accessToken
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
            className="space-y-8"
        >
            {/* Basic Information */}
            <section className="space-y-5">
                <div>
                    <h3 className="text-base font-semibold text-[var(--foreground)]">
                        Basic Information
                    </h3>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Start with the essential details of your property.
                    </p>
                </div>

                <div className="space-y-4">
                    <Input
                        label="Property Title"
                        placeholder="e.g. Spacious 2 BHK apartment"
                        value={form.title}
                        onChange={(e) =>
                            handleChange(
                                "title",
                                e.target.value
                            )
                        }
                        required
                    />

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
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
                            placeholder="Describe your property, its features and amenities..."
                            className={textareaClassName}
                            rows={4}
                        />

                        <p className="mt-1.5 text-xs text-[var(--muted)]">
                            Provide useful details to help potential tenants or buyers.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                                Property Type
                            </label>

                            <select
                                value={form.type}
                                onChange={(e) =>
                                    handleChange(
                                        "type",
                                        e.target.value as PropertyType
                                    )
                                }
                                className={selectClassName}
                            >
                                <option value="ROOM">Room</option>
                                <option value="PG">PG</option>
                                <option value="HOUSE">House</option>
                                <option value="APARTMENT">Apartment</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                                Listing Purpose
                            </label>

                            <select
                                value={form.purpose}
                                onChange={(e) =>
                                    handleChange(
                                        "purpose",
                                        e.target.value as PropertyPurpose
                                    )
                                }
                                className={selectClassName}
                            >
                                <option value="RENT">For Rent</option>
                                <option value="SALE">For Sale</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            <div className="border-t border-[var(--line)]" />

            {/* Pricing */}
            <section className="space-y-5">
                <div>
                    <h3 className="text-base font-semibold text-[var(--foreground)]">
                        Pricing Details
                    </h3>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Set the expected price for your listing.
                    </p>
                </div>

                <Input
                    label={
                        form.purpose === "RENT"
                            ? "Monthly Rent (₹)"
                            : "Selling Price (₹)"
                    }
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={(e) =>
                        handleChange(
                            "price",
                            Number(e.target.value)
                        )
                    }
                    placeholder="Enter amount in INR"
                    required
                />
            </section>

            <div className="border-t border-[var(--line)]" />

            {/* Location */}
            <section className="space-y-5">
                <div>
                    <h3 className="text-base font-semibold text-[var(--foreground)]">
                        Property Location
                    </h3>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Where is your property located?
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="City"
                        placeholder="Enter city"
                        value={form.city}
                        onChange={(e) =>
                            handleChange(
                                "city",
                                e.target.value
                            )
                        }
                        required
                    />

                    <Input
                        label="Locality"
                        placeholder="Enter locality or area"
                        value={form.locality}
                        onChange={(e) =>
                            handleChange(
                                "locality",
                                e.target.value
                            )
                        }
                        required
                    />
                </div>

                <Input
                    label="Full Address"
                    placeholder="Enter the complete property address"
                    value={form.address}
                    onChange={(e) =>
                        handleChange(
                            "address",
                            e.target.value
                        )
                    }
                    required
                />
            </section>

            <div className="border-t border-[var(--line)]" />

            {/* Specifications */}
            <section className="space-y-5">
                <div>
                    <h3 className="text-base font-semibold text-[var(--foreground)]">
                        Property Specifications
                    </h3>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Add the size and room details of your property.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                        label="Bedrooms"
                        type="number"
                        min="0"
                        value={form.bedrooms ?? ""}
                        onChange={(e) =>
                            handleChange(
                                "bedrooms",
                                e.target.value
                                    ? Number(e.target.value)
                                    : undefined
                            )
                        }
                        placeholder="Optional"
                    />

                    <Input
                        label="Bathrooms"
                        type="number"
                        min="0"
                        value={form.bathrooms ?? ""}
                        onChange={(e) =>
                            handleChange(
                                "bathrooms",
                                e.target.value
                                    ? Number(e.target.value)
                                    : undefined
                            )
                        }
                        placeholder="Optional"
                    />

                    <Input
                        label="Area (sq.ft)"
                        type="number"
                        min="0"
                        value={form.area ?? ""}
                        onChange={(e) =>
                            handleChange(
                                "area",
                                e.target.value
                                    ? Number(e.target.value)
                                    : undefined
                            )
                        }
                        placeholder="Optional"
                    />
                </div>
            </section>

            <div className="border-t border-[var(--line)]" />

            {/* Images */}
            <section className="space-y-5">
                <div>
                    <h3 className="text-base font-semibold text-[var(--foreground)]">
                        Property Images
                    </h3>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Upload photos to give people a better view of your property.
                    </p>
                </div>

                <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel-strong)] p-4">
                    <ImageUploader
                        onChange={handleImages}
                    />

                    {uploading && (
                        <p className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--brand)]" />
                            Uploading images...
                        </p>
                    )}
                </div>

                {form.imageUrls.length > 0 && (
                    <div>
                        <p className="mb-3 text-sm font-medium text-[var(--foreground)]">
                            Uploaded Images ({form.imageUrls.length})
                        </p>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {form.imageUrls.map((url) => (
                                <div
                                    key={url}
                                    className="group relative overflow-hidden rounded-2xl border border-[var(--line)]"
                                >
                                    <img
                                        src={url}
                                        alt="Property"
                                        className="h-28 w-full object-cover transition duration-300 group-hover:scale-105"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeImage(url)
                                        }
                                        aria-label="Remove image"
                                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/75 text-white transition hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Submit */}
            <div className="sticky bottom-0 -mx-6 border-t border-[var(--line)] bg-[var(--surface)] px-6 pb-1 pt-5 sm:-mx-8 sm:px-8">
                <Button
                    type="submit"
                    size="md"
                    className="w-full"
                    disabled={loading || uploading}
                >
                    {loading
                        ? "Saving..."
                        : submitLabel}
                </Button>

                <p className="mt-3 text-center text-xs text-[var(--muted)]">
                    Please review your information before submitting.
                </p>
            </div>
        </form>
    );
}
