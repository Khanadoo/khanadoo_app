
"use client";

import { useEffect } from "react";

interface ModalProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({
    open,
    title,
    onClose,
    children,
}: ModalProps) {
    useEffect(() => {
        if (!open) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className="surface flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] shadow-2xl sm:rounded-[2rem]"
            >
                {/* Modal Header */}
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-5 sm:px-8 sm:py-6">
                    <div className="min-w-0">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-deep)]">
                            PropertyHub
                        </p>

                        <h2
                            id="modal-title"
                            className="display-font text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl"
                        >
                            {title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-lg text-[var(--muted)] transition hover:border-[var(--brand)] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2"
                    >
                        ×
                    </button>
                </div>

                {/* Modal Content */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8 sm:py-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
