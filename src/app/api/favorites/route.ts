
import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { authorize } from "@/middleware/role.middleware";

export async function GET(req: NextRequest) {
    const auth = await authorize(["USER", "OWNER"])(req);

    if ("error" in auth) {
        return Response.json(
            { error: auth.error },
            { status: auth.status },
        );
    }

    try {
        const favorites = await prisma.favorite.findMany({
            where: {
                userId: auth.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                createdAt: true,
                property: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        type: true,
                        purpose: true,
                        status: true,
                        price: true,
                        city: true,
                        locality: true,
                        bedrooms: true,
                        bathrooms: true,
                        area: true,
                        imageUrls: true,
                        isActive: true,
                        featured: true,
                        verified: true,
                        createdAt: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return Response.json({
            success: true,
            favorites,
            total: favorites.length,
        });
    } catch (error) {
        console.error("Get favorites error:", error);

        return Response.json(
            { error: "Failed to load favorites" },
            { status: 500 },
        );
    }
}


export async function POST(req: NextRequest) {
    const auth = await authorize(["USER", "OWNER"])(req);

    if ("error" in auth) {
        return Response.json(
            { error: auth.error },
            { status: auth.status },
        );
    }

    try {
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
            !("propertyId" in body) ||
            typeof body.propertyId !== "string" ||
            !body.propertyId.trim()
        ) {
            return Response.json(
                { error: "A valid propertyId is required" },
                { status: 400 },
            );
        }

        const propertyId = body.propertyId.trim();

        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            select: {
                id: true,
                isActive: true,
                status: true,
            },
        });

        if (!property) {
            return Response.json(
                { error: "Property not found" },
                { status: 404 },
            );
        }

        if (!property.isActive || property.status !== "AVAILABLE") {
            return Response.json(
                {
                    error: "Only active, available properties can be favorited",
                },
                { status: 400 },
            );
        }

        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_propertyId: {
                    userId: auth.user.id,
                    propertyId,
                },
            },
            select: {
                id: true,
            },
        });

        if (existingFavorite) {
            return Response.json(
                {
                    error: "Property is already in your favorites",
                },
                { status: 409 },
            );
        }

        const favorite = await prisma.favorite.create({
            data: {
                userId: auth.user.id,
                propertyId,
            },
            select: {
                id: true,
                createdAt: true,
                propertyId: true,
            },
        });

        return Response.json(
            {
                success: true,
                message: "Property added to favorites",
                favorite,
            },
            { status: 201 },
        );
    } catch (error) {
        // A concurrent request may create the same favorite first.
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return Response.json(
                { error: "Property is already in your favorites" },
                { status: 409 },
            );
        }

        console.error("Add favorite error:", error);

        return Response.json(
            { error: "Failed to add property to favorites" },
            { status: 500 },
        );
    }
}
