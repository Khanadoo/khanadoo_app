
import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { authorize } from "@/middleware/role.middleware";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(
    req: NextRequest,
    context: RouteContext,
) {
    const auth = await authorize(["ADMIN"])(req);

    if ("error" in auth) {
        return Response.json(
            { error: auth.error },
            { status: auth.status },
        );
    }

    try {
        const { id } = await context.params;

        if (!id) {
            return Response.json(
                { error: "Property ID is required" },
                { status: 400 },
            );
        }

        let body: unknown;

        try {
            body = await req.json();
        } catch {
            return Response.json(
                { error: "Invalid JSON body" },
                { status: 400 },
            );
        }

        if (
            typeof body !== "object" ||
            body === null ||
            !("isActive" in body) ||
            typeof body.isActive !== "boolean"
        ) {
            return Response.json(
                { error: "isActive must be a boolean" },
                { status: 400 },
            );
        }

        const property = await prisma.property.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!property) {
            return Response.json(
                { error: "Property not found" },
                { status: 404 },
            );
        }

        const updatedProperty = await prisma.property.update({
            where: { id },
            data: { isActive: body.isActive },
            select: {
                id: true,
                title: true,
                isActive: true,
                status: true,
                updatedAt: true,
            },
        });

        return Response.json({
            success: true,
            message: body.isActive
                ? "Property listing reactivated successfully"
                : "Property listing deactivated successfully",
            property: updatedProperty,
        });
    } catch (error) {
        console.error("Admin property moderation error:", error);

        return Response.json(
            { error: "Failed to update property moderation status" },
            { status: 500 },
        );
    }
}
