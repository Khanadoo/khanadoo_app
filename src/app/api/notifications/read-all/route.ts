import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUserFromRequest";

export async function PATCH(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return Response.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);

    return Response.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 },
    );
  }
}
