"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui";
import { Button } from "@/components/ui";

import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
    const router = useRouter();

    const { register } = useAuth();

    const [name, setName] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [phone, setPhone] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");

        try {
            setLoading(true);

            await register(
                name,
                email,
                password,
                phone
            );

            router.push("/login");
        } catch (err: any) {
            setError(
                err.message || "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
                <h1 className="mb-6 text-center text-2xl font-bold">
                    Create Account
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <Input
                        label="Name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    <Input
                        label="Phone"
                        placeholder="Enter Phone Number"
                        value={phone}
                        onChange={(e) =>
                            setPhone(e.target.value)
                        }
                    />

                    {error && (
                        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        loading={loading}
                        className="w-full"
                        size="lg"
                    >
                        Register
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    Already have an account?
                    <button
                        onClick={() =>
                            router.push("/login")
                        }
                        className="ml-1 text-blue-600 hover:underline"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}