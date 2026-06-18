import { rateLimit } from "@/lib/rateLimiter";

import { authorize } from "@/middleware/role.middleware";

import { createEnquirySchema, updateEnquirySchema } from "./enquiry.schema";

import {
  createEnquiry,
  getUserEnquiries,
  getPropertyEnquiries,
  updateEnquiryStatus,
} from "./enquiry.service";

import { prisma } from "@/lib/prisma";

export const create = async (req: Request) => {
  const auth = await authorize(["USER", "OWNER", "ADMIN"])(req);

  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  await rateLimit(`enquiry:${ip}`, {
    limit: 10,
    window: 60,
  });

  const body = await req.json();

  const parsed = createEnquirySchema.parse(body);

  const enquiry = await createEnquiry(auth.user.id, parsed);

  return Response.json(
    {
      success: true,
      enquiry,
    },
    {
      status: 201,
    },
  );
};

export const getMine = async (req: Request) => {
  const auth = await authorize(["USER", "OWNER", "ADMIN"])(req);

  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const enquiries = await getUserEnquiries(auth.user.id);

  return Response.json({
    success: true,
    enquiries,
  });
};

export const getProperty = async (req: Request, propertyId: string) => {
  const auth = await authorize(["OWNER", "ADMIN"])(req);

  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
  });

  if (!property) {
    return Response.json({ error: "Property not found" }, { status: 404 });
  }

  if (auth.user.role !== "ADMIN" && property.ownerId !== auth.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const enquiries = await getPropertyEnquiries(propertyId);

  return Response.json({
    success: true,
    enquiries,
  });
};

export const updateStatus = async (req: Request, enquiryId: string) => {
  const auth = await authorize(["OWNER", "ADMIN"])(req);

  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const enquiry = await prisma.enquiry.findUnique({
    where: {
      id: enquiryId,
    },

    include: {
      property: true,
    },
  });

  if (!enquiry) {
    return Response.json({ error: "Enquiry not found" }, { status: 404 });
  }

  if (auth.user.role !== "ADMIN" && enquiry.property.ownerId !== auth.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();

  const parsed = updateEnquirySchema.parse(body);

  const updated = await updateEnquiryStatus(enquiryId, parsed);

  return Response.json({
    success: true,
    enquiry: updated,
  });
};

