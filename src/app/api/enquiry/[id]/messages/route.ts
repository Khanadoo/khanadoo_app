import { NextRequest } from "next/server";
import { get, create } from "@/modules/enquiry/message.controller";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    return await get(req, id);
  } catch (error: any) {
    console.error("Get messages error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to fetch messages",
      },
      { status: 400 },
    );
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    return await create(req, id);
  } catch (error: any) {
    console.error("Create message error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to send message",
      },
      { status: 400 },
    );
  }
}
