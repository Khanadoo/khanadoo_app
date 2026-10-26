import { prisma } from "@/lib/prisma";
import { authorize } from "@/middleware/role.middleware";

export async function GET(req: Request) {
  const auth = await authorize(["ADMIN"])(req);

  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const [
      totalUsers,
      totalOwners,
      activeUsers,
      suspendedUsers,
      totalProperties,
      availableProperties,
      inactiveProperties,
      totalEnquiries,
      pendingEnquiries,
      totalMessages,
      recentUsers,
      recentProperties,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: { role: "OWNER" },
      }),

      prisma.user.count({
        where: { status: "ACTIVE" },
      }),

      prisma.user.count({
        where: {
          status: { in: ["SUSPENDED", "BANNED"] },
        },
      }),

      prisma.property.count(),

      prisma.property.count({
        where: {
          status: "AVAILABLE",
          isActive: true,
        },
      }),

      prisma.property.count({
        where: { isActive: false },
      }),

      prisma.enquiry.count(),

      prisma.enquiry.count({
        where: { status: "PENDING" },
      }),

      prisma.message.count(),

      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),

      prisma.property.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          city: true,
          locality: true,
          status: true,
          isActive: true,
          createdAt: true,
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    return Response.json({
      success: true,
      overview: {
        totalUsers,
        totalOwners,
        activeUsers,
        suspendedUsers,
        totalProperties,
        availableProperties,
        inactiveProperties,
        totalEnquiries,
        pendingEnquiries,
        totalMessages,
      },
      recentUsers,
      recentProperties,
    });
  } catch (error) {
    console.error("Admin overview error:", error);

    return Response.json(
      { error: "Failed to load admin overview" },
      { status: 500 },
    );
  }
}
