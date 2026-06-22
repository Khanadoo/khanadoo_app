import { prisma } from "@/lib/prisma";

export const getOwnerProperties = async (ownerId: string) => {
  return prisma.property.findMany({
    where: {
      ownerId,
      isActive: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};
