import { prisma } from "@/lib/prisma";

export const getOwnerDashboard = async (ownerId: string) => {
  const totalProperties = await prisma.property.count({
    where: {
      ownerId,
      isActive: true,
    },
  });

  const activeProperties = await prisma.property.count({
    where: {
      ownerId,
      isActive: true,
      status: "AVAILABLE",
    },
  });

  const totalEnquiries = await prisma.enquiry.count({
    where: {
      property: {
        ownerId,
      },
    },
  });

  const pendingEnquiries = await prisma.enquiry.count({
    where: {
      property: {
        ownerId,
      },
      status: "PENDING",
    },
  });

  const recentProperties = await prisma.property.findMany({
    where: {
      ownerId,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const recentEnquiries = await prisma.enquiry.findMany({
    where: {
      property: {
        ownerId,
      },
    },

    include: {
      property: {
        select: {
          id: true,
          title: true,
        },
      },

      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 5,
  });

  return {
    stats: {
      totalProperties,
      activeProperties,
      totalEnquiries,
      pendingEnquiries,
    },

    recentProperties,
    recentEnquiries,
  };
};
