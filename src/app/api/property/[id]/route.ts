import { prisma } from "@/lib/prisma";
import { authorize } from "@/middleware/role.middleware";
import { createNotification } from "@/services/notifications.service";

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

    /*
     * Check whether the property status is actually changing.
     *
     * This is important because the same PUT endpoint is also
     * used for normal property editing.
     */
    const statusChanged =
      body.status !== undefined && body.status !== existingProperty.status;

    /*
     * Find users who currently have an active enquiry
     * for this property.
     *
     * These are the users who should know that the property's
     * availability has changed.
     */
    let interestedUserIds: string[] = [];

    if (statusChanged) {
      const activeEnquiries = await prisma.enquiry.findMany({
        where: {
          propertyId: id,
          status: {
            in: ["PENDING", "CONTACTED", "NEGOTIATING"],
          },
        },

        select: {
          userId: true,
        },
      });

      /*
       * Remove duplicate user IDs in case a user somehow has
       * multiple active enquiries for the same property.
       */
      interestedUserIds = [
        ...new Set(activeEnquiries.map((enquiry) => enquiry.userId)),
      ];
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...updateData,
      },
    });

    /*
     * Notify interested users only when the property status
     * actually changed.
     */
    if (statusChanged && interestedUserIds.length > 0) {
      const statusLabels: Record<string, string> = {
        AVAILABLE: "available",
        RENTED: "rented",
        SOLD: "sold",
      };

      const statusLabel =
        statusLabels[updatedProperty.status] ||
        updatedProperty.status.toLowerCase();

      await Promise.all(
        interestedUserIds.map(async (userId) => {
          try {
            await createNotification({
              userId,
              type: "PROPERTY_STATUS_CHANGED",
              title: "Property status updated",
              message: `"${existingProperty.title}" has been marked as ${statusLabel}.`,
              link: `/property/${updatedProperty.id}`,
            });
          } catch (error) {
            console.error(
              `Failed to notify user ${userId} about property status change:`,
              error,
            );
          }
        }),
      );
    }

    return Response.json(updatedProperty);
  } catch (error) {
    console.error("Error updating property:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to update property",
      }),
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

    if (auth.user.role !== "ADMIN" && property.ownerId !== auth.user.id) {
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

    return Response.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete property" }),
      { status: 500 },
    );
  }
}
