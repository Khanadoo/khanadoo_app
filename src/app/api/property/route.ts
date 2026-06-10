import { prisma } from "@/lib/prisma";
import { authorize } from "@/middleware/role.middleware";

export async function POST(req: Request) {
  const auth = await authorize(["OWNER", "ADMIN"])(req);

  if ("error" in auth) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status,
    });
  }

  const user = auth.user;

  try {
    const body = await req.json();

    const {
      title,
      description,
      type,
      purpose,
      price,
      city,
      locality,
      address,
      bedrooms,
      bathrooms,
      area,
      imageUrls,
      featured,
      verified,
    } = body;

    if(!title || !type || !purpose || !price || !city || !locality || !address) {
      return new Response("Missing required fields", { status: 400 });
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        type,
        purpose,
        price,
        city,
        locality,
        address,
        bedrooms,
        bathrooms,
        area,
        imageUrls: imageUrls || [],
        ownerId: user.id,
        featured,
        verified,
      },
    });
    return Response.json(property);
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    const properties = await prisma.property.findMany({
      where: { 
        status: "AVAILABLE",
      },
      include: {
        owner: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.property.count({ where: { status: "AVAILABLE" } });

    return Response.json({ data: properties, page, limit, total });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
