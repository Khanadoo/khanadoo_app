import { prisma } from "@/lib/prisma";
import { authorize } from "@/middleware/role.middleware";

export async function POST(req: Request) {
  const auth = await authorize(["VENDOR", "ADMIN"])(req);

  if ("error" in auth) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status,
    });
  }

  const user = auth.user;

  const body = await req.json();

  const food = await prisma.foodItem.create({
    data: {
      name: body.name,
      description: body.description,
      price: body.price,
      imageUrl: body.imageUrl,
      vendorId: user.id,
    },
  });

  return Response.json(food);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    const foods = await prisma.foodItem.findMany({
      where: { isAvailable: true },
      take: limit,
      skip: skip,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.foodItem.count({ where: { isAvailable: true } });

    return Response.json({ data: foods, page, limit, total });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
