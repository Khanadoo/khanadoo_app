"use client";

export default function Navbar() {
    return (
        <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
            <h1 className="text-xl font-bold">
                PropertyHub
            </h1>

            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                    Welcome
                </span>
            </div>
        </header>
    );
}