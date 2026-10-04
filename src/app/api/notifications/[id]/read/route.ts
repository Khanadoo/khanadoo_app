import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUserFromRequest";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const notification = await prisma.notification.findUnique({
      where: {
        id,
      },
    });

    if (!notification) {
      return Response.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    if (notification.userId !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });

    return Response.json(updatedNotification);
  } catch (error) {
    console.error("Error marking notification as read:", error);

    return Response.json(
      { error: "Failed to mark notification as read" },
      { status: 500 },
    );
  }
}
