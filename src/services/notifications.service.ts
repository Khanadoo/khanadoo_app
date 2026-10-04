import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAblyServer } from "@/lib/ably";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(data: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
    },
  });

  try {
    const ably = getAblyServer();

    const channel = ably.channels.get(`user:${data.userId}`);

    await channel.publish("notification.created", notification);
  } catch (error) {
    console.error("Failed to publish notification through Ably:", error);
  }

  return notification;
}
