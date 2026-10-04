"use client";

import * as Ably from "ably";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    notificationClient,
    Notification,
} from "@/services/notification.client";
import { useAuth } from "@/context/AuthContext";
import { createNotificationAblyClient } from "@/lib/ably.client";

export default function NotificationDropdown() {
    const { user, accessToken } = useAuth();
    const router = useRouter();

    const [notifications, setNotifications] = useState<
        Notification[]
    >([]);

    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const loadNotifications = async () => {
        if (!accessToken) return;

        try {
            setLoading(true);

            const response =
                await notificationClient.getAll(accessToken);

            setNotifications(response.notifications);
            setUnreadCount(response.unreadCount);
        } catch (error) {
            console.error(
                "Failed to load notifications:",
                error,
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!accessToken) return;

        loadNotifications();
    }, [accessToken]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target as Node,
                )
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside,
            );
        };
    }, []);

    useEffect(() => {
        if (!accessToken || !user?.id) return;

        const ably = createNotificationAblyClient(
            accessToken,
        );

        const channel = ably.channels.get(
            `user:${user.id}`,
        );

        const handleNotification = (
            message: Ably.Message,
        ) => {
            const notification =
                message.data as Notification;

            setNotifications((prev) => {
                const alreadyExists = prev.some(
                    (item) => item.id === notification.id,
                );

                if (alreadyExists) {
                    return prev;
                }

                return [notification, ...prev];
            });

            if (!notification.isRead) {
                setUnreadCount((count) => count + 1);
            }
        };

        channel.subscribe(
            "notification.created",
            handleNotification,
        );

        return () => {
            channel.unsubscribe(
                "notification.created",
                handleNotification,
            );

            if (ably.connection.state === "connected") {
                ably.close();
            }
        };
    }, [accessToken, user?.id]);

    const handleNotificationClick = async (
        notification: Notification,
    ) => {
        if (!accessToken) return;

        try {
            if (!notification.isRead) {
                await notificationClient.markAsRead(
                    notification.id,
                    accessToken,
                );

                setNotifications((prev) =>
                    prev.map((item) =>
                        item.id === notification.id
                            ? { ...item, isRead: true }
                            : item,
                    ),
                );

                setUnreadCount((count) =>
                    Math.max(0, count - 1),
                );
            }
        } catch (error) {
            console.error(
                "Failed to mark notification as read:",
                error,
            );
        }

        setIsOpen(false);

        if (notification.link) {
            router.push(notification.link);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!accessToken || unreadCount === 0) return;

        try {
            await notificationClient.markAllAsRead(
                accessToken,
            );

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    isRead: true,
                })),
            );

            setUnreadCount(0);
        } catch (error) {
            console.error(
                "Failed to mark notifications as read:",
                error,
            );
        }
    };

    return (
        <div
            ref={dropdownRef}
            className="relative"
        >
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
                aria-label="Notifications"
            >
                <span className="text-xl">🔔</span>

                {unreadCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                        <h3 className="font-semibold text-gray-900">
                            Notifications
                        </h3>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="px-4 py-8 text-center text-sm text-gray-500">
                                Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() =>
                                        handleNotificationClick(
                                            notification,
                                        )
                                    }
                                    className={`w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 ${!notification.isRead
                                        ? "bg-blue-50"
                                        : "bg-white"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.isRead
                                                ? "bg-transparent"
                                                : "bg-blue-500"
                                                }`}
                                        />

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {notification.title}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                {notification.message}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                {new Date(
                                                    notification.createdAt,
                                                ).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}