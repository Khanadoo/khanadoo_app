import { NextRequest } from "next/server";
import * as Ably from "ably";

import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/getUserFromRequest";

export async function GET(req: NextRequest) {
  try {
    if (!process.env.ABLY_API_KEY) {
      return Response.json(
        {
          success: false,
          error: "Ably API key is not configured",
        },
        { status: 500 },
      );
    }

    /*
     * Authenticate the PropertyHub user
     */
    const user = await getUserFromRequest(req);

    if (!user) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const enquiryId = req.nextUrl.searchParams.get("enquiryId");

    const notifications = req.nextUrl.searchParams.get("notifications");

    /*
     * Notification realtime token
     */
    if (notifications === "true") {
      const channelName = `user:${user.id}`;

      const ably = new Ably.Rest(process.env.ABLY_API_KEY);

      const tokenDetails = await ably.auth.requestToken({
        clientId: user.id,
        capability: JSON.stringify({
          [channelName]: ["subscribe"],
        }),
      });

      return Response.json(tokenDetails);
    }

    /*
     * Enquiry realtime token
     */
    if (!enquiryId) {
      return Response.json(
        {
          success: false,
          error: "Enquiry ID or notification access is required",
        },
        { status: 400 },
      );
    }

    /*
     * Verify that the authenticated user
     * is actually a participant in this enquiry.
     */
    const enquiry = await prisma.enquiry.findUnique({
      where: {
        id: enquiryId,
      },
      include: {
        property: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!enquiry) {
      return Response.json(
        {
          success: false,
          error: "Enquiry not found",
        },
        { status: 404 },
      );
    }

    const isParticipant =
      enquiry.userId === user.id || enquiry.property.ownerId === user.id;

    if (!isParticipant) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 403 },
      );
    }

    /*
     * Each enquiry gets its own private Ably channel.
     */
    const channelName = `enquiry:${enquiryId}`;

    /*
     * Create a server-side Ably client.
     *
     * The API key NEVER reaches the browser.
     */
    const ably = new Ably.Rest(process.env.ABLY_API_KEY);

    /*
     * The browser only receives realtime events.
     *
     * It does not get publish permission because
     * messages are still created through our REST API.
     */
    const tokenDetails = await ably.auth.requestToken({
      clientId: user.id,
      capability: JSON.stringify({
        [channelName]: ["subscribe"],
      }),
    });

    return Response.json(tokenDetails);
  } catch (error: any) {
    console.error("Ably token error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to create Ably token",
      },
      { status: 500 },
    );
  }
}
