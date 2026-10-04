import { prisma } from "@/lib/prisma";

import { CreateEnquiryInput, UpdateEnquiryInput } from "./enquiry.schema";

import { createNotification } from "@/services/notifications.service";

export const createEnquiry = async (
  userId: string,
  data: CreateEnquiryInput,
) => {
  const property = await prisma.property.findUnique({
    where: {
      id: data.propertyId,
    },

    include: {
      owner: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  if (!property.isActive) {
    throw new Error("Property is inactive");
  }

  if (property.status !== "AVAILABLE") {
    throw new Error("Property is no longer available");
  }

  const existingEnquiry = await prisma.enquiry.findFirst({
    where: {
      userId,
      propertyId: data.propertyId,
      status: {
        in: ["PENDING", "CONTACTED", "NEGOTIATING"],
      },
    },
  });

  if (existingEnquiry) {
    throw new Error("You already have an active enquiry for this property");
  }

  const enquiry = await prisma.enquiry.create({
    data: {
      userId,
      propertyId: data.propertyId,
      phone: data.phone,
      message: data.message,
    },
  });

  try {
    await createNotification({
      userId: property.owner.id,
      type: "NEW_ENQUIRY",
      title: "New enquiry",
      message: "Someone has submitted an enquiry for your property.",
      link: "/owner/enquiries",
    });
  } catch (error) {
    console.error("Failed to create enquiry notification:", error);
  }

  return enquiry;
};

export const getUserEnquiries = async (userId: string) => {
  return prisma.enquiry.findMany({
    where: {
      userId,
    },

    include: {
      property: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getPropertyEnquiries = async (propertyId: string) => {
  return prisma.enquiry.findMany({
    where: {
      propertyId,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getOwnerEnquiries = async (ownerId: string) => {
  return prisma.enquiry.findMany({
    where: {
      property: {
        ownerId,
      },
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },

      property: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateEnquiryStatus = async (
  enquiryId: string,
  data: UpdateEnquiryInput,
) => {
  const enquiry = await prisma.enquiry.findUnique({
    where: {
      id: enquiryId,
    },
  });

  if (!enquiry) {
    throw new Error("Enquiry not found");
  }

  /*
   * If the status is already the requested status,
   * there is nothing to update and no notification
   * should be created.
   */
  if (enquiry.status === data.status) {
    return enquiry;
  }

  const updated = await prisma.enquiry.update({
    where: {
      id: enquiryId,
    },

    data: {
      status: data.status,
    },
  });

  /*
   * Notify the user who submitted the enquiry.
   *
   * At the moment, only OWNER/ADMIN can change
   * enquiry status, so the enquiry user is the
   * other participant.
   */
  try {
    const statusLabels: Record<string, string> = {
      PENDING: "Pending",
      CONTACTED: "Contacted",
      NEGOTIATING: "Negotiating",
      CLOSED: "Closed",
      CANCELLED: "Cancelled",
    };

    const statusLabel = statusLabels[updated.status] || updated.status;

    await createNotification({
      userId: enquiry.userId,
      type: "ENQUIRY_STATUS_CHANGED",
      title: "Enquiry status updated",
      message: `Your enquiry status is now ${statusLabel}.`,
      link: `/enquiries`,
    });
  } catch (error) {
    console.error("Failed to create enquiry status notification:", error);
  }

  return updated;
};
