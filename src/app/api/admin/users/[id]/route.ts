import { NextRequest } from "next/server";
import { UserStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { authorize } from "@/middleware/role.middleware";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  const auth = await authorize(["ADMIN"])(req);

  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (typeof body !== "object" || body === null || !("status" in body)) {
      return Response.json({ error: "Status is required" }, { status: 400 });
    }

    const requestedStatus = body.status;

    if (
      typeof requestedStatus !== "string" ||
      !Object.values(UserStatus).includes(requestedStatus as UserStatus)
    ) {
      return Response.json(
        {
          error: "Invalid status. Use ACTIVE, SUSPENDED, or BANNED.",
        },
        { status: 400 },
      );
    }

    // Prevent an admin from locking their own account.
    if (id === auth.user.id) {
      return Response.json(
        {
          error: "You cannot change your own account status.",
        },
        { status: 403 },
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Account status changes for admins are handled separately
    // to reduce the risk of locking out administrative access.
    if (targetUser.role === "ADMIN") {
      return Response.json(
        {
          error:
            "Admin account status cannot be changed through this endpoint.",
        },
        { status: 403 },
      );
    }

    const newStatus = requestedStatus as UserStatus;

    if (targetUser.status === newStatus) {
      return Response.json({
        success: true,
        message: `User is already ${newStatus}.`,
        user: targetUser,
      });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { status: newStatus },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          updatedAt: true,
        },
      });

      // Revoke existing refresh-token sessions when suspending
      // or banning the account.
      if (newStatus === "SUSPENDED" || newStatus === "BANNED") {
        await tx.refreshToken.deleteMany({
          where: { userId: id },
        });
      }

      return user;
    });

    return Response.json({
      success: true,
      message: `User status updated to ${newStatus}.`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Admin user status update error:", error);

    return Response.json(
      { error: "Failed to update user status" },
      { status: 500 },
    );
  }
}
