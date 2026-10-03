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

export default function ConversationPage() {
    const params = useParams();
    const router = useRouter();

    const { user, accessToken, loading: authLoading } =
        useAuth();

    const enquiryId = params.id as string;

    const [enquiry, setEnquiry] = useState<
        EnquiryWithProperty | EnquiryWithUserAndProperty | null
    >(null);

    const [messages, setMessages] = useState<Message[]>([]);

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [closing, setClosing] = useState(false);

    const [error, setError] = useState<string | null>(
        null,
    );

    const [closeError, setCloseError] = useState<string | null>(null)

    const [sendError, setSendError] = useState<
        string | null
    >(null);

    const [newMessage, setNewMessage] = useState("");

    const messagesEndRef = useRef<HTMLDivElement | null>(
        null,
    );

    const isConversationClosed =
        enquiry?.status === "CLOSED" ||
        enquiry?.status === "CANCELLED";

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
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
                    const response =
                        await enquiryClient.getOwner(
                            accessToken,
                        );

                    currentEnquiry =
                        response.enquiries.find(
                            (item) =>
                                item.id === enquiryId,
                        );
                } else {
                    const response =
                        await enquiryClient.getMine(
                            accessToken,
                        );

                    currentEnquiry =
                        response.enquiries.find(
                            (item) =>
                                item.id === enquiryId,
                        );
                }

                if (!currentEnquiry) {
                    throw new Error(
                        "Enquiry not found",
                    );
                }

                setEnquiry(currentEnquiry);

                const messageResponse =
                    await messageClient.getMessages(
                        enquiryId,
                        accessToken,
                    );

                setMessages(
                    messageResponse.messages,
                );
            } catch (error: any) {
                console.error(
                    "Load conversation error:",
                    error,
                );

                setError(
                    error.message ||
                    "Failed to load conversation",
                );
            } finally {
                setLoading(false);
            }
        };

        loadConversation();
    }, [
        authLoading,
        accessToken,
        user,
        enquiryId,
    ]);

    useEffect(() => {
        if (!loading) {
            scrollToBottom();
        }
    }, [loading, messages.length]);

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

            const response =
                await messageClient.sendMessage(
                    enquiryId,
                    {
                        content,
                    },
                    accessToken,
                );

            setMessages((currentMessages) => [
                ...currentMessages,
                response.message,
            ]);

            setNewMessage("");

            /*
             * The backend automatically changes the
             * enquiry status to NEGOTIATING when the
             * first message is sent.
             */
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
            console.error(
                "Send message error:",
                error,
            );

            setSendError(
                error.message ||
                "Failed to send message",
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
            console.error(
                "Close negotiation error:",
                error,
            );

            setCloseError(
                error.message ||
                "Failed to close negotiation",
            );
        } finally {
            setClosing(false);
        }
    };

    const handleMessageKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            sendMessage();
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm text-[var(--muted)]">
                    Loading conversation...
                </p>
            </div>
        );
    }

    if (error || !enquiry) {
        return (
            <div className="surface rounded-[2rem] p-8">
                <h1 className="font-display text-2xl font-semibold">
                    Conversation unavailable
                </h1>

                <p className="mt-2 text-sm text-[var(--muted)]">
                    {error ||
                        "Enquiry not found."}
                </p>

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mt-6 rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                >
                    ← Back to enquiries
                </button>

                <h1 className="mt-4 font-display text-3xl font-semibold">
                    {enquiry.property.title}
                </h1>

                <p className="mt-1 text-sm text-[var(--muted)]">
                    {enquiry.property.locality},{" "}
                    {enquiry.property.city}
                </p>
            </div>

            {/* Property Summary */}
            <div className="surface rounded-[2rem] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-[var(--muted)]">
                            Property
                        </p>

                        <p className="mt-1 text-lg font-semibold">
                            {enquiry.property.title}
                        </p>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                            ₹
                            {enquiry.property.price.toLocaleString(
                                "en-IN",
                            )}
                            {enquiry.property.purpose ===
                                "RENT"
                                ? " / month"
                                : ""}
                        </p>
                    </div>

                    <span className="rounded-full bg-[var(--panel-strong)] px-4 py-2 text-sm font-medium">
                        {enquiry.status}
                    </span>
                </div>
            </div>

            {/* Conversation */}
            <div className="surface flex min-h-[600px] flex-col overflow-hidden rounded-[2rem]">
                {/* Conversation Header */}
                <div className="border-b border-[var(--border)] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-[var(--muted)]">
                                Negotiation
                            </p>

                            <p className="mt-1 font-semibold">
                                {user?.role === "OWNER"
                                    ? "Interested User"
                                    : "Property Owner"}
                            </p>
                        </div>

                        {user?.role === "OWNER" &&
                            enquiry.status !== "CLOSED" &&
                            enquiry.status !== "CANCELLED" && (
                                <button
                                    type="button"
                                    onClick={closeNegotiation}
                                    disabled={closing}
                                    className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--panel-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {closing
                                        ? "Closing..."
                                        : "Close negotiation"}
                                </button>
                            )}
                    </div>

                    {closeError && (
                        <p className="mt-3 text-sm text-red-600">
                            {closeError}
                        </p>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                    {/* Original Enquiry */}
                    {enquiry.message && (
                        <div className="rounded-2xl bg-[var(--panel-strong)] p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                                Original enquiry
                            </p>

                            <p className="mt-2 text-sm">
                                {enquiry.message}
                            </p>
                        </div>
                    )}

                    {messages.length === 0 ? (
                        <div className="flex min-h-[250px] items-center justify-center">
                            <p className="text-sm text-[var(--muted)]">
                                No messages yet. Start
                                the negotiation.
                            </p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isMine =
                                message.senderId ===
                                user?.id;

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isMine
                                        ? "justify-end"
                                        : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMine
                                            ? "bg-[var(--brand)] text-white"
                                            : "bg-[var(--panel-strong)]"
                                            }`}
                                    >
                                        {!isMine && (
                                            <p className="mb-1 text-xs font-medium">
                                                {
                                                    message
                                                        .sender
                                                        .name
                                                }
                                            </p>
                                        )}

                                        <p className="whitespace-pre-wrap text-sm">
                                            {
                                                message.content
                                            }
                                        </p>

                                        <p
                                            className={`mt-1 text-[11px] ${isMine
                                                ? "text-white/70"
                                                : "text-[var(--muted)]"
                                                }`}
                                        >
                                            {new Date(
                                                message.createdAt,
                                            ).toLocaleTimeString(
                                                "en-IN",
                                                {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                },
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Closed State */}
                {isConversationClosed ? (
                    <div className="border-t border-[var(--border)] bg-[var(--panel-strong)] px-6 py-5">
                        <p className="text-center text-sm text-[var(--muted)]">
                            This enquiry is{" "}
                            {enquiry.status.toLowerCase()}.
                            New messages cannot be sent.
                        </p>
                    </div>
                ) : (
                    /* Composer */
                    <div className="border-t border-[var(--border)] p-5">
                        {sendError && (
                            <div className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                                {sendError}
                            </div>
                        )}

                        <div className="flex items-end gap-3">
                            <textarea
                                value={newMessage}
                                onChange={(event) => {
                                    setNewMessage(
                                        event.target.value,
                                    );

                                    if (sendError) {
                                        setSendError(null);
                                    }
                                }}
                                onKeyDown={
                                    handleMessageKeyDown
                                }
                                maxLength={2000}
                                rows={3}
                                disabled={sending}
                                placeholder="Write a message..."
                                className="min-h-[80px] flex-1 resize-none rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            <button
                                type="button"
                                onClick={sendMessage}
                                disabled={
                                    sending ||
                                    !newMessage.trim()
                                }
                                className="rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {sending
                                    ? "Sending..."
                                    : "Send"}
                            </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted)]">
                            <span>
                                Enter to send · Shift +
                                Enter for a new line
                            </span>

                            <span>
                                {newMessage.length}/2000
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
