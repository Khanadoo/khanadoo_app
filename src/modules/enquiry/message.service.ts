import { prisma } from "@/lib/prisma";
import { CreateMessageInput } from "./message.schema";
import { createNotification } from "@/services/notifications.service";

export const getMessages = async (enquiryId: string, userId: string) => {
  const enquiry = await prisma.enquiry.findUnique({
    where: {
      id: enquiryId,
    },
    include: {
      property: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!enquiry) {
    throw new Error("Enquiry not found");
  }

  const isParticipant =
    enquiry.userId === userId || enquiry.property.ownerId === userId;

  if (!isParticipant) {
    throw new Error("Unauthorized");
  }

  return prisma.message.findMany({
    where: {
      enquiryId,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const createMessage = async (
  enquiryId: string,
  senderId: string,
  data: CreateMessageInput,
) => {
  const enquiry = await prisma.enquiry.findUnique({
    where: {
      id: enquiryId,
    },

    include: {
      property: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!enquiry) {
    throw new Error("Enquiry not found");
  }

  const isParticipant =
    enquiry.userId === senderId || enquiry.property.ownerId === senderId;

  if (!isParticipant) {
    throw new Error("Unauthorized");
  }

  if (enquiry.status === "CLOSED" || enquiry.status === "CANCELLED") {
    throw new Error("This enquiry is no longer available for negotiation");
  }

  const message = await prisma.message.create({
    data: {
      enquiryId,
      senderId,
      content: data.content,
    },

    include: {
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (enquiry.status !== "NEGOTIATING") {
    await prisma.enquiry.update({
      where: {
        id: enquiryId,
      },

      data: {
        status: "NEGOTIATING",
      },
    });
  }

  /*
   * Notify the other participant.
   *
   * USER sends  → OWNER receives
   * OWNER sends → USER receives
   */
  const recipientId =
    senderId === enquiry.userId ? enquiry.property.ownerId : enquiry.userId;

  try {
    await createNotification({
      userId: recipientId,
      type: "NEW_MESSAGE",
      title: "New message",
      message: `${message.sender.name} sent you a message.`,
      link: `/enquiries/${enquiryId}`,
    });
  } catch (error) {
    console.error("Failed to create message notification:", error);
  }

  return message;
};
