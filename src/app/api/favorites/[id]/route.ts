import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/middleware/role.middleware";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(req: NextRequest, context: RouteContext) {
  const auth = await authorize(["USER", "OWNER"])(req);

  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      return Response.json(
        { error: "A valid favorite ID is required" },
        { status: 400 },
      );
    }

    // Find the favorite belonging to the authenticated user.
    const favorite = await prisma.favorite.findFirst({
      where: {
        id,
        userId: auth.user.id,
      },
      select: { id: true },
    });

    if (!favorite) {
      return Response.json({ error: "Favorite not found" }, { status: 404 });
    }

    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return Response.json({
      success: true,
      message: "Property removed from favorites",
    });
  } catch (error) {
    console.error("Remove favorite error:", error);

    return Response.json(
      { error: "Failed to remove favorite" },
      { status: 500 },
    );
  }
}
