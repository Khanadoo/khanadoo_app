
"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { enquiryClient } from "@/services/enquiry.client";
import {
    messageClient,
    Message,
} from "@/services/message.client";

import {
    EnquiryWithProperty,
    EnquiryWithUserAndProperty,
} from "@/types/enquiry";

import * as Ably from "ably";
import { createAblyClient } from "@/lib/ably.client";

export default function ConversationPage() {
    const params = useParams();
    const router = useRouter();

    const {
        user,
        accessToken,
        loading: authLoading,
        refreshSession,
    } = useAuth();

    const enquiryId = params.id as string;

    const [enquiry, setEnquiry] = useState<
        EnquiryWithProperty | EnquiryWithUserAndProperty | null
    >(null);

    const [messages, setMessages] = useState<Message[]>([]);

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [closing, setClosing] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [closeError, setCloseError] = useState<string | null>(null);
    const [sendError, setSendError] = useState<string | null>(null);

    const [newMessage, setNewMessage] = useState("");

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const ablyRef = useRef<Ably.Realtime | null>(null);

    const isOwner = user?.role === "OWNER";

    const isConversationClosed =
        enquiry?.status === "CLOSED" ||
        enquiry?.status === "CANCELLED";

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatMessageTime = (date: string | Date) => {
        return new Date(date).toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const formatMessageDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusClasses = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-amber-100 text-amber-800";

            case "CONTACTED":
                return "bg-blue-100 text-blue-800";

            case "NEGOTIATING":
                return "bg-violet-100 text-violet-800";

            case "CLOSED":
                return "bg-emerald-100 text-emerald-800";

            case "CANCELLED":
                return "bg-red-100 text-red-800";

            default:
                return "bg-[var(--panel-strong)] text-[var(--muted)]";
        }
    };

    useEffect(() => {
        if (authLoading || !accessToken || !user) {
            return;
        }

        const loadConversation = async () => {
            try {
                setLoading(true);
                setError(null);

                let currentEnquiry:
                    | EnquiryWithProperty
                    | EnquiryWithUserAndProperty
                    | undefined;

                if (user.role === "OWNER") {
                    const response = await enquiryClient.getOwner(
                        accessToken,
                    );

                    currentEnquiry = response.enquiries.find(
                        (item) => item.id === enquiryId,
                    );
                } else {
                    const response = await enquiryClient.getMine(
                        accessToken,
                    );

                    currentEnquiry = response.enquiries.find(
                        (item) => item.id === enquiryId,
                    );
                }

                if (!currentEnquiry) {
                    throw new Error("Enquiry not found");
                }

                setEnquiry(currentEnquiry);

                const messageResponse =
                    await messageClient.getMessages(
                        enquiryId,
                        accessToken,
                    );

                setMessages(messageResponse.messages);
            } catch (error: any) {
                console.error("Load conversation error:", error);

                setError(
                    error.message || "Failed to load conversation",
                );
            } finally {
                setLoading(false);
            }
        };

        loadConversation();
    }, [authLoading, accessToken, user, enquiryId]);

    useEffect(() => {
        if (!loading) {
            scrollToBottom();
        }
    }, [loading, messages.length]);

    useEffect(() => {
        if (!accessToken || !user || !enquiryId) {
            return;
        }

        let active = true;

        const setupRealtime = async () => {
            try {
                const ably = createAblyClient(
                    enquiryId,
                    accessToken,
                    refreshSession,
                );

                ablyRef.current = ably;

                const channel = ably.channels.get(
                    `enquiry:${enquiryId}`,
                );

                await channel.subscribe(
                    "message.created",
                    (message) => {
                        if (!active) {
                            return;
                        }

                        const data = message.data as {
                            message?: Message;
                        };

                        const incomingMessage = data?.message;

                        if (!incomingMessage) {
                            return;
                        }

                        setMessages((currentMessages) => {
                            const alreadyExists = currentMessages.some(
                                (item) => item.id === incomingMessage.id,
                            );

                            if (alreadyExists) {
                                return currentMessages;
                            }

                            return [...currentMessages, incomingMessage];
                        });
                    },
                );

                channel.subscribe("enquiry.updated", (message) => {
                    const updatedEnquiry = message.data?.enquiry;

                    if (!updatedEnquiry) {
                        return;
                    }

                    setEnquiry((currentEnquiry) => {
                        if (!currentEnquiry) {
                            return currentEnquiry;
                        }

                        return {
                            ...currentEnquiry,
                            status: updatedEnquiry.status,
                            updatedAt: updatedEnquiry.updatedAt,
                        };
                    });
                });

                if (active) {
                    console.log(
                        "Ably connected to:",
                        `enquiry:${enquiryId}`,
                    );
                }
            } catch (error) {
                if (!active) {
                    return;
                }

                console.error("Ably subscription error:", error);
            }
        };

        setupRealtime();

        return () => {
            active = false;

            const ably = ablyRef.current;

            if (!ably) {
                return;
            }

            const channel = ably.channels.get(
                `enquiry:${enquiryId}`,
            );

            channel.unsubscribe();
            ably.close();

            ablyRef.current = null;
        };
    }, [accessToken, user?.id, enquiryId, refreshSession]);

    const sendMessage = async () => {
        const content = newMessage.trim();

        if (
            !content ||
            !accessToken ||
            !user ||
            sending ||
            isConversationClosed
        ) {
            return;
        }

        try {
            setSending(true);
            setSendError(null);

            const response = await messageClient.sendMessage(
                enquiryId,
                { content },
                accessToken,
            );

            setMessages((currentMessages) => {
                const alreadyExists = currentMessages.some(
                    (item) => item.id === response.message.id,
                );

                if (alreadyExists) {
                    return currentMessages;
                }

                return [...currentMessages, response.message];
            });

            setNewMessage("");

            // The backend changes the enquiry status to NEGOTIATING
            // when the first message is sent.
            setEnquiry((currentEnquiry) => {
                if (!currentEnquiry) {
                    return currentEnquiry;
                }

                return {
                    ...currentEnquiry,
                    status: "NEGOTIATING",
                };
            });
        } catch (error: any) {
            console.error("Send message error:", error);

            setSendError(
                error.message || "Failed to send message",
            );
        } finally {
            setSending(false);
        }
    };

    const closeNegotiation = async () => {
        if (
            !accessToken ||
            !user ||
            user.role !== "OWNER" ||
            !enquiry ||
            closing ||
            enquiry.status === "CLOSED" ||
            enquiry.status === "CANCELLED"
        ) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to close this negotiation?\n\n" +
            "The conversation will remain available for viewing, " +
            "but no new messages can be sent.",
        );

        if (!confirmed) {
            return;
        }

        try {
            setClosing(true);
            setCloseError(null);

            await enquiryClient.updateStatus(
                enquiry.id,
                {
                    status: "CLOSED",
                },
                accessToken,
            );

            setEnquiry((currentEnquiry) => {
                if (!currentEnquiry) {
                    return currentEnquiry;
                }

                return {
                    ...currentEnquiry,
                    status: "CLOSED",
                };
            });
        } catch (error: any) {
            console.error("Close negotiation error:", error);

            setCloseError(
                error.message || "Failed to close negotiation",
            );
        } finally {
            setClosing(false);
        }
    };

    const handleMessageKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--brand)]" />

                    <p className="text-sm font-medium text-[var(--muted)]">
                        Loading conversation...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !enquiry) {
        return (
            <div className="surface rounded-[2rem] border border-[var(--line)] p-8 sm:p-10">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-6 w-6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    >
                        <path
                            d="M12 9v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Something went wrong
                </p>

                <h1 className="mt-2 font-display text-2xl font-semibold">
                    Conversation unavailable
                </h1>

                <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                    {error || "Enquiry not found."}
                </p>

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mt-7 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    Go back to enquiries
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page heading */}
            <div>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    >
                        <path
                            d="m15 18-6-6 6-6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    Back to enquiries
                </button>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
                            Your conversations
                        </p>

                        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                            Conversation
                        </h1>

                        <p className="mt-2 text-sm text-[var(--muted)]">
                            Discuss the property and keep your negotiation
                            in one place.
                        </p>
                    </div>

                    <span
                        className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold ${getStatusClasses(enquiry.status)}`}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {enquiry.status.replace("_", " ")}
                    </span>
                </div>
            </div>

            {/* Property overview */}
            <section className="surface overflow-hidden rounded-[1.75rem] border border-[var(--line)]">
                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--panel-strong)] text-[var(--brand)]">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-6 w-6"
                                stroke="currentColor"
                                strokeWidth="1.7"
                            >
                                <path
                                    d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs font-medium text-[var(--muted)]">
                                Property enquiry
                            </p>

                            <h2 className="mt-1 truncate font-display text-lg font-semibold">
                                {enquiry.property.title}
                            </h2>

                            <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--muted)]">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="h-4 w-4 shrink-0"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <circle cx="12" cy="10" r="2.2" />
                                </svg>
                                <span className="truncate">
                                    {enquiry.property.locality},{" "}
                                    {enquiry.property.city}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-5 border-t border-[var(--line)] pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                        <div>
                            <p className="text-xs text-[var(--muted)]">
                                Asking price
                            </p>

                            <p className="mt-1 font-display text-xl font-semibold">
                                {formatPrice(enquiry.property.price)}
                            </p>

                            {enquiry.property.purpose === "RENT" && (
                                <p className="text-xs text-[var(--muted)]">
                                    per month
                                </p>
                            )}
                        </div>

                        <div className="rounded-xl bg-[var(--panel-strong)] px-3 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                                Purpose
                            </p>

                            <p className="mt-0.5 text-sm font-semibold">
                                {enquiry.property.purpose}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chat workspace */}
            <section className="surface flex min-h-[650px] flex-col overflow-hidden rounded-[1.75rem] border border-[var(--line)]">
                {/* Chat top bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--panel-strong)] text-sm font-semibold text-[var(--brand)]">
                            {isOwner ? "U" : "O"}
                        </div>

                        <div>
                            <p className="text-sm font-semibold">
                                {isOwner
                                    ? "Interested user"
                                    : "Property owner"}
                            </p>

                            <p className="mt-0.5 text-xs text-[var(--muted)]">
                                {isConversationClosed
                                    ? "Conversation closed"
                                    : "Property discussion"}
                            </p>
                        </div>
                    </div>

                    {isOwner &&
                        !isConversationClosed && (
                            <button
                                type="button"
                                onClick={closeNegotiation}
                                disabled={closing}
                                className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-4 py-2.5 text-xs font-semibold text-[var(--foreground)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {closing ? (
                                    <>
                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Closing...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="h-4 w-4"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <path
                                                d="M6 6l12 12M18 6 6 18"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        Close negotiation
                                    </>
                                )}
                            </button>
                        )}
                </div>

                {closeError && (
                    <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700 sm:px-6">
                        {closeError}
                    </div>
                )}

                {/* Message history */}
                <div className="flex-1 space-y-5 overflow-y-auto bg-[var(--background)]/50 px-4 py-6 sm:px-6">
                    {/* Original enquiry */}
                    {enquiry.message && (
                        <div className="mx-auto max-w-2xl">
                            <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
                                <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-3">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="h-4 w-4 text-[var(--brand)]"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    >
                                        <path
                                            d="M8 10h8M8 14h5m-8 7 3-3h10a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v15Z"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>

                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                                        Original enquiry
                                    </p>
                                </div>

                                <p className="px-4 py-4 text-sm leading-6 text-[var(--foreground)]">
                                    {enquiry.message}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Empty messages */}
                    {messages.length === 0 ? (
                        <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--panel-strong)] text-[var(--brand)]">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="h-7 w-7"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                >
                                    <path
                                        d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l-2 2v-9.5A7.5 7.5 0 0 1 10.5 4H12"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M16 3v6m-3-3h6"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>

                            <h3 className="mt-4 font-display text-lg font-semibold">
                                Start the conversation
                            </h3>

                            <p className="mt-1 max-w-xs text-sm leading-6 text-[var(--muted)]">
                                Send a message to discuss the property,
                                ask questions, or begin negotiating.
                            </p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isMine =
                                message.senderId === user?.id;

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`flex max-w-[88%] flex-col sm:max-w-[75%] ${isMine ? "items-end" : "items-start"}`}
                                    >
                                        {!isMine && (
                                            <p className="mb-1.5 ml-1 text-xs font-semibold text-[var(--muted)]">
                                                {message.sender.name}
                                            </p>
                                        )}

                                        <div
                                            className={`rounded-2xl px-4 py-3 shadow-sm ${isMine
                                                    ? "rounded-br-md bg-[var(--brand)] text-white"
                                                    : "rounded-bl-md border border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)]"
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap break-words text-sm leading-6">
                                                {message.content}
                                            </p>
                                        </div>

                                        <div
                                            className={`mt-1.5 flex items-center gap-1.5 text-[10px] text-[var(--muted)] ${isMine
                                                    ? "mr-1"
                                                    : "ml-1"
                                                }`}
                                        >
                                            <span>
                                                {formatMessageTime(
                                                    message.createdAt,
                                                )}
                                            </span>
                                            <span>·</span>
                                            <span>
                                                {formatMessageDate(
                                                    message.createdAt,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Closed conversation */}
                {isConversationClosed ? (
                    <div className="border-t border-[var(--line)] bg-[var(--panel)] px-5 py-6 sm:px-6">
                        <div className="mx-auto flex max-w-lg items-center justify-center gap-3 text-center">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--panel-strong)] text-[var(--muted)]">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="h-4 w-4"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        d="M6 6l12 12M18 6 6 18"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>

                            <div className="text-left">
                                <p className="text-sm font-semibold">
                                    This conversation is {enquiry.status.toLowerCase()}.
                                </p>

                                <p className="mt-0.5 text-xs text-[var(--muted)]">
                                    New messages can no longer be sent.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Message composer */
                    <div className="border-t border-[var(--line)] bg-[var(--panel)] p-4 sm:p-5">
                        {sendError && (
                            <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="mt-0.5 h-4 w-4 shrink-0"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <circle cx="12" cy="12" r="9" />
                                    <path
                                        d="M12 8v5m0 3h.01"
                                        strokeLinecap="round"
                                    />
                                </svg>

                                <span>{sendError}</span>
                            </div>
                        )}

                        <div className="rounded-2xl border border-[var(--line)] bg-[var(--background)] p-2 transition focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/10">
                            <textarea
                                value={newMessage}
                                onChange={(event) => {
                                    setNewMessage(event.target.value);

                                    if (sendError) {
                                        setSendError(null);
                                    }
                                }}
                                onKeyDown={handleMessageKeyDown}
                                maxLength={2000}
                                rows={3}
                                disabled={sending}
                                placeholder="Write your message..."
                                className="min-h-[76px] w-full resize-none border-0 bg-transparent px-3 py-2 text-sm leading-6 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] px-2 pt-2">
                                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="h-4 w-4"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    >
                                        <path
                                            d="M12 18V6m-4 4 4-4 4 4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>

                                    <span>
                                        Enter to send · Shift + Enter for a new line
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] tabular-nums text-[var(--muted)]">
                                        {newMessage.length}/2000
                                    </span>

                                    <button
                                        type="button"
                                        onClick={sendMessage}
                                        disabled={
                                            sending ||
                                            !newMessage.trim()
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {sending ? (
                                            <>
                                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                                Sending
                                            </>
                                        ) : (
                                            <>
                                                Send message

                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    className="h-4 w-4"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                >
                                                    <path
                                                        d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
