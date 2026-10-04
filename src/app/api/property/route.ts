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

    if (
      !title ||
      !type ||
      !purpose ||
      !price ||
      !city ||
      !locality ||
      !address
    ) {
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

    // Pagination
    const pageParam = Number(searchParams.get("page"));
    const limitParam = Number(searchParams.get("limit"));

    const page =
      Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
        ? Math.floor(limitParam)
        : 10;

    const skip = (page - 1) * limit;

    // Filters
    const city = searchParams.get("city")?.trim();
    const locality = searchParams.get("locality")?.trim();
    const type = searchParams.get("type")?.trim();
    const purpose = searchParams.get("purpose")?.trim();

    const minPriceParam = searchParams.get("minPrice");

    const maxPriceParam = searchParams.get("maxPrice");

    const minPrice = minPriceParam !== null ? Number(minPriceParam) : null;

    const maxPrice = maxPriceParam !== null ? Number(maxPriceParam) : null;

    // Sorting
    const sort = searchParams.get("sort") || "newest";

    const where: any = {
      status: "AVAILABLE",
      isActive: true,
    };

    // City search
    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    // Locality search
    if (locality) {
      where.locality = {
        contains: locality,
        mode: "insensitive",
      };
    }

    // Property type
    if (type && ["ROOM", "PG", "HOUSE", "APARTMENT"].includes(type)) {
      where.type = type;
    }

    // Purpose
    if (purpose && ["RENT", "SALE"].includes(purpose)) {
      where.purpose = purpose;
    }

    // Price range
    if (minPrice !== null && Number.isFinite(minPrice) && minPrice >= 0) {
      where.price = {
        ...(where.price || {}),
        gte: minPrice,
      };
    }

    if (maxPrice !== null && Number.isFinite(maxPrice) && maxPrice >= 0) {
      where.price = {
        ...(where.price || {}),
        lte: maxPrice,
      };
    }

    // Sorting
    let orderBy: any = {
      createdAt: "desc",
    };

    if (sort === "price_low") {
      orderBy = {
        price: "asc",
      };
    }

    if (sort === "price_high") {
      orderBy = {
        price: "desc",
      };
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),

      prisma.property.count({
        where,
      }),
    ]);

    return Response.json({
      data: properties,
      page,
      limit,
      total,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to fetch properties",
      }),
      { status: 500 },
    );
  }
}
