import { prisma } from "@/lib/prisma";

import { CreateEnquiryInput, UpdateEnquiryInput } from "./enquiry.schema";

export const createEnquiry = async (
  userId: string,
  data: CreateEnquiryInput,
) => {
  const property = await prisma.property.findUnique({
    where: {
      id: data.propertyId,
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

  return prisma.enquiry.create({
    data: {
      userId,
      propertyId: data.propertyId,
      phone: data.phone,
      message: data.message,
    },
  });
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

  return prisma.enquiry.update({
    where: {
      id: enquiryId,
    },

    data: {
      status: data.status,
    },
  });
};
