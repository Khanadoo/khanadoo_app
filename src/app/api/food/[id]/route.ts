import { prisma } from "@/lib/prisma";
import { authorize } from "@/middleware/role.middleware";

export async function GET(req: Request, { params }: { params: { id: string } }){
    try {
        const food = await prisma.foodItem.findUnique({
            where: { id: params.id },
            include: {
                vendor: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!food || !food.isAvailable) {
            return new Response(JSON.stringify({ error: "Food item not found" }), { status: 404 });
        }

        return Response.json(food);
    } catch (error) {
        console.error("Error fetching food item:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch food item" }), { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const auth = await authorize(["VENDOR", "ADMIN"])(req);

    if ("error" in auth) {
        return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });
    }

    const user = auth.user;

    const food = await prisma.foodItem.findUnique({
        where: { id: params.id },
    });

    if (!food) {
        return new Response(JSON.stringify({ error: "Food item not found" }), { status: 404 });
    }

    const body = await req.json();

    if(!body.name || !body.description || !body.price || !body.imageUrl) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const updated = await prisma.foodItem.update({
        where: { id: params.id },
        data: {
            name: body.name,
            description: body.description,
            price: body.price,
            imageUrl: body.imageUrl,
            isAvailable: body.isAvailable,
        }
    });

    return Response.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const auth = await authorize(["VENDOR", "ADMIN"])(req);

    if ("error" in auth) {
        return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });
    }

    const food = await prisma.foodItem.findUnique({
        where: { id: params.id },
    });

    if (!food) {
        return new Response(JSON.stringify({ error: "Food item not found" }), { status: 404 });
    }

    await prisma.foodItem.update({
        where: { id: params.id },
        data: { isAvailable: false },
    });

    return new Response("Food removed", { status: 204 });
}