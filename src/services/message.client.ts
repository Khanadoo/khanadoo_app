import { apiFetch } from "@/lib/api";

export interface MessageSender {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  enquiryId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  sender: MessageSender;
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
}

export interface CreateMessagePayload {
  content: string;
}

export interface CreateMessageResponse {
  success: boolean;
  message: Message;
}

export const messageClient = {
  getMessages(enquiryId: string, accessToken: string) {
    return apiFetch<MessagesResponse>(`/api/enquiry/${enquiryId}/messages`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  sendMessage(
    enquiryId: string,
    data: CreateMessagePayload,
    accessToken: string,
  ) {
    return apiFetch<CreateMessageResponse>(
      `/api/enquiry/${enquiryId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      },
    );
  },
};
