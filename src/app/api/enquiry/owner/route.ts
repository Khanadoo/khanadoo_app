import { NextRequest } from "next/server";

import { getOwner } from "@/modules/enquiry/enquiry.controller";

export async function GET(req: NextRequest) {
  try {
    return await getOwner(req);
  } catch (error) {
    console.error("Get owner enquiries error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to fetch owner enquiries",
      },
      {
        status: 500,
      },
    );
  }
}
    