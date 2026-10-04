import { apiFetch } from "@/lib/api";

export interface Notification {
  id: string;
  userId: string;
  type:
    | "NEW_ENQUIRY"
    | "NEW_MESSAGE"
    | "ENQUIRY_STATUS_CHANGED"
    | "PROPERTY_STATUS_CHANGED";
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const notificationClient = {
  getAll(accessToken: string) {
    return apiFetch<NotificationResponse>("/api/notifications", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  markAsRead(id: string, accessToken: string) {
    return apiFetch<Notification>(`/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  markAllAsRead(accessToken: string) {
    return apiFetch<{
      success: boolean;
      updatedCount: number;
    }>("/api/notifications/read-all", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};
