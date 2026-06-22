import { getMyProperties } from "@/modules/property/property.controller";

export async function GET(req: Request) {
  try {
    return await getMyProperties(req);
  } catch (err: any) {
    return Response.json(
      {
        error: err.message || "Failed to fetch properties",
      },
      {
        status: 500,
      },
    );
  }
}
