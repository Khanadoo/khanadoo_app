import { NextRequest } from "next/server";
import { Role, UserStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { authorize } from "@/middleware/role.middleware";

export async function GET(req: NextRequest) {
  const auth = await authorize(["ADMIN"])(req);

  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const searchParams = req.nextUrl.searchParams;

    const search = searchParams.get("search")?.trim() ?? "";
    const roleParam = searchParams.get("role");
    const statusParam = searchParams.get("status");

    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);

    if (
      !Number.isInteger(pageParam) ||
      pageParam < 1 ||
      !Number.isInteger(limitParam) ||
      limitParam < 1
    ) {
      return Response.json(
        { error: "Page and limit must be positive integers" },
        { status: 400 },
      );
    }

    if (roleParam && !Object.values(Role).includes(roleParam as Role)) {
      return Response.json({ error: "Invalid role filter" }, { status: 400 });
    }

    if (
      statusParam &&
      !Object.values(UserStatus).includes(statusParam as UserStatus)
    ) {
      return Response.json({ error: "Invalid status filter" }, { status: 400 });
    }

    const limit = Math.min(limitParam, 100);
    const skip = (pageParam - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
      ...(roleParam ? { role: roleParam as Role } : {}),
      ...(statusParam ? { status: statusParam as UserStatus } : {}),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return Response.json({
      success: true,
      users,
      pagination: {
        page: pageParam,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin users listing error:", error);

    return Response.json({ error: "Failed to load users" }, { status: 500 });
  }
}
