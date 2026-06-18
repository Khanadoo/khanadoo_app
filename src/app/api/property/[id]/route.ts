import { prisma } from "@/lib/prisma";
import { authorize } from "@/middleware/role.middleware";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!property) {
      return new Response(JSON.stringify({ error: "Property not found" }), {
        status: 404,
      });
    }

    return Response.json(property);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch property" }), {
      status: 500,
    });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize(["OWNER", "ADMIN"])(req);

  if ("error" in auth) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status,
    });
  }

  try {
    const { id } = await params;

    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return new Response(JSON.stringify({ error: "Property not found" }), {
        status: 404,
      });
    }

    if (
      auth.user.role !== "ADMIN" &&
      existingProperty.ownerId !== auth.user.id
    ) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
      });
    }

    const body = await req.json();

    const updateData: any = {
      title: body.title,
      description: body.description,
      type: body.type,
      purpose: body.purpose,
      status: body.status,
      price: body.price,
      city: body.city,
      locality: body.locality,
      address: body.address,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      area: body.area,
      imageUrls: body.imageUrls,
    };

    if (auth.user.role === "ADMIN") {
      updateData.featured = body.featured;
      updateData.verified = body.verified;
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...updateData,
      },
    });

    return Response.json(updatedProperty);
  } catch (error) {
    console.error("Error updating property:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update property" }),
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize(["OWNER", "ADMIN"])(req);

  if ("error" in auth) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status,
    });
  }

  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return new Response(JSON.stringify({ error: "Property not found" }), {
        status: 404,
      });
    }

    if (
      auth.user.role !== "ADMIN" &&
      property.ownerId !== auth.user.id
    ) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
      });
    }

    await prisma.property.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return new Response("Deleted successfully", { status: 204 });
  } catch (error) {
    console.error("Error deleting property:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete property" }),
      { status: 500 },
    );
  }
}
