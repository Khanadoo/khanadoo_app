"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { enquiryClient } from "@/services/enquiry.client";

import { useAuth } from "@/context/AuthContext";

interface EnquiryFormProps {
    propertyId: string;
    onSuccess?: () => void;
}

export default function EnquiryForm({
    propertyId,
    onSuccess,
}: EnquiryFormProps) {
    const { accessToken } = useAuth();

    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        try {
            if (!/^[0-9]{10}$/.test(phone)) {
                setError("Please enter a valid 10 digit phone number");
                return;
            }
            setLoading(true);

            if (!accessToken) {
                throw new Error("Please login first");
            }

            await enquiryClient.create({
                propertyId,
                phone,
                message,
            },
                accessToken!
            );

            setSuccess(
                "Enquiry submitted successfully."
            );

            setPhone("");
            setMessage("");

            onSuccess?.();
        } catch (err: any) {
            setError(
                err.message ||
                "Failed to submit enquiry"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >
            <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) =>
                    setPhone(e.target.value)
                }
                placeholder="Enter your phone number"
                required
            />

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Message
                </label>

                <textarea
                    value={message}
                    onChange={(e) =>
                        setMessage(e.target.value)
                    }
                    rows={4}
                    placeholder="Tell the owner what you're looking for..."
                    className="w-full rounded-lg border px-3 py-2"
                />
            </div>

            {error && (
                <p className="text-sm text-red-500">
                    {error}
                </p>
            )}

            {success && (
                <p className="text-sm text-green-600">
                    {success}
                </p>
            )}

            <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="md"
            >
                {loading
                    ? "Submitting..."
                    : "Submit Enquiry"}
            </Button>
        </form>
    );
}