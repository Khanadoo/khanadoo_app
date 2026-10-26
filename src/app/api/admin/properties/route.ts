import { NextRequest } from "next/server";
import {
  Prisma,
  PropertyPurpose,
  PropertyStatus,
  PropertyType,
} from "@prisma/client";

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
    const statusParam = searchParams.get("status");
    const typeParam = searchParams.get("type");
    const purposeParam = searchParams.get("purpose");
    const activeParam = searchParams.get("isActive");

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

    if (
      statusParam &&
      !Object.values(PropertyStatus).includes(statusParam as PropertyStatus)
    ) {
      return Response.json(
        { error: "Invalid property status filter" },
        { status: 400 },
      );
    }

    if (
      typeParam &&
      !Object.values(PropertyType).includes(typeParam as PropertyType)
    ) {
      return Response.json(
        { error: "Invalid property type filter" },
        { status: 400 },
      );
    }

    if (
      purposeParam &&
      !Object.values(PropertyPurpose).includes(purposeParam as PropertyPurpose)
    ) {
      return Response.json(
        { error: "Invalid property purpose filter" },
        { status: 400 },
      );
    }

    if (
      activeParam !== null &&
      activeParam !== undefined &&
      activeParam !== "true" &&
      activeParam !== "false"
    ) {
      return Response.json(
        { error: "isActive must be true or false" },
        { status: 400 },
      );
    }

    const limit = Math.min(limitParam, 100);
    const skip = (pageParam - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                city: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                locality: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                owner: {
                  is: {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {}),
      ...(statusParam ? { status: statusParam as PropertyStatus } : {}),
      ...(typeParam ? { type: typeParam as PropertyType } : {}),
      ...(purposeParam ? { purpose: purposeParam as PropertyPurpose } : {}),
      ...(activeParam !== null ? { isActive: activeParam === "true" } : {}),
    };

    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),

      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          type: true,
          purpose: true,
          price: true,
          city: true,
          locality: true,
          status: true,
          isActive: true,
          featured: true,
          verified: true,
          imageUrls: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return Response.json({
      success: true,
      properties,
      pagination: {
        page: pageParam,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin properties listing error:", error);

    return Response.json(
      { error: "Failed to load properties" },
      { status: 500 },
    );
  }
}
