
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button, Modal } from "@/components/ui";
import EnquiryForm from "@/components/enquiry/EnquiryForm";

import { propertyClient } from "@/services/property.client";
import { PropertyDetails } from "@/types/property";
import { formatCurrency } from "@/lib/utils";

export default function PropertyDetailsPage() {
    const params = useParams();
    const propertyId = params.id as string;

    const [property, setProperty] =
        useState<PropertyDetails | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeImage, setActiveImage] = useState(0);
    const [showEnquiryModal, setShowEnquiryModal] =
        useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadProperty = async () => {
            setLoading(true);
            setError("");
            setProperty(null);
            setActiveImage(0);

            try {
                const data =
                    await propertyClient.getById(propertyId);

                if (!cancelled) {
                    setProperty(data);
                }
            } catch (err: unknown) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load property."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        if (propertyId) {
            void loadProperty();
        }

        return () => {
            cancelled = true;
        };
    }, [propertyId]);

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="min-h-[65vh] bg-[#faf8f5] px-5 py-12">
                    <div className="mx-auto max-w-7xl animate-pulse">
                        <div className="h-8 w-48 rounded bg-stone-200" />
                        <div className="mt-6 h-[300px] rounded-3xl bg-stone-200 md:h-[440px]" />
                        <div className="mt-8 h-8 w-2/3 rounded bg-stone-200" />
                        <div className="mt-4 h-5 w-1/3 rounded bg-stone-200" />
                        <div className="mt-8 grid gap-4 md:grid-cols-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-24 rounded-2xl bg-stone-200"
                                />
                            ))}
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (error || !property) {
        return (
            <>
                <Navbar />
                <main className="flex min-h-[60vh] items-center justify-center bg-[#faf8f5] px-5 py-16">
                    <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600">
                            !
                        </div>

                        <h1 className="mt-5 text-2xl font-bold text-stone-900">
                            Property unavailable
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-stone-600">
                            {error || "We couldn't find this property. It may have been removed or is no longer available."}
                        </p>

                        <Link
                            href="/properties"
                            className="mt-6 inline-flex rounded-xl bg-[#a64b35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#873a29]"
                        >
                            Browse properties
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const images = property.imageUrls?.filter(Boolean) ?? [];
    const galleryImages = images.length
        ? images
        : ["/placeholder-property.jpg"];

    const statusLabel = property.status
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

    const typeLabel = property.type
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

    const purposeLabel = property.purpose
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

    const isAvailable = property.status === "AVAILABLE";

    const specifications = [
        {
            label: "Property type",
            value: typeLabel,
            icon: "⌂",
        },
        {
            label: "Bedrooms",
            value: property.bedrooms ?? "—",
            icon: "▤",
        },
        {
            label: "Bathrooms",
            value: property.bathrooms ?? "—",
            icon: "◉",
        },
        {
            label: "Built-up area",
            value: property.area
                ? `${property.area} sq. ft.`
                : "Not specified",
            icon: "↗",
        },
    ];

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#faf8f5] pb-16 text-stone-900">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    {/* Breadcrumbs */}
                    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-stone-500">
                        <Link
                            href="/"
                            className="transition hover:text-[#a64b35]"
                        >
                            Home
                        </Link>
                        <span>/</span>
                        <Link
                            href="/properties"
                            className="transition hover:text-[#a64b35]"
                        >
                            Properties
                        </Link>
                        <span>/</span>
                        <span className="max-w-[220px] truncate font-medium text-stone-800">
                            {property.title}
                        </span>
                    </nav>

                    {/* Property gallery */}
                    <section>
                        <div className="relative overflow-hidden rounded-2xl bg-stone-200 shadow-sm md:rounded-3xl">
                            <img
                                src={galleryImages[activeImage]}
                                alt={property.title}
                                onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src =
                                        "/placeholder-property.jpg";
                                }}
                                className="h-[280px] w-full object-cover sm:h-[380px] lg:h-[470px]"
                            />

                            <div className="absolute left-4 top-4 flex flex-wrap gap-2 sm:left-6 sm:top-6">
                                <span className="rounded-full bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-wide text-stone-800 shadow-sm">
                                    {purposeLabel}
                                </span>

                                <span
                                    className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm ${isAvailable
                                            ? "bg-emerald-50 text-emerald-800"
                                            : "bg-stone-900/85 text-white"
                                        }`}
                                >
                                    {statusLabel}
                                </span>
                            </div>

                            {galleryImages.length > 1 && (
                                <div className="absolute bottom-4 right-4 rounded-full bg-stone-950/75 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                                    {activeImage + 1} / {galleryImages.length} photos
                                </div>
                            )}
                        </div>

                        {galleryImages.length > 1 && (
                            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                                {galleryImages.map((image, index) => (
                                    <button
                                        key={`${image}-${index}`}
                                        type="button"
                                        onClick={() =>
                                            setActiveImage(index)
                                        }
                                        aria-label={`View property photo ${index + 1}`}
                                        aria-pressed={activeImage === index}
                                        className={`shrink-0 overflow-hidden rounded-xl border-2 transition ${activeImage === index
                                                ? "border-[#a64b35] ring-2 ring-[#a64b35]/15"
                                                : "border-transparent opacity-70 hover:opacity-100"
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${property.title} photo ${index + 1}`}
                                            className="h-16 w-24 object-cover sm:h-20 sm:w-32"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Main content */}
                    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
                        <div className="min-w-0">
                            {/* Heading */}
                            <section>
                                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#a64b35]">
                                    <span>{typeLabel}</span>
                                    <span className="text-stone-300">•</span>
                                    <span>{purposeLabel}</span>
                                </div>

                                <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
                                    {property.title}
                                </h1>

                                <p className="mt-3 flex items-start gap-2 text-stone-600">
                                    <span className="mt-0.5 text-lg text-[#a64b35]">
                                        ⌖
                                    </span>
                                    <span>
                                        {property.locality}
                                        {property.city
                                            ? `, ${property.city}`
                                            : ""}
                                    </span>
                                </p>
                            </section>

                            {/* Price on smaller screens */}
                            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 lg:hidden">
                                <p className="text-sm text-stone-500">
                                    {property.purpose === "RENT"
                                        ? "Monthly rent"
                                        : "Asking price"}
                                </p>
                                <p className="mt-1 text-3xl font-bold tracking-tight">
                                    {formatCurrency(property.price)}
                                    {property.purpose === "RENT" && (
                                        <span className="ml-1 text-sm font-medium text-stone-500">
                                            / month
                                        </span>
                                    )}
                                </p>

                                <Button
                                    size="md"
                                    onClick={() =>
                                        setShowEnquiryModal(true)
                                    }
                                >
                                    Enquire Now
                                </Button>
                            </div>

                            {/* Specifications */}
                            <section className="mt-9">
                                <h2 className="text-xl font-bold sm:text-2xl">
                                    Property overview
                                </h2>

                                <p className="mt-2 text-sm text-stone-500">
                                    Everything you need to know about this property.
                                </p>

                                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {specifications.map((item) => (
                                        <div
                                            key={item.label}
                                            className="rounded-2xl border border-stone-200/80 bg-white p-4 transition hover:border-[#d8b0a4] hover:shadow-sm sm:p-5"
                                        >
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8eee9] text-xl text-[#a64b35]">
                                                {item.icon}
                                            </span>

                                            <p className="mt-4 text-xs text-stone-500 sm:text-sm">
                                                {item.label}
                                            </p>

                                            <p className="mt-1 break-words text-sm font-semibold text-stone-900 sm:text-base">
                                                {item.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Description */}
                            <section className="mt-10 border-t border-stone-200 pt-8">
                                <h2 className="text-xl font-bold sm:text-2xl">
                                    About this property
                                </h2>

                                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-stone-600 sm:text-base">
                                    {property.description?.trim() ||
                                        "The owner hasn't added a description for this property yet."}
                                </p>
                            </section>

                            {/* Additional details */}
                            <section className="mt-10 border-t border-stone-200 pt-8">
                                <h2 className="text-xl font-bold sm:text-2xl">
                                    Property details
                                </h2>

                                <dl className="mt-5 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white px-5">
                                    <div className="flex items-center justify-between gap-4 py-4">
                                        <dt className="text-sm text-stone-500">
                                            Property type
                                        </dt>
                                        <dd className="text-right text-sm font-semibold">
                                            {typeLabel}
                                        </dd>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 py-4">
                                        <dt className="text-sm text-stone-500">
                                            Purpose
                                        </dt>
                                        <dd className="text-right text-sm font-semibold">
                                            {purposeLabel}
                                        </dd>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 py-4">
                                        <dt className="text-sm text-stone-500">
                                            Availability
                                        </dt>
                                        <dd className="text-right text-sm font-semibold">
                                            {statusLabel}
                                        </dd>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 py-4">
                                        <dt className="text-sm text-stone-500">
                                            Location
                                        </dt>
                                        <dd className="max-w-[60%] text-right text-sm font-semibold">
                                            {[property.locality, property.city]
                                                .filter(Boolean)
                                                .join(", ") || "Not specified"}
                                        </dd>
                                    </div>
                                </dl>
                            </section>
                        </div>

                        {/* Desktop enquiry and owner card */}
                        <aside className="min-w-0">
                            <div className="space-y-5 lg:sticky lg:top-24">
                                <section className="hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:block">
                                    <p className="text-sm text-stone-500">
                                        {property.purpose === "RENT"
                                            ? "Monthly rent"
                                            : "Asking price"}
                                    </p>

                                    <p className="mt-2 text-3xl font-bold tracking-tight">
                                        {formatCurrency(property.price)}
                                    </p>

                                    {property.purpose === "RENT" && (
                                        <p className="mt-1 text-sm text-stone-500">
                                            Per month
                                        </p>
                                    )}

                                    <div className="my-6 border-t border-stone-100" />

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f8eee9] text-xl font-bold text-[#a64b35]">
                                            {property.owner.name
                                                ?.charAt(0)
                                                .toUpperCase() || "O"}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs text-stone-500">
                                                Listed by
                                            </p>
                                            <p className="truncate font-semibold">
                                                {property.owner.name}
                                            </p>
                                            <p className="text-xs text-stone-500">
                                                Property owner
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-3 text-sm">
                                        <div className="flex gap-3">
                                            <span className="text-[#a64b35]">
                                                ✉
                                            </span>
                                            <span className="break-all text-stone-600">
                                                {property.owner.email}
                                            </span>
                                        </div>

                                        <div className="flex gap-3">
                                            <span className="text-[#a64b35]">
                                                ☎
                                            </span>
                                            <span className="text-stone-600">
                                                {property.owner.phone ||
                                                    "Phone not provided"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <Button
                                            size="md"
                                            onClick={() =>
                                                setShowEnquiryModal(true)
                                            }
                                        >
                                            Enquire Now
                                        </Button>
                                    </div>

                                    <p className="mt-3 text-center text-xs leading-5 text-stone-500">
                                        Contact the owner to ask questions or arrange a visit.
                                    </p>
                                </section>

                                {/* Owner information for mobile */}
                                <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm lg:hidden">
                                    <h2 className="text-lg font-bold">
                                        Owner information
                                    </h2>

                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f8eee9] text-xl font-bold text-[#a64b35]">
                                            {property.owner.name
                                                ?.charAt(0)
                                                .toUpperCase() || "O"}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="font-semibold">
                                                {property.owner.name}
                                            </p>
                                            <p className="break-all text-sm text-stone-500">
                                                {property.owner.email}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-sm text-stone-600">
                                        Phone:{" "}
                                        {property.owner.phone ||
                                            "Not provided"}
                                    </p>
                                </section>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Existing enquiry workflow */}
            <Modal
                open={showEnquiryModal}
                title="Send Enquiry"
                onClose={() => setShowEnquiryModal(false)}
            >
                <EnquiryForm
                    propertyId={property.id}
                    onSuccess={() =>
                        setShowEnquiryModal(false)
                    }
                />
            </Modal>

            <Footer />
        </>
    );
}
